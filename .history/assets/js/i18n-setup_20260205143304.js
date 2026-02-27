// Definir funções globais imediatamente para evitar ReferenceError no HTML
window.updateContent = function() {
  if (!window.i18next) return;
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const rawValue = el.getAttribute('data-i18n');
    
    // Suporte básico para sintaxe [atributo]chave
    const match = rawValue.match(/^\[(\w+)\](.+)$/);
    if (match) {
        const attr = match[1];
        const key = match[2];
        if (attr === 'html') {
             el.innerHTML = i18next.t(key);
        } else {
             el.setAttribute(attr, i18next.t(key));
        }
    } else {
        // Padrão: altera o conteúdo HTML interno
        el.innerHTML = i18next.t(rawValue);
    }
  });
}

window.changeLanguage = function(lng) {
  if (!window.i18next) {
    console.error('i18next não inicializado ainda');
    return;
  }
  i18next.changeLanguage(lng, (err, t) => {
    if (err) return console.error('Erro ao mudar idioma:', err);
    updateContent();
    updateFlags(lng);
    console.log('Idioma alterado para:', lng);
  });
}

const flagMap = {
  'pt': 'assets/img/icons/flagbr.png',
  'en': 'assets/img/icons/flagen.png',
  'es': 'assets/img/icons/flages.png'
};

function updateFlags(lng) {
  if (!lng) return;
  const cleanLng = lng.substring(0, 2).toLowerCase(); 
  
  // Caminho base para as imagens
  let basePath = 'assets/img/icons/';
  
  // Se estivermos em uma página dentro de /portfolio/, precisamos ajustar o caminho
  if (window.location.pathname.includes('/portfolio/')) {
    basePath = '../assets/img/icons/';
  }

  const mainFlagImg = document.querySelector('.nav-lang-item > a > span > img');
  if (mainFlagImg && flagMap[cleanLng]) {
    // Remove 'assets/img/icons/' do flagMap value para não duplicar se já tiver
    const filename = flagMap[cleanLng].split('/').pop();
    mainFlagImg.src = basePath + filename;
    mainFlagImg.alt = cleanLng.toUpperCase();
  }
  const container = document.querySelector('.nav-lang-item > ul');
  if (container) {
    const items = container.querySelectorAll('li.flag-lang');
    items.forEach(item => {
      // Verifica se o item corresponde ao idioma atual
      const isCurrent = item.getAttribute('onclick').includes(`'${cleanLng}'`) || item.getAttribute('onclick').includes(`"${cleanLng}"`);
      if (isCurrent) {
        item.style.display = 'none';
      } else {
        item.style.display = 'block';
      }
    });
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
  
  // Detecta o caminho base para os arquivos de tradução
  let loadPath = 'assets/locales/{{lng}}.json';
  if (window.location.pathname.includes('/portfolio/')) {
    loadPath = '../assets/locales/{{lng}}.json';
  } else if (window.location.pathname.includes('/404.html') || window.location.pathname.includes('/artigos.html') || window.location.pathname.includes('/customizacao.html') || window.location.pathname.includes('/orcamento.html') || window.location.pathname.includes('/videos.html')) {
     // Paginas na raiz, loadPath normal
     loadPath = 'assets/locales/{{lng}}.json';
  }

  // Tenta obter as bibliotecas do window (formato UMD)
  const backend = window.i18nextHttpBackend;
  const detector = window.i18nextBrowserLanguageDetector;

  if (!window.i18next || !backend || !detector) {
    console.error('Bibliotecas i18next não carregadas corretamente. Verifique a importação dos scripts.');
    return;
  }

  i18next
    .use(backend)
    .use(detector)
    .init({
      fallbackLng: 'pt',
      debug: false,
      interpolation: {
        escapeValue: false 
      },
      backend: {
        loadPath: loadPath, 
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        caches: ['localStorage', 'cookie']
      }
    }, function(err, t) {
      if (err) return console.error('Erro ao iniciar i18next:', err);
      updateContent();
      updateFlags(i18next.language);
    });

  // Escuta evento de quando o header é carregado dinamicamente
  window.addEventListener('progenese:header-ready', function() {
    updateContent();
    if(window.i18next && i18next.language) {
        updateFlags(i18next.language);
    }
  });
});