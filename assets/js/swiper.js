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
  showDiv((currentIndex + 1) % totalDivs);
}

function previous() {
  showDiv((currentIndex - 1 + totalDivs) % totalDivs);
}

function updateButtonStates() {
  if (currentIndex === 0) {
    controlPrevDiv.classList.add('disabled');
  } else {
    controlPrevDiv.classList.remove('disabled');
  }

  if (currentIndex === totalDivs - 1) {
    controlNextDiv.classList.add('disabled');
  } else {
    controlNextDiv.classList.remove('disabled');
  }
}

// Swipe functionality
let startX = 0;
let endX = 0;

document.getElementById('cardsswiper').addEventListener('touchstart', (event) => {
  startX = event.touches[0].clientX;
});

document.getElementById('cardsswiper').addEventListener('touchend', (event) => {
  endX = event.changedTouches[0].clientX;
  if (endX < startX && currentIndex < totalDivs - 1) {
    next();
  } else if (endX > startX && currentIndex > 0) {
    previous();
  }
});

// Show the first div initially
showDiv(0);

// Adiciona eventos de clique para os botões de seta
controlNextDiv.addEventListener('click', next);
controlPrevDiv.addEventListener('click', previous);


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


// COLAPSE DIVS

// Array contendo os IDs dos elementos collink
var collinkIDs = ['collink', 'collink1', 'collink2', 'collink3', 'collink4', 'collink11', 'collink12'];

// Array contendo os IDs dos elementos collapseExample
var collapseExampleIDs = ['collapseExample', 'collapseExample1', 'collapseExample2', 'collapseExample3', 'collapseExample4', 'collapseExample11', 'collapseExample12'];

// Função para adicionar ouvintes de evento aos elementos collink e collapseExample
function addCollapseListeners(collinkID, collapseExampleID) {
    var collink = document.getElementById(collinkID);
    var collapseExample = document.getElementById(collapseExampleID);

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