/**
 * Módulo de Controle de Dados e Conexão com APIs Externas
 * 
 * Este arquivo contém as funções responsáveis por interagir com as APIs externas
 * (BOATS_API e ESTALEIRO_API), encapsulando a lógica de requisição e tratamento
 * de erros padrão.
 */

// Variáveis Globais de API
const BOATS_API = 'api/barcos.php';
const ESTALEIRO_API = 'api/estaleiro.php';

// Variáveis Globais de Estado (Manter aqui para acesso pelas funções de API)
let boats = [];
let completedBoats = JSON.parse(localStorage.getItem('completedBoats')) || [];
let preBoats = JSON.parse(localStorage.getItem('preBoats')) || [];
let boatPositions = JSON.parse(localStorage.getItem('boatPositions')) || {};

// ============================================================================
// FUNÇÕES DE UTILIDADE E CONVERSÃO (Manter aqui, pois são usadas pelas APIs)
// ============================================================================

/**
 * Converte uma chave local (ex: 'laminacao') para o nome legível correspondente.
 * @param {string} key - A chave local.
 * @returns {string} O nome legível.
 * 
 * Exemplo de Uso:
 * const nome = localKeyToNome('laminacao'); // Retorna 'Laminação'
 */
function localKeyToNome(key) {
  switch (key) {
    case 'laminacao': return 'Laminação';
    case 'montagem': return 'Montagem';
    case 'concluidos': return 'Concluídos';
    case 'preprojetos': return 'Pré-Projetos';
    case 'lixeira': return 'Lixeira';
    default: return key;
  }
}

/**
 * Converte um nome legível (ex: 'Laminação') para a chave local correspondente.
 * @param {string} nome - O nome legível.
 * @returns {string} A chave local.
 * 
 * Exemplo de Uso:
 * const key = nomeToLocalKey('Montagem'); // Retorna 'montagem'
 */
function nomeToLocalKey(nome) {
  const n = (nome || '').toLowerCase();
  if (n.includes('lamina')) return 'laminacao';
  if (n.includes('monta')) return 'montagem';
  if (n.includes('concl')) return 'concluidos';
  if (n.includes('pré') || n.includes('pre')) return 'preprojetos';
  if (n.includes('lixeira')) return 'lixeira';
  return nome;
}

// ============================================================================
// FUNÇÕES DE REQUISIÇÃO À API (BOATS_API)
// ============================================================================

/**
 * Função genérica para fazer requisições à BOATS_API.
 * @async
 * @param {string} action - A ação a ser executada na API (ex: 'listar', 'salvar').
 * @param {object} [payload={}] - O corpo da requisição (para POST).
 * @param {string} [method='POST'] - O método HTTP (GET ou POST).
 * @returns {Promise<object>} Os dados retornados pela API.
 * @throws {Error} Se a resposta da API não for 'ok'.
 * 
 * Exemplo de Uso (GET):
 * const lista = await apiRequest('listar', {}, 'GET');
 * 
 * Exemplo de Uso (POST):
 * const novoBarco = await apiRequest('criar_barco', { nome: 'Novo' });
 */
async function apiRequest(action, payload = {}, method = 'POST') {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  const url = method === 'GET' ? `${BOATS_API}?action=${encodeURIComponent(action)}` : BOATS_API;
  if (method !== 'GET') {
    opts.body = JSON.stringify({ action, ...payload });
  }
  const res = await fetch(url, opts);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Erro na API');
  return json.data ?? json;
}

/**
 * Busca a lista de barcos da API e popula a variável global 'boats'.
 * @async
 * @returns {Promise<void>}
 * 
 * Exemplo de Uso:
 * await fetchBoatsFromAPI();
 */
async function fetchBoatsFromAPI() {
  try {
    const data = await apiRequest('listar', {}, 'GET');
    boats = (data || []).map(row => ({
      id: String(row.id),
      codigo: row.numero_serie || '',
      modelo: row.modelo || '',
      cliente: row.cliente_nome || '',
      progress: row.status_producao != null ? Math.round(row.status_producao) : 0,
      criado_em: row.criado_em || ''
    }));
  } catch (e) {
    console.error('Falha ao carregar barcos da API:', e);
    // Tratamento de erro padrão: o array 'boats' permanece vazio ou com dados anteriores.
  }
}

/**
 * Salva ou atualiza os dados de um barco na API.
 * @async
 * @param {object} boatData - Os dados do barco a serem salvos.
 * @returns {Promise<object>} O objeto do barco retornado pela API.
 * 
 * Exemplo de Uso:
 * const barcoAtualizado = await saveBoatToAPI({ id: 1, modelo: 'Novo Modelo' });
 */
