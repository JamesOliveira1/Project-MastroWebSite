document.addEventListener("DOMContentLoaded", () => {
  const version = "26112025";
  document.querySelectorAll("link[rel=stylesheet]").forEach(link => {
    link.href = link.href.split("?")[0] + "?v=" + version;
  });
});