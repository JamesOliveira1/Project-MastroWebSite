// ===== Barco (inventário) ===== //

  // Opções iniciais para Categoria
  const INVENTARIO_CATEGORIAS = ['Compósitos', 'Acessórios', 'Outros'];

  // Opções de Tipo para o item
  const INVENTARIO_TIPOS = ['Matéria-prima', 'Uso e consumo'];

  function populateCategoriaSelect(selectEl) {
    if (!selectEl) return;
    // Limpa e popula opções
    selectEl.innerHTML = '';
    INVENTARIO_CATEGORIAS.forEach(function(cat) {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      selectEl.appendChild(opt);
    });
  }

  function populateTipoSelect(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    INVENTARIO_TIPOS.forEach(function(tipo) {
      const opt = document.createElement('option');
      opt.value = tipo;
      opt.textContent = tipo;
      selectEl.appendChild(opt);
    });
  }

  // Row click handler para abrir modal de edição com dados
  let SELECTED_INV_ROW = null; // referência da linha selecionada
  function attachInventarioRowHandlers(tr) {
    if (!tr) return;
    tr.addEventListener('click', function() {
      SELECTED_INV_ROW = tr;
      const editModalEl = document.getElementById('modalEditInventario');
      if (typeof bootstrap !== 'undefined' && editModalEl) {
        // Preenche campos do modal com dados da linha
        const tds = tr.querySelectorAll('td');
        const invCod = document.getElementById('invCod');
        const invItem = document.getElementById('invItem');
        const invQtd = document.getElementById('invQtd');
        const invUn = document.getElementById('invUn');
        const invData = document.getElementById('invData');
        const invTipo = document.getElementById('invTipo');
        const invCategoria = document.getElementById('invCategoria');
        const invObs = document.getElementById('invObs');
        if (invCod) invCod.value = (tr.dataset.codigo || (tds[0] && tds[0].textContent.trim()) || '');
        if (invItem) invItem.value = (tds[1] && tds[1].textContent.trim()) || '';
        if (invQtd) invQtd.value = (tds[2] && tds[2].textContent.trim()) || '';
        if (invUn) invUn.value = (tr.dataset.unidade || (tds[3] && tds[3].textContent.trim()) || '');
        if (invData) invData.value = (tds[4] && (tds[4].textContent.trim()).replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$2-$1')) || (tds[4] && tds[4].textContent.trim()) || '';
        if (invTipo) { populateTipoSelect(invTipo); invTipo.value = (tds[5] && tds[5].textContent.trim()) || ''; }
        if (invCategoria) { populateCategoriaSelect(invCategoria); invCategoria.value = (tds[6] && tds[6].textContent.trim()) || ''; }
        if (invObs) invObs.value = (tds[7] && tds[7].textContent.trim()) || '';
        const modal = new bootstrap.Modal(editModalEl);
        modal.show();
      }
    });
  }

    // Inicializa interação da tabela de inventário
    function initializeInventarioTable() {
      try {
        const table = document.getElementById('inventario-table');
        if (!table) return;
        const tbody = table.querySelector('tbody');

        const updateEmptyState = function() {
          const hasRows = tbody.querySelectorAll('tr.inventario-row').length > 0;
          const emptyRow = tbody.querySelector('tr.inventario-empty');
          if (hasRows) {
            if (emptyRow) emptyRow.remove();
          } else {
            if (!emptyRow) {
              const tr = document.createElement('tr');
              tr.className = 'inventario-empty';
              const td = document.createElement('td');
              td.colSpan = 8;
              td.className = 'text-center text-muted';
              td.textContent = 'Nenhum item no inventário.';
              tr.appendChild(td);
              tbody.appendChild(tr);
            }
          }
        };

        // Clique na linha para abrir modal de edição
        tbody.querySelectorAll('tr.inventario-row').forEach(function(row) {
          attachInventarioRowHandlers(row);
        });

        // Ordenação por cabeçalho clicável
        const sortState = {};
        const ths = table.querySelectorAll('thead th[data-sort-key]');
        ths.forEach(function(th, idx) {
          th.addEventListener('click', function() {
            const rows = Array.from(tbody.querySelectorAll('tr.inventario-row'));
            if (rows.length === 0) {
              return; // nada para ordenar
            }
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
            updateEmptyState();
            try {
              renderInventarioPage();
              updateInventarioPagination();
            } catch (_) {}
          });
        });

        // Estado inicial
        updateEmptyState();
      } catch (e) {
        // Evita que erros externos interrompam os scripts locais
        console.warn('Inventário scripts warning:', e);
      }
    }

document.addEventListener('DOMContentLoaded', async function() {
  initializeInventarioTable();

  // Paginação da tabela de inventário (máximo de linhas visíveis)
  try {
    setupInventarioPagination();
    renderInventarioPage();
    updateInventarioPagination();
  } catch (e) {
    console.warn('Falha ao configurar paginação do inventário:', e);
  }

  // Também popula o seletor quando o modal for aberto manualmente
  const editModalEl = document.getElementById('modalEditInventario');
  if (editModalEl) {
    editModalEl.addEventListener('shown.bs.modal', function() {
      populateCategoriaSelect(editModalEl.querySelector('#invCategoria'));
      populateTipoSelect(editModalEl.querySelector('#invTipo'));
    });
    // Bind salvar e excluir
    const saveBtn = document.getElementById('invEditSaveBtn');
    const delBtn = document.getElementById('invDeleteConfirmBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async function() {
        try {
          if (!SELECTED_INV_ROW) return;
          const invId = parseInt(SELECTED_INV_ROW.dataset.inventarioId || '0', 10);
          if (!invId || invId <= 0) { alert('Item inválido para salvar.'); return; }
          const quantidade = parseFloat((document.getElementById('invQtd').value || '').trim());
          if (!isFinite(quantidade) || quantidade <= 0) { alert('Informe uma quantidade válida.'); return; }
          const payload = {
            id: invId,
            quantidade,
            data: (document.getElementById('invData').value || '').trim() || undefined,
            observacao: (document.getElementById('invObs').value || '').trim(),
            tipo: (document.getElementById('invTipo').value || '').trim(),
            categoria: (document.getElementById('invCategoria').value || '').trim()
          };
          const updated = await editarItemInventarioBarco(payload);
          // Atualiza linha da tabela com retorno
          const tds = SELECTED_INV_ROW.querySelectorAll('td');
          if (tds[2]) tds[2].textContent = String(updated.quantidade);
          if (tds[4]) tds[4].textContent = updated.data || (document.getElementById('invData').value || '');
          if (tds[5]) tds[5].textContent = updated.tipo || (document.getElementById('invTipo').value || '—');
          if (tds[6]) tds[6].textContent = updated.categoria || (document.getElementById('invCategoria').value || '—');
          if (tds[7]) tds[7].textContent = (document.getElementById('invObs').value || '—');
          // fecha modal
          const modal = (typeof bootstrap !== 'undefined') ? bootstrap.Modal.getInstance(editModalEl) || new bootstrap.Modal(editModalEl) : null;
          if (modal) modal.hide();
        } catch (e) {
          alert('Falha ao salvar: ' + (e && e.message ? e.message : e));
        }
      });
    }
    if (delBtn) {
      delBtn.addEventListener('click', async function() {
        try {
          if (!SELECTED_INV_ROW) return;
          const invId = parseInt(SELECTED_INV_ROW.dataset.inventarioId || '0', 10);
          if (!invId || invId <= 0) { alert('Item inválido para excluir.'); return; }
          await excluirItemInventarioBarco(invId);
          const table = document.getElementById('inventario-table');
          const tbody = table ? table.querySelector('tbody') : null;
          SELECTED_INV_ROW.remove();
          SELECTED_INV_ROW = null;
          // Atualiza estado vazio/paginação
          if (tbody && tbody.querySelectorAll('tr.inventario-row').length === 0) {
            const tr = document.createElement('tr');
            tr.className = 'inventario-empty';
            const td = document.createElement('td');
            td.colSpan = 8; td.className = 'text-center text-muted';
            td.textContent = 'Nenhum item no inventário.';
            tr.appendChild(td);
            tbody.appendChild(tr);
          }
          try { renderInventarioPage(); updateInventarioPagination(); } catch (_) {}
          // fecha modais
          const editModal = (typeof bootstrap !== 'undefined') ? bootstrap.Modal.getInstance(editModalEl) : null;
          if (editModal) editModal.hide();
          const delModalEl = document.getElementById('modalDeleteInventario');
          const delModal = (typeof bootstrap !== 'undefined' && delModalEl) ? bootstrap.Modal.getInstance(delModalEl) : null;
          if (delModal) delModal.hide();
        } catch (e) {
          alert('Falha ao excluir: ' + (e && e.message ? e.message : e));
        }
      });
    }
  }

  // Configura modal de Adicionar Inventário
  setupAddInventarioModal();

  // Carregar itens do inventário do barco ao abrir a página
  try {
    const barcoId = getBarcoIdFromURL();
    if (barcoId && barcoId > 0) {
      loadInventario(barcoId).then(() => {
        try { renderInventarioPage(); updateInventarioPagination(); } catch (_) {}
      });
    }
  } catch (_) {}

  // Exportar inventário do barco (Excel)
  try {
    const btnExport = document.getElementById('btnExportInventario');
    if (btnExport) {
      btnExport.addEventListener('click', function() {
        const barcoId = getBarcoIdFromURL();
        if (!barcoId || barcoId <= 0) {
          alert('Barco inválido para exportação.');
          return;
        }
        // Navega para o endpoint que gera o Excel
        const url = `./api/inventario.php?action=exportar_excel_inventario&barco_id=${encodeURIComponent(barcoId)}`;
        window.location.href = url;
      });
    }
  } catch (e) {
    console.warn('Falha ao configurar exportação do inventário:', e);
  }

  // Modal: Solicitar Pedido
  try {
    const pedidoModalEl = document.getElementById('modalSolicitarPedido');
    if (pedidoModalEl && typeof bootstrap !== 'undefined') {
      pedidoModalEl.addEventListener('shown.bs.modal', function() {
        prepareSolicitarPedidoModal();
      });
    }
    const searchBtn = document.getElementById('pedidoItemSearchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        const q = (document.getElementById('pedidoItemSearch').value || '').trim();
        if (!q) { setPedidoStatus('Digite um nome para buscar.'); return; }
        doPedidoSearch(q, true);
      });
    }
    const searchCodBtn = document.getElementById('pedidoSearchCodBtn');
    if (searchCodBtn) {
      searchCodBtn.addEventListener('click', function() {
        const q = (document.getElementById('pedidoSearchCod').value || '').trim();
        if (!q) { setPedidoStatus('Digite um código para buscar.'); return; }
        doPedidoSearch(q, true);
      });
    }
    const enviarBtn = document.getElementById('pedidoEnviarBtn');
    if (enviarBtn) {
      enviarBtn.addEventListener('click', function() {
        enviarSolicitacaoPedido();
      });
    }
    const cancelarBtn = document.getElementById('pedidoCancelarBtn');
    if (cancelarBtn) {
      cancelarBtn.addEventListener('click', function() {
        resetSolicitarPedidoState();
      });
    }
  } catch (e) {
    console.warn('Falha ao configurar modal Solicitar Pedido:', e);
  }

  // Documento do Inventário: preparar modal de adicionar
  try {
    const addDocInvModalEl = document.getElementById('modalAddDocumentoInventario');
    if (addDocInvModalEl && typeof bootstrap !== 'undefined') {
      addDocInvModalEl.addEventListener('shown.bs.modal', async function() {
        // Define data de hoje
        const dateInput = document.getElementById('docinv-data');
        if (dateInput) {
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth()+1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          dateInput.value = `${y}-${m}-${d}`;
        }

        // Limpa seleção de arquivo
        const fileInput = document.getElementById('docinv-file');
        if (fileInput) { try { fileInput.value = ''; } catch (_) {} }

        // Popula seletor de itens do inventário do barco
        const selectEl = document.getElementById('docinv-inventario-item');
        if (selectEl) {
          // Reset e adiciona opção padrão
          selectEl.innerHTML = '';
          const optNone = document.createElement('option');
          optNone.value = '';
          optNone.textContent = 'Não associado';
          selectEl.appendChild(optNone);
          selectEl.value = '';

          const barcoId = getBarcoIdFromURL();
          if (barcoId && barcoId > 0) {
            try {
              const res = await fetch(`./api/inventario.php?action=listar_barco&barco_id=${encodeURIComponent(barcoId)}`);
              const json = await res.json();
              let rows = (json && json.ok === true && Array.isArray(json.data)) ? json.data : [];
              rows.sort(function(a,b){
                const ai = parseInt(a.inventario_id || a.id || 0, 10);
                const bi = parseInt(b.inventario_id || b.id || 0, 10);
                return bi - ai; // últimos adicionados primeiro
              });
              const added = new Set();
              rows.forEach(r => {
                const idVal = parseInt(r.inventario_id || r.id || 0, 10);
                if (!idVal || added.has(idVal)) return;
                added.add(idVal);
                const opt = document.createElement('option');
                opt.value = String(idVal);
                const label = r.nome_item ? r.nome_item : (r.codigo_produto || 'Item');
                opt.textContent = label;
                selectEl.appendChild(opt);
              });
              // Remover quaisquer duplicados por valor, caso múltiplos preenchimentos ocorram
              const seen = new Set();
              for (let i = 0; i < selectEl.options.length; i++) {
                const v = selectEl.options[i].value;
                if (v !== '' && seen.has(v)) { selectEl.remove(i); i--; }
                else { if (v !== '') seen.add(v); }
              }
              selectEl.size = Math.min(10, selectEl.options.length);
            } catch (e) {
              // Em caso de erro, mantém apenas a opção padrão
            }
          }
        }
      });
    }
  } catch (e) {
    console.warn('Falha ao preparar modal de documento do inventário:', e);
  }

  // Carregar documentos do inventário e configurar interações
  try {
    const barcoId = getBarcoIdFromURL();
    if (barcoId && barcoId > 0) {
      await loadDocumentoInventario(barcoId);
      setupDocInvPagination();
      renderDocInvPage();
      updateDocInvPagination();
    }
  } catch (e) {
    console.warn('Falha ao carregar documentos do inventário:', e);
  }

  // Adicionar documento
  const btnSaveDoc = document.getElementById('btnSaveDocumentoInventario');
  if (btnSaveDoc) {
    btnSaveDoc.addEventListener('click', async function() {
      try {
        const barcoId = getBarcoIdFromURL();
        if (!barcoId || barcoId <= 0) { alert('Barco inválido.'); return; }
        const titulo = (document.getElementById('docinv-titulo').value || '').trim();
        const tipo = (document.getElementById('docinv-tipo').value || '').trim();
        const observacao = (document.getElementById('docinv-descricao').value || '').trim();
        const data = (document.getElementById('docinv-data').value || '').trim();
        const invSel = document.getElementById('docinv-inventario-item');
        const inventarioId = invSel ? parseInt(invSel.value || '0', 10) : 0;
        const fileInput = document.getElementById('docinv-file');
        const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
        if (!titulo || !tipo) { alert('Informe título e tipo.'); return; }
        const fd = new FormData();
        fd.append('action', 'adicionar_documento_inventario');
        fd.append('barco_id', String(barcoId));
        fd.append('titulo', titulo);
        fd.append('tipo', tipo);
        fd.append('observacao', observacao);
        fd.append('criado_em', data || new Date().toISOString().slice(0,10));
        if (inventarioId > 0) fd.append('inventario_barco_id', String(inventarioId));
        if (file) fd.append('arquivo', file);
        const res = await fetch('./api/inventario.php', { method: 'POST', body: fd });
        const json = await res.json();
        if (!json || json.ok !== true) { throw new Error(json && json.error ? json.error : 'Falha ao salvar'); }
        appendDocumentoInventarioRow(json.data);
        // Fecha modal
        const modalEl = document.getElementById('modalAddDocumentoInventario');
        const modal = (typeof bootstrap !== 'undefined' && modalEl) ? bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl) : null;
        if (modal) modal.hide();
        renderDocInvPage();
        updateDocInvPagination();
      } catch (e) {
        alert('Falha ao salvar: ' + (e && e.message ? e.message : e));
      }
    });
  }

  // Atualizar documento
  const btnUpdateDoc = document.getElementById('btnUpdateDocumentoInventario');
  if (btnUpdateDoc) {
    btnUpdateDoc.addEventListener('click', async function() {
      try {
        const id = parseInt((document.getElementById('docinv-edit-id').value || '0'), 10);
        if (!id || id <= 0) { alert('Documento inválido.'); return; }
        const titulo = (document.getElementById('docinv-edit-titulo').value || '').trim();
        const tipo = (document.getElementById('docinv-edit-tipo').value || '').trim();
        const observacao = (document.getElementById('docinv-edit-descricao').value || '').trim();
        const data = (document.getElementById('docinv-edit-data').value || '').trim();
        const invSel = document.getElementById('docinv-edit-inventario-item');
        const inventarioId = invSel ? (invSel.value === '' ? 0 : parseInt(invSel.value || '0', 10)) : 0;
        const fileInput = document.getElementById('docinv-edit-file');
        const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
        const fd = new FormData();
        fd.append('action', 'editar_documento_inventario');
        fd.append('id', String(id));
        if (titulo) fd.append('titulo', titulo);
        if (tipo) fd.append('tipo', tipo);
        fd.append('observacao', observacao);
        if (data) fd.append('criado_em', data);
        fd.append('inventario_barco_id', inventarioId > 0 ? String(inventarioId) : '');
        if (file) fd.append('arquivo', file);
        const res = await fetch('./api/inventario.php', { method: 'POST', body: fd });
        const json = await res.json();
        if (!json || json.ok !== true) { throw new Error(json && json.error ? json.error : 'Falha ao atualizar'); }
        updateDocumentoInventarioRow(json.data);
        const modalEl = document.getElementById('modalEditDocumentoInventario');
        const modal = (typeof bootstrap !== 'undefined' && modalEl) ? bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl) : null;
        if (modal) modal.hide();
        renderDocInvPage();
        updateDocInvPagination();
      } catch (e) {
        alert('Falha ao atualizar: ' + (e && e.message ? e.message : e));
      }
    });
  }

  // Excluir documento
  const btnDeleteDoc = document.getElementById('btnDeleteDocumentoInventario');
  if (btnDeleteDoc) {
    btnDeleteDoc.addEventListener('click', async function() {
      try {
        const id = parseInt((document.getElementById('docinv-edit-id').value || '0'), 10);
        if (!id || id <= 0) { alert('Documento inválido.'); return; }
        const fd = new FormData();
        fd.append('action', 'excluir_documento_inventario');
        fd.append('id', String(id));
        const res = await fetch('./api/inventario.php', { method: 'POST', body: fd });
        const json = await res.json();
        if (!json || json.ok !== true) { throw new Error(json && json.error ? json.error : 'Falha ao excluir'); }
        removeDocumentoInventarioRow(id);
        ['modalDeleteDocumentoInventario','modalEditDocumentoInventario'].forEach(mid => {
          const el = document.getElementById(mid);
          const modal = (typeof bootstrap !== 'undefined' && el) ? bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el) : null;
          if (modal) modal.hide();
        });
        renderDocInvPage();
        updateDocInvPagination();
      } catch (e) {
        alert('Falha ao excluir: ' + (e && e.message ? e.message : e));
      }
    });
  }
});

