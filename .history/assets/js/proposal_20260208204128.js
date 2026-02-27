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
    "7CC": {
        foto1: "../assets/img/produtos/7CC/fotox.jpg",
        foto2: "../assets/img/produtos/7CC/fotoy.jpg",
        foto3: "../assets/img/produtos/7CC/fotoz.jpg"
    },
    "7XF": {
        foto1: "../assets/img/produtos/7XF/fotox.jpg",
        foto2: "../assets/img/produtos/7XF/fotoy.jpg",
        foto3: "../assets/img/produtos/7XF/fotoz.jpg"
    },
    "7XS": {
        foto1: "../assets/img/produtos/7XS/fotox.jpg",
        foto2: "../assets/img/produtos/7XS/fotoy.jpg",
        foto3: "../assets/img/produtos/7XS/fotoz.jpg"
    },
    "8CC": {
        foto1: "../assets/img/produtos/8CC/fotox.jpg",
        foto2: "../assets/img/produtos/8CC/fotoy.jpg",
        foto3: "../assets/img/produtos/8CC/fotoz.jpg"
    },
    "8XF": {
        foto1: "../assets/img/produtos/8XF/fotox.jpg",
        foto2: "../assets/img/produtos/8XF/fotoy.jpg",
        foto3: "../assets/img/produtos/8XF/fotoz.jpg"
    },
    "8XS": {
        foto1: "../assets/img/produtos/8XS/fotox.jpg",
        foto2: "../assets/img/produtos/8XS/fotoy.jpg",
        foto3: "../assets/img/produtos/8XS/fotoz.jpg"
    },
    "8.5CC": {
        foto1: "../assets/img/produtos/8.5CC/fotox.jpg",
        foto2: "../assets/img/produtos/8.5CC/fotoy.jpg",
        foto3: "../assets/img/produtos/8.5CC/fotoz.jpg"
    },
    "8.5XF": {
        foto1: "../assets/img/produtos/8.5XF/fotox.jpg",
        foto2: "../assets/img/produtos/8.5XF/fotoy.jpg",
        foto3: "../assets/img/produtos/8.5XF/fotoz.jpg"
    },
    "8.5XS": {
        foto1: "../assets/img/produtos/8.5XS/fotox.jpg",
        foto2: "../assets/img/produtos/8.5XS/fotoy.jpg",
        foto3: "../assets/img/produtos/8.5XS/fotoz.jpg"
    },
    "Titan CC": {
        foto1: "../assets/img/produtos/TitanCC/fotox.jpg",
        foto2: "../assets/img/produtos/TitanCC/fotoy.jpg",
        foto3: "../assets/img/produtos/TitanCC/fotoz.jpg"
    },
    "Cabin": {
        foto1: "../assets/img/produtos/Cabin/fotox.jpg",
        foto2: "../assets/img/produtos/Cabin/fotoy.jpg",
        foto3: "../assets/img/produtos/Cabin/fotoz.jpg"
    },
    "Commuter": {
        foto1: "../assets/img/produtos/Commuter/fotox.jpg",
        foto2: "../assets/img/produtos/Commuter/fotoy.jpg",
        foto3: "../assets/img/produtos/Commuter/fotoz.jpg"
    }
};

// Função para inicializar a UI após o carregamento dos dados
function initProposalUI() {
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
                    
                    // Adiciona opções dos motores do modelo
                    var powers = mastroproposta[selected].powers || [];
                    powers.forEach(function(power) {
                        var opt = document.createElement('option');
                        opt.value = power.name;
                        opt.textContent = power.name;
                        motorSelect.appendChild(opt);
                    });

                    // OTIMIZAÇÃO: Adicionar listener para quando um motor for selecionado
                    // Usar o nome do motor diretamente com espaços (sem substituições)
                    motorSelect.addEventListener('change', function() {
                        const selectedMotor = motorSelect.value;
                        const motorImgInput = document.getElementById("proposalmotorimg");
                        
                        if (selectedMotor && selectedMotor.trim() !== "" && motorImgInput) {
                            // Usar o nome do motor diretamente com espaços
                            const motorImagePath = `../assets/img/motor/${selectedMotor}.jpg`;
                            motorImgInput.value = motorImagePath;
                            
                        } else if (motorImgInput) {
                            // Limpar o campo se nenhum motor for selecionado
                            motorImgInput.value = "";
                        }
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

                // Limpar o campo da imagem do motor quando modelo muda
                const motorImgInput = document.getElementById("proposalmotorimg");
                if (motorImgInput) motorImgInput.value = '';

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
                }
                if (optionsDiv) {
                    optionsDiv.innerHTML = '';
                    var addBtn = document.getElementById('add-opcional-btn');
                    if (addBtn) addBtn.remove();
                }
                if (foto1Input) foto1Input.value = '';
                if (foto2Input) foto2Input.value = '';
                if (foto3Input) foto3Input.value = '';
                const motorImgInput = document.getElementById("proposalmotorimg");
                if (motorImgInput) motorImgInput.value = '';
            }
        });
    }
}

