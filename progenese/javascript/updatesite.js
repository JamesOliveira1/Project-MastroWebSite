// Global variable to store motor data
let allMotors = [];
let sortOrder = 'price'; // 'price' or 'alpha'

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.update-section').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show the selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
    
    // Load data specific to the section
    if (sectionId === 'editMotors') {
        loadMotors();
    }
    if (sectionId === 'editOptionals') {
        loadOptionals();
    }
    if (sectionId === 'editModel') {
        loadModels();
    }
    if (sectionId === 'relate') {
        initRelate();
    }
    
    // Update button states
    document.querySelectorAll('#updateMenu .btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
        }
    });
}

function loadMotors() {
    togglePreloader(true);
    fetch('api/updatesite.php?action=list_motors')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allMotors = data.data;
                renderMotors(allMotors);
            } else {
                console.error('Erro ao carregar motores:', data.message);
                document.getElementById('motorsGrid').innerHTML = '<p class="text-danger">Erro ao carregar motores.</p>';
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            document.getElementById('motorsGrid').innerHTML = '<p class="text-danger">Erro de conexão.</p>';
        })
        .finally(() => {
            togglePreloader(false);
        });
}

function renderMotors(motors) {
    const grid = document.getElementById('motorsGrid');
    grid.innerHTML = '';
    
    motors.forEach(motor => {
        const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(motor.valor);
        
        const card = document.createElement('div');
        card.className = 'optional-card';
        card.onclick = () => openMotorModal(motor.id, motor.motor, motor.valor);
        
        card.innerHTML = `
            <div class="motor-img-container mb-2 text-center">
                 <img src="${motor.img_path}" alt="${motor.motor}" class="img-fluid rounded" style="max-height: 100px;" onerror="this.src='https://placehold.co/150x100?text=Sem+Imagem'">
            </div>
            <div class="optional-header justify-content-center">${motor.motor}</div>
            <div class="optional-desc text-center">${formattedPrice}</div>
        `;
        grid.appendChild(card);
    });
}

// Store current motor ID being edited
let currentMotorId = null;
let currentModalInstance = null;
let currentModalType = null; // 'bootstrap' | 'jquery' | null
let allOptionals = [];
let currentOptionalId = null;
let currentOptionalModalInstance = null;
let currentOptionalModalType = null;
let deleteOptionalImage = false;
let allModels = [];
let currentModelId = null;
let relSeries = [];
let relOptionals = [];
let relMotors = [];
let allSeriesItems = [];

function openMotorModal(id, name, price) {
    currentMotorId = id;
    document.getElementById('motorName').value = name;
    
    // Format price for input
    const formattedPrice = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(price);
    document.getElementById('motorPrice').value = 'R$ ' + formattedPrice;
    
    const modalEl = document.getElementById('modalEditMotor');
    currentModalInstance = null;
    currentModalType = null;
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        if (typeof bootstrap.Modal.getOrCreateInstance === 'function') {
            currentModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        } else if (typeof bootstrap.Modal.getInstance === 'function') {
            currentModalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        } else {
            currentModalInstance = new bootstrap.Modal(modalEl);
        }
        currentModalType = 'bootstrap';
        currentModalInstance.show();
    } else if (window.jQuery && typeof jQuery.fn.modal === 'function') {
        currentModalType = 'jquery';
        jQuery(modalEl).modal('show');
        currentModalInstance = modalEl; // reference element for jQuery
    } else {
        modalEl.classList.add('show');
        modalEl.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function saveMotor() {
    if (!currentMotorId) return;
    
    const name = document.getElementById('motorName').value;
    const priceInput = document.getElementById('motorPrice').value;
    
    // Convert formatted price back to number
    // Remove "R$", dots, and replace comma with dot
    let priceValue = priceInput.replace(/[R$\s.]/g, '').replace(',', '.');
    let price = parseFloat(priceValue);
    
    if (isNaN(price)) price = 0;

    const payload = {
        action: 'update_motor',
        id: currentMotorId,
        motor: name,
        valor: price
    };

    togglePreloader(true);
    fetch('api/updatesite.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeMotorModal();
            loadMotors();
        } else {
            console.error('Erro ao salvar:', data.message);
        }
    })
    .catch(error => {
        console.error('Erro ao salvar as alterações:', error);
    })
    .finally(() => {
        togglePreloader(false);
    });
}