// ===== Documentos do Inventário (Tabela) =====
let docInvPageSize = 10;
let docInvOffset = 0;

function getDocInvRows() {
  const table = document.getElementById('documento-inventario-table');
  const tbody = table ? table.querySelector('tbody') : null;
  if (!tbody) return [];
  return Array.from(tbody.querySelectorAll('tr.documento-inventario-row'));
}

function renderDocInvPage() {
  const rows = getDocInvRows();
  const start = Math.max(0, docInvOffset);
  const end = Math.min(rows.length, docInvOffset + docInvPageSize);
  rows.forEach(function(row, idx) {
    row.style.display = (idx >= start && idx < end) ? '' : 'none';
  });
}

function updateDocInvPagination() {
  const rows = getDocInvRows();
  const prevBtn = document.getElementById('documento-inventario-prev');
  const nextBtn = document.getElementById('documento-inventario-next');
  if (prevBtn) prevBtn.disabled = docInvOffset <= 0;
  if (nextBtn) nextBtn.disabled = (docInvOffset + docInvPageSize) >= rows.length || rows.length === 0;
}

function setupDocInvPagination() {
  const prevBtn = document.getElementById('documento-inventario-prev');
  const nextBtn = document.getElementById('documento-inventario-next');
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (docInvOffset <= 0) return;
      docInvOffset = Math.max(0, docInvOffset - docInvPageSize);
      renderDocInvPage();
      updateDocInvPagination();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      const rows = getDocInvRows();
      if ((docInvOffset + docInvPageSize) >= rows.length) return;
      docInvOffset = docInvOffset + docInvPageSize;
      renderDocInvPage();
      updateDocInvPagination();
    });
  }
}

