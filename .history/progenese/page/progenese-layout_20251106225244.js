class ProgeneseHeader extends HTMLElement {
  connectedCallback() {
    const url = './page/progenese_header.html';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar header');
        return res.text();
      })
      .then((html) => {
        this.innerHTML = html;
        this.dispatchEvent(new CustomEvent('progenese:header-ready', { bubbles: true }));
      })
      .catch((err) => {
        console.error('[ProgeneseHeader] erro:', err);
      });
  }
}

class ProgeneseFooter extends HTMLElement {
  connectedCallback() {
    const url = './page/progenese_footer.html';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar footer');
        return res.text();
      })
      .then((html) => {
        this.innerHTML = html;
        this.dispatchEvent(new CustomEvent('progenese:footer-ready', { bubbles: true }));
      })
      .catch((err) => {
        console.error('[ProgeneseFooter] erro:', err);
      });
  }
}

customElements.define('progenese-header', ProgeneseHeader);
customElements.define('progenese-footer', ProgeneseFooter);