
/**
   * Troca de icone
   */

document.addEventListener("DOMContentLoaded", function() {
    const iconLink = document.getElementById("icon-change");
    const icons = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-book" viewBox="0 0 16 16">
            <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
        </svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-book-half" viewBox="0 0 16 16">
            <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
        </svg>`, // Segundo SVG
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-book-fill" viewBox="0 0 16 16">
            <path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
        </svg>` // Terceiro SVG
    ];
    let currentIndex = 0;

    if (iconLink) {
        iconLink.addEventListener("click", function(event) {
            event.preventDefault();
            currentIndex = (currentIndex + 1) % icons.length;
            iconLink.innerHTML = icons[currentIndex];
        });
    }
  
    const iconLink2 = document.getElementById("icon-change2");
const iconSet2 = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mailbox" viewBox="0 0 16 16">
  <path d="M4 4a3 3 0 0 0-3 3v6h6V7a3 3 0 0 0-3-3m0-1h8a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a4 4 0 0 1 4-4m2.646 1A4 4 0 0 1 8 7v6h7V7a3 3 0 0 0-3-3z"/>
  <path d="M11.793 8.5H9v-1h5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.354-.146zM5 7c0 .552-.448 0-1 0s-1 .552-1 0a1 1 0 0 1 2 0"/>
</svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mailbox-flag" viewBox="0 0 16 16">
  <path d="M10.5 8.5V3.707l.854-.853A.5.5 0 0 0 11.5 2.5v-2A.5.5 0 0 0 11 0H9.5a.5.5 0 0 0-.5.5v8zM5 7c0 .334-.164.264-.415.157C4.42 7.087 4.218 7 4 7s-.42.086-.585.157C3.164 7.264 3 7.334 3 7a1 1 0 0 1 2 0"/>
  <path d="M4 3h4v1H6.646A4 4 0 0 1 8 7v6h7V7a3 3 0 0 0-3-3V3a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v6h6V7a3 3 0 0 0-3-3"/>
</svg>`
];

let currentIndex2 = 0;
if (iconLink2) {
    iconLink2.innerHTML = iconSet2[currentIndex2];
    iconLink2.addEventListener("click", function(event) {
        event.preventDefault();
        currentIndex2 = (currentIndex2 + 1) % iconSet2.length;
        iconLink2.innerHTML = iconSet2[currentIndex2];
    });
}

  
    const iconLink3 = document.getElementById("icon-change3");
    const iconSet3 = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-arrow-down" viewBox="0 0 16 16">
  <path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293z"/>
  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
</svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-arrow-down-fill" viewBox="0 0 16 16">
  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m-1 4v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 11.293V7.5a.5.5 0 0 1 1 0"/>
</svg>`
    ];
    let currentIndex3 = 0;
    if (iconLink3) {
        iconLink3.innerHTML = iconSet3[currentIndex3];
        iconLink3.addEventListener("click", function(event) {
            event.preventDefault();
            currentIndex3 = (currentIndex3 + 1) % iconSet3.length;
            iconLink3.innerHTML = iconSet3[currentIndex3];
        });
    }
    

  
    
  });
  
  
  //////// tooltip
  
        if (window.jQuery) {
            $(document).ready(function(){
                $('[data-toggle="tooltip"]').tooltip();
            });
        }

        // ENVIO DO NEWSLETTER FORM ///////

        // Callback chamado pelo reCAPTCHA
        function onSubmit() {
          const form = document.getElementById("newsletter-form");
          if (!form) return;
          const emailInput = document.getElementById('newsletter-email');
          const nameInput = document.getElementById('newsletter-name');
          const phoneInput = document.getElementById('newsletter-phone');
          if (!emailInput || !nameInput || !phoneInput) return;
          if (!emailInput.checkValidity() || !nameInput.checkValidity() || !phoneInput.checkValidity()) {
            emailInput.reportValidity();
            nameInput.reportValidity();
            phoneInput.reportValidity();
            return;
          }
          const initialIcon = document.querySelector('.standing2');
          const loadingElement = document.querySelector('.loading2');
          const errorMessageElement = document.querySelector('.error-message2');
          const sentMessageElement = document.querySelector('.sent-message2');
          if (initialIcon) initialIcon.style.display = 'none';
          if (loadingElement) loadingElement.style.display = 'inline-block';
          if (errorMessageElement) errorMessageElement.style.display = 'none';
          if (sentMessageElement) sentMessageElement.style.display = 'none';
          if (!(window.grecaptcha && grecaptcha.ready)) {
            if (loadingElement) loadingElement.style.display = 'none';
            if (errorMessageElement) errorMessageElement.style.display = 'inline-block';
            return;
          }
          grecaptcha.ready(function() {
            grecaptcha.execute('6LfEIoYqAAAAAH-P0jb0mVzWDm4bkbmgXHpk7jsL', { action: 'submit' }).then(function(token) {
              const formData = new FormData(form);
              formData.append('g-recaptcha-response', token);
              fetch('forms/send_newsletter-form.php', {
                method: 'POST',
                body: formData
              })
              .then(response => response.json())
              .then(data => {
                if (loadingElement) loadingElement.style.display = 'none';
                if (data.success) {
                  if (sentMessageElement) sentMessageElement.style.display = 'inline-block';
                  emailInput.value = '';
                  phoneInput.value = '';
                  nameInput.value = '';
                } else {
                  if (errorMessageElement) errorMessageElement.style.display = 'inline-block';
                }
              })
              .catch(error => {
                if (loadingElement) loadingElement.style.display = 'none';
                if (errorMessageElement) errorMessageElement.style.display = 'inline-block';
              });
            });
          });
        } 
  
