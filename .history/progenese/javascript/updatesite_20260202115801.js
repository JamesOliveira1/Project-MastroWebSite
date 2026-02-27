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

function openMotorModal(id, name, price) {
    currentMotorId = id;
    document.getElementById('motorName').value = name;
    
    // Format price for input
    const formattedPrice = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(price);
    document.getElementById('motorPrice').value = 'R$ ' + formattedPrice;
    
    var myModal = new bootstrap.Modal(document.getElementById('modalEditMotor'));
    myModal.show();
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

    fetch('api/updatesite.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        // Verificar se a resposta é JSON válido
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
             // Se não for JSON, lança um erro com o texto da resposta para debug
            return response.text().then(text => {
                throw new Error('Resposta não é JSON: ' + text);
            });
        }
    })
    .then(data => {
        if (data.success) {
            // Close modal
            closeMotorModal();
            
            // Reload list
            loadMotors();
        } else {
            alert('Erro ao salvar: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar as alterações: ' + error.message);
    });
}

function closeMotorModal() {
    const modalEl = document.getElementById('modalEditMotor');
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        new bootstrap.Modal(modalEl).hide();
        return;
    }
    if (window.jQuery && typeof jQuery.fn.modal === 'function') {
        jQuery(modalEl).modal('hide');
        return;
    }
    modalEl.classList.remove('show');
    modalEl.style.display = 'none';
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
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