function closeMotorModal() {
    const modalEl = document.getElementById('modalEditMotor');
    if (currentModalType === 'bootstrap' && currentModalInstance && typeof currentModalInstance.hide === 'function') {
        currentModalInstance.hide();
    } else if (currentModalType === 'jquery' && window.jQuery && typeof jQuery.fn.modal === 'function') {
        jQuery(modalEl).modal('hide');
    } else if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        const inst = (typeof bootstrap.Modal.getInstance === 'function' ? bootstrap.Modal.getInstance(modalEl) : null) || new bootstrap.Modal(modalEl);
        inst.hide();
    } else if (window.jQuery && typeof jQuery.fn.modal === 'function') {
        jQuery(modalEl).modal('hide');
    } else {
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    }
    currentModalInstance = null;
    currentModalType = null;
}

function formatCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    value = (value / 100).toFixed(2) + '';
    value = value.replace('.', ',');
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = 'R$ ' + value;
}

function sortMotors() {
    if (sortOrder === 'price') {
        // Sort by price (ascending) -> switch to alphabetical next
        allMotors.sort((a, b) => parseFloat(a.valor) - parseFloat(b.valor));
        sortOrder = 'alpha';
        document.getElementById('btnOrganizarMotores').innerHTML = '<i class="bi bi-sort-alpha-down"></i> Organizar (Preço)';
        document.getElementById('btnOrganizarMotores').title = "Clique para ordenar por nome";
    } else {
        // Sort alphabetically -> switch to price next
        allMotors.sort((a, b) => a.motor.localeCompare(b.motor));
        sortOrder = 'price';
        document.getElementById('btnOrganizarMotores').innerHTML = '<i class="bi bi-sort-numeric-down"></i> Organizar (Nome)';
        document.getElementById('btnOrganizarMotores').title = "Clique para ordenar por preço";
    }
    renderMotors(allMotors);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    showSection('editModel');
    
    // Attach event listeners
    document.querySelector('#modalEditMotor .btn_estaleirosave').addEventListener('click', saveMotor);
    document.getElementById('btnOrganizarMotores').addEventListener('click', sortMotors);
    document.querySelector('#modalEditOptional .btn_estaleirosaveoptional').addEventListener('click', saveOptional);
    document.querySelector('#modalEditOptional .btn_estaleirodeleteoptional').addEventListener('click', deleteOptional);
    document.getElementById('btnAddOptional').addEventListener('click', openAddOptionalModal);
    document.querySelector('#modalAddOptional .btn_estaleirosaveoptionalnew').addEventListener('click', saveNewOptional);
    document.getElementById('btnEditModel')?.addEventListener('click', openModelEditModal);
    document.querySelector('#modalEditModel .btn_estaleirosavemodel')?.addEventListener('click', saveModel);
    document.getElementById('btnSaveRelations')?.addEventListener('click', saveRelations);
});

function togglePreloader(show) {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    pre.style.display = show ? 'block' : 'none';
}

function loadOptionals() {
    togglePreloader(true);
    fetch('api/updatesite.php?action=list_optionals')
        .then(r => r.json())
        .then(d => {
            if (d.success) {
                allOptionals = d.data;
                renderOptionals(allOptionals);
            } else {
                document.getElementById('optionalsGrid').innerHTML = '<p class="text-danger">Erro ao carregar opcionais.</p>';
            }
        })
        .catch(e => {
            document.getElementById('optionalsGrid').innerHTML = '<p class="text-danger">Erro de conexão.</p>';
        })
        .finally(() => togglePreloader(false));
}

