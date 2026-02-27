(() => {
  const categoriasEl = document.getElementById('servicosCategorias');
  const btnCriarCategoria = document.getElementById('btnCriarCategoria');
  const btnExportar = document.getElementById('btnExportarServicos');
  const btnImportar = document.getElementById('btnImportarServicos');
  const inputImportar = document.getElementById('inputImportarServicos');
  const toggleVerCQ = document.getElementById('toggleVerCQ');
  let showControlesQualidade = !!(toggleVerCQ && toggleVerCQ.checked);
  toggleVerCQ?.addEventListener('change', () => { showControlesQualidade = toggleVerCQ.checked; renderCategorias(); });
  const apiBase = './api/servicos.php';
  function getBoatId(){
    const qs = new URLSearchParams(location.search);
    const qid = parseInt(qs.get('barco_id') || qs.get('id') || '0', 10);
    if (qid > 0) return qid;
    const el = document.getElementById('boatTechId');
    const t = el ? parseInt(String(el.textContent).trim(), 10) : 0;
    return isNaN(t) ? 0 : t;
  }
  const barcoId = getBoatId();
  const cqModalEl = document.getElementById('modalControleQualidade');
  const cqServicoNomeEl = document.getElementById('cqServicoNome');
  const cqResponsavelEl = document.getElementById('cqResponsavel');
  const cqDataEl = document.getElementById('cqData');
  const cqResultadoEl = document.getElementById('cqResultado');
  const cqArquivoEl = document.getElementById('cqArquivo');
  const cqComentarioEl = document.getElementById('cqComentario');
  const cqSaveBtn = document.getElementById('cqSaveBtn');
  let cqServicoId = null;
  function openCQModal(svc){
    cqServicoId = svc.id;
    cqServicoNomeEl.value = svc.nome || '';
    cqResponsavelEl.value = '';
    cqDataEl.value = normalizeDateForInput(getTodayISO());
    cqResultadoEl.value = (svc.cq && Array.from(cqResultadoEl.options).some(o=>o.value===svc.cq)) ? svc.cq : 'Em Análise';
    cqArquivoEl.value = '';
    cqComentarioEl.value = '';
    const m = new bootstrap.Modal(cqModalEl);
    m.show();
  }
  cqSaveBtn?.addEventListener('click', async () => {
    if (!cqServicoId) return;
    const payload = {
      action: 'controle_editar',
      servico_id: cqServicoId,
      item_verificado: cqServicoNomeEl.value || '',
      data_verificacao: cqDataEl.value || '',
      responsavel: cqResponsavelEl.value || '',
      resultado: cqResultadoEl.value || '',
      comentario: cqComentarioEl.value || ''
    };
    await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if (cqArquivoEl.files && cqArquivoEl.files[0]) {
      const fd = new FormData();
      fd.append('action','upload_controle');
      fd.append('servico_id', String(cqServicoId));
      fd.append('anexo', cqArquivoEl.files[0]);
      const r = await fetch(apiBase, { method:'POST', body: fd });
      const j = await r.json();
    }
    cqServicoId = null;
    const m = bootstrap.Modal.getInstance(cqModalEl);
    m?.hide();
    await carregar();
  });

  let categorias = [];
  async function carregar(){
    if (!barcoId) return;
    const r = await fetch(`${apiBase}?action=listar&barco_id=${barcoId}`);
    const j = await r.json();
    if (j && j.ok) {
      categorias = (j.categorias || []).map(c => ({ id: c.id, numero: c.numero, nome: c.nome, servicos: (c.servicos||[]).map(s => ({ id: s.id, nome: s.nome, status: s.status, concluido: !!s.concluido, cq: s.cq || '', obs: s.obs || '', anexoLink: s.anexoLink || '', iniciadoEm: s.iniciadoEm || '', realizadoEm: s.realizadoEm || '', posicao: s.posicao })) }));
      renderCategorias();
    }
  }

  function cryptoRandomId() {
    try { return crypto.randomUUID(); } catch { return 'id-' + Math.random().toString(36).slice(2); }
  }

  function renderCategorias() {
    categoriasEl.innerHTML = '';
    categorias.forEach((cat, ci) => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.dataset.catId = cat.id;

      const header = document.createElement('div');
      header.className = 'category-header';

      const num = document.createElement('div');
      num.className = 'category-number';
      num.textContent = cat.numero;
      num.id = `categoria-num-${ci+1}`;
      num.title = 'Editar categoria';
      num.addEventListener('click', () => toggleCategoryMove(ci));

      const title = document.createElement('h5');
      title.className = 'category-title editable-text';
      title.textContent = cat.nome;
      title.id = `categoria-titulo-${ci+1}`;
      makeEditable(title, () => cat.nome, async (v) => { cat.nome = v; await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'categoria_editar', id: cat.id, nome: v }) }); });

      const controls = document.createElement('div');
      controls.className = 'category-controls';
      controls.style.display = 'none';
      const upBtn = document.createElement('button');
      upBtn.className = 'btn btn-outline-secondary btn-sm';
      upBtn.innerHTML = '<i class="bi bi-chevron-up"></i>';
      upBtn.title = 'Mover categoria para cima';
      upBtn.addEventListener('click', () => moveCategoria(ci, -1));
      const downBtn = document.createElement('button');
      downBtn.className = 'btn btn-outline-secondary btn-sm';
      downBtn.innerHTML = '<i class="bi bi-chevron-down"></i>';
      downBtn.title = 'Mover categoria para baixo';
      downBtn.addEventListener('click', () => moveCategoria(ci, 1));
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-outline-danger btn-sm';
      delBtn.innerHTML = '<i class="bi bi-x"></i>';
      delBtn.title = 'Excluir categoria';
      delBtn.addEventListener('click', async () => {
        const catId = cat.id;
        const ok = confirm('Excluir esta categoria?');
        if (!ok) return;
        const r = await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'categoria_excluir', id: catId }) });
        const j = await r.json();
        if (j && j.ok) {
          categorias.splice(ci,1);
          categorias.forEach((c, idx) => c.numero = idx + 1);
          renderCategorias();
          const updates = categorias.map(c => ({ id: c.id, numero: c.numero }));
          fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'categoria_mover', updates }) });
        }
      });
      controls.appendChild(upBtn);
      controls.appendChild(downBtn);
      controls.appendChild(delBtn);

      header.appendChild(num);
      header.appendChild(title);
      header.appendChild(controls);

      const tableWrap = document.createElement('div');
      tableWrap.className = 'table-container';
      const table = document.createElement('table');
      table.className = 'table services-table align-middle';
      const thead = document.createElement('thead');
      const controlsHeader = showControlesQualidade
        ? '<th class="qc-col">Controle de Qualidade</th><th class="anexo-cell"></th>'
        : '<th class="iniciado-col">Iniciado</th><th class="realizado-col">Realizado</th>';
      thead.innerHTML = `
        <tr class="table-light">
          <th style="padding-left:20px;">Serviço</th>
          <th>Status</th>
          <th class="concluido-cell">Concluído</th>
          <th>Observação</th>
          ${controlsHeader}
          <th class="delete-col"></th>
        </tr>`;
      const tbody = document.createElement('tbody');

      cat.servicos.forEach((svc, si) => {
        const tr = document.createElement('tr');
        tr.className = 'service-row';

        const tdNome = document.createElement('td');
        tdNome.className = 'name-cell';
        tdNome.id = `svc-${ci+1}-${si+1}-nome`;
        const nameControls = document.createElement('div');
        nameControls.className = 'name-controls';
        const sUp = document.createElement('button');
        sUp.className = 'btn-icon';
        sUp.innerHTML = '<i class="bi bi-chevron-up"></i>';
        sUp.addEventListener('click', (e) => { e.stopPropagation(); moveServico(ci, si, -1); });
        const sDown = document.createElement('button');
        sDown.className = 'btn-icon';
        sDown.innerHTML = '<i class="bi bi-chevron-down"></i>';
        sDown.addEventListener('click', (e) => { e.stopPropagation(); moveServico(ci, si, 1); });
        nameControls.appendChild(sUp);
        nameControls.appendChild(sDown);
        const nameSpan = document.createElement('span');
        nameSpan.className = 'editable-text';
        nameSpan.textContent = svc.nome;
        makeEditable(nameSpan, () => svc.nome, async (v) => { svc.nome = v; await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servico_editar', id: svc.id, descricao: v }) }); });
        tdNome.appendChild(nameControls);
        tdNome.appendChild(nameSpan);

        const tdStatus = document.createElement('td');
        const sel = document.createElement('select');
        sel.className = 'form-select form-select-sm';
        sel.id = `svc-${ci+1}-${si+1}-status`;
        ['Pendente','Em andamento','Parado','Concluído'].forEach(opt => {
          const o = document.createElement('option');
          o.value = opt; o.textContent = opt; if (svc.status === opt) o.selected = true; sel.appendChild(o);
        });
        sel.addEventListener('change', async e => { svc.status = e.target.value; await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servico_editar', id: svc.id, status: svc.status }) }); });
        tdStatus.appendChild(sel);

        const tdDone = document.createElement('td');
        tdDone.className = 'concluido-cell';
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.className = 'form-check-input';
        chk.id = `svc-${ci+1}-${si+1}-concluido`;
        chk.checked = !!svc.concluido;
        chk.addEventListener('change', async () => {
          svc.concluido = chk.checked;
          if (chk.checked && !svc.realizadoEm) svc.realizadoEm = getTodayISO();
          if (!chk.checked) svc.realizadoEm = '';
          updateCategoriaBadge(ci);
          renderCategorias();
          await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servico_editar', id: svc.id, status: chk.checked ? 'Concluído' : (svc.status || 'Pendente'), data_concluido: chk.checked ? svc.realizadoEm : '' }) });
        });
        tdDone.appendChild(chk);

        const tdCQ = document.createElement('td');
        tdCQ.className = 'qc-col';
        const cqSpan = document.createElement('span');
        cqSpan.textContent = svc.cq && svc.cq.trim() !== '' ? svc.cq : 'Não Controlado';
        tdCQ.appendChild(cqSpan);

        const tdObs = document.createElement('td');
        const obsInput = document.createElement('input');
        obsInput.type = 'text';
        obsInput.className = 'form-control form-control-sm';
        obsInput.id = `svc-${ci+1}-${si+1}-obs`;
        obsInput.value = svc.obs || '';
        obsInput.addEventListener('input', async e => { svc.obs = e.target.value; await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servico_editar', id: svc.id, observacao: svc.obs }) }); });
        tdObs.appendChild(obsInput);

        const tdAnexo = document.createElement('td');
        tdAnexo.className = 'anexo-cell';
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,image/*,application/pdf';
        fileInput.style.display = 'none';
        fileInput.id = `svc-${ci+1}-${si+1}-anexo`;
        let anexoClip = null;
        const anexoPlus = document.createElement('div');
        anexoPlus.className = 'anexo-plus';
        anexoPlus.innerHTML = '<i class="bi bi-plus"></i>';
        anexoPlus.title = 'Adicionar controle';
        anexoPlus.addEventListener('click', () => openCQModal(svc));
        const anexoReplace = document.createElement('div');
        anexoReplace.className = 'anexo-replace';
        anexoReplace.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
        anexoReplace.title = 'Trocar anexo';
        anexoReplace.addEventListener('click', () => openCQModal(svc));
        function updateAnexoView(){
          const has = !!svc.anexoLink || !!svc.anexo;
          if (has && !anexoClip){
            const a = document.createElement('a');
            a.className = 'anexo-clip';
            a.title = 'Baixar controle';
            a.target = '_blank';
            a.download = '';
            const i = document.createElement('i');
            i.className = 'bi bi-paperclip';
            a.appendChild(i);
            anexoClip = a;
            tdAnexo.insertBefore(anexoClip, anexoPlus);
          }
          if (anexoClip) {
            const href = svc.anexoLink || '';
            if (href) { anexoClip.setAttribute('href', href); }
          }
          if (has) { tr.classList.add('has-anexo'); } else { tr.classList.remove('has-anexo'); }
          if (!has && anexoClip){
            tdAnexo.removeChild(anexoClip);
            anexoClip = null;
          }
        }
        fileInput.addEventListener('change', async () => {
          const f = fileInput.files[0] || null;
          if (!f) { svc.anexoLink=''; updateAnexoView(); return; }
          const fd = new FormData();
          fd.append('action','upload_controle');
          fd.append('servico_id', String(svc.id));
          fd.append('anexo', f);
          const r = await fetch(apiBase, { method:'POST', body: fd });
          const j = await r.json();
          if (j && j.ok && j.link) { svc.anexoLink = j.link; }
          updateAnexoView();
        });
        tdAnexo.appendChild(anexoPlus);
        tdAnexo.appendChild(anexoReplace);
        tdAnexo.appendChild(fileInput);
        updateAnexoView();

        const tdDelete = document.createElement('td');
        tdDelete.className = 'delete-cell';
        const del = document.createElement('button');
        del.className = 'btn-icon btn-delete';
        del.title = 'Excluir item';
        del.innerHTML = '<i class="bi bi-x"></i>';
        del.addEventListener('click', async () => { const rem = cat.servicos.splice(si,1)[0]; renderCategorias(); await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servico_excluir', id: rem.id }) }); });
        tdDelete.appendChild(del);

        tr.appendChild(tdNome);
        tr.appendChild(tdStatus);
        tr.appendChild(tdDone);
        tr.appendChild(tdObs);
        if (showControlesQualidade) {
          tr.appendChild(tdCQ);
          tr.appendChild(tdAnexo);
        } else {
          const tdIni = document.createElement('td');
          tdIni.className = 'iniciado-cell';
          const spanIni = document.createElement('span');
          spanIni.className = 'editable-text';
          spanIni.textContent = formatDateShort(svc.iniciadoEm) || '—';
          spanIni.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'date';
            input.className = 'form-control form-control-sm';
            input.value = normalizeDateForInput(svc.iniciadoEm) || getTodayISO();
            tdIni.innerHTML = '';
            tdIni.appendChild(input);
            input.focus();
            input.addEventListener('blur', async () => {
              svc.iniciadoEm = input.value || '';
              tdIni.innerHTML = '';
              spanIni.textContent = formatDateShort(svc.iniciadoEm) || '—';
              tdIni.appendChild(spanIni);
              await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servico_editar', id: svc.id, data_inicio: svc.iniciadoEm }) });
            });
          });
          tdIni.appendChild(spanIni);
          const tdReal = document.createElement('td');
          tdReal.className = 'realizado-cell';
          const span = document.createElement('span');
          span.className = 'editable-text';
          span.textContent = formatDateShort(svc.realizadoEm) || '—';
          span.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'date';
            input.className = 'form-control form-control-sm';
            input.value = normalizeDateForInput(svc.realizadoEm) || getTodayISO();
            tdReal.innerHTML = '';
            tdReal.appendChild(input);
            input.focus();
            input.addEventListener('blur', async () => {
              svc.realizadoEm = input.value || '';
              tdReal.innerHTML = '';
              span.textContent = formatDateShort(svc.realizadoEm) || '—';
              tdReal.appendChild(span);
              await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servico_editar', id: svc.id, data_concluido: svc.realizadoEm }) });
            });
          });
          tdReal.appendChild(span);
          tr.appendChild(tdIni);
          tr.appendChild(tdReal);
        }
        tr.appendChild(tdDelete);
        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      tableWrap.appendChild(table);

      const addLink = document.createElement('div');
      addLink.className = 'px-2';
      const addAnchor = document.createElement('a');
      addAnchor.className = 'add-servico-link';
      addAnchor.textContent = '+ adicionar serviço';
      addAnchor.id = `categoria-${ci+1}-add-servico`;
      addAnchor.addEventListener('click', async () => {
        const r = await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servico_adicionar', barco_id: barcoId, categoria_id: cat.id, descricao: `Serviço ${cat.servicos.length+1}` }) });
        const j = await r.json();
        if (j && j.ok && j.servico) {
          cat.servicos.push({ id: j.servico.id, nome: j.servico.descricao, status: j.servico.status || 'Pendente', concluido: false, cq: '', obs: j.servico.observacao || '', anexoLink: '', iniciadoEm: j.servico.data_inicio || '', realizadoEm: j.servico.data_concluido || '', posicao: j.servico.posicao || (cat.servicos.length+1) });
          renderCategorias();
        }
      });
      addLink.appendChild(addAnchor);

      card.appendChild(header);
      card.appendChild(tableWrap);
      card.appendChild(addLink);
      categoriasEl.appendChild(card);

      updateCategoriaBadge(ci);
    });
  }

  function updateCategoriaBadge(ci) {
    const cat = categorias[ci];
    const allDone = cat.servicos.length > 0 && cat.servicos.every(s => !!s.concluido);
    const badge = document.getElementById(`categoria-num-${ci+1}`);
    if (badge) {
      if (allDone) badge.classList.add('completed'); else badge.classList.remove('completed');
    }
  }

  function moveCategoria(ci, dir) {
    const ni = ci + dir;
    if (ni < 0 || ni >= categorias.length) return;
    const tmp = categorias[ci];
    categorias[ci] = categorias[ni];
    categorias[ni] = tmp;
    categorias.forEach((c, idx) => c.numero = idx + 1);
    renderCategorias();
    const updates = categorias.map(c => ({ id: c.id, numero: c.numero }));
    fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'categoria_mover', updates }) });
  }

  function moveServico(ci, si, dir) {
    const cat = categorias[ci];
    const ni = si + dir;
    if (ni < 0 || ni >= cat.servicos.length) return;
    const arr = cat.servicos;
    const tmp = arr[si];
    arr[si] = arr[ni];
    arr[ni] = tmp;
    renderCategorias();
    arr.forEach((s, idx) => s.posicao = idx + 1);
    const updates = arr.map(s => ({ id: s.id, posicao: s.posicao }));
    fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servico_mover', updates }) });
  }

  function toggleCategoryMove(ci) {
    const card = categoriasEl.children[ci];
    if (!card) return;
    const controls = card.querySelector('.category-controls');
    if (!controls) return;
    const visible = controls.style.display !== 'none';
    controls.style.display = visible ? 'none' : 'flex';
  }

  btnCriarCategoria?.addEventListener('click', async () => {
    const nome = prompt('Nome da categoria');
    if (!nome) return;
    const r = await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'categoria_adicionar', barco_id: barcoId, nome }) });
    const j = await r.json();
    if (j && j.ok && j.categoria) { categorias.push({ id: j.categoria.id, numero: j.categoria.numero, nome: j.categoria.nome, servicos: [] }); renderCategorias(); }
  });

  btnExportar?.addEventListener('click', () => {
    const data = categorias.map(c => ({
      nome: c.nome,
      servicos: c.servicos.map(s => ({ nome: s.nome }))
    }));
    const blob = new Blob([JSON.stringify({ categorias: data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'servicos-export.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  btnImportar?.addEventListener('click', () => inputImportar.click());
  inputImportar?.addEventListener('change', async () => {
    const f = inputImportar.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        const arr = Array.isArray(parsed?.categorias) ? parsed.categorias : [];
        const clean = arr.map((c) => ({ nome: c.nome || 'Categoria', servicos: Array.isArray(c.servicos) ? c.servicos.map(s => ({ nome: s.nome || 'Serviço' })) : [] }));
        const res = await fetch(apiBase, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'servicos_importar', barco_id: barcoId, categorias: clean }) });
        const j = await res.json();
        if (j && j.ok) { await carregar(); }
        else { alert('Falha ao importar'); }
      } catch (e) { alert('Arquivo inválido'); }
      inputImportar.value = '';
    };
    reader.readAsText(f);
  });

  carregar();
})();

function makeEditable(el, getValue, setValue){
  el.addEventListener('click', () => {
    if (el.contentEditable === 'true') return;
    el.classList.add('editing');
    el.contentEditable = 'true';
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
  });
  el.addEventListener('blur', () => {
    const text = el.textContent.trim();
    setValue(text);
    el.contentEditable = 'false';
    el.classList.remove('editing');
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      el.textContent = getValue();
      el.blur();
    }
  });
}

function getTodayISO(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function normalizeDateForInput(v){
  if (!v) return '';
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
}

function formatDateShort(v){
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return '';
  const [y,m,d] = v.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}
