document.addEventListener('DOMContentLoaded', function() {
    // Detecta prefixo quando o site está em /website2
    const BASE_PREFIX = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
    const path = `${BASE_PREFIX}/assets/contents/footer.html`;

    fetch(path)
        .then(response => response.text())
        .then(data => {
            const footerEl = document.getElementById('footer');
            if (!footerEl) return;
            footerEl.innerHTML = data;

            // Adiciona o ano atual
            const yearEl = document.getElementById('current-year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
            }

            // Reinsere o script do selo da GoDaddy
            const sealHost = document.getElementById('siteseal');
            if (sealHost) {
                const script = document.createElement('script');
                script.src = "https://seal.godaddy.com/getSeal?sealID=fwES6NOeULvL4kTGGTraoLpyjORCXEkDMXcqOLHO1b0OLD76PQhGy5qek6yR";
                script.async = true;
                sealHost.appendChild(script);
            }

            // Ajusta o caminho do logo para funcionar em qualquer subpasta
            const logoImage = document.querySelector('.footerlogo');
            if (logoImage) {
                logoImage.src = `${BASE_PREFIX}/assets/img/logo branco.png`;
            }

            // Ajusta links absolutos que começam com "/" para respeitar BASE_PREFIX
            document.querySelectorAll('#footer a[href^="/"]').forEach(a => {
                const href = a.getAttribute('href') || '';
                a.setAttribute('href', `${BASE_PREFIX}${href}`);
            });

            // Botão de tradução da página atual
            const translateBtn = document.getElementById('translate-button');
            if (translateBtn) {
                translateBtn.addEventListener('click', function(event) {
                    event.preventDefault();
                    const currentUrl = window.location.href;
                    const translateUrl = "https://translate.google.com/translate?hl=pt-BR&sl=pt&tl=en&u=" + encodeURIComponent(currentUrl);
                    window.location.href = translateUrl;
                });
            }
        })
        .catch(error => console.error('Erro ao carregar o footer:', error));
});
