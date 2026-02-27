/**
 * Módulo de Funções Auxiliares e de Interface do Usuário (UI)
 * 
 * Este arquivo contém as funções responsáveis pela manipulação do DOM,
 * inicialização de eventos (como clique e drag-and-drop), controle de modais
 * e outras interações visuais.
 * 
 * As funções de API e manipulação de dados de estado globais (boats, preBoats, completedBoats)
 * são definidas em controller.js.
 */

// ============================================================================
// VARIÁVEIS GLOBAIS DE ESTADO (Necessárias para funções de UI)
// ============================================================================
// As variáveis de estado (boats, completedBoats, preBoats, boatPositions)
// são definidas em controller.js, mas precisam ser acessíveis aqui.
// Assumimos que este arquivo é carregado após controller.js ou que as variáveis
// são globais no escopo do navegador.
let currentEditingBoat = null;
let selectedBoat = null;

// ============================================================================
// FUNÇÕES DE INICIALIZAÇÃO E EVENTOS GERAIS
// ============================================================================

/**
 * Inicializa o sistema, configurando event listeners para botões e UI.
 * 
 * Propósito: Configurar a UI para responder a interações do usuário.
 * 
 * Exemplo de Uso:
 * document.addEventListener('DOMContentLoaded', initializeSystem);
 */
function initializeSystem() {
  // Modal save button
  const saveBtn = document.getElementById('saveBoatBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveBoat);
  
  // Modal delete button
  const deleteBtn = document.getElementById('deleteBoatBtn');
  if (deleteBtn) deleteBtn.addEventListener('click', deleteBoat);
  
  // Progress slider
  const progressSlider = document.getElementById('boatProgress');
  if (progressSlider) {
    progressSlider.addEventListener('input', function() {
      const progressValue = document.getElementById('progressValue');
      if (progressValue) progressValue.textContent = this.value + '%';
      var bar = document.getElementById('progressBar');
      if (bar) {
        bar.style.width = this.value + '%';
        bar.setAttribute('aria-valuenow', this.value);
      }
    });
  }

  // Fallback for cancel/close buttons when Bootstrap data-api is not active
  document.querySelectorAll('#boatModal [data-dismiss="modal"], #boatModal [data-bs-dismiss="modal"]').forEach(btn => {
    btn.addEventListener('click', hideModal);
  });

  // Selection panel buttons
  const editBtn = document.getElementById('editBoatBtn');
  if (editBtn) editBtn.addEventListener('click', openEditBoatModal);
  const docsBtn = document.getElementById('viewDocsBtn');
  if (docsBtn) docsBtn.addEventListener('click', openBoatDocumentation);

  // Initialize drag and drop for all slots
  initializeDragAndDrop();
  
  // Initialize completed projects drag and drop
  initializeCompletedProjectsDragDrop();

  // Initialize pre-projects drag and drop
  initializePreProjectsDragDrop();

  // Hook Pre-projects create button
  const createPreBtn = document.getElementById('createPreProjectBtn');
  if (createPreBtn) {
    createPreBtn.addEventListener('click', function() {
      openAddBoatModal();
      document.getElementById('boatModal').dataset.createInPreProject = 'true';
    });
  }
}

/**
 * Lógica de inicialização do sistema (DOMContentLoad).
 * 
 * Propósito: Iniciar a aplicação após o carregamento completo do DOM e dos dados.
 * 
 * Exemplo de Uso:
 * document.addEventListener('DOMContentLoaded', function() { ... });
 */
document.addEventListener('DOMContentLoaded', function() {
  const isEstaleiroPage = !!document.querySelector('.boat-slot') || !!document.getElementById('boatModal');
  if (isEstaleiroPage) {
    initializeSystem();
    // Funções de API em controller.js
    initializeData()
      .then(() => { loadBoats(); updateCounters(); })
      .catch(e => console.error("Falha na inicialização de dados:", e));
  }
});

// ============================================================================
// FUNÇÕES DE DRAG AND DROP
// ============================================================================

/**
 * Inicializa a funcionalidade de Drag and Drop para os slots do estaleiro.
 * 
 * Eventos Tratados:
 * - 'click' no slot: Seleciona o barco ou abre o modal de adição.
 * - 'dragover' no slot: Permite o drop, adiciona classe 'drag-over'.
 * - 'drop' no slot: Executa a lógica de movimentação do barco.
 * - 'dragleave' no slot: Remove classe 'drag-over'.
 * - 'click' no documento: Desseleciona o barco, se o clique não for em um slot ou painel de seleção.
 * 
 * Exemplo de Uso:
 * initializeDragAndDrop(); // Chamado dentro de initializeSystem
 */
function initializeDragAndDrop() {
  const slots = document.querySelectorAll('.boat-slot');
  
  slots.forEach(slot => {
    // Click event for slots
    slot.addEventListener('click', function(e) {
      e.stopPropagation();
      const boatId = this.dataset.boatId;
      if (boatId) {
        selectBoat(boatId);
      } else {
        openAddBoatModal(this.dataset.warehouse, this.dataset.slot);
      }
    });

    // Drag and drop events
    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('drop', handleDrop);
    slot.addEventListener('dragleave', handleDragLeave);
  });

  // Click outside to deselect
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.boat-slot') && !e.target.closest('.boat-selection-panel')) {
      deselectBoat();
    }
  });
}

/**
 * Inicializa a funcionalidade de Drag and Drop para o container de Concluídos.
 * 
 * Eventos Tratados:
 * - 'dragover': Permite o drop, adiciona classe 'drag-over'.
 * - 'drop': Executa a lógica de movimentação para o status 'Concluídos' via API.
 * - 'dragleave': Remove classe 'drag-over'.
 * 
 * Exemplo de Uso:
 * initializeCompletedProjectsDragDrop(); // Chamado dentro de initializeSystem
 */
