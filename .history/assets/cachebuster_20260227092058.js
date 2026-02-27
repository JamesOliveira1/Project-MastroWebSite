(function () {

  // 👉 ALTERE SOMENTE ESTE VALOR quando atualizar o site
  const SITE_VERSION = "20260000";

  // Pastas que DEVEM ser versionadas
  const pastasPermitidas = [
    "assets/page/",
    "assets/js/",
    "assets/css/",
    "progenese/page/",
    "progenese/javascript/"
  ];

  // Pastas que NÃO devem ser versionadas
  const pastasBloqueadas = [
    "assets/vendor/"
  ];

  function ehCDN(url) {
    return url.startsWith("http://") || url.startsWith("https://");
  }

  function deveVersionar(url) {

    if (!url) return false;

    // ignora CDN
    if (ehCDN(url)) return false;

    // ignora pastas bloqueadas
    if (pastasBloqueadas.some(p => url.includes(p))) return false;

    // verifica se está nas pastas permitidas
    return pastasPermitidas.some(p => url.includes(p));
  }

  function aplicarVersionamento() {

    // CSS
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute("href");

      if (!deveVersionar(href)) return;
      if (href.includes("?v=")) return;

      link.href = href + "?v=" + SITE_VERSION;
    });

    // JS
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute("src");

      if (!src) return;

      // ignora o próprio script
      if (src.includes("cachebuster.js")) return;

      if (!deveVersionar(src)) return;
      if (src.includes("?v=")) return;

      script.src = src + "?v=" + SITE_VERSION;
    });

  }

  // executa cedo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aplicarVersionamento);
  } else {
    aplicarVersionamento();
  }

})();