async function loadDocumentoInventario(barcoId) {
  const table = document.getElementById('documento-inventario-table');
  const tbody = table ? table.querySelector('tbody') : null;
  if (!tbody || !barcoId) return;
  const url = `./api/inventario.php?action=listar_documentos_inventario&barco_id=${encodeURIComponent(barcoId)}`;
  const res = await fetch(url);
  const json = await res.json();
  const rows = (json && json.ok === true && Array.isArray(json.data)) ? json.data : [];
  tbody.innerHTML = '';
  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.className = 'documento-inventario-empty';
    const td = document.createElement('td');
    td.colSpan = 8; td.className = 'text-center text-muted';
    td.textContent = 'Nenhum documento ou nota relacionado aos itens.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  rows.forEach(r => appendDocumentoInventarioRow(r));
}

function appendDocumentoInventarioRow(r) {
  const table = document.getElementById('documento-inventario-table');
  const tbody = table ? table.querySelector('tbody') : null;
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.className = 'documento-inventario-row';
  tr.dataset.docinvId = String(r.id || '');
  tr.dataset.inventarioId = String(r.inventario_barco_id || '');
  tr.dataset.link = String(r.link || '');
  tr.innerHTML = `
    <td style="padding-left:20px;">${r.titulo || ''}</td>
    <td>${r.associado_nome || '—'}</td>
    <td>${r.observacao || '—'}</td>
    <td>${r.tipo || '—'}</td>
    <td>${formatDateBR(r.criado_em || '')}</td>
    <td style="padding-right:20px;">${r.link ? `<a href="${r.link}" target="_blank" class="btn btn-sm btn_estaleirooff px30button d-inline-flex justify-content-center align-items-center mx-auto"><i class="bi bi-download"></i></a>` : '—'}</td>
  `;
  tbody.appendChild(tr);
  attachDocInvRowHandlers(tr);
}

