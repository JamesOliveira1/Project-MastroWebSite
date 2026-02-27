
// Dados mockados de exemplo
let moldes = [
    {
        id: 1,
        nome: "Molde Casco 320",
        codigo: "MOLDE-320-CASCO",
        imagem: "assets/img/moldes/sample.jpeg", 
        valor: 15000.00,
        data_atribuicao: "2023-10-15",
        observacao: "Molde principal do casco, em bom estado."
    },
    {
        id: 2,
        nome: "Molde Convés 320",
        codigo: "MOLDE-320-CONVES",
        imagem: "assets/img/moldes/sample.jpeg", 
        valor: 12000.00,
        data_atribuicao: "2023-11-20",
        observacao: "Necessita de polimento na próxima manutenção."
    }
];

document.addEventListener('DOMContentLoaded', () => {
    renderMoldes();

    // Event listener para o botão de salvar no modal
    const btnSalvar = document.getElementById('btnSalvarMolde');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarMolde);
    }
    
    // Event listener para o botão de excluir
    const btnExcluir = document.getElementById('btnExcluirMolde');
    if (btnExcluir) {
        btnExcluir.addEventListener('click', excluirMolde);
    }

    // Event listener para o botão de adicionar novo (limpa o form)
    const btnNovo = document.getElementById('btnNovoMolde');
    if (btnNovo) {
        btnNovo.addEventListener('click', () => {
            document.getElementById('formMolde').reset();
            document.getElementById('moldeId').value = '';
            document.getElementById('modalTitle').textContent = 'Cadastrar Molde';
            document.getElementById('btnExcluirMolde').style.display = 'none';
            
            // Limpar preview de imagem
            const preview = document.getElementById('previewImagem');
            preview.style.display = 'none';
            preview.src = '';
        });
    }

    // Preview de imagem ao selecionar arquivo (simulado)
    const inputImg = document.getElementById('moldeImagemInput');
    if(inputImg) {
        inputImg.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('previewImagem');
                    preview.src = e.target.result;
                    // preview.style.display = 'block'; // Não mostrar preview, apenas salvar internamente
                }
                reader.readAsDataURL(file);
            }
        });
    }
});

function renderMoldes() {
    const container = document.getElementById('moldesContainer');
    if (!container) return;

    container.innerHTML = '';

    moldes.forEach(molde => {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-auto mb-4'; // Ajuste de grid para flip cards
        
        // Formatar valor
        const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(molde.valor);
        
        // Formatar data
        const dataObj = new Date(molde.data_atribuicao);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');

        cardCol.innerHTML = `
            <div class="flip-container" onclick="this.classList.toggle('flipped')">
                <div class="flipper">
                    <div class="front">
                        <img src="${molde.imagem || '../assets/img/moldes/sample.jpeg'}" alt="${molde.nome}">
                        <div class="moldename">${molde.nome}</div>
                    </div>
                    <div class="back">
                         <div class="text-end w-100" style="margin-bottom: 5px;">
                            <i class="bi bi-x-circle-fill text-secondary" style="font-size: 1.2rem; cursor: pointer;" onclick="event.stopPropagation(); this.closest('.flip-container').classList.remove('flipped');" title="Fechar"></i>
                        </div>
                        <div class="back-content">
                            <p><strong>Código de Produto:</strong> <span>${molde.codigo}</span></p>
                            <p><strong>Valor Atribuído:</strong> <span>${valorFormatado}</span></p>
                            <p><strong>Data Atribuição:</strong> <span>${dataFormatada}</span></p>
                            ${molde.observacao ? `<p><strong>Observação:</strong> <span>${molde.observacao}</span></p>` : ''}
                        </div>
                        <div class="back-footer" onclick="abrirModalEdicao(${molde.id}, event)">
                            <i class="bi bi-pencil-square"></i> Editar
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(cardCol);
    });
}

function abrirModalEdicao(id, event) {
    // Parar propagação para não "desvirar" o card ao clicar (se o click do container fizer toggle)
    if(event) event.stopPropagation();

    const molde = moldes.find(m => m.id === id);
    if (!molde) return;

    document.getElementById('moldeId').value = molde.id;
    document.getElementById('moldeNome').value = molde.nome || '';
    document.getElementById('moldeCodigo').value = molde.codigo;
    document.getElementById('moldeValor').value = molde.valor;
    document.getElementById('moldeData').value = molde.data_atribuicao;
    document.getElementById('moldeObservacao').value = molde.observacao || '';
    
    // Exibir modal
    document.getElementById('modalTitle').textContent = 'Editar Molde';
    document.getElementById('btnExcluirMolde').style.display = 'block'; // Mostrar botão excluir
    
    // Ocultar preview no modal de edição
    const preview = document.getElementById('previewImagem');
    preview.style.display = 'none';
    preview.src = '';
    
    // Formatar valor como moeda ao abrir
    if (molde.valor) {
        document.getElementById('moldeValor').value = formatarMoeda(molde.valor);
    } else {
        document.getElementById('moldeValor').value = '';
    }

    const modalEl = document.getElementById('modalMolde');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function salvarMolde() {
    const id = document.getElementById('moldeId').value;
    const nome = document.getElementById('moldeNome').value;
    const codigo = document.getElementById('moldeCodigo').value;
    // Remover R$, pontos e trocar vírgula por ponto
    const valorStr = document.getElementById('moldeValor').value;
    const valor = parseFloat(valorStr.replace(/[^\d,]/g, '').replace(',', '.'));
    
    const data = document.getElementById('moldeData').value;
    const observacao = document.getElementById('moldeObservacao').value;
    
    // Imagem (mantém a anterior se não alterar)
    let imagemSrc = "assets/img/moldes/sample.jpeg"; // Default novo
    
    if (id) {
        const moldeExistente = moldes.find(m => m.id == id);
        if (moldeExistente) imagemSrc = moldeExistente.imagem;
    }
    
    // Se tiver src no preview (significa que fez upload novo), usa ele
    const preview = document.getElementById('previewImagem');
    if (preview.src) {
        imagemSrc = preview.src;
    }

    if (!nome || !codigo || isNaN(valor) || !data) {
        alert('Por favor, preencha os campos obrigatórios corretamente.');
        return;
    }

    if (id) {
        // Editar
        const index = moldes.findIndex(m => m.id == id);
        if (index !== -1) {
            moldes[index] = { 
                ...moldes[index], 
                nome, 
                codigo, 
                valor, 
                data_atribuicao: data, 
                observacao,
                imagem: imagemSrc 
            };
        }
    } else {
        // Novo
        const novoId = moldes.length > 0 ? Math.max(...moldes.map(m => m.id)) + 1 : 1;
        moldes.push({
            id: novoId,
            nome,
            codigo,
            valor,
            data_atribuicao: data,
            observacao,
            imagem: imagemSrc
        });
    }

    // Fechar modal
    const modalEl = document.getElementById('modalMolde');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) {
        modalInstance.hide();
    } else {
        new bootstrap.Modal(modalEl).hide();
    }
    
    // Re-renderizar
    renderMoldes();
}

// Utilitário para formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

// Listener para input de moeda
document.addEventListener('input', function (e) {
    if (e.target.id === 'moldeValor') {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            e.target.value = '';
            return;
        }
        value = (parseInt(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        e.target.value = value;
    }
});

function excluirMolde() {
    const id = document.getElementById('moldeId').value;
    if (!id) return;

    if (confirm('Tem certeza que deseja excluir este molde?')) {
        moldes = moldes.filter(m => m.id != id);
        
        // Fechar modal
        const modalEl = document.getElementById('modalMolde');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }

        renderMoldes();
    }
}
