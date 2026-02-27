/**
* Template Name: Dewi
* Updated: Jan 29 2024 with Bootstrap v5.3.2
* Template URL: https://bootstrapmade.com/dewi-free-multi-purpose-html-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (section) {
        if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
          navbarlink.classList.add('active')
        } else {
          navbarlink.classList.remove('active')
        }
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 20
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  var translateButton = document.getElementById("translate-button");

if (translateButton) {
    translateButton.addEventListener("click", function(event) {
        event.preventDefault();
        var currentUrl = window.location.href;
        var translateUrl = "https://translate.google.com/translate?hl=pt-BR&sl=pt&tl=en&u=" + encodeURIComponent(currentUrl);
        window.location.href = translateUrl;
    });
}


  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  
  if (backtotop) {
    const toggleBacktotop = () => {
      // Re-seleciona o container de suporte caso ele tenha sido injetado dinamicamente
      let supportContainer = select('.support-container')
      
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
        if (supportContainer) supportContainer.classList.add('move-up')
      } else {
        backtotop.classList.remove('active')
        if (supportContainer) supportContainer.classList.remove('move-up')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Support Menu Toggle
   */
  function initSupportMenu() {
    let supportBtn = select('#supportBtnToggle')
    let supportMenu = select('#supportMenu')
    
    if (supportBtn && supportMenu) {
      // Remove listeners antigos para evitar duplicidade se chamado múltiplas vezes
      // (Embora 'on' e 'addEventListener' possam acumular, aqui estamos focando em garantir que funcione quando o elemento existir)
      
      // Como o elemento pode ser substituído, o listener anterior morre com o elemento.
      // Mas se o script rodar de novo, precisamos cuidar. 
      // Neste caso, a função é chamada quando o footer está pronto.

      on('click', '#supportBtnToggle', function(e) {
        e.preventDefault()
        supportMenu.classList.toggle('active')
      })
      
      // Opcional: fechar ao clicar fora
      // Para o document, precisamos ter cuidado para não adicionar múltiplos listeners globais
      // Uma abordagem simples é verificar se já adicionamos ou usar uma flag
      if (!window._supportMenuClickOutsideAdded) {
        document.addEventListener('click', function(e) {
          // Precisamos re-selecionar pois os elementos podem ter mudado se o footer foi recarregado (improvável, mas seguro)
          let currentBtn = select('#supportBtnToggle')
          let currentMenu = select('#supportMenu')
          
          if (currentBtn && currentMenu && !currentBtn.contains(e.target) && !currentMenu.contains(e.target)) {
            currentMenu.classList.remove('active')
          }
        })
        window._supportMenuClickOutsideAdded = true;
      }
    }
  }

  // Inicializa se já estiver no DOM (caso estático)
  initSupportMenu();

  // Inicializa quando o footer for injetado
  window.addEventListener('progenese:footer-ready', initSupportMenu);