function updateDocumentoInventarioRow(r) {
  const table = document.getElementById('documento-inventario-table');
  const row = table ? table.querySelector(`tr.documento-inventario-row[data-docinv-id="${r.id}"]`) : null;
  if (!row) return;
  row.dataset.inventarioId = String(r.inventario_barco_id || '');
  const prevLink = row.dataset.link || '';
  const newLink = r.link || prevLink;
  row.dataset.link = String(newLink);
  row.children[0].textContent = r.titulo || '';
  row.children[1].textContent = r.associado_nome || '—';
  row.children[2].textContent = r.observacao || '—';
  row.children[3].textContent = r.tipo || '—';
  row.children[4].textContent = formatDateBR(r.criado_em || '');
  row.children[5].innerHTML = newLink ? `<a href="${newLink}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-download"></i></a>` : '—';
}

function removeDocumentoInventarioRow(id) {
  const table = document.getElementById('documento-inventario-table');
  const tbody = table ? table.querySelector('tbody') : null;
  if (!tbody) return;
  const row = tbody.querySelector(`tr.documento-inventario-row[data-docinv-id="${id}"]`);
  if (row) row.remove();
  if (tbody.querySelectorAll('tr.documento-inventario-row').length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'documento-inventario-empty';
    const td = document.createElement('td');
    td.colSpan = 8; td.className = 'text-center text-muted';
    td.textContent = 'Nenhum documento ou nota relacionado aos itens.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

function populateDocInvSelect(selectEl) {
  if (!selectEl) return;
  const barcoId = getBarcoIdFromURL();
  selectEl.innerHTML = '';
  const optNone = document.createElement('option'); optNone.value = ''; optNone.textContent = 'Não associado'; selectEl.appendChild(optNone);
  selectEl.value = '';
  if (barcoId && barcoId > 0) {
    fetch(`./api/inventario.php?action=listar_barco&barco_id=${encodeURIComponent(barcoId)}`)
      .then(r => r.json())
      .then(json => {
        let rows = (json && json.ok === true && Array.isArray(json.data)) ? json.data : [];
        rows.sort(function(a,b){
          const ai = parseInt(a.inventario_id || a.id || 0, 10);
          const bi = parseInt(b.inventario_id || b.id || 0, 10);
          return bi - ai; // últimos adicionados primeiro
        });
        const added = new Set();
        rows.forEach(r => {
          const idVal = parseInt(r.inventario_id || r.id || 0, 10);
          if (!idVal || added.has(idVal)) return;
          added.add(idVal);
          const opt = document.createElement('option');
          opt.value = String(idVal);
          opt.textContent = r.nome_item ? r.nome_item : (r.codigo_produto || 'Item');
          selectEl.appendChild(opt);
        });
        // Remover quaisquer duplicados por valor
        const seen = new Set();
        for (let i = 0; i < selectEl.options.length; i++) {
          const v = selectEl.options[i].value;
          if (v !== '' && seen.has(v)) { selectEl.remove(i); i--; }
          else { if (v !== '') seen.add(v); }
        }
        selectEl.size = Math.min(10, selectEl.options.length);
      }).catch(() => {});
  }
}

function attachDocInvRowHandlers(tr) {
  tr.addEventListener('click', function() {
    const id = parseInt(tr.dataset.docinvId || '0', 10);
    if (!id || id <= 0) return;
    const cells = tr.querySelectorAll('td');
    const editModalEl = document.getElementById('modalEditDocumentoInventario');
    if (typeof bootstrap !== 'undefined' && editModalEl) {
      document.getElementById('docinv-edit-id').value = String(id);
      const t = document.getElementById('docinv-edit-titulo'); if (t) t.value = (cells[0] && cells[0].textContent.trim()) || '';
      const tipo = document.getElementById('docinv-edit-tipo'); if (tipo) tipo.value = (cells[3] && cells[3].textContent.trim()) || '';
      const desc = document.getElementById('docinv-edit-descricao'); if (desc) desc.value = (cells[2] && cells[2].textContent.trim()) || '';
      const d = document.getElementById('docinv-edit-data'); if (d) {
        const br = (cells[4] && cells[4].textContent.trim()) || '';
        d.value = br.replace(/^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/, '$3-$2-$1');
      }
      const sel = document.getElementById('docinv-edit-inventario-item');
      populateDocInvSelect(sel);
      const curEl = document.getElementById('docinv-edit-file-current');
      if (curEl) {
        const link = tr.dataset.link || '';
        if (link) {
          const filename = link.split('/').pop();
          curEl.innerHTML = `<span>Arquivo atual: </span><a href="${link}" target="_blank">${filename}</a>`;
        } else {
          curEl.textContent = 'Arquivo atual: —';
        }
      }
      const modal = new bootstrap.Modal(editModalEl);
      modal.show();
    }
  });
}

// ===== Integração do modal de adicionar item ===== //
function getBarcoIdFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    const idStr = params.get('id') || '';
    const id = parseInt(idStr, 10);
    if (!isNaN(id) && id > 0) return id;
  } catch (e) {}
  // Fallback: tenta ler do campo Ficha Técnica
  const el = document.getElementById('boatTechId');
  if (el) {
    const t = el.textContent.trim();
    const n = parseInt(t, 10);
    if (!isNaN(n) && n > 0) return n;
  }
  return 0;
}