async function saveBoatToAPI(boatData) {
  const action = boatData.id ? 'salvar_barco' : 'criar_barco';
  const payload = {
    barco_id: boatData.id && !isNaN(parseInt(boatData.id, 10)) ? parseInt(boatData.id, 10) : undefined,
    numero_serie: boatData.codigo,
    modelo: boatData.modelo,
    cliente_nome: boatData.cliente,
    status_producao: boatData.progress
  };
  // Remove chaves undefined para criação
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  return apiRequest(action, payload, 'POST');
}

/**
 * Deleta um barco na API.
 * @async
 * @param {string} boatId - O ID do barco a ser deletado.
 * @returns {Promise<object>} A resposta da API.
 * 
 * Exemplo de Uso:
 * await deleteBoatFromAPI('1');
 */
async function deleteBoatFromAPI(boatId) {
  return apiRequest('deletar_barco', { barco_id: parseInt(boatId, 10) }, 'POST');
}

// ============================================================================
// FUNÇÕES DE REQUISIÇÃO À API (ESTALEIRO_API)
// ============================================================================

/**
 * Função genérica para fazer requisições à ESTALEIRO_API.
 * @async
 * @param {string} action - A ação a ser executada na API (ex: 'listar_ocupacao', 'mover_barco').
 * @param {object} [payload={}] - O corpo da requisição (para POST).
 * @param {string} [method='POST'] - O método HTTP (GET ou POST).
 * @returns {Promise<object>} Os dados retornados pela API.
 * @throws {Error} Se a resposta da API não for 'ok'.
 * 
 * Exemplo de Uso (GET):
 * const ocupacao = await estaleiroRequest('listar_ocupacao', {}, 'GET');
 */
async function estaleiroRequest(action, payload = {}, method = 'POST') {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  const url = method === 'GET' ? `${ESTALEIRO_API}?action=${encodeURIComponent(action)}` : ESTALEIRO_API;
  if (method !== 'GET') opts.body = JSON.stringify({ action, ...payload });
  const res = await fetch(url, opts);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Erro na API de estaleiro');
  return json.data ?? json;
}

/**
 * Busca a ocupação atual dos slots do estaleiro na API e atualiza os estados locais.
 * @async
 * @returns {Promise<void>}
 * 
 * Exemplo de Uso:
 * await fetchOccupancyFromAPI();
 */
async function fetchOccupancyFromAPI() {
  try {
    const occ = await estaleiroRequest('listar_ocupacao', {}, 'GET');
    completedBoats = [];
    preBoats = [];
    boats.forEach(b => { delete b.warehouse; delete b.slot; });
    (occ || []).forEach(o => {
      const bid = String(o.barco_id);
      const b = boats.find(x => x.id === bid);
      if (!b) return;
      const key = nomeToLocalKey(o.local_nome);
      if (key === 'laminacao' || key === 'montagem') {
        b.warehouse = key;
        b.slot = o.numero;
      } else if (key === 'concluidos') {
        b.progress = 100;
        completedBoats.push(b);
      } else if (key === 'preprojetos') {
        preBoats.push({ id: b.id, codigo: b.codigo, modelo: b.modelo, cliente: b.cliente, progress: b.progress || 0 });
      } else if (key === 'lixeira') {
        // Ignorar na UI principal
      }
    });
  } catch (e) {
    console.error('Falha ao carregar ocupação:', e);
    // Tratamento de erro padrão: os arrays de estado permanecem com dados anteriores.
  }
}

/**
 * Move um barco para um novo local e slot no banco de dados via API.
 * @async
 * @param {string} boatIdStr - O ID do barco.
 * @param {string} localNome - O nome do novo local (ex: 'Laminação', 'Concluídos').
 * @param {number | null | undefined} numero - O número do slot, se aplicável.
 * @returns {Promise<object>} A resposta da API.
 * 
 * Exemplo de Uso:
 * await moveBoatInDB('1', 'Montagem', 3);
 * await moveBoatInDB('2', 'Concluídos');
 */
async function moveBoatInDB(boatIdStr, localNome, numero) {
  const barco_id = parseInt(boatIdStr, 10);
  const payload = { barco_id, local_nome: localNome };
  if (typeof numero !== 'undefined' && numero !== null) payload.numero = parseInt(numero, 10);
  return estaleiroRequest('mover_barco', payload, 'POST');
}

/**
 * Funções de manipulação de localStorage (Manter aqui, pois são usadas pelas APIs
 * para persistir o estado do mapa de posições, que é crucial para a lógica de ocupação).
 */

/**
 * Obtém o mapa de posições de barcos do localStorage.
 * @returns {object} O mapa de posições.
 */
function getPositionsMap() {
  try { return JSON.parse(localStorage.getItem('boatPositions')) || {}; } catch (e) { return {}; }
}

/**
 * Salva o mapa de posições de barcos no localStorage.
 * @param {object} map - O mapa de posições a ser salvo.
 */
function savePositionsMap(map) {
  localStorage.setItem('boatPositions', JSON.stringify(map));
  boatPositions = map;
}