function initializeCompletedProjectsDragDrop() {
  const completedContainer = document.getElementById('completedBoatsContainer');
  if (!completedContainer) return;
  
  completedContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });
  
  completedContainer.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const boatId = e.dataTransfer.getData('text/plain');
    const boat = boats.find(b => b.id === boatId);
    
    if (boat) {
      (async () => {
        try {
          // moveBoatInDB é do controller.js
          await moveBoatInDB(boat.id, 'Concluídos');
          
          // Lógica de atualização de estado local
          const boatIndex = boats.findIndex(b => b.id === boatId);
          if (boatIndex > -1) {
            const completedBoat = boats.splice(boatIndex, 1)[0];
            completedBoat.progress = 100;
            completedBoats.push(completedBoat);
            loadBoats();
            updateCounters();
            deselectBoat();
          }
        } catch (e) {
          alert('Falha ao mover para Concluídos: ' + e.message);
        }
      })();
    }
  });
  
  completedContainer.addEventListener('dragleave', function() {
    this.classList.remove('drag-over');
  });
}

/**
 * Inicializa a funcionalidade de Drag and Drop para o container de Pré-Projetos.
 * 
 * Eventos Tratados:
 * - 'dragover': Permite o drop, adiciona classe 'drag-over'.
 * - 'drop': Executa a lógica de movimentação de/para Pré-Projetos.
 * - 'dragleave': Remove classe 'drag-over'.
 * 
 * Exemplo de Uso:
 * initializePreProjectsDragDrop(); // Chamado dentro de initializeSystem
 */
function initializePreProjectsDragDrop() {
  const preContainer = document.getElementById('preProjectsContainer');
  if (!preContainer) return;
  
  preContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });
  
  preContainer.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const boatId = e.dataTransfer.getData('text/plain');
    
    // Move from warehouse to pre-projects (Não usa API, apenas manipulação local)
    const boatFromWarehouse = boats.find(b => b.id === boatId);
    if (boatFromWarehouse) {
      const idx = boats.findIndex(b => b.id === boatId);
      if (idx > -1) {
        const moved = boats.splice(idx, 1)[0];
        delete moved.warehouse;
        delete moved.slot;
        preBoats.push(moved);
        saveBoatsToStorage(); // Função de controller.js
        loadBoats();
        updateCounters();
        deselectBoat();
      }
      return;
    }
    
    // Move from completed to pre-projects (Não usa API, apenas manipulação local)
    const completedIdx = completedBoats.findIndex(b => b.id === boatId);
    if (completedIdx > -1) {
      const moved = completedBoats.splice(completedIdx, 1)[0];
      preBoats.push(moved);
      saveBoatsToStorage(); // Função de controller.js
      loadBoats();
      updateCounters();
      return;
    }
  });
  
  preContainer.addEventListener('dragleave', function() {
    this.classList.remove('drag-over');
  });
}

/**
 * Handler para o evento 'dragstart'.
 * 
 * Propósito: Iniciar o processo de arrastar, definindo o ID do barco no dataTransfer.
 * @param {Event} e - O evento dragstart.
 * @param {string} boatId - O ID do barco que está sendo arrastado.
 * 
 * Exemplo de Uso:
 * slot.addEventListener('dragstart', (e) => handleDragStart(e, boat.id));
 */
function handleDragStart(e, boatId) {
  e.dataTransfer.setData('text/plain', boatId);
  e.currentTarget.classList.add('dragging');
}

/**
 * Handler para o evento 'dragend'.
 * 
 * Propósito: Limpar o estado visual após o término do arrasto.
 * @param {Event} e - O evento dragend.
 * 
 * Exemplo de Uso:
 * slot.addEventListener('dragend', handleDragEnd);
 */
function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
}

/**
 * Handler para o evento 'dragover'.
 * 
 * Propósito: Permitir que um elemento seja dropado na área, e fornecer feedback visual.
 * @param {Event} e - O evento dragover.
 * 
 * Exemplo de Uso:
 * slot.addEventListener('dragover', handleDragOver);
 */
function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

/**
 * Handler para o evento 'dragleave'.
 * 
 * Propósito: Remover o feedback visual quando o elemento arrastado sai da área de drop.
 * @param {Event} e - O evento dragleave.
 * 
 * Exemplo de Uso:
 * slot.addEventListener('dragleave', handleDragLeave);
 */
function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

/**
 * Handler para o evento 'drop'.
 * 
 * Propósito: Finalizar o drop, movendo o barco para o novo slot (e atualizando a API).
 * @param {Event} e - O evento drop.
 * 
 * Exemplo de Uso:
 * slot.addEventListener('drop', handleDrop);
 */