function renderOptionals(opts) {
    const grid = document.getElementById('optionalsGrid');
    grid.innerHTML = '';
    opts.forEach(opt => {
        const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opt.valor);
        const card = document.createElement('div');
        card.className = 'optional-card';
        card.innerHTML = `
            <div class="mb-2 text-center">
                 <img src="${opt.img_path}" alt="${opt.opcional}" class="img-fluid rounded" style="max-height: 100px;" onerror="this.src='../assets/img/options/no-image.jpg'">
            </div>
            <div class="optional-header justify-content-center">${opt.opcional}</div>
            <div class="optional-desc text-center">${formattedPrice}</div>
        `;
        card.onclick = () => openOptionalModal(opt.id, opt.opcional, opt.valor);
        grid.appendChild(card);
    });
}

function openOptionalModal(id, name, price) {
    currentOptionalId = id;
    document.getElementById('optionalName').value = name;
    const formattedPrice = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(price);
    document.getElementById('optionalPrice').value = 'R$ ' + formattedPrice;
    const modalEl = document.getElementById('modalEditOptional');
    currentOptionalModalInstance = null;
    currentOptionalModalType = null;
    deleteOptionalImage = false;
    const fileInput = document.getElementById('optionalEditImg');
    if (fileInput) fileInput.value = '';
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        if (typeof bootstrap.Modal.getOrCreateInstance === 'function') {
            currentOptionalModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        } else if (typeof bootstrap.Modal.getInstance === 'function') {
            currentOptionalModalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        } else {
            currentOptionalModalInstance = new bootstrap.Modal(modalEl);
        }
        currentOptionalModalType = 'bootstrap';
        currentOptionalModalInstance.show();
    } else if (window.jQuery && typeof jQuery.fn.modal === 'function') {
        currentOptionalModalType = 'jquery';
        jQuery(modalEl).modal('show');
        currentOptionalModalInstance = modalEl;
    } else {
        modalEl.classList.add('show');
        modalEl.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function saveOptional() {
    if (!currentOptionalId) return;
    const name = document.getElementById('optionalName').value;
    const priceInput = document.getElementById('optionalPrice').value;
    let priceValue = priceInput.replace(/[R$\s.]/g, '').replace(',', '.');
    let price = parseFloat(priceValue);
    if (isNaN(price)) price = 0;
    const fileInput = document.getElementById('optionalEditImg');
    const useForm = (fileInput && fileInput.files && fileInput.files.length > 0) || deleteOptionalImage;
    togglePreloader(true);
    if (useForm) {
        const formData = new FormData();
        formData.append('action', 'update_optional');
        formData.append('id', String(currentOptionalId));
        formData.append('opcional', name);
        formData.append('valor', String(price));
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            formData.append('img', fileInput.files[0]);
        }
        if (deleteOptionalImage) {
            formData.append('delete_image', '1');
        }
        fetch('api/updatesite.php', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(d => {
            if (d.success) {
                closeOptionalModal();
                loadOptionals();
            } else {
                console.error('Erro ao salvar opcional:', d.message);
            }
        })
        .catch(e => {
            console.error('Erro ao salvar opcional:', e);
        })
        .finally(() => {
            deleteOptionalImage = false;
            togglePreloader(false);
        });
    } else {
        const payload = { action: 'update_optional', id: currentOptionalId, opcional: name, valor: price };
        fetch('api/updatesite.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(d => {
            if (d.success) {
                closeOptionalModal();
                loadOptionals();
            } else {
                console.error('Erro ao salvar opcional:', d.message);
            }
        })
        .catch(e => {
            console.error('Erro ao salvar opcional:', e);
        })
        .finally(() => togglePreloader(false));
    }
}

