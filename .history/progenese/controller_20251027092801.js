/**
 * Controller Principal do Estaleiro
 * Gerencia o estado dos barcos, a comunicação com a API e a lógica de UI.
 */

////////////////////////////////////////////////////////////////////////////////
// Variáveis Globais de Estado
////////////////////////////////////////////////////////////////////////////////

let boats = []; // Barcos nos galpões (laminacao, montagem)
let completedBoats = JSON.parse(localStorage.getItem('completedBoats')) || []; // Barcos concluídos
let preBoats = JSON.parse(localStorage.getItem('preBoats')) || []; // Barcos em pré-projeto
let trashBoats = JSON.parse(localStorage.getItem('trashBoats')) || []; // Barcos na lixeira
let currentEditingBoat = null; // Barco atualmente sendo editado no modal
let selectedBoat = null; // Barco atualmente selecionado na UI
let boatPositions = JSON.parse(localStorage.getItem('boatPositions')) || {}; // Posições dos barcos (não usado ativamente, mas mantido)
const BOATS_API = 'api/barcos.php'; // API de Barcos (não usada ativamente, mas mantida)
const ESTALEIRO_API = 'api/estaleiro.php'; // API do Estaleiro
const DEFAULT_STATUS_MESSAGE = 'Arraste os barcos entre as vagas para reorganizar. Clique sobre um barco para editar e ver mais detalhes.'; // Mensagem padrão de status
let statusTimer = null; // Timer para a mensagem de status
let undoStack = []; // Histórico de ações para o 'Desfazer'
const MAX_UNDO_ACTIONS = 10; // Limite do histórico de 'Desfazer'
let isDirty = false; // Flag para indicar se há alterações não salvas

console.log('[controller.js] loaded');

////////////////////////////////////////////////////////////////////////////////
// Funções de Gerenciamento de Estado e Localização
////////////////////////////////////////////////////////////////////////////////

/**
 * Atualiza o estado do botão de desfazer.
 */
function updateUndoButtonState() {
  const btn = document.getElementById('undoChangesBtn');
  if (btn) btn.disabled = undoStack.length === 0;
}

/**
 * Registra uma ação no histórico de desfazer.
 */
function pushUndoAction(boatId, from, to) {
  try {
    undoStack.push({ boatId: String(boatId), from, to, timestamp: Date.now() });
    if (undoStack.length > MAX_UNDO_ACTIONS) undoStack.shift();
    updateUndoButtonState();
  } catch (e) {
    console.warn('[estaleiro] Falha ao registrar undo:', e);
  }
}

/**
 * Retorna a localização atual de um barco (galpão, pré-projeto, concluído, lixeira).
 */
function getBoatCurrentLocation(boatId) {
  const idStr = String(boatId);
  const bw = boats.find(b => String(b.id) === idStr);
  if (bw && bw.warehouse && bw.slot != null) return { local: bw.warehouse, slot: bw.slot };
  if (preBoats.find(b => String(b.id) === idStr)) return { local: 'preprojetos', slot: null };
  if (completedBoats.find(b => String(b.id) === idStr)) return { local: 'concluidos', slot: null };
  if ((trashBoats || []).find(b => String(b.id) === idStr)) return { local: 'lixeira', slot: null };
  return null;
}

/**
 * Move um barco entre locais (galpões, pré-projeto, concluído, lixeira) no estado local.
 */
function moveBoatToLocation(boatId, dest) {
  const idStr = String(boatId);
  let boat = boats.find(b => String(b.id) === idStr);
  let fromList = 'boats';
  if (!boat) { boat = preBoats.find(b => String(b.id) === idStr); fromList = 'preBoats'; }
  if (!boat) { boat = completedBoats.find(b => String(b.id) === idStr); fromList = 'completedBoats'; }
  if (!boat) { boat = (trashBoats || []).find(b => String(b.id) === idStr); fromList = 'trashBoats'; }
  if (!boat) return false;

  const isWarehouse = dest.local === 'laminacao' || dest.local === 'montagem';
  if (isWarehouse) {
    const occupied = boats.some(b => b.warehouse === dest.local && Number(b.slot) === Number(dest.slot));
    if (occupied) return false;
    if (fromList === 'boats') boats = boats.filter(b => String(b.id) !== idStr);
    else if (fromList === 'preBoats') preBoats = preBoats.filter(b => String(b.id) !== idStr);
    else if (fromList === 'completedBoats') completedBoats = completedBoats.filter(b => String(b.id) !== idStr);
    else if (fromList === 'trashBoats') trashBoats = (trashBoats || []).filter(b => String(b.id) !== idStr);
    boat.warehouse = dest.local; boat.slot = dest.slot;
    boats.push(boat);
  } else {
    if (fromList === 'boats') boats = boats.filter(b => String(b.id) !== idStr);
    else if (fromList === 'preBoats') preBoats = preBoats.filter(b => String(b.id) !== idStr);
    else if (fromList === 'completedBoats') completedBoats = completedBoats.filter(b => String(b.id) !== idStr);
    else if (fromList === 'trashBoats') trashBoats = (trashBoats || []).filter(b => String(b.id) !== idStr);
    delete boat.warehouse; delete boat.slot;
    if (dest.local === 'preprojetos') preBoats.push(boat);
    else if (dest.local === 'concluidos') completedBoats.push(boat);
    else if (dest.local === 'lixeira') (trashBoats || (trashBoats = [])).push(boat);
    else return false;
  }
  saveBoatsToStorage();
  loadBoats();
  updateCounters();
  return true;
}