function handleDrop(e) {
  e.preventDefault();
  const slot = e.currentTarget;
  slot.classList.remove('drag-over');
  
  const boatId = e.dataTransfer.getData('text/plain');
  const localNome = localKeyToNome(slot.dataset.warehouse); // Função de controller.js
  const numero = slot.dataset.slot;

  // 1. Mover de Pré-Projeto para o Slot
  const preBoat = preBoats.find(b => b.id === boatId);
  if (preBoat && !slot.dataset.boatId) {
    const preIndex = preBoats.findIndex(b => b.id === boatId);
    if (preIndex > -1) {
      (async () => {
        try {
          // Cria o barco na API se ainda não tiver ID de barco real
          if (!boats.find(b => b.id === preBoat.id)) {
            const created = await apiRequest('criar_barco', { numero_serie: preBoat.codigo, cliente_nome: preBoat.cliente, modelo: preBoat.modelo, status_producao: preBoat.progress || 0 }); // apiRequest é de controller.js
            preBoat.id = String(created.id);
          }
          // Move o barco na API
          await moveBoatInDB(preBoat.id, localNome, numero); // moveBoatInDB é de controller.js
          
          // Atualiza estado local
          const boat = preBoats.splice(preIndex, 1)[0];
          boat.warehouse = slot.dataset.warehouse; boat.slot = numero;
          boats.push(boat);
          loadBoats(); updateCounters();
        } catch (e) {
          alert('Falha ao mover de Pré-Projetos: ' + e.message);
        }
      })();
    }
    return;
  }

  // 2. Mover de Slot para Slot
  const boat = boats.find(b => b.id === boatId);
  if (boat && !slot.dataset.boatId) {
    (async () => {
      try {
        await moveBoatInDB(boat.id, localNome, numero); // moveBoatInDB é de controller.js
        boat.warehouse = slot.dataset.warehouse; boat.slot = numero;
        loadBoats();
      } catch (e) {
        alert('Falha ao mover barco: ' + e.message);
      }
    })();
  }
}

// ============================================================================
// FUNÇÕES DE SELEÇÃO E PAINEL LATERAL
// ============================================================================

/**
 * Seleciona um barco, destacando-o visualmente e atualizando o painel lateral.
 * @param {string} boatId - O ID do barco a ser selecionado.
 * 
 * Exemplo de Uso:
 * selectBoat('1');
 */
function selectBoat(boatId) {
  // Seleciona de qualquer lista (galpões, pré-projetos, concluídos)
  const boat = boats.find(b => b.id === boatId) || preBoats.find(b => b.id === boatId) || completedBoats.find(b => b.id === boatId);
  if (!boat) return;

  selectedBoat = boat;
  
  // Remove a seleção de todos os slots
  document.querySelectorAll('.boat-slot, .pre-boat, .completed-boat').forEach(el => el.classList.remove('selected'));
  
  // Adiciona a seleção ao elemento correspondente
  const slotEl = document.querySelector(`[data-boat-id="${boatId}"]`);
  if (slotEl) slotEl.classList.add('selected');

  // Atualiza o painel de seleção
  updateSelectionPanel(boat);
}

/**
 * Desseleciona o barco atualmente selecionado e oculta o painel lateral.
 * 
 * Exemplo de Uso:
 * deselectBoat();
 */
function deselectBoat() {
  selectedBoat = null;
  document.querySelectorAll('.boat-slot, .pre-boat, .completed-boat').forEach(el => el.classList.remove('selected'));
  document.getElementById('boatSelectionPanel').classList.add('d-none');
}

/**
 * Atualiza o conteúdo do painel lateral de seleção com os dados do barco.
 * @param {object} boat - O objeto do barco selecionado.
 * 
 * Exemplo de Uso:
 * updateSelectionPanel(selectedBoat);
 */
function updateSelectionPanel(boat) {
  const panel = document.getElementById('boatSelectionPanel');
  if (!panel) return;

  // Atualiza os campos do painel
  document.getElementById('selectedBoatCode').textContent = boat.codigo || 'N/A';
  document.getElementById('selectedBoatModel').textContent = boat.modelo || 'N/A';
  document.getElementById('selectedBoatClient').textContent = boat.cliente || 'N/A';
  document.getElementById('selectedBoatProgress').textContent = (boat.progress || 0) + '%';
  document.getElementById('selectedBoatCreated').textContent = boat.criado_em ? new Date(boat.criado_em).toLocaleDateString() : 'N/A';
  
  // Mostra a localização, se existir
  const location = boat.warehouse ? localKeyToNome(boat.warehouse) + (boat.slot ? ` (Vaga ${boat.slot})` : '') : 'Pré-Projeto / Concluído';
  document.getElementById('selectedBoatLocation').textContent = location;

  // Mostra o painel
  panel.classList.remove('d-none');
}

// ============================================================================
// FUNÇÕES DE CONTROLE DE MODAIS
// ============================================================================

/**
 * Abre o modal para adicionar um novo barco.
 * @param {string} [warehouse] - O galpão pré-selecionado.
 * @param {string} [slot] - O slot pré-selecionado.
 * 
 * Exemplo de Uso:
 * openAddBoatModal('laminacao', 1);
 */
function openAddBoatModal(warehouse, slot) {
  currentEditingBoat = null;
  const modalEl = document.getElementById('boatModal');
  if (!modalEl) return;

  // 1. Limpar e configurar campos
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) modalTitle.textContent = 'Adicionar Novo Barco';
  const boatId = document.getElementById('boatId');
  if (boatId) boatId.value = '';
  const boatCode = document.getElementById('boatCode');
  if (boatCode) boatCode.value = '';
  const boatModel = document.getElementById('boatModel');
  if (boatModel) boatModel.value = '';
  const boatClient = document.getElementById('boatClient');
  if (boatClient) boatClient.value = '';
  const boatProgress = document.getElementById('boatProgress');
  if (boatProgress) boatProgress.value = 0;
  const progressValue = document.getElementById('progressValue');
  if (progressValue) progressValue.textContent = '0%';
  const progressBar = document.getElementById('progressBar');
  if (progressBar) progressBar.style.width = '0%';
  const deleteBoatBtn = document.getElementById('deleteBoatBtn');
  if (deleteBoatBtn) deleteBoatBtn.classList.add('d-none');
  
  // 2. Preencher slot de origem (se houver)
  modalEl.dataset.targetWarehouse = warehouse || '';
  modalEl.dataset.targetSlot = slot || '';
  modalEl.dataset.createInPreProject = '';

  // 3. Abrir modal
  if (typeof bootstrap !== 'undefined') {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } else {
    modalEl.style.display = 'block';
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.classList.add('show');
  }
}

