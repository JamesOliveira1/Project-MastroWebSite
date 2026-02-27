
// versão sem preços aparentes e sem cálculo no front-end (segurança)
// Os preços serão calculados no servidor (PHP) ao enviar o e-mail.

let boatOptions = {};
let currentBoatType = null;

// Controle do Preloader
window.__progeneseKeepPreloader = true;

document.addEventListener("DOMContentLoaded", function () {
  // Timeout de segurança para o preloader
  setTimeout(() => {
     const event = new CustomEvent('progenese:release-preloader');
     window.dispatchEvent(event);
  }, 5000);

  fetch('progenese/api/updatesite.php?action=get_boat_data')
    .then(response => response.json())
    .then(data => {
      boatOptions = data;
      initializeCustomization();
      
      // Libera o preloader
      const event = new CustomEvent('progenese:release-preloader');
      window.dispatchEvent(event);

      // Check URL hash
      const hash = window.location.hash.replace("#", "");
      if (hash && boatOptions[hash]) {
        const boatDiv = document.querySelector(`.boat-option[data-type="${hash}"]`);
        if (boatDiv) {
          boatDiv.click();
          const form = document.getElementById("customBoatForm");
          if(form) form.scrollIntoView({ behavior: "smooth" });
        }
      }
    })
    .catch(error => {
      console.error('Erro ao carregar dados dos barcos:', error);
      // Libera o preloader mesmo com erro para não travar a tela
      const event = new CustomEvent('progenese:release-preloader');
      window.dispatchEvent(event);
    });
});

// --- Funções de Tradução ---

function normalizeTranslationKey(text) {
  if (!text) return "";
  return text.toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "") // Remove caracteres especiais, mantém letras, números e espaços
      .replace(/\s+/g, "_");       // Substitui espaços por underscores
}

function getDbTranslation(text) {
  if (!window.i18next || !text) return text;
  
  // Normaliza para chave snake_case
  const key = normalizeTranslationKey(text);
  const fullKey = `db.${key}`;
  
  if (i18next.exists(fullKey)) {
      return i18next.t(fullKey);
  }
  return text;
}

function getBoatDescription(type, defaultDesc) {
  if (!window.i18next) return defaultDesc;
  
  // Mapa de correção para chaves de barco que diferem do type (ex: "TitanCC" vs "Titan CC")
  const typeMap = {
      'TitanCC': 'Titan CC'
  };
  
  const key = typeMap[type] || type;
  
  if (i18next.exists(`db.${key}`)) {
      return i18next.t(`db.${key}`);
  }
  return defaultDesc;
}

// --- Função de Renderização do Barco ---