// Carregar dados da API e inicializar
document.addEventListener('DOMContentLoaded', function () {
    fetch('api/updatesite.php?action=get_boat_data')
        .then(response => response.json())
        .then(data => {
            // Mesclar dados da API no mastroproposta
            Object.keys(data).forEach(modelName => {
                if (mastroproposta[modelName]) {
                    const boat = data[modelName];

                    // Construir modelinfo
                    const info = [];
                    if (boat.categoria) info.push({ name: `Categoria: ${boat.categoria}` });
                    if (boat.comprimento) info.push({ name: `Comprimento: ${boat.comprimento}m` });
                    if (boat.largura) info.push({ name: `Largura: ${boat.largura}m` });
                    if (boat.calado) info.push({ name: `Calado: ${boat.calado}m` });
                    if (boat.peso) info.push({ name: `Peso: ${boat.peso}Kg` });
                    if (boat.agua) info.push({ name: `Água: ${boat.agua}L` });
                    if (boat.combustivel) info.push({ name: `Combustível: ${boat.combustivel}L` });
                    if (boat.motorizacao) info.push({ name: `Motorização: ${boat.motorizacao}` });
                    if (boat.passageiros) info.push({ name: `Passageiros: ${boat.passageiros}` });
                    if (boat.pernoite) info.push({ name: `Pernoite: ${boat.pernoite}` });
                    
                    mastroproposta[modelName].modelinfo = info;

                    // Construir serieitens
                    mastroproposta[modelName].serieitens = (boat.itens || '').split(',').map(i => ({ name: i.trim() })).filter(i => i.name);

                    // Construir options
                    mastroproposta[modelName].options = boat.options || [];

                    // Construir powers
                    mastroproposta[modelName].powers = boat.powers || [];
                }
            });
            
            // Inicializar a interface
            initProposalUI();
        })
        .catch(err => {
            console.error('Erro ao carregar dados dos barcos:', err);
            // Fallback: Tenta inicializar mesmo se falhar (vai mostrar apenas as fotos se existirem e selects vazios)
            initProposalUI();
        });
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

const select = document.getElementById('proposalmodel'); 
const input = document.getElementById('proposaldifferentials');

select.addEventListener('change', () => {
  const selected = select.value;
  if (selected === 'Titan CC') {
    input.value = `Desenho exclusivo de popa – reduz calado, aumenta a eficiência hidrodinâmica e garante menor consumo de combustível.
Casco e convés em infusão a vácuo – tecnologia que resulta em peso reduzido e alta resistência estrutural. 
Autonomia – capacidade de combustível de 1200 litros, sistemas independentes de abastecimento. Baixo consumo de combustível. Faz cruzeiro econômico a 20 nós gastando menos de 60l/h.
Estabilidade - catamarã mais estável e com melhor comportamento em curvas mesmo nas mais altas velocidades.
Destaque - devido a montagem elevada dos motores estes, quando levantados ficam completamente sem contato com a água o que torna o modelo perfeito para guarda em água por longos períodos.`;
  } else {
    input.value = input.placeholder;
  }
});

input.addEventListener('focus', () => {
  if (input.value === '') {
    input.value = input.placeholder;
  }
});

input.addEventListener('blur', () => {
  if (input.value === input.placeholder) {
    input.value = '';
  }
});

// opções de textos diferenciais

const textosDiferenciais = {

1: `Desenho exclusivo de popa – reduz calado, aumenta a eficiência hidrodinâmica e garante menor consumo de combustível.
Túnel em forma de “M” – contribui para maior capacidade de carga, melhor amortecimento das ondas e elevação do spray, proporcionando navegação mais confortável e seca.
Reserva de flutuação – segurança extra em qualquer situação: túnel selado e preenchido com material flutuante, servindo como reserva de flutuação.
Casco e convés em infusão a vácuo – tecnologia de ponta que resulta em peso reduzido e alta resistência estrutural.
Costado alto – segurança e proteção em navegação oceânica e mares agitados.
Acabamento premium – uso de gelcoats anti-osmose e anti-UV, que garantem durabilidade e beleza ao longo do tempo.
Espaços otimizados – layout funcional com amplo deck de trabalho, bancos escamoteáveis, plataforma de popa e generosos paióis secos.
Autonomia e praticidade – capacidade de combustível de 630 litros, sistemas independentes de abastecimento.`,
   
2: `Desenho exclusivo de popa – reduz calado, aumenta a eficiência hidrodinâmica e garante menor consumo de combustível.
Casco e convés em infusão a vácuo – tecnologia que resulta em peso reduzido e alta resistência estrutural. 
Autonomia – capacidade de combustível de 1200 litros, sistemas independentes de abastecimento. Baixo consumo de combustível. Faz cruzeiro econômico a 20 nós gastando menos de 60l/h.
Estabilidade - catamarã mais estável e com melhor comportamento em curvas mesmo nas mais altas velocidades.
Destaque - devido a montagem elevada dos motores estes, quando levantados ficam completamente sem contato com a água o que torna o modelo perfeito para guarda em água por longos períodos.`,
   
3: `Geometria exclusiva de popa – configuração desenvolvida para reduzir o calado operacional, otimizar o escoamento hidrodinâmico e aumentar a eficiência propulsiva, resultando em menor consumo específico de combustível.
Túnel estrutural em seção “M” – solução que amplia a capacidade de carga útil, melhora a dissipação de energia de impacto das ondas e direciona o spray para fora da linha de navegação, assegurando maior estabilidade, suavidade e conforto durante a operação.
Reserva de flutuabilidade – compartimento de túnel totalmente selado e preenchido com material de alta flutuabilidade, proporcionando redundância de segurança e estabilidade em situações críticas.
Casco e convés fabricados por infusão a vácuo – processo avançado que garante melhor relação resistência/peso, elevada integridade estrutural e redução de massa total da embarcação.
Costado elevado – dimensionado para maior proteção contra embarque de água em navegação oceânica e em mares de alta energia.
Acabamento premium – aplicação de gelcoats técnicos com propriedades anti-osmose e anti-UV, assegurando maior durabilidade, resistência química e preservação estética ao longo do ciclo de vida.
Autonomia operacional – tanques com capacidade de 630 litros de combustível, dispostos em sistemas independentes de abastecimento, favorecendo praticidade de manutenção e maior raio de ação.`,
   
4: `Texto 4 não definido...`,
   
5: `Texto 5 não definido...`

};

  // Pega o textarea
  const textarea = document.getElementById("proposaldifferentials");

  // Adiciona evento de clique para cada botão
  for (let i = 1; i <= 5; i++) {
    const btn = document.getElementById(`differential-btn-${i}`);
    btn.addEventListener("click", () => {
      textarea.value = textosDiferenciais[i];
    });
  }
document.addEventListener('DOMContentLoaded', function () {
  const btnGroup = document.getElementById('differential-btn-group');
  const saveBtn = document.getElementById('differential-save-btn');
  const textArea = document.getElementById('proposaldifferentials');
  if (!btnGroup || !saveBtn || !textArea) return;
  const BASE_PREFIX = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
  const API_DIF = `${BASE_PREFIX}/progenese/api/diferenciais.php`;
  let currentPos = 1;
  let saveBtnTimer = null;
  const saved = { 1: '', 2: '', 3: '', 4: '', 5: '' };
  function setActive(pos) {
    for (let i = 1; i <= 5; i++) {
      const b = document.getElementById('differential-btn-' + i);
      if (b) {
        if (i === pos) b.classList.add('active'); else b.classList.remove('active');
      }
    }
  }
  function loadPos(pos) {
    currentPos = pos;
    textArea.value = saved[pos] || '';
    setActive(pos);
  }
  fetch(`${API_DIF}?action=listar`, { credentials: 'include' })
    .then(r => r.json())
    .then(j => {
      if (j && j.ok && Array.isArray(j.data)) {
        j.data.forEach(row => { const p = parseInt(row.posicao, 10); if (p >= 1 && p <= 5) saved[p] = row.texto || ''; });
      }
      loadPos(1);
    }).catch(() => { loadPos(1); });
  for (let i = 1; i <= 5; i++) {
    const b = document.getElementById('differential-btn-' + i);
    if (b) {
      b.addEventListener('click', function () { loadPos(i); });
    }
  }
  saveBtn.addEventListener('click', function () {
    const texto = (textArea.value || '').trim();
    if (texto === '') return;
    fetch(`${API_DIF}?action=salvar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ posicao: currentPos, texto })
    }).then(r => r.json()).then(j => {
      if (j && j.ok) {
        saved[currentPos] = texto;
        if (saveBtnTimer) { clearTimeout(saveBtnTimer); }
        saveBtn.classList.remove('btn-outline-success');
        saveBtn.classList.add('btn-success');
        saveBtnTimer = setTimeout(function () {
          saveBtn.classList.remove('btn-success');
          saveBtn.classList.add('btn-outline-success');
        }, 2000);
      }
    }).catch(() => {});
  });
});