function closeOptionalModal() {
    const modalEl = document.getElementById('modalEditOptional');
    if (currentOptionalModalType === 'bootstrap' && currentOptionalModalInstance && typeof currentOptionalModalInstance.hide === 'function') {
        currentOptionalModalInstance.hide();
    } else if (currentOptionalModalType === 'jquery' && window.jQuery && typeof jQuery.fn.modal === 'function') {
        jQuery(modalEl).modal('hide');
    } else if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        const inst = (typeof bootstrap.Modal.getInstance === 'function' ? bootstrap.Modal.getInstance(modalEl) : null) || new bootstrap.Modal(modalEl);
        inst.hide();
    } else if (window.jQuery && typeof jQuery.fn.modal === 'function') {
        jQuery(modalEl).modal('hide');
    } else {
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    }
    currentOptionalModalInstance = null;
    currentOptionalModalType = null;
}

function deleteOptional() {
    if (!currentOptionalId) return;
    if (!confirm('tem certeza que deseja excluir o opcional?')) return;
    const payload = { action: 'delete_optional', id: currentOptionalId };
    togglePreloader(true);
    fetch('api/updatesite.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            closeOptionalModal();
            loadOptionals();
        } else {
            console.error('Erro ao excluir opcional:', d.message);
        }
    })
    .catch(e => {
        console.error('Erro ao excluir opcional:', e);
    })
    .finally(() => togglePreloader(false));
}

document.getElementById('btnDeleteOptionalImg')?.addEventListener('click', function () {
    if (confirm('Deseja excluir a imagem do opcional?')) {
        deleteOptionalImage = true;
        const fileInput = document.getElementById('optionalEditImg');
        if (fileInput) fileInput.value = '';
    }
});

function loadModels(selectedId = null) {
    togglePreloader(true);
    fetch('api/updatesite.php?action=list_models')
        .then(r => r.json())
        .then(d => {
            if (d.success) {
                allModels = d.data;
                renderModels(allModels, selectedId);
            } else {
                console.error('Erro ao carregar modelos:', d.message);
            }
        })
        .catch(e => console.error('Erro ao carregar modelos:', e))
        .finally(() => togglePreloader(false));
}

function renderModels(models, selectedId = null) {
    const sel = document.getElementById('modelSelect');
    const body = document.getElementById('modelDetailsBody');
    const img = document.getElementById('modelPreviewImg');
    sel.innerHTML = '';
    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.modelo;
        sel.appendChild(opt);
    });
    sel.onchange = () => displayModelDetails(sel.value);
    if (models.length) {
        let targetId = models[0].id;
        if (selectedId && models.some(m => String(m.id) === String(selectedId))) {
            targetId = selectedId;
        }
        sel.value = targetId;
        displayModelDetails(targetId);
    } else {
        body.innerHTML = '<tr><td class="text-muted">Nenhum modelo encontrado.</td></tr>';
    }
}

function displayModelDetails(id) {
    currentModelId = id;
    const body = document.getElementById('modelDetailsBody');
    const img = document.getElementById('modelPreviewImg');
    const m = allModels.find(x => String(x.id) === String(id));
    if (!m) {
        body.innerHTML = '';
        return;
    }
    if (img && m.img_path) {
        img.src = m.img_path;
        img.onerror = function () { this.src = '../assets/img/options/no-image.jpg'; };
    }
    const rows = [
        ['Modelo', m.modelo],
        ['Categoria', m.categoria ?? ''],
        ['Comprimento (m)', m.comprimento_m ?? ''],
        ['Largura (m)', m.largura_m ?? ''],
        ['Calado (m)', m.calado_m ?? ''],
        ['Peso (kg)', m.peso_kg ?? ''],
        ['Água (l)', m.agua_l ?? ''],
        ['Combustível (l)', m.combustivel_l ?? ''],
        ['Motorização', m.motorizacao ?? ''],
        ['Passageiros', m.passageiros ?? ''],
        ['Pernoite', m.pernoite ?? ''],
        ['Vel. Cruzeiro (nós)', m.velocidade_cruzeiro_nos ?? ''],
        ['Autonomia (milhas)', m.autonomia_milhas ?? ''],
        ['Vel. Máxima (nós)', m.velocidade_maxima_nos ?? ''],
        ['Valor Montagem (R$)', m.barco_montagem_valor ?? ''],
        ['Descrição', m.descricao ?? '']
    ];
    body.innerHTML = rows.map(([k, v]) => `<tr><th style="width:40%">${k}</th><td>${v ?? ''}</td></tr>`).join('');
}