// ===== Paginação da tabela de inventário =====
let inventarioPageSize = 10;
let inventarioOffset = 0;

function getInventarioRows() {
  const table = document.getElementById('inventario-table');
  const tbody = table ? table.querySelector('tbody') : null;
  if (!tbody) return [];
  return Array.from(tbody.querySelectorAll('tr.inventario-row'));
}

function renderInventarioPage() {
  const rows = getInventarioRows();
  const total = rows.length;
  const start = Math.max(0, inventarioOffset);
  const end = Math.min(total, inventarioOffset + inventarioPageSize);
  rows.forEach(function(row, idx) {
    row.style.display = (idx >= start && idx < end) ? '' : 'none';
  });
}

function updateInventarioPagination() {
  const rows = getInventarioRows();
  const total = rows.length;
  const prevBtn = document.getElementById('inventario-prev');
  const nextBtn = document.getElementById('inventario-next');
  if (prevBtn) prevBtn.disabled = inventarioOffset <= 0;
  if (nextBtn) nextBtn.disabled = (inventarioOffset + inventarioPageSize) >= total || total === 0;
}

function setupInventarioPagination() {
  const prevBtn = document.getElementById('inventario-prev');
  const nextBtn = document.getElementById('inventario-next');
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (inventarioOffset <= 0) return;
      inventarioOffset = Math.max(0, inventarioOffset - inventarioPageSize);
      renderInventarioPage();
      updateInventarioPagination();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      const rows = getInventarioRows();
      const total = rows.length;
      if ((inventarioOffset + inventarioPageSize) >= total) return;
      inventarioOffset = inventarioOffset + inventarioPageSize;
      renderInventarioPage();
      updateInventarioPagination();
    });
  }
}

// ===== Solicitar Pedido (Modal) ===== //
let PEDIDO_ITEMS = []; // {codigo_produto, nome, unidade_medida, quantidade}

function setPedidoStatus(text) {
  const el = document.getElementById('pedidoSearchStatus');
  if (el) el.textContent = text || '';
}

async function loadBoatsForPedido() {
  const select = document.getElementById('pedidoBoatSelect');
  if (!select) return;
  // Carrega ocupações e dados dos barcos
  try {
    const occRes = await fetch('./api/estaleiro.php?action=listar_ocupacao');
    const occData = await occRes.json();
    const ocupacoes = (occData && occData.ok === true) ? (occData.data || []) : [];
    const valid = ocupacoes.filter(o => o && o.barco_id && Number.isFinite(+o.numero) && +o.numero >= 1 && +o.numero <= 10);
    // Preserva ordem de aparição, sem duplicar barcos
    const idsOrdered = [];
    valid.forEach(v => {
      const id = parseInt(v.barco_id, 10);
      if (id > 0 && !idsOrdered.includes(id)) idsOrdered.push(id);
    });
    const barcosRes = await fetch('./api/barcos.php?action=listar');
    const barcosData = await barcosRes.json();
    const barcos = (barcosData && barcosData.ok === true) ? (barcosData.data || []) : [];
    const byId = {};
    barcos.forEach(b => { if (b && b.id) byId[parseInt(b.id, 10)] = b; });
    // Limpa e popula
    select.innerHTML = '';
    if (idsOrdered.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Nenhum barco nas vagas 1–10';
      select.appendChild(opt);
      return;
    }
    idsOrdered.forEach(id => {
      const boat = byId[id];
      const label = boat ? `${boat.cliente_nome || 'Cliente?'} — ${boat.modelo || 'Modelo?'}` : 'Cliente? — Modelo?';
      const opt = document.createElement('option');
      opt.value = String(id);
      opt.textContent = label;
      select.appendChild(opt);
    });
  } catch (e) {
    select.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Erro ao carregar barcos';
    select.appendChild(opt);
  }
}

function resetSolicitarPedidoState() {
  PEDIDO_ITEMS = [];
  renderPedidoItems();
  const c = document.getElementById('pedidoComentario');
  if (c) c.value = '';
  const u = document.getElementById('pedidoUrgente');
  if (u) u.checked = false;
  const s = document.getElementById('pedidoItemSearch');
  if (s) s.value = '';
  const sc = document.getElementById('pedidoSearchCod');
  if (sc) sc.value = '';
  const results = document.getElementById('pedidoSearchResults');
  if (results) results.innerHTML = '';
  setPedidoStatus('');
  // Limpa status de envio
  hidePedidoSendStatus();
}

function prepareSolicitarPedidoModal() {
  resetSolicitarPedidoState();
  loadBoatsForPedido();
}

