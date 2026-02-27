///////////////////////////     estaleiro         ///////////////////////////

    // Global variables
    let boats = [];
    let completedBoats = JSON.parse(localStorage.getItem('completedBoats')) || [];
    let preBoats = JSON.parse(localStorage.getItem('preBoats')) || [];
    let currentEditingBoat = null;
    let selectedBoat = null;
    let boatPositions = JSON.parse(localStorage.getItem('boatPositions')) || {};
    const BOATS_API = 'api/barcos.php';
    const ESTALEIRO_API = 'api/estaleiro.php';

    async function estaleiroRequest(action, payload = {}, method = 'POST') {
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      const url = method === 'GET' ? `${ESTALEIRO_API}?action=${encodeURIComponent(action)}` : ESTALEIRO_API;
      if (method !== 'GET') opts.body = JSON.stringify({ action, ...payload });
      const res = await fetch(url, opts);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Erro na API de estaleiro');
      return json.data ?? json;
    }

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
    function nomeToLocalKey(nome) {
      const n = (nome || '').toLowerCase();
      if (n.includes('lamina')) return 'laminacao';
      if (n.includes('monta')) return 'montagem';
      if (n.includes('concl')) return 'concluidos';
      if (n.includes('pré') || n.includes('pre')) return 'preprojetos';
      if (n.includes('lixeira')) return 'lixeira';
      return nome;
    }

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
      }
    }

    async function moveBoatInDB(boatIdStr, localNome, numero) {
      const barco_id = parseInt(boatIdStr, 10);
      const payload = { barco_id, local_nome: localNome };
      if (typeof numero !== 'undefined' && numero !== null) payload.numero = parseInt(numero, 10);
      return estaleiroRequest('mover_barco', payload, 'POST');
    }

    // Initialize the system when page loads
    // [Movido para auxiliar.js] Inicialização do EstaleiroUI e carregamento inicial


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
        // Posições passam a ser carregadas do DB via fetchOccupancyFromAPI
      } catch (e) {
        console.error('Falha ao carregar barcos da API:', e);
      }
    }

    function getPositionsMap() {
      try { return JSON.parse(localStorage.getItem('boatPositions')) || {}; } catch (e) { return {}; }
    }
    function savePositionsMap(map) {
      localStorage.setItem('boatPositions', JSON.stringify(map));
      boatPositions = map;
    }
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

    // Initialize event listeners
    function initializeSystem() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.initialize)
    }

    function initializeDragAndDrop() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.initializeDragAndDrop)
    }

    function initializeCompletedProjectsDragDrop() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.initializeCompletedProjectsDragDrop)
    }

    function selectBoat(boatId) {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.selectBoat)
    }

    function deselectBoat() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.deselectBoat)
    }

    function showModal() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.showModal)
    }

    function hideModal() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.hideModal)
    }

    function openAddBoatModal(warehouse = null, slot = null) {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.openAddBoatModal)
    }

    function openEditBoatModal() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.openEditBoatModal)
    }

    function openBoatDocumentation() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.openBoatDocumentation)
    }

    function saveBoat() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.saveBoat)
    }

    function deleteBoat() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.deleteBoat)
    }

    function handleDragOver(e) {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.handleDragOver)
    }

    function handleDrop(e) {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.handleDrop)
    }

    function handleDragLeave(e) {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.handleDragLeave)
    }

    function loadBoats() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.loadBoats)
    }

    function updateOccupiedCounters() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.updateOccupiedCounters)
    }

    function loadCompletedBoats() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.loadCompletedBoats)
    }

    function updateCounters() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.updateCounters)
    }

    function initializePreProjectsDragDrop() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.initializePreProjectsDragDrop)
    }

    function loadPreBoats() {
      // [Movido] Implementação em auxiliar.js (EstaleiroUI.loadPreBoats)
    }

    ```

  

///////////////////////////     estaleiro         ///////////////////////////
// Interface do módulo Core (EstaleiroCore)
// Responsável por: comunicação com APIs, processamento de dados do banco e lógica de negócios.
// Não contém manipuladores de UI, listeners ou renderização.
//
// API exposta em window.EstaleiroCore:
// - state: { boats, completedBoats, preBoats, boatPositions }
// - estaleiroRequest(action, payload, method)
// - apiRequest(action, payload, method)
// - fetchBoatsFromAPI()
// - fetchOccupancyFromAPI()
// - moveBoatInDB(boatId, localNome, numero) [compatibilidade atual]
// - findAvailableSlot()
// - saveBoatsToStorage()
// - localKeyToNome(key), nomeToLocalKey(nome)
// - getState() -> snapshot do estado atual
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
function nomeToLocalKey(nome) {
  const n = (nome || '').toLowerCase();
  if (n.includes('lamina')) return 'laminacao';
  if (n.includes('monta')) return 'montagem';
  if (n.includes('concl')) return 'concluidos';
  if (n.includes('pré') || n.includes('pre')) return 'preprojetos';
  if (n.includes('lixeira')) return 'lixeira';
  return nome;
}

    // Exportar núcleo como módulo global (sem UI)
    window.EstaleiroCore = {
      // Estado (referências vivas)
      state: {
        get boats() { return boats; },
        get completedBoats() { return completedBoats; },
        get preBoats() { return preBoats; },
        get boatPositions() { return boatPositions; }
      },
      // Funções utilitárias e de API
      estaleiroRequest,
      apiRequest,
      fetchBoatsFromAPI,
      fetchOccupancyFromAPI,
      moveBoatInDB,
      findAvailableSlot,
      saveBoatsToStorage,
      localKeyToNome,
      nomeToLocalKey,
      // Snapshot seguro
      getState() {
        return {
          boats: boats.map(b => ({ ...b })),
          completedBoats: completedBoats.map(b => ({ ...b })),
          preBoats: preBoats.map(b => ({ ...b })),
          boatPositions: { ...boatPositions }
        };
      }
    };
    
    ```

  
