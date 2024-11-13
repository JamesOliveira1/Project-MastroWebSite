document.getElementById('orcamento-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const loadingElement = form.querySelector('.loading');
    const errorMessageElement = form.querySelector('.error-message');
    const sentMessageElement = form.querySelector('.sent-message');

    loadingElement.style.display = 'block';
    errorMessageElement.style.display = 'none';
    sentMessageElement.style.display = 'none';

    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        loadingElement.style.display = 'none';
        if (data.success) {
            sentMessageElement.style.display = 'block';
        } else {
            errorMessageElement.innerHTML = data.error || 'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
            errorMessageElement.style.display = 'block';
        }
    })
    .catch(error => {
        loadingElement.style.display = 'none';
        errorMessageElement.innerHTML = 'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
        errorMessageElement.style.display = 'block';
    });
});

/////////////////

document.getElementById("phone").addEventListener("input", function (event) {
    const input = event.target;
    input.value = input.value.replace(/\D/g, "");
  });