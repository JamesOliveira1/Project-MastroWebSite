
// Variável global para armazenar os moldes carregados
let moldes = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarMoldes();

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

    // Preview de imagem ao selecionar arquivo
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

// Função para carregar moldes da API
async function carregarMoldes() {
    const container = document.getElementById('moldesContainer');
    // Mostrar spinner se necessário, mas já tem no HTML inicial
    
    try {
        const response = await fetch('api/manutencao.php?action=list');
        if (!response.ok) throw new Error('Erro ao carregar moldes');
        
        const data = await response.json();
        moldes = data; // Atualiza variável global
        renderMoldes();
    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<div class="col-12 text-center text-danger">Erro ao carregar moldes. Tente novamente.</div>';
    }
}

function renderMoldes() {
    const container = document.getElementById('moldesContainer');
    if (!container) return;

    container.innerHTML = '';

    if (moldes.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Nenhum molde cadastrado.</div>';
        return;
    }

    // Definição das cores disponíveis
    const cores = ['#04284d', '#004f91', '#0071d2', '#5c8eb0', '#b6dfff'];

    moldes.forEach((molde, index) => {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-auto mb-2'; // Reduzi mb-4 para mb-2 em mobile (controlado via CSS se precisar, mas mb-2 é bom geral)
        
        // Determinar cor baseada no índice
        const corFundo = cores[index % cores.length];
        
        // Formatar valor (pode vir null)
        let valorFormatado = 'Não atribuído';
        // Ajuste: verifica se é número válido antes de formatar
        if (molde.valor !== null && molde.valor !== '' && !isNaN(parseFloat(molde.valor))) {
            valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(molde.valor));
        } else if (molde.valor == null || molde.valor === '') {
            // Mantém "Não atribuído"
        } else {
             // Caso venha string estranha, tenta limpar
             let v = String(molde.valor).replace(/[^\d.-]/g, '');
             let f = parseFloat(v);
             if(!isNaN(f)) valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f);
        }
        
        // Formatar data (pode vir null)
        let dataFormatada = 'Não atribuída';
        if (molde.data_atribuicao) {
            const dataObj = new Date(molde.data_atribuicao);
            // Ajuste de timezone simples para exibição correta da data (evitar dia anterior por fuso)
            const userTimezoneOffset = dataObj.getTimezoneOffset() * 60000;
            const dataCorrigida = new Date(dataObj.getTime() + userTimezoneOffset);
            dataFormatada = dataCorrigida.toLocaleDateString('pt-BR');
        }

        // Imagem default se não tiver
        const imagemSrc = molde.imagem || '../assets/img/moldes/semfoto.png';

        // Identificador único para este card
        const cardId = `card-${molde.id}`;

        cardCol.innerHTML = `
            <div class="flip-container" id="${cardId}" onclick="toggleFlip('${cardId}')">
                <div class="flipper">
                    <div class="front">
                        <img src="${imagemSrc}" alt="${molde.nome}" onerror="this.src='../assets/img/moldes/semfoto.png'">
                        <div class="moldename" style="background-color: ${corFundo};">${molde.nome}</div>
                    </div>
                    <div class="back">
                         <div class="text-end w-100" style="margin-bottom: 5px;">
                            <i class="bi bi-x-circle-fill text-secondary" style="font-size: 1.2rem; cursor: pointer;" onclick="event.stopPropagation(); document.getElementById('${cardId}').classList.remove('flipped');" title="Fechar"></i>
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

function toggleFlip(cardId) {
    // Se o clique foi no botão editar ou fechar, o stopPropagation já foi chamado lá.
    // Aqui apenas inverte o estado.
    document.getElementById(cardId).classList.toggle('flipped');
}

function abrirModalEdicao(id, event) {
    // Parar propagação para não "desvirar" o card ao clicar
    if(event) event.stopPropagation();

    // Como id vem do banco (pode ser string ou int), usar comparação fraca ou converter
    const molde = moldes.find(m => m.id == id);
    if (!molde) return;

    document.getElementById('moldeId').value = molde.id;
    document.getElementById('moldeNome').value = molde.nome || '';
    document.getElementById('moldeCodigo').value = molde.codigo || '';
    document.getElementById('moldeData').value = molde.data_atribuicao || '';
    document.getElementById('moldeObservacao').value = molde.observacao || '';
    
    // Formatar valor como moeda ao abrir
    if (molde.valor != null && molde.valor !== '') {
        // Garantir que é numérico
        let val = parseFloat(molde.valor);
        
        // Se isNaN, tentar limpar caracteres não numéricos (caso venha string suja)
        if (isNaN(val)) {
            val = parseFloat(String(molde.valor).replace(/[^\d.-]/g, ''));
        }

        if (!isNaN(val)) {
            document.getElementById('moldeValor').value = formatarMoeda(val);
        } else {
            document.getElementById('moldeValor').value = '';
        }
    } else {
        document.getElementById('moldeValor').value = '';
    }

    // Exibir modal
    document.getElementById('modalTitle').textContent = 'Editar Molde';
    document.getElementById('btnExcluirMolde').style.display = 'block'; // Mostrar botão excluir
    
    // Ocultar preview no modal de edição inicialmente
    const preview = document.getElementById('previewImagem');
    preview.style.display = 'none';
    preview.src = '';
    
    const modalEl = document.getElementById('modalMolde');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function showCardMessage(container, type, text) {
    if (!container) return;

    const div = document.createElement('div');
    div.className = `alert alert-${type} mt-2 text-center p-1 fade-message`;
    div.style.fontSize = '0.85rem';
    div.style.transition = 'opacity 6s linear';
    div.innerHTML = type === 'success' 
        ? `<i class="bi bi-check-circle-fill me-1"></i>${text}`
        : `<i class="bi bi-exclamation-triangle-fill me-1"></i>${text}`;
    
    // Adicionar abaixo do flip-container (o container é o col-auto)
    // Se o container tiver o flip-container e o alert, fica empilhado.
    container.appendChild(div);

    // Fade out e remover (6 segundos total, sumindo sutilmente)
    // Mantém visível por 3s, depois fade de 3s
    setTimeout(() => {
        div.style.transition = 'opacity 3s ease-out';
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 3000);
    }, 3000);
}

function showGlobalMessage(type, text) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.className = type === 'success' ? 'text-success fw-bold' : 'text-danger fw-bold';
        statusText.innerHTML = type === 'success' 
            ? `<i class="bi bi-check-circle-fill me-1"></i>${text}`
            : `<i class="bi bi-exclamation-triangle-fill me-1"></i>${text}`;
        
        statusText.style.opacity = '1';
        setTimeout(() => {
            statusText.style.transition = 'opacity 3s ease-out';
            statusText.style.opacity = '0';
            setTimeout(() => {
                statusText.textContent = '';
                statusText.style.opacity = '1'; // Reset
                statusText.style.transition = '';
            }, 3000);
        }, 3000);
    }
}

async function salvarMolde() {
    const form = document.getElementById('formMolde');
    const formData = new FormData(form);
    
    // Ajustar valor para formato numérico (float) antes de enviar, ou deixar o backend tratar.
    // Como o input tem formatação R$, precisamos limpar.
    // Mas FormData pega o valor do input. Vamos enviar assim e no backend já limpamos,
    // OU limpamos aqui e atualizamos o FormData.
    // Melhor enviar limpo.
    const valorStr = document.getElementById('moldeValor').value;
    // Remove tudo que não é digito ou virgula/ponto, troca virgula por ponto
    // Ex: R$ 1.500,00 -> 1500.00
    // O backend já tem essa lógica: parseFloat(valorStr.replace(/[^\d,]/g, '').replace(',', '.'));
    // Então podemos enviar a string formatada mesmo.

    // Adicionar action
    formData.append('action', 'save');
    // Renomear input file se necessário, mas o name já é 'imagem' (se input tiver name='imagem')
    // Verificar HTML: <input type="file" ... id="moldeImagemInput"> - NÃO TEM NAME!
    // Precisamos adicionar name ou append manual.
    const fileInput = document.getElementById('moldeImagemInput');
    if (fileInput.files.length > 0) {
        formData.append('imagem', fileInput.files[0]);
    }

    const nome = document.getElementById('moldeNome').value;
    const codigo = document.getElementById('moldeCodigo').value;

    if (!nome || !codigo) {
        alert('Nome e Código são obrigatórios.');
        return;
    }

    // Botão loading state
    const btnSalvar = document.getElementById('btnSalvarMolde');
    const originalText = btnSalvar.innerHTML;
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';

    // FormData pega valor do input. Se for R$ 1.000,00, backend precisa limpar.
    // Mas vamos limpar aqui para garantir envio numérico correto se API esperar float.
    // A API PHP manutencao.php L66 já faz replace/parse. Então OK enviar formatado.

    try {
        const response = await fetch('api/manutencao.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Fechar modal
            const modalEl = document.getElementById('modalMolde');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            
            // Recarregar lista
            await carregarMoldes();
            
            // Mensagem de sucesso abaixo do molde
            const targetId = formData.get('id') || result.id;
            if (targetId) {
                // Pequeno delay para garantir DOM
                setTimeout(() => {
                    const card = document.getElementById(`card-${targetId}`);
                    if (card) {
                        const container = card.parentElement; // cardCol
                        showCardMessage(container, 'success', result.message || 'Salvo com sucesso!');
                        
                        // Manter virado se foi edição
                        if (formData.get('id')) {
                            card.classList.add('flipped');
                        }
                    } else {
                        // Fallback se não achar o card (ex: paginação ou filtro futuro)
                        showGlobalMessage('success', result.message || 'Salvo com sucesso!');
                    }
                }, 100);
            } else {
                showGlobalMessage('success', result.message || 'Salvo com sucesso!');
            }

        } else {
            // Mostrar erro no status text também se possível
            const statusText = document.getElementById('status-text');
            if (statusText) {
                statusText.className = 'text-danger fw-bold';
                statusText.textContent = 'Erro: ' + (result.error || 'Erro desconhecido');
            } else {
                alert('Erro ao salvar: ' + (result.error || 'Erro desconhecido'));
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão ao salvar.');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = originalText;
    }
}

async function excluirMolde() {
    const id = document.getElementById('moldeId').value;
    if (!id) return;

    if (!confirm('Tem certeza que deseja excluir este molde?')) return;

    const btnExcluir = document.getElementById('btnExcluirMolde');
    const originalText = btnExcluir.innerHTML;
    btnExcluir.disabled = true;
    btnExcluir.innerHTML = 'Excluindo...';

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    try {
        const response = await fetch('api/manutencao.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Fechar modal
            const modalEl = document.getElementById('modalMolde');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            
            // Recarregar lista
            await carregarMoldes();
        } else {
            alert('Erro ao excluir: ' + (result.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão ao excluir.');
    } finally {
        btnExcluir.disabled = false;
        btnExcluir.innerHTML = originalText;
    }
}

// Utilitário para formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

// Listener para inputs
document.addEventListener('input', function (e) {
    // Listener para input de moeda
    if (e.target.id === 'moldeValor') {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            e.target.value = '';
            return;
        }
        // Evitar NaN
        const num = parseInt(value);
        if (isNaN(num)) {
            e.target.value = '';
            return;
        }
        value = (num / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        e.target.value = value;
    }

    // Listener para input de código (apenas números)
    if (e.target.id === 'moldeCodigo') {
        e.target.value = e.target.value.replace(/\D/g, '');
    }
});
