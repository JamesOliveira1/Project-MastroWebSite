// Autenticação cliente para páginas da pasta /progenese
(function() {
  const API = '/progenese/api/usuarios.php';
  const LOGIN_PAGE = '/progenese/login.html';
  const HOME_PAGE = '/progenese/inicio.html';

  async function getSession() {
    try {
      const res = await fetch(`${API}?action=session`, { credentials: 'same-origin' });
      const data = await res.json();
      return !!(data && data.authenticated);
    } catch (e) {
      return false;
    }
  }

  async function enforceAuth() {
    const path = window.location.pathname;
    const isLogin = path.toLowerCase().endsWith('/progenese/login.html');
    const authenticated = await getSession();

    if (!authenticated && !isLogin) {
      window.location.replace(LOGIN_PAGE);
      return;
    }

    if (authenticated && isLogin) {
      // Já autenticado, redireciona para página inicial interna
      window.location.replace(HOME_PAGE);
    }
  }

  function wireLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const usuario = document.getElementById('usuario');
    const senha = document.getElementById('senha');

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      const u = usuario ? usuario.value.trim() : '';
      const s = senha ? senha.value : '';
      if (!u || !s) {
        alert('Informe usuário e senha.');
        return;
      }
      try {
        const res = await fetch(`${API}?action=login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ usuario: u, senha: s })
        });
        const data = await res.json();
        if (data && data.ok) {
          window.location.replace(HOME_PAGE);
        } else {
          const msg = (data && data.error) ? data.error : 'Falha no login';
          alert(msg);
        }
      } catch (e) {
        alert('Erro ao conectar. Tente novamente.');
      }
    });
  }

  // Expor logout simples
  window.logoutProgenese = async function() {
    try {
      await fetch(`${API}?action=logout`, { method: 'POST', credentials: 'same-origin' });
    } catch (_) {}
    window.location.replace(LOGIN_PAGE);
  };

  document.addEventListener('DOMContentLoaded', function() {
    enforceAuth();
    wireLoginForm();
  });
})();