let sortState = { series: 'asc', optionals: 'asc', motors: 'asc' };

function sortCheckboxes(type) {
    if (type === 'seriesCheckboxes') {
        if (sortState.series === 'asc') {
            allSeriesItems.sort((a, b) => a.item.localeCompare(b.item));
            sortState.series = 'desc';
        } else {
            allSeriesItems.sort((a, b) => b.item.localeCompare(a.item));
            sortState.series = 'asc';
        }
    } else if (type === 'optionalsCheckboxes') {
        if (sortState.optionals === 'asc') {
            allOptionals.sort((a, b) => a.opcional.localeCompare(b.opcional));
            sortState.optionals = 'desc';
        } else {
            allOptionals.sort((a, b) => b.opcional.localeCompare(a.opcional));
            sortState.optionals = 'asc';
        }
    } else if (type === 'motorsCheckboxes') {
        if (sortState.motors === 'asc') {
            allMotors.sort((a, b) => a.motor.localeCompare(b.motor));
            sortState.motors = 'desc';
        } else {
            allMotors.sort((a, b) => b.motor.localeCompare(a.motor));
            sortState.motors = 'asc';
        }
    }
    renderRelateCheckboxes();
}

function initRelate() {
    if (allModels.length === 0) {
        loadModels();
    }
    const sel = document.getElementById('relModelSelect');
    sel.innerHTML = '';
    allModels.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.modelo;
        sel.appendChild(opt);
    });
    sel.onchange = () => updateRelateForModel(sel.value);
    if (allModels.length) {
        sel.value = allModels[0].id;
        updateRelateForModel(allModels[0].id);
    }
}

function updateRelateForModel(id) {
    currentModelId = id;
    const m = allModels.find(x => String(x.id) === String(id));
    const img = document.getElementById('relModelPreviewImg');
    if (img && m && m.img_path) {
        img.src = m.img_path;
        img.onerror = function () { this.src = '../assets/img/options/no-image.jpg'; };
    }
    togglePreloader(true);
    Promise.all([
        fetch('api/updatesite.php?action=list_series_items').then(r => r.json()),
        fetch('api/updatesite.php?action=list_optionals').then(r => r.json()),
        fetch('api/updatesite.php?action=list_motors').then(r => r.json()),
        fetch('api/updatesite.php?action=get_relations&barco_id=' + encodeURIComponent(id)).then(r => r.json())
    ])
    .then(([seriesRes, optionalsRes, motorsRes, relRes]) => {
        if (seriesRes.success) allSeriesItems = seriesRes.data; else allSeriesItems = [];
        if (optionalsRes.success) allOptionals = optionalsRes.data; else allOptionals = [];
        if (motorsRes.success) allMotors = motorsRes.data; else allMotors = [];
        if (relRes.success) {
            relSeries = relRes.data.series || [];
            relOptionals = relRes.data.opcionais || [];
            relMotors = relRes.data.motores || [];
        } else {
            relSeries = []; relOptionals = []; relMotors = [];
        }
        renderRelateCheckboxes();
    })
    .catch(e => {
        document.getElementById('seriesCheckboxes').innerHTML = '<p class="text-danger">Erro ao carregar itens de série.</p>';
        document.getElementById('optionalsCheckboxes').innerHTML = '<p class="text-danger">Erro ao carregar opcionais.</p>';
        document.getElementById('motorsCheckboxes').innerHTML = '<p class="text-danger">Erro ao carregar motores.</p>';
    })
    .finally(() => togglePreloader(false));
}

