(() => {
  const BASE_PREFIX = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
  const API_CONTROLES = `${BASE_PREFIX}/progenese/api/controles.php`;

  function formatDateTime(dtStr) {
    if (!dtStr) return '';
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function loadActivities(limit = 50) {
    try {
      const res = await fetch(`${API_CONTROLES}?action=listar&limit=${limit}`, { credentials: 'include' });
      const data = await res.json();
      const tbody = document.getElementById('activityTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      if (!data || !data.ok || !Array.isArray(data.data) || data.data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan', '3');
        td.textContent = 'Sem atividades registradas.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }
      data.data.forEach(item => {
        const tr = document.createElement('tr');
        const tdUser = document.createElement('td');
        const tdAction = document.createElement('td');
        const tdWhen = document.createElement('td');

        const usuario = (item.usuario || 'Usuário');
        tdUser.textContent = usuario;

        const acao = (item.acao || '').toLowerCase();
        // Mostra a descrição completa gerada no backend
        const desc = item.descricao || '';
        tdAction.textContent = desc !== '' ? desc : acao;

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
      loadActivities(50);
    }
  });
})();