/**
 * Desfaz a última ação de movimentação registrada.
 */
function undoLastAction() {
  if (undoStack.length === 0) return;
  const last = undoStack[undoStack.length - 1];
  const ok = moveBoatToLocation(last.boatId, last.from);
  if (ok) {
    undoStack.pop();
    updateUndoButtonState();
    isDirty = true;
    setStatusMessage('A ultima ação foi desfeita, será necessário salvar novamente', 'warning', 5000);
  } else {
    setStatusMessage('erro ao desfazer - a posição original não está mais disponível', 'danger', 5000);
  }
}

/**
 * Remove duplicações nas listas de barcos.
 */
function dedupeBoatLists() {
  const seen = new Set();
  const uniq = (arr) => {
    const out = [];
    (arr || []).forEach(b => {
      if (!b || b.id == null) return;
      const id = String(b.id);
      if (!seen.has(id)) {
        seen.add(id);
        out.push(b);
      }
    });
    return out;
  };
  completedBoats = uniq(completedBoats);
  preBoats = uniq(preBoats);
  trashBoats = uniq(trashBoats);
  const map = new Map();
  boats = (boats || []).filter(b => {
    if (!b || b.id == null) return false;
    const id = String(b.id);
    if (map.has(id)) return false;
    map.set(id, true);
    return true;
  });
  const specialIds = new Set([...completedBoats, ...preBoats, ...trashBoats].map(b => String(b.id)));
  boats.forEach(b => {
    if (!b) return;
    const id = String(b.id);
    if (specialIds.has(id)) {
      delete b.warehouse;
      delete b.slot;
    }
  });
}

/**
 * Persiste listas `boats`, `completedBoats` e `preBoats` no `localStorage`.
 */
function saveBoatsToStorage() {
  localStorage.setItem('shipyardBoats', JSON.stringify(boats));
  localStorage.setItem('completedBoats', JSON.stringify(completedBoats));
  localStorage.setItem('preBoats', JSON.stringify(preBoats));
}

////////////////////////////////////////////////////////////////////////////////
// Funções de Comunicação com a API
////////////////////////////////////////////////////////////////////////////////

/**
 * Envia requisições para a API do Estaleiro.
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
 * Obtém a ocupação (vagas ocupadas/livres) do estaleiro via API.
 */
async function fetchOccupancyFromAPI() {
  try {
    dedupeBoatLists();
    const registry = new Map();
    const add = (b) => {
      if (!b || b.id == null) return;
      const id = String(b.id);
      if (!registry.has(id)) registry.set(id, b);
    };
    (boats || []).forEach(add);
    (completedBoats || []).forEach(add);
    (preBoats || []).forEach(add);
    (trashBoats || []).forEach(add);
    registry.forEach(b => { delete b.warehouse; delete b.slot; });
    const occ = await estaleiroRequest('listar_ocupacao', {}, 'GET');
    const nextCompleted = [];
    const nextPre = [];
    const nextTrash = [];
    (occ || []).forEach(o => {
      const bid = String(o.barco_id);
      const b = registry.get(bid);
      if (!b) return;
      const key = nomeToLocalKey(o.local_nome);
      if (key === 'laminacao' || key === 'montagem') {
        b.warehouse = key;
        b.slot = o.numero;
      } else if (key === 'concluidos') {
        b.progress = 100;
        nextCompleted.push(b);
      } else if (key === 'preprojetos') {
        nextPre.push(b);
      } else if (key === 'lixeira') {
        nextTrash.push(b);
      }
    });
    completedBoats = nextCompleted;
    preBoats = nextPre;
    trashBoats = nextTrash;
    const specialIds = new Set([...completedBoats, ...preBoats, ...trashBoats].map(b => String(b.id)));
    boats = Array.from(registry.values()).filter(b => !specialIds.has(String(b.id)));
    const lamCount = boats.filter(b => b.warehouse === 'laminacao').length;
    const montCount = boats.filter(b => b.warehouse === 'montagem').length;
    console.log('[estaleiro] Ocupação atualizada', {
      laminacao: lamCount,
      montagem: montCount,
      concluidos: completedBoats.length,
      preprojetos: preBoats.length,
      lixeira: (trashBoats || []).length,
    });
  } catch (e) {
    console.error('Falha ao carregar ocupação:', e);
  }
}

