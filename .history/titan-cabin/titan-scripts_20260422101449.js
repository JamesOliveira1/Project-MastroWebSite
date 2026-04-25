const hotspotData = {
  power: {
    title: "Potência configurável",
    text: "A plataforma aceita composições de motorização pensadas para esportividade, cruzeiro ou uso misto, com integração coerente entre resposta, peso e proposta operacional."
  },
  range: {
    title: "Autonomia inteligente",
    text: "O conjunto é pensado para preservar rendimento e raio de uso conforme a configuração definida, priorizando navegação consistente e planejamento seguro."
  },
  speed: {
    title: "Velocidade máxima com controle",
    text: "O foco não está apenas em atingir picos, mas em sustentar aceleração, estabilidade e leitura precisa de casco em diferentes condições de água."
  }
};

function initAOS() {
  if (window.AOS) {
    window.AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 40
    });
  }
}

function initHotspots() {
  const buttons = document.querySelectorAll(".hotspot");
  const title = document.getElementById("performance-title");
  const text = document.getElementById("performance-text");

  if (!buttons.length || !title || !text) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.hotspot;
      const content = hotspotData[key];

      if (!content) {
        return;
      }

      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      title.textContent = content.title;
      text.textContent = content.text;
    });
  });
}

function initFaq() {
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const isExpanded = question.getAttribute("aria-expanded") === "true";

      questions.forEach((item) => {
        const itemAnswer = item.nextElementSibling;

        item.setAttribute("aria-expanded", "false");
        if (itemAnswer) {
          itemAnswer.classList.remove("open");
        }
      });

      if (!isExpanded && answer) {
        question.setAttribute("aria-expanded", "true");
        answer.classList.add("open");
      }
    });
  });
}

function initCarousel() {
  const track = document.getElementById("carousel-track");
  const prev = document.getElementById("carousel-prev");
  const next = document.getElementById("carousel-next");
  const status = document.getElementById("carousel-status");

  if (!track || !prev || !next || !status) {
    return;
  }

  const cards = Array.from(track.querySelectorAll(".post-card"));
  if (!cards.length) {
    return;
  }

  const getStep = () => {
    const card = cards[0];
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0");
    return card.getBoundingClientRect().width + gap;
  };

  const updateStatus = () => {
    const step = getStep();
    const index = Math.round(track.scrollLeft / step) + 1;
    const safeIndex = Math.min(Math.max(index, 1), cards.length);
    status.textContent = `${safeIndex} / ${cards.length}`;
  };

  prev.addEventListener("click", () => {
    track.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    track.scrollBy({ left: getStep(), behavior: "smooth" });
  });

  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateStatus);
  });

  window.addEventListener("resize", updateStatus);
  updateStatus();
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function initLeadForm() {
  const form = document.getElementById("lead-form");
  const phone = document.getElementById("whatsapp");
  const note = document.getElementById("form-note");
  const chips = document.querySelectorAll(".choice-chip");
  const priority = document.getElementById("prioridade");

  if (phone) {
    phone.addEventListener("input", (event) => {
      event.target.value = formatPhone(event.target.value);
    });
  }

  if (chips.length && priority) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((item) => item.classList.remove("active"));
        chip.classList.add("active");
        priority.value = chip.dataset.value || "";
      });
    });
  }

  if (!form || !note) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const button = form.querySelector(".btn-submit");
    if (button) {
      button.textContent = "Solicitação registrada";
      button.disabled = true;
    }

    note.textContent = "Recebemos seus dados localmente nesta interface. O endpoint de backend pode ser conectado futuramente sem alterar a experiência do usuário.";
    note.style.color = "#004f91";
    form.reset();

    if (priority) {
      priority.value = "performance";
    }

    chips.forEach((chip, index) => {
      chip.classList.toggle("active", index === 0);
    });

    if (phone) {
      phone.value = "";
    }

    window.setTimeout(() => {
      if (button) {
        button.textContent = "Enviar solicitação";
        button.disabled = false;
      }
    }, 2400);
  });
}

function setCurrentYear() {
  const year = document.getElementById("current-year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAOS();
  initHotspots();
  initFaq();
  initCarousel();
  initLeadForm();
  setCurrentYear();
});
