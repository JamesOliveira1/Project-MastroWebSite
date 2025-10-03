//  
// Preencher ano e data automaticamente
              document.addEventListener('DOMContentLoaded', function () {
                var now = new Date();
                document.getElementById('proposalyear').value = now.getFullYear();
                document.getElementById('proposaldate').value = now.toISOString().split('T')[0];
              });
////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function () {
  const nameInput = document.getElementById('proposalclientname');

  if (nameInput) {
    nameInput.addEventListener('input', function () {
      let words = nameInput.value
        .toLowerCase()
        .split(/(\s+)/) // <-- separa também os espaços
        .map(word => {
          return word.trim() ? word.charAt(0).toUpperCase() + word.slice(1) : word;
        });

      nameInput.value = words.join('');
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('proposalvalue');

  // Apenas formata ao sair do campo
  input.addEventListener('blur', function () {
    const raw = input.value;

    if (!raw) {
      input.value = '0,00';
      return;
    }

    // Converte ponto para vírgula, se necessário
    let sanitized = raw.replace(/\./g, '').replace(',', '.');

    // Tenta transformar em número
    const number = parseFloat(sanitized);

    if (isNaN(number)) {
      input.value = '0,00';
      return;
    }

    // Converte para formato brasileiro
    input.value = number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  });
});


////////////////////////////////////////////////
////////////////////////////////////////////////

/// Não funciona JPEG no PDF

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const mastroproposta = {
    "Nomad 7CC": {
        foto1: "assets/img/produtos/7CC/foto1.jpg",
        foto2: "assets/img/produtos/7CC/foto2.jpg",
        foto3: "assets/img/produtos/7CC/foto3.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã XF" },
            { name: "Comprimento: 11,35m" },
            { name: "Largura: 3,20m" },
            { name: "Calado: 0,42m" },
            { name: "Peso: 3800Kg" },
            { name: "Água: 120L" },
            { name: "Combustível: 1200L" },
            { name: "Motorização: 2x300HP + 2x400HP" },
            { name: "Passageiros: 16" },
            { name: "Pernoite: 2" }
        ],
        serieitens: [
            { name: "6 Bombas de porão com automático" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Luzes de navegação" },
            { name: "Guarda-mancebo em inox 316L" },
            { name: "Kit de lavagem de deck" },
            { name: "WC elétrico" }
        ],
        options: [
            { name: "Capa de Proteção", price: "3500.00" },
            { name: "Carreta de encalhe", price: "22815.00" },
            { name: "Guincho elétrico", price: "7230.60" },
            { name: "Kit de lavagem de deck", price: "1100.00" },
            { name: "Luz subaquática (par)", price: "1028.00" },
            { name: "Pintura de casco", price: "6000.00" },
            { name: "Piso sintético em EVA", price: "8745.30" },
            { name: "Toldo articulado", price: "4780.00" },
            { name: "T-Top", price: "9200.00" },
        ],
        powers: [
            { name: "2 MERCURY EFI 115", motorPrice: "167908.00" },
            { name: "2 MERCURY EFI 150", motorPrice: "207035.00" },
            { name: "2 SUZUKI 140hp", motorPrice: "202182.00" },
            { name: "2 YAMAHA 150hp", motorPrice: "207035.00" },
        ],
    },
    "9CC": {
        foto1: "assets/img/produtos/9CC/foto (1).jpg",
        foto2: "assets/img/produtos/9CC/foto (2).jpg",
        foto3: "assets/img/produtos/9CC/foto (3).jpg",
        modelinfo: [
            { name: "Categoria: Catamarã XL" },
            { name: "Comprimento: 13,50m" },
            { name: "Largura: 4,00m" },
            { name: "Calado: 0,50m" },
            { name: "Peso: 5200Kg" },
            { name: "Água: 200L" },
            { name: "Combustível: 1800L" },
            { name: "Motorização: 2x400HP + 2x500HP" },
            { name: "Passageiros: 20" },
            { name: "Pernoite: 4" }
        ],
        serieitens: [
            { name: "8 Bombas de porão com automático" },
            { name: "Chuveiro de popa e proa" },
            { name: "Escada de popa em aço inox reforçado" },
            { name: "Estofamento premium em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Luzes de navegação LED" },
            { name: "Guarda-mancebo em inox 316L" },
            { name: "Kit de lavagem de deck completo" },
            { name: "WC elétrico duplo" }
        ],
        options: [
            { name: "Capa de Proteção Premium", price: "5000.00" },
            { name: "Carreta de encalhe reforçada", price: "30000.00" },
            { name: "Guincho elétrico duplo", price: "12000.00" },
            { name: "Kit de lavagem de deck extra", price: "1500.00" },
            { name: "Luz subaquática LED (par)", price: "2000.00" },
            { name: "Pintura de casco especial", price: "9000.00" },
            { name: "Piso sintético em EVA premium", price: "12000.00" },
            { name: "Toldo articulado XL", price: "7000.00" },
            { name: "T-Top XL", price: "15000.00" },
        ],
        powers: [
            { name: "2 MERCURY VERADO 350", motorPrice: "350000.00" },
            { name: "2 SUZUKI 350hp", motorPrice: "340000.00" },
            { name: "2 YAMAHA 350hp", motorPrice: "345000.00" },
            { name: "2 MERCURY VERADO 400", motorPrice: "400000.00" },
        ],
    }
};