// Inicialização segura do menu após o header estar disponível
function initProgeneseNavEnhancements() {
  if (window.__progeneseNavInitDone) return;

  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navbar = document.querySelector('#navbar');
  const menuIcon = document.querySelector('#menu-icon');

  if (!mobileToggle || !navbar || !menuIcon) {
    return; // Aguarda até que o header seja inserido
  }

  window.__progeneseNavInitDone = true;

  // Alterna o menu móvel e o ícone de lista/X
  mobileToggle.addEventListener('click', function() {
    // Alterna o estado do menu
    navbar.classList.toggle('navbar-mobile');

    // Fecha todos os dropdowns quando o menu é reaberto
    if (navbar.classList.contains('navbar-mobile')) {
      document.querySelectorAll('.navbar .dropdown .dropdown-active').forEach(function(activeDropdown) {
        activeDropdown.classList.remove('dropdown-active');
      });
    }

    // Troca o ícone entre "X" e "lista"
    if (navbar.classList.contains('navbar-mobile')) {
      // Ícone "X" (fechar)
      menuIcon.innerHTML = `<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>`;
    } else {
      // Ícone de lista (abrir)
      menuIcon.innerHTML = `<path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>`;
    }
  });

  // Fecha o menu ao clicar nos links com IDs específicos ou javascript:void(0)
  document.querySelectorAll('.navbar a').forEach(function(navLink) {
    navLink.addEventListener('click', function(e) {
      const linkId = this.id;

      // IDs que devem fechar o menu ao serem clicados
      const closeMenuIds = ['filter-xs-link', 'filter-new-link'];

      // Verifica se o link deve fechar o menu
      if (closeMenuIds.includes(linkId) || this.getAttribute('href') === 'javascript:void(0)') {
        // Impede a navegação padrão para links com javascript:void(0)
        e.preventDefault();

        // Fecha o menu removendo a classe que o torna visível
        navbar.classList.remove('navbar-mobile');

        // Ajusta o ícone do menu (voltando para o estado original)
        menuIcon.innerHTML = `<path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>`;

        // Fecha todos os dropdowns ao fechar o menu
        document.querySelectorAll('.navbar .dropdown .dropdown-active').forEach(function(activeDropdown) {
          activeDropdown.classList.remove('dropdown-active');
        });
        
        // Remove a classe active-lang se existir
        document.querySelectorAll('.navbar .nav-lang-item > a').forEach(el => el.classList.remove('active-lang'));
      }
    });
  });

  // Listener específico para fechar o menu ao selecionar um idioma
  document.querySelectorAll('.navbar .nav-lang-item ul li').forEach(function(langItem) {
    langItem.addEventListener('click', function(e) {
        if (navbar.classList.contains('navbar-mobile')) {
             // Fechamento suave: reduz opacidade antes de remover a classe
             navbar.style.transition = 'opacity 0.3s ease-in-out';
             navbar.style.opacity = '0';
             
             setTimeout(function() {
                 navbar.classList.remove('navbar-mobile');
                 // Reseta estilos inline para não afetar o menu desktop ou reaberturas futuras
                 navbar.style.opacity = '';
                 navbar.style.transition = '';

                 menuIcon.innerHTML = `<path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>`;
                 
                 // Fecha dropdowns
                 document.querySelectorAll('.navbar .dropdown .dropdown-active').forEach(function(activeDropdown) {
                    activeDropdown.classList.remove('dropdown-active');
                 });
                 // Remove a classe active-lang
                 document.querySelectorAll('.navbar .nav-lang-item > a').forEach(el => el.classList.remove('active-lang'));
             }, 300); // Tempo deve corresponder à transição (0.3s)
        }
    });
  });

  // Abre o dropdown em modo móvel
  document.querySelectorAll('.navbar .dropdown > a').forEach(function(dropdownLink) {
    dropdownLink.addEventListener('click', function(e) {
      if (navbar.classList.contains('navbar-mobile')) {
        e.preventDefault(); // Evita o comportamento de redirecionamento
        const dropdownUl = this.nextElementSibling;
        dropdownUl.classList.toggle('dropdown-active'); // Ativa/desativa o dropdown
        
        // Animação de altura suave
        if (dropdownUl.classList.contains('dropdown-active')) {
            dropdownUl.style.maxHeight = (dropdownUl.scrollHeight + 50) + "px"; // +50px de margem de segurança
        } else {
            dropdownUl.style.maxHeight = "0px";
        }
        
        // Se for o dropdown de idiomas, alterna a classe para a barra visual
        if (this.parentElement.classList.contains('nav-lang-item')) {
            this.classList.toggle('active-lang');
        }
      }
    });
  });

  // Fecha o menu ao clicar em links que não são dropdowns
  document.querySelectorAll('.navbar a').forEach(function(navLink) {
    navLink.addEventListener('click', function(e) {
      const isDropdownLink = this.closest('.dropdown') !== null;

      if (navbar.classList.contains('navbar-mobile') && !isDropdownLink) {
        navbar.classList.remove('navbar-mobile');
        menuIcon.innerHTML = `<path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>`;

        // Fecha todos os dropdowns ao fechar o menu
        document.querySelectorAll('.navbar .dropdown .dropdown-active').forEach(function(activeDropdown) {
          activeDropdown.classList.remove('dropdown-active');
        });
      }
    });
  });
}