/**
 * Move um barco no banco de dados via API.
 */
async function moveBoatInDB(boatIdStr, localNome, numero) {
  const barco_id = parseInt(boatIdStr, 10);
  const payload = { barco_id, local_nome: localNome };
  if (typeof numero !== 'undefined' && numero !== null) payload.numero = parseInt(numero, 10);
  return estaleiroRequest('mover_barco', payload, 'POST');
}

/**
 * Constrói o payload de ocupação para salvar no backend.
 */
function buildOccupancyPayload() {
  const payload = [];
  const validId = (id) => {
    const n = parseInt(String(id), 10);
    return Number.isFinite(n) && n > 0;
  };
  (boats || []).forEach(b => {
    if (validId(b && b.id) && b.warehouse && b.slot != null) {
      payload.push({
        barco_id: parseInt(b.id, 10),
        local_nome: localKeyToNome(b.warehouse),
        numero: parseInt(b.slot, 10)
      });
    }
  });
  (completedBoats || []).forEach(b => {
    if (validId(b && b.id)) payload.push({ barco_id: parseInt(b.id, 10), local_nome: 'Concluídos' });
  });
  (preBoats || []).forEach(b => {
    if (validId(b && b.id)) payload.push({ barco_id: parseInt(b.id, 10), local_nome: 'Pré-Projetos' });
  });
  (trashBoats || []).forEach(b => {
    if (validId(b && b.id)) payload.push({ barco_id: parseInt(b.id, 10), local_nome: 'Lixeira' });
  });
  return payload;
}

/**
 * Salva todas as alterações de ocupação no backend.
 */
