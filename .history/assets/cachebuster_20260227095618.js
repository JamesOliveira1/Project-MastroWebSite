(function () {

  const SITE_VERSION = "20260003";

  const pastasPermitidas = [
    "assets/page/",
    "assets/js/",
    "assets/css/",
    "progenese/page/",
    "progenese/javascript/"
  ];

  const pastasBloqueadas = [
    "assets/vendor/"
  ];

  function ehCDN(url) {
    return url.startsWith("http://") || url.startsWith("https://");
  }

  function deveVersionar(url) {

    if (!url) return false;

    if (ehCDN(url)) return false;

    if (pastasBloqueadas.some(p => url.includes(p))) return false;

    return pastasPermitidas.some(p => url.includes(p));
  }

  function aplicarVersionamento() {

    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.href; // usar href absoluto

      if (!deveVersionar(href)) return;
      if (href.includes("?v=")) return;

      link.href = href + "?v=" + SITE_VERSION;
    });

    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.src;

      if (!src) return;
      if (src.includes("cachebuster.js")) return;
      if (!deveVersionar(src)) return;
      if (src.includes("?v=")) return;

      script.src = src + "?v=" + SITE_VERSION;
    });

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aplicarVersionamento);
  } else {
    aplicarVersionamento();
  }

})();