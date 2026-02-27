// Aguarda o DOM carregar completamente
document.addEventListener("DOMContentLoaded", function() {

  i18next
    .use(i18nextHttpBackend) // Diz ao i18next para carregar arquivos de tradução via HTTP
    .use(i18nextBrowserLanguageDetector) // Diz para detectar o idioma do usuário
    .init({
      fallbackLng: 'pt', // Se ele não encontrar o idioma, usa português
      debug: false, // Mude para 'true' se quiser ver erros no console (F12)
      backend: {
        // Caminho para os seus arquivos. O {{lng}} é substituído por 'pt' ou 'en'
        loadPath: 'locales/{{lng}}.json', 
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        caches: ['localStorage', 'cookie'] // Onde salvar a escolha do usuário
      }
    }, function(err, t) {
      // Assim que inicializar, traduz o que estiver na página
      updateContent();
    });

  // Função que varre o HTML e troca o texto
  window.updateContent = function() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.innerHTML = i18next.t(key);
    });
  }

  window.changeLanguage = function(lng) {
  i18next.changeLanguage(lng, (err, t) => {
    if (err) return console.error(err);
    
    updateContent();

    // Reordenar as bandeiras: move a clicada para o topo
    const container = document.querySelector('#select-container ul');
    const clickedItem = document.querySelector(`li[onclick="changeLanguage('${lng}')"]`);
    if (container && clickedItem) {
      container.prepend(clickedItem); // Move para o início da lista
    }
  });
}

 // Esta função é chamada quando você clica na bandeira
window.changeLanguage = function(lng) {
  i18next.changeLanguage(lng, (err, t) => {
    if (err) return console.error('Erro ao mudar idioma:', err);
    updateContent(); // Atualiza os textos da página
    console.log('Idioma alterado para:', lng);
  });
}
});