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
    
    // Update button states
    document.querySelectorAll('#updateMenu .btn').forEach(btn => {
        // Remove active class from all buttons
        btn.classList.remove('active');
        
        // Add active class to the clicked button
        if (btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
        }
    });
}

function openMotorModal(name, price, img) {
    document.getElementById('motorName').value = name;
    document.getElementById('motorPrice').value = price;
    document.getElementById('motorImg').value = img;
    
    var myModal = new bootstrap.Modal(document.getElementById('modalEditMotor'));
    myModal.show();
}

// Initialize: Show the first section by default or wait for user interaction
// For now, let's show 'editModel' by default
document.addEventListener('DOMContentLoaded', () => {
    showSection('editModel');
});