/**
 * Abre o modal para editar o barco atualmente selecionado.
 * 
 * Exemplo de Uso:
 * openEditBoatModal(); // Chamado a partir do painel de seleção
 */
function openEditBoatModal() {
  if (!selectedBoat) return;
  currentEditingBoat = selectedBoat;
  const modalEl = document.getElementById('boatModal');
  if (!modalEl) return;

  // 1. Configurar campos com dados do barco
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) modalTitle.textContent = 'Editar Barco';
  const boatId = document.getElementById('boatId');
  if (boatId) boatId.value = currentEditingBoat.id;
  const boatCode = document.getElementById('boatCode');
  if (boatCode) boatCode.value = currentEditingBoat.codigo || '';
  const boatModel = document.getElementById('boatModel');
  if (boatModel) boatModel.value = currentEditingBoat.modelo || '';
  const boatClient = document.getElementById('boatClient');
  if (boatClient) boatClient.value = currentEditingBoat.cliente || '';
  const boatProgress = document.getElementById('boatProgress');
  if (boatProgress) boatProgress.value = currentEditingBoat.progress || 0;
  
  // Atualizar barra de progresso
  const progress = currentEditingBoat.progress || 0;
  const progressValue = document.getElementById('progressValue');
  if (progressValue) progressValue.textContent = progress + '%';
  const progressBar = document.getElementById('progressBar');
  if (progressBar) progressBar.style.width = progress + '%';
  
  // Mostrar botão de deletar
  const deleteBoatBtn = document.getElementById('deleteBoatBtn');
  if (deleteBoatBtn) deleteBoatBtn.classList.remove('d-none');
  
  // 2. Limpar slot de origem
  modalEl.dataset.targetWarehouse = '';
  modalEl.dataset.targetSlot = '';
  modalEl.dataset.createInPreProject = '';

  // 3. Abrir modal
  if (typeof bootstrap !== 'undefined') {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } else {
    modalEl.style.display = 'block';
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.classList.add('show');
  }
}

/**
 * Fecha o modal de barco.
 * 
 * Exemplo de Uso:
 * hideModal(); // Chamado por botões de fechar
 */
function hideModal() {
  const modalEl = document.getElementById('boatModal');
  if (!modalEl) return;

  if (typeof bootstrap !== 'undefined') {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  } else {
    modalEl.style.display = 'none';
    modalEl.removeAttribute('aria-modal');
    modalEl.classList.remove('show');
  }
}

// ============================================================================
// FUNÇÕES DE MANIPULAÇÃO DE DADOS (Chamando controller.js)
// ============================================================================

/**
 * Salva um barco (cria ou edita) a partir dos dados do modal.
 * 
 * Propósito: Coletar dados do modal, chamar a função de API e atualizar a UI.
 * 
 * Exemplo de Uso:
 * document.getElementById('saveBoatBtn').addEventListener('click', saveBoat);
 */
async function saveBoat() {
  const modalEl = document.getElementById('boatModal');
  const boatIdEl = document.getElementById('boatId');
  const boatId = boatIdEl ? boatIdEl.value : '';
  const boatCodeEl = document.getElementById('boatCode');
  const boatCode = boatCodeEl ? boatCodeEl.value.trim() : '';
  const boatModelEl = document.getElementById('boatModel');
  const boatModel = boatModelEl ? boatModelEl.value.trim() : '';
  const boatClientEl = document.getElementById('boatClient');
  const boatClient = boatClientEl ? boatClientEl.value.trim() : '';
  const boatProgressEl = document.getElementById('boatProgress');
  const boatProgress = boatProgressEl ? parseInt(boatProgressEl.value, 10) : 0;
  const targetWarehouse = modalEl.dataset.targetWarehouse;
  const targetSlot = modalEl.dataset.targetSlot;
  const createInPreProject = modalEl.dataset.createInPreProject === 'true';

  if (!boatCode || !boatModel) {
    alert('Código e Modelo são obrigatórios.');
    return;
  }

  const newBoatData = {
    id: boatId && !boatId.startsWith('pre-') ? boatId : null,
    codigo: boatCode,
    modelo: boatModel,
    cliente: boatClient,
    progress: boatProgress
  };

  try {
    if (createInPreProject) {
      // Criação local de pré-projeto (sem API)
      const newId = 'pre-' + Date.now();
      const newBoat = { ...newBoatData, id: newId };
      preBoats.push(newBoat);
      saveBoatsToStorage(); // Função de controller.js
    } else if (!boatId || boatId.startsWith('pre-')) {
      // Criação de barco (com API)
      const created = await saveBoatToAPI(newBoatData); // saveBoatToAPI é de controller.js
      const newBoat = { ...newBoatData, id: String(created.id), criado_em: new Date().toISOString() };
      
      if (targetWarehouse && targetSlot) {
        // Se foi criado a partir de um slot vazio, move para lá
        await moveBoatInDB(newBoat.id, localKeyToNome(targetWarehouse), targetSlot); // moveBoatInDB é de controller.js
        newBoat.warehouse = targetWarehouse;
        newBoat.slot = targetSlot;
        boats.push(newBoat);
      } else {
        // Se não foi criado em um slot, vai para pré-projetos ou precisa de um slot
        const avail = findAvailableSlot(); // findAvailableSlot é de controller.js
        if (avail) {
          await moveBoatInDB(newBoat.id, localKeyToNome(avail.warehouse), avail.slot); // moveBoatInDB é de controller.js
          newBoat.warehouse = avail.warehouse;
          newBoat.slot = avail.slot;
          boats.push(newBoat);
        } else {
          // Se não há slot, vai para pré-projetos
          preBoats.push(newBoat);
        }
      }
    } else {
      // Edição de barco existente (com API)
      const isPre = preBoats.some(b => b.id === boatId);
      if (isPre) {
        // Edição local de pré-projeto
        const idx = preBoats.findIndex(b => b.id === boatId);
        if (idx > -1) {
          preBoats[idx] = { ...preBoats[idx], ...newBoatData };
          saveBoatsToStorage(); // Função de controller.js
        }
      } else {
        // Edição de barco em produção/concluído
        await saveBoatToAPI(newBoatData); // saveBoatToAPI é de controller.js
        
        // Atualiza o estado local
        const targetList = boats.find(b => b.id === boatId) ? boats : completedBoats;
        const idx = targetList.findIndex(b => b.id === boatId);
        if (idx > -1) {
          targetList[idx] = { ...targetList[idx], ...newBoatData };
        }
      }
    }

    hideModal();
    loadBoats();
    updateCounters();
    deselectBoat();
    alert('Barco salvo com sucesso!');

  } catch (e) {
    alert('Falha ao salvar barco: ' + e.message);
  }
}

