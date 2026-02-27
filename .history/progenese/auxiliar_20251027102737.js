/**
 * Funções Auxiliares e de UI Genérica
 */

// Início (dashboard)

    document.addEventListener('DOMContentLoaded', function () {
      if (!document.getElementById('inicio-dashboard')) return;
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

    // Retorna notas armazenadas no localStorage
    function getNotes() {
      try {
        const raw = localStorage.getItem('inicioNotas');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    // Salva notas no localStorage
    function saveNotes(notes) {
      localStorage.setItem('inicioNotas', JSON.stringify(notes));
    }

    // Adiciona uma nova nota à lista
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

    // Carrega e renderiza notas existentes
    function loadNotes() {
      renderNotes(getNotes());
    }

    // Renderiza lista de notas no elemento de UI
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

    // Inicia edição do texto de uma nota
    function startEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
      textDiv.contentEditable = true;
      textDiv.focus();
      editBtn.classList.add('d-none');
      saveBtn.classList.remove('d-none');
      cancelBtn.classList.remove('d-none');
    }

    // Salva alterações da nota editada
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

    // Cancela edição e restaura texto original
    function cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, originalText) {
      textDiv.textContent = originalText;
      textDiv.contentEditable = false;
      editBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
      cancelBtn.classList.add('d-none');
    }

    // Exclui uma nota pelo id
    function deleteNote(id) {
      const notes = getNotes().filter(n => n.id !== id);
      saveNotes(notes);
      renderNotes(notes);
    }
  

// ===== Barco (inventário) ===== //

    // Inicializa interação da tabela de inventário
    function initializeInventarioTable() {
      try {
        const table = document.getElementById('inventario-table');
        if (!table) return;
        const tbody = table.querySelector('tbody');

        // Clique na linha inteira para abrir o modal de edição
        tbody.querySelectorAll('tr.inventario-row').forEach(function(row) {
          row.addEventListener('click', function() {
            const editModalEl = document.getElementById('modalEditInventario');
            if (typeof bootstrap !== 'undefined' && editModalEl) {
              const modal = new bootstrap.Modal(editModalEl);
              modal.show();
            }
          });
        });

        // Ordenação por cabeçalho clicável
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

              // Tentar numérico
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
        console.warn('Inventário scripts warning:', e);
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      initializeInventarioTable();
    });
  

// Inicializa UI do estaleiro (botões, slider, DnD)
    function initializeSystem() {
  document.getElementById('saveBoatBtn').addEventListener('click', saveBoat);
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
    btn.addEventListener('click', hideModal);
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

// Configura drag-and-drop nas vagas dos galpões
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

// Seleciona barco e destaca sua vaga se existir
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

// Remove seleção de barco e limpa destaques
    function deselectBoat() {
  selectedBoat = null;
  document.querySelectorAll('.boat-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  const panel = document.getElementById('boatSelectionPanel');
  if (panel) panel.style.display = 'none';
}

// Abre modal para adicionar novo barco
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

// Abre modal de edição do barco selecionado
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

// Mostra placeholder para documentação do barco
    function openBoatDocumentation() {
  if (!selectedBoat) return;
  alert('Funcionalidade de documentação será implementada em breve.\n\nBarco: ' + selectedBoat.codigo + ' - ' + selectedBoat.modelo);
}

// Exibe o modal genérico de barco
    function showModal() {
  const modal = document.getElementById('boatModal');
  if (!modal) return;
  modal.classList.add('show');
  modal.style.display = 'block';
  document.body.classList.add('modal-open');
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  document.body.appendChild(backdrop);
}

// Oculta o modal genérico e remove backdrop
    function hideModal() {
  const modal = document.getElementById('boatModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.style.display = 'none';
  document.body.classList.remove('modal-open');
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
}

// Handler dragover: permite soltar e aplica classe visual
    function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

// Handler dragleave: remove destaque visual da vaga
    function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
  

console.log('[auxiliar.js] loaded');
  