function renderSelectedBoat(type) {
  if (!boatOptions[type]) return;
  const selectedBoat = boatOptions[type];

  // Atualização da imagem principal
  const imgPath = `./assets/img/produtos/${type}/fotoprincipal.jpg`;
  const selectedImage = document.getElementById("selectedImage");
  if (selectedImage) {
    selectedImage.src = imgPath;
    selectedImage.onerror = function() { this.src = './assets/img/sem-imagem.jpg'; };
  }

  // Atualização da descrição com tradução
  const descElement = document.getElementById("selectedDescription");
  if (descElement) {
    descElement.textContent = getBoatDescription(type, selectedBoat.description);
  }

  // Atualização da lista de itens
  const ul = document.getElementById("selectedItens");
  if (ul) {
    ul.innerHTML = "";
    let itensArray = [];
    if (Array.isArray(selectedBoat.itens)) {
        itensArray = selectedBoat.itens;
    } else if (typeof selectedBoat.itens === 'string') {
        itensArray = selectedBoat.itens.split(",").map(i => i.trim());
    }
    
    itensArray.forEach((item) => {
      if(item) {
        const li = document.createElement("li");
        li.textContent = getDbTranslation(item);
        ul.appendChild(li);
      }
    });
  }

  // Atualização das opções (Preservando seleções existentes)
  const optionsContainer = document.getElementById("options");
  if (optionsContainer) {
    // Salvar estado
    const existingInputs = {};
    optionsContainer.querySelectorAll('input[name="option"]').forEach(input => {
        existingInputs[input.value] = input.checked;
    });

    optionsContainer.innerHTML = "";
    
    if (selectedBoat.options && Array.isArray(selectedBoat.options)) {
      selectedBoat.options.forEach((opt) => {
        const optionDiv = document.createElement("div");
        
        const optionInput = document.createElement("input");
        optionInput.type = "checkbox";
        optionInput.name = "option";
        optionInput.value = opt.id; 
        optionInput.dataset.name = opt.name;
        
        // Restaurar seleção
        if (existingInputs[opt.id]) {
            optionInput.checked = true;
        }
        
        const optionLink = document.createElement("a");
        optionLink.href = "#";
        optionLink.innerHTML = getDbTranslation(opt.name); // Traduzido
        optionLink.className = "option-link";
        
        optionLink.onclick = function (event) {
          event.preventDefault();
          const selectedOptionalImage = document.getElementById("selectedOptionalImage");
          const imagePath = `./assets/img/options/${opt.name}.jpg`;
          const img = new Image();
          img.onload = function () { selectedOptionalImage.src = imagePath; };
          img.onerror = function () { selectedOptionalImage.src = "./assets/img/options/no-image.jpg"; };
          img.src = imagePath;
          selectedOptionalImage.classList.remove("hidden");
          
          const itemPriceEl = document.getElementById("itemPrice");
          if(itemPriceEl) itemPriceEl.textContent = ""; 
          document.getElementById("selectedOptionalPrice").classList.add("hidden");
        };

        optionDiv.appendChild(optionInput);
        optionDiv.appendChild(optionLink);
        optionsContainer.appendChild(optionDiv);
      });
    }
  }

  // Atualização dos motores (Preservando seleções)
  const motorContainer = document.getElementById("motorOptionsContainer");
  if (motorContainer) {
    // Salvar estado
    const existingMotors = {};
    motorContainer.querySelectorAll('.motor-checkbox').forEach(input => {
        existingMotors[input.value] = input.checked;
    });

    motorContainer.innerHTML = "";

    if (selectedBoat.powers && Array.isArray(selectedBoat.powers)) {
      selectedBoat.powers.forEach((power, index) => {
        const containerBox = document.createElement("div");
        containerBox.classList.add("containerbox");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = `motor-${index}`;
        input.className = "motor-checkbox";
        input.name = "motorSelection"; 
        input.value = power.id; 
        input.dataset.motorName = power.name;
        
        if (existingMotors[power.id]) {
            input.checked = true;
        }

        const label = document.createElement("label");
        label.setAttribute("for", `motor-${index}`);

        const img = document.createElement("img");
        img.src = `./assets/img/motor/${power.name}.jpg`;
        img.onerror = function() { this.style.display = 'none'; };

        const motorNameDiv = document.createElement("div");
        motorNameDiv.className = "motorname";
        motorNameDiv.textContent = getDbTranslation(power.name); // Traduzido

        label.appendChild(img);
        label.appendChild(motorNameDiv);

        containerBox.appendChild(input);
        containerBox.appendChild(label);
        motorContainer.appendChild(containerBox);
      });
    }
    // Re-adicionar eventos
    addMotorCheckboxEvent();
  }
}