// Preencher o select de modelos com os nomes dos modelos do mastroproposta
document.addEventListener('DOMContentLoaded', function () {
    var select = document.getElementById('proposalmodel');
    if (select && typeof mastroproposta === 'object') {
        // Limpa opções existentes (exceto a primeira)
        while (select.options.length > 1) {
            select.remove(1);
        }
        Object.keys(mastroproposta).forEach(function(model) {
            var opt = document.createElement('option');
            opt.value = model;
            opt.textContent = model;
            select.appendChild(opt);
        });

        // Quando selecionar um modelo, preenche os campos de info, itens de série e motores
        select.addEventListener('change', function () {
            var selected = select.value;
            var infoField = document.getElementById('proposalmodelinfo');
            var seriesField = document.getElementById('proposalseriesitems');
            var motorSelect = document.getElementById('proposalmotorconfig');
            var optionsDiv = document.getElementById('proposaloptions');
            var foto1Input = document.getElementById('proposalfoto1');
            var foto2Input = document.getElementById('proposalfoto2');
            var foto3Input = document.getElementById('proposalfoto3');
            // Remove botão adicionar se já existir
            var addBtn = document.getElementById('add-opcional-btn');
            if (addBtn) addBtn.remove();

            if (selected && mastroproposta[selected]) {
                // Preencher informações do modelo
                if (infoField) {
                    infoField.value = (mastroproposta[selected].modelinfo || [])
                        .map(function(item) { return item.name; })
                        .join('\n');
                }
                // Preencher itens de série
                if (seriesField) {
                    seriesField.value = (mastroproposta[selected].serieitens || [])
                        .map(function(item) { return item.name; })
                        .join('\n');
                }
                // Preencher opções de motor
                if (motorSelect) {
                    // Limpa todas as opções
                    while (motorSelect.options.length > 0) {
                        motorSelect.remove(0);
                    }
                    // Adiciona placeholder
                    var placeholder = document.createElement('option');
                    placeholder.selected = true;
                    placeholder.disabled = true;
                    placeholder.textContent = 'Selecione o motor';
                    motorSelect.appendChild(placeholder);
                    // Adiciona opção "Sem motor"
                    var semMotor = document.createElement('option');
                    semMotor.value = '';
                    semMotor.textContent = 'Sem motor';
                    motorSelect.appendChild(semMotor);
                    // Adiciona opções dos motores do modelo
                    var powers = mastroproposta[selected].powers || [];
                    powers.forEach(function(power) {
                        var opt = document.createElement('option');
                        opt.value = power.name;
                        opt.textContent = power.name;
                        motorSelect.appendChild(opt);
                    });
                }
                // Preencher opcionais
                if (optionsDiv) {
                    optionsDiv.innerHTML = '';
                    var options = mastroproposta[selected].options || [];
                    options.forEach(function(option) {
                        addOpcionalCheckbox(optionsDiv, option.name);
                    });
                    // Botão para adicionar novo opcional
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.id = 'add-opcional-btn';
                    btn.className = 'btn btn-sm btn-outline-primary mt-2 mb-2';
                    btn.textContent = '+ Adicionar opcional';
                    btn.onclick = function () {
                        addOpcionalCheckbox(optionsDiv, '', true);
                    };
                    optionsDiv.parentNode.appendChild(btn);
                }
                // Preencher campos hidden das fotos
                if (foto1Input) foto1Input.value = mastroproposta[selected].foto1 || '';
                if (foto2Input) foto2Input.value = mastroproposta[selected].foto2 || '';
                if (foto3Input) foto3Input.value = mastroproposta[selected].foto3 || '';
            } else {
                if (infoField) infoField.value = '';
                if (seriesField) seriesField.value = '';
                if (motorSelect) {
                    while (motorSelect.options.length > 0) {
                        motorSelect.remove(0);
                    }
                    var placeholder = document.createElement('option');
                    placeholder.selected = true;
                    placeholder.disabled = true;
                    placeholder.textContent = 'Selecione o motor';
                    motorSelect.appendChild(placeholder);
                    var semMotor = document.createElement('option');
                    semMotor.value = '';
                    semMotor.textContent = 'Sem motor';
                    motorSelect.appendChild(semMotor);
                }
                if (optionsDiv) {
                    optionsDiv.innerHTML = '';
                    var addBtn = document.getElementById('add-opcional-btn');
                    if (addBtn) addBtn.remove();
                }
                if (foto1Input) foto1Input.value = '';
                if (foto2Input) foto2Input.value = '';
                if (foto3Input) foto3Input.value = '';
            }
        });
    }
});

/**
 * Adiciona um checkbox de opcional ao container.
 * @param {HTMLElement} container 
 * @param {string} name 
 * @param {boolean} editable 
 */
function addOpcionalCheckbox(container, name, editable) {
    var div = document.createElement('div');
    div.className = 'form-check col-12 col-sm-6 col-md-4 opcional-extra';

    var input = document.createElement('input');
    input.className = 'form-check-input';
    input.type = 'checkbox';
    input.value = name || '';
    input.id = 'opcional-checkbox'; // id fixo para todos os checkboxes adicionados manualmente

      if (editable) {
    input.checked = true;
  }

    var label;
    if (editable) {
        label = document.createElement('input');
        label.type = 'text';
        label.className = 'form-control form-control-sm d-inline-block ms-2';
        label.style.width = '70%';
        label.placeholder = 'Nome do opcional';
        label.id = 'opcional-nome'; // id fixo para todos os inputs de nome
        label.oninput = function () {
            input.value = label.value;
        };
        // Remove opcional extra
        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-sm text-danger p-0 ms-2';
        removeBtn.title = 'Remover';
        removeBtn.innerHTML = '&times;';
        removeBtn.id = 'opcional-remove'; // id fixo para todos os botões de remover
        removeBtn.onclick = function () {
            div.remove();
        };
        div.appendChild(input);
        div.appendChild(label);
        div.appendChild(removeBtn);
    } else {
        label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = input.id;
        label.textContent = name;
        div.appendChild(input);
        div.appendChild(label);
    }
    container.appendChild(div);
}

