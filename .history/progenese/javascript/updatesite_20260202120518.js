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
});

function togglePreloader(show) {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    pre.style.display = show ? 'block' : 'none';
}
