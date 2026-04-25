/**
 * Titan Cabin Scripts
 * Initializes AOS and Swiper plugins
 */

document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  // Initialize AOS
  AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false
  });

  // Initialize PureCounter
  new PureCounter();

  // Initialize Swiper for Photo Background Section
  new Swiper('.photoBgSwiper', {
    direction: 'vertical',
    speed: 1000,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.photo-bg-pagination',
      clickable: true
    }
  });

  // Initialize Swiper for Social Section
  new Swiper('.social-swiper', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 30
      },
      992: {
        slidesPerView: 3,
        spaceBetween: 40
      }
    }
  });

  // Initialize Swiper for Engine Selection — continuous marquee, never stops
  const engineSwiper = new Swiper('.engineSwiper', {
    speed: 3500,
    loop: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      stopOnLastSlide: false
    },
    grabCursor: false,
    allowTouchMove: true,
    preventClicks: true,
    preventClicksPropagation: true,
    slidesPerView: 2,
    spaceBetween: 16,
    centeredSlides: true,
    on: {
      // After any touch/drag ends, force autoplay to resume immediately
      touchEnd: function () {
        setTimeout(() => this.autoplay.start(), 50);
      }
    },
    breakpoints: {
      480: {
        slidesPerView: 2.5,
        spaceBetween: 18
      },
      576: {
        slidesPerView: 3,
        spaceBetween: 20
      },
      768: {
        slidesPerView: 4,
        spaceBetween: 30
      },
      992: {
        slidesPerView: 6,
        spaceBetween: 40
      },
      1200: {
        slidesPerView: 8,
        spaceBetween: 40
      }
    }
  });

  // Engine selection: distinguish tap from drag, never stop carousel
  let enginePointerStartX = 0;
  let enginePointerStartY = 0;
  const DRAG_THRESHOLD = 8; // pixels

  document.querySelectorAll('.engine-card').forEach(card => {
    card.addEventListener('pointerdown', (e) => {
      enginePointerStartX = e.clientX;
      enginePointerStartY = e.clientY;
    });

    card.addEventListener('pointerup', (e) => {
      const dx = Math.abs(e.clientX - enginePointerStartX);
      const dy = Math.abs(e.clientY - enginePointerStartY);

      // Only treat as a tap/click if pointer barely moved
      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
        const radio = card.querySelector('input[type="radio"]');
        if (!radio) return;

        if (radio.checked) {
          // Toggle off
          radio.checked = false;
          radio.dispatchEvent(new Event('change'));
        } else {
          // Deselect any previously selected and select this one
          document.querySelectorAll('input[name="engine_selection"]').forEach(r => {
            r.checked = false;
          });
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }

        // Always keep carousel running — small timeout avoids Swiper race condition
        setTimeout(() => engineSwiper.autoplay.start(), 50);
      }
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('.scrollto').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.hash !== "") {
        e.preventDefault();
        const target = document.querySelector(this.hash);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Footer quick navigation
  const footerModelSelect = document.getElementById('footerModelSelect');
  const footerModelGo = document.getElementById('footerModelGo');

  const openFooterModel = () => {
    if (footerModelSelect && footerModelSelect.value) {
      window.location.href = footerModelSelect.value;
    }
  };

  if (footerModelSelect) {
    footerModelSelect.addEventListener('change', openFooterModel);
  }

  if (footerModelGo) {
    footerModelGo.addEventListener('click', openFooterModel);
  }

  // Dynamic year for footer legal text
  const currentYear = document.getElementById('current-year');
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Floating WhatsApp Visibility (Shows after scrolling to FAQ)
  const floatingWhatsapp = document.querySelector('.titan-whatsapp-float');
  const faqSection = document.getElementById('faq');
  
  if (floatingWhatsapp && faqSection) {
    window.addEventListener('scroll', () => {
      const faqTop = faqSection.offsetTop;
      const scrollPosition = window.scrollY + window.innerHeight;
      
      if (scrollPosition >= faqTop) {
        floatingWhatsapp.classList.add('show-float');
      } else {
        floatingWhatsapp.classList.remove('show-float');
      }
    });
  }
});
