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
        this.dispatchEvent(new CustomEvent('progenese:header-ready', { bubbles: true }));
      })
      .catch((err) => {
        console.error('[ProgeneseHeader] erro:', err);
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