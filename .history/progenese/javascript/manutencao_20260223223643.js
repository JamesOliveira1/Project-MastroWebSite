// ============================================================================
// LÓGICA DE MOLDES (ORIGINAL)
// ============================================================================

// Variável global para armazenar os moldes carregados
let moldes = [];

// ============================================================================
// LÓGICA DE EQUIPAMENTOS (NOVA)
// ============================================================================

// Dados fictícios para demonstração
let equipamentos = [
    { 
        id: 1, 
        nome: 'Lixadeira Orbital Makita', 
        codigo: 'LX-001',
        fabricante: 'Makita', 
        modelo: 'BO5030', 
        serie: '123456789', 
        data_aquisicao: '2023-01-15', 
        status: 'Em uso', 
        descricao: 'Lixadeira para acabamento fino em madeira.',
        observacao: 'Uso geral na marcenaria.',
        imagem: '',
        manutencoes: [
            { 
                data_inicial: '2023-06-10', 
                data_retorno: '2023-06-12', 
                tipo: 'Preventiva', 
                observacao: 'Troca de escovas e limpeza interna', 
                responsavel: 'João Silva',
                concluida: true 
            },
            { 
                data_inicial: '2023-12-05', 
                data_retorno: '2023-12-06', 
                tipo: 'Corretiva', 
                observacao: 'Troca do cabo de energia', 
                responsavel: 'Assistência Técnica',
                concluida: true
            }
        ]
    },
    { 
        id: 2, 
        nome: 'Serra Circular DeWalt', 
        codigo: 'SC-045',
        fabricante: 'DeWalt', 
        modelo: 'DWE575', 
        serie: '987654321', 
        data_aquisicao: '2022-11-20', 
        status: 'Em manutenção', 
        descricao: 'Serra circular de mão 7-1/4".',
        observacao: 'Aguardando peça de reposição.',
        imagem: '',
        manutencoes: [
             { 
                data_inicial: '2023-02-15', 
                data_retorno: '2023-02-16', 
                tipo: 'Preventiva', 
                observacao: 'Afiação do disco', 
                responsavel: 'Carlos Afiação',
                concluida: true
             }
        ] 
    },
    { 
        id: 3, 
        nome: 'Compressor de Ar Schulz', 
        codigo: 'CP-010',
        fabricante: 'Schulz', 
        modelo: 'CSL 10', 
        serie: '456123789', 
        data_aquisicao: '2021-05-10', 
        status: 'Em uso', 
        descricao: 'Compressor de pistão 10 pés.',
        observacao: 'Verificar nível de óleo semanalmente.',
        imagem: '',
        manutencoes: [
            { 
                data_inicial: '2022-05-12', 
                data_retorno: '2022-05-12', 
                tipo: 'Preventiva', 
                observacao: 'Troca de óleo e filtros', 
                responsavel: 'Interno',
                concluida: true
            },
            { 
                data_inicial: '2023-05-15', 
                data_retorno: '', 
                tipo: 'Preventiva', 
                observacao: 'Troca de óleo e verificação de correia', 
                responsavel: 'Interno',
                concluida: false
            }
        ]
    }
];

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na página de MOLDES
    if (document.getElementById('moldesContainer')) {
        initMoldes();
    }

    // Verifica se estamos na página de EQUIPAMENTOS
    if (document.getElementById('equipamentosContainer')) {
        initEquipamentos();
    }
    
    // Listeners Globais (Inputs de formatação)
    setupGlobalInputListeners();
});

