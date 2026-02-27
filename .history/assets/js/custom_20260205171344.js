

//Modelos de barco com itens de série, opcionais, motores e preços
let boatOptions = {};

// Função para mostrar/ocultar loading
function toggleLoading(show) {
  const loading = document.getElementById('preloader'); // Usando o preloader existente ou criando um
  if (loading) {
    loading.style.display = show ? 'block' : 'none';
  } else {
    // Fallback se não houver preloader
    document.body.style.cursor = show ? 'wait' : 'default';
    const boatSelection = document.getElementById('boatSelection');
    if (boatSelection) {
        boatSelection.style.opacity = show ? '0.5' : '1';
        boatSelection.style.pointerEvents = show ? 'none' : 'auto';
    }
  }
}

toggleLoading(true);

// Buscar dados do banco de dados via API
fetch('api/updatesite.php?action=get_boat_data')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro na rede ao buscar dados: ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    boatOptions = data;
    console.log("Dados dos barcos carregados com sucesso.");
    toggleLoading(false);
    initializeBoatSelection(); // Inicializa os eventos apenas após carregar os dados
  })
  .catch(error => {
    console.error('Erro ao carregar dados dos barcos:', error);
    toggleLoading(false);
    // Mostrar mensagem de erro amigável na interface
    const boatSelection = document.getElementById('boatSelection');
    if(boatSelection) {
        boatSelection.innerHTML = '<p class="text-center text-danger">Erro ao carregar os modelos. Por favor, recarregue a página.</p>';
    }
  });

////////////////////////////////////////////////
////////////////////////////////////////////////