/**
 * Deleta o barco atualmente em edição.
 * 
 * Propósito: Chamar a função de API para deletar e atualizar a UI.
 * 
 * Exemplo de Uso:
 * document.getElementById('deleteBoatBtn').addEventListener('click', deleteBoat);
 */
async function deleteBoat() {
  if (!currentEditingBoat || !confirm(`Tem certeza que deseja deletar o barco ${currentEditingBoat.codigo || 'sem código'}?`)) {
    return;
  }

  const boatId = currentEditingBoat.id;

  try {
    const isPre = preBoats.some(b => b.id === boatId);
    
    if (isPre) {
      // Deletar localmente (pré-projeto)
      const idx = preBoats.findIndex(b => b.id === boatId);
      if (idx > -1) preBoats.splice(idx, 1);
      saveBoatsToStorage(); // Função de controller.js
    } else {
      // Deletar via API (barco real)
      await deleteBoatFromAPI(boatId); // deleteBoatFromAPI é de controller.js
      
      // Remove do estado local
      let idx = boats.findIndex(b => b.id === boatId);
      if (idx > -1) boats.splice(idx, 1);
      
      idx = completedBoats.findIndex(b => b.id === boatId);
      if (idx > -1) completedBoats.splice(idx, 1);
    }

    hideModal();
    loadBoats();
    updateCounters();
    deselectBoat();
    alert('Barco deletado com sucesso!');

  } catch (e) {
    alert('Falha ao deletar barco: ' + e.message);
  }
}

/**
 * Abre a documentação do barco selecionado (função mock).
 * 
 * Propósito: Simular a navegação para a documentação.
 * 
 * Exemplo de Uso:
 * document.getElementById('viewDocsBtn').addEventListener('click', openBoatDocumentation);
 */
function openBoatDocumentation() {
  if (!selectedBoat) return;
  alert(`Abrindo documentação para o barco: ${selectedBoat.codigo} - ${selectedBoat.modelo}`);
  // Lógica real de navegação/abertura de modal de docs iria aqui.
}

// ============================================================================
// FUNÇÕES DE RENDERIZAÇÃO E ATUALIZAÇÃO DA UI
// ============================================================================

/**
 * Carrega e renderiza os barcos nos slots do estaleiro.
 * 
 * Propósito: Atualizar visualmente o estado dos slots baseado na variável global 'boats'.
 * 
 * Exemplo de Uso:
 * loadBoats();
 */
function loadBoats() {
  // Clear all slots first
  document.querySelectorAll('.boat-slot').forEach(slot => {
    slot.classList.remove('occupied', 'selected');
    slot.removeAttribute('data-boat-id');
    slot.removeAttribute('draggable');
    // Mostrar número da vaga acima do botão de adicionar
    slot.innerHTML = `<div class="slot-number">Vaga ${slot.dataset.slot}</div><div class="slot-content"><i class="bi bi-plus-circle add-icon"></i><span>Clique para adicionar</span></div>`;
  });

  // Load boats into slots
  boats.forEach(boat => {
    const slot = document.querySelector(`[data-warehouse="${boat.warehouse}"][data-slot="${boat.slot}"]`);
    if (slot) {
      slot.classList.add('occupied');
      slot.dataset.boatId = boat.id;
      slot.draggable = true;
      
      // Add drag events
      slot.addEventListener('dragstart', function(e) {
        handleDragStart(e, boat.id);
      });
      
      slot.addEventListener('dragend', handleDragEnd);

      slot.innerHTML = `
        <div class="slot-content">
          <div class="slot-number">Vaga ${boat.slot}</div>
          <i class="bi bi-arrows-move move-icon"></i>
          <i class="bi bi-anchor boat-anchor"></i>
          <div class="boat-info">
            <div class="boat-model">${boat.modelo || 'Modelo não informado'}</div>
            <div class="boat-code">${boat.codigo || 'Número de série não informado'}</div>
            <div class="boat-progress">${boat.progress || 0}% concluído</div>
          </div>
        </div>
        <div class="slot-overlay">
          <div class="overlay-grid">
            <i class="bi bi-pencil-square overlay-icon edit-icon" title="Editar"></i>
            <div class="overlay-spacer"></div>
            <i class="bi bi-clipboard-check overlay-icon docs-icon" title="Ver Documentação"></i>
          </div>
        </div>
      `;

      // Eventos dos botões do overlay (evitar propagação para seleção errada)
      const editIcon = slot.querySelector('.edit-icon');
      const docsIcon = slot.querySelector('.docs-icon');
      if (editIcon) {
        editIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boat.id);
          openEditBoatModal();
        });
      }
      if (docsIcon) {
        docsIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boat.id);
          openBoatDocumentation();
        });
      }
    }
  });

  // Update occupied slot counters
  updateOccupiedCounters();
  
  // Load completed boats
  loadCompletedBoats();
  
  // Load pre-project boats
  loadPreBoats();
}