function renderRelateCheckboxes() {
    const seriesBox = document.getElementById('seriesCheckboxes');
    const optionalsBox = document.getElementById('optionalsCheckboxes');
    const motorsBox = document.getElementById('motorsCheckboxes');
    seriesBox.innerHTML = '<div class="rel-columns"><div class="rel-col rel-col-1"></div><div class="rel-col rel-col-2"></div></div>';
    optionalsBox.innerHTML = '<div class="rel-columns"><div class="rel-col rel-col-1"></div><div class="rel-col rel-col-2"></div></div>';
    motorsBox.innerHTML = '<div class="rel-columns"><div class="rel-col rel-col-1"></div><div class="rel-col rel-col-2"></div></div>';
    const sCol1 = seriesBox.querySelector('.rel-col-1');
    const sCol2 = seriesBox.querySelector('.rel-col-2');
    const oCol1 = optionalsBox.querySelector('.rel-col-1');
    const oCol2 = optionalsBox.querySelector('.rel-col-2');
    const mCol1 = motorsBox.querySelector('.rel-col-1');
    const mCol2 = motorsBox.querySelector('.rel-col-2');
    const sMid = Math.ceil(allSeriesItems.length / 2);
    const oMid = Math.ceil(allOptionals.length / 2);
    const mMid = Math.ceil(allMotors.length / 2);
    const relSeriesSet = new Set(relSeries.map(n => Number(n)));
    const relOptionalsSet = new Set(relOptionals.map(n => Number(n)));
    const relMotorsSet = new Set(relMotors.map(n => Number(n)));
    allSeriesItems.forEach((item, idx) => {
        const id = Number(item.id);
        const label = document.createElement('label');
        label.className = 'form-check d-block';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'form-check-input';
        cb.checked = relSeriesSet.has(id);
        cb.onchange = function () {
            if (this.checked) {
                if (!relSeriesSet.has(id)) { relSeriesSet.add(id); relSeries.push(id); }
            } else {
                relSeries = relSeries.filter(x => Number(x) !== id);
                relSeriesSet.delete(id);
            }
        };
        const span = document.createElement('span');
        span.className = 'form-check-label';
        span.textContent = item.item;
        label.appendChild(cb);
        label.appendChild(span);
        (idx < sMid ? sCol1 : sCol2).appendChild(label);
    });
    allOptionals.forEach((item, idx) => {
        const id = Number(item.id);
        const label = document.createElement('label');
        label.className = 'form-check d-block';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'form-check-input';
        cb.checked = relOptionalsSet.has(id);
        cb.onchange = function () {
            if (this.checked) {
                if (!relOptionalsSet.has(id)) { relOptionalsSet.add(id); relOptionals.push(id); }
            } else {
                relOptionals = relOptionals.filter(x => Number(x) !== id);
                relOptionalsSet.delete(id);
            }
        };
        const span = document.createElement('span');
        span.className = 'form-check-label';
        span.textContent = item.opcional;
        label.appendChild(cb);
        label.appendChild(span);
        (idx < oMid ? oCol1 : oCol2).appendChild(label);
    });
    allMotors.forEach((item, idx) => {
        const id = Number(item.id);
        const label = document.createElement('label');
        label.className = 'form-check d-block';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'form-check-input';
        cb.checked = relMotorsSet.has(id);
        cb.onchange = function () {
            if (this.checked) {
                if (!relMotorsSet.has(id)) { relMotorsSet.add(id); relMotors.push(id); }
            } else {
                relMotors = relMotors.filter(x => Number(x) !== id);
                relMotorsSet.delete(id);
            }
        };
        const span = document.createElement('span');
        span.className = 'form-check-label';
        span.textContent = item.motor;
        label.appendChild(cb);
        label.appendChild(span);
        (idx < mMid ? mCol1 : mCol2).appendChild(label);
    });
}

