
// Variável global para armazenar os moldes carregados
let moldes = [];

// Variável global para armazenar os equipamentos carregados
let equipamentos = [];
let ordemAtual = 'status'; // Padrão: status

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
    carregarEquipamentos();

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
            
            // Resetar estados de imagem
            document.getElementById('equipImagemFeedback').style.display = 'none';
            document.getElementById('equipImagemAvisoRemocao').style.display = 'none';
            document.getElementById('equipImagemNome').textContent = '';
            
            // Desabilitar botão de remover foto
            const btnRemoverFoto = document.getElementById('btnRemoverFotoEquip');
            if (btnRemoverFoto) {
                btnRemoverFoto.disabled = true;
                btnRemoverFoto.title = "Nenhuma foto selecionada";
            }

            // Limpar resultados mas manter container visível (conforme solicitado)
            const resultsContainer = document.getElementById('buscaEquipResultsContainer');
            const resultsBody = document.getElementById('buscaEquipResultsBody');
            if(resultsContainer) resultsContainer.style.display = '';
            if(resultsBody) resultsBody.innerHTML = '';
            
            // Resetar paginação se houver
            const btnPrev = document.getElementById('btnBuscaEquipPrev');
            const btnNext = document.getElementById('btnBuscaEquipNext');
            if(btnPrev) btnPrev.disabled = true;
            if(btnNext) btnNext.disabled = true;

            // Resetar campos bloqueados e botões de busca
    const nomeInput = document.getElementById('equipNome');
    const codigoInput = document.getElementById('equipCodigo');
    if(nomeInput) {
        nomeInput.readOnly = false;
        nomeInput.style.backgroundColor = '';
    }
    if(codigoInput) {
        codigoInput.readOnly = false;
        codigoInput.style.backgroundColor = '';
    }
    
    // Resetar seleção
    SELECTED_EQUIP_ITEM = null;
    
    // Resetar botões de busca
    const btnNome = document.getElementById('btnBuscaEquipNome');
    const btnCodigo = document.getElementById('btnBuscaEquipCodigo');
    if(btnNome) {
        btnNome.innerHTML = '<i class="bi bi-search"></i>';
        btnNome.onclick = null;
    }
    if(btnCodigo) {
        btnCodigo.innerHTML = '<i class="bi bi-search"></i>';
        btnCodigo.onclick = null;
    }

    // Resetar e esconder botão limpar
    const btnClear = document.getElementById('btnBuscaEquipClear');
    if(btnClear) btnClear.style.display = 'none';
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
            
            // Desabilitar botão após remover
            btnRemoverFoto.disabled = true;
            btnRemoverFoto.title = "Foto marcada para remoção";

            // Exibir alerta
            alert('A foto será removida ao salvar.');
        });
    }

    // Preview de imagem ao selecionar arquivo EQUIPAMENTO (Apenas flag e botão remover)
    const inputImg = document.getElementById('equipImagemInput');
    if(inputImg) {
        inputImg.addEventListener('change', function(e) {
            // Se selecionou arquivo, reseta flag de remoção
            document.getElementById('removerImagemEquipFlag').value = '0';
            
            const file = this.files[0];
            if (file) {
                // Habilitar botão de remover
                const btnRemoverFoto = document.getElementById('btnRemoverFotoEquip');
                if (btnRemoverFoto) {
                    btnRemoverFoto.disabled = false;
                    btnRemoverFoto.title = "Remover foto selecionada";
                }
                
                // Mostrar nome do arquivo
                const feedback = document.getElementById('equipImagemFeedback');
                const nomeSpan = document.getElementById('equipImagemNome');
                // if (feedback && nomeSpan) {
                //     nomeSpan.textContent = file.name;
                //     feedback.style.display = 'block';
                // }
            } else {
                // Se cancelou seleção (file vazio), volta ao estado anterior?
                // Melhor resetar se input ficar vazio
                document.getElementById('equipImagemFeedback').style.display = 'none';
                const btnRemoverFoto = document.getElementById('btnRemoverFotoEquip');
                // Se tinha imagem salva antes, botão deveria ficar habilitado? 
                // A lógica simples é: input vazio + flag 0 = mantem original. 
                // Mas aqui estamos falando de nova seleção.
                // Vamos assumir que se limpou o input, volta ao estado inicial da edição.
            }
        });
    }

    // Event listener para botão de remover OS (HISTÓRICO)
    const btnRemoverOS = document.getElementById('btnRemoverOS');
    if (btnRemoverOS) {
        btnRemoverOS.addEventListener('click', () => {
            // Limpar input file
            const inputOS = document.getElementById('histOS');
            if (inputOS) inputOS.value = '';
            
            // Marcar flag para remover no backend
            document.getElementById('removerOSFlag').value = '1';
            
            // Desabilitar botão após remover
            btnRemoverOS.disabled = true;
            btnRemoverOS.title = "OS marcada para remoção";

            // Exibir alerta (opcional)
            alert('O arquivo de OS será removido ao salvar.');
        });
    }

    // Preview de arquivo OS ao selecionar (Habilitar botão remover)
    const inputOS = document.getElementById('histOS');
    if(inputOS) {
        inputOS.addEventListener('change', function(e) {
            // Se selecionou arquivo, reseta flag de remoção
            document.getElementById('removerOSFlag').value = '0';
            
            const file = this.files[0];
            if (file) {
                // Habilitar botão de remover
                const btnRemoverOS = document.getElementById('btnRemoverOS');
                if (btnRemoverOS) {
                    btnRemoverOS.disabled = false;
                    btnRemoverOS.title = "Remover arquivo selecionado";
                }
            } else {
                // Se cancelou seleção e ficou vazio
                // Se estava editando e tinha OS, deveria voltar ao estado original?
                // Vamos simplificar: se vazio, desabilita.
                 const btnRemoverOS = document.getElementById('btnRemoverOS');
                 if(btnRemoverOS) btnRemoverOS.disabled = true;
            }
        });
    }
    
    // Event listener para o botão de excluir histórico
    const btnExcluirHist = document.getElementById('btnExcluirHistorico');
    if (btnExcluirHist) {
        btnExcluirHist.addEventListener('click', excluirHistorico);
    }

    // Lógica de Busca de Equipamentos
    setupBuscaEquipamentos();
    // Event listener para botão salvar histórico
    const btnSalvarHist = document.getElementById('btnSalvarHistorico');
    if(btnSalvarHist) {
        btnSalvarHist.addEventListener('click', salvarHistorico);
    }

    // Event listener para botão de ordenar
    const btnOrdenar = document.getElementById('btnOrdenarEquipamentos');
    if (btnOrdenar) {
        btnOrdenar.addEventListener('click', alternarOrdemEquipamentos);
    }
}

