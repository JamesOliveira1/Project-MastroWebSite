
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
      document.dispatchEvent(event);
    });
});

function initializeCustomization() {
  // Escolha do barco e construção da tela
  document.querySelectorAll(".boat-option").forEach((option) => {
    option.addEventListener("click", function () {
      const type = this.dataset.type;
      
      if (!boatOptions[type]) {
          console.error("Dados do barco não encontrados para:", type);
          return;
      }

      currentBoatType = type;
      const selectedBoat = boatOptions[type];
      
      // Não calculamos totais no front. Apenas limpamos os campos visuais se existirem.
      const els = ["assemblyTotal", "motorizationTotal", "optionsTotal", "totalPrice"];
      els.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.textContent = ""; 
      });

      // Limpar campos ocultos de preço (para não enviar lixo)
      document.getElementById("hiddenAssemblyTotal").value = "";
      document.getElementById("hiddenMotorizationTotal").value = "";
      document.getElementById("hiddenOptionsTotal").value = "";
      document.getElementById("hiddenTotalPrice").value = "";

      // Atualização da imagem principal e descrição
      const imgPath = `./assets/img/produtos/${type}/fotoprincipal.jpg`;
      const selectedImage = document.getElementById("selectedImage");
      selectedImage.src = imgPath;
      selectedImage.onerror = function() { this.src = './assets/img/sem-imagem.jpg'; }; // Fallback

      document.getElementById("selectedDescription").textContent = selectedBoat.description;

      // Atualização da lista de itens
      const ul = document.getElementById("selectedItens");
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
          li.textContent = item;
          ul.appendChild(li);
        }
      });

      // Atualização das opções
      const optionsContainer = document.getElementById("options");
      optionsContainer.innerHTML = "";
      
      if (selectedBoat.options && Array.isArray(selectedBoat.options)) {
        selectedBoat.options.forEach((opt) => {
          const optionDiv = document.createElement("div");
          
          const optionInput = document.createElement("input");
          optionInput.type = "checkbox";
          optionInput.name = "option";
          // USAR ID COMO VALUE
          optionInput.value = opt.id; 
          optionInput.dataset.name = opt.name;
          
          const optionLink = document.createElement("a");
          optionLink.href = "#";
          optionLink.innerHTML = `${opt.name}`; // Apenas o nome
          optionLink.className = "option-link";
          
          optionLink.onclick = function (event) {
            event.preventDefault();
            const selectedOptionalImage = document.getElementById("selectedOptionalImage");
            
            // Tenta carregar imagem
            const imagePath = `./assets/img/options/${opt.name}.jpg`;
            const img = new Image();
            img.onload = function () { selectedOptionalImage.src = imagePath; };
            img.onerror = function () { selectedOptionalImage.src = "./assets/img/options/no-image.jpg"; };
            img.src = imagePath;
            
            selectedOptionalImage.classList.remove("hidden");
            
            // Esconder preço visual
            const itemPriceEl = document.getElementById("itemPrice");
            if(itemPriceEl) itemPriceEl.textContent = ""; 
            document.getElementById("selectedOptionalPrice").classList.add("hidden");
          };

          optionDiv.appendChild(optionInput);
          optionDiv.appendChild(optionLink);
          optionsContainer.appendChild(optionDiv);
        });
      }

      // Atualização dos motores
      const motorContainer = document.getElementById("motorOptionsContainer");
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
          // USAR ID COMO VALUE
          input.value = power.id; 
          input.dataset.motorName = power.name;

          const label = document.createElement("label");
          label.setAttribute("for", `motor-${index}`);

          const img = document.createElement("img");
          img.src = `./assets/img/motor/${power.name}.jpg`;
          img.onerror = function() { this.style.display = 'none'; }; // Esconde se não tiver img

          const motorNameDiv = document.createElement("div");
          motorNameDiv.className = "motorname";
          motorNameDiv.textContent = power.name;

          label.appendChild(img);
          label.appendChild(motorNameDiv);

          containerBox.appendChild(input);
          containerBox.appendChild(label);
          motorContainer.appendChild(containerBox);
        });
      }

      // Adicionar eventos aos motores (apenas para seleção exclusiva)
      addMotorCheckboxEvent();

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
