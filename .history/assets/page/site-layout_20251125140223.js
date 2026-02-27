
(function() {
  function inject(selector, url) {
    var placeholder = document.querySelector(selector);
    if (!placeholder || !url) return;
    fetch(url, { cache: 'no-cache' })
      .then(function(resp) { return resp.ok ? resp.text() : Promise.reject(); })
      .then(function(html) {
        placeholder.innerHTML = html;
        if (placeholder.querySelector('#header')) {
          window.dispatchEvent(new Event('progenese:header-ready'));
        }
        if (placeholder.querySelector('#footer')) {
          window.dispatchEvent(new Event('progenese:footer-ready'));
        }
      })
      .catch(function() {});
  }

  document.addEventListener('DOMContentLoaded', function() {
    var headerComp = document.getElementById('header-component');
    var footerComp = document.getElementById('footer-component');
    var headerFile = headerComp ? headerComp.getAttribute('data-file') : null;
    var footerFile = footerComp ? footerComp.getAttribute('data-file') : null;
    if (headerComp && headerFile) inject('#header-component', headerFile);
    if (footerComp && footerFile) inject('#footer-component', footerFile);
  });
})();
