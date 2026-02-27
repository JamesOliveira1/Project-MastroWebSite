// ============================================================================
// CONTROLLER.JS - Sistema de Gerenciamento do Estaleiro
// ============================================================================

// ============================================================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÃO
// ============================================================================

let boats = [];
let completedBoats = JSON.parse(localStorage.getItem('completedBoats')) || [];
let preBoats = JSON.parse(localStorage.getItem('preBoats')) || [];
let trashBoats = JSON.parse(localStorage.getItem('trashBoats')) || [];
let currentEditingBoat = null;
let selectedBoat = null;
let boatPositions = JSON.parse(localStorage.getItem('boatPositions')) || {};
const BOATS_API = 'api/barcos.php';
const ESTALEIRO_API = 'api/estaleiro.php';
const DEFAULT_STATUS_MESSAGE = 'Arraste os barcos entre as vagas para reorganizar. Clique sobre um barco para editar e ver mais detalhes.';
let statusTimer = null;

console.log('[controller.js] loaded');

let undoStack = [];
const MAX_UNDO_ACTIONS = 10;
let isDirty = false;

// ============================================================================
// SISTEMA DE UNDO/REDO
// ============================================================================

// Atualiza estado visual do botão de desfazer
function updateUndoButtonState() {
  const btn = document.getElementById('undoChangesBtn');
  if (btn) btn.disabled = undoStack.length === 0;
}

// Registra ação para desfazer com limite de histórico
function pushUndoAction(boatId, from, to) {
  undoStack.push({ boatId, from, to, timestamp: Date.now() });
  if (undoStack.length > MAX_UNDO_ACTIONS) {
    undoStack.shift();
  }
  updateUndoButtonState();
}

// Obtém localização atual de um barco em qualquer lista
function getBoatCurrentLocation(boatId) {
  const boat = boats.find(b => b.id === boatId);
  if (boat) return { local: boat.warehouse, slot: boat.slot };
  if (completedBoats.find(b => b.id === boatId)) return { local: 'concluidos', slot: null };
  if (preBoats.find(b => b.id === boatId)) return { local: 'preprojetos', slot: null };
  return null;
}

// Move barco para destino especificado entre listas
function moveBoatToLocation(boatId, dest) {
  let boat = null;
  let sourceArray = null;
  let sourceIndex = -1;
  
  [boats, completedBoats, preBoats].forEach(arr => {
    const idx = arr.findIndex(b => b.id === boatId);
    if (idx > -1) {
      boat = arr[idx];
      sourceArray = arr;
      sourceIndex = idx;
    }
  });
  
  if (!boat || sourceIndex === -1) return false;
  
  sourceArray.splice(sourceIndex, 1);
  
  if (dest.local === 'concluidos') {
    boat.progress = 100;
    delete boat.warehouse;
    delete boat.slot;
    completedBoats.push(boat);
  } else if (dest.local === 'preprojetos') {
    delete boat.warehouse;
    delete boat.slot;
    preBoats.push(boat);
  } else {
    boat.warehouse = dest.local;
    boat.slot = dest.slot;
    boats.push(boat);
  }
  return true;
}

// Desfaz última ação registrada no histórico
function undoLastAction() {
  if (undoStack.length === 0) return;
  const action = undoStack.pop();
  const success = moveBoatToLocation(action.boatId, action.from);
  if (success) {
    saveBoatsToStorage();
    loadBoats();
    updateCounters();
    updateUndoButtonState();
  }
}

// ============================================================================
// FUNÇÕES DE API
// ============================================================================

// Requisição genérica para API do estaleiro
async function estaleiroRequest(action, payload = {}, method = 'POST') {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (method !== 'GET') opts.body = JSON.stringify({ action, ...payload });
  const res = await fetch(ESTALEIRO_API, opts);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Erro na API do estaleiro');
  return json.data ?? json;
}

// Converte chave local para nome da API
function localKeyToNome(key) {
  const map = { laminacao: 'Laminação', montagem: 'Montagem' };
  return map[key] || key;
}

// Converte nome da API para chave local
function nomeToLocalKey(nome) {
  const map = { 'Laminação': 'laminacao', 'Montagem': 'montagem' };
  return map[nome] || nome.toLowerCase();
}