async function saveOccupancy() {
  console.log('[estaleiro] saveOccupancy called');
  try {
    dedupeBoatLists();
    const allNew = [];
    [boats, preBoats, completedBoats, trashBoats].forEach(arr => {
      (arr || []).forEach(b => { if (b && (b.isNew || isTempId(b.id))) allNew.push(b); });
    });
    const preIds = new Set((preBoats || []).map(b => String(b.id)));
    const compIds = new Set((completedBoats || []).map(b => String(b.id)));
    const trashIds = new Set(((trashBoats || [])).map(b => String(b.id)));
    const invalidNew = allNew.filter(b => {
      const idStr = String(b.id);
      const isInWarehouse = !!(b.warehouse && b.slot != null);
      const isInSpecialLocal = preIds.has(idStr) || compIds.has(idStr) || trashIds.has(idStr);
      return !(isInWarehouse || isInSpecialLocal);
    });
    if (invalidNew.length > 0) {
      console.warn('[estaleiro] Novos barcos sem local/vaga:', invalidNew.map(b => b.codigo || b.modelo || b.id));
      setStatusMessage('Há novos barcos sem local. Mova para Pré-Projetos, Concluídos, Lixeira ou um galpão antes de salvar.', 'warning', 5000);
      return;
    }
    for (const b of allNew) {
      try {
        const created = await estaleiroRequest('criar_barco', { numero_serie: b.codigo || '', cliente_nome: b.cliente || '', modelo: b.modelo || '', status_producao: b.progress || 0 }, 'POST');
        if (!created || !created.id) throw new Error('Resposta inválida ao criar barco');
        const newId = String(created.id);
        [boats, preBoats, completedBoats, trashBoats].forEach(arr => {
          (arr || []).forEach(x => { if (x.id === b.id) { x.id = newId; delete x.isNew; } });
        });
      } catch (err) {
        console.error('Erro ao criar barco:', err);
        const msg = (err && err.message) ? err.message : 'Erro ao criar barco';
        setStatusMessage(`Erro ao salvar: ${msg}`, 'error', 5000);
        return;
      }
    }
    dedupeBoatLists();
    const payload = buildOccupancyPayload();
    const ok = await estaleiroRequest('salvar_ocupacao', { ocupacoes: payload }, 'POST');
    setStatusMessage('Alterações salvas com sucesso.', 'success', 5000);
    await fetchOccupancyFromAPI();
    applyPositionsFromStorage();
    updateCounters();
  } catch (e) {
    console.error('Erro ao salvar ocupação:', e);
    const msg = (e && e.message) ? e.message : 'Erro ao salvar';
    setStatusMessage(`Erro ao salvar: ${msg}`, 'error', 5000);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Funções de UI Específicas do Estaleiro
////////////////////////////////////////////////////////////////////////////////

/**
 * Exibe uma mensagem de status no banner.
 */
function setStatusMessage(text, type = 'info', durationMs = 0) {
  const el = document.getElementById('statusBanner');
  if (!el) return;
  clearTimeout(statusTimer);
  el.textContent = text;
  el.className = `status-banner alert alert-${type}`;
  el.style.display = 'block';
  if (durationMs > 0) {
    statusTimer = setTimeout(() => {
      el.style.display = 'none';
      el.textContent = DEFAULT_STATUS_MESSAGE;
      el.className = 'status-banner alert alert-info';
    }, durationMs);
  }
}

/**
 * Converte a chave interna do local para o nome de exibição.
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
 * Converte o nome de exibição do local para a chave interna.
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

/**
 * Seleciona um barco de qualquer lista e destaca sua vaga, se aplicável.
 */
function selectBoat(boatId) {
  const boat = boats.find(b => b.id === boatId) || preBoats.find(b => b.id === boatId) || completedBoats.find(b => b.id === boatId);
  if (!boat) return;
  selectedBoat = boat;
  document.querySelectorAll('.boat-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  const slot = document.querySelector(`[data-boat-id="${boatId}"]`);
  if (slot) {
    slot.classList.add('selected');
  }
  const panel = document.getElementById('boatSelectionPanel');
  if (panel) panel.style.display = 'none';
}

/**
 * Limpa a seleção de barco e remove o destaque visual.
 */
function deselectBoat() {
  selectedBoat = null;
  document.querySelectorAll('.boat-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  const panel = document.getElementById('boatSelectionPanel');
  if (panel) panel.style.display = 'none';
}

/**
 * Abre o modal de adicionar novo barco.
 */
function openAddBoatModal(warehouse = null, slot = null) {
  currentEditingBoat = null;
  document.getElementById('boatModalLabel').textContent = 'Adicionar Novo Barco';
  document.getElementById('boatForm').reset();
  document.getElementById('progressValue').textContent = '0%';
  document.getElementById('deleteBoatBtn').style.display = 'none';
  if (warehouse && slot) {
    document.getElementById('boatModal').dataset.preselectedWarehouse = warehouse;
    document.getElementById('boatModal').dataset.preselectedSlot = slot;
  }
  showModal();
}

/**
 * Abre o modal de edição com dados do barco selecionado.
 */
function openEditBoatModal() {
  if (!selectedBoat) return;
  currentEditingBoat = selectedBoat;
  document.getElementById('boatModalLabel').textContent = 'Editar Barco';
  document.getElementById('boatCode').value = selectedBoat.codigo || '';
  document.getElementById('boatModel').value = selectedBoat.modelo || '';
  document.getElementById('clientName').value = selectedBoat.cliente || '';
  document.getElementById('boatProgress').value = selectedBoat.progress || 0;
  document.getElementById('progressValue').textContent = (selectedBoat.progress || 0) + '%';
  document.getElementById('deleteBoatBtn').style.display = 'inline-block';
  showModal();
}

/**
 * Placeholder para documentação do barco selecionado.
 */
function openBoatDocumentation() {
  if (!selectedBoat) return;
  alert('Funcionalidade de documentação será implementada em breve.\n\nBarco: ' + selectedBoat.codigo + ' - ' + selectedBoat.modelo);
}

/**
 * Cria ou edita um barco via API e atualiza o estado/UI.
 */
function saveBoat() {
  const codigo = document.getElementById('boatCode').value.trim();
  const modelo = document.getElementById('boatModel').value.trim();
  const cliente = document.getElementById('clientName').value.trim();
  const progress = parseInt(document.getElementById('boatProgress').value);
  if (!modelo || !cliente) { alert('Por favor, preencha os campos obrigatórios: Modelo e Nome do Cliente.'); return; }
  (async () => {
    if (currentEditingBoat) {
      currentEditingBoat.codigo = codigo;
      currentEditingBoat.modelo = modelo;
      currentEditingBoat.cliente = cliente;
      currentEditingBoat.progress = progress;
      hideModal();
      loadBoats();
      updateCounters();
    } else {
      const tmpId = 'tmp_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const preselectedWarehouse = document.getElementById('boatModal').dataset.preselectedWarehouse;
      const preselectedSlot = document.getElementById('boatModal').dataset.preselectedSlot;
      const createInPreProject = document.getElementById('boatModal').dataset.createInPreProject === 'true';
      const newBoat = {
        id: tmpId,
        codigo,
        modelo,
        cliente,
        progress: isNaN(progress) ? 0 : progress,
        isNew: true
      };
      if (createInPreProject) {
        preBoats.push({ id: newBoat.id, codigo: newBoat.codigo, modelo: newBoat.modelo, cliente: newBoat.cliente, progress: newBoat.progress, isNew: true });
        delete document.getElementById('boatModal').dataset.createInPreProject;
      } else if (preselectedWarehouse && preselectedSlot) {
        newBoat.warehouse = preselectedWarehouse;
        newBoat.slot = parseInt(preselectedSlot, 10);
        boats.push(newBoat);
        delete document.getElementById('boatModal').dataset.preselectedWarehouse;
        delete document.getElementById('boatModal').dataset.preselectedSlot;
      } else {
        preBoats.push({ id: newBoat.id, codigo: newBoat.codigo, modelo: newBoat.modelo, cliente: newBoat.cliente, progress: newBoat.progress, isNew: true });
      }
      hideModal();
      loadBoats();
      updateCounters();
    }
  })();
}

/**
 * Move o barco atual para a Lixeira (apenas em memória, persistência no saveOccupancy).
 */
function deleteBoat() {
  if (!currentEditingBoat) return;
  if (confirm('Tem certeza que deseja enviar este barco para a Lixeira?')) {
    (async () => {
      try {
        let deleted = false;
        let idx = boats.findIndex(b => b.id === currentEditingBoat.id);
        if (idx > -1) { boats.splice(idx, 1); deleted = true; }
        idx = preBoats.findIndex(b => b.id === currentEditingBoat.id);
        if (idx > -1) { preBoats.splice(idx, 1); deleted = true; }
        idx = completedBoats.findIndex(b => b.id === currentEditingBoat.id);
        if (idx > -1) { completedBoats.splice(idx, 1); deleted = true; }
        trashBoats.push({
          id: currentEditingBoat.id,
          codigo: currentEditingBoat.codigo,
          modelo: currentEditingBoat.modelo,
          cliente: currentEditingBoat.cliente,
          progress: currentEditingBoat.progress || 0
        });
        if (deleted) { loadBoats(); updateCounters(); hideModal(); deselectBoat(); }
      } catch (e) {
        console.error('Erro ao mover para Lixeira:', e);
        alert('Falha ao mover para Lixeira: ' + e.message);
      }
    })();
  }
}

/**
 * Renderiza vagas, preenche barcos nos galpões e ativa ícones.
 */
function loadBoats() {
  document.querySelectorAll('.boat-slot').forEach(slot => {
    slot.classList.remove('occupied', 'selected');
    slot.removeAttribute('data-boat-id');
    slot.removeAttribute('draggable');
    slot.innerHTML = `<div class="slot-number">Vaga ${slot.dataset.slot}</div><div class="slot-content"><i class="bi bi-plus-circle add-icon"></i><span>Clique para adicionar</span></div>`;
  });
  boats.forEach(boat => {
    const slot = document.querySelector(`[data-warehouse="${boat.warehouse}"][data-slot="${boat.slot}"]`);
    if (slot) {
      slot.classList.add('occupied');
      slot.dataset.boatId = boat.id;
      slot.draggable = true;
      slot.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', boat.id);
        this.classList.add('dragging');
      });
      slot.addEventListener('dragend', function() {
        this.classList.remove('dragging');
      });
      slot.innerHTML = `
        <div class="slot-content">
          <div class="slot-number">Vaga ${boat.slot}</div>
          <i class="bi bi-arrows-move move-icon"></i>
          <i class="bi bi-anchor boat-anchor"></i>
          <div class="boat-info">
            <div class="boat-model">${boat.modelo || 'Modelo não informado'}</div>
            <div class="boat-code">${boat.codigo || 'Número de série não informado'}</div>
            <div class="boat-progress">${boat.progress || 0}% concluído</div>
          </div>
        </div>
        <div class="slot-overlay">
          <div class="overlay-grid">
            <i class="bi bi-pencil-square overlay-icon edit-icon" title="Editar"></i>
            <div class="overlay-spacer"></div>
            <i class="bi bi-clipboard-check overlay-icon docs-icon" title="Ver Documentação"></i>
          </div>
        </div>
      `;
      const editIcon = slot.querySelector('.edit-icon');
      const docsIcon = slot.querySelector('.docs-icon');
      if (editIcon) {
        editIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boat.id);
          openEditBoatModal();
        });
      }
      if (docsIcon) {
        docsIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boat.id);
          openBoatDocumentation();
        });
      }
    }
  });
  updateOccupiedCounters();
  loadCompletedBoats();
  loadPreBoats();
}

