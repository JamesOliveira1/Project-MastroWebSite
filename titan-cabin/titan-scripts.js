/**
 * Titan Cabin Scripts
 * Initializes GSAP ScrollTrigger and Swiper plugins
 */

document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  // Register GSAP Plugins
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  // Initialize ScrollSmoother
  const smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.5,
    effects: true, // Enables data-speed and data-lag
    smoothTouch: 0.1
  });

  // 1. Smooth Fade & Slide for single [data-aos] elements
  // We'll use scrub: 1 for a more connected, professional feel
  const aosElements = document.querySelectorAll('[data-aos]:not(.stagger-item)');
  aosElements.forEach(el => {
    const animation = el.getAttribute('data-aos');
    const delay = el.getAttribute('data-aos-delay') / 1000 || 0;
    const duration = el.getAttribute('data-aos-duration') / 1000 || 1.5;

    let vars = {
      opacity: 0,
      duration: duration,
      delay: delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "top 60%",
        scrub: 1, // Smooth scrub as requested
        toggleActions: "play reverse play reverse"
      }
    };

    if (animation === 'fade-up') vars.y = 60;
    else if (animation === 'fade-down') vars.y = -60;
    else if (animation === 'fade-left') vars.x = 60;
    else if (animation === 'fade-right') vars.x = -60;
    else if (animation === 'zoom-in') vars.scale = 0.9;
    else if (animation === 'zoom-out') vars.scale = 1.1;

    gsap.from(el, vars);
  });

  // 2. Staggered Reveals for Grid Containers
  const staggerContainers = [
    { container: '.dna-section .row', items: '.col-md-4' },
    { container: '.perf-boxes-container', items: '.col-lg-4' },
    { container: '.options-list', items: '.chalk-checkbox' }
  ];

  staggerContainers.forEach(group => {
    const trigger = document.querySelector(group.container);
    if (!trigger) return;

    gsap.from(trigger.querySelectorAll(group.items), {
      y: 50,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: trigger,
        start: "top 85%",
        end: "bottom 80%",
        scrub: 1,
        toggleActions: "play reverse play reverse"
      }
    });
  });

  // 3. Hero Image Cross-fade Reveal (Sticky/Pinned)
  const heroRevealSection = document.querySelector('#hero-titan');
  const heroImgs = document.querySelectorAll('.hero-reveal-img');
  
  if (heroRevealSection && heroImgs.length > 0) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRevealSection,
        start: "top top",
        end: "+=2000", // Increased scroll distance to accommodate text reveal
        scrub: true,
        pin: true,
        anticipatePin: 1
      }
    });

    // 1. Text Reveal (First step of scroll)
    tl.from('.hero-text-col', { 
      x: -100, 
      opacity: 0, 
      duration: 1, 
      ease: "power2.out" 
    })
    
    // 2. Pause/Hold text for a bit
    tl.to({}, { duration: 0.5 }) 

    // 3. Animate from Img 1 to Img 2
    tl.to('.hero-reveal-img.img-1', { opacity: 0, ease: "none", duration: 1 }, "crossfade1")
      .to('.hero-reveal-img.img-2', { opacity: 1, ease: "none", duration: 1 }, "crossfade1")
      
    // 4. Animate from Img 2 to Img 3
    tl.to('.hero-reveal-img.img-2', { opacity: 0, ease: "none", duration: 1 }, "crossfade2")
      .to('.hero-reveal-img.img-3', { opacity: 1, ease: "none", duration: 1 }, "crossfade2");
  }

  // 4. Subtle scale reveal for section titles
  const sectionTitles = document.querySelectorAll('.section-title h2');
  sectionTitles.forEach(title => {
    gsap.from(title, {
      letterSpacing: "10px",
      opacity: 0,
      duration: 2,
      ease: "power4.out",
      scrollTrigger: {
        trigger: title,
        start: "top 90%",
        end: "top 70%",
        scrub: 1
      }
    });
  });

  // 5. Technical Engineering Details
  // Draw tech lines in DNA section
  const techLines = document.querySelectorAll('.tech-line');
  techLines.forEach(line => {
    gsap.fromTo(line, 
      { width: "0%" },
      {
        width: "100%",
        ease: "power2.out",
        scrollTrigger: {
          trigger: line.closest('.tech-card'),
          start: "top 80%",
          end: "bottom 80%",
          scrub: 1
        }
      }
    );
  });

  // Pop hotspots in Performance section
  const hotspots = document.querySelectorAll('.perf-hotspot');
  if(hotspots.length > 0) {
    gsap.from(hotspots, {
      scale: 0,
      opacity: 0,
      stagger: 0.3,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: ".performance-scanner",
        start: "top 75%",
        end: "top 30%",
        scrub: 1
      }
    });
  }

  // Dynamic Border Animation for Performance Image
  const perfBorderTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".perf-featured-container",
      start: "top 90%",
      end: "top 20%",
      scrub: 1
    }
  });

  perfBorderTl
    .to(".pt-top", { width: "100%", ease: "none" })
    .to(".pt-right", { height: "100%", ease: "none" })
    .to(".pt-bottom", { width: "100%", ease: "none" })
    .to(".pt-left", { height: "100%", ease: "none" });

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

  // Initialize Swiper for Personalization Section
  const personalizationSwiper = new Swiper('.personalizationSwiper', {
    grabCursor: true,
    speed: 1000,
    mousewheel: false, // Controlled manually via window wheel event
    pagination: {
      el: '.personalization-progress',
      type: 'progressbar',
    },
    touchStartPreventDefault: false,
    simulateTouch: true,
    allowTouchMove: true,
  });

  // Locked Scroll Logic: Intercept global wheel to advance slides
  let isTransitioning = false;
  const pSection = document.getElementById('personalization');

  window.addEventListener('wheel', (e) => {
    if (!pSection) return;

    const rect = pSection.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    
    // Check if the section is largely visible in the viewport
    const sectionTopInView = rect.top >= -100 && rect.top <= 100;
    
    if (sectionTopInView) {
      // If scrolling down and not at the last slide
      if (e.deltaY > 0 && !personalizationSwiper.isEnd) {
        if (!isTransitioning) {
          isTransitioning = true;
          personalizationSwiper.slideNext();
          setTimeout(() => { isTransitioning = false; }, 1000);
        }
        e.preventDefault();
        return false;
      } 
      // If scrolling up and not at the first slide
      else if (e.deltaY < 0 && !personalizationSwiper.isBeginning) {
        if (!isTransitioning) {
          isTransitioning = true;
          personalizationSwiper.slidePrev();
          setTimeout(() => { isTransitioning = false; }, 1000);
        }
        e.preventDefault();
        return false;
      }
    }
  }, { passive: false });

  // Initialize Swiper for Social Section (Effect Cards)
  new Swiper('.social-swiper', {
    effect: 'cards',
    grabCursor: true,
    speed: 600,
    loop: true
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

  // Language Selector Interaction
  const langFlags = document.querySelectorAll('.lang-flag');
  const langMsg = document.querySelector('.lang-message');
  let langTimeout;

  langFlags.forEach(flag => {
    flag.addEventListener('click', () => {
      // Toggle active class
      langFlags.forEach(f => f.classList.remove('active'));
      flag.classList.add('active');

      // Show message
      if (langMsg) {
        langMsg.classList.add('show');
        
        // Reset timeout if already running
        clearTimeout(langTimeout);
        
        // Hide message after 3 seconds
        langTimeout = setTimeout(() => {
          langMsg.classList.remove('show');
        }, 3000);
      }
    });
  });
});