/**
 * Renderiza os barcos concluídos no container lateral.
 * 
 * Propósito: Atualizar visualmente o container de barcos concluídos.
 * 
 * Exemplo de Uso:
 * loadCompletedBoats();
 */
function loadCompletedBoats() {
  const container = document.getElementById('completedBoatsContainer');
  if (!container) return;
  
  if (completedBoats.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>Nenhum projeto concluído ainda</p>
      </div>
    `;
  } else {
    container.innerHTML = completedBoats.map(boat => `
      <div class="completed-boat" draggable="true" data-boat-id="${boat.id}">
        <i class="bi bi-check-circle" style="font-size: 1.2rem; margin-bottom: 8px;"></i>
        <div class="boat-code">${boat.codigo || 'N/A'}</div>
        <div class="boat-model">${boat.modelo || 'N/A'}</div>
        <div class="overlay-grid" style="margin-top: 6px;">
          <i class="bi bi-pencil-square overlay-icon edit-icon" title="Editar"></i>
          <div class="overlay-spacer"></div>
          <i class="bi bi-clipboard-check overlay-icon docs-icon" title="Ver Documentação"></i>
        </div>
      </div>
    `).join('');
    
    // Habilitar rolagem quando houver mais de 4 cartões
    const cardCountCompleted = container.querySelectorAll('.completed-boat').length;
    if (cardCountCompleted > 4) { container.classList.add('scrollable'); } else { container.classList.remove('scrollable'); }
    
    // Eventos: drag e cliques nos ícones
    container.querySelectorAll('.completed-boat').forEach(el => {
      el.addEventListener('dragstart', function(e) {
        handleDragStart(e, this.dataset.boatId);
      });
      el.addEventListener('dragend', handleDragEnd);
      
      const boatId = el.dataset.boatId;
      const editIcon = el.querySelector('.edit-icon');
      const docsIcon = el.querySelector('.docs-icon');
      if (editIcon) {
        editIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boatId);
          openEditBoatModal();
        });
      }
      if (docsIcon) {
        docsIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boatId);
          openBoatDocumentation();
        });
      }
    });
  }
}

/**
 * Renderiza os pré-projetos no container lateral.
 * 
 * Propósito: Atualizar visualmente o container de pré-projetos.
 * 
 * Exemplo de Uso:
 * loadPreBoats();
 */
function loadPreBoats() {
  const container = document.getElementById('preProjectsContainer');
  if (!container) return;
  
  if (preBoats.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>Nenhum pré-projeto no momento</p>
      </div>
    `;
    // Remover rolagem quando vazio
    container.classList.remove('scrollable');
  } else {
    container.innerHTML = preBoats.map(boat => `
      <div class="pre-boat" draggable="true" data-boat-id="${boat.id}">
        <i class="bi bi-lightbulb" style="font-size: 1.2rem; margin-bottom: 8px;"></i>
        <div class="boat-code">${boat.codigo || 'N/A'}</div>
        <div class="boat-model">${boat.modelo || 'N/A'}</div>
        <div class="overlay-grid" style="margin-top: 6px;">
          <i class="bi bi-pencil-square overlay-icon edit-icon" title="Editar"></i>
          <div class="overlay-spacer"></div>
          <i class="bi bi-clipboard-check overlay-icon docs-icon" title="Ver Documentação"></i>
        </div>
      </div>
    `).join('');
    
    // Habilitar rolagem quando houver mais de 4 cartões
    const cardCountPre = container.querySelectorAll('.pre-boat').length;
    if (cardCountPre > 4) { container.classList.add('scrollable'); } else { container.classList.remove('scrollable'); }
    
    // Eventos: drag e cliques nos ícones
    container.querySelectorAll('.pre-boat').forEach(preBoatEl => {
      preBoatEl.addEventListener('dragstart', function(e) {
        handleDragStart(e, this.dataset.boatId);
      });
      preBoatEl.addEventListener('dragend', handleDragEnd);
      
      // Ícones de ação
      const boatId = preBoatEl.dataset.boatId;
      const editIcon = preBoatEl.querySelector('.edit-icon');
      const docsIcon = preBoatEl.querySelector('.docs-icon');
      if (editIcon) {
        editIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boatId);
          openEditBoatModal();
        });
      }
      if (docsIcon) {
        docsIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          selectBoat(boatId);
          openBoatDocumentation();
        });
      }
    });
  }
}

/**
 * Atualiza os contadores de barcos totais e concluídos.
 * 
 * Propósito: Manter os indicadores numéricos da UI atualizados.
 * 
 * Exemplo de Uso:
 * updateCounters();
 */
function updateCounters() {
  const totalEl = document.getElementById('totalBoats');
  const completedEl = document.getElementById('completedBoats');
  if (totalEl) totalEl.textContent = boats.length;
  if (completedEl) completedEl.textContent = completedBoats.length;
}

/**
 * Atualiza os contadores de slots ocupados por galpão.
 * 
 * Propósito: Manter os indicadores numéricos de ocupação atualizados.
 * 
 * Exemplo de Uso:
 * updateOccupiedCounters();
 */
function updateOccupiedCounters() {
  const laminacaoOccupied = boats.filter(b => b.warehouse === 'laminacao').length;
  const montagemOccupied = boats.filter(b => b.warehouse === 'montagem').length;
  const lamEl = document.getElementById('laminacaoOccupied');
  const montEl = document.getElementById('montagemOccupied');
  if (lamEl) lamEl.textContent = laminacaoOccupied;
  if (montEl) montEl.textContent = montagemOccupied;
}

