document.addEventListener('DOMContentLoaded', function () {
  const buttons = {
    modelo: document.getElementById('btn-editar-modelo'),
    opcionais: document.getElementById('btn-editar-opcionais'),
    motores: document.getElementById('btn-editar-motores'),
    relacionar: document.getElementById('btn-relacionar')
  };
  const panels = {
    modelo: document.getElementById('panel-editar-modelo'),
    opcionais: document.getElementById('panel-editar-opcionais'),
    motores: document.getElementById('panel-editar-motores'),
    relacionar: document.getElementById('panel-relacionar')
  };
  function showPanel(name) {
    Object.keys(panels).forEach((key) => {
      panels[key].style.display = key === name ? 'block' : 'none';
    });
    Object.keys(buttons).forEach((key) => {
      if (key === name) {
        buttons[key].classList.add('active');
      } else {
        buttons[key].classList.remove('active');
      }
    });
    const breadcrumbs = document.querySelector('.breadcrumbs');
    if (breadcrumbs) breadcrumbs.scrollIntoView({ behavior: 'smooth' });
  }
  buttons.modelo.addEventListener('click', () => showPanel('modelo'));
  buttons.opcionais.addEventListener('click', () => showPanel('opcionais'));
  buttons.motores.addEventListener('click', () => showPanel('motores'));
  buttons.relacionar.addEventListener('click', () => showPanel('relacionar'));
  showPanel('modelo');
});