/**
 * Renderiza a lista de projetos concluídos com drag e ações.
 */
function loadCompletedBoats() {
  const container = document.getElementById('completedBoatsContainer');
  if (!container) return;
  if (completedBoats.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>Nenhum projeto concluído ainda</p>
      </div>
    `;
  } else {
    container.innerHTML = completedBoats.map(boat => `
      <div class="completed-boat" draggable="true" data-boat-id="${boat.id}">
        <i class="bi bi-check-circle" style="font-size: 1.2rem; margin-bottom: 8px;"></i>
        <div class="boat-code">${boat.codigo || 'N/A'}</div>
        <div class="boat-model">${boat.modelo || 'N/A'}</div>
        <div class="overlay-grid" style="margin-top: 6px;">
          <i class="bi bi-pencil-square overlay-icon edit-icon" title="Editar"></i>
          <div class="overlay-spacer"></div>
          <i class="bi bi-clipboard-check overlay-icon docs-icon" title="Ver Documentação"></i>
        </div>
      </div>
    `).join('');
    const cardCountCompleted = container.querySelectorAll('.completed-boat').length;
    if (cardCountCompleted > 4) { container.classList.add('scrollable'); } else { container.classList.remove('scrollable'); }
    container.querySelectorAll('.completed-boat').forEach(el => {
      el.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', this.dataset.boatId);
        this.classList.add('dragging');
      });
      el.addEventListener('dragend', function() {
        this.classList.remove('dragging');
      });
      const boatId = el.dataset.boatId;
      const editIcon = el.querySelector('.edit-icon');
      const docsIcon = el.querySelector('.docs-icon');
      if (editIcon) {
        editIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boatId);
          openEditBoatModal();
        });
      }
      if (docsIcon) {
        docsIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boatId);
          openBoatDocumentation();
        });
      }
    });
  }
}

/**
 * Renderiza a lista de pré-projetos com drag e ações.
 */
function loadPreBoats() {
  const container = document.getElementById('preProjectsContainer');
  if (!container) return;
  if (preBoats.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>Nenhum pré-projeto no momento</p>
      </div>
    `;
    container.classList.remove('scrollable');
  } else {
    container.innerHTML = preBoats.map(boat => `
      <div class="pre-boat" draggable="true" data-boat-id="${boat.id}">
        <i class="bi bi-lightbulb" style="font-size: 1.2rem; margin-bottom: 8px;"></i>
        <div class="boat-code">${boat.codigo || 'N/A'}</div>
        <div class="boat-model">${boat.modelo || 'N/A'}</div>
        <div class="overlay-grid" style="margin-top: 6px;">
          <i class="bi bi-pencil-square overlay-icon edit-icon" title="Editar"></i>
          <div class="overlay-spacer"></div>
          <i class="bi bi-clipboard-check overlay-icon docs-icon" title="Ver Documentação"></i>
        </div>
      </div>
    `).join('');
    const cardCountPre = container.querySelectorAll('.pre-boat').length;
    if (cardCountPre > 4) { container.classList.add('scrollable'); } else { container.classList.remove('scrollable'); }
    container.querySelectorAll('.pre-boat').forEach(preBoatEl => {
      preBoatEl.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', this.dataset.boatId);
        this.classList.add('dragging');
      });
      preBoatEl.addEventListener('dragend', function() {
        this.classList.remove('dragging');
      });
      const boatId = preBoatEl.dataset.boatId;
      const editIcon = preBoatEl.querySelector('.edit-icon');
      const docsIcon = preBoatEl.querySelector('.docs-icon');
      if (editIcon) {
        editIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boatId);
          openEditBoatModal();
        });
      }
      if (docsIcon) {
        docsIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boatId);
          openBoatDocumentation();
        });
      }
    });
  }
}

