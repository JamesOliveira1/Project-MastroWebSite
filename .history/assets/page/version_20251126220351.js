document.addEventListener("DOMContentLoaded", () => {
  const version = "26112025"; // atualize o numero para limpeza do css dos usuarios (dados armazenados em cache)
  document.querySelectorAll("link[rel=stylesheet]").forEach(link => {
    link.href = link.href.split("?")[0] + "?v=" + version;
  });
});