function alternarOrdemEquipamentos() {
    const btn = document.getElementById('btnOrdenarEquipamentos');
    
    // Ciclo: status -> criacao -> alfabetica -> status
    if (ordemAtual === 'status') {
        ordemAtual = 'criacao';
        btn.innerHTML = '<i class="bi bi-clock-history"></i> Ordenar';
        btn.title = 'Ordenado por Data de Criação';
    } else if (ordemAtual === 'criacao') {
        ordemAtual = 'alfabetica';
        btn.innerHTML = '<i class="bi bi-sort-alpha-down"></i> Ordenar';
        btn.title = 'Ordenado Alfabeticamente';
    } else {
        ordemAtual = 'status';
        btn.innerHTML = '<i class="bi bi-list-ol"></i> Ordenar';
        btn.title = 'Ordenado por Status';
    }

    aplicarOrdenacao();
}

function aplicarOrdenacao(openIds = []) {
    // Garantir que openIds seja array
    if (!Array.isArray(openIds)) {
        openIds = openIds ? [String(openIds)] : [];
    }

    if (!equipamentos || equipamentos.length === 0) return;

    if (ordemAtual === 'status') {
        // Em manutenção > Em uso > Fora de serviço
        equipamentos.sort((a, b) => {
            const ordem = { 'Em manutenção': 1, 'Em uso': 2, 'Fora de serviço': 3 };
            const statusA = ordem[a.status] || 4;
            const statusB = ordem[b.status] || 4;
            return statusA - statusB;
        });
    } else if (ordemAtual === 'criacao') {
        // Mais recentes primeiro (ID descrescente ou created_at)
        // Como o ID é auto-incremento, ID maior = mais recente
        equipamentos.sort((a, b) => b.id - a.id);
    } else if (ordemAtual === 'alfabetica') {
        // Nome A-Z
        equipamentos.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    renderEquipamentos(openIds);
}

// Variável para armazenar o item selecionado
let SELECTED_EQUIP_ITEM = null;

function setupBuscaEquipamentos() {
    const btnBuscaNome = document.getElementById('btnBuscaEquipNome');
    const btnBuscaCodigo = document.getElementById('btnBuscaEquipCodigo');
    const resultsContainer = document.getElementById('buscaEquipResultsContainer');
    const resultsBody = document.getElementById('buscaEquipResultsBody');
    const btnPrev = document.getElementById('btnBuscaEquipPrev');
    const btnNext = document.getElementById('btnBuscaEquipNext');

    let currentSearchResults = [];
    let currentSearchTerm = '';
    let currentSearchOffset = 0;
    const itemsPerPage = 5;

    const performSearch = async (term, offset = 0) => {
        try {
            resultsBody.innerHTML = '<tr><td colspan="3" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>';
            resultsContainer.style.display = 'block';

            const { items, offset: newOffset, limit } = await buscarItensInventario(term, offset, itemsPerPage);

            currentSearchResults = items;
            currentSearchOffset = newOffset;
            currentSearchTerm = term;
            
            renderSearchResults(items, offset, limit);

        } catch (error) {
            console.error('Erro na busca:', error);
            resultsBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Erro ao buscar: ' + error.message + '</td></tr>';
        }
    };

    const renderSearchResults = (items, offset, limit) => {
        if (items.length === 0) {
            resultsBody.innerHTML = '<tr><td colspan="3" class="text-center py-3 text-muted">Nenhum resultado encontrado</td></tr>';
            btnPrev.disabled = true;
            btnNext.disabled = true;
            return;
        }

        resultsBody.innerHTML = items.map(item => {
            // Tratar campos nulos ou undefined
            const codigo = item.codigo_produto || '';
            const nome = item.nome || item.nome_item || '';
            // Escapar aspas simples para o onclick
            const safeCodigo = codigo.replace(/'/g, "\\'");
            const safeNome = nome.replace(/'/g, "\\'");
            const itemId = item.id || item.item_id || '';
            
            // Verificar se é o item selecionado
            const isSelected = SELECTED_EQUIP_ITEM && (SELECTED_EQUIP_ITEM.codigo === codigo || SELECTED_EQUIP_ITEM.id === itemId);
            const btnClass = isSelected ? 'btn_estaleirooff active' : 'btn_estaleirooff';
            const btnText = isSelected ? 'Selecionado' : 'Selecionar';
            const trClass = isSelected ? 'table-active' : '';

            return `
            <tr class="${trClass}" id="tr-equip-${itemId}">
                <td>${codigo}</td>
                <td>${nome}</td>
                <td class="text-end">
                    <button type="button" class="btn btn-sm ${btnClass}" 
                        onclick="selecionarEquipBusca('${safeCodigo}', '${safeNome}', '${itemId}', this)">
                        ${btnText}
                    </button>
                </td>
            </tr>
        `}).join('');

        btnPrev.disabled = offset <= 0;
        btnNext.disabled = items.length < limit;
    };

    if(btnBuscaNome) {
        btnBuscaNome.addEventListener('click', () => {
            const term = document.getElementById('equipNome').value;
            if(term) performSearch(term, 0);
            else alert('Digite algo para buscar');
        });
    }

    if(btnBuscaCodigo) {
        btnBuscaCodigo.addEventListener('click', () => {
            const term = document.getElementById('equipCodigo').value;
            if(term) performSearch(term, 0);
            else alert('Digite algo para buscar');
        });
    }

    if(btnPrev) {
        btnPrev.addEventListener('click', () => {
            if(currentSearchOffset > 0) {
                const newOffset = Math.max(0, currentSearchOffset - itemsPerPage);
                performSearch(currentSearchTerm, newOffset);
            }
        });
    }

    if(btnNext) {
        btnNext.addEventListener('click', () => {
            // Se tivemos retorno cheio, tentamos próxima página
            if(currentSearchResults.length === itemsPerPage) {
                performSearch(currentSearchTerm, currentSearchOffset + itemsPerPage);
            }
        });
    }
}

// Função auxiliar de busca (reutilizando API do inventário)
async function buscarItensInventario(q, offset = 0, limit = 30) {
  const url = 'api/inventario.php?action=buscar';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, offset, limit })
  });
  const data = await res.json();
  if (!data || data.ok !== true) { throw new Error(data && data.error ? data.error : 'Falha na busca'); }
  return { items: (data.items || []), offset: (data.offset || 0), limit: (data.limit || limit) };
}

