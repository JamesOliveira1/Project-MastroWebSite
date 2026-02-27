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

        // Após o header estar pronto, popular menus de Laminação e Montagem dinamicamente
        try {
          this.populateProductionDropdowns();
        } catch (e) {
          console.warn('[ProgeneseHeader] falha ao popular menus de produção:', e);
        }

        this.dispatchEvent(new CustomEvent('progenese:header-ready', { bubbles: true }));
      })
      .catch((err) => {
        console.error('[ProgeneseHeader] erro:', err);
      });
  }

  // Popula os dropdowns "Laminação" (vagas 1-5) e "Montagem" (vagas 6-10)
  populateProductionDropdowns() {
    const basePrefix = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
    const estaleiroURL = `${basePrefix}/progenese/api/estaleiro.php?action=listar_ocupacao`;
    const barcosURL = `${basePrefix}/progenese/api/barcos.php?action=listar`;

    // Encontra ULs dos dropdowns "Laminação" e "Montagem"
    const nav = this.querySelector('#navbar');
    if (!nav) return;
    const dropdowns = Array.from(nav.querySelectorAll('li.dropdown'));
    let lamUl = null;
    let montUl = null;
    for (const li of dropdowns) {
      const span = li.querySelector('a > span');
      const label = span ? String(span.textContent || '').trim().toLowerCase() : '';
      if (label === 'laminação' || label === 'laminacao') lamUl = li.querySelector('ul');
      if (label === 'montagem') montUl = li.querySelector('ul');
    }
    if (!lamUl && !montUl) return;

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

      // Listas específicas por local
      const lamList = (occ || []).filter(row => {
        if (!row) return false;
        const ln = String(row.local_nome || '').toLowerCase();
        const num = parseInt(String(row.numero != null ? row.numero : ''), 10);
        return row.barco_id != null && (ln === 'laminação' || ln === 'laminacao') && Number.isFinite(num) && num >= 1 && num <= 5;
      }).sort((a, b) => (parseInt(String(a.numero), 10) || 0) - (parseInt(String(b.numero), 10) || 0);

      const montList = (occ || []).filter(row => {
        if (!row) return false;
        const ln = String(row.local_nome || '').toLowerCase();
        const num = parseInt(String(row.numero != null ? row.numero : ''), 10);
        return row.barco_id != null && ln === 'montagem' && Number.isFinite(num) && num >= 1 && num <= 5; // mapeados para IDs 6..10
      }).sort((a, b) => (parseInt(String(a.numero), 10) || 0) - (parseInt(String(b.numero), 10) || 0);

      // Limpa submenus
      if (lamUl) lamUl.innerHTML = '';
      if (montUl) montUl.innerHTML = '';

      // Popular Laminação
      if (lamUl) {
        if (lamList.length === 0) {
          const liEmpty = document.createElement('li');
          const aEmpty = document.createElement('a');
          aEmpty.href = 'javascript:void(0)';
          aEmpty.textContent = 'Sem barcos na laminação';
          liEmpty.appendChild(aEmpty);
          lamUl.appendChild(liEmpty);
        } else {
          lamList.forEach(row => {
            const idStr = String(row.barco_id);
            const info = boatMap.get(idStr);
            const text = info ? `${info.cliente_nome || 'Cliente'} - ${info.modelo || 'Modelo'}` : `Barco ${idStr}`;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `${basePrefix}/progenese/barco.html?id=${encodeURIComponent(idStr)}`;
            a.textContent = text;
            li.appendChild(a);
            lamUl.appendChild(li);
          });
        }
      }

      // Popular Montagem
      if (montUl) {
        if (montList.length === 0) {
          const liEmpty = document.createElement('li');
          const aEmpty = document.createElement('a');
          aEmpty.href = 'javascript:void(0)';
          aEmpty.textContent = 'Sem barcos na montagem';
          liEmpty.appendChild(aEmpty);
          montUl.appendChild(liEmpty);
        } else {
          montList.forEach(row => {
            const idStr = String(row.barco_id);
            const info = boatMap.get(idStr);
            const text = info ? `${info.cliente_nome || 'Cliente'} - ${info.modelo || 'Modelo'}` : `Barco ${idStr}`;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `${basePrefix}/progenese/barco.html?id=${encodeURIComponent(idStr)}`;
            a.textContent = text;
            li.appendChild(a);
            montUl.appendChild(li);
          });
        }
      }
    }).catch(err => {
      console.warn('[ProgeneseHeader] falha ao carregar ocupação/boatos:', err);
      // Em caso de erro, mostra mensagens padrão
      if (lamUl && lamUl.children.length === 0) {
        const liEmpty = document.createElement('li');
        const aEmpty = document.createElement('a');
        aEmpty.href = 'javascript:void(0)';
        aEmpty.textContent = 'Sem barcos na laminação';
        liEmpty.appendChild(aEmpty);
        lamUl.appendChild(liEmpty);
      }
      if (montUl && montUl.children.length === 0) {
        const liEmpty = document.createElement('li');
        const aEmpty = document.createElement('a');
        aEmpty.href = 'javascript:void(0)';
        aEmpty.textContent = 'Sem barcos na montagem';
        liEmpty.appendChild(aEmpty);
        montUl.appendChild(liEmpty);
      }
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