// Remove duplicatas entre listas de barcos
function dedupeBoatLists() {
  const seen = new Set();
  [boats, completedBoats, preBoats, trashBoats].forEach(arr => {
    if (!Array.isArray(arr)) return;
    for (let i = arr.length - 1; i >= 0; i--) {
      const boat = arr[i];
      if (!boat || !boat.id) {
        arr.splice(i, 1);
        continue;
      }
      const key = String(boat.id);
      if (seen.has(key)) {
        console.warn('[dedupeBoatLists] Removendo duplicata:', boat);
        arr.splice(i, 1);
      } else {
        seen.add(key);
      }
    }
  });
}

// Carrega ocupação das vagas da API
async function fetchOccupancyFromAPI() {
  try {
    const resp = await estaleiroRequest('listar_ocupacao', {}, 'GET');
    const data = Array.isArray(resp) ? resp : (resp?.data || []);
    
    boats = [];
    completedBoats = [];
    preBoats = [];
    trashBoats = [];
    
    data.forEach(item => {
      if (!item?.barco_id) return;
      
      const boat = {
        id: String(item.barco_id),
        codigo: item.numero_serie || '',
        modelo: item.modelo || '',
        cliente: item.cliente_nome || '',
        progress: item.status_producao != null ? Math.round(item.status_producao) : 0,
        criado_em: item.criado_em || ''
      };
      
      const localNome = item.local_nome || '';
      if (localNome === 'Concluídos') {
        boat.progress = 100;
        completedBoats.push(boat);
      } else if (localNome === 'Pré-Projetos') {
        preBoats.push(boat);
      } else if (localNome === 'Lixeira') {
        trashBoats.push(boat);
      } else if (['Laminação', 'Montagem'].includes(localNome)) {
        boat.warehouse = nomeToLocalKey(localNome);
        boat.slot = item.numero || 1;
        boats.push(boat);
      }
    });
    
    saveBoatsToStorage();
  } catch (e) {
    console.error('Falha ao carregar ocupação da API:', e);
  }
}

// Move barco no banco de dados
async function moveBoatInDB(boatIdStr, localNome, numero) {
  const payload = { barco_id: parseInt(boatIdStr, 10), local_nome: localNome };
  if (numero != null) payload.numero = parseInt(numero, 10);
  return await estaleiroRequest('mover_barco', payload, 'POST');
}

// Define mensagem de status temporária
function setStatusMessage(text, type = 'info', durationMs = 0) {
  const banner = document.getElementById('statusBanner');
  if (!banner) return;
  
  if (statusTimer) {
    clearTimeout(statusTimer);
    statusTimer = null;
  }
  
  banner.className = `alert alert-${type} mb-3`;
  banner.textContent = text;
  banner.style.display = 'block';
  
  if (durationMs > 0) {
    statusTimer = setTimeout(() => {
      banner.textContent = DEFAULT_STATUS_MESSAGE;
      banner.className = 'alert alert-info mb-3';
      statusTimer = null;
    }, durationMs);
  }
}

// Requisição genérica para API de barcos
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

// Carrega lista de barcos da API
async function fetchBoatsFromAPI() {
  try {
    const resp = await apiRequest('listar', {}, 'GET');
    const data = Array.isArray(resp) ? resp : (resp && resp.data ? resp.data : []);
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
  }
}

// ============================================================================
// GERENCIAMENTO DE POSIÇÕES/STORAGE
// ============================================================================

// Obtém mapa de posições do localStorage
function getPositionsMap() {
  try { return JSON.parse(localStorage.getItem('boatPositions')) || {}; } catch (e) { return {}; }
}

// Salva mapa de posições no localStorage
function savePositionsMap(map) {
  localStorage.setItem('boatPositions', JSON.stringify(map));
  boatPositions = map;
}

// Aplica posições salvas aos barcos
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

// Garante que todos os barcos tenham posições atribuídas
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

// ============================================================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================================================

// Inicialização principal do sistema
document.addEventListener('DOMContentLoaded', function() {
  console.log('[estaleiro] DOM loaded, initializing...');
  (async () => {
    try {
      await fetchBoatsFromAPI();
      await fetchOccupancyFromAPI();
      applyPositionsFromStorage();
      ensurePositionsAssigned();
      initializeEstaleiroSystem();
      loadBoats();
      updateCounters();
    } catch (e) {
      console.error('[estaleiro] Initialization failed:', e);
    }
  })();
});

