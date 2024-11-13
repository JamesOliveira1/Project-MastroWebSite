const boatOptions = {
    "7CC": {
        description: "O mais ágil da linha Nomad.",
        itens: "2 Baterias Náuticas de 105 Amp, 2 vigias laterais, 4 Bombas de porão com automático, Assentos rebatíveis de popa, Chuveiro de popa, Direção hidráulica, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Gaiuta 19 polegadas, Guarda-mancebo em inox 316l, Luzes de navegação, Porta-caniço no costado, Targa em inox 316l, WC elétrico",
        options: ["Banheiro Fechado", "Caixas de peixe removíveis", "Capa de Proteção", "Carreta de encalhe", "Fechamento frontal", "Geladeira Elétrica", "Guincho elétrico", "Kit de lavagem de deck", "Luz subaquática (par)", "Monitor multifuncional GO 9", "Monitor multifuncional GO7", "Pintura de casco", "Piso sintético", "Radio VHF RS20", "Radio VHF RS40", "Radio VHF RS40B", "Solário de Proa", "Toldo articulado"],
        powers: ["2 MERCURY EFI 115", "2 MERCURY EFI 150", "2 SUZUKI 140hp", "2 YAMAHA 150hp"]
    },
    "8CC": {
        description: "Uma lancha rápida e poderosa.",
        itens: "vela, radio",
        options: ["Assentos de Couro", "Sistema de Som", "GPS"],
        powers: ["Baixa", "Média",  "Ultra"]
    },
    "8.5XF": {
        description: "Luxuoso iate com todas as comodidades.",
        itens: "vela de luxo, radio de luxo", 
        options: ["Jacuzzi", "Sistema de Som", "GPS"],
        powers: ["Baixa", "Média", "Alta", "Super", "Ultra"]
    },
    Commuter: {
        description: "Barco de pesca robusto e eficiente.",
        itens: "equipamento de pesca, sistema de som, GPS",
        options: ["Equipamento de Pesca", "Sistema de Som", "GPS"],
        powers: ["Super", "Ultra"]
    },
    Cabin: {
        description: "Um caiaque leve e manobrável.",
        itens: "remos de alta performance, GPS",
        options: ["Remos de Alta Performance", "GPS"],
        powers: ["Baixa", "Média", "Alta", "Super", "Ultra"]
    }
};

const colors = ["#000000", "#474747", "#660066", "#990000", "#ff0000", "#ffccff", "#66ffff", "#99ccff", "#006699", "#0066ff", "#000099", "#333300", "#003300", "#008000", "#9fdfbf", "#cc9900", "#ff9900", "#ffff66", "#996633", "#999966", "#bfbfbf", "#ffffff"];

document.querySelectorAll('.boat-option').forEach(option => {
    option.addEventListener('click', function() {
        const type = this.dataset.type;
        const selectedBoat = boatOptions[type];

        document.getElementById('selectedImage').src = `./assets/img/produtos/${type}/fotoprincipal.jpg`;
        document.getElementById('selectedDescription').textContent = selectedBoat.description;

        // Limpar e preencher a lista de itens de série
        const ul = document.getElementById('selectedItens');
        ul.innerHTML = '';
        const itensArray = selectedBoat.itens.split(", ");
        itensArray.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
        });

        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';
        selectedBoat.options.forEach(option => {
            const optionDiv = document.createElement('div');
            const optionInput = document.createElement('input');
            optionInput.type = 'checkbox';
            optionInput.name = 'option';
            optionInput.value = option;
            const optionLink = document.createElement('a');
            optionLink.href = "#";
            optionLink.textContent = option;
            optionLink.className = 'option-link';
            optionLink.onclick = function(event) {
                event.preventDefault();
                const selectedOptionalImage = document.getElementById('selectedOptionalImage');
                selectedOptionalImage.src = `path/to/images/${option}.jpg`;
                selectedOptionalImage.classList.remove('hidden');
            };
            optionDiv.appendChild(optionInput);
            optionDiv.appendChild(optionLink);
            optionsContainer.appendChild(optionDiv);
        });

        document.getElementById('powerRange').max = selectedBoat.powers.length;
        document.getElementById('powerRange').value = 2;  // Define o valor inicial como Médio
        document.getElementById('powerLabel').textContent = `Potência: ${selectedBoat.powers[1]}`;

        document.getElementById('colorOptions').innerHTML = '';
        colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.classList.add('color-option');
            colorDiv.style.backgroundColor = color;
            colorDiv.dataset.color = color;
            colorDiv.addEventListener('click', function() {
                handleColorSelection(this.dataset.color);
            });
            document.getElementById('colorOptions').appendChild(colorDiv);
        });

        document.getElementById('selectedColors').innerHTML = '';

        document.getElementById('selectedBoat').classList.remove('hidden');
        document.getElementById('optionsSection').classList.remove('hidden');
        document.getElementById('detailsSection').classList.remove('hidden');
        document.getElementById('statusandsubmit').classList.remove('hidden');

        document.querySelector('.bluecustomization').style.display = 'block';

        document.querySelector('.boat-option.selected')?.classList.remove('selected');
        this.classList.add('selected');

        // Esconder a imagem de opcional selecionado quando um novo barco é selecionado
        document.getElementById('selectedOptionalImage').classList.add('hidden');
        document.getElementById('selectedOptionalImage').src = '';
    });
});

