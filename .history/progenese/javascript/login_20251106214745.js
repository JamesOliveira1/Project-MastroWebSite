(() => {
  const API_URL = '/progenese/api/usuarios.php';
  let csrfToken = null;

  async function fetchCsrf() {
    try {
      const res = await fetch(`${API_URL}?action=csrf`, { credentials: 'include' });
      const data = await res.json();
      if (data && data.ok && data.csrf) {
        csrfToken = data.csrf;
      }
    } catch (e) {
      // Silencia: token será obtido novamente em ações
    }
  }

  function onLoginPage() {
    return !!document.getElementById('loginForm');
  }

  function showError(message) {
    const form = document.getElementById('loginForm');
    if (!form) return;
    let alertEl = form.querySelector('.login-error');
    if (!alertEl) {
      alertEl = document.createElement('div');
      alertEl.className = 'login-error alert alert-danger mt-2';
      alertEl.setAttribute('role', 'alert');
      form.prepend(alertEl);
    }
    alertEl.textContent = message;
  }

  function clearError() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const alertEl = form.querySelector('.login-error');
    if (alertEl) alertEl.remove();
  }

  function validateFields(usuario, senha) {
    if (!usuario || !senha) return 'Preencha usuário e senha';
    if (usuario.length < 3 || usuario.length > 64) return 'Usuário inválido';
    // Política de desenvolvimento: permitir senhas a partir de 4 caracteres.
    if (senha.length < 4 || senha.length > 128) return 'Senha inválida';
    return null;
  }

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    clearError();

    const usuario = (document.getElementById('usuario')?.value || '').trim();
    const senha = document.getElementById('senha')?.value || '';
    const err = validateFields(usuario, senha);
    if (err) { showError(err); return; }

    const btn = document.querySelector('.btn-login');
    if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }

    try {
      if (!csrfToken) await fetchCsrf();
      const remember = !!document.getElementById('manter-logado')?.checked;
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({ action: 'login', usuario, senha, remember })
      });
      const data = await res.json();
      if (!data || !data.ok) {
        showError(data?.error || 'Falha ao autenticar');
      } else {
        const redirect = data.redirect || '/progenese/estaleiro.html';
        window.location.assign(redirect);
      }
    } catch (e) {
      showError('Erro de rede. Tente novamente.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    }
  }

  async function ensureAuthenticated() {
    try {
      const res = await fetch(`${API_URL}?action=session`, { credentials: 'include' });
      const data = await res.json();
      if (!data || !data.ok || !data.authenticated) {
        window.location.replace('/progenese/login.html');
      }
    } catch (e) {
      window.location.replace('/progenese/login.html');
    }
  }

  function bindLogout() {
    // Prioriza seletor por id para reuso entre páginas; fallback pelo texto "Sair"
    const byId = document.getElementById('logout-link');
    const links = Array.from(document.querySelectorAll('a.nav-link'));
    const byText = links.find(a => (a.textContent || '').trim().toLowerCase() === 'sair');
    const logoutLink = byId || byText;
    if (!logoutLink) return;
    logoutLink.addEventListener('click', async (ev) => {
      ev.preventDefault();
      try {
        if (!csrfToken) await fetchCsrf();
        const res = await fetch(API_URL, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken || '' },
          body: JSON.stringify({ action: 'logout' })
        });
        const data = await res.json();
        const redirect = data?.redirect || '/progenese/login.html';
        window.location.assign(redirect);
      } catch (e) {
        window.location.assign('/progenese/login.html');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await fetchCsrf();
    if (onLoginPage()) {
      const form = document.getElementById('loginForm');
      if (form) form.addEventListener('submit', handleLoginSubmit);
    } else {
      // Em páginas internas, garantir sessão e preparar logout.
      await ensureAuthenticated();
      bindLogout();
    }
  });
})();