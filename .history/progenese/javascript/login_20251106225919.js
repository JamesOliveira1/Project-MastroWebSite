(() => {
  // Detecta se o site está sendo servido sob /website2 (Apache) ou na raiz (servidor embutido)
  const BASE_PREFIX = (window.location.pathname.startsWith('/website2/')) ? '/website2' : '';
  const API_URL = `${BASE_PREFIX}/progenese/api/usuarios.php`;
  let csrfToken = null;
  let errorTimer = null;

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
    // Remove automaticamente após 5 segundos
    if (errorTimer) { clearTimeout(errorTimer); }
    errorTimer = setTimeout(() => {
      const el = form.querySelector('.login-error');
      if (el) el.remove();
      errorTimer = null;
    }, 5000);
  }

  function clearError() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const alertEl = form.querySelector('.login-error');
    if (alertEl) alertEl.remove();
  }

  function validateFields(usuario, senha) {
    // Não bloqueia por complexidade da senha aqui; permite checar usuário no servidor
    if (!usuario || !senha) return 'Preencha usuário e senha';
    if (usuario.length < 3 || usuario.length > 64) return 'Usuário inválido';
    return null;
  }

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    clearError();

    const usuario = (document.getElementById('usuario')?.value || '').trim();
    const senha = document.getElementById('senha')?.value || '';
    const remember = document.getElementById('manter-logado')?.checked || false;
    const err = validateFields(usuario, senha);
    if (err) { showError(err); return; }

    const btn = document.querySelector('.btn-login');
    if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }

    try {
      if (!csrfToken) await fetchCsrf();
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
        window.location.assign(`${BASE_PREFIX}${redirect}`);
      }
    } catch (e) {
      showError('Erro de rede. Tente novamente.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    }
  }

  function bindPasswordToggle() {
    const btn = document.getElementById('togglePassword');
    const input = document.getElementById('senha');
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-eye', !isPassword);
        icon.classList.toggle('bi-eye-slash', isPassword);
      }
    });
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
        window.location.assign(`${BASE_PREFIX}${redirect}`);
      } catch (e) {
        window.location.assign(`${BASE_PREFIX}/progenese/login.html`);
      }
    });
  }

  // Vincula o logout apenas quando o header estiver disponível (carregado via web component)
  function bindLogoutWhenHeaderReady() {
    // Se já está disponível, faz o bind imediato
    const hasLogoutLink = document.getElementById('logout-link') ||
      Array.from(document.querySelectorAll('a.nav-link')).find(a => (a.textContent || '').trim().toLowerCase() === 'sair');
    if (hasLogoutLink) {
      bindLogout();
      return;
    }

    // Escuta o evento disparado pelo componente de header
    document.addEventListener('progenese:header-ready', () => {
      bindLogout();
    }, { once: true });

    // Fallback: tenta novamente depois de um pequeno atraso
    setTimeout(() => {
      bindLogout();
    }, 300);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await fetchCsrf();
    if (onLoginPage()) {
      const form = document.getElementById('loginForm');
      if (form) form.addEventListener('submit', handleLoginSubmit);
      bindPasswordToggle();
    } else {
      // Em páginas internas, garantir sessão e preparar logout.
      await ensureAuthenticated();
      bindLogoutWhenHeaderReady();
    }
  });
})();