/**
 * Atualiza contadores de vagas ocupadas por galpão.
 */
function updateOccupiedCounters() {
  const laminacaoOccupied = boats.filter(b => b.warehouse === 'laminacao').length;
  const montagemOccupied = boats.filter(b => b.warehouse === 'montagem').length;
  const lamEl = document.getElementById('laminacaoOccupied');
  const montEl = document.getElementById('montagemOccupied');
  if (lamEl) lamEl.textContent = laminacaoOccupied;
  if (montEl) montEl.textContent = montagemOccupied;
}

/**
 * Atualiza contadores gerais (total e concluídos).
 */
function updateCounters() {
  const totalEl = document.getElementById('totalBoats');
  const completedEl = document.getElementById('completedBoats');
  if (totalEl) totalEl.textContent = boats.length;
  if (completedEl) completedEl.textContent = completedBoats.length;
}

/**
 * Encontra a primeira vaga disponível nos galpões.
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
 * Identifica se um ID é temporário (criado em memória).
 */
function isTempId(id) {
  if (id == null) return false;
  const s = String(id);
  return s.startsWith('tmp_') || !/^\d+$/.test(s);
}

////////////////////////////////////////////////////////////////////////////////
// Funções de Inicialização e Drag and Drop
////////////////////////////////////////////////////////////////////////////////