// Aguarda a inserção do header via componentes antes de inicializar os listeners
window.addEventListener('progenese:header-ready', initProgeneseNavEnhancements);
window.addEventListener('load', initProgeneseNavEnhancements);


  /**
   * Preloader
   */
  // O preloader deve ser removido manualmente em páginas específicas (como custom.html)
  // Se não houver lógica customizada, removemos no load.
  let preloader = select('#preloader');
  if (preloader) {
    if (!document.body.classList.contains('page-custom-loading')) {
      window.addEventListener('load', () => {
        preloader.remove()
      });
    }
  }

  /**
   * Initiate glightbox 
   */
  const lightbox = GLightbox({
    selector: '.glightbox'
  });
  

  /*
   /*** 
   * 
   * 
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  function getCurrentScroll() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }

/**
 * Portfolio isotope and filter
 */
window.addEventListener('load', () => {
  let portfolioContainer = document.querySelector('.portfolio-container');

  if (portfolioContainer) {
    // Inicializa o Isotope com o filtro padrão
    let portfolioIsotope = new Isotope(portfolioContainer, {
      itemSelector: '.portfolio-item',
      filter: '.filter-new'  // Filtro inicial
    });

    let portfolioFilters = document.querySelectorAll('#portfolio-flters li');

    // Função para ativar um filtro específico e atualizar a classe 'filter-active'
    function activateFilter(filterClass) {
      // Remove a classe "filter-active" de todos os filtros
      portfolioFilters.forEach(el => el.classList.remove('filter-active'));

      // Adiciona a classe "filter-active" ao item correspondente
      document.querySelector(`[data-filter="${filterClass}"]`)?.classList.add('filter-active');

      // Aplica o filtro no Isotope
      portfolioIsotope.arrange({
        filter: filterClass
      });

      // Atualiza a animação AOS (se estiver usando)
      portfolioIsotope.on('arrangeComplete', function() {
        AOS.refresh();
      });
    }

    // Função para verificar e aplicar o filtro com base no parâmetro da URL
    function applyFilterFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const filterParam = urlParams.get('filter');

      if (filterParam) {
        let filterClass;
        switch (filterParam) {
          case 'xs':
            filterClass = '.filter-xs';
            break;
          case 'new':
            filterClass = '.filter-new';
            break;
          default:
            filterClass = '.filter-new';
        }
        activateFilter(filterClass);

        // Rola para a seção #portfolio se o filtro estiver na URL
        document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Chama a função para aplicar o filtro da URL ao carregar a página
    applyFilterFromUrl();

    // Evento de clique para os filtros normais dentro de #portfolio-flters
    portfolioFilters.forEach((el) => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh();
        });
      });
    });

    // Verifica a existência dos elementos antes de adicionar os event listeners
    const xsLink = document.getElementById('filter-xs-link');
    const newLink = document.getElementById('filter-new-link');
    const portfolio = document.getElementById('portfolio');

    if (xsLink && newLink && portfolio) {
      // Eventos de clique para os links internos (Modelos XS e Todos os Modelos)
      xsLink.addEventListener('click', () => {
        activateFilter('.filter-xs');
        portfolio.scrollIntoView({ behavior: 'smooth' });
      });

      newLink.addEventListener('click', () => {
        activateFilter('.filter-new');
        portfolio.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }
});



  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  });

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()

 /**
   * Carrossel
   */

 var swiper = new Swiper(".swiper:not(.instagram-swiper)", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  coverflowEffect: {
    rotate: 0,
    stretch: 0,
    depth: 100,
    modifier: 3,
    slideShadows: true
  },
  keyboard: {
    enabled: true
  },
  mousewheel: {
    thresholdDelta: 70
  },
  loop: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true
  },
  breakpoints: {
    
    350: {
      slidesPerView: 2
    },
    450:{
      slidesPerView: 3
    },
    768: {
      slidesPerView: 2
    },
    1024: {
      slidesPerView: 2
    },
    1200: {
      slidesPerView: 3
    },
    1560: {
      slidesPerView: 3
    }
  }
});

