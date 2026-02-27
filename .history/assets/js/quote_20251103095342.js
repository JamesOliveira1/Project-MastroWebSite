document
  .getElementById("orcamento-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    const form = event.target;
    const loadingElement = form.querySelector(".loading");
    const errorMessageElement = form.querySelector(".error-message");
    const sentMessageElement = form.querySelector(".sent-message");

    console.log("[Orçamento] Submit acionado");

    // Exibe o estado de carregamento
    loadingElement.style.display = "block";
    errorMessageElement.style.display = "none";
    sentMessageElement.style.display = "none";

    // Executa o reCAPTCHA v3
    if (typeof grecaptcha === "undefined") {
      console.error("[Orçamento] grecaptcha não carregado");
      loadingElement.style.display = "none";
      errorMessageElement.innerHTML =
        "Falha ao carregar o reCAPTCHA. Tente novamente.";
      errorMessageElement.style.display = "block";
      return;
    }

    console.log("[Orçamento] Executando reCAPTCHA v3...");
    grecaptcha.ready(function () {
      grecaptcha
        .execute("6LfEIoYqAAAAAH-P0jb0mVzWDm4bkbmgXHpk7jsL", {
          action: "submit",
        })
        .then(function (token) {
          console.log(
            "[Orçamento] Token reCAPTCHA recebido:",
            token ? token.slice(0, 8) + "..." : "(vazio)"
          );

          // Adiciona o token reCAPTCHA no formulário
          const recaptchaInput = document.createElement("input");
          recaptchaInput.type = "hidden";
          recaptchaInput.name = "recaptchaToken";
          recaptchaInput.value = token;
          form.appendChild(recaptchaInput);

          const formData = new FormData(form);
          try {
            const entries = [];
            for (const [k, v] of formData.entries()) entries.push([k, v]);
            console.log("[Orçamento] Dados do formulário:", entries);
          } catch (e) {
            console.warn("[Orçamento] Não foi possível listar FormData", e);
          }

          console.log("[Orçamento] Enviando request para:", form.action);
          // Envia o formulário usando Fetch API
          fetch(form.action, {
            method: "POST",
            body: formData,
          })
            .then((response) => {
              console.log("[Orçamento] HTTP status:", response.status);
              return response
                .json()
                .then((data) => ({ data, ok: true }))
                .catch((e) => {
                  console.error("[Orçamento] Erro ao parsear JSON:", e);
                  return { ok: false };
                });
            })
            .then((parsed) => {
              loadingElement.style.display = "none";
              if (!parsed || !parsed.ok) {
                errorMessageElement.innerHTML =
                  "Resposta inválida do servidor. Tente novamente.";
                errorMessageElement.style.display = "block";
                return;
              }

              const data = parsed.data;
              console.log("[Orçamento] Resposta JSON:", data);
              if (data.success) {
                console.log("[Orçamento] Envio concluído com sucesso");
                sentMessageElement.style.display = "block"; // Exibe a mensagem de sucesso
              } else {
                console.error(
                  "[Orçamento] Falha no envio:",
                  data.error,
                  "stage:",
                  data.stage,
                  "debug:",
                  data.debug
                );
                errorMessageElement.innerHTML =
                  data.error ||
                  "Algo deu errado... Tente novamente mais tarde.";
                errorMessageElement.style.display = "block"; // Exibe a mensagem de erro
              }
            })
            .catch((error) => {
              console.error("[Orçamento] Erro geral na requisição:", error);
              loadingElement.style.display = "none";
              errorMessageElement.innerHTML =
                "Algo deu errado... Tente novamente mais tarde.";
              errorMessageElement.style.display = "block"; // Exibe a mensagem de erro
            });
        })
        .catch(function (err) {
          console.error("[Orçamento] Erro ao executar reCAPTCHA:", err);
          loadingElement.style.display = "none";
          errorMessageElement.innerHTML =
            "Falha na verificação do reCAPTCHA. Tente novamente.";
          errorMessageElement.style.display = "block";
        });
    });
  });

/////////////////

document.getElementById("phone").addEventListener("input", function (event) {
  const input = event.target;
  input.value = input.value.replace(/\D/g, "");
});
