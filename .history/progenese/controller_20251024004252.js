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

    /**
 * Propósito: Obtém ocupação (vagas ocupadas/livres) do estaleiro.
 * Usa: `estaleiroRequest('listar_ocupacao', {}, 'GET')`.
 * Efeitos: Atualiza mapeamentos como `boatPositions` e contadores.
 * Erros: Trata exceções e mantém UI consistente em falhas.
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
      }
    }

    async function moveBoatInDB(boatIdStr, localNome, numero) {
      const barco_id = parseInt(boatIdStr, 10);
      const payload = { barco_id, local_nome: localNome };
      if (typeof numero !== 'undefined' && numero !== null) payload.numero = parseInt(numero, 10);
      return estaleiroRequest('mover_barco', payload, 'POST');
    }

    // Initialize the system when page loads
    document.addEventListener('DOMContentLoaded', function() {
      const isEstaleiroPage = !!document.querySelector('.boat-slot') || !!document.getElementById('boatModal');
      if (isEstaleiroPage) {
        initializeSystem();
        fetchBoatsFromAPI()
          .then(fetchOccupancyFromAPI)
          .then(() => { loadBoats(); updateCounters(); });
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
        const boat = boats.find(b => b.id === boatId);
        
        if (boat) {
          (async () => {
            try {
              await moveBoatInDB(boat.id, 'Concluídos');
              const boatIndex = boats.findIndex(b => b.id === boatId);
              if (boatIndex > -1) {
                const completedBoat = boats.splice(boatIndex, 1)[0];
                completedBoat.progress = 100;
                completedBoats.push(completedBoat);
                loadBoats();
                updateCounters();
                deselectBoat();
              }
            } catch (e) {
              alert('Falha ao mover para Concluídos: ' + e.message);
            }
          })();
        }
      });
      
      completedContainer.addEventListener('dragleave', function(e) {
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

      if (!modelo || !cliente) {
        alert('Por favor, preencha os campos obrigatórios: Modelo e Nome do Cliente.');
        return;
      }

      (async () => {
        if (currentEditingBoat) {
          try {
            const idNum = parseInt(currentEditingBoat.id, 10);
            await apiRequest('editar_barco', {
              id: idNum,
              numero_serie: codigo,
              cliente_nome: cliente,
              modelo: modelo,
              status_producao: progress
            });
            currentEditingBoat.codigo = codigo;
            currentEditingBoat.modelo = modelo;
            currentEditingBoat.cliente = cliente;
            currentEditingBoat.progress = progress;
          } catch (e) {
            alert('Falha ao editar barco: ' + e.message);
            return;
          }
        } else {
          const modal = document.getElementById('boatModal');
          if (modal.dataset.createInPreProject === 'true') {
            try {
              const created = await apiRequest('criar_barco', { numero_serie: codigo, cliente_nome: cliente, modelo: modelo, status_producao: progress });
              await moveBoatInDB(String(created.id), 'Pré-Projetos');
              const newPreBoat = { id: String(created.id), codigo: created.numero_serie || codigo, modelo: created.modelo, cliente: created.cliente_nome, progress: progress };
              preBoats.push(newPreBoat);
              loadBoats(); updateCounters(); hideModal();
              delete modal.dataset.createInPreProject; delete modal.dataset.preselectedWarehouse; delete modal.dataset.preselectedSlot;
              return;
            } catch (e) {
              alert('Falha ao criar barco em Pré-Projetos: ' + e.message);
              return;
            }
          }

          const preselectedWarehouse = modal.dataset.preselectedWarehouse;
          const preselectedSlot = modal.dataset.preselectedSlot;
          let warehouse, slot;
          if (preselectedWarehouse && preselectedSlot) {
            const targetSlot = document.querySelector(`[data-warehouse="${preselectedWarehouse}"][data-slot="${preselectedSlot}"]`);
            if (targetSlot && !targetSlot.dataset.boatId) {
              warehouse = preselectedWarehouse;
              slot = preselectedSlot;
            }
          }
          if (!warehouse) {
            const availableSlot = findAvailableSlot();
            if (!availableSlot) { alert('Não há vagas disponíveis nos galpões.'); return; }
            warehouse = availableSlot.warehouse; slot = availableSlot.slot;
          }

          try {
            const created = await apiRequest('criar_barco', { numero_serie: codigo, cliente_nome: cliente, modelo: modelo, status_producao: progress });
            const localNome = localKeyToNome(warehouse);
            await moveBoatInDB(String(created.id), localNome, parseInt(slot, 10));
            const newBoat = { id: String(created.id), codigo: created.numero_serie || codigo, modelo: created.modelo, cliente: created.cliente_nome, progress: created.status_producao != null ? Math.round(created.status_producao) : progress, warehouse, slot: parseInt(slot,10), criado_em: created.criado_em };
            boats.push(newBoat);
          } catch (e) {
            alert('Falha ao criar/alocar barco: ' + e.message);
            return;
          }
        }

        loadBoats();
        updateCounters();
        hideModal();
        delete document.getElementById('boatModal').dataset.preselectedWarehouse;
        delete document.getElementById('boatModal').dataset.preselectedSlot;
        delete document.getElementById('boatModal').dataset.createInPreProject;
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
            await moveBoatInDB(currentEditingBoat.id, 'Lixeira');
            let deleted = false;
            let idx = boats.findIndex(b => b.id === currentEditingBoat.id);
            if (idx > -1) { boats.splice(idx, 1); deleted = true; }
            idx = preBoats.findIndex(b => b.id === currentEditingBoat.id);
            if (idx > -1) { preBoats.splice(idx, 1); deleted = true; }
            idx = completedBoats.findIndex(b => b.id === currentEditingBoat.id);
            if (idx > -1) { completedBoats.splice(idx, 1); deleted = true; }
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
      const localNome = localKeyToNome(slot.dataset.warehouse);
      const numero = parseInt(slot.dataset.slot, 10);

      const completedBoat = completedBoats.find(b => b.id === boatId);
      if (completedBoat && !slot.dataset.boatId) {
        const completedIndex = completedBoats.findIndex(b => b.id === boatId);
        if (completedIndex > -1) {
          (async () => {
            try {
              await moveBoatInDB(completedBoats[completedIndex].id, localNome, numero);
              const boat = completedBoats.splice(completedIndex, 1)[0];
              boat.warehouse = slot.dataset.warehouse; boat.slot = numero;
              boats.push(boat);
              loadBoats(); updateCounters();
            } catch (e) {
              alert('Falha ao retornar de Concluídos: ' + e.message);
            }
          })();
        }
        return;
      }

      const preBoat = preBoats.find(b => b.id === boatId);
      if (preBoat && !slot.dataset.boatId) {
        const preIndex = preBoats.findIndex(b => b.id === boatId);
        if (preIndex > -1) {
          (async () => {
            try {
              if (!boats.find(b => b.id === preBoat.id)) {
                const created = await apiRequest('criar_barco', { numero_serie: preBoat.codigo, cliente_nome: preBoat.cliente, modelo: preBoat.modelo, status_producao: preBoat.progress || 0 });
                preBoat.id = String(created.id);
              }
              await moveBoatInDB(preBoat.id, localNome, numero);
              const boat = preBoats.splice(preIndex, 1)[0];
              boat.warehouse = slot.dataset.warehouse; boat.slot = numero;
              boats.push(boat);
              loadBoats(); updateCounters();
            } catch (e) {
              alert('Falha ao mover de Pré-Projetos: ' + e.message);
            }
          })();
        }
        return;
      }

      const boat = boats.find(b => b.id === boatId);
      if (boat && !slot.dataset.boatId) {
        (async () => {
          try {
            await moveBoatInDB(boat.id, localNome, numero);
            boat.warehouse = slot.dataset.warehouse; boat.slot = numero;
            loadBoats();
          } catch (e) {
            alert('Falha ao mover barco: ' + e.message);
          }
        })();
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

    function updateOccupiedCounters() {
      const laminacaoOccupied = boats.filter(b => b.warehouse === 'laminacao').length;
      const montagemOccupied = boats.filter(b => b.warehouse === 'montagem').length;
      const lamEl = document.getElementById('laminacaoOccupied');
      const montEl = document.getElementById('montagemOccupied');
      if (lamEl) lamEl.textContent = laminacaoOccupied;
      if (montEl) montEl.textContent = montagemOccupied;
    }

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
            const moved = boats.splice(idx, 1)[0];
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
          const moved = completedBoats.splice(completedIdx, 1)[0];
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

  