document.getElementById('powerRange').addEventListener('input', function() {
    const type = document.querySelector('.boat-option.selected')?.dataset.type;
    if (type) {
        const powerText = boatOptions[type].powers[this.value - 1];
        document.getElementById('powerLabel').textContent = `Potência: ${powerText}`;
    }
});

const selectedColors = [];

function handleColorSelection(color) {
    if (selectedColors.includes(color)) {
        selectedColors.splice(selectedColors.indexOf(color), 1);
    } else if (selectedColors.length < 2) {
        selectedColors.push(color);
    } else {
        selectedColors.shift();
        selectedColors.push(color);
    }
    renderSelectedColors();
}

function renderSelectedColors() {
    const selectedColorsContainer = document.getElementById('selectedColors');
    selectedColorsContainer.innerHTML = '';
    selectedColors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.classList.add('color-option');
        colorDiv.style.backgroundColor = color;
        selectedColorsContainer.appendChild(colorDiv);
    });
}


////////////////////////////////////////////////


document.getElementById('boatForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const form = event.target;
    const loadingElement = form.querySelector('.loading');
    const errorMessageElement = form.querySelector('.error-message');
    const sentMessageElement = form.querySelector('.sent-message');

    loadingElement.style.display = 'block'; // Mostra a mensagem de loading

    const formData = new FormData(form);

    // Adiciona o tipo de barco selecionado
    const selectedBoat = form.querySelector('.boat-option.selected');
    if (selectedBoat) {
      formData.append('boatType', selectedBoat.dataset.type);
    }

    // Adiciona os opcionais marcados
    const optionsChecked = form.querySelectorAll('input[name="option"]:checked');
    const optionsArray = Array.from(optionsChecked).map(option => option.value);
    formData.append('options', JSON.stringify(optionsArray));

    // Captura o valor do input range e adiciona o texto correspondente ao FormData
    const powerRangeValue = document.getElementById('powerRange').value;
    const selectedBoatType = selectedBoat.dataset.type;
    const powerText = boatOptions[selectedBoatType].powers[powerRangeValue - 1]; // Os índices começam em 0
    formData.append('power', powerText);

    // Adiciona apenas as duas últimas cores escolhidas para o casco
    const selectedColors = form.querySelectorAll('.color-option');
    const colorsArray = Array.from(selectedColors).slice(-2).map(color => color.style.backgroundColor);
    formData.append('colors', JSON.stringify(colorsArray));

    fetch(form.action, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        loadingElement.style.display = 'none'; // Esconde a mensagem de loading
        if (data.success) {
          sentMessageElement.style.display = 'block'; // Mostra a mensagem de sucesso
        } else {
          errorMessageElement.innerHTML = data.error || 'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
          errorMessageElement.style.display = 'block'; // Mostra a mensagem de erro
        }
      })
      .catch(error => {
        loadingElement.style.display = 'none'; // Esconde a mensagem de loading
        errorMessageElement.innerHTML = 'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
        errorMessageElement.style.display = 'block'; // Mostra a mensagem de erro
      });
  });