// ============================================================================
// FUNÇÕES MIGRARAM DE INICIO.HTML (Quadro de Anotações)
// ============================================================================

/**
 * Obtém as notas salvas no localStorage.
 * @returns {Array<object>} Lista de notas.
 * 
 * Exemplo de Uso:
 * const notas = getNotes();
 */
function getNotes() {
  try {
    const raw = localStorage.getItem('inicioNotas');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

/**
 * Salva a lista de notas no localStorage.
 * @param {Array<object>} notes - Lista de notas a ser salva.
 * 
 * Exemplo de Uso:
 * saveNotes(minhasNotas);
 */
function saveNotes(notes) {
  localStorage.setItem('inicioNotas', JSON.stringify(notes));
}

/**
 * Adiciona uma nova nota a partir do campo de texto.
 * 
 * Propósito: Coletar texto, criar objeto nota, salvar e renderizar.
 * 
 * Exemplo de Uso:
 * document.getElementById('addNoteBtn').addEventListener('click', addNote);
 */
function addNote() {
  const textEl = document.getElementById('newNoteText');
  const text = (textEl.value || '').trim();
  if (!text) { textEl.focus(); return; }
  const notes = getNotes();
  const note = { id: Date.now(), text };
  notes.unshift(note);
  saveNotes(notes);
  textEl.value = '';
  renderNotes(notes);
}

/**
 * Carrega e renderiza todas as notas salvas.
 * 
 * Exemplo de Uso:
 * loadNotes();
 */
function loadNotes() {
  renderNotes(getNotes());
}

/**
 * Renderiza a lista de notas no DOM.
 * @param {Array<object>} notes - Lista de notas a serem renderizadas.
 * 
 * Propósito: Criar e inserir elementos HTML para cada nota, anexando handlers.
 * 
 * Exemplo de Uso:
 * renderNotes(getNotes());
 */
function renderNotes(notes) {
  const list = document.getElementById('notesList');
  if (!list) { return; }
  list.innerHTML = '';
  if (!notes.length) {
    const empty = document.createElement('div');
    empty.className = 'text-muted';
    empty.textContent = 'Nenhuma nota adicionada ainda.';
    list.appendChild(empty);
    return;
  }
  notes.forEach(note => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.dataset.id = note.id;

    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex align-items-start';

    const textDiv = document.createElement('div');
    textDiv.className = 'note-text flex-grow-1';
    textDiv.textContent = note.text;
    textDiv.contentEditable = false;

    const btns = document.createElement('div');
    btns.className = 'ms-3 d-flex gap-2';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-sm';
    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    editBtn.setAttribute('title', 'Editar');
    editBtn.setAttribute('aria-label', 'Editar');
    // Handler para iniciar edição
    editBtn.addEventListener('click', () => startEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary btn-sm d-none';
    saveBtn.innerHTML = '<i class="bi bi-check2"></i> Salvar';
    // Handler para salvar edição
    saveBtn.addEventListener('click', () => saveEdit(note.id, textDiv, editBtn, saveBtn, cancelBtn));

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary btn-sm d-none';
    cancelBtn.innerHTML = '<i class="bi bi-x"></i> Cancelar';
    // Handler para cancelar edição
    cancelBtn.addEventListener('click', () => cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, note.text));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-secondary btn-sm';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.setAttribute('title', 'Excluir');
    deleteBtn.setAttribute('aria-label', 'Excluir');
    // Handler para deletar nota
    deleteBtn.addEventListener('click', () => deleteNote(note.id));

    btns.append(editBtn, saveBtn, cancelBtn, deleteBtn);
    wrapper.append(textDiv, btns);
    li.appendChild(wrapper);
    list.appendChild(li);
  });
}

/**
 * Inicia o modo de edição para uma nota.
 * 
 * Propósito: Habilitar `contentEditable` e mostrar botões de Salvar/Cancelar.
 * 
 * Exemplo de Uso:
 * editBtn.addEventListener('click', () => startEdit(...));
 */
function startEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
  textDiv.contentEditable = true;
  textDiv.focus();
  editBtn.classList.add('d-none');
  saveBtn.classList.remove('d-none');
  cancelBtn.classList.remove('d-none');
}

/**
 * Salva a edição de uma nota.
 * 
 * Propósito: Coletar o novo texto, atualizar o localStorage e reverter a UI para o modo de visualização.
 * 
 * Exemplo de Uso:
 * saveBtn.addEventListener('click', () => saveEdit(...));
 */
function saveEdit(id, textDiv, editBtn, saveBtn, cancelBtn) {
  const newText = textDiv.textContent.trim();
  if (!newText) { textDiv.focus(); return; }
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === id);
  if (idx >= 0) {
    notes[idx].text = newText;
    saveNotes(notes);
  }
  textDiv.contentEditable = false;
  editBtn.classList.remove('d-none');
  saveBtn.classList.add('d-none');
  cancelBtn.classList.add('d-none');
}

/**
 * Cancela a edição de uma nota, restaurando o texto original.
 * 
 * Propósito: Restaurar o texto original e reverter a UI para o modo de visualização.
 * 
 * Exemplo de Uso:
 * cancelBtn.addEventListener('click', () => cancelEdit(...));
 */
function cancelEdit(textDiv, editBtn, saveBtn, cancelBtn, originalText) {
  textDiv.textContent = originalText;
  textDiv.contentEditable = false;
  editBtn.classList.remove('d-none');
  saveBtn.classList.add('d-none');
  cancelBtn.classList.add('d-none');
}

