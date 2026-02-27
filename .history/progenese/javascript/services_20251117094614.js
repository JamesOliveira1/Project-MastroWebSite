(() => {
  const categoriasEl = document.getElementById('servicosCategorias');
  const btnCriarCategoria = document.getElementById('btnCriarCategoria');
  const btnExportar = document.getElementById('btnExportarServicos');
  const btnImportar = document.getElementById('btnImportarServicos');
  const inputImportar = document.getElementById('inputImportarServicos');
  const toggleVerCQ = document.getElementById('toggleVerCQ');
  let showControlesQualidade = !!(toggleVerCQ && toggleVerCQ.checked);
  toggleVerCQ?.addEventListener('change', () => { showControlesQualidade = toggleVerCQ.checked; renderCategorias(); });

  let categorias = [
    {
      id: cryptoRandomId(),
      numero: 1,
      nome: 'Projeto e Planejamento',
      servicos: [
        { id: cryptoRandomId(), nome: 'Escopo', status: 'Pendente', concluido: false, cq: '', obs: '', anexo: null },
        { id: cryptoRandomId(), nome: 'Projeto Hidrodinâmico', status: 'Pendente', concluido: false, cq: '', obs: '', anexo: null },
        { id: cryptoRandomId(), nome: 'Especificação do Sistema de Propulsão', status: 'Pendente', concluido: false, cq: '', obs: '', anexo: null },
        { id: cryptoRandomId(), nome: 'Escolha dos Equipamentos de Segurança', status: 'Pendente', concluido: false, cq: '', obs: '', anexo: null }
      ]
    },
    {
      id: cryptoRandomId(),
      numero: 2,
      nome: 'Construção do Casco',
      servicos: [
        { id: cryptoRandomId(), nome: 'Etapa 1', status: 'Em andamento', concluido: true, cq: '', obs: '', anexo: null },
        { id: cryptoRandomId(), nome: 'Pintura', status: 'Pendente', concluido: true, cq: '', obs: '', anexo: null },
        { id: cryptoRandomId(), nome: 'Molde', status: 'Pendente', concluido: true, cq: '', obs: '', anexo: null },
        { id: cryptoRandomId(), nome: 'Gelcoat', status: 'Pendente', concluido: true, cq: '', obs: '', anexo: null }
      ]
    }
  ];

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
      num.addEventListener('click', () => toggleCategoryMove(ci));

      const title = document.createElement('h5');
      title.className = 'category-title editable-text';
      title.textContent = cat.nome;
      title.id = `categoria-titulo-${ci+1}`;
      makeEditable(title, () => cat.nome, (v) => { cat.nome = v; });

      const controls = document.createElement('div');
      controls.className = 'category-controls';
      controls.style.display = 'none';
      const upBtn = document.createElement('button');
      upBtn.className = 'btn btn-outline-secondary btn-sm';
      upBtn.innerHTML = '<i class="bi bi-chevron-up"></i>';
      upBtn.addEventListener('click', () => moveCategoria(ci, -1));
      const downBtn = document.createElement('button');
      downBtn.className = 'btn btn-outline-secondary btn-sm';
      downBtn.innerHTML = '<i class="bi bi-chevron-down"></i>';
      downBtn.addEventListener('click', () => moveCategoria(ci, 1));
      controls.appendChild(upBtn);
      controls.appendChild(downBtn);

      header.appendChild(num);
      header.appendChild(title);
      header.appendChild(controls);

      const tableWrap = document.createElement('div');
      tableWrap.className = 'table-container';
      const table = document.createElement('table');
      table.className = 'table services-table align-middle';
      const thead = document.createElement('thead');
      const controlsHeader = showControlesQualidade
        ? '<th class="qc-col">Qualidade</th><th class="anexo-cell">Anexo</th>'
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
        makeEditable(nameSpan, () => svc.nome, (v) => { svc.nome = v; });
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
        sel.addEventListener('change', e => { svc.status = e.target.value; });
        tdStatus.appendChild(sel);

        const tdDone = document.createElement('td');
        tdDone.className = 'concluido-cell';
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.className = 'form-check-input';
        chk.id = `svc-${ci+1}-${si+1}-concluido`;
        chk.checked = !!svc.concluido;
        chk.addEventListener('change', () => {
          svc.concluido = chk.checked;
          if (chk.checked && !svc.realizadoEm) svc.realizadoEm = getTodayISO();
          if (!chk.checked) svc.realizadoEm = '';
          updateCategoriaBadge(ci);
          renderCategorias();
        });
        tdDone.appendChild(chk);

        const tdCQ = document.createElement('td');
        tdCQ.className = 'qc-col';
        const cqSel = document.createElement('select');
        cqSel.className = 'form-select form-select-sm';
        cqSel.id = `svc-${ci+1}-${si+1}-cq`;
        ['Não Controlado','Aprovado','Não Conforme'].forEach(opt => {
          const o = document.createElement('option');
          o.value = opt; o.textContent = opt; if (svc.cq === opt) o.selected = true; cqSel.appendChild(o);
        });
        cqSel.addEventListener('change', e => { svc.cq = e.target.value; });
        tdCQ.appendChild(cqSel);

        const tdObs = document.createElement('td');
        const obsInput = document.createElement('input');
        obsInput.type = 'text';
        obsInput.className = 'form-control form-control-sm';
        obsInput.id = `svc-${ci+1}-${si+1}-obs`;
        obsInput.value = svc.obs || '';
        obsInput.addEventListener('input', e => { svc.obs = e.target.value; });
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
        anexoPlus.title = 'Adicionar anexo';
        anexoPlus.addEventListener('click', () => fileInput.click());
        function updateAnexoView(){
          if (svc.anexo && !anexoClip){
            anexoClip = document.createElement('i');
            anexoClip.className = 'bi bi-paperclip anexo-clip';
            tdAnexo.insertBefore(anexoClip, anexoPlus);
          }
          if (!svc.anexo && anexoClip){
            tdAnexo.removeChild(anexoClip);
            anexoClip = null;
          }
        }
        fileInput.addEventListener('change', () => { svc.anexo = fileInput.files[0] || null; updateAnexoView(); });
        tdAnexo.appendChild(anexoPlus);
        tdAnexo.appendChild(fileInput);
        updateAnexoView();

        const tdDelete = document.createElement('td');
        tdDelete.className = 'delete-cell';
        const del = document.createElement('button');
        del.className = 'btn-icon btn-delete';
        del.title = 'Excluir item';
        del.innerHTML = '<i class="bi bi-x"></i>';
        del.addEventListener('click', () => { cat.servicos.splice(si,1); renderCategorias(); });
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
            input.addEventListener('blur', () => {
              svc.iniciadoEm = input.value || '';
              tdIni.innerHTML = '';
              spanIni.textContent = formatDateShort(svc.iniciadoEm) || '—';
              tdIni.appendChild(spanIni);
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
            input.addEventListener('blur', () => {
              svc.realizadoEm = input.value || '';
              tdReal.innerHTML = '';
              span.textContent = formatDateShort(svc.realizadoEm) || '—';
              tdReal.appendChild(span);
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
      addAnchor.addEventListener('click', () => {
        cat.servicos.push({ id: cryptoRandomId(), nome: `Serviço ${cat.servicos.length+1}`, status: 'Pendente', concluido: false, cq: '', obs: '', anexo: null, iniciadoEm: '', realizadoEm: '' });
        renderCategorias();
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
  }

  function toggleCategoryMove(ci) {
    const card = categoriasEl.children[ci];
    if (!card) return;
    const controls = card.querySelector('.category-controls');
    if (!controls) return;
    const visible = controls.style.display !== 'none';
    controls.style.display = visible ? 'none' : 'flex';
  }

  btnCriarCategoria?.addEventListener('click', () => {
    const nome = prompt('Nome da categoria');
    if (!nome) return;
    categorias.push({ id: cryptoRandomId(), numero: categorias.length + 1, nome, servicos: [] });
    renderCategorias();
  });

  btnExportar?.addEventListener('click', () => {
    const data = categorias.map(c => ({
      id: c.id,
      numero: c.numero,
      nome: c.nome,
      servicos: c.servicos.map(s => ({ id: s.id, nome: s.nome, status: s.status, concluido: !!s.concluido, cq: s.cq || '', obs: s.obs || '', anexo: s.anexo ? s.anexo.name : null }))
    }));
    const blob = new Blob([JSON.stringify({ categorias: data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'servicos.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  btnImportar?.addEventListener('click', () => inputImportar.click());
  inputImportar?.addEventListener('change', () => {
    const f = inputImportar.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const arr = Array.isArray(parsed?.categorias) ? parsed.categorias : [];
        categorias = arr.map((c, idx) => ({
          id: c.id || cryptoRandomId(),
          numero: typeof c.numero === 'number' ? c.numero : idx + 1,
          nome: c.nome || `Categoria ${idx+1}`,
          servicos: Array.isArray(c.servicos) ? c.servicos.map(s => ({ id: s.id || cryptoRandomId(), nome: s.nome || 'Serviço', status: s.status || 'Pendente', concluido: !!s.concluido, cq: s.cq || '', obs: s.obs || '', anexo: null })) : []
        }));
        categorias.forEach((c, idx) => c.numero = idx + 1);
        renderCategorias();
      } catch (e) { alert('Arquivo inválido'); }
      inputImportar.value = '';
    };
    reader.readAsText(f);
  });

  renderCategorias();
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
