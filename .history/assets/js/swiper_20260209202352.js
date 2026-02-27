
/**
 * 
Card swiper porfolio
*/

 
let currentIndex = 0;
const divs = document.querySelectorAll('.trocatexto');
const totalDivs = divs.length;
const controlPrevDiv = document.querySelector('.control.prev');
const controlNextDiv = document.querySelector('.control.next');

function showDiv(index) {
  if (index < 0 || index >= totalDivs) return;
  divs.forEach((div, i) => {
    if (i === index) {
      div.classList.add('cardactive');
    } else {
      div.classList.remove('cardactive');
    }
  });
  currentIndex = index;
  updateButtonStates();
}

function next() {
  if (totalDivs === 0) return;
  showDiv((currentIndex + 1) % totalDivs);
}

function previous() {
  if (totalDivs === 0) return;
  showDiv((currentIndex - 1 + totalDivs) % totalDivs);
}

function updateButtonStates() {
  if (controlPrevDiv) {
    if (currentIndex === 0) {
      controlPrevDiv.classList.add('disabled');
    } else {
      controlPrevDiv.classList.remove('disabled');
    }
  }

  if (controlNextDiv) {
    if (currentIndex === totalDivs - 1) {
      controlNextDiv.classList.add('disabled');
    } else {
      controlNextDiv.classList.remove('disabled');
    }
  }
}

// Swipe functionality
let startX = 0;
let endX = 0;

const swiperEl = document.getElementById('cardsswiper');
if (swiperEl) {
  swiperEl.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
  });

  swiperEl.addEventListener('touchend', (event) => {
    endX = event.changedTouches[0].clientX;
    if (endX < startX && currentIndex < totalDivs - 1) {
      next();
    } else if (endX > startX && currentIndex > 0) {
      previous();
    }
  });
}

// Show the first div initially
if (totalDivs > 0) {
  showDiv(0);
}

// Adiciona eventos de clique para os botões de seta
if (controlNextDiv) controlNextDiv.addEventListener('click', next);
if (controlPrevDiv) controlPrevDiv.addEventListener('click', previous);


 


// COLAPSE DIVS

// Array contendo os IDs dos elementos collink
var collinkIDs = ['collink'];

// Array contendo os IDs dos elementos collapseExample
var collapseExampleIDs = ['collapseExample'];

// Função para adicionar ouvintes de evento aos elementos collink e collapseExample
function addCollapseListeners(collinkID, collapseExampleID) {
    var collink = document.getElementById(collinkID);
    var collapseExample = document.getElementById(collapseExampleID);

    if (!collink || !collapseExample) return;

    collapseExample.addEventListener('show.bs.collapse', function () {
        collink.classList.add('openedcollapse');
    });

    collapseExample.addEventListener('hide.bs.collapse', function () {
        collink.classList.remove('openedcollapse');
    });
}

// Adicionando ouvintes de evento para cada combinação de IDs
collinkIDs.forEach(function(collinkID) {
    collapseExampleIDs.forEach(function(collapseExampleID) {
        addCollapseListeners(collinkID, collapseExampleID);
    });
});

// =========================================================
// CARREGAMENTO DINÂMICO DE DADOS DO MODELO (DB)
// =========================================================

let currentBoatData = null;

// Funções de Tradução (Replicadas de customcopy.js)
function normalizeTranslationKey(text) {
  if (!text) return "";
  return text.toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "") // Remove caracteres especiais
      .replace(/\s+/g, "_");       // Substitui espaços por underscores
}

function getDbTranslation(text) {
  if (!window.i18next || !text) return text;
  
  const key = normalizeTranslationKey(text);
  const fullKey = `db.${key}`;
  
  if (i18next.exists(fullKey)) {
      return i18next.t(fullKey);
  }
  return text;
}

document.addEventListener('DOMContentLoaded', function() {
    const mainEl = document.getElementById('main');
    // Verifica se tem data-model (adicionado no HTML)
    if (!mainEl || !mainEl.dataset.model) return;

    const modelName = mainEl.dataset.model;
    // Caminho relativo da API considerando que o HTML está em portfolio/
    const apiUrl = '../progenese/api/updatesite.php?action=get_boat_data';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Verifica se o modelo existe nos dados
            if (data && data[modelName]) {
                currentBoatData = data[modelName];
                renderBoatData();
            }
        })
        .catch(err => console.error('Erro ao carregar dados do modelo:', err));

    // Atualiza ao trocar de idioma
    if (window.i18next) {
        i18next.on('languageChanged', () => {
            if (currentBoatData) {
                renderBoatData();
            }
        });
    }

    // Garante renderização correta se o fetch terminar antes da inicialização do i18n
    window.addEventListener('i18next-ready', () => {
        if (currentBoatData) {
            renderBoatData();
        }
    });
});

