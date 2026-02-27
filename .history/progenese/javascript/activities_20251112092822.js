(() => {
  const BASE_PREFIX = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
  const API_CONTROLES = `${BASE_PREFIX}/progenese/api/controles.php`;
  const API_USUARIOS = `${BASE_PREFIX}/progenese/api/usuarios.php`;

  let CURRENT_USER_DISPLAY = null;

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
    // Exibe somente data abreviada (dd/mm/yy)
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${yy}`;
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

      if (rows.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan', '3');
        td.textContent = 'Sem atividades registradas.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }
      rows.forEach(item => {
        const tr = document.createElement('tr');
        const tdUser = document.createElement('td');
        const tdAction = document.createElement('td');
        const tdWhen = document.createElement('td');

        const usuario = (item.usuario && String(item.usuario).trim() !== '')
          ? item.usuario
          : (CURRENT_USER_DISPLAY || 'Usuário');
        tdUser.textContent = usuario;

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
    } catch (e) {
      // Silencia erro de rede, mantém tabela vazia
    }
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