// Inicializa listeners e componentes do sistema
function initializeEstaleiroSystem() {
  console.log('[estaleiro] Initializing system');
  
  // Modal save button
  document.getElementById('saveBoatBtn').addEventListener('click', saveBoat);
  
  // Modal delete button
  document.getElementById('deleteBoatBtn').addEventListener('click', deleteBoat);
  
  // Progress slider
  document.getElementById('boatProgress').addEventListener('input', function() {
    document.getElementById('progressValue').textContent = this.value + '%';
    var bar = document.getElementById('progressBar');
    if (bar) {
      bar.style.width = this.value + '%';
      bar.setAttribute('aria-valuenow', this.value);
    }
  });

  // Fallback for cancel/close buttons when Bootstrap data-api is not active
  document.querySelectorAll('#boatModal [data-dismiss="modal"], #boatModal [data-bs-dismiss="modal"]').forEach(btn => {
    btn.addEventListener('click', hideModal);
  });

  // Selection panel buttons
  const editBtn = document.getElementById('editBoatBtn');
  if (editBtn) editBtn.addEventListener('click', openEditBoatModal);
  const docsBtn = document.getElementById('viewDocsBtn');
  if (docsBtn) docsBtn.addEventListener('click', openBoatDocumentation);

  // Page actions
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  if (saveChangesBtn) {
    console.log('[estaleiro] Binding save button click');
    saveChangesBtn.addEventListener('click', function() {
      console.log('[estaleiro] Save button clicked');
      saveOccupancy();
    });
  } else {
    console.warn('[estaleiro] saveChangesBtn not found');
  }

  const undoBtn = document.getElementById('undoChangesBtn');
  if (undoBtn) {
    undoBtn.addEventListener('click', undoLastAction);
    updateUndoButtonState();
  } else {
    console.warn('[estaleiro] undoChangesBtn not found');
  }

  const refreshBtn = document.getElementById('refreshDataBtn');
  if (refreshBtn) {
    console.log('[estaleiro] Binding refresh button click');
    refreshBtn.addEventListener('click', async function() {
      try {
        // Descartar alterações não salvas
        undoStack = [];
        isDirty = false;
        updateUndoButtonState();
        selectedBoat = null;
        currentEditingBoat = null;

        setStatusMessage('Atualizando dados do sistema...', 'info');

        await fetchBoatsFromAPI();
        await fetchOccupancyFromAPI();
        loadBoats();
        updateCounters();

        setStatusMessage('Sistema de vagas e barcos atualizado com sucesso', 'success', 5000);
      } catch (e) {
        console.error('[estaleiro] refresh failed', e);
        setStatusMessage('Falha ao atualizar dados do sistema', 'danger', 5000);
      }
    });
  } else {
    console.warn('[estaleiro] refreshDataBtn not found');
  }

  // Initialize drag and drop for all slots
  initializeDragAndDrop();
  
  // Initialize completed projects drag and drop
  initializeCompletedProjectsDragDrop();

  // Initialize pre-projects drag and drop
  initializePreProjectsDragDrop();

  // Hook Pre-projects create button
  const createPreBtn = document.getElementById('createPreProjectBtn');
  if (createPreBtn) {
    createPreBtn.addEventListener('click', function() {
      openAddBoatModal();
      document.getElementById('boatModal').dataset.createInPreProject = 'true';
    });
  }
}

// ============================================================================
// DRAG & DROP
// ============================================================================

// Inicializa funcionalidade de drag and drop
function initializeDragAndDrop() {
  const slots = document.querySelectorAll('.boat-slot');
  
  slots.forEach(slot => {
    // Click event for slots
    slot.addEventListener('click', function(e) {
      e.stopPropagation();
      const boatId = this.dataset.boatId;
      if (boatId) {
        selectBoat(boatId);
      } else {
        openAddBoatModal(this.dataset.warehouse, this.dataset.slot);
      }
    });

    // Drag and drop events
    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('drop', handleDrop);
    slot.addEventListener('dragleave', handleDragLeave);
  });

  // Click outside to deselect
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.boat-slot') && !e.target.closest('.boat-selection-panel')) {
      deselectBoat();
    }
  });
}

// Habilita drag-and-drop para área de Concluídos
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
    // Novo: permitir mover de Pré-Projetos para Concluídos
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

// Habilita drag-and-drop para área de Pré-Projetos
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
    
    // Move from warehouse to pre-projects
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
    
    // Move from completed to pre-projects
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

// ============================================================================
// SELEÇÃO E MODAIS
// ============================================================================

