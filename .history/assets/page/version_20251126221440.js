document.addEventListener("DOMContentLoaded", () => {
  const version = "20251126"; // atualize o numero para limpeza do css dos usuarios (dados armazenados em cache)

  const arquivosParaVersionar = [
    "assets/css/style.css",
    "assets/css/carrossel.css",
    "page/estaleiro.css"
  ];

  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const hrefOriginal = link.getAttribute("href");

    // checa se o href termina com um dos arquivos que queremos versionar
    if (arquivosParaVersionar.some(arq => hrefOriginal.endsWith(arq))) {
      link.href = hrefOriginal.split("?")[0] + "?v=" + version;
    }
  });
});