// Calculadora de preços
function updateTotalPriceToX() {
  // Obtém os totais de Assembly, Motorization e Options
  const assemblyTotal =
    parseFloat(
      document
        .getElementById("assemblyTotal")
        .textContent.replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;
  const motorizationTotal =
    parseFloat(
      document
        .getElementById("motorizationTotal")
        .textContent.replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;
  const optionsTotal =
    parseFloat(
      document
        .getElementById("optionsTotal")
        .textContent.replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;

  // Calcula o Total Price
  const totalPrice = assemblyTotal + motorizationTotal + optionsTotal;

  // Formata os valores para exibição
  const formattedAssemblyTotal = assemblyTotal.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  const formattedMotorizationTotal = motorizationTotal.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  const formattedOptionsTotal = optionsTotal.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  const formattedTotalPrice = totalPrice.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  // Atualiza os elementos da página com os totais formatados
  document.getElementById("assemblyTotal").textContent = formattedAssemblyTotal;
  document.getElementById("motorizationTotal").textContent =
    formattedMotorizationTotal;
  document.getElementById("optionsTotal").textContent = formattedOptionsTotal;
  document.getElementById("totalPrice").textContent = formattedTotalPrice;

  // Atualiza os campos ocultos com os valores formatados no padrão brasileiro
  document.getElementById("hiddenAssemblyTotal").value = formattedAssemblyTotal
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(".", ",");
  document.getElementById("hiddenMotorizationTotal").value =
    formattedMotorizationTotal
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(".", ",");
  document.getElementById("hiddenOptionsTotal").value = formattedOptionsTotal
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(".", ",");
  document.getElementById("hiddenTotalPrice").value = formattedTotalPrice
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(".", ",");
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// Escolha do barco e construção da tela
document.querySelectorAll(".boat-option").forEach((option) => {
  option.addEventListener("click", function () {
    const type = this.dataset.type;
    const selectedBoat = boatOptions[type];

    // Resetar os valores dos opcionais e motorização ao trocar de barco
    document.getElementById("motorizationTotal").textContent = "R$ 0,00"; // Resetando motorização
    document.getElementById("optionsTotal").textContent = "R$ 0,00"; // Resetando opcionais

    // Atualização da imagem principal e descrição
    document.getElementById(
      "selectedImage"
    ).src = `../assets/img/produtos/${type}/fotoprincipal.jpg`;
    document.getElementById("selectedDescription").textContent =
      selectedBoat.description;

    // Atualizar o preço base do barco
    const basePrice = parseFloat(selectedBoat.basePrice);
    const formattedBasePrice = basePrice.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    document.getElementById("assemblyTotal").textContent = formattedBasePrice;
    updateTotalPriceToX();

    // Atualização da lista de itens
    const ul = document.getElementById("selectedItens");
    ul.innerHTML = "";
    const itensArray = selectedBoat.itens.split(", ");
    itensArray.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });

    // Atualização das opções
    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";
    selectedBoat.options.forEach((option) => {
      const optionDiv = document.createElement("div");
      const optionInput = document.createElement("input");
      optionInput.type = "checkbox";
      optionInput.name = "option";
      optionInput.value = option.price; // Use o valor do preço aqui para facilitar o cálculo
      optionInput.dataset.name = option.name; // Adiciona o nome da opção como dataset
      const optionLink = document.createElement("a");
      optionLink.href = "#";

      const price = parseFloat(option.price);
      const formattedPrice = price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      optionLink.innerHTML = `${option.name} <span class="option-price">-  ${formattedPrice}</span>`;
      optionLink.className = "option-link";
      optionLink.onclick = function (event) {
        event.preventDefault();
        const selectedOptionalImage = document.getElementById(
          "selectedOptionalImage"
        );
        const imagePath = `../assets/img/options/${option.name}.jpg`;

        const img = new Image();
        img.onload = function () {
          selectedOptionalImage.src = imagePath;
        };
        img.onerror = function () {
          selectedOptionalImage.src = "../assets/img/options/no-image.jpg";
        };

        img.src = imagePath;
        selectedOptionalImage.classList.remove("hidden");
        document.getElementById(
          "itemPrice"
        ).textContent = `Preço do item: ${formattedPrice}`;
        document
          .getElementById("selectedOptionalPrice")
          .classList.remove("hidden");
      };

      // Evento de mudança para somar ou subtrair do total
      optionInput.addEventListener("change", function () {
        updateOptionsTotal();
      });

      optionDiv.appendChild(optionInput);
      optionDiv.appendChild(optionLink);
      optionsContainer.appendChild(optionDiv);
    });

    // Função para atualizar o total dos opcionais
    function updateOptionsTotal() {
      let total = 0;
      document
        .querySelectorAll('input[name="option"]:checked')
        .forEach((checkbox) => {
          total += parseFloat(checkbox.value);
        });
      const formattedTotal = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      document.getElementById("optionsTotal").textContent = formattedTotal;
      updateTotalPriceToX();
    }

    // Atualização dos motores
    const motorContainer = document.getElementById("motorOptionsContainer");
    motorContainer.innerHTML = ""; // Limpa o contêiner antes de adicionar os novos motores

    selectedBoat.powers.forEach((power, index) => {
      const containerBox = document.createElement("div");
      containerBox.classList.add("containerbox");

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `motor-${index}`;
      input.className = "motor-checkbox";
      input.dataset.price = power.motorPrice;

      const label = document.createElement("label");
      label.setAttribute("for", `motor-${index}`);

      const img = document.createElement("img");
      img.src = `../assets/img/motor/${power.name}.jpg`;

      const motorNameDiv = document.createElement("div");
      motorNameDiv.className = "motorname";
      motorNameDiv.textContent = power.name;

      label.appendChild(img);
      label.appendChild(motorNameDiv);

      containerBox.appendChild(input);
      containerBox.appendChild(label);
      motorContainer.appendChild(containerBox);
    });

    // Adicionar eventos aos novos checkboxes
    addMotorCheckboxEvent();

    // Mostrar seções relacionadas
    document.getElementById("selectedBoat").classList.remove("hidden");
    document.getElementById("optionsSection").classList.remove("hidden");
    document.getElementById("detailsSection").classList.remove("hidden");
    document.getElementById("statusandsubmit").classList.remove("hidden");

    document.querySelector(".bluecustomization").style.display = "block";

    // Marcar o barco selecionado
    document
      .querySelector(".boat-option.selected")
      ?.classList.remove("selected");
    this.classList.add("selected");

    // Adiciona/remover classe para destaque no carrossel
    document
      .querySelector(".boat-option.selectedboatcarrossel")
      ?.classList.remove("selectedboatcarrossel");
    this.classList.add("selectedboatcarrossel");

    // Ocultar imagem e preço do opcional selecionado
    document.getElementById("selectedOptionalImage").classList.add("hidden");
    document.getElementById("selectedOptionalImage").src = "";
    document.getElementById("selectedOptionalPrice").classList.add("hidden");
    document.getElementById("itemPrice").textContent = "";
  });
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// Seleção de motores
function addMotorCheckboxEvent() {
  document.querySelectorAll(".motor-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        // Desmarcar outros checkboxes
        document.querySelectorAll(".motor-checkbox").forEach((box) => {
          if (box !== this) box.checked = false;
        });

        // Atualizar o preço da motorização
        const motorPrice = this.dataset.price;
        const formattedPrice = parseFloat(motorPrice).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        document.getElementById("motorizationTotal").textContent =
          formattedPrice;

        // Atualiza o nome do motor no input oculto
        const motorName =
          this.nextElementSibling.querySelector(".motorname").textContent;
        document.getElementById("hiddenMotorName").value = motorName; // Preenche o campo oculto com o nome do motor

        updateTotalPriceToX();
      }
    });
  });
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// Envio do formulário por email
document.getElementById("customBoatForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const form = event.target;
    const loadingElement = form.querySelector(".loading");
    const errorMessageElement = form.querySelector(".error-message");
    const sentMessageElement = form.querySelector(".sent-message");

    // Limpa mensagens anteriores
    errorMessageElement.style.display = "none";
    sentMessageElement.style.display = "none";

    loadingElement.style.display = "block"; // Mostra a mensagem de loading

    // Executa o reCAPTCHA v3
    grecaptcha.execute("6LfEIoYqAAAAAH-P0jb0mVzWDm4bkbmgXHpk7jsL", { action: "submit" })
      .then(function (token) {
        // Adiciona o token ao campo oculto
        document.getElementById("custom-recaptcha-response").value = token;

        const formData = new FormData(form);

        // Adiciona o tipo de barco selecionado
        const selectedBoat = form.querySelector(".boat-option.selected");
        if (selectedBoat) {
          formData.append("boatType", selectedBoat.dataset.type);
        } else {
          loadingElement.style.display = "none";
          errorMessageElement.innerHTML =
            "Por favor, selecione um modelo de barco.";
          errorMessageElement.style.display = "block";
          return;
        }

        // Adiciona os opcionais marcados com nome e preço
        const optionsChecked = form.querySelectorAll(
          'input[name="option"]:checked'
        );
        const optionsArray = Array.from(optionsChecked).map((option) => {
          return {
            name: option.dataset.name, // Acessa o nome da opção
            price: option.value, // Acessa o valor do preço da opção
          };
        });
        formData.append("options", JSON.stringify(optionsArray));

        // O cálculo dos totais já foi feito e os campos ocultos já estão preenchidos, então basta pegar os valores dos hidden inputs
        formData.append(
          "assemblyTotal",
          form.querySelector("#hiddenAssemblyTotal").value || "0"
        );
        formData.append(
          "motorizationTotal",
          form.querySelector("#hiddenMotorizationTotal").value || "0"
        );
        formData.append(
          "optionsTotal",
          form.querySelector("#hiddenOptionsTotal").value || "0"
        );
        formData.append(
          "totalPrice",
          form.querySelector("#hiddenTotalPrice").value || "0"
        );

        // Captura outros campos do formulário
        formData.append(
          "clientName",
          form.querySelector("#clientName").value || ""
        );
        formData.append(
          "clientContact",
          form.querySelector("#clientContact").value || ""
        );
        formData.append(
          "budgetDate",
          form.querySelector("#budgetDate").value || ""
      );      
        formData.append("boatName", form.querySelector("#boatName").value || "");
        formData.append(
          "comercialRep",
          form.querySelector("#comercialRep").value || ""
        );
        formData.append(
          "emailCustom",
          form.querySelector("#emailCustom").value || ""
        );
        formData.append(
          "additionalNotes",
          form.querySelector("#additionalNotes").value || ""
        );
        formData.append(
          "hiddenMotorName",
          form.querySelector("#hiddenMotorName").value || ""
        );

        // Captura forma de pagamento
        const paymentMethod = form.querySelector(
          'input[name="paymentMethod"]:checked'
        );
        if (paymentMethod) {
          formData.append("paymentMethod", paymentMethod.value);
        }

        // Adiciona o token reCAPTCHA ao formData
        formData.append("custom-recaptcha-response", token);

        // Envia os dados do formulário via fetch
        fetch(form.action, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            loadingElement.style.display = "none"; // Esconde a mensagem de loading
            if (data.success) {
              sentMessageElement.style.display = "block"; // Mostra a mensagem de sucesso
            } else {
              errorMessageElement.innerHTML =
                data.error ||
                'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
              errorMessageElement.style.display = "block"; // Mostra a mensagem de erro
            }
          })
          .catch((error) => {
            loadingElement.style.display = "none"; // Esconde a mensagem de loading
            errorMessageElement.innerHTML =
              'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
            errorMessageElement.style.display = "block"; // Mostra a mensagem de erro
          });
      })
      .catch(function (error) {
        loadingElement.style.display = "none"; // Esconde a mensagem de loading
        errorMessageElement.innerHTML =
          "Erro ao carregar o reCAPTCHA. Verifique sua conexão e tente novamente.";
        errorMessageElement.style.display = "block";
      });
  });