// ENVIO DO FAST FORM ////

(function() {
  var fastForm = document.getElementById('contact-fast-form');
  if (!fastForm) return;
  fastForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const form = event.target;
    const loadingElement = form.querySelector('.loading');
    const errorMessageElement = form.querySelector('.error-message');
    const sentMessageElement = form.querySelector('.sent-message');
    if (loadingElement) loadingElement.style.display = 'block';
    if (errorMessageElement) errorMessageElement.style.display = 'none';
    if (sentMessageElement) sentMessageElement.style.display = 'none';
    if (!(window.grecaptcha && grecaptcha.ready)) {
      if (loadingElement) loadingElement.style.display = 'none';
      if (errorMessageElement) {
        errorMessageElement.innerHTML = 'reCAPTCHA indisponível. Tente novamente mais tarde.';
        errorMessageElement.style.display = 'block';
      }
      return;
    }
    grecaptcha.ready(function () {
      grecaptcha.execute('6LfEIoYqAAAAAH-P0jb0mVzWDm4bkbmgXHpk7jsL', { action: 'contact_fast' }).then(function (token) {
        const formData = new FormData(form);
        formData.append('g-recaptcha-response', token);
        fetch(form.action, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (loadingElement) loadingElement.style.display = 'none';
          if (data.success) {
            if (sentMessageElement) sentMessageElement.style.display = 'block';
            form.reset();
          } else {
            if (errorMessageElement) {
              errorMessageElement.innerHTML = data.error || 'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
              errorMessageElement.style.display = 'block';
            }
          }
        })
        .catch(error => {
          if (loadingElement) loadingElement.style.display = 'none';
          if (errorMessageElement) {
            errorMessageElement.innerHTML = 'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
            errorMessageElement.style.display = 'block';
          }
        });
      });
    });
  });
})();


// Para cada produto, ele detecta o título (.clickable) e o link da lupa (.preview-link) e gera a galeria.

    document.querySelectorAll(".portfolio-info").forEach(info => {
        const clickable = info.querySelector(".clickable");
        const previewLink = info.querySelector(".preview-link");

        if (clickable && previewLink) {
            clickable.addEventListener("click", () => previewLink.click());
        }
    });




    

  
  
       
  
  