function saveRelations() {
    if (!currentModelId) return;
    const payload = {
        action: 'save_relations',
        barco_id: parseInt(currentModelId, 10),
        series_ids: relSeries,
        opcional_ids: relOptionals,
        motor_ids: relMotors
    };
    togglePreloader(true);
    fetch('api/updatesite.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            const msg = document.getElementById('relSaveMsg');
            if (msg) {
                msg.textContent = 'Salvo com sucesso';
                msg.style.display = 'block';
                setTimeout(() => { msg.style.display = 'none'; }, 6000);
            }
        } else {
            const msg = document.getElementById('relSaveMsg');
            if (msg) {
                msg.textContent = 'Erro ao salvar.';
                msg.style.display = 'block';
                setTimeout(() => { msg.style.display = 'none'; }, 6000);
            }
        }
    })
    .catch(e => {
        const msg = document.getElementById('relSaveMsg');
        if (msg) {
            msg.textContent = 'Erro ao salvar.';
            msg.style.display = 'block';
            setTimeout(() => { msg.style.display = 'none'; }, 6000);
        }
        console.error('Erro ao salvar relações:', e);
    })
    .finally(() => togglePreloader(false));
}
function openModelEditModal() {
    if (!currentModelId) return;
    const m = allModels.find(x => x.id === currentModelId);
    if (!m) return;
    document.getElementById('modelCategoria').value = m.categoria ?? '';
    document.getElementById('modelComprimento').value = m.comprimento_m ?? '';
    document.getElementById('modelLargura').value = m.largura_m ?? '';
    document.getElementById('modelCalado').value = m.calado_m ?? '';
    document.getElementById('modelPeso').value = m.peso_kg ?? '';
    document.getElementById('modelAgua').value = m.agua_l ?? '';
    document.getElementById('modelCombustivel').value = m.combustivel_l ?? '';
    document.getElementById('modelMotorizacao').value = m.motorizacao ?? '';
    document.getElementById('modelPassageiros').value = m.passageiros ?? '';
    document.getElementById('modelPernoite').value = m.pernoite ?? '';
    document.getElementById('modelVelCruzeiro').value = m.velocidade_cruzeiro_nos ?? '';
    document.getElementById('modelAutonomia').value = m.autonomia_milhas ?? '';
    document.getElementById('modelVelMaxima').value = m.velocidade_maxima_nos ?? '';
    document.getElementById('modelValorMontagem').value = m.barco_montagem_valor ?? '';
    document.getElementById('modelDescricao').value = m.descricao ?? '';
    const modalEl = document.getElementById('modalEditModel');
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } else if (window.jQuery && typeof jQuery.fn.modal === 'function') {
        jQuery(modalEl).modal('show');
    } else {
        modalEl.classList.add('show');
        modalEl.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function saveModel() {
    if (!currentModelId) return;
    const payload = {
        action: 'update_model',
        id: currentModelId,
        categoria: document.getElementById('modelCategoria').value,
        comprimento_m: parseFloat(document.getElementById('modelComprimento').value || '0'),
        largura_m: parseFloat(document.getElementById('modelLargura').value || '0'),
        calado_m: parseFloat(document.getElementById('modelCalado').value || '0'),
        peso_kg: parseFloat(document.getElementById('modelPeso').value || '0'),
        agua_l: parseFloat(document.getElementById('modelAgua').value || '0'),
        combustivel_l: parseFloat(document.getElementById('modelCombustivel').value || '0'),
        motorizacao: document.getElementById('modelMotorizacao').value,
        passageiros: parseInt(document.getElementById('modelPassageiros').value || '0', 10),
        pernoite: parseInt(document.getElementById('modelPernoite').value || '0', 10),
        velocidade_cruzeiro_nos: parseFloat(document.getElementById('modelVelCruzeiro').value || '0'),
        autonomia_milhas: parseFloat(document.getElementById('modelAutonomia').value || '0'),
        velocidade_maxima_nos: parseFloat(document.getElementById('modelVelMaxima').value || '0'),
        barco_montagem_valor: parseFloat(document.getElementById('modelValorMontagem').value || '0'),
        descricao: document.getElementById('modelDescricao').value
    };
    togglePreloader(true);
    fetch('api/updatesite.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(d => {
        const modalEl = document.getElementById('modalEditModel');
        if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
            bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        } else if (window.jQuery && typeof jQuery.fn.modal === 'function') {
            jQuery(modalEl).modal('hide');
        } else {
            modalEl.classList.remove('show');
            modalEl.style.display = 'none';
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        }
        if (d.success) {
            alert('Salvo com sucesso!');
            loadModels(currentModelId);
        } else {
            console.error('Erro ao salvar modelo:', d.message);
        }
    })
    .catch(e => console.error('Erro ao salvar modelo:', e))
    .finally(() => togglePreloader(false));
}

