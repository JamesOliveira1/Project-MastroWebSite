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
    document.addEventListener('DOMContentLoaded', function() {
      const isEstaleiroPage = !!document.querySelector('.boat-slot') || !!document.getElementById('boatModal');
      if (isEstaleiroPage) {
        initializeSystem();
        fetchBoatsFromAPI()
          .then(fetchOccupancyFromAPI)
          .then(() => { loadBoats(); updateCounters(); });
      }
    });

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
    
    // UI modal helpers (fallback if Bootstrap JS is unavailable)
    function hideModal(modalId) {
      const modalEl = document.getElementById(modalId);
      if (!modalEl) return;
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }

    function showModal(modalId) {
      const modalEl = document.getElementById(modalId);
      if (!modalEl) return;
      modalEl.classList.add('show');
      modalEl.style.display = 'block';
      if (!document.querySelector('.modal-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.right = '0';
        backdrop.style.bottom = '0';
        backdrop.style.background = 'rgba(0,0,0,0.5)';
        backdrop.style.zIndex = '1040';
        document.body.appendChild(backdrop);
      }
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
                completedBoat.completedDate = new Date().toLocaleDateString('pt-BR');
                completedBoats.push(completedBoat);
                loadBoats();
                updateCounters();
                deselectBoat();
              }
            } catch (e) {
              alert('Falha ao mover para Concluídos: ' + e.message);
            }
          })();
          return;
        }
        
        // Permitir mover de Pré-Projetos para Concluídos
        const preIdx = preBoats.findIndex(b => b.id === boatId);
        if (preIdx > -1) {
          (async () => {
            try {
              let preBoat = preBoats[preIdx];
              const idNum = parseInt(preBoat.id, 10);
              if (isNaN(idNum) || idNum <= 0) {
                const created = await apiRequest('criar_barco', {
                  numero_serie: preBoat.codigo,
                  cliente_nome: preBoat.cliente,
                  modelo: preBoat.modelo,
                  status_producao: 100
                });
                preBoat.id = String(created.id);
              }
              await moveBoatInDB(preBoat.id, 'Concluídos');
              const moved = preBoats.splice(preIdx, 1)[0];
              moved.progress = 100;
              moved.completedDate = new Date().toLocaleDateString('pt-BR');
              completedBoats.push(moved);
              loadBoats();
              updateCounters();
              deselectBoat();
            } catch (e) {
              alert('Falha ao mover de Pré-Projetos para Concluídos: ' + e.message);
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
      let boat = boats.find(b => b.id === boatId);
      if (!boat) boat = preBoats.find(b => b.id === boatId) || completedBoats.find(b => b.id === boatId);
      if (!boat) return;

      selectedBoat = boat;
      
      // Remover seleção em slots (aplica apenas a barcos alocados)
      document.querySelectorAll('.boat-slot').forEach(slot => {
        slot.classList.remove('selected');
      });
      
      const slot = document.querySelector(`[data-boat-id="${boatId}"]`);
      if (slot) {
        slot.classList.add('selected');
      }
      
      // Exibir/ocultar painel conforme necessário
      showSelectionPanel(boat);
    }

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
            if (isNaN(idNum) || idNum <= 0) {
              // Pré-projeto sem ID no banco: criar e manter em Pré-Projetos
              const created = await apiRequest('criar_barco', {
                numero_serie: codigo,
                cliente_nome: cliente,
                modelo: modelo,
                status_producao: progress
              });
              await moveBoatInDB(String(created.id), 'Pré-Projetos');
              currentEditingBoat.id = String(created.id);
            } else {
              await apiRequest('editar_barco', {
                id: idNum,
                numero_serie: codigo,
                cliente_nome: cliente,
                modelo: modelo,
                status_producao: progress
              });
            }
            currentEditingBoat.codigo = codigo;
            currentEditingBoat.modelo = modelo;
            currentEditingBoat.cliente = cliente;
            currentEditingBoat.progress = progress;
          } catch (e) {
            alert('Falha ao salvar alterações: ' + e.message);
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
            (async () => {
              try {
                await moveBoatInDB(boatFromWarehouse.id, 'Pré-Projetos');
                const moved = boats.splice(idx, 1)[0];
                delete moved.warehouse;
                delete moved.slot;
                preBoats.push(moved);
                saveBoatsToStorage();
                loadBoats();
                updateCounters();
                deselectBoat();
              } catch (e) {
                alert('Falha ao mover para Pré-Projetos: ' + e.message);
              }
            })();
          }
          return;
        }
        
        // Move from completed to pre-projects
        const completedIdx = completedBoats.findIndex(b => b.id === boatId);
        if (completedIdx > -1) {
          (async () => {
            try {
              const moved = completedBoats.splice(completedIdx, 1)[0];
              delete moved.completedDate;
              await moveBoatInDB(moved.id, 'Pré-Projetos');
              preBoats.push(moved);
              saveBoatsToStorage();
              loadBoats();
              updateCounters();
            } catch (e) {
              alert('Falha ao mover de Concluídos para Pré-Projetos: ' + e.message);
            }
          })();
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
            <p>Nenhum prÃ©-projeto ainda</p>
          </div>
        `;
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

    // Add some sample data for demonstration
    function addSampleData() {
      if (boats.length === 0 && completedBoats.length === 0) {
        boats.push({
          id: 'boat_sample1',
          codigo: 'PG-001',
          modelo: 'Lancha Esportiva 25\'',
          cliente: 'JoÃ£o Silva',
          ultimaAtividade: 'AplicaÃ§Ã£o de fibra de vidro no casco',
          progress: 65,
          warehouse: 'laminacao',
          slot: 1,
          createdDate: new Date().toLocaleDateString('pt-BR')
        });

        boats.push({
          id: 'boat_sample2',
          codigo: 'PG-002',
          modelo: 'Barco de Pesca 30\'',
          cliente: 'Marina Santos',
          ultimaAtividade: 'InstalaÃ§Ã£o de equipamentos eletrÃ´nicos',
          progress: 85,
          warehouse: 'montagem',
          slot: 3,
          createdDate: new Date().toLocaleDateString('pt-BR')
        });

        completedBoats.push({
          id: 'boat_completed1',
          codigo: 'PG-000',
          modelo: 'Iate de Luxo 40\'',
          cliente: 'Carlos Mendes',
          ultimaAtividade: 'Entrega final ao cliente',
          progress: 100,
          createdDate: '15/01/2025',
          completedDate: '20/01/2025'
        });

        saveBoatsToStorage();
        loadBoats();
        updateCounters();
      }
    }

    // Uncomment the line below to add sample data for testing
    if (document.querySelector('.boat-slot')) {
      addSampleData();
    }
  
// ===== JS migrado de barco.html ===== //

    document.addEventListener('DOMContentLoaded', function() {
      try {
        const table = document.getElementById('inventario-table');
        if (!table) return;
        const tbody = table.querySelector('tbody');

        // Clique na linha inteira para abrir o modal de ediÃƒÂ§ÃƒÂ£o
        tbody.querySelectorAll('tr.inventario-row').forEach(function(row) {
          row.addEventListener('click', function() {
            const editModalEl = document.getElementById('modalEditInventario');
            if (typeof bootstrap !== 'undefined' && editModalEl) {
              const modal = new bootstrap.Modal(editModalEl);
              modal.show();
            }
          });
        });

        // OrdenaÃƒÂ§ÃƒÂ£o por cabeÃƒÂ§alho clicÃƒÂ¡vel
        const sortState = {};
        const ths = table.querySelectorAll('thead th[data-sort-key]');
        ths.forEach(function(th, idx) {
          th.addEventListener('click', function() {
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const dir = sortState[idx] === 'asc' ? 'desc' : 'asc';
            sortState[idx] = dir;

            const parseDate = function(s) {
              const m = s.match(/^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/);
              if (!m) return null;
              return new Date(+m[3], +m[2]-1, +m[1]).getTime();
            };

            rows.sort(function(a, b) {
              const va = a.children[idx].innerText.trim();
              const vb = b.children[idx].innerText.trim();

              // Tentar numÃƒÂ©rico
              const na = parseFloat(va.replace(',', '.'));
              const nb = parseFloat(vb.replace(',', '.'));
              const aIsNum = !isNaN(na) && va !== '';
              const bIsNum = !isNaN(nb) && vb !== '';
              if (aIsNum && bIsNum) {
                return dir === 'asc' ? na - nb : nb - na;
              }

              // Tentar data formato DD/MM/AAAA
              const ta = parseDate(va);
              const tb = parseDate(vb);
              if (ta && tb) {
                return dir === 'asc' ? ta - tb : tb - ta;
              }

              // Fallback: string
              return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            });

            // Reaplicar ordem
            rows.forEach(function(r) { tbody.appendChild(r); });
          });
        });
      } catch (e) {
        // Evita que erros externos interrompam os scripts locais
        console.warn('InventÃƒÂ¡rio scripts warning:', e);
      }
    });
  



// ===== UI e DnD helpers inseridos =====
function updateCounters() {
  const slots = Array.from(document.querySelectorAll('.boat-slot'));
  const laminacaoCount = slots.filter(s => s.dataset.warehouse === 'laminacao' && s.dataset.boatId).length;
  const montagemCount = slots.filter(s => s.dataset.warehouse === 'montagem' && s.dataset.boatId).length;
  const completedCount = Array.isArray(completedBoats) ? completedBoats.length : 0;
  const preCount = Array.isArray(preBoats) ? preBoats.length : 0;
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val); };
  setText('warehouseCountLaminacao', laminacaoCount);
  setText('warehouseCountMontagem', montagemCount);
  setText('completedCount', completedCount);
  setText('preCount', preCount);
}

function renderCompletedBoats() {
  const container = document.getElementById('completedBoatsContainer');
  if (!container) return;
  container.innerHTML = '';
  (completedBoats || []).forEach(b => {
    const item = document.createElement('div');
    item.className = 'completed-boat-item';
    item.textContent = (b.codigo || b.modelo || b.id || '').toString();
    container.appendChild(item);
  });
}

function loadBoats() {
  // Função minimalista para evitar erros de referência
  try { updateCounters(); renderCompletedBoats(); } catch(e) { console.warn('loadBoats warn:', e); }
}

function deselectBoat() {
  try {
    selectedBoat = null;
    document.querySelectorAll('.boat-slot.selected').forEach(el => el.classList.remove('selected'));
    const panel = document.querySelector('.boat-selection-panel');
    if (panel) panel.classList.add('d-none');
  } catch(e) { /* noop */ }
}

function showSelectionPanel(boat) {
  const panel = document.querySelector('.boat-selection-panel');
  if (!panel) return;
  panel.classList.remove('d-none');
  const title = panel.querySelector('.boat-selection-title');
  if (title) title.textContent = boat ? (boat.codigo || boat.modelo || boat.id || 'Barco') : 'Barco';
}

function openEditBoatModal(boatId) {
  const boat = (boats || []).find(b => b.id === boatId) || (preBoats || []).find(b => b.id === boatId) || (completedBoats || []).find(b => b.id === boatId);
  if (!boat) return;
  selectedBoat = boat;
  currentEditingBoat = boat;
  const codigoEl = document.getElementById('boatCodigo');
  const modeloEl = document.getElementById('boatModelo');
  if (codigoEl) codigoEl.value = boat.codigo || '';
  if (modeloEl) modeloEl.value = boat.modelo || '';
  showModal('boatModal');
}

function openAddBoatModal(warehouse, slot) {
  selectedBoat = null;
  currentEditingBoat = null;
  const codigoEl = document.getElementById('boatCodigo');
  const modeloEl = document.getElementById('boatModelo');
  if (codigoEl) codigoEl.value = '';
  if (modeloEl) modeloEl.value = '';
  const modalEl = document.getElementById('boatModal');
  if (modalEl) {
    modalEl.dataset.warehouse = warehouse || '';
    modalEl.dataset.slot = slot || '';
  }
  showModal('boatModal');
}

function openBoatDocumentation(boatId) {
  const boat = (boats || []).find(b => b.id === boatId) || (preBoats || []).find(b => b.id === boatId) || (completedBoats || []).find(b => b.id === boatId);
  if (!boat) return;
  if (boat.docUrl) { window.open(boat.docUrl, '_blank'); } else { alert('Sem documentação vinculada.'); }
}

function findAvailableSlot(warehouse) {
  const slots = Array.from(document.querySelectorAll('.boat-slot'));
  const empty = slots.find(s => s.dataset.warehouse === warehouse && !s.dataset.boatId);
  return empty ? { warehouse: warehouse, slot: empty.dataset.slot, element: empty } : null;
}

function handleDragOver(e) { e.preventDefault(); this.classList.add('drag-over'); }
function handleDragLeave(e) { this.classList.remove('drag-over'); }

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  const boatId = e.dataTransfer.getData('text/plain');
  if (!boatId) return;
  const targetWarehouse = this.dataset.warehouse;
  const targetSlot = parseInt(this.dataset.slot || '0', 10);
  const map = { laminacao: 'Laminação', montagem: 'Montagem' };
  const localNome = map[targetWarehouse] || targetWarehouse || 'Montagem';
  const boat = (boats || []).find(b => b.id === boatId) || (preBoats || []).find(b => b.id === boatId) || (completedBoats || []).find(b => b.id === boatId);
  if (!boat) return;
  (async () => {
    try {
      await moveBoatInDB(boat.id, localNome, targetSlot);
      this.dataset.boatId = boat.id;
      boat.local = localNome;
      boat.slot = targetSlot;
      // Se veio de concluídos ou pré-projetos, reequilibrar arrays
      let idx = completedBoats.findIndex(b => b.id === boat.id);
      if (idx > -1) { boats.push(completedBoats.splice(idx, 1)[0]); }
      idx = preBoats.findIndex(b => b.id === boat.id);
      if (idx > -1) { boats.push(preBoats.splice(idx, 1)[0]); }
      updateCounters();
      saveBoatsToStorage();
    } catch (err) {
      alert('Falha ao mover: ' + (err && err.message ? err.message : err));
    }
  })();
}

///////////////////////////     inicio         ///////////////////////////
/* ===== JS migrado de inicio.html ===== */
if (document.getElementById('inicio-dashboard')) {

    document.addEventListener('DOMContentLoaded', function () {
      // Atualiza ano no footer
      var cy = document.getElementById('current-year');
      if (cy) { cy.textContent = new Date().getFullYear(); }

      // Mensagem de boas-vindas com nome do usuário
      const userNameEl = document.getElementById('userName');
      const storedName = localStorage.getItem('progeneseUserName') || sessionStorage.getItem('progeneseUserName');
      if (userNameEl) { userNameEl.textContent = storedName ? storedName : 'Usuário'; }

      // Inicializa quadro de anotações
      const addBtn = document.getElementById('addNoteBtn');
      if (addBtn) {
        addBtn.addEventListener('click', addNote);
      }
      loadNotes();
    });

    function getNotes() {
      try {
        const raw = localStorage.getItem('inicioNotas');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    function saveNotes(notes) {
      localStorage.setItem('inicioNotas', JSON.stringify(notes));
    }

    function addNote() {
      const textEl = document.getElementById('newNoteText');
      const text = (textEl.value || '').trim();
      if (!text) { textEl.focus(); return; }
      const notes = getNotes();
      const note = { id: Date.now(), text };
      notes.unshift(note);
      saveNotes(notes);
      textEl.value = '';
      renderNotes(notes);
    }

    function loadNotes() {
      renderNotes(getNotes());
    }

    function renderNotes(notes) {
      const list = document.getElementById('notesList');
      if (!list) { return; }
      list.innerHTML = '';
      if (!notes.length) {
        const empty = document.createElement('div');
        empty.className = 'text-muted';
        empty.textContent = 'Nenhuma nota adicionada ainda.';
        list.appendChild(empty);
        return;
      }
      notes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.dataset.id = note.id;

        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-start';

        const textDiv = document.createElement('div');
        textDiv.className = 'note-text flex-grow-1';
        textDiv.textContent = note.text;
        textDiv.contentEditable = false;

        const btns = document.createElement('div');
        btns.className = 'ms-3 d-flex gap-2';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary btn-sm';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.setAttribute('title', 'Editar');
        editBtn.setAttribute('aria-label', 'Editar');
        editBtn.addEventListener('click', () => startEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary btn-sm d-none';
        saveBtn.innerHTML = '<i class="bi bi-check2"></i> Salvar';
        saveBtn.addEventListener('click', () => saveEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary btn-sm d-none';
        cancelBtn.innerHTML = '<i class="bi bi-x"></i> Cancelar';
        cancelBtn.addEventListener('click', () => cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, note.text));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-secondary btn-sm';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.setAttribute('title', 'Excluir');
        deleteBtn.setAttribute('aria-label', 'Excluir');
        deleteBtn.addEventListener('click', () => deleteNote(note.id));

        btns.append(editBtn, saveBtn, cancelBtn, deleteBtn);
        wrapper.append(textDiv, btns);
        li.appendChild(wrapper);
        list.appendChild(li);
      });
    }

    function startEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
      textDiv.contentEditable = true;
      textDiv.focus();
      editBtn.classList.add('d-none');
      saveBtn.classList.remove('d-none');
      cancelBtn.classList.remove('d-none');
    }

    function saveEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
      const newText = textDiv.textContent.trim();
      if (!newText) { textDiv.focus(); return; }
      const notes = getNotes();
      const idx = notes.findIndex(n => n.id === id);
      if (idx >= 0) {
        notes[idx].text = newText;
        saveNotes(notes);
      }
      textDiv.contentEditable = false;
      editBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
      cancelBtn.classList.add('d-none');
    }

    function cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, originalText) {
      textDiv.textContent = originalText;
      textDiv.contentEditable = false;
      editBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
      cancelBtn.classList.add('d-none');
    }

    function deleteNote(id) {
      const notes = getNotes().filter(n => n.id !== id);
      saveNotes(notes);
      renderNotes(notes);
    }
  

}
/* ===== JS migrado de inicio.html ===== */

    document.addEventListener('DOMContentLoaded', function () {
      // Atualiza ano no footer
      var cy = document.getElementById('current-year');
      if (cy) { cy.textContent = new Date().getFullYear(); }

      // Mensagem de boas-vindas com nome do usuário
      const userNameEl = document.getElementById('userName');
      const storedName = localStorage.getItem('progeneseUserName') || sessionStorage.getItem('progeneseUserName');
      if (userNameEl) { userNameEl.textContent = storedName ? storedName : 'Usuário'; }

      // Inicializa quadro de anotações
      const addBtn = document.getElementById('addNoteBtn');
      if (addBtn) {
        addBtn.addEventListener('click', addNote);
      }
      loadNotes();
    });

    function getNotes() {
      try {
        const raw = localStorage.getItem('inicioNotas');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    function saveNotes(notes) {
      localStorage.setItem('inicioNotas', JSON.stringify(notes));
    }

    function addNote() {
      const textEl = document.getElementById('newNoteText');
      const text = (textEl.value || '').trim();
      if (!text) { textEl.focus(); return; }
      const notes = getNotes();
      const note = { id: Date.now(), text };
      notes.unshift(note);
      saveNotes(notes);
      textEl.value = '';
      renderNotes(notes);
    }

    function loadNotes() {
      renderNotes(getNotes());
    }

    function renderNotes(notes) {
      const list = document.getElementById('notesList');
      if (!list) { return; }
      list.innerHTML = '';
      if (!notes.length) {
        const empty = document.createElement('div');
        empty.className = 'text-muted';
        empty.textContent = 'Nenhuma nota adicionada ainda.';
        list.appendChild(empty);
        return;
      }
      notes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.dataset.id = note.id;

        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-start';

        const textDiv = document.createElement('div');
        textDiv.className = 'note-text flex-grow-1';
        textDiv.textContent = note.text;
        textDiv.contentEditable = false;

        const btns = document.createElement('div');
        btns.className = 'ms-3 d-flex gap-2';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary btn-sm';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.setAttribute('title', 'Editar');
        editBtn.setAttribute('aria-label', 'Editar');
        editBtn.addEventListener('click', () => startEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary btn-sm d-none';
        saveBtn.innerHTML = '<i class="bi bi-check2"></i> Salvar';
        saveBtn.addEventListener('click', () => saveEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary btn-sm d-none';
        cancelBtn.innerHTML = '<i class="bi bi-x"></i> Cancelar';
        cancelBtn.addEventListener('click', () => cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, note.text));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-secondary btn-sm';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.setAttribute('title', 'Excluir');
        deleteBtn.setAttribute('aria-label', 'Excluir');
        deleteBtn.addEventListener('click', () => deleteNote(note.id));

        btns.append(editBtn, saveBtn, cancelBtn, deleteBtn);
        wrapper.append(textDiv, btns);
        li.appendChild(wrapper);
        list.appendChild(li);
      });
    }

    function startEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
      textDiv.contentEditable = true;
      textDiv.focus();
      editBtn.classList.add('d-none');
      saveBtn.classList.remove('d-none');
      cancelBtn.classList.remove('d-none');
    }

    function saveEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
      const newText = textDiv.textContent.trim();
      if (!newText) { textDiv.focus(); return; }
      const notes = getNotes();
      const idx = notes.findIndex(n => n.id === id);
      if (idx >= 0) {
        notes[idx].text = newText;
        saveNotes(notes);
      }
      textDiv.contentEditable = false;
      editBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
      cancelBtn.classList.add('d-none');
    }

    function cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, originalText) {
      textDiv.textContent = originalText;
      textDiv.contentEditable = false;
      editBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
      cancelBtn.classList.add('d-none');
    }

    function deleteNote(id) {
      const notes = getNotes().filter(n => n.id !== id);
      saveNotes(notes);
      renderNotes(notes);
    }
  


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

    function saveBoatsToStorage() {
      localStorage.setItem('shipyardBoats', JSON.stringify(boats));
      localStorage.setItem('completedBoats', JSON.stringify(completedBoats));
      localStorage.setItem('preBoats', JSON.stringify(preBoats));
    }
  


    function saveEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
      const newText = textDiv.textContent.trim();
      if (!newText) { textDiv.focus(); return; }
      const notes = getNotes();
      const idx = notes.findIndex(n => n.id === id);
      if (idx >= 0) {
        notes[idx].text = newText;
        saveNotes(notes);
      }
      textDiv.contentEditable = false;
      editBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
      cancelBtn.classList.add('d-none');
    }

    function cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, originalText) {
      textDiv.textContent = originalText;
      textDiv.contentEditable = false;
      editBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
      cancelBtn.classList.add('d-none');
    }

    function deleteNote(id) {
      const notes = getNotes().filter(n => n.id !== id);
      saveNotes(notes);
      renderNotes(notes);
    }
  

