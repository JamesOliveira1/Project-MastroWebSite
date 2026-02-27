/**
 * Funções Auxiliares e de UI Genérica
 */

// Início (dashboard)

// Configuração de API para notas (disponível globalmente neste arquivo)
const BASE_PREFIX = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
const API_URL = `${BASE_PREFIX}/progenese/api/usuarios.php`;
let csrfToken = null;

async function fetchCsrfForNotes() {
  try {
    const res = await fetch(`${API_URL}?action=csrf`, { credentials: 'include' });
    const data = await res.json();
    if (data && data.ok && data.csrf) csrfToken = data.csrf;
  } catch (_) { /* silencioso */ }
}

    document.addEventListener('DOMContentLoaded', function () {
      if (!document.getElementById('inicio-dashboard')) return;
      // Atualiza ano no footer
      var cy = document.getElementById('current-year');
      if (cy) { cy.textContent = new Date().getFullYear(); }

      // Mensagem de boas-vindas com nome do usuário
      const userNameEl = document.getElementById('userName');
      const storedName = localStorage.getItem('progeneseUserName') || sessionStorage.getItem('progeneseUserName');
      if (userNameEl) { userNameEl.textContent = storedName ? storedName : 'Usuário'; }

      // Inicializa quadro de anotações (persistência no servidor)
      const addBtn = document.getElementById('addNoteBtn');
      if (addBtn) {
        addBtn.addEventListener('click', addNote);
      }
      // Pré-carrega CSRF e notas
      fetchCsrfForNotes().finally(loadNotes);
    });

    // Helpers de requisição de notas
    async function listNotes() {
      try {
        const res = await fetch(`${API_URL}?action=notes_list`, { credentials: 'include' });
        const data = await res.json();
        if (data && data.ok) return Array.isArray(data.notes) ? data.notes : [];
      } catch (_) {}
      return [];
    }

    async function createNote(nota) {
      if (!csrfToken) await (typeof fetchCsrfForNotes === 'function' ? fetchCsrfForNotes() : Promise.resolve());
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken || '' },
        body: JSON.stringify({ action: 'notes_create', nota })
      });
      return res.json();
    }

    async function updateNote(id, nota) {
      if (!csrfToken) await (typeof fetchCsrfForNotes === 'function' ? fetchCsrfForNotes() : Promise.resolve());
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken || '' },
        body: JSON.stringify({ action: 'notes_update', id, nota })
      });
      return res.json();
    }

    async function deleteNoteServer(id) {
      if (!csrfToken) await (typeof fetchCsrfForNotes === 'function' ? fetchCsrfForNotes() : Promise.resolve());
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken || '' },
        body: JSON.stringify({ action: 'notes_delete', id })
      });
      return res.json();
    }

    // Adiciona uma nova nota à lista
    async function addNote() {
      const textEl = document.getElementById('newNoteText');
      const text = (textEl.value || '').trim();
      if (!text) { textEl.focus(); return; }
      try {
        const resp = await createNote(text);
        if (!resp || !resp.ok) {
          alert(resp?.error || 'Falha ao salvar anotação');
          return;
        }
        textEl.value = '';
        await loadNotes();
      } catch (_) {
        alert('Erro de rede ao salvar anotação');
      }
    }

    // Carrega e renderiza notas existentes
    async function loadNotes() {
      const list = document.getElementById('notesList');
      if (list) {
        list.innerHTML = '<div class="text-muted">Carregando...</div>';
      }
      const notes = await listNotes();
      // Normaliza para { id, text }
      const normalized = notes.map(n => ({ id: Number(n.id), text: String(n.nota || '') }));
      renderNotes(normalized);
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

        const btns = document.createElement('div');
        btns.className = 'note-actions ms-3 d-flex gap-2 align-items-center';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn_estaleirooff btn-sm';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.setAttribute('title', 'Editar');
        editBtn.setAttribute('aria-label', 'Editar');
        editBtn.addEventListener('click', () => startEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-outline-success btn-sm d-none';
        saveBtn.innerHTML = '<i class="bi bi-check2"></i>';
        saveBtn.setAttribute('title', 'Salvar');
        saveBtn.setAttribute('aria-label', 'Salvar');
        saveBtn.addEventListener('click', () => saveEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline-secondary btn-sm d-none';
        cancelBtn.innerHTML = '<i class="bi bi-x"></i>';
        cancelBtn.setAttribute('title', 'Cancelar');
        cancelBtn.setAttribute('aria-label', 'Cancelar');
        cancelBtn.addEventListener('click', () => cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, note.text));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline-danger btn-sm';
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
      const originalText = textDiv.textContent;
      const inputEl = document.createElement('textarea');
      inputEl.className = 'note-edit-input form-control form-control-sm';
      inputEl.rows = 3;
      inputEl.value = originalText;
      inputEl.setAttribute('aria-label', 'Editar anotação');
      textDiv.classList.add('d-none');
      textDiv.parentElement.insertBefore(inputEl, textDiv.nextSibling);
      setTimeout(() => { try { inputEl.focus(); inputEl.selectionStart = inputEl.value.length; } catch (_) {} }, 0);
      editBtn.classList.add('d-none');
      saveBtn.classList.remove('d-none');
      cancelBtn.classList.remove('d-none');
      cancelBtn.__originalText = originalText;
    }

    // Salva alterações da nota editada
    async function saveEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
      const inputEl = textDiv.parentElement.querySelector('.note-edit-input');
      const newText = (inputEl ? inputEl.value : textDiv.textContent).trim();
      if (!newText) { (inputEl || textDiv).focus(); return; }
      try {
        const resp = await updateNote(id, newText);
        if (!resp || !resp.ok) {
          alert(resp?.error || 'Falha ao atualizar anotação');
          return;
        }
        if (inputEl) { try { inputEl.remove(); } catch (_) {} }
        textDiv.textContent = newText;
        textDiv.classList.remove('d-none');
        editBtn.classList.remove('d-none');
        saveBtn.classList.add('d-none');
        cancelBtn.classList.add('d-none');
        await loadNotes();
      } catch (_) {
        alert('Erro de rede ao atualizar anotação');
      }
    }

    // Cancela edição e restaura texto original
    function cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, originalText) {
      const inputEl = textDiv.parentElement.querySelector('.note-edit-input');
      if (inputEl) { try { inputEl.remove(); } catch (_) {} }
      textDiv.textContent = originalText;
      textDiv.classList.remove('d-none');
      editBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
      cancelBtn.classList.add('d-none');
    }

    // Exclui uma nota pelo id
    async function deleteNote(id) {
      try {
        const resp = await deleteNoteServer(id);
        if (!resp || !resp.ok) {
          alert(resp?.error || 'Falha ao excluir anotação');
          return;
        }
        await loadNotes();
      } catch (_) {
        alert('Erro de rede ao excluir anotação');
      }
    }
  


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
  try {
    const id = selectedBoat.id != null ? String(selectedBoat.id) : '';
    if (!id) { alert('ID do barco não disponível.'); return; }
    // Bloqueio: impedir abrir detalhes se ID não for numérico ou barco for novo
    const isNumericId = /^\d+$/.test(id);
    const isNewFlag = selectedBoat && selectedBoat.isNew === true;
    if (!isNumericId || isNewFlag) {
      alert('Salve as alterações no Estaleiro para abrir os detalhes do barco.');
      return;
    }
    const url = 'barco.html?id=' + encodeURIComponent(id);
    window.open(url, '_blank');
  } catch (e) {
    alert('Não foi possível abrir detalhes: ' + (e && e.message ? e.message : e));
  }
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

