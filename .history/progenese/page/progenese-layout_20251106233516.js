class ProgeneseHeader extends HTMLElement {
  connectedCallback() {
    const basePath = (() => {
      const path = window.location.pathname;
      const idx = path.lastIndexOf('/');
      return idx >= 0 ? path.substring(0, idx + 1) : '/';
    })();
    const url = basePath + 'page/progenese_header.html';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar header');
        return res.text();
      })
      .then((html) => {
        this.innerHTML = html;
        // Reexecuta quaisquer <script> inclusos no fragmento
        const scripts = Array.from(this.querySelectorAll('script'));
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          // Copia atributos (inclui async/defer/integrity/crossorigin, etc.)
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          if (!oldScript.src) {
            newScript.textContent = oldScript.textContent || '';
          }
          // Remove o antigo e insere o novo para garantir execução
          oldScript.remove();
          this.appendChild(newScript);
        });

        // Após o header estar pronto, popular o menu "Estaleiro" dinamicamente
        try {
          this.populateEstaleiroDropdown();
        } catch (e) {
          console.warn('[ProgeneseHeader] falha ao popular menu Estaleiro:', e);
        }

        this.dispatchEvent(new CustomEvent('progenese:header-ready', { bubbles: true }));
      })
      .catch((err) => {
        console.error('[ProgeneseHeader] erro:', err);
      });
  }

  // Popula o dropdown "Estaleiro" com os barcos em produção (vagas ocupadas)
  populateEstaleiroDropdown() {
    const basePrefix = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
    const estaleiroURL = `${basePrefix}/progenese/api/estaleiro.php?action=listar_ocupacao`;
    const barcosURL = `${basePrefix}/progenese/api/barcos.php?action=listar`;

    // Encontra o UL do dropdown com o título "Estaleiro"
    const nav = this.querySelector('#navbar');
    if (!nav) return;
    const dropdowns = Array.from(nav.querySelectorAll('li.dropdown'));
    let estUl = null;
    for (const li of dropdowns) {
      const span = li.querySelector('a > span');
      if (span && String(span.textContent || '').trim().toLowerCase() === 'estaleiro') {
        estUl = li.querySelector('ul');
        break;
      }
    }
    if (!estUl) return;

    // Busca ocupação e detalhes dos barcos
    Promise.all([
      fetch(estaleiroURL, { method: 'GET', headers: { 'Accept': 'application/json' } }).then(r => r.json()),
      fetch(barcosURL, { method: 'GET', headers: { 'Accept': 'application/json' } }).then(r => r.json())
    ]).then(([occJson, boatsJson]) => {
      const occ = Array.isArray(occJson) ? occJson : (occJson && occJson.data ? occJson.data : []);
      const boats = Array.isArray(boatsJson) ? boatsJson : (boatsJson && boatsJson.data ? boatsJson.data : []);
      const boatMap = new Map();
      boats.forEach(b => {
        if (!b || b.id == null) return;
        boatMap.set(String(b.id), b);
      });

      // Filtra apenas vagas ocupadas nas áreas de produção (até 10 primeiras)
      const filtered = (occ || []).filter(row => {
        if (!row) return false;
        const ln = String(row.local_nome || '').toLowerCase();
        const num = parseInt(String(row.numero != null ? row.numero : ''), 10);
        const hasBoat = row.barco_id != null;
        const isProdLocal = (ln === 'laminação' || ln === 'laminacao' || ln === 'montagem');
        return hasBoat && isProdLocal && Number.isFinite(num) && num >= 1 && num <= 10;
      });

      // Ordena por local(nome) e número
      filtered.sort((a, b) => {
        const la = String(a.local_nome || '');
        const lb = String(b.local_nome || '');
        if (la !== lb) return la.localeCompare(lb);
        return (parseInt(String(a.numero), 10) || 0) - (parseInt(String(b.numero), 10) || 0);
      });

      // Limpa o submenu atual e recria os itens
      estUl.innerHTML = '';

      // Item padrão para a página geral
      const liAll = document.createElement('li');
      const aAll = document.createElement('a');
      aAll.href = `${basePrefix}/progenese/estaleiro.html`;
      aAll.textContent = 'Barcos em produção';
      liAll.appendChild(aAll);
      estUl.appendChild(liAll);

      // Adiciona um item por vaga ocupada
      filtered.forEach(row => {
        const idStr = String(row.barco_id);
        const info = boatMap.get(idStr);
        const label = info ? `${info.cliente_nome || 'Cliente'} - ${info.modelo || 'Modelo'}` : `Barco ${idStr}`;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `${basePrefix}/progenese/barco.html?id=${encodeURIComponent(idStr)}`;
        a.textContent = label;
        li.appendChild(a);
        estUl.appendChild(li);
      });
    }).catch(err => {
      console.warn('[ProgeneseHeader] falha ao carregar ocupação/boatos:', err);
      // Mantém menu original em caso de erro.
    });
  }
}

class ProgeneseFooter extends HTMLElement {
  connectedCallback() {
    const basePath = (() => {
      const path = window.location.pathname;
      const idx = path.lastIndexOf('/');
      return idx >= 0 ? path.substring(0, idx + 1) : '/';
    })();
    const url = basePath + 'page/progenese_footer.html';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar footer');
        return res.text();
      })
      .then((html) => {
        this.innerHTML = html;
        // Reexecuta quaisquer <script> inclusos no fragmento (ex.: SiteSeal)
        const scripts = Array.from(this.querySelectorAll('script'));
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          if (!oldScript.src) {
            newScript.textContent = oldScript.textContent || '';
          }
          oldScript.remove();
          this.appendChild(newScript);
        });
        this.dispatchEvent(new CustomEvent('progenese:footer-ready', { bubbles: true }));
      })
      .catch((err) => {
        console.error('[ProgeneseFooter] erro:', err);
      });
  }
}

customElements.define('progenese-header', ProgeneseHeader);
customElements.define('progenese-footer', ProgeneseFooter);