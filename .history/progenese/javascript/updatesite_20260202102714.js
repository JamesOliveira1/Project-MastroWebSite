/**
 * Script for updatesite.html
 * Handles tab navigation and dynamic content display.
 */

document.addEventListener('DOMContentLoaded', function() {
  const navButtons = document.querySelectorAll('.nav-action-btn');
  const contentSections = document.querySelectorAll('.content-section');
  const welcomeSection = document.getElementById('welcome-section');

  function switchTab(targetId) {
    // Hide all sections including welcome section
    contentSections.forEach(section => {
      section.classList.add('d-none');
      section.classList.remove('d-block', 'fade-in');
    });
    if (welcomeSection) {
        welcomeSection.classList.add('d-none');
        welcomeSection.classList.remove('d-block', 'fade-in');
    }

    // Deactivate all buttons
    navButtons.forEach(btn => {
      btn.classList.remove('btn_estaleiro', 'active');
      btn.classList.add('btn_estaleirooff');
    });

    // Show target section
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.remove('d-none');
      targetSection.classList.add('d-block', 'fade-in');
    }

    // Activate button (if triggered by button click)
    const activeButton = Array.from(navButtons).find(btn => btn.getAttribute('data-target') === targetId);
    if (activeButton) {
      activeButton.classList.remove('btn_estaleirooff');
      activeButton.classList.add('btn_estaleiro', 'active');
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      switchTab(targetId);
    });
  });
});