// Função global para ser acessada pelo HTML gerado
window.selecionarEquipBusca = (codigo, item, id, btnElement) => {
    // Atualizar inputs
    const nomeInput = document.getElementById('equipNome');
    const codigoInput = document.getElementById('equipCodigo');
    
    nomeInput.value = item;
    codigoInput.value = codigo;
    
    // Armazenar seleção
    SELECTED_EQUIP_ITEM = { codigo, item, id };
    
    // Atualizar visual da tabela
    const resultsBody = document.getElementById('buscaEquipResultsBody');
    if (resultsBody) {
        // Remover active de todos
        resultsBody.querySelectorAll('tr').forEach(tr => tr.classList.remove('table-active'));
        resultsBody.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
            btn.textContent = 'Selecionar';
        });
        
        // Adicionar active ao selecionado
        if (btnElement) {
            const tr = btnElement.closest('tr');
            if (tr) tr.classList.add('table-active');
            btnElement.classList.add('active');
            btnElement.textContent = 'Selecionar';
        }
    }

    // Bloquear campos visualmente
    nomeInput.readOnly = true;
    codigoInput.readOnly = true;
    nomeInput.style.backgroundColor = '#e9ecef';
    codigoInput.style.backgroundColor = '#e9ecef';
    
    // Não esconder botões, mas desabilitar a busca se não for nova busca?
    // O usuário pediu: "os inputs nome do equipamento e codigo do produto passam a ter os valores escolhidos e devem ficar com classe form-control:disabled ou background-color:#e9ecef"
    // "não deve ser possivel digitar um nome do equipamento ou codigo qualquer e simplesmente salvar! O usuario usar o input para pesquisar e escolher na lista de resultados."
    
    // Vamos manter os botões de busca visíveis para permitir nova busca, mas os inputs ficam readonly.
    // Para buscar novo, o usuário clica na lupa com o valor que já está lá ou limpa?
    // Se está readonly, ele não consegue editar para buscar outro termo.
    // Então vamos permitir editar APENAS se clicar num botão "Limpar seleção" ou algo assim?
    // Ou simplesmente ao clicar na lupa ele busca o que está no input (que é o nome do item selecionado).
    // Mas se ele quiser buscar outro, ele precisa digitar.
    // O requisito diz: "O usuario usar o input para pesquisar". Se eu bloqueio o input, ele não pesquisa mais.
    // Vamos desbloquear o input SOMENTE se ele não tiver selecionado nada?
    // Não, o requisito diz "A partir dessa alteração o nome e codigo não podem mais ser alterados".
    // Então se ele selecionou errado, ele tem que ter um jeito de desfazer.
    // Vamos adicionar um botão de limpar ou permitir que ele edite para buscar novamente.
    
    // Ajuste: O usuário disse "não deve ser possivel digitar um nome... e simplesmente salvar".
    // Isso implica validação no Salvar.
    // Mas ele disse "os inputs... devem ficar com classe disabled".
    // Se ficar disabled, como ele busca outro?
    // Talvez o fluxo seja: Digita -> Busca -> Seleciona -> Bloqueia.
    // Se quiser trocar, teria que ter um "Limpar" ou "Alterar".
    // Como não foi pedido botão "Limpar", vou assumir que se ele quiser buscar outro, ele usa a tabela que já está aberta.
    // Mas e se ele quiser buscar outro termo?
    // Vou deixar os inputs readonly. Se ele quiser buscar outro termo, ele precisará de um jeito de desbloquear.
    // Vou adicionar um botão de "X" (limpar) nos inputs de busca ou fazer com que ao clicar na lupa novamente, se tiver selecionado, ele limpa a seleção e foca no input.
    
    // Melhor abordagem simples: Bloqueia. Se quiser buscar outro, ele já tem a lista aberta.
    // Se a lista não tiver o que ele quer, ele estaria "preso".
    // Vou permitir que ele edite o campo DEPOIS de clicar num botão de "Limpar" que vou criar dinamicamente ou usar o comportamento de clicar na lupa.
    
    // Solução: Botão de busca vira botão de "Limpar" quando selecionado?
    // O usuário pediu "pode remover a lupa no modal editar". No cadastrar não falou de remover lupa.
    // Mas falou "os botões proximo e voltar para muitos resultados. A tabela dos resultados pode ficar sempre visivel".
    
    // Vou manter readonly. Se o usuário quiser buscar outro termo, ele vai ter dificuldade se não tiver botão limpar.
    // Vou adicionar lógica: se clicar no input readonly, pergunta se quer limpar a seleção? Não, intrusivo.
    // Vou adicionar um botão de limpar seleção ao lado ou tornar a lupa um "reset" se tiver selecionado.
};

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
    const inputImagem = document.getElementById('moldeImagemInput');

    if (molde.imagem && !molde.imagem.includes('semfoto.png')) {
        if (btnRemoverFoto) {
            btnRemoverFoto.disabled = false;
        }
        
        // Tentar preencher o input visualmente com o nome do arquivo
        try {
            const nomeArquivo = molde.imagem.split('/').pop();
            const file = new File([""], nomeArquivo, { type: "image/jpeg" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            if (inputImagem) inputImagem.files = dataTransfer.files;
        } catch(e) {
            console.log("Navegador não suporta DataTransfer para input file", e);
        }

    } else {
        if (btnRemoverFoto) {
            btnRemoverFoto.disabled = true;
        }
        if (inputImagem) inputImagem.value = '';
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
    // Verifica se existe arquivo e se tem tamanho > 0 (ignora o fake file de 0 bytes usado para exibir nome)
    if (fileInput.files.length > 0 && fileInput.files[0].size > 0) {
        formData.append('imagem', fileInput.files[0]);
    } else {
        // Se não tem arquivo novo ou é o fake, remove do formData para não enviar arquivo vazio
        formData.delete('imagem');
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

// Função para carregar equipamentos da API
async function carregarEquipamentos(targetId = null) {
    const container = document.getElementById('equipamentosContainer');
    // Spinner já está no HTML
    
    // Capturar todos os IDs abertos atualmente
    const openIds = [];
    if (container) {
        const activeItems = container.querySelectorAll('.equipment-item.active');
        activeItems.forEach(item => {
            // Extrair ID do onclick ou id do details
            const details = item.querySelector('.equipment-details');
            if (details && details.id) {
                const id = details.id.replace('details-', '');
                openIds.push(id);
            }
        });
    }

    // Se targetId for fornecido, garantir que ele esteja na lista de abertos
    if (targetId && !openIds.includes(String(targetId))) {
        openIds.push(String(targetId));
    }
    
    try {
        const response = await fetch('api/manutencao.php?action=list_equip');
        if (!response.ok) throw new Error('Erro ao carregar equipamentos');
        
        const data = await response.json();
        equipamentos = data;
        
        // Aplicar ordenação atual
        aplicarOrdenacao(openIds);
        
    } catch (error) {
        console.error('Erro:', error);
        if(container) container.innerHTML = '<div class="col-12 text-center text-danger">Erro ao carregar equipamentos. Tente novamente.</div>';
    }
}

function renderEquipamentos(openIds = []) {
    const container = document.getElementById('equipamentosContainer');
    if (!container) return;

    // Se openIds não for array (caso venha null/undefined), converte
    const idsAbertos = Array.isArray(openIds) ? openIds.map(String) : [];

    container.innerHTML = '';

    if (equipamentos.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5 w-100 text-muted">Nenhum equipamento cadastrado.</div>';
        return;
    }

    equipamentos.forEach(equip => {
        const item = document.createElement('div');
        // Se o ID deste equipamento estiver na lista de abertos, adiciona classe active
        const isActive = idsAbertos.includes(String(equip.id));
        const activeClass = isActive ? 'active' : '';
        
        item.className = `equipment-item ${equip.status.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "")} ${activeClass}`;
        
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
                <div class="maintenance-history mt-3">
                    <div class="table-container">
                        <table class="table table-striped table-hover align-middle mb-0">
                            <thead class="table-dark">
                                <tr>
                                    <th style="padding-left: 20px;">Data Inicial</th>
                                    <th>Data Retorno</th>
                                    <th>Tipo</th>
                                    <th>Observação</th>
                                    <th>Responsável</th>
                                    <th class="text-center">OS</th>
                                    <th class="text-center" style="padding-right: 20px;">Concluído</th>
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

                                    let badgeClass = 'bg-secondary text-white';
                                    if (m.tipo === 'Preventiva') badgeClass = 'bg-success text-dark preventiva1';
                                    else if (m.tipo === 'Corretiva') badgeClass = 'bg-warning corretiva1';
                                    else if (m.tipo === 'Preditiva') badgeClass = 'bg-info  preditiva1';

                                    return `
                                    <tr onclick="editarHistorico(${m.id}, event)" style="cursor: pointer;">
                                        <td style="padding-left: 20px;">${dataIni}</td>
                                        <td>${dataRet}</td>
                                        <td><span class="badge ${badgeClass}">${m.tipo}</span></td>
                                        <td>${m.observacao}</td>
                                        <td>${m.responsavel || '-'}</td>
                                        <td class="text-center" onclick="event.stopPropagation()">
                                            ${m.os ? `<a href="${m.os}" class="text-primary" title="Ver OS" target="_blank" download><i class="bi bi-clipboard2-check" style="font-size: 1.1rem;"></i></a>` : '-'}
                                        </td>
                                        <td class="text-center" style="padding-right: 20px;" onclick="event.stopPropagation()">
                                            <input type="checkbox" class="form-check-input" ${m.concluida ? 'checked' : ''} onchange="toggleConcluida(${m.id}, this.checked)">
                                        </td>
                                    </tr>
                                `}).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else {
            historyHtml = '<div class="empty-history alert alert-light text-center">Nenhuma manutenção registrada.</div>';
        }

        // Imagem do equipamento
        const imagemSrc = equip.imagem || '../assets/img/ferramentas/semfoto.png';
        
        // Estilo inline para max-height se estiver ativo
        const detailsStyle = isActive ? 'max-height: none;' : '';

        item.innerHTML = `
            <div class="equipment-header" onclick="toggleDetails(${equip.id})">
                <div class="equipment-name">
                    ${equip.nome}
                    <span class="equipment-status ${statusClass.includes('bg-') ? '' : statusClass} ${statusClass.includes('bg-') ? statusClass : ''}">${equip.status}</span>
                </div>
                <i class="bi bi-chevron-down equipment-toggle-icon" id="icon-${equip.id}"></i>
            </div>
            <div class="equipment-details" id="details-${equip.id}" style="${detailsStyle}">
                <div class="equipment-content-wrapper">
                    <div class="equipment-details-flex">
                    <div class="equipment-foto-grid">
                        <div class="equipment-image-container">
                            <img src="${imagemSrc}" alt="${equip.nome}" class="equipment-image" onerror="this.src='../assets/img/moldes/semfoto.png'">
                        </div>
                        <div class="mt-3">
                                <a href="javascript:void(0)" class="equipment-status ${statusClass.includes('bg-') ? '' : statusClass} ${statusClass.includes('bg-') ? statusClass : ''}" onclick="alterarStatus(${equip.id}, event)" style="text-decoration: none; display: inline-block;">
                                    ${equip.status} <i class="bi bi-arrow-repeat ms-1" style="font-size: 0.9em;"></i>
                                </a>
                            </div>
                            </div>
                        <div class="equipment-info-container" style="flex: 1;">
                            <div class="info-row-3">
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
                            </div>
                            
                            <div class="info-row-3 mt-3">
                                <div class="info-group">
                                    <span class="info-label">Nº Série</span>
                                    <span class="info-value">${equip.serie || '-'}</span>
                                </div>
                                <div class="info-group">
                                    <span class="info-label">Data Aquisição</span>
                                    <span class="info-value">${dataAq}</span>
                                </div>
                                <div class="info-group">
                                    <span class="info-label">Nº Nota Fiscal</span>
                                    <span class="info-value">${equip.nota_fiscal || '-'}</span>
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
                    

                    <div class="maintenance-section mt-4">
                        <h4>
                            Histórico de Manutenções
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-secondary" onclick="editarEquipamento(${equip.id})">
                                    <i class="bi bi-postcard"></i> Editar Dados
                                </button>
                                <button class="btn btn-sm btn-outline-primary btn_estaleirooff" onclick="addManutencao(${equip.id}, event)">
                                    <i class="bi bi-wrench-adjustable" style="margin-right: 5px;"></i> Registrar Manutenção
                                </button>
                            </div>
                        </h4>
                       


                        ${historyHtml}
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
    // Garantir comparação de tipos (id pode ser string ou number)
    const equip = equipamentos.find(e => e.id == id);
    if (!equip) {
        console.error('Equipamento não encontrado para edição:', id);
        return;
    }

    document.getElementById('equipamentoId').value = equip.id;
    document.getElementById('equipNome').value = equip.nome || '';
    document.getElementById('equipCodigo').value = equip.codigo || '';
    document.getElementById('equipFabricante').value = equip.fabricante || '';
    document.getElementById('equipModelo').value = equip.modelo || '';
    document.getElementById('equipSerie').value = equip.serie || '';
    document.getElementById('equipData').value = equip.data_aquisicao || '';
    document.getElementById('equipNotaFiscal').value = equip.nota_fiscal || '';
    document.getElementById('equipStatus').value = equip.status || 'Em uso';
    document.getElementById('equipDescricao').value = equip.descricao || '';
    document.getElementById('equipObservacao').value = equip.observacao || '';

    // Bloquear campos de nome e código na edição e aplicar estilo
    const nomeInput = document.getElementById('equipNome');
    const codigoInput = document.getElementById('equipCodigo');
    if(nomeInput) {
        nomeInput.readOnly = true;
        nomeInput.style.backgroundColor = '#e9ecef';
    }
    if(codigoInput) {
        codigoInput.readOnly = true;
        codigoInput.style.backgroundColor = '#e9ecef';
    }

    // Esconder botões de busca na edição
    const btnNome = document.getElementById('btnBuscaEquipNome');
    const btnCodigo = document.getElementById('btnBuscaEquipCodigo');
    if(btnNome) btnNome.style.display = 'none';
    if(btnCodigo) btnCodigo.style.display = 'none';

    // Resetar flag de remover imagem
    document.getElementById('removerImagemEquipFlag').value = '0';

    // Imagem
    const btnRemoverFoto = document.getElementById('btnRemoverFotoEquip');
    const inputImagem = document.getElementById('equipImagemInput');

    // Verificar se tem imagem válida (que não seja a padrão)
    if (equip.imagem && !equip.imagem.includes('semfoto.png')) {
        if (btnRemoverFoto) {
            btnRemoverFoto.disabled = false;
            btnRemoverFoto.title = "Remover foto atual";
        }
        
               try {
            const nomeArquivo = equip.imagem.split('/').pop();
            // Criar um arquivo fake apenas para exibir o nome
            const file = new File([""], nomeArquivo, { type: "image/jpeg" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            inputImagem.files = dataTransfer.files;
        } catch(e) {
            console.log("Navegador não suporta DataTransfer para input file", e);
        }

    } else {
        if (btnRemoverFoto) {
            btnRemoverFoto.disabled = true;
            btnRemoverFoto.title = "Nenhuma foto cadastrada";
        }
        // Limpar input
        inputImagem.value = '';
    }

    // Esconder container de busca ao editar
    const resultsContainer = document.getElementById('buscaEquipResultsContainer');
    if(resultsContainer) resultsContainer.style.display = 'none';

    document.getElementById('modalTitle').textContent = 'Editar Equipamento';
    const btnExcluir = document.getElementById('btnExcluirEquipamento');
    if(btnExcluir) btnExcluir.style.display = 'block';

    const modalEl = document.getElementById('modalEquipamento');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function salvarEquipamento() {
    const id = document.getElementById('equipamentoId').value;
    const nome = document.getElementById('equipNome').value;
    
    if (!nome) {
        alert('Nome é obrigatório');
        return;
    }

    // Validação de seleção na busca (apenas para NOVO equipamento)
    if (!id && !SELECTED_EQUIP_ITEM) {
        alert('Pesquise o equipamento para selecionar do inventário');
        return;
    }
    // Se selecionado, verificar se bate com o input (caso algo tenha mudado estranhamente)
    if (!id && SELECTED_EQUIP_ITEM && (SELECTED_EQUIP_ITEM.item !== nome && SELECTED_EQUIP_ITEM.codigo !== document.getElementById('equipCodigo').value)) {
         // Se o usuário conseguiu mudar o input sem limpar a seleção, algo está errado, mas vamos confiar na seleção ou bloquear.
         // Como está readonly, é difícil mudar.
    }

    const form = document.getElementById('formEquipamento');
    const formData = new FormData(form);
    formData.append('action', 'save_equip');

    // Imagem
    // No formEquipamento o input tem name="imagem", então o FormData já pega.
    // Mas precisamos verificar se é o arquivo fake.
    const fileInput = document.getElementById('equipImagemInput');
    if (fileInput.files.length > 0 && fileInput.files[0].size === 0) {
        // Arquivo fake (tamanho 0), remover do formData para não enviar
        formData.delete('imagem');
    }

    // Botão loading state
    const btnSalvar = document.getElementById('btnSalvarEquipamento');
    const originalText = btnSalvar.innerHTML;
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';

    try {
        const response = await fetch('api/manutencao.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Fechar modal
            const modalEl = document.getElementById('modalEquipamento');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            const targetId = id || result.id;
            // Recarregar lista, passando o ID para manter aberto
            await carregarEquipamentos(targetId);
            
            // Scroll para o item
            if (targetId) {
                 setTimeout(() => {
                    const newItem = document.getElementById(`details-${targetId}`)?.closest('.equipment-item');
                    if (newItem) newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }, 100);
            }
        } else {
            alert('Erro ao salvar: ' + (result.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão ao salvar.');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = originalText;
    }
}

async function excluirEquipamento() {
    const id = document.getElementById('equipamentoId').value;
    if (!id) return;

    if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;

    const btnExcluir = document.getElementById('btnExcluirEquipamento');
    const originalText = btnExcluir.innerHTML;
    btnExcluir.disabled = true;
    btnExcluir.innerHTML = 'Excluindo...';

    const formData = new FormData();
    formData.append('action', 'delete_equip');
    formData.append('id', id);

    try {
        const response = await fetch('api/manutencao.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Fechar modal
            const modalEl = document.getElementById('modalEquipamento');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            // Recarregar lista
            await carregarEquipamentos();
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

function addManutencao(id, event) {
    if(event) event.stopPropagation();
    
    // Limpar form
    document.getElementById('formHistorico').reset();
    document.getElementById('histEquipId').value = id;
    document.getElementById('histId').value = ''; // Reset ID
    document.getElementById('removerOSFlag').value = '0';
    
    // Resetar input file visualmente
    const btnRemoverOS = document.getElementById('btnRemoverOS');
    if (btnRemoverOS) btnRemoverOS.disabled = true;

    // Data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('histDataIni').value = today;

    // Botão Excluir escondido
    const btnExcluir = document.getElementById('btnExcluirHistorico');
    if(btnExcluir) btnExcluir.style.display = 'none';

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalHistorico'));
    modal.show();
}

function editarHistorico(id, event) {
    if(event) event.stopPropagation();

    // Encontrar a manutenção no array de equipamentos
    // Precisamos iterar sobre os equipamentos para achar a manutenção
    let manutencao = null;
    let equipId = null;

    for (const equip of equipamentos) {
        if (equip.manutencoes) {
            const found = equip.manutencoes.find(m => m.id == id);
            if (found) {
                manutencao = found;
                equipId = equip.id;
                break;
            }
        }
    }

    if (!manutencao) {
        console.error('Manutenção não encontrada:', id);
        return;
    }

    // Preencher formulário
    document.getElementById('histId').value = manutencao.id;
    document.getElementById('histEquipId').value = equipId;
    document.getElementById('histDataIni').value = manutencao.data_inicial || '';
    document.getElementById('histDataRet').value = manutencao.data_retorno || '';
    document.getElementById('histTipo').value = manutencao.tipo || 'Preventiva';
    document.getElementById('histResponsavel').value = manutencao.responsavel || '';
    document.getElementById('histObservacao').value = manutencao.observacao || '';
    document.getElementById('histConcluida').checked = manutencao.concluida;
    
    // Resetar flag remover OS
    document.getElementById('removerOSFlag').value = '0';
    
    // Lidar com arquivo OS
    const btnRemoverOS = document.getElementById('btnRemoverOS');
    const inputOS = document.getElementById('histOS');
    
    // Limpar input real primeiro
    inputOS.value = '';

    if (manutencao.os) {
        if (btnRemoverOS) btnRemoverOS.disabled = false;
        
        // Simular visualmente o arquivo
        try {
            const nomeArquivo = manutencao.os.split('/').pop();
            const file = new File([""], nomeArquivo, { type: "application/pdf" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            inputOS.files = dataTransfer.files;
        } catch(e) {
            console.log("Erro ao simular arquivo OS no input", e);
        }
    } else {
        if (btnRemoverOS) btnRemoverOS.disabled = true;
    }

    // Mostrar botão Excluir
    const btnExcluir = document.getElementById('btnExcluirHistorico');
    if(btnExcluir) btnExcluir.style.display = 'block';

    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modalHistorico'));
    modal.show();
}

async function excluirHistorico() {
    const id = document.getElementById('histId').value;
    if (!id) return;

    if (!confirm('Tem certeza que deseja excluir este registro de manutenção?')) return;

    const btnExcluir = document.getElementById('btnExcluirHistorico');
    const originalText = btnExcluir.innerHTML;
    btnExcluir.disabled = true;
    btnExcluir.innerHTML = 'Excluindo...';

    const formData = new FormData();
    formData.append('action', 'delete_history');
    formData.append('id', id);

    try {
        const response = await fetch('api/manutencao.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
             // Fechar modal
             const modalEl = document.getElementById('modalHistorico');
             const modalInstance = bootstrap.Modal.getInstance(modalEl);
             if (modalInstance) modalInstance.hide();
 
             // Recarregar lista
             const equipId = document.getElementById('histEquipId').value;
             await carregarEquipamentos(equipId);
             
             // Scroll
             if (equipId) {
                 setTimeout(() => {
                     const newItem = document.getElementById(`details-${equipId}`)?.closest('.equipment-item');
                     if (newItem) newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }, 100);
             }
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

async function salvarHistorico() {
    const form = document.getElementById('formHistorico');
    const formData = new FormData(form);
    formData.append('action', 'save_history');

    // Validação
    if(!document.getElementById('histDataIni').value) {
        alert('Data inicial é obrigatória');
        return;
    }

    const btnSalvar = document.getElementById('btnSalvarHistorico');
    const originalText = btnSalvar.innerHTML;
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';

    try {
        const response = await fetch('api/manutencao.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Fechar modal
            const modalEl = document.getElementById('modalHistorico');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            // Recarregar lista para atualizar histórico, mantendo aberto
            const equipId = document.getElementById('histEquipId').value;
            await carregarEquipamentos(equipId);
            
            if (equipId) {
                setTimeout(() => {
                    const newItem = document.getElementById(`details-${equipId}`)?.closest('.equipment-item');
                    if (newItem) newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        } else {
            alert('Erro ao salvar histórico: ' + (result.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão ao salvar histórico.');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = originalText;
    }
}

// Função para alternar o status de conclusão da manutenção
async function toggleConcluida(id, isChecked) {
    // isChecked vem como true/false
    const status = isChecked ? 1 : 0;
    
    try {
        const formData = new FormData();
        formData.append('action', 'update_history_status');
        formData.append('id', id);
        formData.append('is_concluida', status);

        const response = await fetch('api/manutencao.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (!result.success) {
            // Reverter checkbox em caso de erro
            const checkbox = document.querySelector(`input[onchange*="${id}"]`);
            if (checkbox) checkbox.checked = !isChecked;
            
            console.error('Erro ao atualizar status:', result.error);
            alert('Erro ao atualizar status: ' + (result.error || 'Erro desconhecido'));
        } else {
            // Sucesso - Opcional: mostrar feedback visual
            // Como o checkbox já mudou visualmente, não precisa fazer nada.
            // Mas é bom atualizar o estado local se necessário, ou apenas deixar quieto.
            // Se quisermos atualizar a lista global 'equipamentos', podemos:
            // Mas é um detalhe profundo. O usuário só quer que funcione.
        }

    } catch (error) {
        console.error('Erro de conexão:', error);
        // Reverter checkbox
        const checkbox = document.querySelector(`input[onchange*="${id}"]`);
        if (checkbox) checkbox.checked = !isChecked;
        alert('Erro de conexão ao atualizar status.');
    }
}

async function alterarStatus(id, event) {
    if(event) event.stopPropagation();
    
    const index = equipamentos.findIndex(e => e.id == id);
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

    // Persistir no backend
    try {
        const formData = new FormData();
        formData.append('action', 'update_status');
        formData.append('id', id);
        formData.append('status', newStatus);

        const response = await fetch('api/manutencao.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (!result.success) {
            console.error('Erro ao salvar status:', result.error);
            alert('Erro ao atualizar status. Recarregue a página.');
            return; // Não atualiza UI se falhou
        }

        // Sucesso: Atualizar estado local e UI
        equipamentos[index].status = newStatus;
        const equip = equipamentos[index];
        
        // ATUALIZAÇÃO PONTUAL DO DOM (sem re-renderizar tudo)
        const details = document.getElementById(`details-${id}`);
        if (details) {
            const item = details.closest('.equipment-item');
            if (item) {
                // 1. Atualizar classe do item principal
                const statusSlug = newStatus.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                item.className = `equipment-item ${statusSlug} active`; // Mantém active para não fechar

                // 2. Determinar classes de status
                let statusClass = 'bg-secondary text-white';
                if (newStatus === 'Em uso') statusClass = 'em-uso';
                else if (newStatus === 'Em manutenção') statusClass = 'em-manutencao';
                else if (newStatus === 'Fora de serviço') statusClass = 'bg-danger text-white';

                // 3. Atualizar badges de status (no header e no detalhe)
                const badges = item.querySelectorAll('.equipment-status');
                badges.forEach(badge => {
                    badge.className = `equipment-status ${statusClass.includes('bg-') ? '' : statusClass} ${statusClass.includes('bg-') ? statusClass : ''}`;
                    // Preservar o ícone se for o badge de link (dentro do detalhe)
                    if (badge.tagName === 'A') {
                        badge.innerHTML = `${newStatus} <i class="bi bi-arrow-repeat ms-1" style="font-size: 0.9em;"></i>`;
                    } else {
                        badge.textContent = newStatus;
                    }
                });
            }
        }

    } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Erro de conexão ao atualizar status.');
    }
}
