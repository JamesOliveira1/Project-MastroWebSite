
(function() {
  function inject(selector, url) {
    var placeholder = document.querySelector(selector);
    if (!placeholder || !url) return;
    fetch(url, { cache: 'no-cache' })
      .then(function(resp) { return resp.ok ? resp.text() : Promise.reject(); })
      .then(function(html) {
        placeholder.innerHTML = html;
        var scripts = placeholder.querySelectorAll('script');
        scripts.forEach(function(oldScript) {
          var s = document.createElement('script');
          if (oldScript.type) s.type = oldScript.type;
          if (oldScript.src) s.src = oldScript.src;
          if (oldScript.async) s.async = true;
          if (oldScript.defer) s.defer = true;
          if (oldScript.crossOrigin) s.crossOrigin = oldScript.crossOrigin;
          if (oldScript.integrity) s.integrity = oldScript.integrity;
          if (oldScript.referrerPolicy) s.referrerPolicy = oldScript.referrerPolicy;
          if (!oldScript.src) s.text = oldScript.textContent;
          oldScript.parentNode.replaceChild(s, oldScript);
        });
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