function initMoldes() {
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
            document.getElementById('removerImagemFlag').value = '0'; // Reset flag
            
            // Limpar preview de imagem
            const preview = document.getElementById('previewImagem');
            preview.style.display = 'none';
            preview.src = '';
            
            // Desabilitar botão de remover foto (novo molde não tem foto)
            const btnRemoverFoto = document.getElementById('btnRemoverFoto');
            if (btnRemoverFoto) btnRemoverFoto.disabled = true;
        });
    }

    // Event listener para botão de remover foto
    const btnRemoverFoto = document.getElementById('btnRemoverFoto');
    if (btnRemoverFoto) {
        btnRemoverFoto.addEventListener('click', () => {
            // Limpar input file
            document.getElementById('moldeImagemInput').value = '';
            // Marcar flag para remover no backend
            document.getElementById('removerImagemFlag').value = '1';
            // Esconder preview se houver
            const preview = document.getElementById('previewImagem');
            preview.style.display = 'none';
            preview.src = '';
            
            // Desabilitar botão após remover
            btnRemoverFoto.disabled = true;
            
            // Opcional: mostrar mensagem visual que será removida
            alert('A foto será removida ao salvar.');
        });
    }

    // Preview de imagem ao selecionar arquivo
    const inputImg = document.getElementById('moldeImagemInput');
    if(inputImg) {
        inputImg.addEventListener('change', function(e) {
            // Se selecionou arquivo, reseta flag de remoção
            document.getElementById('removerImagemFlag').value = '0';
            
            // Não mostrar preview conforme solicitado ("não é necessário exibi-la no modal")
            const preview = document.getElementById('previewImagem');
            preview.style.display = 'none';
            preview.src = '';
            
            // Habilitar botão de remover se selecionou algo
            if (this.files && this.files.length > 0) {
                const btnRemoverFoto = document.getElementById('btnRemoverFoto');
                if (btnRemoverFoto) btnRemoverFoto.disabled = false;
            }
        });
    }
}

function initEquipamentos() {
    renderEquipamentos();

    // Event listener para o botão de salvar no modal
    const btnSalvar = document.getElementById('btnSalvarEquipamento');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarEquipamento);
    }
    
    // Event listener para o botão de excluir
    const btnExcluir = document.getElementById('btnExcluirEquipamento');
    if (btnExcluir) {
        btnExcluir.addEventListener('click', excluirEquipamento);
    }

    // Event listener para o botão de adicionar novo (limpa o form)
    const btnNovo = document.getElementById('btnNovoEquipamento');
    if (btnNovo) {
        btnNovo.addEventListener('click', () => {
            document.getElementById('formEquipamento').reset();
            document.getElementById('equipamentoId').value = '';
            document.getElementById('modalTitle').textContent = 'Cadastrar Equipamento';
            document.getElementById('btnExcluirEquipamento').style.display = 'none';
            document.getElementById('removerImagemEquipFlag').value = '0'; // Reset flag

            // Limpar preview de imagem
            const preview = document.getElementById('previewImagemEquip');
            preview.style.display = 'none';
            preview.src = '';
            
            // Desabilitar botão de remover foto
            const btnRemoverFoto = document.getElementById('btnRemoverFotoEquip');
            if (btnRemoverFoto) btnRemoverFoto.disabled = true;
        });
    }

    // Event listener para botão de remover foto EQUIPAMENTO
    const btnRemoverFoto = document.getElementById('btnRemoverFotoEquip');
    if (btnRemoverFoto) {
        btnRemoverFoto.addEventListener('click', () => {
            // Limpar input file
            document.getElementById('equipImagemInput').value = '';
            // Marcar flag para remover no backend
            document.getElementById('removerImagemEquipFlag').value = '1';
            // Esconder preview se houver
            const preview = document.getElementById('previewImagemEquip');
            preview.style.display = 'none';
            preview.src = '';
            
            // Desabilitar botão após remover
            btnRemoverFoto.disabled = true;
        });
    }

    // Preview de imagem ao selecionar arquivo EQUIPAMENTO
    const inputImg = document.getElementById('equipImagemInput');
    if(inputImg) {
        inputImg.addEventListener('change', function(e) {
            // Se selecionou arquivo, reseta flag de remoção
            document.getElementById('removerImagemEquipFlag').value = '0';
            
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('previewImagemEquip');
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(file);
                
                // Habilitar botão de remover
                const btnRemoverFoto = document.getElementById('btnRemoverFotoEquip');
                if (btnRemoverFoto) btnRemoverFoto.disabled = false;
            }
        });
    }
}

function setupGlobalInputListeners() {
    // Listener para inputs
    document.addEventListener('input', function (e) {
        // Listener para input de moeda (MOLDES)
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

        // Listener para input de código (apenas números) (MOLDES)
        if (e.target.id === 'moldeCodigo') {
            e.target.value = e.target.value.replace(/\D/g, '');
        }
    });
}

