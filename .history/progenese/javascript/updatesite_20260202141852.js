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
