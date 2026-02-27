/**
 * Módulo de Funções Auxiliares e de Interface do Usuário (UI) - Genéricas
 * 
 * Este arquivo contém as funções genéricas de UI, como a lógica do quadro de anotações
 * e a ordenação de tabelas, que não dependem diretamente das variáveis de estado
 * globais (boats, completedBoats, preBoats) do estaleiro.
 */

// ============================================================================
// FUNÇÕES MIGRARAM DE INICIO.HTML (Quadro de Anotações)
// ============================================================================

/**
 * Obtém as notas salvas no localStorage.
 * @returns {Array<object>} Lista de notas.
 * 
 * Exemplo de Uso:
 * const notas = getNotes();
 */
function getNotes() {
  try {
    const raw = localStorage.getItem('inicioNotas');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

/**
 * Salva a lista de notas no localStorage.
 * @param {Array<object>} notes - Lista de notas a ser salva.
 * 
 * Exemplo de Uso:
 * saveNotes(minhasNotas);
 */
function saveNotes(notes) {
  localStorage.setItem('inicioNotas', JSON.stringify(notes));
}

/**
 * Adiciona uma nova nota a partir do campo de texto.
 * 
 * Propósito: Coletar texto, criar objeto nota, salvar e renderizar.
 * 
 * Exemplo de Uso:
 * document.getElementById('addNoteBtn').addEventListener('click', addNote);
 */
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

/**
 * Carrega e renderiza todas as notas salvas.
 * 
 * Exemplo de Uso:
 * loadNotes();
 */
function loadNotes() {
  renderNotes(getNotes());
}

/**
 * Renderiza a lista de notas no DOM.
 * @param {Array<object>} notes - Lista de notas a serem renderizadas.
 * 
 * Propósito: Criar e inserir elementos HTML para cada nota, anexando handlers.
 * 
 * Exemplo de Uso:
 * renderNotes(getNotes());
 */
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
    // Handler para iniciar edição
    editBtn.addEventListener('click', () => startEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary btn-sm d-none';
    saveBtn.innerHTML = '<i class="bi bi-check2"></i> Salvar';
    // Handler para salvar edição
    saveBtn.addEventListener('click', () => saveEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary btn-sm d-none';
    cancelBtn.innerHTML = '<i class="bi bi-x"></i> Cancelar';
    // Handler para cancelar edição
    cancelBtn.addEventListener('click', () => cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, note.text));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-secondary btn-sm';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.setAttribute('title', 'Excluir');
    deleteBtn.setAttribute('aria-label', 'Excluir');
    // Handler para deletar nota
    deleteBtn.addEventListener('click', () => deleteNote(note.id));

    btns.append(editBtn, saveBtn, cancelBtn, deleteBtn);
    wrapper.append(textDiv, btns);
    li.appendChild(wrapper);
    list.appendChild(li);
  });
}

/**
 * Inicia o modo de edição para uma nota.
 * 
 * Propósito: Habilitar `contentEditable` e mostrar botões de Salvar/Cancelar.
 * 
 * Exemplo de Uso:
 * editBtn.addEventListener('click', () => startEdit(...));
 */
function startEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
  textDiv.contentEditable = true;
  textDiv.focus();
  editBtn.classList.add('d-none');
  saveBtn.classList.remove('d-none');
  cancelBtn.classList.remove('d-none');
}

/**
 * Salva a edição de uma nota.
 * 
 * Propósito: Coletar o novo texto, atualizar o localStorage e reverter a UI para o modo de visualização.
 * 
 * Exemplo de Uso:
 * saveBtn.addEventListener('click', () => saveEdit(...));
 */
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

/**
 * Cancela a edição de uma nota, restaurando o texto original.
 * 
 * Propósito: Restaurar o texto original e reverter a UI para o modo de visualização.
 * 
 * Exemplo de Uso:
 * cancelBtn.addEventListener('click', () => cancelEdit(...));
 */
function cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, originalText) {
  textDiv.textContent = originalText;
  textDiv.contentEditable = false;
  editBtn.classList.remove('d-none');
  saveBtn.classList.add('d-none');
  cancelBtn.classList.add('d-none');
}

/**
 * Deleta uma nota.
 * 
 * Propósito: Remover a nota do estado local e atualizar a renderização.
 * 
 * Exemplo de Uso:
 * deleteBtn.addEventListener('click', () => deleteNote(note.id));
 */
function deleteNote(id) {
  const notes = getNotes().filter(n => n.id !== id);
  saveNotes(notes);
  renderNotes(notes);
}

/**
 * Lógica de inicialização do sistema (DOMContentLoad) para o quadro de anotações.
 * 
 * Propósito: Iniciar a aplicação após o carregamento completo do DOM.
 * 
 * Exemplo de Uso:
 * document.addEventListener('DOMContentLoaded', function() { ... });
 */
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

// ============================================================================
// FUNÇÕES MIGRARAM DE BARCO.HTML (Inventário)
// ============================================================================

/**
 * Inicializa a lógica de interface do inventário (clique na linha e ordenação).
 * 
 * Propósito: Configurar eventos para a tabela de inventário.
 * 
 * Exemplo de Uso:
 * document.addEventListener('DOMContentLoaded', function() { ... });
 */
document.addEventListener('DOMContentLoaded', function() {
  try {
    const table = document.getElementById('inventario-table');
    if (!table) return;
    const tbody = table.querySelector('tbody');

    // Clique na linha inteira para abrir o modal de edição (Callback)
    tbody.querySelectorAll('tr.inventario-row').forEach(function(row) {
      row.addEventListener('click', function() {
        const editModalEl = document.getElementById('modalEditInventario');
        if (typeof bootstrap !== 'undefined' && editModalEl) {
          // Utiliza o modal do Bootstrap (Controle de Modal)
          const modal = new bootstrap.Modal(editModalEl);
          modal.show();
        }
      });
    });

    // Ordenação por cabeçalho clicável (Handler)
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
});