/**
 * Deleta uma nota.
 * 
 * Propósito: Remover a nota do estado local e atualizar a renderização.
 * 
 * Exemplo de Uso:
 * deleteBtn.addEventListener('click', () => deleteNote(note.id));
 */
function deleteNote(id) {
  const notes = getNotes().filter(n => n.id !== id);
  saveNotes(notes);
  renderNotes(notes);
}

// ============================================================================
// FUNÇÕES MIGRARAM DE BARCO.HTML (Inventário)
// ============================================================================

/**
 * Inicializa a lógica de interface do inventário (clique na linha e ordenação).
 * 
 * Propósito: Configurar eventos para a tabela de inventário.
 * 
 * Exemplo de Uso:
 * document.addEventListener('DOMContentLoaded', function() { ... });
 */
document.addEventListener('DOMContentLoaded', function() {
  try {
    const table = document.getElementById('inventario-table');
    if (!table) return;
    const tbody = table.querySelector('tbody');

    // Clique na linha inteira para abrir o modal de edição (Callback)
    tbody.querySelectorAll('tr.inventario-row').forEach(function(row) {
      row.addEventListener('click', function() {
        const editModalEl = document.getElementById('modalEditInventario');
        if (typeof bootstrap !== 'undefined' && editModalEl) {
          // Utiliza o modal do Bootstrap (Controle de Modal)
          const modal = new bootstrap.Modal(editModalEl);
          modal.show();
        }
      });
    });

    // Ordenação por cabeçalho clicável (Handler)
    const sortState = {};
    const ths = table.querySelectorAll('thead th[data-sort-key]');
    ths.forEach(function(th, idx) {
      th.addEventListener('click', function() {
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const dir = sortState[idx] === 'asc' ? 'desc' : 'asc';
        sortState[idx] = dir;

        const parseDate = function(s) {
          const m = s.match(/^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/);
          if (!m) return null;
          return new Date(+m[3], +m[2]-1, +m[1]).getTime();
        };

        rows.sort(function(a, b) {
          const va = a.children[idx].innerText.trim();
          const vb = b.children[idx].innerText.trim();

          // Tentar numérico
          const na = parseFloat(va.replace(',', '.'));
          const nb = parseFloat(vb.replace(',', '.'));
          const aIsNum = !isNaN(na) && va !== '';
          const bIsNum = !isNaN(nb) && vb !== '';
          if (aIsNum && bIsNum) {
            return dir === 'asc' ? na - nb : nb - na;
          }

          // Tentar data formato DD/MM/AAAA
          const ta = parseDate(va);
          const tb = parseDate(vb);
          if (ta && tb) {
            return dir === 'asc' ? ta - tb : tb - ta;
          }

          // Fallback: string
          return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        });

        // Reaplicar ordem
        rows.forEach(function(r) { tbody.appendChild(r); });
      });
    });
  } catch (e) {
    // Evita que erros externos interrompam os scripts locais
    console.warn('Inventário scripts warning:', e);
  }
});

// ============================================================================
// JS migrado de inicio.html (Duplicado no arquivo original, mantido para completude)
// ============================================================================
// O código abaixo é uma duplicação do bloco de notas do início do arquivo original.
// Foi mantido aqui para garantir que todas as funções originais estejam presentes,
// mas em um ambiente de produção, este bloco duplicado deveria ser removido.

if (document.getElementById('inicio-dashboard')) {
  // Lógica de inicialização do dashboard (Duplicada)
  document.addEventListener('DOMContentLoaded', function () {
    // Atualiza ano no footer
    var cy = document.getElementById('current-year');
    if (cy) { cy.textContent = new Date().getFullYear(); }

    // Mensagem de boas-vindas com nome do usuário
    const userNameEl = document.getElementById('userName');
    const storedName = localStorage.getItem('progeneseUserName') || sessionStorage.getItem('progeneseUserName');
    if (userNameEl) { userNameEl.textContent = storedName ? storedName : 'Usuário'; }

    // Inicializa quadro de anotações
    const addBtn = document.getElementById('addNoteBtn');
    if (addBtn) {
      addBtn.addEventListener('click', addNote); // addNote já está definida acima
    }
    loadNotes(); // loadNotes já está definida acima
  });
  
  // As funções getNotes, saveNotes, addNote, loadNotes, renderNotes, startEdit, saveEdit, cancelEdit, deleteNote
  // já estão definidas acima e são reutilizadas aqui.
}

// ============================================================================
// FUNÇÕES DE UTILIDADE (MIGRARAM DE controller.js)
// ============================================================================
// Funções de controller.js que são chamadas em auxiliar.js e precisam ser acessíveis.
// Em um ambiente de módulo, seriam importadas. Aqui, assumimos que são globais.

/**
 * Converte uma chave local (ex: 'laminacao') para o nome legível correspondente.
 * (Copiada de controller.js para evitar dependência de escopo em ambiente não-módulo)
 * @param {string} key - A chave local.
 * @returns {string} O nome legível.
 */
function localKeyToNome(key) {
  switch (key) {
    case 'laminacao': return 'Laminação';
    case 'montagem': return 'Montagem';
    case 'concluidos': return 'Concluídos';
    case 'preprojetos': return 'Pré-Projetos';
    case 'lixeira': return 'Lixeira';
    default: return key;
  }
}

// Funções de controller.js que são chamadas em auxiliar.js e precisam ser acessíveis:
// - initializeData()
// - saveBoatsToStorage()
// - saveBoatToAPI()
// - deleteBoatFromAPI()
// - moveBoatInDB()
// - findAvailableSlot()
// - apiRequest()
// 
// Assumimos que estas funções são definidas em controller.js e estão no escopo global.
// Se este código fosse modularizado (e.g., com `import`), elas seriam importadas.