// Atualiza o ano atual quando o footer estiver pronto (ou no load)
function updateCurrentYear() {
  const el = document.getElementById('current-year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

window.addEventListener('progenese:footer-ready', updateCurrentYear);
window.addEventListener('load', updateCurrentYear);

//////////

//////////
//////////
//////////

////////////////////////////////////
//////////////////////////////////////

// Guard: oculta overlays injetados via extensões (Shadow DOM) que exibem
// comentários do Tailwind e causam barras brancas com alto z-index.
// Não interfere em conteúdo legítimo do site.
function hideInjectedOverlays() {
  try {
    const hosts = Array.from(document.querySelectorAll('*')).filter(function(el) {
      return el.shadowRoot;
    });
    hosts.forEach(function(el) {
      const txt = (el.shadowRoot && el.shadowRoot.textContent) ? el.shadowRoot.textContent : '';
      // Heurística: identifica conteúdo típico do cabeçalho do Tailwind/preflight
      if (txt.includes('tailwindcss v') || txt.includes('https://tailwindcss.com') || txt.includes('cssremedy/issues/4') || txt.includes('tailwindcss/pull/116')) {
        el.style.display = 'none';
      }
    });
  } catch (e) {
    // Silencia erros por segurança; não deve quebrar a página
  }
}

// Executa após carregamento inicial
window.addEventListener('load', hideInjectedOverlays);
// Observa o DOM para novos hosts com ShadowRoot e aplica o guard
try {
  const __overlayObserver = new MutationObserver(function() {
    hideInjectedOverlays();
  });
  __overlayObserver.observe(document.documentElement, { childList: true, subtree: true });
} catch (e) {
  // MutationObserver indisponível? Ignora.
}

/**
 * Cookie Consent and Analytics Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const cookieConsentId = 'cookie-consent';
  const allowBtnId = 'cookie-consent-allow-btn';
  const denyBtnId = 'cookie-consent-deny-btn';
  const storageKey = 'cookie_consent_status'; // 'allowed' or 'denied'

  const hideConsentBanner = (banner) => {
    if (!banner) return;
    banner.classList.add('closing');
    const onEnd = (e) => {
      if (e.target !== banner) return;
      banner.style.display = 'none';
      banner.classList.remove('closing');
      banner.removeEventListener('transitionend', onEnd);
    };
    banner.addEventListener('transitionend', onEnd);
  };

  // Function to load analytics scripts
  const loadAnalytics = () => {
    // Avoid double loading
    if (window.analyticsLoaded) return;
    window.analyticsLoaded = true;

    console.log('Loading analytics scripts...');

    // Google Tag Manager (gtag.js)
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-YB1DY8YW32';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-YB1DY8YW32');
    `;
    document.head.appendChild(script2);

    // Ahrefs Site Tag
    const script3 = document.createElement('script');
    script3.async = true;
    script3.src = 'https://analytics.ahrefs.com/analytics.js';
    script3.setAttribute('data-key', 'sUC8edbnu4lfND10gYrkLQ');
    document.head.appendChild(script3);
  };

  const handleConsent = () => {
    const consentBanner = document.getElementById(cookieConsentId);
    const allowBtn = document.getElementById(allowBtnId);
    const denyBtn = document.getElementById(denyBtnId);

    // Check current status
    const currentStatus = localStorage.getItem(storageKey);

    if (currentStatus === 'allowed') {
      loadAnalytics();
      if (consentBanner) hideConsentBanner(consentBanner);
    } else if (currentStatus === 'denied') {
      if (consentBanner) hideConsentBanner(consentBanner);
    } else {
      // No choice made yet
      if (consentBanner) {
        // Ensure it's visible if not chosen
        consentBanner.style.display = 'block'; 
      }
    }

    if (allowBtn) {
      allowBtn.addEventListener('click', () => {
        localStorage.setItem(storageKey, 'allowed');
        if (consentBanner) hideConsentBanner(consentBanner);
        loadAnalytics();
      });
    }

    if (denyBtn) {
      denyBtn.addEventListener('click', () => {
        localStorage.setItem(storageKey, 'denied');
        if (consentBanner) hideConsentBanner(consentBanner);
      });
    }
  };

  // Run immediately if DOM is ready, or wait
  handleConsent();

  // Also listen for footer ready event in case it's loaded dynamically
  window.addEventListener('progenese:footer-ready', handleConsent);
});
