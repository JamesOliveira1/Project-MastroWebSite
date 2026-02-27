// Injeta o header padrão das páginas da pasta progenese
(function() {
  const BASE_PREFIX = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
  const HEADER_PATH = `${BASE_PREFIX}/assets/contents/header-progenese.html`;

  function injectHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;

    fetch(HEADER_PATH)
      .then(r => r.text())
      .then(html => {
        // Substitui o placeholder pelo conteúdo completo do header
        placeholder.outerHTML = html;
      })
      .catch(err => {
        console.error('Erro ao carregar o header da progenese:', err);
      });
  }

  // Tenta injetar assim que possível
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }
})();