// ============================================================================
// FUNÇÕES - MOLDES
// ============================================================================

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
        if(container) container.innerHTML = '<div class="col-12 text-center text-danger">Erro ao carregar moldes. Tente novamente.</div>';
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
    
    // Resetar flag de remover imagem
    document.getElementById('removerImagemFlag').value = '0';

    // Verificar se tem imagem válida (diferente de semfoto.png) para habilitar botão remover
    const btnRemoverFoto = document.getElementById('btnRemoverFoto');
    if (btnRemoverFoto) {
        if (molde.imagem && !molde.imagem.includes('semfoto.png')) {
            btnRemoverFoto.disabled = false;
        } else {
            btnRemoverFoto.disabled = true;
        }
    }

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

// ============================================================================
// FUNÇÕES - EQUIPAMENTOS
// ============================================================================

function renderEquipamentos() {
    const container = document.getElementById('equipamentosContainer');
    if (!container) return;

    container.innerHTML = '';

    if (equipamentos.length === 0) {
        container.innerHTML = '<div class="text-center py-5 text-muted">Nenhum equipamento cadastrado.</div>';
        return;
    }

    equipamentos.forEach(equip => {
        const item = document.createElement('div');
        item.className = `equipment-item ${equip.status.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "")}`;
        
        // Status class adjustment
        let statusClass = 'bg-secondary text-white';
        if (equip.status === 'Em uso') statusClass = 'em-uso';
        else if (equip.status === 'Em manutenção') statusClass = 'em-manutencao';
        else if (equip.status === 'Fora de serviço') statusClass = 'bg-danger text-white';

        // Formatar data aquisição
        let dataAq = 'Não informada';
        if(equip.data_aquisicao) {
            // Criar data sem ajuste de fuso para exibição simples (string yyyy-mm-dd)
            const parts = equip.data_aquisicao.split('-');
            if(parts.length === 3) {
                dataAq = `${parts[2]}/${parts[1]}/${parts[0]}`;
            } else {
                dataAq = equip.data_aquisicao;
            }
        }

        // HTML do Histórico
        let historyHtml = '';
        if (equip.manutencoes && equip.manutencoes.length > 0) {
            historyHtml = `
                <div class="maintenance-history">
                    <table class="maintenance-table">
                        <thead>
                            <tr>
                                <th>Data Inicial</th>
                                <th>Data Retorno</th>
                                <th>Tipo</th>
                                <th>Observação</th>
                                <th>Responsável</th>
                                <th class="text-center">Concluída</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${equip.manutencoes.map(m => {
                                // Formatar Data Inicial
                                let dataIni = m.data_inicial;
                                if(dataIni) {
                                    const partsI = dataIni.split('-');
                                    if(partsI.length === 3) dataIni = `${partsI[2]}/${partsI[1]}/${partsI[0]}`;
                                }
                                
                                // Formatar Data Retorno
                                let dataRet = m.data_retorno || '-';
                                if(m.data_retorno) {
                                    const partsR = m.data_retorno.split('-');
                                    if(partsR.length === 3) dataRet = `${partsR[2]}/${partsR[1]}/${partsR[0]}`;
                                }

                                return `
                                <tr>
                                    <td>${dataIni}</td>
                                    <td>${dataRet}</td>
                                    <td><span class="badge ${m.tipo === 'Preventiva' ? 'bg-success' : 'bg-warning text-dark'}">${m.tipo}</span></td>
                                    <td>${m.observacao}</td>
                                    <td>${m.responsavel || '-'}</td>
                                    <td class="text-center">
                                        <input type="checkbox" class="form-check-input" ${m.concluida ? 'checked' : ''} disabled>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            historyHtml = '<div class="empty-history">Nenhuma manutenção registrada.</div>';
        }

        // Imagem do equipamento
        const imagemSrc = equip.imagem || '../assets/img/moldes/semfoto.png';

        item.innerHTML = `
            <div class="equipment-header" onclick="toggleDetails(${equip.id})">
                <div class="equipment-name">
                    ${equip.nome}
                    <span class="equipment-status ${statusClass.includes('bg-') ? '' : statusClass} ${statusClass.includes('bg-') ? statusClass : ''}">${equip.status}</span>
                </div>
                <i class="bi bi-chevron-down equipment-toggle-icon" id="icon-${equip.id}"></i>
            </div>
            <div class="equipment-details" id="details-${equip.id}">
                <div class="equipment-content-wrapper">
                    <div class="equipment-details-flex">
                    <div class="equipment-foto-grid">
                        <div class="equipment-image-container">
                            <img src="${imagemSrc}" alt="${equip.nome}" class="equipment-image" onerror="this.src='../assets/img/moldes/semfoto.png'">
                        </div>
                        <div class="mt-3">
                                <a href="javascript:void(0)" class="equipment-status ${statusClass.includes('bg-') ? '' : statusClass} ${statusClass.includes('bg-') ? statusClass : ''}" onclick="alterarStatus(${equip.id}, event)" style="text-decoration: none; display: inline-block;">${equip.status}</a>
                            </div>
                            </div>
                        <div class="equipment-info-container" style="flex: 1;">
                            <div class="info-row-5">
                                <div class="info-group">
                                    <span class="info-label">Fabricante</span>
                                    <span class="info-value">${equip.fabricante || '-'}</span>
                                </div>
                                <div class="info-group">
                                    <span class="info-label">Código do Produto</span>
                                    <span class="info-value">${equip.codigo || '-'}</span>
                                </div>
                                <div class="info-group">
                                    <span class="info-label">Modelo</span>
                                    <span class="info-value">${equip.modelo || '-'}</span>
                                </div>
                                <div class="info-group">
                                    <span class="info-label">Nº Série</span>
                                    <span class="info-value">${equip.serie || '-'}</span>
                                </div>
                                <div class="info-group">
                                    <span class="info-label">Data Aquisição</span>
                                    <span class="info-value">${dataAq}</span>
                                </div>
                            </div>
                            
                            <div class="info-row-2 mt-3">
                                <div class="info-group">
                                    <span class="info-label">Descrição</span>
                                    <span class="info-value">${equip.descricao || '-'}</span>
                                </div>
                                <div class="info-group">
                                    <span class="info-label">Observação</span>
                                    <span class="info-value">${equip.observacao || '-'}</span>
                                </div>
                            </div>

                            
                        </div>
                    </div>

                    <div class="maintenance-section">
                        <h4>
                            Histórico de Manutenções
                            <button class="btn btn-sm btn-outline-primary" onclick="addManutencao(${equip.id}, event)">
                                <i class="bi bi-plus-lg"></i> Adicionar
                            </button>
                        </h4>
                        ${historyHtml}
                    </div>

                    <div class="mt-3 text-end">
                        <button class="btn btn-sm btn-outline-secondary" onclick="editarEquipamento(${equip.id})">
                            <i class="bi bi-pencil"></i> Editar Dados
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function toggleDetails(id) {
    const details = document.getElementById(`details-${id}`);
    const item = details.closest('.equipment-item');

    if (item.classList.contains('active')) {
        item.classList.remove('active');
        details.style.maxHeight = '0';
    } else {
        item.classList.add('active');
        // Set max-height to scrollHeight to allow transition
        // Adding a buffer for safety, or just scrollHeight
        details.style.maxHeight = (details.scrollHeight + 50) + 'px';
    }
}

function editarEquipamento(id) {
    const equip = equipamentos.find(e => e.id === id);
    if (!equip) return;

    document.getElementById('equipamentoId').value = equip.id;
    document.getElementById('equipNome').value = equip.nome;
    document.getElementById('equipCodigo').value = equip.codigo || '';
    document.getElementById('equipFabricante').value = equip.fabricante || '';
    document.getElementById('equipModelo').value = equip.modelo || '';
    document.getElementById('equipSerie').value = equip.serie || '';
    document.getElementById('equipData').value = equip.data_aquisicao || '';
    document.getElementById('equipStatus').value = equip.status;
    document.getElementById('equipDescricao').value = equip.descricao || '';
    document.getElementById('equipObservacao').value = equip.observacao || '';

    // Resetar flag de remover imagem
    document.getElementById('removerImagemEquipFlag').value = '0';

    // Imagem
    const preview = document.getElementById('previewImagemEquip');
    const btnRemoverFoto = document.getElementById('btnRemoverFotoEquip');
    
    if (equip.imagem) {
        preview.src = equip.imagem;
        preview.style.display = 'block';
        if (btnRemoverFoto) btnRemoverFoto.disabled = false;
    } else {
        preview.src = '';
        preview.style.display = 'none';
        if (btnRemoverFoto) btnRemoverFoto.disabled = true;
    }

    document.getElementById('modalTitle').textContent = 'Editar Equipamento';
    document.getElementById('btnExcluirEquipamento').style.display = 'block';

    const modal = new bootstrap.Modal(document.getElementById('modalEquipamento'));
    modal.show();
}

function salvarEquipamento() {
    const id = document.getElementById('equipamentoId').value;
    const nome = document.getElementById('equipNome').value;
    
    if (!nome) {
        alert('Nome é obrigatório');
        return;
    }

    // Tratamento básico de imagem (fake upload)
    let imagemAtual = '';
    const fileInput = document.getElementById('equipImagemInput');
    const preview = document.getElementById('previewImagemEquip');
    
    // Se selecionou arquivo, usaria o URL do preview como fake
    if (fileInput.files.length > 0) {
        imagemAtual = preview.src;
    } else if (id) {
        // Manter imagem existente se não removeu
        const removerFlag = document.getElementById('removerImagemEquipFlag').value;
        if (removerFlag === '1') {
            imagemAtual = '';
        } else {
            const equipExistente = equipamentos.find(e => e.id == id);
            imagemAtual = equipExistente ? equipExistente.imagem : '';
        }
    }

    const novoEquip = {
        id: id ? parseInt(id) : Date.now(), // ID fake
        nome: nome,
        codigo: document.getElementById('equipCodigo').value,
        fabricante: document.getElementById('equipFabricante').value,
        modelo: document.getElementById('equipModelo').value,
        serie: document.getElementById('equipSerie').value,
        data_aquisicao: document.getElementById('equipData').value,
        status: document.getElementById('equipStatus').value,
        descricao: document.getElementById('equipDescricao').value,
        observacao: document.getElementById('equipObservacao').value,
        imagem: imagemAtual,
        manutencoes: id ? (equipamentos.find(e => e.id == id)?.manutencoes || []) : []
    };

    if (id) {
        const index = equipamentos.findIndex(e => e.id == id);
        if (index !== -1) {
            equipamentos[index] = novoEquip;
        }
    } else {
        equipamentos.push(novoEquip);
    }

    // Fechar modal
    const modalEl = document.getElementById('modalEquipamento');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    renderEquipamentos();
    
    // Se foi edição, reabrir o item para ver as mudanças
    if (id) {
        setTimeout(() => {
            const newItem = document.getElementById(`details-${id}`)?.closest('.equipment-item');
            if (newItem) {
                // Forçar estado aberto sem animação inicial se quiser, ou chamar toggle
                toggleDetails(id);
            }
        }, 100);
    }
}

function excluirEquipamento() {
    const id = document.getElementById('equipamentoId').value;
    if (!id) return;

    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
        equipamentos = equipamentos.filter(e => e.id != id);
        
        const modalEl = document.getElementById('modalEquipamento');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        renderEquipamentos();
    }
}

function addManutencao(id, event) {
    if(event) event.stopPropagation();
    alert('Funcionalidade de adicionar manutenção será implementada na próxima etapa.');
}

function alterarStatus(id, event) {
    if(event) event.stopPropagation();
    
    const index = equipamentos.findIndex(e => e.id === id);
    if (index === -1) return;

    const currentStatus = equipamentos[index].status;
    let newStatus = 'Em uso';

    if (currentStatus === 'Em uso') {
        newStatus = 'Em manutenção';
    } else if (currentStatus === 'Em manutenção') {
        newStatus = 'Fora de serviço';
    } else if (currentStatus === 'Fora de serviço') {
        newStatus = 'Em uso';
    }

    equipamentos[index].status = newStatus;
    
    // Re-renderizar para atualizar UI
    renderEquipamentos();
    
    // Manter o item aberto após re-renderizar
    setTimeout(() => {
        const details = document.getElementById(`details-${id}`);
        if(details) {
            const item = details.closest('.equipment-item');
            if(item) {
                item.classList.add('active');
                // Recalcular altura para manter aberto
                details.style.maxHeight = (details.scrollHeight + 50) + 'px';
            }
        }
    }, 50);
}
