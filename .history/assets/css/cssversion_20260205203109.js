document.addEventListener("DOMContentLoaded", () => {
  const version = "05022025"; // atualize o numero para limpeza do css dos usuarios (dados armazenados em cache)

  const arquivosParaVersionar = [
    "assets/css/style.css",
    "assets/css/carrossel.css",
    "page/estaleiro.css"
  ];

  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const hrefOriginal = link.getAttribute("href");

    // ignora links sem href
    if (!hrefOriginal) return;

    // verifica se o href termina com um dos arquivos desejados
    if (arquivosParaVersionar.some(arq => hrefOriginal.endsWith(arq))) {
      link.href = hrefOriginal.split("?")[0] + "?v=" + version;
    }
  });
});