/**
 * Configura drag-and-drop nas vagas de galpões.
 */
function initializeDragAndDrop() {
  const slots = document.querySelectorAll('.boat-slot');
  slots.forEach(slot => {
    slot.addEventListener('click', function(e) {
      e.stopPropagation();
      const boatId = this.dataset.boatId;
      if (boatId) {
        selectBoat(boatId);
      } else {
        openAddBoatModal(this.dataset.warehouse, this.dataset.slot);
      }
    });
    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('drop', handleDrop);
    slot.addEventListener('dragleave', handleDragLeave);
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.boat-slot') && !e.target.closest('.boat-selection-panel')) {
      deselectBoat();
    }
  });
}

/**
 * Habilita drag-and-drop para área de Projetos Concluídos.
 */
function initializeCompletedProjectsDragDrop() {
  const completedContainer = document.getElementById('completedBoatsContainer');
  completedContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });
  completedContainer.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    const boatId = e.dataTransfer.getData('text/plain');
    const boatIndex = boats.findIndex(b => b.id === boatId);
    if (boatIndex > -1) {
      const fromPrev = { local: boats[boatIndex].warehouse, slot: boats[boatIndex].slot };
      const completedBoat = boats.splice(boatIndex, 1)[0];
      const toNext = { local: 'concluidos', slot: null };
      pushUndoAction(completedBoat.id, fromPrev, toNext);
      completedBoat.progress = 100;
      delete completedBoat.warehouse;
      delete completedBoat.slot;
      completedBoats.push(completedBoat);
      saveBoatsToStorage();
      loadBoats();
      updateCounters();
      deselectBoat();
      return;
    }
    const preIndex = preBoats.findIndex(b => b.id === boatId);
    if (preIndex > -1) {
      const fromPrev = { local: 'preprojetos', slot: null };
      const completedBoat = preBoats.splice(preIndex, 1)[0];
      const toNext = { local: 'concluidos', slot: null };
      pushUndoAction(completedBoat.id, fromPrev, toNext);
      completedBoat.progress = 100;
      completedBoats.push(completedBoat);
      saveBoatsToStorage();
      loadBoats();
      updateCounters();
      deselectBoat();
      return;
    }
  });
  completedContainer.addEventListener('dragleave', function() {
    this.classList.remove('drag-over');
  });
}

/**
 * Habilita drag-and-drop para área de Pré-Projetos.
 */
function initializePreProjectsDragDrop() {
  const preContainer = document.getElementById('preProjectsContainer');
  if (!preContainer) return;
  preContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });
  preContainer.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    const boatId = e.dataTransfer.getData('text/plain');
    const boatFromWarehouse = boats.find(b => b.id === boatId);
    if (boatFromWarehouse) {
      const idx = boats.findIndex(b => b.id === boatId);
      if (idx > -1) {
        const fromPrev = { local: boats[idx].warehouse, slot: boats[idx].slot };
        const moved = boats.splice(idx, 1)[0];
        const toNext = { local: 'preprojetos', slot: null };
        pushUndoAction(moved.id, fromPrev, toNext);
        delete moved.warehouse;
        delete moved.slot;
        preBoats.push(moved);
        saveBoatsToStorage();
        loadBoats();
        updateCounters();
        deselectBoat();
      }
      return;
    }
    const completedIdx = completedBoats.findIndex(b => b.id === boatId);
    if (completedIdx > -1) {
      const fromPrev = { local: 'concluidos', slot: null };
      const moved = completedBoats.splice(completedIdx, 1)[0];
      const toNext = { local: 'preprojetos', slot: null };
      pushUndoAction(moved.id, fromPrev, toNext);
      preBoats.push(moved);
      saveBoatsToStorage();
      loadBoats();
      updateCounters();
      return;
    }
  });
  preContainer.addEventListener('dragleave', function() {
    this.classList.remove('drag-over');
  });
}

/**
 * Handler de dragover (movido para auxiliar.js, mantido aqui para compatibilidade de chamadas).
 */
function handleDragOver(e) {
  // Chamada para a função em auxiliar.js
  if (typeof window.handleDragOver === 'function') {
    window.handleDragOver(e);
  } else {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }
}

/**
 * Processa o drop de cartões em vagas.
 */
