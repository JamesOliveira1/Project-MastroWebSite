document
  .getElementById("orcamento-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    const form = event.target;
    const loadingElement = form.querySelector(".loading");
    const errorMessageElement = form.querySelector(".error-message");
    const sentMessageElement = form.querySelector(".sent-message");

    // Exibe o estado de carregamento
    loadingElement.style.display = "block";
    errorMessageElement.style.display = "none";
    sentMessageElement.style.display = "none";

    // Executa o reCAPTCHA v3
    grecaptcha.ready(function () {
      grecaptcha
        .execute("6LfEIoYqAAAAAH-P0jb0mVzWDm4bkbmgXHpk7jsL", {
          action: "submit",
        })
        .then(function (token) {
          // Adiciona o token reCAPTCHA no formulário
          const recaptchaInput = document.createElement("input");
          recaptchaInput.type = "hidden";
          recaptchaInput.name = "recaptchaToken";
          recaptchaInput.value = token;
          form.appendChild(recaptchaInput);

          const formData = new FormData(form);

          // Envia o formulário usando Fetch API
          fetch(form.action, {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              loadingElement.style.display = "none";
              if (data.success) {
                sentMessageElement.style.display = "block"; // Exibe a mensagem de sucesso
              } else {
                errorMessageElement.innerHTML =
                  data.error ||
                  "Algo deu errado... Tente novamente mais tarde.";
                errorMessageElement.style.display = "block"; // Exibe a mensagem de erro
              }
            })
            .catch((error) => {
              loadingElement.style.display = "none";
              errorMessageElement.innerHTML =
                "Algo deu errado... Tente novamente mais tarde.";
              errorMessageElement.style.display = "block"; // Exibe a mensagem de erro
            });
        });
    });
  });

/////////////////

document.getElementById("phone").addEventListener("input", function (event) {
  const input = event.target;
  input.value = input.value.replace(/\D/g, "");
});