function initializeCustomization() {
  // Listener de idioma para atualizar a tradução em tempo real
  if (window.i18next) {
    i18next.on('languageChanged', () => {
      if (currentBoatType) {
        renderSelectedBoat(currentBoatType);
      }
    });
  }

  // Escolha do barco e construção da tela
  document.querySelectorAll(".boat-option").forEach((option) => {
    option.addEventListener("click", function () {
      const type = this.dataset.type;
      
      if (!boatOptions[type]) {
          console.error("Dados do barco não encontrados para:", type);
          return;
      }

      currentBoatType = type;
      
      // Limpar campos visuais
      const els = ["assemblyTotal", "motorizationTotal", "optionsTotal", "totalPrice"];
      els.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.textContent = ""; 
      });

      // Limpar campos ocultos de preço
      document.getElementById("hiddenAssemblyTotal").value = "";
      document.getElementById("hiddenMotorizationTotal").value = "";
      document.getElementById("hiddenOptionsTotal").value = "";
      document.getElementById("hiddenTotalPrice").value = "";

      // Renderizar conteúdo do barco (com tradução)
      renderSelectedBoat(type);

      // Mostrar seções
      document.getElementById("selectedBoat").classList.remove("hidden");
      document.getElementById("optionsSection").classList.remove("hidden");
      document.getElementById("detailsSection").classList.remove("hidden");
      document.getElementById("statusandsubmit").classList.remove("hidden");
      document.querySelector(".bluecustomization").style.display = "block";

      // Classes de seleção
      document.querySelector(".boat-option.selected")?.classList.remove("selected");
      this.classList.add("selected");
      document.querySelector(".boat-option.selectedboatcarrossel")?.classList.remove("selectedboatcarrossel");
      this.classList.add("selectedboatcarrossel");

      // Resetar visualização de opção selecionada
      const optImg = document.getElementById("selectedOptionalImage");
      if(optImg) {
        optImg.classList.add("hidden");
        optImg.src = "";
      }
      document.getElementById("selectedOptionalPrice").classList.add("hidden");
      const itemPriceEl = document.getElementById("itemPrice");
      if(itemPriceEl) itemPriceEl.textContent = "";
      
      // Limpar campo oculto de motor
      document.getElementById("hiddenMotorName").value = "";
    });
  });
}

function addMotorCheckboxEvent() {
  document.querySelectorAll(".motor-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        // Desmarcar outros
        document.querySelectorAll(".motor-checkbox").forEach((box) => {
          if (box !== this) box.checked = false;
        });

        const motorName = this.dataset.motorName;
        // Não definimos preço aqui.
        document.getElementById("hiddenMotorName").value = motorName;
      } else {
        const anyChecked = document.querySelector(".motor-checkbox:checked");
        if (!anyChecked) {
            document.getElementById("hiddenMotorName").value = "";
        }
      }
    });
  });
}

// Envio do formulário
document.getElementById("customBoatForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const form = event.target;
    const loadingElement = form.querySelector(".loading");
    const errorMessageElement = form.querySelector(".error-message");
    const sentMessageElement = form.querySelector(".sent-message");

    errorMessageElement.style.display = "none";
    sentMessageElement.style.display = "none";
    loadingElement.style.display = "block";

    grecaptcha.execute("6LfEIoYqAAAAAH-P0jb0mVzWDm4bkbmgXHpk7jsL", { action: "submit" })
      .then(function (token) {
        document.getElementById("custom-recaptcha-response").value = token;

        const formData = new FormData(form);

        // Boat Type
        if (currentBoatType) {
          formData.append("boatType", currentBoatType);
        } else {
          loadingElement.style.display = "none";
          errorMessageElement.innerHTML = "Por favor, selecione um modelo de barco.";
          errorMessageElement.style.display = "block";
          return;
        }

        // Options: Enviar array de IDs
        const optionsChecked = form.querySelectorAll('input[name="option"]:checked');
        const optionsIds = Array.from(optionsChecked).map((optionInput) => {
          return optionInput.value; // ID
        });
        formData.append("optionIds", JSON.stringify(optionsIds));

        // Motor ID
        const motorChecked = form.querySelector('.motor-checkbox:checked');
        if (motorChecked) {
            formData.append("motorId", motorChecked.value);
        } else {
            // Se nenhum motor for selecionado, pode ser "sem motor" ou erro.
            // O sistema antigo permitia "Sem motor" como uma opção.
            // Vamos assumir que o ID 0 ou similar é "sem motor".
            // Se não selecionar nada, envia 0 ou vazio.
            formData.append("motorId", "0");
        }

        // Fetch
        fetch(form.action, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            loadingElement.style.display = "none";
            if (data.success) {
              sentMessageElement.style.display = "block";
            } else {
              errorMessageElement.innerHTML = data.error || 'Algo deu errado...';
              errorMessageElement.style.display = "block";
            }
          })
          .catch((error) => {
            loadingElement.style.display = "none";
            errorMessageElement.innerHTML = 'Algo deu errado...';
            errorMessageElement.style.display = "block";
          });
      })
      .catch(function (error) {
        loadingElement.style.display = "none";
        errorMessageElement.innerHTML = "Erro ao carregar o reCAPTCHA.";
        errorMessageElement.style.display = "block";
      });
  });
