
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
  if (!artigoSelecionado) {
    return;
  }

  const artigoAtual = Array.from(artigos).find(a => a.style.display !== 'none');

  const esconderOutros = () => {
    artigos.forEach(a => {
      if (a !== artigoSelecionado && a !== artigoAtual) {
        a.style.display = 'none';
        a.style.transition = '';
        a.style.opacity = '';
        a.style.transform = '';
      }
    });
  };

  const rolarParaBreadcrumbs = () => {
    const breadcrumbs = document.querySelector('.breadcrumbs');
    if (breadcrumbs) {
      breadcrumbs.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const mostrarComTransicao = () => {
    artigoSelecionado.style.display = 'block';
    artigoSelecionado.style.transition = 'opacity 300ms ease, transform 300ms ease';
    artigoSelecionado.style.opacity = '0';
    artigoSelecionado.style.transform = 'translateY(6px)';
    requestAnimationFrame(() => {
      artigoSelecionado.style.opacity = '1';
      artigoSelecionado.style.transform = 'translateY(0)';
    });
    rolarParaBreadcrumbs();
    esconderOutros();
  };

  if (artigoAtual && artigoAtual !== artigoSelecionado) {
    artigoAtual.style.transition = 'opacity 300ms ease, transform 300ms ease';
    artigoAtual.style.opacity = '1';
    artigoAtual.style.transform = 'translateY(0)';
    requestAnimationFrame(() => {
      artigoAtual.style.opacity = '0';
      artigoAtual.style.transform = 'translateY(6px)';
    });
    const onTransitionEnd = (e) => {
      if (e.propertyName === 'opacity') {
        artigoAtual.removeEventListener('transitionend', onTransitionEnd);
        artigoAtual.style.display = 'none';
        artigoAtual.style.transition = '';
        artigoAtual.style.transform = '';
        artigoAtual.style.opacity = '';
        mostrarComTransicao();
      }
    };
    artigoAtual.addEventListener('transitionend', onTransitionEnd);
  } else {
    mostrarComTransicao();
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