function renderBoatData() {
    if (!currentBoatData) return;
    populateModelInfo(currentBoatData);
    populateSeriesItems(currentBoatData);
    populatePerformance(currentBoatData);
    
    // Atualiza traduções estáticas também
    if (window.updateContent) {
         window.updateContent();
    } else if (window.jqueryI18next && window.i18next) {
         $('body').localize();
    }
}

function populateModelInfo(boat) {
    const container = document.querySelector('.seriemodeloinfo.info03 ul');
    if (!container) return;

    // Helper para formatar valores (remove .0 ou .00)
    const fmt = (val) => val ? String(val).replace(/\.0+$/, '') : '';

    // Mapeamento de campos
    const fields = [
        { key: 'categoria', label: 'Categoria', i18n: 'portfolio_pages.labels.category', val: getDbTranslation(boat.categoria) }, // Traduz categoria
        { key: 'comprimento', label: 'Comprimento', i18n: 'portfolio_pages.labels.length', val: boat.comprimento ? boat.comprimento + 'm' : '' },
        { key: 'largura', label: 'Largura', i18n: 'portfolio_pages.labels.width', val: boat.largura ? boat.largura + 'm' : '' },
        { key: 'calado', label: 'Calado', i18n: 'portfolio_pages.labels.draft', val: boat.calado ? boat.calado + 'm' : '' },
        { key: 'peso', label: 'Peso', i18n: 'portfolio_pages.labels.weight', val: boat.peso ? fmt(boat.peso) + 'Kg' : '' },
        { key: 'agua', label: 'Água', i18n: 'portfolio_pages.labels.water', val: boat.agua ? fmt(boat.agua) + 'L' : '' },
        { key: 'combustivel', label: 'Combustível', i18n: 'portfolio_pages.labels.fuel', val: boat.combustivel ? fmt(boat.combustivel) + 'L' : '' },
        { key: 'motorizacao', label: 'Motorização', i18n: 'portfolio_pages.labels.engine', val: boat.motorizacao },
        { key: 'passageiros', label: 'Passageiros', i18n: 'portfolio_pages.labels.passengers', val: boat.passageiros },
        { key: 'pernoite', label: 'Pernoite', i18n: 'portfolio_pages.labels.overnight', val: boat.pernoite }
    ];

    let html = '';
    fields.forEach(field => {
        // Exibe apenas se tiver valor válido
        if (field.val && field.val !== '0' && field.val !== '0m' && field.val !== '0Kg' && field.val !== '0L') {
             html += `<li><strong data-i18n="${field.i18n}">${field.label}</strong>: ${field.val}</li>`;
        }
    });
    container.innerHTML = html;
}

function populateSeriesItems(boat) {
    const container = document.querySelector('.seriemodeloinfo.itens03 ul');
    if (!container) return;

    const items = boat.itens ? boat.itens.split(',').map(s => s.trim()).filter(s => s) : [];
    let html = '';
    items.forEach(item => {
        html += `<li>${getDbTranslation(item)}</li>`;
    });
    container.innerHTML = html;
}

function populatePerformance(boat) {
    const container = document.querySelector('.seriemodeloinfo.desempenho03 ul');
    if (!container) return;

    const fmt = (val) => val ? String(val).replace(/\.0+$/, '').replace('.', ',') : '';

    const perfData = [
        { 
            val: boat.velocidade_cruzeiro ? fmt(boat.velocidade_cruzeiro) + ' ' + getDbTranslation('NÓS') : '', 
            label: 'Velocidade de Cruzeiro Econômico',
            i18n: 'portfolio_pages.labels.cruise_speed'
        },
        { 
            val: boat.autonomia ? fmt(boat.autonomia) + ' ' + getDbTranslation('MILHAS') : '', 
            label: 'Autonomia em Cruzeiro Econômico',
            i18n: 'portfolio_pages.labels.cruise_range'
        },
        { 
            val: boat.velocidade_maxima ? fmt(boat.velocidade_maxima) + ' ' + getDbTranslation('NÓS') : '', 
            label: 'Velocidade Máxima',
            i18n: 'portfolio_pages.labels.max_speed'
        }
    ];

    let html = '';
    perfData.forEach(item => {
        if (item.val) {
            html += `<li><strong>${item.val} <br><span data-i18n="${item.i18n}">${item.label}</span></strong></li>`;
        }
    });
    container.innerHTML = html;
}
