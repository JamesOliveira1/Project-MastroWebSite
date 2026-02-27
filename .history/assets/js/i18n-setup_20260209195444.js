// Definir funções globais imediatamente para evitar ReferenceError no HTML
window.updateContent = function() {
  if (!window.i18next || !i18next.isInitialized) {
      console.warn('i18next ainda não inicializado. updateContent ignorado.');
      return;
  }
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const rawValue = el.getAttribute('data-i18n');
    
    // Split por ponto e vírgula para suportar múltiplos atributos
    const parts = rawValue.split(';');

    parts.forEach(part => {
        part = part.trim();
        if (!part) return;

        // Suporte para sintaxe [atributo]chave
        const match = part.match(/^\[(\w+)\](.+)$/);
        
        if (match) {
            const attr = match[1];
            const key = match[2];
            if (attr === 'html') {
                 el.innerHTML = i18next.t(key);
            } else {
                 el.setAttribute(attr, i18next.t(key));
            }
        } else {
            // Padrão: altera o conteúdo HTML interno se não houver atributo especificado
            el.innerHTML = i18next.t(part);
        }
    });
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

window.toggleLanguage = function() {
  if (!window.i18next) return;
  const currentLng = i18next.language.substring(0, 2).toLowerCase();
  let nextLng = 'en'; // Default fallback

  // Ciclo: pt -> en -> es -> pt
  if (currentLng === 'pt') {
    nextLng = 'en';
  } else if (currentLng === 'en') {
    nextLng = 'es';
  } else if (currentLng === 'es') {
    nextLng = 'pt';
  }

  window.changeLanguage(nextLng);
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

    // Atualiza ou cria o label de texto para mobile
    let labelSpan = document.querySelector('.nav-lang-item > a > span > .lang-label');
    if (!labelSpan) {
        labelSpan = document.createElement('span');
        labelSpan.className = 'lang-label';
        mainFlagImg.parentNode.appendChild(labelSpan);
    }
    
    const labelMap = {
        'pt': 'BR',
        'en': 'EN',
        'es': 'ES'
    };
    labelSpan.textContent = labelMap[cleanLng] || cleanLng.toUpperCase();
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
  // 1. Tenta definir um fallback baseado na URL atual (útil se a detecção automática falhar)
  let loadPath = 'assets/locales/{{lng}}.json'; 
  
  // Verifica se estamos em uma subpasta conhecida (ex: portfolio)
  // Normaliza o pathname para evitar problemas com barras invertidas no Windows (embora no browser seja /)
  const path = window.location.pathname.replace(/\\/g, '/');
  if (path.includes('/portfolio/')) {
     loadPath = '../assets/locales/{{lng}}.json';
  }

  // 2. Tenta detecção mais precisa procurando o script i18n-setup.js
  const scripts = document.getElementsByTagName('script');
  let scriptFound = false;
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.includes('i18n-setup.js')) {
       const scriptUrl = scripts[i].src;
       console.log('i18n: Script URL encontrada:', scriptUrl);
       
       // Regex para capturar tudo antes de 'js/i18n-setup.js' ou 'assets/js/i18n-setup.js'
       // Tenta ser flexível com a estrutura
       if (scriptUrl.match(/(.*)js\/i18n-setup\.js(\?.*)?$/)) {
           // Substitui o final por locales
           loadPath = scriptUrl.replace(/js\/i18n-setup\.js(\?.*)?$/, 'locales/{{lng}}.json');
           console.log('i18n: LoadPath detectado via script:', loadPath);
           scriptFound = true;
           break;
       }
    }
  }

  if (!scriptFound) {
      console.warn('i18n: Script i18n-setup.js não encontrado no DOM ou regex não casou. Usando fallback:', loadPath);
  } else {
      console.log('i18n: LoadPath final:', loadPath);
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
      supportedLngs: ['pt', 'en', 'es'], // Garante que pt-BR caia no fallback pt se não houver exato, ou use load: languageOnly
      load: 'languageOnly', // Ignora região (pt-BR vira pt)
      debug: true,
      interpolation: {
        escapeValue: false 
      },
      backend: {
        loadPath: loadPath + '?v=' + new Date().getTime(), // Cache buster simples
        parse: function(data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('i18n: Erro ao analisar JSON de tradução. Verifique se o caminho está correto e se o servidor está retornando JSON.');
                console.error('i18n: Conteúdo recebido (provavelmente HTML de erro 404/500):', data.substring(0, 500));
                return {}; 
            }
        } 
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        caches: [] // Removido localStorage e cookie para evitar erro de Tracking Prevention e garantir que funcione
      }
    }, function(err, t) {
      if (err) return console.error('Erro ao iniciar i18next:', err);
      console.log('i18next inicializado com idioma:', i18next.language);
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