function renderPedidoItems() {
  const tbody = document.getElementById('pedidoItemsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!PEDIDO_ITEMS.length) {
    const tr = document.createElement('tr');
    tr.className = 'pedido-items-empty';
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'text-center text-muted';
    td.textContent = 'Nenhum item selecionado.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  PEDIDO_ITEMS.forEach((it, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.codigo_produto}</td>
      <td>${it.nome}</td>
      <td>${it.quantidade}</td>
      <td>${it.unidade_medida || '—'}</td>
      <td class="text-end"><button type="button" class="btn btn-sm btn-outline-danger" data-index="${idx}"><i class="bi bi-trash"></i></button></td>
    `;
    const btn = tr.querySelector('button');
    btn.addEventListener('click', function() {
      const i = parseInt(this.getAttribute('data-index'), 10);
      if (!isNaN(i)) {
        PEDIDO_ITEMS.splice(i, 1);
        renderPedidoItems();
      }
    });
    tbody.appendChild(tr);
  });
}

function addPedidoItem(item, qtd) {
  const q = parseFloat(qtd);
  if (!isFinite(q) || q <= 0) { alert('Quantidade inválida.'); return; }
  // Merge por código
  const existing = PEDIDO_ITEMS.findIndex(x => x.codigo_produto === item.codigo_produto);
  if (existing >= 0) {
    PEDIDO_ITEMS[existing].quantidade = parseFloat(PEDIDO_ITEMS[existing].quantidade) + q;
  } else {
    PEDIDO_ITEMS.push({
      codigo_produto: item.codigo_produto,
      nome: item.nome,
      unidade_medida: item.unidade_medida || null,
      quantidade: q
    });
  }
  renderPedidoItems();
}

function renderPedidoSearch(items, meta) {
  const tbody = document.getElementById('pedidoSearchResults');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    setPedidoStatus('Nenhum item encontrado.');
    return;
  }
  const off = meta && Number.isFinite(meta.offset) ? meta.offset : 0;
  const count = items.length;
  setPedidoStatus('');
  items.forEach(function(it, idx) {
    const tr = document.createElement('tr');
    const qtdId = `pedidoQtd_${off + idx}`;
    tr.innerHTML = `
      <td>${it.codigo_produto || ''}</td>
      <td>${it.nome || ''}</td>
      <td>${it.unidade_medida || '—'}</td>
      <td>${Number.isFinite(+it.quantidade_estoque) ? it.quantidade_estoque : '—'}</td>
      <td><input type="number" class="form-control form-control-sm" id="${qtdId}" min="1" step="1" placeholder="Qtd"></td>
      <td><button type="button" class="btn btn-sm btn_estaleirooff">Adicionar</button></td>
    `;
    const btn = tr.querySelector('button');
    btn.addEventListener('click', function() {
      const inp = document.getElementById(qtdId);
      const q = inp ? (inp.value || '').trim() : '';
      addPedidoItem(it, q);
    });
    tbody.appendChild(tr);
  });
}

async function doPedidoSearch(query, resetOffset = true) {
  try {
    setPedidoStatus('Buscando...');
    const { items, offset, limit } = await buscarItensInventario(query, 0, 30);
    renderPedidoSearch(items, { offset, limit });
  } catch (e) {
    setPedidoStatus('Erro na busca: ' + e.message);
    const tbody = document.getElementById('pedidoSearchResults');
    if (tbody) tbody.innerHTML = '';
  }
}

async function enviarSolicitacaoPedido() {
  const barcoSelect = document.getElementById('pedidoBoatSelect');
  const barcoId = barcoSelect ? parseInt(barcoSelect.value, 10) : 0;
  const barcoLabel = (barcoSelect && barcoSelect.options && barcoSelect.selectedIndex >= 0)
    ? (barcoSelect.options[barcoSelect.selectedIndex].text || '')
    : '';
  if (!barcoId || barcoId <= 0) { alert('Selecione um barco válido.'); return; }
  if (!PEDIDO_ITEMS.length) { alert('Adicione pelo menos um item ao pedido.'); return; }
  const urgente = !!(document.getElementById('pedidoUrgente') && document.getElementById('pedidoUrgente').checked);
  const comentario = (document.getElementById('pedidoComentario') && document.getElementById('pedidoComentario').value || '').trim();

  // Obtém nome do usuário logado
  let usuarioSolicitante = 'Usuário';
  try {
    const res = await fetch('./api/usuarios.php?action=session', { credentials: 'include' });
    const data = await res.json();
    if (data && data.ok && data.authenticated) {
      usuarioSolicitante = (data.nome || data.usuario || 'Usuário').toString();
    }
  } catch (_) {}

  // Executa reCAPTCHA v3
  const SITE_KEY = '6LfEIoYqAAAAAH-P0jb0mVzWDm4bkbmgXHpk7jsL';
  if (!(window.grecaptcha && grecaptcha.execute)) {
    alert('Falha ao inicializar reCAPTCHA. Recarregue a página.');
    return;
  }

  const enviarBtn = document.getElementById('pedidoEnviarBtn');
  if (enviarBtn) { enviarBtn.disabled = true; enviarBtn.textContent = 'Enviando...'; }
  showPedidoSendStatus('loading', 'Enviando, por favor aguarde...');

  try {
    await new Promise((resolve) => grecaptcha.ready(resolve));
    const token = await grecaptcha.execute(SITE_KEY, { action: 'material_request' });

    const formData = new FormData();
    formData.append('recaptchaToken', token);
    formData.append('barco_id', String(barcoId));
    formData.append('barco_label', barcoLabel);
    formData.append('usuario', usuarioSolicitante);
    formData.append('urgente', urgente ? '1' : '0');
    formData.append('comentario', comentario);
    formData.append('itens', JSON.stringify(PEDIDO_ITEMS));

    const res = await fetch('../forms/send_material-request.php', {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (!json || !json.success) {
      throw new Error(json && json.error ? json.error : 'Falha ao enviar pedido');
    }
    // Limpa campos e então exibe mensagem de sucesso
    resetSolicitarPedidoState();
    showPedidoSendStatus('success', 'Pedido enviado com sucesso.');
  } catch (e) {
    const msg = (e && e.message ? e.message : e);
    showPedidoSendStatus('error', 'Erro ao enviar: ' + msg);
  } finally {
    if (enviarBtn) { enviarBtn.disabled = false; enviarBtn.textContent = 'Enviar'; }
  }
}

let SELECTED_INV_ITEM = null; // {id, codigo_produto, nome, unidade_medida}

function renderSearchResults(items, meta) {
  const tbody = document.getElementById('invAddSearchResults');
  const status = document.getElementById('invAddStatus');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    if (status) status.textContent = '';
    const ps = document.getElementById('invAddPagerStatus');
    if (ps) ps.textContent = 'Nenhum item encontrado.';
    return;
  }
  const off = meta && Number.isFinite(meta.offset) ? meta.offset : 0;
  const count = items.length;
  if (status) status.textContent = '';
  const ps = document.getElementById('invAddPagerStatus');
  if (ps) ps.textContent = `Mostrando ${off + 1}–${off + count}`;
  items.forEach(function(it) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.codigo_produto || ''}</td>
      <td>${it.nome || ''}</td>
      <td>${it.unidade_medida || '—'}</td>
      <td><button type="button" class="btn btn-sm btn_estaleirooff">Selecionar</button></td>
    `;
    const btn = tr.querySelector('button');
    btn.addEventListener('click', function() {
      SELECTED_INV_ITEM = {
        id: it.id,
        codigo_produto: it.codigo_produto,
        nome: it.nome,
        unidade_medida: it.unidade_medida || null
      };
      const tbodyEl = document.getElementById('invAddSearchResults');
      if (tbodyEl) {
        tbodyEl.querySelectorAll('tr.table-active').forEach(function(r){ r.classList.remove('table-active'); });
        tbodyEl.querySelectorAll('button.btn-selected').forEach(function(b){ b.classList.remove('active','btn-selected'); b.style.pointerEvents=''; b.setAttribute('aria-pressed','false'); });
      }
      tr.classList.add('table-active');
      btn.classList.add('active','btn-selected');
      btn.setAttribute('aria-pressed','true');
      btn.style.pointerEvents = 'none';
    });
    tbody.appendChild(tr);
  });
}

