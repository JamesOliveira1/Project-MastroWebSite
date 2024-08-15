

// COLAPSE DIVS

// Array contendo os IDs dos elementos collink
var collinkIDs = ['collink', 'collink1', 'collink2', 'collink3', 'collink4', 'collink5','collink6','collink7','collink8','collink9','collink10', 
    'collink11', 'collink12','collink13','collink14', 'collink15', 'collink16','collink17','collink18', 'collink19', 'collink20'];

// Array contendo os IDs dos elementos collapseExample
var collapseExampleIDs = ['collapseExample', 'collapseExample1', 'collapseExample2', 'collapseExample3', 'collapseExample4', 'collapseExample5','collapseExample6','collapseExample7',
    'collapseExample8','collapseExample9','collapseExample10','collapseExample11', 'collapseExample12','collapseExample13','collapseExample14','collapseExample15', 'collapseExample16',
'collapseExample17','collapseExample18','collapseExample19', 'collapseExample20'];

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