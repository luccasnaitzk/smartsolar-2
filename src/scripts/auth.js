// Script para funcionalidade de autenticação
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do modal de autenticação
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const authHeaderTitle = document.querySelector('.auth-header h2');

    // Helpers visuais
    const updateAuthTitleForTab = (tabName) => {
        if (!authHeaderTitle) return;
        authHeaderTitle.textContent = tabName === 'register' ? 'Crie sua conta' : 'Acesse sua conta';
    };

    const setLoadingState = (formEl, isLoading, labels) => {
        if (!formEl) return;
        const btn = formEl.querySelector('.btn-full');
        const inputs = formEl.querySelectorAll('input, button, select, textarea');
        inputs.forEach(i => i.disabled = !!isLoading);
        if (btn) {
            if (isLoading) {
                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${labels.loading}`;
            } else {
                btn.textContent = labels.default;
            }
        }
    };
    
    // Verificar se o usuário já está logado
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const path = window.location.pathname;
    if (isLoggedIn === 'true' && (path.endsWith('index.html') || path.endsWith('/index') || path.endsWith('auth.html'))) {
        window.location.href = 'dashboard.html';
    }
    
    // Abrir modal de autenticação
    if (authBtn) {
        authBtn.addEventListener('click', function() {
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Impede scroll do body
            // Ajusta título conforme aba ativa no momento da abertura
            const activeTab = document.querySelector('.auth-tab.active');
            const current = activeTab ? activeTab.getAttribute('data-tab') : 'login';
            updateAuthTitleForTab(current);
        });
    }
    
    // Fechar modal de autenticação
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', function() {
            authModal.classList.remove('active');
            document.body.style.overflow = ''; // Restaura scroll do body
        });
    }
    
    // Fechar modal clicando fora dele
    if (authModal) {
      authModal.addEventListener('click', function(e) {
          if (e.target === authModal) {
              authModal.classList.remove('active');
              document.body.style.overflow = '';
          }
      });
    }
    
    // Alternar entre abas de login e cadastro
    if (authTabs.length && authForms.length) {
      authTabs.forEach(tab => {
          tab.addEventListener('click', function() {
              const tabName = this.getAttribute('data-tab');
              
              // Ativar aba clicada
              authTabs.forEach(t => t.classList.remove('active'));
              this.classList.add('active');
              
              // Mostrar formulário correspondente
              authForms.forEach(form => {
                  form.classList.remove('active');
                  if (form.id === `${tabName}Form`) {
                      form.classList.add('active');
                  }
              });

              // Atualiza título do cabeçalho
              updateAuthTitleForTab(tabName);
          });
      });
    }
    
    // Helpers para users
    function getUsersObj() {
        try { return JSON.parse(localStorage.getItem('users') || '{}'); } catch { return {}; }
    }
    function setUsersObj(obj) {
        localStorage.setItem('users', JSON.stringify(obj || {}));
    }

    // Submit do formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Validação simples
            if (!email || !password) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            // Feedback visual: carregando
            setLoadingState(loginForm, true, { loading: 'Entrando...', default: 'Entrar' });

            // Simulação de login: com delay para exibir loading/spinner
            setTimeout(() => {
                // Se houver senha cadastrada para o usuário, validar
                const users = getUsersObj();
                const stored = users[email];
                if (stored && stored.password && stored.password !== password) {
                    setLoadingState(loginForm, false, { loading: 'Entrando...', default: 'Entrar' });
                    alert('E-mail ou senha inválidos.');
                    return;
                }
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                // Atualiza último acesso
                const now = new Date();
                localStorage.setItem('userLastAccess', now.toLocaleString());

                // Verificar se há nome no cadastro
                // Sempre ajusta o nome exibido conforme cadastro salvo; fallback para prefixo do e-mail
                const nameFromUsers = stored && stored.name ? stored.name : (email.split('@')[0]);
                localStorage.setItem('userName', nameFromUsers);

                                alert('Login realizado com sucesso!');
                                if (authModal) {
                                    authModal.classList.remove('active');
                                    document.body.style.overflow = '';
                                }
                
                // Redirecionar para o dashboard
                window.location.href = 'dashboard.html';
            }, 800);
        });
    }
    
    // Submit do formulário de cadastro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            // Validações
            if (!name || !email || !password || !confirmPassword) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }
            
            if (!document.getElementById('acceptTerms').checked) {
                alert('Você precisa aceitar os termos de uso.');
                return;
            }
            
            // Feedback visual: carregando
            setLoadingState(registerForm, true, { loading: 'Criando...', default: 'Criar conta' });

            // Simulação de cadastro: com delay para exibir loading/spinner
            setTimeout(() => {
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', name);
                // Salva nome completo no objeto users
                const users = getUsersObj();
                users[email] = { name, password };
                setUsersObj(users);
                // Atualiza último acesso
                const now = new Date();
                localStorage.setItem('userLastAccess', now.toLocaleString());

                                alert('Cadastro realizado com sucesso!');
                                if (authModal) {
                                    authModal.classList.remove('active');
                                    document.body.style.overflow = '';
                                }
                
                // Redirecionar para o dashboard
                window.location.href = 'dashboard.html';
            }, 800);
        });
    }
    
        // Recuperação de senha - Modal com fluxo (email -> código -> nova senha)
        function openForgotModal(prefillEmail) {
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.inset = '0';
                overlay.style.background = 'rgba(0,0,0,0.55)';
                overlay.style.display = 'flex';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.style.zIndex = '10000';

                const card = document.createElement('div');
                card.style.background = '#23243a';
                card.style.color = '#fff';
                card.style.borderRadius = '16px';
                card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
                card.style.padding = '20px 18px';
                card.style.minWidth = '320px';
                card.style.maxWidth = '92vw';
                card.style.width = '420px';

                card.innerHTML = `
                    <h3 style="margin:0 0 12px 0; color:#00d4ff; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-unlock-alt"></i> Recuperar senha
                    </h3>
                    <div id="step1">
                        <label style="display:block; font-weight:600; color:#a6e7ff; margin-bottom:6px;">E-mail da conta</label>
                        <input id="fpEmail" type="email" placeholder="voce@exemplo.com" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid #3a3b54; background:#1c1d32; color:#fff;">
                        <small style="display:block; margin-top:8px; color:#aeb7d0; opacity:.9;">Enviaremos um código de verificação (simulado).</small>
                        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:14px;">
                            <button id="fpCancel1" class="btn-secondary" style="padding:10px 14px; border-radius:10px; border:1px solid #3a3b54; background:#323453; color:#fff; cursor:pointer;">Cancelar</button>
                            <button id="fpSend" class="btn-primary" style="padding:10px 14px; border-radius:10px; background:#00d4ff; color:#111; font-weight:700; border:none; cursor:pointer;">Enviar código</button>
                        </div>
                    </div>
                    <div id="step2" style="display:none;">
                        <label style="display:block; font-weight:600; color:#a6e7ff; margin-bottom:6px;">Código recebido</label>
                        <input id="fpCode" type="text" placeholder="6 dígitos" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid #3a3b54; background:#1c1d32; color:#fff;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                            <label style="font-weight:600; color:#a6e7ff;">Nova senha
                                <input id="fpPass" type="password" placeholder="********" style="margin-top:6px; width:100%; padding:10px 12px; border-radius:10px; border:1px solid #3a3b54; background:#1c1d32; color:#fff;">
                            </label>
                            <label style="font-weight:600; color:#a6e7ff;">Confirmar senha
                                <input id="fpPass2" type="password" placeholder="********" style="margin-top:6px; width:100%; padding:10px 12px; border-radius:10px; border:1px solid #3a3b54; background:#1c1d32; color:#fff;">
                            </label>
                        </div>
                        <small id="fpHint" style="display:block; margin-top:8px; color:#aeb7d0; opacity:.9;"></small>
                        <div style="display:flex; gap:10px; justify-content:space-between; margin-top:14px;">
                            <button id="fpBack" class="btn-secondary" style="padding:10px 14px; border-radius:10px; border:1px solid #3a3b54; background:#323453; color:#fff; cursor:pointer;">Voltar</button>
                            <div style="display:flex; gap:10px;">
                                <button id="fpCancel2" class="btn-secondary" style="padding:10px 14px; border-radius:10px; border:1px solid #3a3b54; background:#323453; color:#fff; cursor:pointer;">Cancelar</button>
                                <button id="fpReset" class="btn-primary" style="padding:10px 14px; border-radius:10px; background:#00d4ff; color:#111; font-weight:700; border:none; cursor:pointer;">Redefinir</button>
                            </div>
                        </div>
                    </div>
                `;

                overlay.appendChild(card);
                document.body.appendChild(overlay);

                const emailEl = card.querySelector('#fpEmail');
                const codeEl = card.querySelector('#fpCode');
                const passEl = card.querySelector('#fpPass');
                const pass2El = card.querySelector('#fpPass2');
                const hintEl = card.querySelector('#fpHint');
                const step1 = card.querySelector('#step1');
                const step2 = card.querySelector('#step2');
                const btnSend = card.querySelector('#fpSend');
                const btnReset = card.querySelector('#fpReset');
                const btnBack = card.querySelector('#fpBack');
                const btnCancel1 = card.querySelector('#fpCancel1');
                const btnCancel2 = card.querySelector('#fpCancel2');

                if (prefillEmail) emailEl.value = prefillEmail;

                function close() { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }
                [btnCancel1, btnCancel2].forEach(b => b && b.addEventListener('click', close));
                overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });
                overlay.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') close(); });

                function genCode() {
                        const n = Math.floor(100000 + Math.random() * 900000);
                        return String(n);
                }
                function saveCode(email, code) {
                        let codes = {};
                        try { codes = JSON.parse(localStorage.getItem('resetCodes') || '{}'); } catch {}
                        codes[email] = { code, exp: Date.now() + 10 * 60 * 1000 }; // 10min
                        localStorage.setItem('resetCodes', JSON.stringify(codes));
                }
                function getCode(email) {
                        try {
                                const codes = JSON.parse(localStorage.getItem('resetCodes') || '{}');
                                return codes[email];
                        } catch { return null; }
                }

                btnSend.addEventListener('click', () => {
                        const email = (emailEl.value || '').trim();
                        if (!email) { alert('Informe seu e-mail.'); emailEl.focus(); return; }
                        const users = getUsersObj();
                        if (!users[email]) { alert('E-mail não cadastrado. Faça seu cadastro primeiro.'); return; }
                        const code = genCode();
                        saveCode(email, code);
                        // Dica no demo: exibimos o código na UI
                        hintEl.textContent = `Código enviado (demo): ${code}. Validade: 10 minutos.`;
                        step1.style.display = 'none';
                        step2.style.display = '';
                        setTimeout(() => codeEl && codeEl.focus(), 0);
                });

                btnBack.addEventListener('click', () => {
                        step2.style.display = 'none';
                        step1.style.display = '';
                });

                btnReset.addEventListener('click', () => {
                        const email = (emailEl.value || '').trim();
                        const rec = getCode(email);
                        const code = (codeEl.value || '').trim();
                        const p1 = (passEl.value || '').trim();
                        const p2 = (pass2El.value || '').trim();
                        if (!code) { alert('Informe o código.'); codeEl.focus(); return; }
                        if (!rec) { alert('Código expirado. Envie novamente.'); return; }
                        if (Date.now() > rec.exp) { alert('Código expirado. Envie novamente.'); return; }
                        if (code !== rec.code) { alert('Código inválido.'); return; }
                        if (!p1 || p1.length < 4) { alert('A senha deve ter ao menos 4 caracteres.'); passEl.focus(); return; }
                        if (p1 !== p2) { alert('As senhas não coincidem.'); pass2El.focus(); return; }
                        const users = getUsersObj();
                        if (!users[email]) { alert('Usuário não encontrado.'); return; }
                        users[email] = { ...(users[email]||{}), password: p1 };
                        setUsersObj(users);
                        // Pré-preenche login com a nova senha
                        const loginEmail = document.getElementById('loginEmail');
                        const loginPassword = document.getElementById('loginPassword');
                        if (loginEmail) loginEmail.value = email;
                        if (loginPassword) loginPassword.value = p1;
                        // Alterna para a aba de login
                        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                        if (loginTab) loginTab.click();
                        alert('Senha redefinida com sucesso!');
                        close();
                });
        }

        // Recuperação de senha
        const forgotPassword = document.getElementById('forgotPassword');
        if (forgotPassword) {
                forgotPassword.addEventListener('click', function(e) {
                        e.preventDefault();
                        const prefill = document.getElementById('loginEmail')?.value || '';
                        openForgotModal(prefill);
                });
        }
        // ...existing code...
(function () {
  const API = () => (typeof window.API_BASE === 'string' && window.API_BASE) ? window.API_BASE : null;

  async function api(path, payload) {
    const res = await fetch(API() + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    if (!res.ok) {
      let t = '';
      try { t = await res.text(); } catch {}
      throw new Error(t || res.statusText);
    }
    return res.json();
  }

  function setLoggedIn(u) {
    const name = u.name || (u.email ? u.email.split('@')[0] : 'Usuário');
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userEmail', u.email);
    localStorage.setItem('userName', name);
    localStorage.setItem('userLastAccess', new Date().toISOString());
  }

  async function remoteRegister(name, email, password) {
    const { user } = await api('/auth/register', { name, email, password });
    setLoggedIn(user);
    return user;
  }

  async function remoteLogin(email, password) {
    const { user } = await api('/auth/login', { email, password });
    setLoggedIn(user);
    return user;
  }

  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!API()) return; // sem API, mantém fluxo local
    if (form.id === 'registerForm' || form.matches?.('.register-form')) {
      e.preventDefault();
      const name = form.querySelector('#registerName, [name="name"]')?.value?.trim();
      const email = form.querySelector('#registerEmail, [name="email"]')?.value?.trim();
      const password = form.querySelector('#registerPassword, [name="password"]')?.value || '';
      if (!name || !email || !password) return alert('Preencha nome, e-mail e senha.');
      try {
        await remoteRegister(name, email, password);
        location.href = 'dashboard.html';
      } catch (err) {
        alert('Erro ao cadastrar: ' + err.message);
      }
    }
    if (form.id === 'loginForm' || form.matches?.('.login-form')) {
      e.preventDefault();
      const email = form.querySelector('#loginEmail, [name="email"]')?.value?.trim();
      const password = form.querySelector('#loginPassword, [name="password"]')?.value || '';
      if (!email || !password) return alert('Informe e-mail e senha.');
      try {
        await remoteLogin(email, password);
        location.href = 'dashboard.html';
      } catch (err) {
        alert('Login falhou: ' + err.message);
      }
    }
  }, true);
})();
});