// Seleciona barco de qualquer lista
function selectBoat(boatId) {
  const boat = boats.find(b => b.id === boatId) || preBoats.find(b => b.id === boatId) || completedBoats.find(b => b.id === boatId);
  if (!boat) return;

  selectedBoat = boat;
  
  // Remove seleção anterior nos galpões
  document.querySelectorAll('.boat-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  
  // Adiciona destaque apenas se estiver em vaga
  const slot = document.querySelector(`[data-boat-id="${boatId}"]`);
  if (slot) {
    slot.classList.add('selected');
  }
  
  // Painel de seleção não é mais exibido
  const panel = document.getElementById('boatSelectionPanel');
  if (panel) panel.style.display = 'none';
}

// Remove seleção atual
function deselectBoat() {
  selectedBoat = null;
  document.querySelectorAll('.boat-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  const panel = document.getElementById('boatSelectionPanel');
  if (panel) panel.style.display = 'none';
}

// Exibe modal usando vanilla JavaScript
function showModal() {
  const el = document.getElementById('boatModal');
  el.classList.add('show');
  el.style.display = 'block';
  el.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  let backdrop = document.querySelector('.modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    document.body.appendChild(backdrop);
  }
}

// Oculta modal usando vanilla JavaScript
function hideModal() {
  const el = document.getElementById('boatModal');
  el.classList.remove('show');
  el.style.display = 'none';
  el.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
}

// ============================================================================
// CRUD DE BARCOS
// ============================================================================

// Abre modal para adicionar novo barco
function openAddBoatModal(warehouse = null, slot = null) {
  currentEditingBoat = null;
  document.getElementById('boatModalLabel').textContent = 'Adicionar Novo Barco';
  document.getElementById('boatForm').reset();
  document.getElementById('progressValue').textContent = '0%';
  document.getElementById('deleteBoatBtn').style.display = 'none';
  
  // Store preselected slot
  if (warehouse && slot) {
    document.getElementById('boatModal').dataset.preselectedWarehouse = warehouse;
    document.getElementById('boatModal').dataset.preselectedSlot = slot;
  }
  
  showModal();
}

// Abre modal para editar barco selecionado
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

// Abre documentação do barco (placeholder)
function openBoatDocumentation() {
  if (!selectedBoat) return;
  alert('Funcionalidade de documentação será implementada em breve.\n\nBarco: ' + selectedBoat.codigo + ' - ' + selectedBoat.modelo);
}

// Cria ou edita barco via API e atualiza estado/UI
function saveBoat() {
  const codigo = document.getElementById('boatCode').value.trim();
  const modelo = document.getElementById('boatModel').value.trim();
  const cliente = document.getElementById('clientName').value.trim();
  const progress = parseInt(document.getElementById('boatProgress').value);
  if (!modelo || !cliente) { alert('Por favor, preencha os campos obrigatórios: Modelo e Nome do Cliente.'); return; }
  (async () => {
    if (currentEditingBoat) {
      // Edição: manter apenas em memória até clicar em Salvar geral
      currentEditingBoat.codigo = codigo;
      currentEditingBoat.modelo = modelo;
      currentEditingBoat.cliente = cliente;
      currentEditingBoat.progress = progress;
      hideModal();
      loadBoats();
      updateCounters();
    } else {
      // Criação: criar barco temporário em memória; persistir somente no Salvar geral
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
        // limpar flag
        delete document.getElementById('boatModal').dataset.createInPreProject;
      } else if (preselectedWarehouse && preselectedSlot) {
        newBoat.warehouse = preselectedWarehouse;
        newBoat.slot = parseInt(preselectedSlot, 10);
        boats.push(newBoat);
        // limpar seleção
        delete document.getElementById('boatModal').dataset.preselectedWarehouse;
        delete document.getElementById('boatModal').dataset.preselectedSlot;
      } else {
        // Se nenhuma vaga preselecionada, adiciona aos pré-projetos por padrão
        preBoats.push({ id: newBoat.id, codigo: newBoat.codigo, modelo: newBoat.modelo, cliente: newBoat.cliente, progress: newBoat.progress, isNew: true });
      }
      hideModal();
      loadBoats();
      updateCounters();
    }
  })();
}

// Move barco atual para Lixeira via backend
function deleteBoat() {
  if (!currentEditingBoat) return;
  if (confirm('Tem certeza que deseja enviar este barco para a Lixeira?')) {
    (async () => {
      try {
        // Não grava no banco aqui; apenas atualiza o estado em memória
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
        alert('Falha ao mover para Lixeira: ' + e.message);
      }
    })();
  }
}

// ============================================================================
// HANDLERS DE EVENTOS
// ============================================================================

// Handler para dragover em slots
function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

// Processa drop de cartões em vagas
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

// Handler para dragleave em slots
function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

// Encontra primeira vaga disponível nos galpões
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

// Identifica IDs temporários criados em memória
function isTempId(id) {
  if (id == null) return false;
  const s = String(id);
  return s.startsWith('tmp_') || !/^\d+$/.test(s);
}

// ============================================================================
// RENDERIZAÇÃO DA UI
// ============================================================================

// Renderiza vagas e preenche barcos nos galpões
function loadBoats() {
  // Clear all slots first
  document.querySelectorAll('.boat-slot').forEach(slot => {
    slot.classList.remove('occupied', 'selected');
    slot.removeAttribute('data-boat-id');
    slot.removeAttribute('draggable');
    // Mostrar número da vaga acima do botão de adicionar
    slot.innerHTML = `<div class="slot-number">Vaga ${slot.dataset.slot}</div><div class="slot-content"><i class="bi bi-plus-circle add-icon"></i><span>Clique para adicionar</span></div>`;
  });

  // Load boats into slots
  boats.forEach(boat => {
    const slot = document.querySelector(`[data-warehouse="${boat.warehouse}"][data-slot="${boat.slot}"]`);
    if (slot) {
      slot.classList.add('occupied');
      slot.dataset.boatId = boat.id;
      slot.draggable = true;
      
      // Add drag events
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

      // Eventos dos botões do overlay (evitar propagação para seleção errada)
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

  // Update occupied slot counters
  updateOccupiedCounters();
  
  // Load completed boats
  loadCompletedBoats();
  
  // Load pre-project boats
  loadPreBoats();
}

// Atualiza contadores de vagas ocupadas por galpão
function updateOccupiedCounters() {
  const laminacaoOccupied = boats.filter(b => b.warehouse === 'laminacao').length;
  const montagemOccupied = boats.filter(b => b.warehouse === 'montagem').length;
  const lamEl = document.getElementById('laminacaoOccupied');
  const montEl = document.getElementById('montagemOccupied');
  if (lamEl) lamEl.textContent = laminacaoOccupied;
  if (montEl) montEl.textContent = montagemOccupied;
}

// Renderiza lista de projetos concluídos
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
    
    // Habilitar rolagem quando houver mais de 4 cartões
    const cardCountCompleted = container.querySelectorAll('.completed-boat').length;
    if (cardCountCompleted > 4) { container.classList.add('scrollable'); } else { container.classList.remove('scrollable'); }
    
    // Eventos: drag e cliques nos ícones
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

// Renderiza lista de pré-projetos
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
    // Remover rolagem quando vazio
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
    
    // Habilitar rolagem quando houver mais de 4 cartões
    const cardCountPre = container.querySelectorAll('.pre-boat').length;
    if (cardCountPre > 4) { container.classList.add('scrollable'); } else { container.classList.remove('scrollable'); }
    
    // Eventos: drag e cliques nos ícones
    container.querySelectorAll('.pre-boat').forEach(preBoatEl => {
      preBoatEl.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', this.dataset.boatId);
        this.classList.add('dragging');
      });
      preBoatEl.addEventListener('dragend', function() {
        this.classList.remove('dragging');
      });
      // Ícones de ação
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

// Atualiza contadores gerais
function updateCounters() {
  const totalEl = document.getElementById('totalBoats');
  const completedEl = document.getElementById('completedBoats');
  if (totalEl) totalEl.textContent = boats.length;
  if (completedEl) completedEl.textContent = completedBoats.length;
}

// Persiste listas no localStorage
function saveBoatsToStorage() {
  localStorage.setItem('shipyardBoats', JSON.stringify(boats));
  localStorage.setItem('completedBoats', JSON.stringify(completedBoats));
  localStorage.setItem('preBoats', JSON.stringify(preBoats));
}

// ============================================================================
// PERSISTÊNCIA DE DADOS
// ============================================================================

// Constrói payload para salvar ocupação
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

// Salva ocupação e novos barcos na API
async function saveOccupancy() {
  console.log('[estaleiro] saveOccupancy called');
  try {
    // Deduplicar antes de processar
    dedupeBoatLists();

    // Validar: novos barcos devem estar em algum local (galpão OU locais especiais)
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
    // Criar somente os novos válidos (com local definido)
    for (const b of allNew) {
      try {
        const created = await apiRequest('criar_barco', { numero_serie: b.codigo || '', cliente_nome: b.cliente || '', modelo: b.modelo || '', status_producao: b.progress || 0 }, 'POST');
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

    // Deduplicar após criar novos barcos
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