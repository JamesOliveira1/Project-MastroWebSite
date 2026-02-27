///////////////////////////     estaleiro         ///////////////////////////

    // Global variables
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
    // Undo history management
    let undoStack = [];
    const MAX_UNDO_ACTIONS = 10;
    let isDirty = false;

    function updateUndoButtonState() {
      const btn = document.getElementById('undoChangesBtn');
      if (btn) btn.disabled = undoStack.length === 0;
    }

    function pushUndoAction(boatId, from, to) {
      try {
        undoStack.push({ boatId: String(boatId), from, to, timestamp: Date.now() });
        if (undoStack.length > MAX_UNDO_ACTIONS) undoStack.shift();
        updateUndoButtonState();
      } catch (e) {
        console.warn('[estaleiro] Falha ao registrar undo:', e);
      }
    }

    function getBoatCurrentLocation(boatId) {
      const idStr = String(boatId);
      const bw = boats.find(b => String(b.id) === idStr);
      if (bw && bw.warehouse && bw.slot != null) return { local: bw.warehouse, slot: bw.slot };
      if (preBoats.find(b => String(b.id) === idStr)) return { local: 'preprojetos', slot: null };
      if (completedBoats.find(b => String(b.id) === idStr)) return { local: 'concluidos', slot: null };
      if ((trashBoats || []).find(b => String(b.id) === idStr)) return { local: 'lixeira', slot: null };
      return null;
    }

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
 * Propósito: Envia requisições para a API do Estaleiro.
 * Endpoint base: `ESTALEIRO_API` (api/estaleiro.php).
 * Parâmetros:
 *  - `action`: ação solicitada na API (ex.: listar_ocupacao).
 *  - `payload`: dados adicionais enviados no corpo.
 *  - `method`: método HTTP (GET/POST).
 * Retorno: `json.data` quando disponível; caso contrário, o JSON completo.
 * Erros: lança `Error` com mensagem padronizada quando `ok` é falso.
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
      // Dedupe listas especiais; mantém a primeira ocorrência (Concluídos -> Pré -> Lixeira)
      completedBoats = uniq(completedBoats);
      preBoats = uniq(preBoats);
      trashBoats = uniq(trashBoats);
      // Dedupe a lista principal de boats por id
      const map = new Map();
      boats = (boats || []).filter(b => {
        if (!b || b.id == null) return false;
        const id = String(b.id);
        if (map.has(id)) return false;
        map.set(id, true);
        return true;
      });
      // Exclusividade: se estiver em listas especiais, limpa warehouse/slot no boats
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
 * Propósito: Obtém ocupação (vagas ocupadas/livres) do estaleiro.
 * Usa: `estaleiroRequest('listar_ocupacao', {}, 'GET')`.
 * Efeitos: Atualiza mapeamentos como `boatPositions` e contadores.
 * Erros: Trata exceções e mantém UI consistente em falhas.
 */