let currentAddOptionalModalInstance = null;
let currentAddOptionalModalType = null;

function openAddOptionalModal() {
    const modalEl = document.getElementById('modalAddOptional');
    currentAddOptionalModalInstance = null;
    currentAddOptionalModalType = null;
    document.getElementById('optionalAddName').value = '';
    document.getElementById('optionalAddPrice').value = '';
    document.getElementById('optionalAddImg').value = '';
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        if (typeof bootstrap.Modal.getOrCreateInstance === 'function') {
            currentAddOptionalModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        } else if (typeof bootstrap.Modal.getInstance === 'function') {
            currentAddOptionalModalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        } else {
            currentAddOptionalModalInstance = new bootstrap.Modal(modalEl);
        }
        currentAddOptionalModalType = 'bootstrap';
        currentAddOptionalModalInstance.show();
    } else if (window.jQuery && typeof jQuery.fn.modal === 'function') {
        currentAddOptionalModalType = 'jquery';
        jQuery(modalEl).modal('show');
        currentAddOptionalModalInstance = modalEl;
    } else {
        modalEl.classList.add('show');
        modalEl.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function closeAddOptionalModal() {
    const modalEl = document.getElementById('modalAddOptional');
    if (currentAddOptionalModalType === 'bootstrap' && currentAddOptionalModalInstance && typeof currentAddOptionalModalInstance.hide === 'function') {
        currentAddOptionalModalInstance.hide();
    } else if (currentAddOptionalModalType === 'jquery' && window.jQuery && typeof jQuery.fn.modal === 'function') {
        jQuery(modalEl).modal('hide');
    } else if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        const inst = (typeof bootstrap.Modal.getInstance === 'function' ? bootstrap.Modal.getInstance(modalEl) : null) || new bootstrap.Modal(modalEl);
        inst.hide();
    } else if (window.jQuery && typeof jQuery.fn.modal === 'function') {
        jQuery(modalEl).modal('hide');
    } else {
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    }
    currentAddOptionalModalInstance = null;
    currentAddOptionalModalType = null;
}

function saveNewOptional() {
    const name = document.getElementById('optionalAddName').value.trim();
    const priceInput = document.getElementById('optionalAddPrice').value;
    const fileInput = document.getElementById('optionalAddImg');
    if (!name) return;
    let priceValue = priceInput.replace(/[R$\s.]/g, '').replace(',', '.');
    let price = parseFloat(priceValue);
    if (isNaN(price)) price = 0;
    const formData = new FormData();
    formData.append('action', 'add_optional');
    formData.append('opcional', name);
    formData.append('valor', price.toString());
    if (fileInput.files && fileInput.files.length > 0) {
        formData.append('img', fileInput.files[0]);
    }
    togglePreloader(true);
    fetch('api/updatesite.php', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            closeAddOptionalModal();
            loadOptionals();
        } else {
            console.error('Erro ao adicionar opcional:', d.message);
        }
    })
    .catch(e => {
        console.error('Erro ao adicionar opcional:', e);
    })
    .finally(() => togglePreloader(false));
}
