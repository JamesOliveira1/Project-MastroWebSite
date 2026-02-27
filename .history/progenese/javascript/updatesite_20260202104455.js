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
        // We can find the button that called this function by checking its onclick attribute or by passing 'this'
        // But since we didn't pass 'this', we iterate and check.
        if (btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
        }
    });
}

// Initialize: Show the first section by default or wait for user interaction
// For now, let's show 'editModel' by default
document.addEventListener('DOMContentLoaded', () => {
    showSection('editModel');
});