async function fetchOccupancyFromAPI() {
  try {
    dedupeBoatLists();

    // Registro unificado de barcos a partir de todas as listas
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

    // Limpa posições antes de aplicar novas
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

    // Atualiza listas finais
    completedBoats = nextCompleted;
    preBoats = nextPre;
    trashBoats = nextTrash;

    // Recalcular boats: todos do registro que não estão em listas especiais
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

    async function moveBoatInDB(boatIdStr, localNome, numero) {
      const barco_id = parseInt(boatIdStr, 10);
      const payload = { barco_id, local_nome: localNome };
      if (typeof numero !== 'undefined' && numero !== null) payload.numero = parseInt(numero, 10);
      return estaleiroRequest('mover_barco', payload, 'POST');
    }

    function setStatusMessage(text, type = 'info', durationMs = 0) {
      const el = document.getElementById('statusBanner');
      if (!el) return;
      const typeMap = {
        success: 'alert-success',
        info: 'alert-info',
        warning: 'alert-warning',
        danger: 'alert-danger',
        error: 'alert-danger',
      };
      const cls = typeMap[type] || 'alert-info';
      el.textContent = text;
      el.classList.remove('alert-info', 'alert-success', 'alert-danger', 'alert-warning');
      el.classList.add('alert', cls);
      if (statusTimer) { try { clearTimeout(statusTimer); } catch (_) {} statusTimer = null; }
      if (durationMs && durationMs > 0) {
        statusTimer = setTimeout(() => {
          el.textContent = DEFAULT_STATUS_MESSAGE;
          el.classList.remove('alert-success', 'alert-danger', 'alert-warning');
          el.classList.add('alert', 'alert-info');
        }, durationMs);
      }
    }

    // Initialize the system when page loads
    document.addEventListener('DOMContentLoaded', function() {
      const isEstaleiroPage = !!document.querySelector('.boat-slot') || !!document.getElementById('boatModal');
      if (isEstaleiroPage) {
        console.log('[estaleiro] DOMContentLoaded on estaleiro page');
        console.log('[estaleiro] boats is array?', Array.isArray(boats));
        initializeEstaleiroSystem();
        // Mensagem inicial (5s) e depois volta ao padrão
        setStatusMessage('Conectado com o banco de dados com sucesso', 'success', 5000);
        fetchBoatsFromAPI()
          .then(fetchOccupancyFromAPI)
          .then(() => { console.log('[estaleiro] initial data loaded'); loadBoats(); updateCounters(); });
      }
    });

    /**
 * Propósito: Envia requisições para a API de Barcos.
 * Endpoint base: `BOATS_API` (api/barcos.php).
 * Parâmetros:
 *  - `action`: ação solicitada na API (ex.: listar).
 *  - `payload`: dados adicionais enviados no corpo.
 *  - `method`: método HTTP (GET/POST).
 * Retorno: `json.data` quando disponível; caso contrário, o JSON completo.
 * Erros: lança `Error` com mensagem padronizada quando `ok` é falso.
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
 * Propósito: Carrega lista de barcos a partir da API.
 * Usa: `apiRequest('listar')` ou endpoint equivalente.
 * Efeitos: Atualiza arrays globais como `boats`, `completedBoats`, `preBoats`.
 * Erros: Registra erro e mantém estado anterior em falhas.
 */
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

    // Initialize drag and drop functionality
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

    // Initialize completed projects drag and drop
    /**
 * Propósito: Habilitar drag-and-drop para área de Concluídos.
 * Casos: mover de galpões para Concluídos com backend `moveBoatInDB`.
 * Efeitos: atualiza `boats` -> `completedBoats`, UI e desseleção.
 * Erros: alerta falhas na movimentação.
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

    // Boat selection functionality
    function selectBoat(boatId) {
      // Seleciona de qualquer lista (galpões, pré-projetos, concluídos)
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

    function deselectBoat() {
      selectedBoat = null;
      document.querySelectorAll('.boat-slot').forEach(slot => {
        slot.classList.remove('selected');
      });
      const panel = document.getElementById('boatSelectionPanel');
      if (panel) panel.style.display = 'none';
    }

    // Modal functions simplificadas (vanilla)
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

    function hideModal() {
      const el = document.getElementById('boatModal');
      el.classList.remove('show');
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }

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

    function openEditBoatModal() {
      if (!selectedBoat) return;
      
      currentEditingBoat = selectedBoat;
      document.getElementById('boatModalLabel').textContent = 'Editar Barco';
      document.getElementById('boatCode').value = selectedBoat.codigo || '';
      document.getElementById('boatModel').value = selectedBoat.modelo || '';
      document.getElementById('clientName').value = selectedBoat.cliente || '';
      // Campo "Última Atividade" removido
      document.getElementById('boatProgress').value = selectedBoat.progress || 0;
      document.getElementById('progressValue').textContent = (selectedBoat.progress || 0) + '%';
      document.getElementById('deleteBoatBtn').style.display = 'inline-block';
      
      showModal();
    }

    function openBoatDocumentation() {
      if (!selectedBoat) return;
      alert('Funcionalidade de documentaÃ§Ã£o serÃ¡ implementada em breve.\n\nBarco: ' + selectedBoat.codigo + ' - ' + selectedBoat.modelo);
    }

    /**
 * Propósito: Cria ou edita um barco via API e atualiza o estado/UI.
 * Fluxos:
 *  - Edição de barco existente (`editar_barco`).
 *  - Criação de novo barco (`criar_barco`) com opção de Pré-Projeto.
 *  - Alocação automática de vaga quando aplicável.
 * Efeitos: atualiza `boats`/`preBoats`, chama `moveBoatInDB`, `loadBoats`, `updateCounters`, `hideModal`.
 * Erros: validação de formulário e tratamento de falhas com alertas.
 */
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

    /**
 * Propósito: Move o barco atual para a Lixeira via backend.
 * Fluxo: confirmação do usuário, chamada `moveBoatInDB`, remoção das listas locais,
 * atualização da UI e desseleção.
 * Erros: alerta falhas ao mover para Lixeira.
 */
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

    // Drag and drop handlers
    function handleDragOver(e) {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    }

    /**
 * Propósito: Processa o drop de cartões em vagas.
 * Casos:
 *  - Retorno de Concluídos para vaga livre.
 *  - Transferência de Pré-Projeto para vaga livre.
 * Efeitos: atualiza arrays `boats`, `completedBoats`, `preBoats`, move no backend via `moveBoatInDB`.
 * Erros: alerta erros de movimentação e preserva estado quando falha.
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

    function handleDragLeave(e) {
      e.currentTarget.classList.remove('drag-over');
    }

    // Utility functions
    /**
 * Propósito: Encontrar a primeira vaga disponível nos galpões.
 * Retorno: objeto `{ warehouse, slot }` ou `null` se não houver vagas.
 * Observação: percorre chaves fixas `laminacao` e `montagem` e slots 1-5.
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

    // Identifica IDs temporários criados em memória antes do salvamento
    function isTempId(id) {
      if (id == null) return false;
      const s = String(id);
      // Marcadores de temporário: prefixo 'tmp_' ou não totalmente numérico
      return s.startsWith('tmp_') || !/^\d+$/.test(s);
    }

    /**
 * Propósito: Renderizar vagas, preencher barcos nos galpões e ativar ícones.
 * Efeitos: atualiza DOM das slots, overlay e habilita drag nos cards.
 * Dependências: usa arrays `boats`, `completedBoats`, `preBoats` e funções auxiliares.
 */
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

    /**
 * Propósito: Atualizar contadores de vagas ocupadas por galpão.
 * Efeitos: escreve valores nos elementos `laminacaoOccupied` e `montagemOccupied`.
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
 * Propósito: Renderizar lista de projetos concluídos com drag e ações.
 * Efeitos: popula container, aplica rolagem condicional e ícones de ação.
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

    /**
 * Propósito: Atualizar contadores gerais (total e concluídos).
 */
function updateCounters() {
      const totalEl = document.getElementById('totalBoats');
      const completedEl = document.getElementById('completedBoats');
      if (totalEl) totalEl.textContent = boats.length;
      if (completedEl) completedEl.textContent = completedBoats.length;
    }

    /**
 * Propósito: Persistir listas `boats`, `completedBoats` e `preBoats` no `localStorage`.
 * Retorno: void.
 */
function saveBoatsToStorage() {
      localStorage.setItem('shipyardBoats', JSON.stringify(boats));
      localStorage.setItem('completedBoats', JSON.stringify(completedBoats));
      localStorage.setItem('preBoats', JSON.stringify(preBoats));
    }

    // Initialize pre-projects drag and drop
    /**
 * Propósito: Habilitar drag-and-drop para área de Pré-Projetos.
 * Casos: mover de galpões ou Concluídos para Pré-Projetos.
 * Efeitos: atualiza arrays locais e UI; usa `saveBoatsToStorage`.
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

    // Render pre-project boats
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
      setStatusMessage('Há novos barcos sem local. Mova para Pré-Projetos, Concluídos, Lixeira ou um galpão antes de salvar.', 'warning');
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
        setStatusMessage(`Erro ao salvar: ${msg}`, 'error');
        return;
      }
    }

    // Deduplicar após criar novos barcos
    dedupeBoatLists();

    const payload = buildOccupancyPayload();
    const ok = await estaleiroRequest('salvar_ocupacao', { ocupacoes: payload }, 'POST');
    setStatusMessage('Alterações salvas com sucesso.', 'success');
    await fetchOccupancyFromAPI();
    applyPositionsFromStorage();
    updateCounters();
  } catch (e) {
    console.error('Erro ao salvar ocupação:', e);
    const msg = (e && e.message) ? e.message : 'Erro ao salvar';
    setStatusMessage(`Erro ao salvar: ${msg}`, 'error');
  }
}

  
