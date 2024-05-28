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
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
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
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Initiate glightbox 
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
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
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {

    let portfolioContainer = select('.portfolio-container');

    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item', 
        filter: '.filter-new'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });

      }, true);
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

 var swiper = new Swiper(".swiper", {
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
    640: {
      slidesPerView: 2
    },
    768: {
      slidesPerView: 1
    },
    1024: {
      slidesPerView: 2
    },
    1560: {
      slidesPerView: 3
    }
  }
});

/**
   * Troca de icone
   */

document.addEventListener("DOMContentLoaded", function() {
  const iconLink = document.getElementById("icon-change");
  const icons = ["bi-book", "bi-book-half", "bi-book-fill"];
  let currentIndex = 0;

  iconLink.addEventListener("click", function(event) {
      event.preventDefault(); // Impede que o link seja seguido

      const icon = iconLink.querySelector("i");
      
      // Alterna para o próximo ícone no array e atualiza a classe do ícone
      currentIndex = (currentIndex + 1) % icons.length;
      icon.className = `bi ${icons[currentIndex]}`;
  });

  const iconLink2 = document.getElementById("icon-change2");
  const iconClasses = ["bi bi-mailbox", "bi bi-mailbox-flag"];
  let currentIndex2 = 0;

  iconLink2.addEventListener("click", function(event) {
      event.preventDefault(); // Impede que o link seja seguido

      const icon = iconLink2.querySelector("i");
      
      // Alterna para o próximo ícone no array e atualiza a classe do ícone
      currentIndex2 = (currentIndex2 + 1) % iconClasses.length;
      icon.className = `bi ${iconClasses[currentIndex2]}`;
  });

  const iconLink3 = document.getElementById("icon-change3");
  const iconClasses2 = ["bi bi-file-earmark-arrow-down", "bi bi-file-earmark-arrow-down-fill"];
  let currentIndex3 = 0;

  iconLink3.addEventListener("click", function(event) {
      event.preventDefault(); // Impede que o link seja seguido

      const icon = iconLink3.querySelector("i");
      
      // Alterna para o próximo ícone no array e atualiza a classe do ícone
      currentIndex3 = (currentIndex3 + 1) % iconClasses2.length;
      icon.className = `bi ${iconClasses2[currentIndex3]}`;
  });

  
});




/**
 * 
Card swiper porfolio
*/

 
let currentIndex = 0;
const divs = document.querySelectorAll('.trocatexto');
const totalDivs = divs.length;
const controlPrevDiv = document.querySelector('.control.prev');
const controlNextDiv = document.querySelector('.control.next');

function showDiv(index) {
  if (index < 0 || index >= totalDivs) return;
  divs.forEach((div, i) => {
    if (i === index) {
      div.classList.add('cardactive');
    } else {
      div.classList.remove('cardactive');
    }
  });
  currentIndex = index;
  updateButtonStates();
}

function next() {
  showDiv((currentIndex + 1) % totalDivs);
}

function previous() {
  showDiv((currentIndex - 1 + totalDivs) % totalDivs);
}

function updateButtonStates() {
  if (currentIndex === 0) {
    controlPrevDiv.classList.add('disabled');
  } else {
    controlPrevDiv.classList.remove('disabled');
  }

  if (currentIndex === totalDivs - 1) {
    controlNextDiv.classList.add('disabled');
  } else {
    controlNextDiv.classList.remove('disabled');
  }
}

// Swipe functionality
let startX = 0;
let endX = 0;

document.getElementById('cardsswiper').addEventListener('touchstart', (event) => {
  startX = event.touches[0].clientX;
});

document.getElementById('cardsswiper').addEventListener('touchend', (event) => {
  endX = event.changedTouches[0].clientX;
  if (endX < startX && currentIndex < totalDivs - 1) {
    next();
  } else if (endX > startX && currentIndex > 0) {
    previous();
  }
});

// Show the first div initially
showDiv(0);

// Adiciona eventos de clique para os botões de seta
controlNextDiv.addEventListener('click', next);
controlPrevDiv.addEventListener('click', previous);


function showDiv(index) {
  if (index < 0 || index >= totalDivs) return;
  divs.forEach((div, i) => {
    if (i === index) {
      div.classList.add('cardactive');
    } else {
      div.classList.remove('cardactive');
    }
  });
  currentIndex = index;
  updateButtonStates();
}

// COLAPSE DIVS


// Array contendo os IDs dos elementos collink
var collinkIDs = ['collink', 'collink1', 'collink2', 'collink3', 'collink4'];

// Array contendo os IDs dos elementos collapseExample
var collapseExampleIDs = ['collapseExample', 'collapseExample1', 'collapseExample2', 'collapseExample3', 'collapseExample4'];

// Função para adicionar ouvintes de evento aos elementos collink e collapseExample
function addCollapseListeners(collinkID, collapseExampleID) {
    var collink = document.getElementById(collinkID);
    var collapseExample = document.getElementById(collapseExampleID);

    collapseExample.addEventListener('show.bs.collapse', function () {
        collink.classList.add('openedcollapse');
    });

    collapseExample.addEventListener('hide.bs.collapse', function () {
        collink.classList.remove('openedcollapse');
    });
}

// Adicionando ouvintes de evento para cada combinação de IDs
collinkIDs.forEach(function(collinkID) {
    collapseExampleIDs.forEach(function(collapseExampleID) {
        addCollapseListeners(collinkID, collapseExampleID);
    });
});


document.getElementById("phone").addEventListener("input", function(event) {
  const input = event.target;
  input.value = input.value.replace(/\D/g, "");
});

//////// tooltip

        $(document).ready(function(){
            $('[data-toggle="tooltip"]').tooltip();
        });



