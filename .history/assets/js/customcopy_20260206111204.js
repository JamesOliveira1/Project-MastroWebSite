
// versão sem preços aparentes com fetch do banco de dados

let boatOptions = {};
let currentBoatType = null;
let currentTotals = {
  assembly: 0,
  motor: 0,
  options: 0
};

// Controle do Preloader
window.__progeneseKeepPreloader = true;

document.addEventListener("DOMContentLoaded", function () {
  fetch('progenese/api/updatesite.php?action=get_boat_data')
    .then(response => response.json())
    .then(data => {
      boatOptions = data;
      initializeCustomization();
      
      // Libera o preloader
      const event = new CustomEvent('progenese:release-preloader');
      document.dispatchEvent(event);

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

// Função central para atualizar os totais (Apenas variáveis e inputs ocultos)
function updateTotals() {
  const total = currentTotals.assembly + currentTotals.motor + currentTotals.options;

  // Função auxiliar de formatação
  const fmt = (val) => val.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  // Formato para envio (sem separador de milhar, decimal com vírgula: 1234,56)
  const fmtSend = (val) => fmt(val).replace(/\./g, "").replace(",", ".").replace(".", ",");

  // Atualiza APENAS os campos ocultos para envio
  document.getElementById("hiddenAssemblyTotal").value = fmtSend(currentTotals.assembly);
  document.getElementById("hiddenMotorizationTotal").value = fmtSend(currentTotals.motor);
  document.getElementById("hiddenOptionsTotal").value = fmtSend(currentTotals.options);
  document.getElementById("hiddenTotalPrice").value = fmtSend(total);

  // Garante que os elementos visuais de preço (se existirem e estiverem visíveis) estejam vazios ou zerados
  // para evitar inspeção fácil.
  const els = ["assemblyTotal", "motorizationTotal", "optionsTotal", "totalPrice"];
  els.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.textContent = ""; 
  });
}

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

      // Resetar os valores
      currentTotals.motor = 0;
      currentTotals.options = 0;
      currentTotals.assembly = parseFloat(selectedBoat.basePrice || 0);
      
      updateTotals();

      // Atualização da imagem principal e descrição
      const imgPath = `./assets/img/produtos/${type}/fotoprincipal.jpg`;
      const selectedImage = document.getElementById("selectedImage");
      selectedImage.src = imgPath;
      selectedImage.onerror = function() { this.src = './assets/img/sem-imagem.jpg'; }; // Fallback

      document.getElementById("selectedDescription").textContent = selectedBoat.description;

      // Atualização da lista de itens
      const ul = document.getElementById("selectedItens");
      ul.innerHTML = "";
      // itens pode vir como string (DB antigo) ou array. O PHP retorna string se for o código antigo, 
      // mas ajustamos o PHP para retornar string separada por virgula. 
      // Se vier array, join. Se vier string, split.
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
          optionInput.value = opt.name; // Value é o NOME, não o preço
          optionInput.dataset.name = opt.name;
          // NÃO colocar preço no dataset para evitar inspeção
          
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
            document.getElementById("itemPrice").textContent = ""; 
            document.getElementById("selectedOptionalPrice").classList.add("hidden");
          };

          // Evento de mudança
          optionInput.addEventListener("change", function () {
            calculateOptionsTotal();
          });

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
          input.name = "motorSelection"; // Para facilitar seleção única se quisesse usar radio, mas script usa checkbox comportado como radio
          input.value = power.name; // Value é o NOME
          input.dataset.motorName = power.name;
          // NÃO colocar preço no dataset

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

      // Adicionar eventos aos motores
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
    });
  });
}

function calculateOptionsTotal() {
  let total = 0;
  const currentBoat = boatOptions[currentBoatType];
  
  if (!currentBoat) return;

  document.querySelectorAll('input[name="option"]:checked').forEach((checkbox) => {
    const name = checkbox.value;
    const optData = currentBoat.options.find(o => o.name === name);
    if (optData) {
      total += parseFloat(optData.price || 0);
    }
  });

  currentTotals.options = total;
  updateTotals();
}

function addMotorCheckboxEvent() {
  document.querySelectorAll(".motor-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        // Desmarcar outros
        document.querySelectorAll(".motor-checkbox").forEach((box) => {
          if (box !== this) box.checked = false;
        });

        const motorName = this.value;
        const currentBoat = boatOptions[currentBoatType];
        let price = 0;

        if (currentBoat && currentBoat.powers) {
          const powerData = currentBoat.powers.find(p => p.name === motorName);
          if (powerData) {
            price = parseFloat(powerData.motorPrice || 0);
          }
        }

        currentTotals.motor = price;
        document.getElementById("hiddenMotorName").value = motorName;
        updateTotals();
      } else {
        // Se desmarcar, zera motor
        // Mas o comportamento original era "radio button" via JS, então se desmarcar o único, fica sem motor?
        // Vamos verificar se sobrou algum marcado (na logica acima, desmarca os outros).
        // Se este foi desmarcado e era o unico, entao total motor = 0
        const anyChecked = document.querySelector(".motor-checkbox:checked");
        if (!anyChecked) {
            currentTotals.motor = 0;
            document.getElementById("hiddenMotorName").value = "";
            updateTotals();
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

        // Options: Reconstruir array com PREÇO (buscando na memória, já que o DOM não tem)
        const currentBoat = boatOptions[currentBoatType];
        const optionsChecked = form.querySelectorAll('input[name="option"]:checked');
        const optionsArray = Array.from(optionsChecked).map((optionInput) => {
          const name = optionInput.value;
          const optData = currentBoat.options.find(o => o.name === name);
          return {
            name: name,
            price: optData ? optData.price : "0.00"
          };
        });
        formData.append("options", JSON.stringify(optionsArray));

        // Totais e Motor Name já estão nos hidden inputs atualizados por updateTotals()

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