/**
 * Aplica as posições salvas no localStorage aos barcos.
 * @returns {void}
 * 
 * Exemplo de Uso:
 * applyPositionsFromStorage();
 */
function applyPositionsFromStorage() {
  const map = getPositionsMap();
  boats.forEach(b => {
    const pos = map[b.id];
    if (pos && pos.warehouse && pos.slot) {
      b.warehouse = pos.warehouse;
      b.slot = pos.slot;
    }
  });
}

/**
 * Garante que todos os barcos sem posição atribuída recebam um slot disponível
 * e salva no localStorage.
 * @returns {void}
 * 
 * Exemplo de Uso:
 * ensurePositionsAssigned();
 */
function ensurePositionsAssigned() {
  const map = getPositionsMap();
  boats.forEach(b => {
    if (!b.warehouse || !b.slot) {
      const avail = findAvailableSlot();
      if (avail) {
        b.warehouse = avail.warehouse;
        b.slot = avail.slot;
        map[b.id] = { warehouse: b.warehouse, slot: b.slot };
      }
    }
  });
  savePositionsMap(map);
}

/**
 * Encontra o primeiro slot de estaleiro disponível.
 * @returns {{warehouse: string, slot: number} | null} O slot disponível ou null se não houver.
 * 
 * Exemplo de Uso:
 * const slot = findAvailableSlot();
 */
function findAvailableSlot() {
  const warehouses = ['laminacao', 'montagem'];
  const slots = [1, 2, 3, 4, 5];
  
  for (const warehouse of warehouses) {
    for (const slot of slots) {
      const isOccupied = boats.some(boat => 
        boat.warehouse === warehouse && boat.slot == slot
      );
      if (!isOccupied) {
        return { warehouse, slot };
      }
    }
  }
  return null;
}

/**
 * Salva o estado atual dos arrays de barcos no localStorage.
 * @returns {void}
 * 
 * Exemplo de Uso:
 * saveBoatsToStorage();
 */
function saveBoatsToStorage() {
  // Apenas para manter a compatibilidade com a lógica anterior,
  // embora a ocupação seja agora primariamente controlada pela API.
  localStorage.setItem('shipyardBoats', JSON.stringify(boats));
  localStorage.setItem('completedBoats', JSON.stringify(completedBoats));
  localStorage.setItem('preBoats', JSON.stringify(preBoats));
}

// ============================================================================
// FUNÇÕES DE UI MIGRARAM PARA auxiliar.js
// ============================================================================

/**
 * Funções de UI que foram movidas para auxiliar.js:
 * 
 * - initializeSystem
 * - initializeDragAndDrop
 * - initializeCompletedProjectsDragDrop
 * - initializePreProjectsDragDrop
 * - openAddBoatModal
 * - openEditBoatModal
 * - openBoatDocumentation
 * - hideModal
 * - saveBoat
 * - deleteBoat
 * - selectBoat
 * - deselectBoat
 * - handleDragStart
 * - handleDragOver
 * - handleDrop
 * - handleDragLeave
 * - loadBoats
 * - loadCompletedBoats
 * - loadPreBoats
 * - updateCounters
 * - updateOccupiedCounters
 * - updateSelectionPanel
 * 
 * O `controller.js` agora foca apenas em dados e APIs.
 */

// ============================================================================
// INICIALIZAÇÃO (Manter apenas a lógica de carregamento inicial dos dados)
// ============================================================================

/**
 * Função de inicialização de dados.
 * @async
 * @returns {Promise<void>}
 * 
 * Exemplo de Uso:
 * initializeData()
 *   .then(loadBoats) // Funções de UI devem ser chamadas após o carregamento dos dados
 *   .then(updateCounters);
 */
async function initializeData() {
  await fetchBoatsFromAPI();
  await fetchOccupancyFromAPI();
}

/**
 * Lógica de inicialização do sistema (DOMContentLoad) - MIGRADA PARA auxiliar.js.
 * 
 * A lógica de inicialização de dados e UI deve ser orquestrada em auxiliar.js,
 * que agora contém o `initializeSystem` e as chamadas `loadBoats`/`updateCounters`.
 * O `controller.js` apenas expõe as funções de dados.
 * 
 * // Lógica original (movida para auxiliar.js):
 * // document.addEventListener('DOMContentLoaded', function() {
 * //   const isEstaleiroPage = !!document.querySelector('.boat-slot') || !!document.getElementById('boatModal');
 * //   if (isEstaleiroPage) {
 * //     initializeSystem();
 * //     fetchBoatsFromAPI()
 * //       .then(fetchOccupancyFromAPI)
 * //       .then(() => { loadBoats(); updateCounters(); });
 * //   }
 * // });
 */

// Exportações (para simular módulos, se o ambiente permitir)
// Se não for um ambiente de módulo, as funções permanecem globais.
// Caso seja um ambiente de módulo, seria necessário adicionar 'export' antes das funções.
// Como o código original não usa módulos, mantemos a estrutura de script global.