async function buscarItensInventario(q, offset = 0, limit = 30) {
  const url = './api/inventario.php?action=buscar';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, offset, limit })
  });
  const data = await res.json();
  if (!data || data.ok !== true) { throw new Error(data && data.error ? data.error : 'Falha na busca'); }
  return { items: (data.items || []), offset: (data.offset || 0), limit: (data.limit || limit) };
}

async function adicionarItemAoInventarioBarco(payload) {
  const url = './api/inventario.php?action=adicionar_item_barco';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data || data.ok !== true) { throw new Error(data && data.error ? data.error : 'Falha ao adicionar'); }
  return data.item;
}

async function editarItemInventarioBarco(payload) {
  const url = './api/inventario.php?action=editar_item_barco';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data || data.ok !== true) { throw new Error(data && data.error ? data.error : 'Falha ao editar'); }
  const item = data.item || {};
  return {
    quantidade: item.quantidade,
    data: item.data,
    tipo: item.tipo,
    categoria: item.categoria
  };
}

async function excluirItemInventarioBarco(invId) {
  const url = './api/inventario.php?action=excluir_item_barco';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: invId })
  });
  const data = await res.json();
  if (!data || data.ok !== true) { throw new Error(data && data.error ? data.error : 'Falha ao excluir'); }
  return true;
}

function formatDateBR(iso) {
  if (!iso) return '—';
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(String(iso));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso);
}

async function loadInventario(barcoId) {
  const table = document.getElementById('inventario-table');
  const tbody = table ? table.querySelector('tbody') : null;
  if (!tbody || !barcoId) return;
  try {
    const res = await fetch(`./api/inventario.php?action=listar_barco&barco_id=${encodeURIComponent(barcoId)}`);
    const json = await res.json();
    const rows = (json && json.ok === true && Array.isArray(json.data)) ? json.data : [];
    tbody.innerHTML = '';
    if (!rows.length) {
      const tr = document.createElement('tr');
      tr.className = 'inventario-empty';
      const td = document.createElement('td');
      td.colSpan = 8; td.className = 'text-center text-muted';
      td.textContent = 'Nenhum item no inventário.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.className = 'inventario-row';
      tr.dataset.inventarioId = String(r.id || r.inventario_id || '');
      tr.dataset.itemId = String(r.item_id || '');
      tr.dataset.codigo = String(r.codigo_produto || '');
      tr.dataset.unidade = String(r.unidade_medida || '');
      tr.innerHTML = `
        <td style="padding-left:20px;">${r.codigo_produto || ''}</td>
        <td style="padding-left:20px;">${r.nome_item || ''}</td>
        <td>${r.quantidade != null ? r.quantidade : ''}</td>
        <td>${r.unidade_medida || '—'}</td>
        <td>${formatDateBR(r.data || '')}</td>
        <td>${r.tipo || '—'}</td>
        <td>${r.categoria || '—'}</td>
        <td style="padding-right:20px;">${r.observacao || '—'}</td>
      `;
      tbody.appendChild(tr);
      attachInventarioRowHandlers(tr);
    });
  } catch (e) {
    console.warn('Erro ao carregar inventário do barco:', e);
  }
}