function handleDrop(e) {
  e.preventDefault();
  const slot = e.currentTarget;
  slot.classList.remove('drag-over');
  const boatId = e.dataTransfer.getData('text/plain');
  const numero = parseInt(slot.dataset.slot, 10);
  const completedBoat = completedBoats.find(b => b.id === boatId);
  if (completedBoat && !slot.dataset.boatId) {
    const completedIndex = completedBoats.findIndex(b => b.id === boatId);
    if (completedIndex > -1) {
      try {
        const prev = { local: 'concluidos', slot: null };
        const boat = completedBoats.splice(completedIndex, 1)[0];
        const next = { local: slot.dataset.warehouse, slot: numero };
        pushUndoAction(boat.id, prev, next);
        boat.warehouse = slot.dataset.warehouse; boat.slot = numero;
        boats.push(boat);
        saveBoatsToStorage();
        loadBoats(); updateCounters();
      } catch (e) {
        alert('Falha ao retornar de Concluídos: ' + e.message);
      }
    }
    return;
  }
  const preBoat = preBoats.find(b => b.id === boatId);
  if (preBoat && !slot.dataset.boatId) {
    const preIndex = preBoats.findIndex(b => b.id === boatId);
    if (preIndex > -1) {
      try {
        const prev = { local: 'preprojetos', slot: null };
        const boat = preBoats.splice(preIndex, 1)[0];
        const next = { local: slot.dataset.warehouse, slot: numero };
        pushUndoAction(boat.id, prev, next);
        boat.warehouse = slot.dataset.warehouse; boat.slot = numero;
        boats.push(boat);
        saveBoatsToStorage();
        loadBoats(); updateCounters();
      } catch (e) {
        alert('Falha ao mover de Pré-Projetos: ' + e.message);
      }
    }
    return;
  }
  const boat = boats.find(b => b.id === boatId);
  if (boat && !slot.dataset.boatId) {
    try {
      const prev = { local: boat.warehouse, slot: boat.slot };
      const next = { local: slot.dataset.warehouse, slot: numero };
      pushUndoAction(boat.id, prev, next);
      boat.warehouse = slot.dataset.warehouse; boat.slot = numero;
      saveBoatsToStorage();
      loadBoats();
    } catch (e) {
      alert('Falha ao mover barco: ' + e.message);
    }
  }
}

/**
 * Handler de dragleave (movido para auxiliar.js, mantido aqui para compatibilidade de chamadas).
 */
function handleDragLeave(e) {
  // Chamada para a função em auxiliar.js
  if (typeof window.handleDragLeave === 'function') {
    window.handleDragLeave(e);
  } else {
    e.currentTarget.classList.remove('drag-over');
  }
}

/**
 * Inicializa ouvintes de UI e integrações de drag-and-drop.
 */
function initializeSystem() {
  document.getElementById('saveBoatBtn').addEventListener('click', saveOccupancy);
  document.getElementById('undoChangesBtn').addEventListener('click', undoLastAction);
  document.getElementById('deleteBoatBtn').addEventListener('click', deleteBoat);
  document.getElementById('boatProgress').addEventListener('input', function() {
    document.getElementById('progressValue').textContent = this.value + '%';
    var bar = document.getElementById('progressBar');
    if (bar) {
      bar.style.width = this.value + '%';
      bar.setAttribute('aria-valuenow', this.value);
    }
  });
  document.querySelectorAll('#boatModal [data-dismiss="modal"], #boatModal [data-bs-dismiss="modal"]').forEach(btn => {
    // hideModal foi movido para auxiliar.js
    btn.addEventListener('click', typeof window.hideModal === 'function' ? window.hideModal : () => {});
  });
  const editBtn = document.getElementById('editBoatBtn');
  if (editBtn) editBtn.addEventListener('click', openEditBoatModal);
  const docsBtn = document.getElementById('viewDocsBtn');
  if (docsBtn) docsBtn.addEventListener('click', openBoatDocumentation);
  initializeDragAndDrop();
  initializeCompletedProjectsDragDrop();
  initializePreProjectsDragDrop();
  const createPreBtn = document.getElementById('createPreProjectBtn');
  if (createPreBtn) {
    createPreBtn.addEventListener('click', function() {
      openAddBoatModal();
      document.getElementById('boatModal').dataset.createInPreProject = 'true';
    });
  }
}

/**
 * Executa a inicialização do sistema após o carregamento do DOM.
 */
document.addEventListener('DOMContentLoaded', async function() {
  // Inicializa o sistema de UI
  initializeSystem();
  // Carrega os dados mais recentes
  await fetchOccupancyFromAPI();
  // Renderiza a UI
  loadBoats();
  // Aplica posições salvas localmente (se houver)
  applyPositionsFromStorage();
  // Atualiza contadores
  updateCounters();
  // Define mensagem de status inicial
  setStatusMessage(DEFAULT_STATUS_MESSAGE, 'info', 0);
  // Atualiza estado do botão de desfazer
  updateUndoButtonState();
});