// ===== Página Barco (detalhes) ===== //

document.addEventListener('DOMContentLoaded', function() {
  const mainEl = document.getElementById('barco-details-main');
  if (!mainEl) return; // Apenas em progenese/barco.html

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const boatId = idParam ? parseInt(idParam, 10) : 0;
  if (!boatId || isNaN(boatId)) {
    alert('ID do barco ausente ou inválido.');
    window.location.href = 'estaleiro.html';
    return;
  }

  const titleEl = document.getElementById('boatTitle');
  const fId = document.getElementById('boatTechId');
  const fSerie = document.getElementById('boatTechNumeroSerie');
  const fCliente = document.getElementById('boatTechClienteNome');
  const fModelo = document.getElementById('boatTechModelo');
  const fChassi = document.getElementById('boatTechChassi');
  const fPedido = document.getElementById('boatTechDataPedido');
  const fEntrega = document.getElementById('boatTechDataEntrega');
  const fProposta = document.getElementById('boatTechNumeroProposta');
  const fStatus = document.getElementById('boatTechStatus');
  // Subtítulo dinâmico no cabeçalho
  const headerMetaEl = document.getElementById('boatHeaderMeta');
  let metaCliente = '—', metaModelo = '—';
  let metaLocal = '—', metaVaga = '—';
  const updateHeaderMeta = () => {
    if (!headerMetaEl) return;
    const localStr = metaLocal || '—';
    const vagaStr = (metaVaga !== null && metaVaga !== undefined && metaVaga !== '') ? String(metaVaga) : '—';
    const clienteStr = metaCliente || '—';
    const modeloStr = metaModelo || '—';
    headerMetaEl.textContent = `${localStr} ${vagaStr} - ${modeloStr} ${clienteStr}`;
  };
  // Inputs do modal Ficha Técnica (se existirem na página)
  const inId = document.getElementById('ftId');
  const inSerie = document.getElementById('ftSerie');
  const inCliente = document.getElementById('ftCliente');
  const inModelo = document.getElementById('ftModelo');
  const inChassi = document.getElementById('ftChassi');
  const inPedido = document.getElementById('ftPedido');
  const inEntrega = document.getElementById('ftEntrega');
  const inProposta = document.getElementById('ftProposta');
  // Campos ainda não disponíveis na API permanecerão como '—'

  const toDisplayDate = (iso) => {
    if (!iso) return '—';
    const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(iso);
    if (!m) return iso;
    return `${m[3]}/${m[2]}/${m[1]}`;
  };
  const toIsoDate = (br) => {
    if (!br) return null;
    const s = br.trim();
    const m = /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/.exec(s);
    if (!m) return null;
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    const y = m[3];
    return `${y}-${mo}-${d}`;
  };
  const formatDateBRInput = (el) => {
    if (!el) return;
    let v = (el.value || '').replace(/\D/g, '');
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + '/' + v.slice(5, 9);
    el.value = v.slice(0, 10);
  };

  fetch('api/barcos.php?action=detalhes&id=' + encodeURIComponent(boatId), {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  })
    .then(res => res.json())
    .then(json => {
      if (!json || json.ok !== true || !json.data) {
        const msg = (json && json.error) ? json.error : 'Barco não encontrado';
        alert(msg);
        window.location.href = 'estaleiro.html';
        return;
      }
      const row = json.data;
      const idStr = String(row.id);
      const serie = row.numero_serie || '—';
      const cliente = row.cliente_nome || '—';
      const modelo = row.modelo || '—';
      const chassi = row.chassi || '—';
      const dataPedido = toDisplayDate(row.data_pedido);
      const dataEntrega = toDisplayDate(row.data_entrega);
      const numeroProposta = row.numero_proposta || '—';

      if (titleEl) titleEl.textContent = `${modelo} - ${cliente}`;
      // Atualiza subtítulo (Cliente/Modelo)
      metaCliente = cliente;
      metaModelo = modelo;
      updateHeaderMeta();
      if (fId) fId.textContent = idStr;
      if (fSerie) fSerie.textContent = serie;
      if (fCliente) fCliente.textContent = cliente;
      if (fModelo) fModelo.textContent = modelo;
      if (fChassi) fChassi.textContent = chassi;
      if (fPedido) fPedido.textContent = dataPedido;
      if (fEntrega) fEntrega.textContent = dataEntrega;
      if (fProposta) fProposta.textContent = numeroProposta;

      // Preencher Status com o NOME do local atual do barco
      if (fStatus) fStatus.textContent = '—';
      fetch('api/estaleiro.php?action=posicao_do_barco&barco_id=' + encodeURIComponent(boatId), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
        .then(res => res.json())
        .then(pos => {
          const nome = pos && pos.ok === true && pos.data && pos.data.local_nome ? String(pos.data.local_nome) : '—';
          const numero = pos && pos.ok === true && pos.data && (pos.data.numero !== undefined && pos.data.numero !== null) ? pos.data.numero : '—';
          if (fStatus) fStatus.textContent = nome;
          // Atualiza subtítulo (Local/Vaga)
          metaLocal = nome;
          metaVaga = numero;
          updateHeaderMeta();
        })
        .catch(() => {
          if (fStatus) fStatus.textContent = '—';
          metaLocal = '—';
          metaVaga = '—';
          updateHeaderMeta();
        });

      // Carregar informações complementares
      loadComplementaryInfo(boatId);

      // Preencher inputs do modal para edição rápida (visual)
      if (inId) inId.value = idStr;
      if (inSerie) inSerie.value = serie !== '—' ? serie : '';
      if (inCliente) inCliente.value = cliente !== '—' ? cliente : '';
      if (inModelo) inModelo.value = modelo !== '—' ? modelo : '';
      if (inChassi) inChassi.value = chassi !== '—' ? chassi : '';
      if (inPedido) inPedido.value = dataPedido !== '—' ? dataPedido : '';
      if (inEntrega) inEntrega.value = dataEntrega !== '—' ? dataEntrega : '';
      if (inProposta) inProposta.value = numeroProposta !== '—' ? numeroProposta : '';
      // Máscara de datas conforme digita
      if (inPedido) inPedido.addEventListener('input', () => formatDateBRInput(inPedido));
      if (inEntrega) inEntrega.addEventListener('input', () => formatDateBRInput(inEntrega));
    })
    .catch(err => {
      alert('Erro ao carregar dados do barco: ' + (err && err.message ? err.message : err));
      window.location.href = 'estaleiro.html';
    });

  // Handler para salvar ficha técnica via modal (barcos + informacoes)
  const saveBtn = document.getElementById('saveFichaBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      try {
        const barcoId = boatId;
        if (!barcoId || isNaN(barcoId)) {
          alert('ID do barco inválido.');
          return;
        }
        // Coletar campos do modal
        const numero_serie = inSerie ? inSerie.value.trim() : '';
        const cliente_nome = inCliente ? inCliente.value.trim() : '';
        const modelo = inModelo ? inModelo.value.trim() : '';
        const chassi = inChassi ? inChassi.value.trim() : '';
        const dataPedidoBr = inPedido ? inPedido.value.trim() : '';
        const dataEntregaBr = inEntrega ? inEntrega.value.trim() : '';
        const numero_proposta = inProposta ? inProposta.value.trim() : '';

        const isoPedido = toIsoDate(dataPedidoBr);
        const isoEntrega = toIsoDate(dataEntregaBr);
        if (dataPedidoBr && !isoPedido) {
          alert('Informe a Data do Pedido no formato DD/MM/AAAA');
          return;
        }
        if (dataEntregaBr && !isoEntrega) {
          alert('Informe a Data de Entrega no formato DD/MM/AAAA');
          return;
        }

        // Primeiro atualiza a tabela barcos
        fetch('api/barcos.php?action=editar_barco', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: barcoId, numero_serie, cliente_nome, modelo })
        })
        .then(res => res.json())
        .then(json => {
          if (!json || json.ok !== true) {
            const msg = (json && json.error) ? json.error : 'Falha ao salvar dados do barco';
            throw new Error(msg);
          }
          // Depois atualiza a tabela informacoes
          return fetch('api/barcos.php?action=salvar_informacoes', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              barco_id: barcoId,
              chassi,
              data_pedido: isoPedido,
              data_entrega: isoEntrega,
              numero_proposta
            })
          });
        })
        .then(res => res.json())
        .then(json => {
          if (!json || json.ok !== true || !json.data) {
            const msg = (json && json.error) ? json.error : 'Falha ao salvar informações da ficha técnica';
            throw new Error(msg);
          }
          // Atualiza UI
          if (fSerie) fSerie.textContent = numero_serie || '—';
          if (fCliente) fCliente.textContent = cliente_nome || '—';
          if (fModelo) fModelo.textContent = modelo || '—';
          if (fChassi) fChassi.textContent = chassi || '—';
          if (fPedido) fPedido.textContent = (dataPedidoBr || '—');
          if (fEntrega) fEntrega.textContent = (dataEntregaBr || '—');
          if (fProposta) fProposta.textContent = numero_proposta || '—';
          if (titleEl) titleEl.textContent = `${modelo || ''} - ${cliente_nome || ''}`.trim();

          closeModalGeneric('modalFichaTecnica');
          alert('Ficha técnica salva com sucesso.');
        })
        .catch(err => {
          alert('Erro ao salvar: ' + (err && err.message ? err.message : err));
        });
      } catch (e) {
        alert('Erro ao processar salvamento: ' + (e && e.message ? e.message : e));
      }
    });
  }

  // Funções para informações complementares
  function loadComplementaryInfo(boatId) {
    const tbody = document.getElementById('complementaryInfoTableBody');
    if (!tbody) return;

    fetch('api/barcos.php?action=listar_informacoes_extras&barco_id=' + encodeURIComponent(boatId), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
      .then(res => res.json())
      .then(json => {
        if (!json || json.ok !== true) {
          console.warn('Erro ao carregar informações complementares:', json ? json.error : 'Resposta inválida');
          return;
        }
        renderComplementaryInfo(json.data || []);
      })
      .catch(err => {
        console.warn('Erro ao carregar informações complementares:', err);
      });
  }

  function renderComplementaryInfo(infos) {
    const tbody = document.getElementById('complementaryInfoTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!infos.length) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="3" class="text-center text-muted">
          Nenhuma informação complementar adicionada ainda.
        </td>
      `;
      tbody.appendChild(emptyRow);
      return;
    }

    infos.forEach(info => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(info.nome)}</td>
        <td>${escapeHtml(info.valor)}</td>
        <td class="text-end">
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteComplementaryInfo(${info.id})" aria-label="Excluir" title="Excluir">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Handler para adicionar informação complementar
   const addInfoBtn = document.getElementById('addInfoBtn');
   if (addInfoBtn) {
     addInfoBtn.addEventListener('click', function() {
       const nomeInput = document.getElementById('infoNome');
       const valorInput = document.getElementById('infoValor');
       
       if (!nomeInput || !valorInput) return;
       
       const nome = nomeInput.value.trim();
       const valor = valorInput.value.trim();
       
       if (!nome || !valor) {
         alert('Por favor, preencha todos os campos.');
         return;
       }
       
       const params = new URLSearchParams(window.location.search);
       const boatId = parseInt(params.get('id'), 10);
       
       if (!boatId) {
         alert('ID do barco não encontrado.');
         return;
       }
       
       fetch('api/barcos.php?action=adicionar_informacao_extra', {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           barco_id: boatId,
           nome: nome,
           valor: valor
         })
       })
         .then(res => res.json())
         .then(json => {
           if (!json || json.ok !== true) {
             const msg = (json && json.error) ? json.error : 'Falha ao adicionar informação';
             throw new Error(msg);
           }
           
           // Limpar campos
           nomeInput.value = '';
           valorInput.value = '';
           
           // Fechar modal com utilitário unificado
           closeModalGeneric('modalAddInfo');
           
           // Recarregar a lista
           loadComplementaryInfo(boatId);
         })
         .catch(err => {
           alert('Erro ao adicionar: ' + (err && err.message ? err.message : err));
         });
     });
   }

   // Função global para excluir informação complementar
  window.deleteComplementaryInfo = function(id) {
    if (!confirm('Tem certeza que deseja excluir esta informação complementar?')) {
      return;
    }

    fetch('api/barcos.php?action=excluir_informacao_extra', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: id })
    })
      .then(res => res.json())
      .then(json => {
        if (!json || json.ok !== true) {
          const msg = (json && json.error) ? json.error : 'Falha ao excluir informação';
          throw new Error(msg);
        }
        // Recarregar a lista
        const params = new URLSearchParams(window.location.search);
        const boatId = parseInt(params.get('id'), 10);
        if (boatId) {
          loadComplementaryInfo(boatId);
        }
      })
      .catch(err => {
        alert('Erro ao excluir: ' + (err && err.message ? err.message : err));
      });
  };

  // ===== Opcionais =====
  let currentOpcionalId = null;
  let currentEditingOpcional = null;
  let opcionaisData = [];
  let opcOrderMode = 'default'; // 'default' | 'installed_first' | 'pending_first'

  async function loadOpcionais(barcoId) {
    try {
      const url = 'api/opcionais.php?action=listar&barco_id=' + encodeURIComponent(barcoId);
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      const json = await res.json();
      if (!json || json.ok !== true) {
        console.warn('Erro ao carregar opcionais:', json ? json.error : 'Resposta inválida');
        renderOpcionais([]);
        return;
      }
      opcionaisData = json.data || [];
      renderOpcionais(opcionaisData);
      updateOpcCounters(opcionaisData);
    } catch (err) {
      console.warn('Erro ao carregar opcionais:', err);
      opcionaisData = [];
      renderOpcionais([]);
      updateOpcCounters([]);
    }
  }

  function renderOpcionais(opcs) {
    const grid = document.getElementById('optionalGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!opcs || opcs.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-muted';
      empty.textContent = 'Nenhum opcional cadastrado.';
      grid.appendChild(empty);
      return;
    }
    // Ordenação conforme modo selecionado
    let list = [...opcs];
    if (opcOrderMode === 'installed_first') {
      list.sort((a, b) => Number(b.instalado) - Number(a.instalado));
    } else if (opcOrderMode === 'pending_first') {
      list.sort((a, b) => Number(a.instalado) - Number(b.instalado));
    }

    list.forEach(opc => {
      const installed = Number(opc.instalado) === 1;
      const card = document.createElement('div');
      card.className = 'optional-card' + (installed ? ' installed' : '');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Editar opcional');
      card.setAttribute('title', 'Editar opcional');
      card.addEventListener('click', () => openEditOpcional(Number(opc.id)));

      const header = document.createElement('div');
      header.className = 'optional-header';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'optional-name';
      nameSpan.textContent = opc.nome || '';

      const qtySpan = document.createElement('span');
      qtySpan.className = 'optional-qty badge bg-primary';
      const qtd = (opc.quantidade != null && opc.quantidade !== '') ? Number(opc.quantidade) : 0;
      qtySpan.textContent = 'Qtd: ' + (isNaN(qtd) ? '—' : String(qtd));

      const icon = document.createElement('i');
      icon.className = 'bi bi-check-circle-fill optional-installed-icon';
      icon.setAttribute('aria-hidden', 'true');

      header.append(nameSpan, qtySpan, icon);
      const desc = document.createElement('div');
      desc.className = 'optional-desc';
      const texto = (opc.descricao || '').toString();
      const obs = (opc.observacao || '').toString();
      desc.textContent = obs ? (texto ? texto + ' — ' + obs : obs) : (texto || '');

      card.append(header, desc);
      grid.appendChild(card);
    });
  }

  window.openEditOpcional = function(id) {
    currentOpcionalId = id;
    const editModalEl = document.getElementById('modalEditOpcional');
    // Buscar dados atualizados do opcional
    fetch('api/opcionais.php?action=listar&barco_id=' + encodeURIComponent(boatId))
      .then(r => r.json())
      .then(json => {
        if (!json || json.ok !== true) return;
        const opc = (json.data || []).find(o => Number(o.id) === Number(id));
        if (!opc) return;
        currentEditingOpcional = opc;
        const nomeEl = document.getElementById('opcNomeEdit');
        const qtdEl = document.getElementById('opcQtdEdit');
        const descEl = document.getElementById('opcDescEdit');
        const consEl = document.getElementById('opcConsEdit');
        const instEl = document.getElementById('opcInstalledEdit');
        if (nomeEl) nomeEl.value = opc.nome || '';
        if (qtdEl) qtdEl.value = (opc.quantidade != null ? String(opc.quantidade) : '');
        if (descEl) descEl.value = opc.descricao || '';
        if (consEl) consEl.value = opc.observacao || '';
        if (instEl) instEl.checked = Number(opc.instalado) === 1;
        if (typeof bootstrap !== 'undefined' && editModalEl) {
          const modal = new bootstrap.Modal(editModalEl);
          modal.show();
        }
      })
      .catch(() => {});
  };

  const saveOpcionalBtn = document.getElementById('saveOpcionalBtn');
  if (saveOpcionalBtn) {
    saveOpcionalBtn.addEventListener('click', async () => {
      if (!currentOpcionalId) {
        alert('Nenhum opcional selecionado para edição.');
        return;
      }
      try {
        const nomeEl = document.getElementById('opcNomeEdit');
        const qtdEl = document.getElementById('opcQtdEdit');
        const descEl = document.getElementById('opcDescEdit');
        const consEl = document.getElementById('opcConsEdit');
        const instEl = document.getElementById('opcInstalledEdit');
        const nome = nomeEl ? nomeEl.value.trim() : '';
        const quantidade = qtdEl ? parseFloat(qtdEl.value || '0') : 0;
        const descricao = descEl ? descEl.value.trim() : '';
        const observacao = consEl ? consEl.value.trim() : '';
        const instalado = instEl && instEl.checked ? 1 : 0;

        const resp = await fetch('api/opcionais.php', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'editar', id: currentOpcionalId, nome, quantidade, descricao, observacao, instalado })
        });
        const json = await resp.json();
        if (!json || json.ok !== true) {
          const msg = (json && json.error) ? json.error : 'Falha ao salvar opcional';
          throw new Error(msg);
        }
        closeModalGeneric('modalEditOpcional');
        await loadOpcionais(boatId);
      } catch (err) {
        alert('Erro ao salvar: ' + (err && err.message ? err.message : err));
      }
    });
  }

  const deleteOpcionalBtn = document.getElementById('deleteOpcionalBtn');
  if (deleteOpcionalBtn) {
    deleteOpcionalBtn.addEventListener('click', async () => {
      if (!currentOpcionalId) {
        alert('Nenhum opcional selecionado para exclusão.');
        return;
      }
      try {
        const resp = await fetch('api/opcionais.php', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'excluir', id: currentOpcionalId })
        });
        const json = await resp.json();
        if (!json || json.ok !== true) {
          const msg = (json && json.error) ? json.error : 'Falha ao excluir opcional';
          throw new Error(msg);
        }
        closeModalGeneric('modalDeleteOpcional');
        await loadOpcionais(boatId);
      } catch (err) {
        alert('Erro ao excluir: ' + (err && err.message ? err.message : err));
      }
    });
  }

  // Duplicar opcional no modal de edição
  const duplicateOpcionalBtn = document.getElementById('duplicateOpcionalBtn');
  if (duplicateOpcionalBtn) {
    duplicateOpcionalBtn.addEventListener('click', async () => {
      try {
        if (!currentEditingOpcional) {
          alert('Nenhum opcional selecionado para duplicação.');
          return;
        }
        const { nome, quantidade, descricao, observacao, instalado } = currentEditingOpcional;
        const resp = await fetch('api/opcionais.php', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'adicionar', barco_id: boatId, nome, quantidade, descricao, observacao, instalado })
        });
        const json = await resp.json();
        if (!json || json.ok !== true) {
          const msg = (json && json.error) ? json.error : 'Falha ao duplicar opcional';
          throw new Error(msg);
        }
        await loadOpcionais(boatId);
      } catch (err) {
        alert('Erro ao duplicar: ' + (err && err.message ? err.message : err));
      }
    });
  }

  // Atualiza contadores e associa cliques para ordenar
  function updateOpcCounters(opcs) {
    const total = opcs.length;
    const installed = opcs.filter(o => Number(o.instalado) === 1).length;
    const pending = total - installed;
    const tEl = document.getElementById('opcTotalCount');
    const iEl = document.getElementById('opcInstalledCount');
    const pEl = document.getElementById('opcPendingCount');
    if (tEl) tEl.textContent = String(total);
    if (iEl) iEl.textContent = String(installed);
    if (pEl) pEl.textContent = String(pending);

    const btnTotal = document.getElementById('opcCountTotal');
    const btnInstalled = document.getElementById('opcCountInstalados');
    const btnPending = document.getElementById('opcCountPendentes');
    if (btnTotal && !btnTotal.dataset.bound) {
      btnTotal.addEventListener('click', () => { opcOrderMode = 'default'; renderOpcionais(opcionaisData); });
      btnTotal.dataset.bound = '1';
    }
    if (btnInstalled && !btnInstalled.dataset.bound) {
      btnInstalled.addEventListener('click', () => { opcOrderMode = 'installed_first'; renderOpcionais(opcionaisData); });
      btnInstalled.dataset.bound = '1';
    }
    if (btnPending && !btnPending.dataset.bound) {
      btnPending.addEventListener('click', () => { opcOrderMode = 'pending_first'; renderOpcionais(opcionaisData); });
      btnPending.dataset.bound = '1';
    }
  }

  const addOpcionalBtn = document.getElementById('addOpcionalBtn');
  if (addOpcionalBtn) {
    // Mitiga travamentos: garante limpeza de backdrops antes de abrir o modal
    try {
      const addModalEl = document.getElementById('modalAddOpcional');
      if (addModalEl) {
        addModalEl.addEventListener('show.bs.modal', () => {
          try { cleanupModalArtifacts(); } catch (_) {}
        });
        addModalEl.addEventListener('hidden.bs.modal', () => {
          try { cleanupModalArtifacts(); } catch (_) {}
        });
      }
    } catch (_) {}

    addOpcionalBtn.addEventListener('click', async () => {
      try {
        const nomeEl = document.getElementById('opcNome');
        const qtdEl = document.getElementById('opcQtd');
        const descEl = document.getElementById('opcDesc');
        const consEl = document.getElementById('opcCons');
        const nome = nomeEl ? nomeEl.value.trim() : '';
        const quantidade = qtdEl ? parseFloat(qtdEl.value || '0') : 0;
        const descricao = descEl ? descEl.value.trim() : '';
        const observacao = consEl ? consEl.value.trim() : '';

        if (!nome) { alert('Informe o nome do opcional.'); return; }

        const resp = await fetch('api/opcionais.php', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'adicionar', barco_id: boatId, nome, quantidade, descricao, observacao, instalado: 0 })
        });
        const json = await resp.json();
        if (!json || json.ok !== true) {
          const msg = (json && json.error) ? json.error : 'Falha ao adicionar opcional';
          throw new Error(msg);
        }
        // Limpar
        if (nomeEl) nomeEl.value = '';
        if (qtdEl) qtdEl.value = '';
        if (descEl) descEl.value = '';
        if (consEl) consEl.value = '';
        // Evita estado residual de modal/backdrop
        closeModalGeneric('modalAddOpcional');
        await loadOpcionais(boatId);
      } catch (err) {
        alert('Erro ao adicionar: ' + (err && err.message ? err.message : err));
      }
    });
  }

  // Inicializar ao abrir página
  loadOpcionais(boatId);

  // ===== Documentação (Documentos) =====
  // Carregar documentos junto com outras informações ao abrir a página
  loadDocumentos(boatId);

  function toDisplayDateDocs(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function closeModalGeneric(modalId) {
    try {
      const modalElem = document.getElementById(modalId);
      if (!modalElem) return;

      // Se Bootstrap 5 estiver disponível, use apenas a API oficial
      if (window.bootstrap && bootstrap.Modal) {
        try {
          // Remover foco ativo dentro do modal para evitar avisos de aria-hidden
          const active = document.activeElement;
          if (active && modalElem.contains(active)) {
            try { active.blur(); } catch (_) {}
          }
          const instance = bootstrap.Modal.getOrCreateInstance(modalElem);
          instance.hide();
          // Cleanup defensivo após transição
          setTimeout(() => { try { cleanupModalArtifacts(); } catch (_) {} }, 50);
          return;
        } catch (_) {}
      }

      // Fallback jQuery (Bootstrap 4)
      if (typeof window.$ === 'function') {
        try { window.$('#' + modalId).modal('hide'); return; } catch (_) {}
      }

      // Fallback mínimo (vanilla): apenas ocultar
      modalElem.classList.remove('show');
      modalElem.style.display = 'none';
      // Cleanup defensivo
      try { cleanupModalArtifacts(); } catch (_) {}
    } catch (_) {}
  }

  // Limpeza defensiva de artefatos de modal (Bootstrap 5)
  function cleanupModalArtifacts() {
    try {
      // Se não há nenhum modal aberto/visível, remova backdrop e estado modal-open
      const anyOpen = document.querySelectorAll('.modal.show').length > 0;
      if (anyOpen) return;
      document.body.classList.remove('modal-open');
      // Remover estilos de compensação de scroll aplicados pelo Bootstrap
      try { document.body.style.removeProperty('paddingRight'); } catch (_) {}
      try { document.body.style.removeProperty('overflow'); } catch (_) {}
      document.querySelectorAll('.modal-backdrop').forEach(b => {
        try { b.remove(); } catch (_) {}
      });
    } catch (_) {}
  }

  // Anexa listeners para garantir limpeza após transições de fechamento
  try {
    document.addEventListener('hidden.bs.modal', cleanupModalArtifacts);
  } catch (_) {}

  async function loadDocumentos(barcoId) {
    try {
      const url = 'api/documentos.php?action=listar&barco_id=' + encodeURIComponent(barcoId);
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      const json = await res.json();
      if (!json || json.ok !== true) {
        console.warn('Erro ao carregar documentos:', json ? json.error : 'Resposta inválida');
        renderDocumentos([]);
        return;
      }
      renderDocumentos(json.data || []);
    } catch (err) {
      console.warn('Erro ao carregar documentos:', err);
      renderDocumentos([]);
    }
  }

  function renderDocumentos(docs) {
    const tbody = document.getElementById('documentosTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!docs || docs.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="7" class="text-center text-muted">Nenhum documento cadastrado</td>`;
      tbody.appendChild(tr);
      return;
    }
    docs.forEach(doc => {
      const tr = document.createElement('tr');
      const titulo = escapeHtml(doc.titulo || '');
      const descricao = escapeHtml(doc.descricao || '');
      const tipo = escapeHtml(doc.tipo || '');
      const criado = toDisplayDateDocs(doc.criado_em || '');
      const link = doc.link ? escapeHtml(doc.link) : '';
      const publico = Number(doc.publico) === 1 ? 1 : 0;
      const publicoIcon = publico === 1 ? 'bi-unlock' : 'bi-lock';
      const publicoBtnClass = publico === 1 ? 'btn-outline-success' : 'btn-outline-secondary';
      const downloadBtn = link ? `<a href="${link}" class="btn btn-sm btn_estaleirooff" download aria-label="Download" title="Download"><i class="bi bi-download"></i></a>` : '<span class="text-muted">—</span>';
      tr.innerHTML = `
        <td style="padding-left: 20px; class="tableminwidth">${titulo}</td>
        <td style="padding-left: 20px;">${descricao}</td>
        <td>${tipo}</td>
        <td>${criado}</td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-warning publico-toggle ${publicoBtnClass}" onclick="window.toggleDocumentoPublico(${Number(doc.id)}, ${publico})" aria-label="${publico ? 'Tornar privado' : 'Tornar público'}" title="${publico ? 'Documento público' : 'Documento privado'}">
            <i class="bi ${publicoIcon} ${publico ? 'publico-icon-public' : 'publico-icon-private'}"></i>
          </button>
        </td>
        <td>${downloadBtn}</td>
        <td class="text-end" style="padding-right: 20px;">
          <button style="display: inline" type="button" class="btn btn-sm btn_estaleirooff me-2" data-bs-toggle="modal" data-bs-target="#modalEditDocumento" onclick="window.openEditDocumento(${Number(doc.id)})" aria-label="Editar" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-sm btn_estaleirooff me-2" data-bs-toggle="modal" data-bs-target="#modalShareDocumento" onclick="window.openShareDocumento(${Number(doc.id)})" aria-label="Compartilhar" title="Compartilhar">
            <i class="bi bi-share"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger" data-bs-toggle="modal" data-bs-target="#modalDeleteDocumento" onclick="window.openDeleteDocumento(${Number(doc.id)})" aria-label="Excluir" title="Excluir">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  let currentDocumentoId = null;
  window.openEditDocumento = function(id) {
    currentDocumentoId = id;
    // Carregar dados do documento selecionado e preencher modal
    fetch('api/documentos.php?action=listar&barco_id=' + encodeURIComponent(boatId))
      .then(r => r.json())
      .then(json => {
        if (!json || json.ok !== true) return;
        const doc = (json.data || []).find(d => Number(d.id) === Number(id));
        if (!doc) return;
        const tituloEl = document.getElementById('editTitulo');
        const descEl = document.getElementById('editDescricao');
        const tipoEl = document.getElementById('editTipo');
        const dataEl = document.getElementById('editData');
        if (tituloEl) tituloEl.value = doc.titulo || '';
        if (descEl) descEl.value = doc.descricao || '';
        if (tipoEl) tipoEl.value = doc.tipo || '';
        if (dataEl) dataEl.value = (doc.criado_em || '').slice(0,10);
      })
      .catch(() => {});
  };

  window.openDeleteDocumento = function(id) {
    currentDocumentoId = id;
    fetch('api/documentos.php?action=listar&barco_id=' + encodeURIComponent(boatId))
      .then(r => r.json())
      .then(json => {
        if (!json || json.ok !== true) return;
        const doc = (json.data || []).find(d => Number(d.id) === Number(id));
        const bodyEl = document.querySelector('#modalDeleteDocumento .modal-body');
        if (bodyEl && doc) {
          bodyEl.innerHTML = `Tem certeza que deseja excluir "${escapeHtml(doc.titulo || '')}"?`;
        }
      })
      .catch(() => {});
  };

  // Abre e popula o modal de compartilhamento de documento
  window.openShareDocumento = function(id) {
    currentDocumentoId = id;
    fetch('api/documentos.php?action=listar&barco_id=' + encodeURIComponent(boatId))
      .then(r => r.json())
      .then(json => {
        if (!json || json.ok !== true) return;
        const doc = (json.data || []).find(d => Number(d.id) === Number(id));
        if (!doc) return;

        const titulo = doc.titulo || 'Documento';
        const linkRaw = doc.link || '';
        // Slug amigável a partir do título
        const makeSlug = (s) => {
          const t = (s || '').toString().trim().toLowerCase();
          const norm = t.normalize ? t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : t;
          return norm
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'documento';
        };
        const slug = makeSlug(titulo);
        // Se documento está público, usar URL amigável /docs/<id>-<slug>; caso contrário, usar link armazenado
        const absoluteLink = (Number(doc.publico) === 1)
          ? new URL('/docs/' + String(id) + '-' + slug, window.location.origin).href
          : (linkRaw ? new URL(linkRaw, window.location.origin).href : '');

        // Atualiza observação de visibilidade
        const noteEl = document.getElementById('shareVisibilityNote');
        if (noteEl) {
          const isPublic = Number(doc.publico) === 1;
          noteEl.textContent = isPublic ? 'Documento público' : 'Documento privado — necessário login no sistema';
          noteEl.classList.remove('text-muted', 'text-success');
          noteEl.classList.add(isPublic ? 'text-success' : 'text-muted');
        }

        const inputEl = document.getElementById('shareLinkInput');
        const copyBtn = document.getElementById('shareCopyBtn');
        const wppBtn = document.getElementById('shareWhatsAppBtn');
        const mailBtn = document.getElementById('shareEmailBtn');
        const downloadBtn = document.getElementById('shareDownloadBtn');

        if (inputEl) inputEl.value = absoluteLink;
        if (downloadBtn) downloadBtn.href = absoluteLink || '#';

        const wppText = `Documento: ${titulo}\n${absoluteLink}`;
        const wppHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(wppText)}`;
        if (wppBtn) wppBtn.href = absoluteLink ? wppHref : '#';

        const mailSubject = `Documento: ${titulo}`;
        const mailBody = `Segue link do documento: ${absoluteLink}`;
        const mailHref = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
        if (mailBtn) mailBtn.href = absoluteLink ? mailHref : '#';

        if (copyBtn && !copyBtn.__bound) {
          copyBtn.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText((inputEl && inputEl.value) || '');
              copyBtn.classList.add('btn-success');
              setTimeout(() => copyBtn.classList.remove('btn-success'), 1200);
            } catch (_) {}
          });
          copyBtn.__bound = true;
        }
      })
      .catch(() => {});
  };

  // Alterna o estado de publicação pública do documento (0 privado, 1 público)
  window.toggleDocumentoPublico = async function(id, atual) {
    try {
      const novoValor = atual === 1 ? 0 : 1;
      const fd = new FormData();
      fd.append('action', 'editar');
      fd.append('id', String(id));
      fd.append('publico', String(novoValor));
      const resp = await fetch('api/documentos.php', { method: 'POST', body: fd });
      const json = await resp.json();
      if (!json || json.ok !== true) {
        const msg = (json && json.error) ? json.error : 'Falha ao atualizar visibilidade';
        throw new Error(msg);
      }
      await loadDocumentos(boatId);
    } catch (err) {
      alert('Erro ao atualizar visibilidade: ' + (err && err.message ? err.message : err));
    }
  };

  // Prefill data de upload com hoje ao abrir a página
  (function prefillAddDate(){
    const addDataEl = document.getElementById('addData');
    if (addDataEl) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      addDataEl.value = `${yyyy}-${mm}-${dd}`;
    }
  })();

  const addDocumentoBtn = document.getElementById('addDocumentoBtn');
  if (addDocumentoBtn) {
    addDocumentoBtn.addEventListener('click', async () => {
      try {
        const tituloEl = document.getElementById('addTitulo');
        const descEl = document.getElementById('addDescricao');
        const tipoEl = document.getElementById('addTipo');
        const dataEl = document.getElementById('addData');
        const fileEl = document.getElementById('addArquivo');

        const titulo = tituloEl ? tituloEl.value.trim() : '';
        const descricao = descEl ? descEl.value.trim() : '';
        const tipo = tipoEl ? tipoEl.value.trim() : '';
        const criado_em = dataEl ? dataEl.value.trim() : '';
        const arquivo = fileEl && fileEl.files && fileEl.files[0] ? fileEl.files[0] : null;

        if (!titulo || !tipo) {
          alert('Por favor, preencha Título e Tipo.');
          return;
        }

        const fd = new FormData();
        fd.append('action', 'adicionar');
        fd.append('barco_id', String(boatId));
        fd.append('titulo', titulo);
        fd.append('descricao', descricao);
        fd.append('tipo', tipo);
        if (criado_em) fd.append('criado_em', criado_em);
        if (arquivo) fd.append('arquivo', arquivo);

        const resp = await fetch('api/documentos.php', { method: 'POST', body: fd });
        const json = await resp.json();
        if (!json || json.ok !== true) {
          const msg = (json && json.error) ? json.error : 'Falha ao adicionar documento';
          throw new Error(msg);
        }

        // Limpar campos
        if (tituloEl) tituloEl.value = '';
        if (descEl) descEl.value = '';
        if (tipoEl) tipoEl.value = 'PDF';
        // manter data preenchida
        if (fileEl) fileEl.value = '';

        closeModalGeneric('modalAddDocumento');
        await loadDocumentos(boatId);
      } catch (err) {
        alert('Erro ao adicionar: ' + (err && err.message ? err.message : err));
      }
    });
  }

  const editDocumentoBtn = document.getElementById('editDocumentoBtn');
  if (editDocumentoBtn) {
    editDocumentoBtn.addEventListener('click', async () => {
      if (!currentDocumentoId) {
        alert('Nenhum documento selecionado para edição.');
        return;
      }
      try {
        const tituloEl = document.getElementById('editTitulo');
        const descEl = document.getElementById('editDescricao');
        const tipoEl = document.getElementById('editTipo');
        const dataEl = document.getElementById('editData');
        const fileEl = document.getElementById('editArquivo');

        const titulo = tituloEl ? tituloEl.value.trim() : '';
        const descricao = descEl ? descEl.value.trim() : '';
        const tipo = tipoEl ? tipoEl.value.trim() : '';
        const criado_em = dataEl ? dataEl.value.trim() : '';
        const arquivo = fileEl && fileEl.files && fileEl.files[0] ? fileEl.files[0] : null;

        const fd = new FormData();
        fd.append('action', 'editar');
        fd.append('id', String(currentDocumentoId));
        fd.append('titulo', titulo);
        fd.append('descricao', descricao);
        fd.append('tipo', tipo);
        fd.append('criado_em', criado_em);
        if (arquivo) fd.append('arquivo', arquivo);

        const resp = await fetch('api/documentos.php', { method: 'POST', body: fd });
        const json = await resp.json();
        if (!json || json.ok !== true) {
          const msg = (json && json.error) ? json.error : 'Falha ao editar documento';
          throw new Error(msg);
        }

        closeModalGeneric('modalEditDocumento');
        await loadDocumentos(boatId);
      } catch (err) {
        alert('Erro ao editar: ' + (err && err.message ? err.message : err));
      }
    });
  }

  const deleteDocumentoBtn = document.getElementById('deleteDocumentoBtn');
  if (deleteDocumentoBtn) {
    deleteDocumentoBtn.addEventListener('click', async () => {
      if (!currentDocumentoId) {
        alert('Nenhum documento selecionado para exclusão.');
        return;
      }
      try {
        const fd = new FormData();
        fd.append('action', 'excluir');
        fd.append('id', String(currentDocumentoId));
        const resp = await fetch('api/documentos.php', { method: 'POST', body: fd });
        const json = await resp.json();
        if (!json || json.ok !== true) {
          const msg = (json && json.error) ? json.error : 'Falha ao excluir documento';
          throw new Error(msg);
        }
        closeModalGeneric('modalDeleteDocumento');
        await loadDocumentos(boatId);
      } catch (err) {
        alert('Erro ao excluir: ' + (err && err.message ? err.message : err));
      }
    });
  }
});
  
