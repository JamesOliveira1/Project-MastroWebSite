///////////////////////////     estaleiro         ///////////////////////////

    // Global variables
    let boats = JSON.parse(localStorage.getItem('shipyardBoats')) || [];
    let completedBoats = JSON.parse(localStorage.getItem('completedBoats')) || [];
    let preBoats = JSON.parse(localStorage.getItem('preBoats')) || [];
    let currentEditingBoat = null;
    let selectedBoat = null;

    // Initialize the system when page loads
    document.addEventListener('DOMContentLoaded', function() {
      initializeSystem();
      loadBoats();
      updateCounters();
    });

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
          // Move boat to completed projects
          const boatIndex = boats.findIndex(b => b.id === boatId);
          if (boatIndex > -1) {
            const completedBoat = boats.splice(boatIndex, 1)[0];
            completedBoat.progress = 100;
            completedBoat.completedDate = new Date().toLocaleDateString('pt-BR');
            completedBoats.push(completedBoat);
            saveBoatsToStorage();
            loadBoats();
            updateCounters();
            deselectBoat();
          }
        }
      });
      
      completedContainer.addEventListener('dragleave', function(e) {
        this.classList.remove('drag-over');
      });
    }

    // Boat selection functionality
    function selectBoat(boatId) {
      const boat = boats.find(b => b.id === boatId);
      if (!boat) return;

      selectedBoat = boat;
      
      // Remove previous selection
      document.querySelectorAll('.boat-slot').forEach(slot => {
        slot.classList.remove('selected');
      });
      
      // Add selection to current boat
      const slot = document.querySelector(`[data-boat-id="${boatId}"]`);
      if (slot) {
        slot.classList.add('selected');
      }
      
      // Show selection panel
      showSelectionPanel(boat);
    }

    function deselectBoat() {
      selectedBoat = null;
      document.querySelectorAll('.boat-slot').forEach(slot => {
        slot.classList.remove('selected');
      });
      hideSelectionPanel();
    }

    function showSelectionPanel(boat) {
      // Atualiza o overlay dentro da própria vaga selecionada
      const slot = document.querySelector(`[data-boat-id="${boat.id}"]`);
      if (slot) {
        const titleEl = slot.querySelector('.overlay-title');
        if (titleEl) {
          titleEl.textContent = boat.ultimaAtividade ? boat.ultimaAtividade : 'última atividade realizada';
        }
      }
      // Oculta painel flutuante antigo para evitar duplicidade visual
      const panel = document.getElementById('boatSelectionPanel');
      if (panel) panel.style.display = 'none';
    }

    function hideSelectionPanel() {
      document.getElementById('boatSelectionPanel').style.display = 'none';
    }

    // Modal functions
    function showModal() {
      const el = document.getElementById('boatModal');
      // Prioriza Bootstrap.Modal (qualquer versão) e depois jQuery; por fim fallback manual
      if (window.bootstrap && bootstrap.Modal) {
        let instance = null;
        try { instance = bootstrap.Modal.getInstance ? bootstrap.Modal.getInstance(el) : null; } catch (e) {}
        if (!instance) {
          try { instance = bootstrap.Modal.getOrCreateInstance ? bootstrap.Modal.getOrCreateInstance(el) : null; } catch (e) {}
        }
        if (!instance) {
          try { instance = new bootstrap.Modal(el); } catch (e) {}
        }
        if (instance && typeof instance.show === 'function') {
          instance.show();
          return;
        }
      }
      try {
        if (typeof $ !== 'undefined' && $.fn && $.fn.modal) {
          $('#boatModal').modal('show');
          return;
        }
      } catch (e) {}
      // Fallback manual apenas se necessário
      el.classList.add('show');
      el.style.display = 'block';
      el.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }

    function hideModal() {
      const el = document.getElementById('boatModal');
      // Prioriza Bootstrap.Modal (qualquer versão) e depois jQuery; por fim fallback manual
      if (window.bootstrap && bootstrap.Modal) {
        let instance = null;
        try { instance = bootstrap.Modal.getInstance ? bootstrap.Modal.getInstance(el) : null; } catch (e) {}
        if (!instance) {
          try { instance = bootstrap.Modal.getOrCreateInstance ? bootstrap.Modal.getOrCreateInstance(el) : null; } catch (e) {}
        }
        if (!instance) {
          try { instance = new bootstrap.Modal(el); } catch (e) {}
        }
        if (instance && typeof instance.hide === 'function') {
          instance.hide();
        } else {
          // cai para fallback se não houver método
          try {
            if (typeof $ !== 'undefined' && $.fn && $.fn.modal) {
              $('#boatModal').modal('hide');
            } else {
              el.classList.remove('show');
              el.style.display = 'none';
              el.setAttribute('aria-hidden', 'true');
            }
          } catch (e) {
            el.classList.remove('show');
            el.style.display = 'none';
            el.setAttribute('aria-hidden', 'true');
          }
        }
      } else {
        try {
          if (typeof $ !== 'undefined' && $.fn && $.fn.modal) {
            $('#boatModal').modal('hide');
          } else {
            el.classList.remove('show');
            el.style.display = 'none';
            el.setAttribute('aria-hidden', 'true');
          }
        } catch (e) {
          el.classList.remove('show');
          el.style.display = 'none';
          el.setAttribute('aria-hidden', 'true');
        }
      }
      // Remoção defensiva de backdrop e classe do body
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
      document.getElementById('lastActivity').value = selectedBoat.ultimaAtividade || '';
      document.getElementById('boatProgress').value = selectedBoat.progress || 0;
      document.getElementById('progressValue').textContent = (selectedBoat.progress || 0) + '%';
      document.getElementById('deleteBoatBtn').style.display = 'inline-block';
      
      showModal();
    }

    function openBoatDocumentation() {
      if (!selectedBoat) return;
      alert('Funcionalidade de documentação será implementada em breve.\n\nBarco: ' + selectedBoat.codigo + ' - ' + selectedBoat.modelo);
    }

    function saveBoat() {
      const codigo = document.getElementById('boatCode').value.trim();
      const modelo = document.getElementById('boatModel').value.trim();
      const cliente = document.getElementById('clientName').value.trim();
      const ultimaAtividade = document.getElementById('lastActivity').value.trim();
      const progress = parseInt(document.getElementById('boatProgress').value);

      if (!codigo || !modelo || !cliente) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      if (currentEditingBoat) {
        // Update existing boat
        currentEditingBoat.codigo = codigo;
        currentEditingBoat.modelo = modelo;
        currentEditingBoat.cliente = cliente;
        currentEditingBoat.ultimaAtividade = ultimaAtividade;
        currentEditingBoat.progress = progress;
      } else {
        // Create new boat
        const modal = document.getElementById('boatModal');
        // Create directly in pre-projects if requested
        if (modal.dataset.createInPreProject === 'true') {
          const newPreBoat = {
            id: 'boat_' + Date.now(),
            codigo: codigo,
            modelo: modelo,
            cliente: cliente,
            ultimaAtividade: ultimaAtividade,
            progress: progress,
            createdDate: new Date().toLocaleDateString('pt-BR')
          };
          preBoats.push(newPreBoat);
          saveBoatsToStorage();
          loadBoats();
          updateCounters();
          hideModal();
          delete modal.dataset.createInPreProject;
          delete modal.dataset.preselectedWarehouse;
          delete modal.dataset.preselectedSlot;
          return;
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
        
        if (!warehouse || !slot) {
          const availableSlot = findAvailableSlot();
          if (!availableSlot) {
            alert('Não há vagas disponíveis nos galpões.');
            return;
          }
          warehouse = availableSlot.warehouse;
          slot = availableSlot.slot;
        }

        const newBoat = {
          id: 'boat_' + Date.now(),
          codigo: codigo,
          modelo: modelo,
          cliente: cliente,
          ultimaAtividade: ultimaAtividade,
          progress: progress,
          warehouse: warehouse,
          slot: slot,
          createdDate: new Date().toLocaleDateString('pt-BR')
        };

        boats.push(newBoat);
      }

      saveBoatsToStorage();
      loadBoats();
      updateCounters();
      hideModal();
      
      // Clear preselected data
      delete document.getElementById('boatModal').dataset.preselectedWarehouse;
      delete document.getElementById('boatModal').dataset.preselectedSlot;
      delete document.getElementById('boatModal').dataset.createInPreProject;
    }

    function deleteBoat() {
      if (!currentEditingBoat) return;
      
      if (confirm('Tem certeza que deseja excluir este barco?')) {
        let deleted = false;
        let idx = boats.findIndex(b => b.id === currentEditingBoat.id);
        if (idx > -1) { boats.splice(idx, 1); deleted = true; }
        idx = preBoats.findIndex(b => b.id === currentEditingBoat.id);
        if (idx > -1) { preBoats.splice(idx, 1); deleted = true; }
        idx = completedBoats.findIndex(b => b.id === currentEditingBoat.id);
        if (idx > -1) { completedBoats.splice(idx, 1); deleted = true; }
        
        if (deleted) {
          saveBoatsToStorage();
          loadBoats();
          updateCounters();
          hideModal();
          deselectBoat();
        }
      }
    }

    // Drag and drop handlers
    function handleDragOver(e) {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    }

    function handleDrop(e) {
      e.preventDefault();
      const slot = e.currentTarget;
      slot.classList.remove('drag-over');
      
      const boatId = e.dataTransfer.getData('text/plain');
      
      // Check if dropping from completed projects
      const completedBoat = completedBoats.find(b => b.id === boatId);
      if (completedBoat && !slot.dataset.boatId) {
        // Move from completed to warehouse
        const completedIndex = completedBoats.findIndex(b => b.id === boatId);
        if (completedIndex > -1) {
          const boat = completedBoats.splice(completedIndex, 1)[0];
          boat.warehouse = slot.dataset.warehouse;
          boat.slot = slot.dataset.slot;
          delete boat.completedDate;
          boats.push(boat);
          saveBoatsToStorage();
          loadBoats();
          updateCounters();
        }
        return;
      }
      
      // Check if dropping from pre-projects
      const preBoat = preBoats.find(b => b.id === boatId);
      if (preBoat && !slot.dataset.boatId) {
        const preIndex = preBoats.findIndex(b => b.id === boatId);
        if (preIndex > -1) {
          const boat = preBoats.splice(preIndex, 1)[0];
          boat.warehouse = slot.dataset.warehouse;
          boat.slot = slot.dataset.slot;
          boats.push(boat);
          saveBoatsToStorage();
          loadBoats();
          updateCounters();
        }
        return;
      }
      
      // Regular boat movement between slots
      const boat = boats.find(b => b.id === boatId);
      if (boat && !slot.dataset.boatId) {
        boat.warehouse = slot.dataset.warehouse;
        boat.slot = slot.dataset.slot;
        saveBoatsToStorage();
        loadBoats();
      }
    }

    function handleDragLeave(e) {
      e.currentTarget.classList.remove('drag-over');
    }

    // Utility functions
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
        slot.innerHTML = '<div class="slot-content">Clique para adicionar</div>';
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
              <i class="bi bi-anchor" style="font-size: 1.5rem; color: #007bff; margin-bottom: 8px;"></i>
              <div class="boat-info">
                <div class="boat-model">${boat.modelo || 'Modelo não informado'}</div>
                <div class="boat-code">${boat.codigo || 'Código não informado'}</div>
                <div class="boat-progress">${boat.progress || 0}% concluído</div>
              </div>
            </div>
            <div class="slot-overlay">
              <div class="overlay-grid">
                <i class="bi bi-pencil-square overlay-icon edit-icon" title="Editar"></i>
                <div class="overlay-title">${boat.ultimaAtividade ? boat.ultimaAtividade : 'última atividade realizada'}</div>
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
      
      document.getElementById('laminacaoOccupied').textContent = laminacaoOccupied;
      document.getElementById('montagemOccupied').textContent = montagemOccupied;
    }

    function loadCompletedBoats() {
      const container = document.getElementById('completedBoatsContainer');
      
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
            <div class="completion-date">Concluído em ${boat.completedDate || boat.createdDate}</div>
          </div>
        `).join('');
        
        // Add drag events to completed boats
        container.querySelectorAll('.completed-boat').forEach(completedBoat => {
          completedBoat.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.boatId);
            this.classList.add('dragging');
          });
          
          completedBoat.addEventListener('dragend', function() {
            this.classList.remove('dragging');
          });
        });
      }
    }

    function updateCounters() {
      document.getElementById('totalBoats').textContent = boats.length;
      document.getElementById('completedBoats').textContent = completedBoats.length;
    }

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
          delete moved.completedDate;
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
            <p>Nenhum pré-projeto ainda</p>
          </div>
        `;
      } else {
        container.innerHTML = preBoats.map(boat => `
          <div class="pre-boat" draggable="true" data-boat-id="${boat.id}">
            <i class="bi bi-lightbulb" style="font-size: 1.2rem; margin-bottom: 8px;"></i>
            <div class="boat-code">${boat.codigo || 'N/A'}</div>
            <div class="boat-model">${boat.modelo || 'N/A'}</div>
          </div>
        `).join('');
        
        // Add drag events to pre-project boats
        container.querySelectorAll('.pre-boat').forEach(preBoatEl => {
          preBoatEl.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.boatId);
            this.classList.add('dragging');
          });
          
          preBoatEl.addEventListener('dragend', function() {
            this.classList.remove('dragging');
          });
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
          cliente: 'João Silva',
          ultimaAtividade: 'Aplicação de fibra de vidro no casco',
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
          ultimaAtividade: 'Instalação de equipamentos eletrônicos',
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
    addSampleData();
  
// ===== JS migrado de barco.html ===== //

    document.addEventListener('DOMContentLoaded', function() {
      try {
        const table = document.getElementById('inventario-table');
        if (!table) return;
        const tbody = table.querySelector('tbody');

        // Clique na linha inteira para abrir o modal de ediÃ§Ã£o
        tbody.querySelectorAll('tr.inventario-row').forEach(function(row) {
          row.addEventListener('click', function() {
            const editModalEl = document.getElementById('modalEditInventario');
            if (typeof bootstrap !== 'undefined' && editModalEl) {
              const modal = new bootstrap.Modal(editModalEl);
              modal.show();
            }
          });
        });

        // OrdenaÃ§Ã£o por cabeÃ§alho clicÃ¡vel
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

              // Tentar numÃ©rico
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
        console.warn('InventÃ¡rio scripts warning:', e);
      }
    });
  