function setupAddInventarioModal() {
  const modalEl = document.getElementById('modalAddInventario');
  if (!modalEl) return;
  const codInput = document.getElementById('invAddCod');
  const itemInput = document.getElementById('invAddItem');
  const qtdInput = document.getElementById('invAddQtd');
  const dataInput = document.getElementById('invAddData');
  const obsInput = document.getElementById('invAddObs');
  const tipoSelect = document.getElementById('invAddTipo');
  const catSelect = document.getElementById('invAddCategoria');
  const statusEl = document.getElementById('invAddStatus');
  const resultsTbody = document.getElementById('invAddSearchResults');
  const btnSearchCod = document.getElementById('invSearchCodBtn');
  const btnSearchItem = document.getElementById('invSearchItemBtn');
  const btnConfirm = document.getElementById('invAddConfirmBtn');

  // Estado de paginação da busca
  let searchOffset = 0;
  const searchLimit = 30;
  let lastCount = 0;
  let currentQuery = '';

  // Controles de paginação (cria abaixo da tabela de resultados)
  let pagerDiv = document.getElementById('invAddPager');
  if (!pagerDiv) {
    pagerDiv = document.createElement('div');
    pagerDiv.id = 'invAddPager';
    pagerDiv.className = 'd-flex justify-content-between align-items-center mt-2';
    pagerDiv.innerHTML = `
      <div class="small text-muted" id="invAddPagerStatus"></div>
      <div class="d-flex gap-2">
        <button type="button" id="invSearchPrevBtn" class="btn btn-outline-secondary btn-sm" title="Voltar" aria-label="Voltar">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button type="button" id="invSearchNextBtn" class="btn btn-outline-secondary btn-sm" title="Próximo" aria-label="Próximo">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>`;
    const tableResp = resultsTbody ? resultsTbody.closest('.table-responsive') : null;
    if (tableResp && tableResp.parentElement) {
      tableResp.parentElement.appendChild(pagerDiv);
    } else if (resultsTbody && resultsTbody.parentElement) {
      resultsTbody.parentElement.appendChild(pagerDiv);
    }
  }
  const prevBtn = pagerDiv.querySelector('#invSearchPrevBtn');
  const nextBtn = pagerDiv.querySelector('#invSearchNextBtn');
  const pagerStatus = pagerDiv.querySelector('#invAddPagerStatus');

  const updatePager = () => {
    if (prevBtn) prevBtn.disabled = searchOffset <= 0;
    if (nextBtn) nextBtn.disabled = (!currentQuery) || (lastCount < searchLimit);
  };

  // Popula o seletor de tipo e define data ao abrir o modal
  if (tipoSelect) populateTipoSelect(tipoSelect);
  const setToday = () => {
    if (!dataInput) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth()+1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    dataInput.value = `${y}-${m}-${d}`;
  };
  setToday();
  if (modalEl && typeof bootstrap !== 'undefined') {
    modalEl.addEventListener('shown.bs.modal', function() {
      populateTipoSelect(tipoSelect);
      populateCategoriaSelect(catSelect);
      setToday();
    });
  }

  const doSearch = async (query, resetOffset = false) => {
    if (resetOffset) searchOffset = 0;
    currentQuery = query;
    if (statusEl) statusEl.textContent = 'Buscando...';
    if (pagerStatus) pagerStatus.textContent = 'Buscando...';
    try {
      const { items, offset } = await buscarItensInventario(query, searchOffset, searchLimit);
      lastCount = items.length;
      searchOffset = offset;
      renderSearchResults(items, { offset, limit: searchLimit });
      updatePager();
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Erro na busca: ' + e.message;
      if (pagerStatus) pagerStatus.textContent = 'Erro na busca';
      if (resultsTbody) resultsTbody.innerHTML = '';
      lastCount = 0;
      updatePager();
    }
  };

  if (btnSearchCod) {
    btnSearchCod.addEventListener('click', function() {
      const q = (codInput && codInput.value || '').trim();
      if (!q) { if (statusEl) statusEl.textContent = 'Digite um código para buscar.'; return; }
      doSearch(q, true);
    });
  }
  if (btnSearchItem) {
    btnSearchItem.addEventListener('click', function() {
      const q = (itemInput && itemInput.value || '').trim();
      if (!q) { if (statusEl) statusEl.textContent = 'Digite um nome para buscar.'; return; }
      doSearch(q, true);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (searchOffset <= 0 || !currentQuery) return;
      searchOffset = Math.max(0, searchOffset - searchLimit);
      doSearch(currentQuery, false);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (!currentQuery) return;
      if (lastCount < searchLimit) return;
      searchOffset += searchLimit;
      doSearch(currentQuery, false);
    });
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', async function() {
      const barcoId = getBarcoIdFromURL();
      if (!barcoId || barcoId <= 0) { alert('Barco inválido.'); return; }
      const qtdStr = (qtdInput && qtdInput.value || '').trim();
      const qtd = parseFloat(qtdStr);
      if (!isFinite(qtd) || qtd <= 0) { alert('Informe uma quantidade válida.'); return; }
      if (!SELECTED_INV_ITEM || !SELECTED_INV_ITEM.id) { alert('Selecione um item da lista de resultados.'); return; }
      const tipoSelecionado = (tipoSelect && tipoSelect.value || '').trim();
      if (!tipoSelecionado) { alert('Selecione um tipo para o item.'); return; }

      const payload = {
        barco_id: barcoId,
        item_id: SELECTED_INV_ITEM.id,
        quantidade: qtd,
        observacao: (obsInput && obsInput.value || '').trim(),
        data: (dataInput && dataInput.value || '').trim() || undefined,
        tipo: tipoSelecionado,
        categoria: (catSelect && catSelect.value || '').trim()
      };

      try {
        const added = await adicionarItemAoInventarioBarco(payload);
        // Adiciona linha na tabela principal para feedback visual imediato
        const table = document.getElementById('inventario-table');
        const tbody = table ? table.querySelector('tbody') : null;
        if (tbody) {
          const tr = document.createElement('tr');
          tr.className = 'inventario-row';
          // Guarda metadados úteis para edição
          tr.dataset.inventarioId = String(added.inventario_id || '');
          tr.dataset.itemId = String(added.item_id || '');
          tr.dataset.codigo = String(added.codigo_produto || '');
          tr.dataset.unidade = String(added.unidade_medida || '');
          tr.innerHTML = `
            <td style="padding-left:20px;">${added.codigo_produto}</td>
            <td style="padding-left:20px;">${added.nome_item}</td>
            <td>${added.quantidade}</td>
            <td>${added.unidade_medida || '—'}</td>
            <td>${formatDateBR(added.data)}</td>
            <td>${added.tipo || '—'}</td>
            <td>${added.categoria || '—'}</td>
            <td style="padding-right:20px;">${added.observacao || '—'}</td>
          `;
          // Remove estado vazio, se existir
          const empty = tbody.querySelector('.inventario-empty');
          if (empty) empty.remove();
          tbody.appendChild(tr);
          // Conecta handler de edição
          attachInventarioRowHandlers(tr);
          try {
            // Re-renderiza a página atual e atualiza botões
            renderInventarioPage();
            updateInventarioPagination();
          } catch (_) {}
        }
        // Limpa seleção e fecha modal
        SELECTED_INV_ITEM = null;
        const modal = (typeof bootstrap !== 'undefined' && modalEl) ? bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl) : null;
        if (modal) modal.hide();
      } catch (e) {
        alert('Falha ao adicionar item: ' + e.message);
      }
    });
  }
}
  
// ===== Status de envio (UI) ===== //
function hidePedidoSendStatus() {
  const loading = document.getElementById('pedidoStatusLoading');
  const ok = document.getElementById('pedidoStatusSuccess');
  const err = document.getElementById('pedidoStatusError');
  if (loading) loading.style.display = 'none';
  if (ok) ok.style.display = 'none';
  if (err) err.style.display = 'none';
}

function showPedidoSendStatus(type, message) {
  hidePedidoSendStatus();
  const loading = document.getElementById('pedidoStatusLoading');
  const ok = document.getElementById('pedidoStatusSuccess');
  const err = document.getElementById('pedidoStatusError');
  if (type === 'loading' && loading) {
    loading.textContent = message || 'Enviando, por favor aguarde...';
    loading.style.display = '';
  } else if (type === 'success' && ok) {
    ok.textContent = message || 'Pedido enviado com sucesso.';
    ok.style.display = '';
  } else if (type === 'error' && err) {
    err.textContent = message || 'Erro ao enviar.';
    err.style.display = '';
  }
}
  
