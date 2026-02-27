
// Dados mockados de exemplo
let moldes = [
    {
        id: 1,
        nome: "Molde Casco 320",
        codigo: "MOLDE-320-CASCO",
        imagem: "../assets/img/portfolio/portfolio-1.jpg", 
        valor: 15000.00,
        data_atribuicao: "2023-10-15",
        observacao: "Molde principal do casco, em bom estado."
    },
    {
        id: 2,
        nome: "Molde Convés 320",
        codigo: "MOLDE-320-CONVES",
        imagem: "../assets/img/portfolio/portfolio-2.jpg", 
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
                    preview.style.display = 'block';
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
                        <img src="${molde.imagem || '../assets/img/portfolio/portfolio-1.jpg'}" alt="${molde.nome}">
                        <div class="moldename">${molde.nome}</div>
                    </div>
                    <div class="back" onclick="abrirModalEdicao(${molde.id}, event)">
                         <div class="text-end w-100" style="margin-bottom: 5px;">
                            <i class="bi bi-x-circle-fill text-secondary" style="font-size: 1.2rem; cursor: pointer;" onclick="event.stopPropagation(); this.closest('.flip-container').classList.remove('flipped');" title="Fechar"></i>
                        </div>
                        <div class="back-content">
                            <p><strong>Código de Produto:</strong> <span>${molde.codigo}</span></p>
                            <p><strong>Valor Atribuído:</strong> <span>${valorFormatado}</span></p>
                            <p><strong>Data Atribuição:</strong> <span>${dataFormatada}</span></p>
                            ${molde.observacao ? `<p><strong>Observação:</strong> <span>${molde.observacao}</span></p>` : ''}
                        </div>
                        <div class="back-footer">
                            <i class="bi bi-pencil-square"></i> Clique para editar
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
    
    // Preview Imagem
    const preview = document.getElementById('previewImagem');
    if (molde.imagem) {
        preview.src = molde.imagem;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
        preview.src = '';
    }

    // Exibir modal
    document.getElementById('modalTitle').textContent = 'Editar Molde';
    document.getElementById('btnExcluirMolde').style.display = 'block'; // Mostrar botão excluir
    
    const modalEl = document.getElementById('modalMolde');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function salvarMolde() {
    const id = document.getElementById('moldeId').value;
    const nome = document.getElementById('moldeNome').value;
    const codigo = document.getElementById('moldeCodigo').value;
    const valor = parseFloat(document.getElementById('moldeValor').value);
    const data = document.getElementById('moldeData').value;
    const observacao = document.getElementById('moldeObservacao').value;
    
    // Imagem (mockada se não houver upload real)
    const preview = document.getElementById('previewImagem');
    const imagemSrc = preview.getAttribute('src') || "../assets/img/portfolio/portfolio-3.jpg";

    if (!nome || !codigo || isNaN(valor) || !data) {
        alert('Por favor, preencha os campos obrigatórios.');
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
                imagem: imagemSrc // Em app real, seria URL do upload
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
