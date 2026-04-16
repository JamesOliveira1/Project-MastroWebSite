(function () {

  // Atualizado para a data de hoje para forçar atualização imediata
  const SITE_VERSION = "20260306004";

  const pastasPermitidas = [
    "/assets/page/",
    "/assets/js/",
    "/assets/css/",
    "/progenese/page/",
    "/progenese/javascript/"
  ];

  const pastasBloqueadas = [
    "/assets/vendor/"
  ];

  function ehCDN(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  }

  function deveVersionar(url) {

    if (!url) return false;

    if (ehCDN(url)) return false;

    if (pastasBloqueadas.some(p => url.includes(p))) return false;

    return pastasPermitidas.some(p => url.includes(p));
  }

  function aplicarVersionamento() {

    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.href;

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

  // Executa imediatamente para pegar os elementos já carregados
  aplicarVersionamento();

  // Garante a execução completa quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aplicarVersionamento);
  } else {
    aplicarVersionamento();
  }

})();