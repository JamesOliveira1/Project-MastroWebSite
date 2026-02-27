(() => {
  const BASE_PREFIX = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
  const API_CONTROLES = `${BASE_PREFIX}/progenese/api/controles.php`;
  const API_USUARIOS = `${BASE_PREFIX}/progenese/api/usuarios.php`;

  let CURRENT_USER_DISPLAY = null;
  let ACTIVITY_ROWS = [];
  let ACTIVITY_OFFSET = 0;
  let ACTIVITY_PAGE_SIZE = 8;

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatDateTime(dtStr) {
    if (!dtStr) return '';
    // Normaliza para evitar parsing ambíguo; trata como horário local
    const isoLike = String(dtStr).replace(' ', 'T');
    const d = new Date(isoLike);
    if (isNaN(d.getTime())) return dtStr;
    const pad = n => String(n).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    // Exibe data abreviada + hora local (dd/mm/yy HH:mm)
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${yy} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function loadActivities(limit = 50) {
    try {
      const res = await fetch(`${API_CONTROLES}?action=listar&limit=${limit}`, { credentials: 'include' });
      const data = await res.json();
      const tbody = document.getElementById('activityTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      // Filtra registros que não devem ser exibidos (e.g., "atualizou ocupação")
      const rows = (data && data.ok && Array.isArray(data.data)) ? data.data.filter(item => {
        const desc = (item.descricao || '').toLowerCase();
        const acao = (item.acao || '').toLowerCase();
        // Oculta especificamente atualizações de ocupação de vagas
        if (desc.includes('atualizou ocupação')) return false;
        return true;
      }) : [];
      rows.sort(function(a, b) {
        const ad = new Date(String(a.criado_em || '').replace(' ', 'T')).getTime();
        const bd = new Date(String(b.criado_em || '').replace(' ', 'T')).getTime();
        if (isNaN(ad) && isNaN(bd)) return 0;
        if (isNaN(ad)) return 1;
        if (isNaN(bd)) return -1;
        return bd - ad;
      });
      ACTIVITY_ROWS = rows;
      ACTIVITY_OFFSET = 0;
      renderActivityPage();
      ensureActivityPager();
      updateActivityPager();
    } catch (e) {
      // Silencia erro de rede, mantém tabela vazia
    }
  }

  function renderActivityPage() {
    const tbody = document.getElementById('activityTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const total = ACTIVITY_ROWS.length;
    if (total === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.setAttribute('colspan', '3');
      td.textContent = 'Sem atividades registradas.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    const slice = ACTIVITY_ROWS.slice(ACTIVITY_OFFSET, ACTIVITY_OFFSET + ACTIVITY_PAGE_SIZE);
    slice.forEach(item => {
      const tr = document.createElement('tr');
      const tdUser = document.createElement('td');
      const tdAction = document.createElement('td');
      const tdWhen = document.createElement('td');
      tdUser.textContent = (item.usuario && String(item.usuario).trim() !== '') ? item.usuario : '—';
      const acao = (item.acao || '');
      const desc = item.descricao || '';
      const text = (desc !== '' ? desc : acao);
      tdAction.textContent = capitalizeFirst(text);
      tdWhen.textContent = formatDateTime(item.criado_em);
      tr.appendChild(tdUser);
      tr.appendChild(tdAction);
      tr.appendChild(tdWhen);
      tbody.appendChild(tr);
    });
  }

  function ensureActivityPager() {
    const tbody = document.getElementById('activityTableBody');
    if (!tbody) return;
    const tableContainer = tbody.closest('.table-container') || tbody.parentElement;
    if (!tableContainer) return;
    let pager = document.getElementById('activityPager');
    if (!pager) {
      pager = document.createElement('div');
      pager.id = 'activityPager';
      pager.className = 'd-flex justify-content-end align-items-center gap-2 mt-2';
      pager.innerHTML = `
        <button type="button" id="activity-prev" class="btn btn-outline-secondary btn-sm" aria-label="Anterior" title="Anterior">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button type="button" id="activity-next" class="btn btn-outline-secondary btn-sm" aria-label="Próximo" title="Próximo">
          <i class="bi bi-chevron-right"></i>
        </button>
      `;
      tableContainer.appendChild(pager);
      const prevBtn = pager.querySelector('#activity-prev');
      const nextBtn = pager.querySelector('#activity-next');
      if (prevBtn) {
        prevBtn.addEventListener('click', function() {
          if (ACTIVITY_OFFSET <= 0) return;
          ACTIVITY_OFFSET = Math.max(0, ACTIVITY_OFFSET - ACTIVITY_PAGE_SIZE);
          renderActivityPage();
          updateActivityPager();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          const total = ACTIVITY_ROWS.length;
          if ((ACTIVITY_OFFSET + ACTIVITY_PAGE_SIZE) >= total) return;
          ACTIVITY_OFFSET = Math.min(total, ACTIVITY_OFFSET + ACTIVITY_PAGE_SIZE);
          renderActivityPage();
          updateActivityPager();
        });
      }
    }
  }

  function updateActivityPager() {
    const prevBtn = document.getElementById('activity-prev');
    const nextBtn = document.getElementById('activity-next');
    const total = ACTIVITY_ROWS.length;
    if (prevBtn) prevBtn.disabled = ACTIVITY_OFFSET <= 0 || total === 0;
    if (nextBtn) nextBtn.disabled = (ACTIVITY_OFFSET + ACTIVITY_PAGE_SIZE) >= total || total === 0;
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Apenas carrega na página de início
    if (document.getElementById('inicio-dashboard')) {
      // Tenta obter nome do usuário atual para fallback amigável
      (async () => {
        try {
          const sres = await fetch(`${API_USUARIOS}?action=session`, { credentials: 'include' });
          const sdata = await sres.json();
          if (sdata && sdata.ok && sdata.authenticated) {
            const nome = (sdata.nome || '').trim();
            const usuario = (sdata.usuario || '').trim();
            CURRENT_USER_DISPLAY = nome || usuario || null;
          }
        } catch (_) { /* ignore */ }
        // Carrega atividades após tentar session
        loadActivities(50);
      })();
    }
  });
})();
