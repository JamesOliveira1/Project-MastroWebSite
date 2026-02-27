
// BOTÃO COMPARTILHAR

// Adicionando evento de clique ao botão de compartilhamento
document.getElementById("sharearticle").addEventListener("click", function () {
  // Verifica se o navegador suporta a API do Web Share
  if (navigator.share) {
    // Chama a API do Web Share
    navigator.share({
      title: "Mastro D'Ascia Náutica",
      text: 'Artigos e contéudo sobre catamarãs',
      url: 'https://mastrodascia.com.br/artigos'
    }).then(() => {
      console.log('Conteúdo compartilhado com sucesso!');
    }).catch((error) => {
      console.error('Erro ao compartilhar:', error);
    });
  } else {
    // Caso o navegador não suporte, mostra uma mensagem alternativa
    alert("Desculpe, seu navegador não suporta o compartilhamento.");
  }
});

///////////////////////////////////////////

// EXIBIR ARTIGOS

function mostrarArtigo(idArtigo) {
  const artigos = document.querySelectorAll('.articletext');
  const artigoSelecionado = document.getElementById(idArtigo);
  if (!artigoSelecionado) return;

  artigos.forEach(a => {
    if (a !== artigoSelecionado) {
      a.style.display = 'none';
      a.style.transition = '';
      a.style.opacity = '';
      a.style.transform = '';
    }
  });

  artigoSelecionado.style.display = 'block';
  artigoSelecionado.style.opacity = '0';
  artigoSelecionado.style.transform = 'translateY(6px)';
  artigoSelecionado.style.transition = 'opacity 600ms ease, transform 600ms ease';
  requestAnimationFrame(() => {
    artigoSelecionado.style.opacity = '1';
    artigoSelecionado.style.transform = 'translateY(0)';
  });

  const breadcrumbs = document.querySelector('.breadcrumbs');
  if (breadcrumbs) {
    breadcrumbs.scrollIntoView({ behavior: 'smooth' });
  }
}

// Função para obter parâmetros da URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Exibir o artigo com base no parâmetro da URL ou exibir o artigo 01 por padrão
window.onload = function () {
    const artigoId = getQueryParam('artigo') || 'bem-vindo-pagina-artigos';
    mostrarArtigo(artigoId);
};

///////////////////////////////



/// ======= Script para troca de icone + e - ======= 

document.querySelectorAll('.collink').forEach(function (collink) {
  var targetID = collink.getAttribute('href');
  var collapseExample = document.querySelector(targetID);

  collapseExample.addEventListener('show.bs.collapse', function () {
    collink.classList.add('openedcollapse');
  });

  collapseExample.addEventListener('hide.bs.collapse', function () {
    collink.classList.remove('openedcollapse');
  });
});

/// ======= Script para ativar e desativar dark mode - ======= 

let toggle = document.getElementById("toggle");
let switchDiv = document.getElementById("switch");
let body = document.querySelector("body");
let section = document.querySelector("section");
let moon = document.getElementById("light-icon");

function toggleDarkMode() {
  switchDiv.classList.toggle("trans");
  switchDiv.classList.toggle("switch-dark");
  body.classList.toggle("dark-mode");
  section.classList.toggle("dark-mode");
  moon.classList.toggle("fa-sun");
  moon.classList.toggle("fa-moon");
}

toggle.addEventListener('click', toggleDarkMode);
switchDiv.addEventListener('click', toggleDarkMode);
moon.addEventListener('click', toggleDarkMode);
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Swiper !== 'undefined') {
    new Swiper('#instagram-swiper', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 16,
      pagination: { el: '#instagram-swiper-pagination', clickable: true },
      navigation: { nextEl: '#instagram-swiper-next', prevEl: '#instagram-swiper-prev' }
    });
  }
});
