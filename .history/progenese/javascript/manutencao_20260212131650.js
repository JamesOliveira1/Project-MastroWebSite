
// Dados mockados de exemplo
let moldes = [
    {
        id: 1,
        codigo: "MOLDE-320-CASCO",
        imagem: "../assets/img/portfolio/portfolio-1.jpg", // Placeholder
        valor: 15000.00,
        data_atribuicao: "2023-10-15"
    },
    {
        id: 2,
        codigo: "MOLDE-320-CONVES",
        imagem: "../assets/img/portfolio/portfolio-2.jpg", // Placeholder
        valor: 12000.00,
        data_atribuicao: "2023-11-20"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    renderMoldes();

    // Event listener para o botão de salvar no modal
    const btnSalvar = document.getElementById('btnSalvarMolde');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarMolde);
    }
    
    // Event listener para o botão de adicionar novo (limpa o form)
    const btnNovo = document.getElementById('btnNovoMolde');
    if (btnNovo) {
        btnNovo.addEventListener('click', () => {
            document.getElementById('formMolde').reset();
            document.getElementById('moldeId').value = '';
            document.getElementById('modalTitle').textContent = 'Cadastrar Molde';
            
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
            // Em um cenário real, faria upload ou leria FileReader. Aqui apenas simulo se possível ou deixo vazio
            // Para simplificar o mock, não vamos implementar FileReader complexo agora, 
            // mas se o usuário quiser ver a imagem mudando, precisaríamos disso.
            // Vamos apenas manter a lógica de cadastro simples.
        });
    }
});

function renderMoldes() {
    const container = document.getElementById('moldesContainer');
    if (!container) return;

    container.innerHTML = '';

    moldes.forEach(molde => {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-4 col-lg-3 mb-4';
        
        // Formatar valor
        const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(molde.valor);
        
        // Formatar data
        const dataObj = new Date(molde.data_atribuicao);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');

        cardCol.innerHTML = `
            <div class="card h-100 shadow-sm card-molde" onclick="editarMolde(${molde.id})" style="cursor: pointer; transition: transform 0.2s;">
                <img src="${molde.imagem || '../assets/img/portfolio/portfolio-1.jpg'}" class="card-img-top" alt="Molde ${molde.codigo}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title text-primary">${molde.codigo}</h5>
                    <p class="card-text">
                        <strong>Valor:</strong> ${valorFormatado}<br>
                        <small class="text-muted">Atribuído em: ${dataFormatada}</small>
                    </p>
                </div>
                <div class="card-footer bg-transparent border-top-0 text-end">
                    <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i> Editar</button>
                </div>
            </div>
        `;
        
        // Efeito hover simples via JS ou CSS (já tem transition no style inline, vamos adicionar classe se precisar)
        cardCol.querySelector('.card-molde').onmouseover = function() { this.style.transform = 'translateY(-5px)'; }
        cardCol.querySelector('.card-molde').onmouseout = function() { this.style.transform = 'translateY(0)'; }

        container.appendChild(cardCol);
    });
}

function editarMolde(id) {
    const molde = moldes.find(m => m.id === id);
    if (!molde) return;

    document.getElementById('moldeId').value = molde.id;
    document.getElementById('moldeCodigo').value = molde.codigo;
    document.getElementById('moldeValor').value = molde.valor;
    document.getElementById('moldeData').value = molde.data_atribuicao;
    
    // Exibir modal
    document.getElementById('modalTitle').textContent = 'Editar Molde';
    
    const modalEl = document.getElementById('modalMolde');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function salvarMolde() {
    const id = document.getElementById('moldeId').value;
    const codigo = document.getElementById('moldeCodigo').value;
    const valor = parseFloat(document.getElementById('moldeValor').value);
    const data = document.getElementById('moldeData').value;
    
    if (!codigo || isNaN(valor) || !data) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    if (id) {
        // Editar
        const index = moldes.findIndex(m => m.id == id);
        if (index !== -1) {
            moldes[index] = { ...moldes[index], codigo, valor, data_atribuicao: data };
        }
    } else {
        // Novo
        const novoId = moldes.length > 0 ? Math.max(...moldes.map(m => m.id)) + 1 : 1;
        // Imagem default por enquanto
        const novaImagem = "../assets/img/portfolio/portfolio-3.jpg"; 
        moldes.push({
            id: novoId,
            codigo,
            valor,
            data_atribuicao: data,
            imagem: novaImagem
        });
    }

    // Fechar modal
    const modalEl = document.getElementById('modalMolde');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) {
        modalInstance.hide();
    } else {
        // Fallback se não conseguir pegar a instância (raro)
        new bootstrap.Modal(modalEl).hide();
    }
    
    // Re-renderizar
    renderMoldes();
}
