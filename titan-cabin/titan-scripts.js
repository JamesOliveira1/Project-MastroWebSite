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

  // Initialize Swiper for Social Section (Effect Cards)
  new Swiper('.social-swiper', {
    effect: 'cards',
    grabCursor: true,
    speed: 600,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false
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
    link.addEventListener('click', function (e) {
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
  // Form Submission Handling
  const titanForm = document.getElementById('titanForm');
  const formMessage = document.getElementById('formMessage');

  if (titanForm) {
    // Clear message when user starts typing
    titanForm.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        formMessage.innerHTML = '';
      });
    });

    titanForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('.btn-submit-tech2');
      const originalBtnText = submitBtn.innerHTML;

      // Clear previous messages
      formMessage.innerHTML = '';

      // Collect selected engine
      const selectedEngine = document.querySelector('input[name="engine_selection"]:checked');
      document.getElementById('hiddenEngine').value = selectedEngine ? selectedEngine.value : 'Nenhum selecionado';

      // Collect selected optionals
      const selectedOptionals = [];
      document.querySelectorAll('.options-panel .chalk-checkbox input:checked').forEach(checkbox => {
        const text = checkbox.parentElement.textContent.trim();
        selectedOptionals.push(text);
      });
      document.getElementById('hiddenOptionals').value = selectedOptionals.join(', ') || 'Nenhum selecionado';

      const formData = new FormData(this);

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border" role="status" aria-hidden="true"></span> PROCESSANDO DADOS...';

        const response = await fetch(this.action, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          formMessage.innerHTML = '<div class="alert alert-success">Solicitação enviada com sucesso. Nossa equipe técnica entrará em contato em breve.</div>';
          titanForm.reset();
          // Clear selections
          document.querySelectorAll('input[name="engine_selection"]').forEach(r => r.checked = false);
          document.querySelectorAll('.options-panel .chalk-checkbox input').forEach(c => c.checked = false);
        } else {
          formMessage.innerHTML = `<div class="alert alert-danger">ERRO NO PROCESSAMENTO: ${result.error || 'Tente novamente.'}</div>`;
        }
      } catch (error) {
        console.error('Error:', error);
        formMessage.innerHTML = '<div class="alert alert-danger">FALHA NA CONEXÃO: Verifique sua internet e tente novamente.</div>';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // Performance Hotspots Interactivity
  const perfHotspots = document.querySelectorAll('.perf-hotspot');
  const perfBoxes = document.querySelectorAll('.perf-callout-box');

  if (perfHotspots.length > 0) {
    const toggleState = (id) => {
      const hotspot = document.querySelector(`.perf-hotspot[data-target="${id}"]`);
      const box = document.getElementById(id);

      if (hotspot && box) {
        const isActive = hotspot.classList.contains('active');
        if (isActive) {
          hotspot.classList.remove('active');
          box.classList.remove('highlight-active');
        } else {
          hotspot.classList.add('active');
          box.classList.add('highlight-active');
        }
      }
    };

    perfHotspots.forEach(hotspot => {
      const targetId = hotspot.getAttribute('data-target');
      hotspot.addEventListener('click', () => toggleState(targetId));
    });

    perfBoxes.forEach(box => {
      box.addEventListener('click', () => toggleState(box.id));
    });
  }
});
