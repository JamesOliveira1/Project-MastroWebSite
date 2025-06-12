document.addEventListener('DOMContentLoaded', function() {
    // Verifica se a página está em uma subpasta
    const path = window.location.pathname.includes('/portfolio/') ? '../assets/contents/footer.html' : './assets/contents/footer.html';

    fetch(path)
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;

            // Adiciona o ano atual
            document.getElementById('current-year').textContent = new Date().getFullYear();

            // Reinsere o script do selo da GoDaddy
            const script = document.createElement('script');
            script.src = "https://seal.godaddy.com/getSeal?sealID=fwES6NOeULvL4kTGGTraoLpyjORCXEkDMXcqOLHO1b0OLD76PQhGy5qek6yR";
            script.async = true;
            document.getElementById('siteseal').appendChild(script);

            // Ajusta o caminho das imagens do footer
            const logoImage = document.querySelector('.footerlogo');
            if (window.location.pathname.includes('/portfolio/')) {
                logoImage.src = '../assets/img/logo branco.png';  // Caminho ajustado para subpasta
            } else {
                logoImage.src = 'assets/img/logo branco.png';  // Caminho para a raiz
            }

            // Função para traduzir a página atual
            document.getElementById("translate-button").addEventListener("click", function(event) {
                event.preventDefault();
                var currentUrl = window.location.href;
                var translateUrl = "https://translate.google.com/translate?hl=pt-BR&sl=pt&tl=en&u=" + encodeURIComponent(currentUrl);
                window.location.href = translateUrl;
            });
        })
        .catch(error => console.error('Erro ao carregar o footer:', error));
});
