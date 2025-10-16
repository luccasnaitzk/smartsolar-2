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
    const showMessage = (message, type = 'info') => {
        // Remove mensagens existentes
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-message-${type}`;
        messageEl.innerHTML = `
            <div class="auth-message-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Adiciona estilo CSS para as mensagens
        if (!document.querySelector('#auth-message-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-message-styles';
            style.textContent = `
                .auth-message {
                    padding: 12px 16px;
                    margin: 16px 0;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    animation: slideDown 0.3s ease;
                }
                .auth-message-error {
                    background: rgba(244, 67, 54, 0.1);
                    border: 1px solid rgba(244, 67, 54, 0.3);
                    color: #f44336;
                }
                .auth-message-success {
                    background: rgba(76, 175, 80, 0.1);
                    border: 1px solid rgba(76, 175, 80, 0.3);
                    color: #4caf50;
                }
                .auth-message-info {
                    background: rgba(33, 150, 243, 0.1);
                    border: 1px solid rgba(33, 150, 243, 0.3);
                    color: #2196f3;
                }
                .auth-message-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Insere a mensagem no modal
        const authHeader = document.querySelector('.auth-header');
        if (authHeader) {
            authHeader.parentNode.insertBefore(messageEl, authHeader.nextSibling);
        }
        
        // Auto-remove mensagens de sucesso/info após 5 segundos
        if (type !== 'error') {
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.style.opacity = '0';
                    messageEl.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => messageEl.remove(), 300);
                }
            }, 5000);
        }
    };

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
                btn.disabled = true;
            } else {
                btn.textContent = labels.default;
                btn.disabled = false;
            }
        }
    };
    
    // Verificar sessão somente se for válida no backend
    (async function strictRedirectGuard(){
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const email = localStorage.getItem('userEmail') || '';
        const path = window.location.pathname;
        const onGateway = /(?:index\.html?$|\/index$|auth\.html?$)/i.test(path);
        if (!isLoggedIn || !onGateway) return;
        // Aguarda autodetecção da API
        const wait = () => new Promise(r=>{ const s=Date.now(); (function t(){ if (window.API_READY===true||Date.now()-s>1200) return r(); setTimeout(t,60); })(); });
        await wait();
        if (!window.API_BASE) return; // sem API não redireciona
        try {
            const res = await fetch(window.API_BASE + '/users/get.php', {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })
            });
            const j = res.ok ? await res.json() : null;
            if (j && j.user) window.location.href = 'dashboard.html';
            else {
                // sessão inválida; limpa e permanece
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userName');
            }
        } catch {}
    })();
    
    // Abrir modal de autenticação
    if (authBtn) {
        authBtn.addEventListener('click', function() {
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Remove mensagens anteriores ao abrir
            document.querySelectorAll('.auth-message').forEach(msg => msg.remove());
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
            document.body.style.overflow = '';
            // Remove mensagens ao fechar
            document.querySelectorAll('.auth-message').forEach(msg => msg.remove());
        });
    }
    
    // Fechar modal clicando fora dele
    if (authModal) {
      authModal.addEventListener('click', function(e) {
          if (e.target === authModal) {
              authModal.classList.remove('active');
              document.body.style.overflow = '';
              // Remove mensagens ao fechar
              document.querySelectorAll('.auth-message').forEach(msg => msg.remove());
          }
      });
    }
    
    // Alternar entre abas de login e cadastro
    if (authTabs.length && authForms.length) {
      authTabs.forEach(tab => {
          tab.addEventListener('click', function() {
              const tabName = this.getAttribute('data-tab');
              
              // Remove mensagens ao trocar de aba
              document.querySelectorAll('.auth-message').forEach(msg => msg.remove());
              
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
            // Se API estiver ativa, não usar fallback local
            if (window.API_BASE) return;
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            // Validação simples
            if (!email || !password) {
                showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            // Feedback visual: carregando
            setLoadingState(loginForm, true, { loading: 'Entrando...', default: 'Entrar' });

            // Simulação de login: com delay para exibir loading/spinner
            setTimeout(() => {
                // Se houver senha cadastrada para o usuário, validar
                const users = getUsersObj();
                const stored = users[email];
                
                if (!stored || !stored.password) {
                    setLoadingState(loginForm, false, { loading: 'Entrando...', default: 'Entrar' });
                    showMessage('E-mail não cadastrado. Crie uma conta primeiro.', 'error');
                    return;
                }
                
                if (stored.password !== password) {
                    setLoadingState(loginForm, false, { loading: 'Entrando...', default: 'Entrar' });
                    showMessage('Senha incorreta. Tente novamente.', 'error');
                    return;
                }
                
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                // Atualiza último acesso
                const now = new Date();
                localStorage.setItem('userLastAccess', now.toLocaleString());

                // Verificar se há nome no cadastro
                const nameFromUsers = stored && stored.name ? stored.name : (email.split('@')[0]);
                localStorage.setItem('userName', nameFromUsers);

                setLoadingState(loginForm, false, { loading: 'Entrando...', default: 'Entrar' });
                showMessage('Login realizado com sucesso! Redirecionando...', 'success');
                
                setTimeout(() => {
                    if (authModal) {
                        authModal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                    // Redirecionar para o dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
            }, 800);
        });
    }
    
    // Submit do formulário de cadastro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            // Se API estiver ativa, não usar fallback local
            if (window.API_BASE) return;
            e.preventDefault();
            
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            // Validações
            if (!name || !email || !password || !confirmPassword) {
                showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('As senhas não coincidem.', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
                return;
            }
            
            if (!document.getElementById('acceptTerms').checked) {
                showMessage('Você precisa aceitar os termos de uso.', 'error');
                return;
            }
            
            // Verificar se email já existe
            const users = getUsersObj();
            if (users[email]) {
                showMessage('Este e-mail já está cadastrado. Faça login ou use outro e-mail.', 'error');
                return;
            }
            
            // Feedback visual: carregando
            setLoadingState(registerForm, true, { loading: 'Criando conta...', default: 'Criar conta' });

            // Simulação de cadastro: com delay para exibir loading/spinner
            setTimeout(() => {
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', name);
                // Salva nome completo no objeto users
                users[email] = { name, password };
                setUsersObj(users);
                // Atualiza último acesso
                const now = new Date();
                localStorage.setItem('userLastAccess', now.toLocaleString());

                setLoadingState(registerForm, false, { loading: 'Criando conta...', default: 'Criar conta' });
                showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
                
                setTimeout(() => {
                    if (authModal) {
                        authModal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                    // Redirecionar para o dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
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
                <div id="fpMessage1"></div>
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
                <div id="fpMessage2"></div>
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
        const message1 = card.querySelector('#fpMessage1');
        const message2 = card.querySelector('#fpMessage2');

        function showFPMessage(message, type, container) {
            const el = container === 1 ? message1 : message2;
            el.innerHTML = `<div style="padding:8px 12px; margin:8px 0; border-radius:6px; background:${type === 'error' ? 'rgba(244,67,54,0.1)' : 'rgba(76,175,80,0.1)'}; color:${type === 'error' ? '#f44336' : '#4caf50'}; border:1px solid ${type === 'error' ? 'rgba(244,67,54,0.3)' : 'rgba(76,175,80,0.3)'}; font-size:13px;">${message}</div>`;
        }

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
            if (!email) { 
                showFPMessage('Informe seu e-mail.', 'error', 1);
                emailEl.focus(); 
                return; 
            }
            const users = getUsersObj();
            if (!users[email]) { 
                showFPMessage('E-mail não cadastrado. Faça seu cadastro primeiro.', 'error', 1);
                return; 
            }
            const code = genCode();
            saveCode(email, code);
            // Dica no demo: exibimos o código na UI
            hintEl.textContent = `Código enviado (demo): ${code}. Validade: 10 minutos.`;
            showFPMessage('Código enviado com sucesso! Verifique seu e-mail.', 'success', 1);
            step1.style.display = 'none';
            step2.style.display = '';
            setTimeout(() => codeEl && codeEl.focus(), 0);
        });

        btnBack.addEventListener('click', () => {
            step2.style.display = 'none';
            step1.style.display = '';
            message2.innerHTML = '';
        });

        btnReset.addEventListener('click', () => {
            const email = (emailEl.value || '').trim();
            const rec = getCode(email);
            const code = (codeEl.value || '').trim();
            const p1 = (passEl.value || '').trim();
            const p2 = (pass2El.value || '').trim();
            
            if (!code) { 
                showFPMessage('Informe o código.', 'error', 2);
                codeEl.focus(); 
                return; 
            }
            if (!rec) { 
                showFPMessage('Código expirado. Envie novamente.', 'error', 2);
                return; 
            }
            if (Date.now() > rec.exp) { 
                showFPMessage('Código expirado. Envie novamente.', 'error', 2);
                return; 
            }
            if (code !== rec.code) { 
                showFPMessage('Código inválido.', 'error', 2);
                return; 
            }
            if (!p1 || p1.length < 6) { 
                showFPMessage('A senha deve ter pelo menos 6 caracteres.', 'error', 2);
                passEl.focus(); 
                return; 
            }
            if (p1 !== p2) { 
                showFPMessage('As senhas não coincidem.', 'error', 2);
                pass2El.focus(); 
                return; 
            }
            const users = getUsersObj();
            if (!users[email]) { 
                showFPMessage('Usuário não encontrado.', 'error', 2);
                return; 
            }
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
            
            showFPMessage('Senha redefinida com sucesso! Faça login com sua nova senha.', 'success', 2);
            
            setTimeout(() => {
                close();
                showMessage('Senha redefinida com sucesso! Faça login com sua nova senha.', 'success');
            }, 2000);
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

    // Sistema de API remota
    (function () {
        const API = () => (typeof window.API_BASE === 'string' && window.API_BASE) ? window.API_BASE : null;

        function waitForApiReady(maxMs = 1200) {
            return new Promise(resolve => {
                const start = Date.now();
                const tick = () => {
                    if (window.API_READY === true || Date.now() - start >= maxMs) return resolve(!!API());
                    setTimeout(tick, 60);
                };
                tick();
            });
        }

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
            const { user } = await api('/auth/register.php', { name, email, password });
            setLoggedIn(user);
            return user;
        }

        async function remoteLogin(email, password) {
            const { user } = await api('/auth/login.php', { email, password });
            setLoggedIn(user);
            return user;
        }

        document.addEventListener('submit', async (e) => {
            const form = e.target;
            // Espera breve para a autodetecção terminar e evitar cair no modo local por engano
            if (!API()) {
                await waitForApiReady();
            }
            if (!API()) return; // sem API, mantém fluxo local
            
            if (form.id === 'registerForm' || form.matches?.('.register-form')) {
                e.preventDefault();
                const name = form.querySelector('#registerName, [name="name"]')?.value?.trim();
                const email = form.querySelector('#registerEmail, [name="email"]')?.value?.trim();
                const password = form.querySelector('#registerPassword, [name="password"]')?.value || '';
                
                if (!name || !email || !password) {
                    showMessage('Preencha nome, e-mail e senha.', 'error');
                    return;
                }
                
                if (password.length < 6) {
                    showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
                    return;
                }
                
                if (!document.getElementById('acceptTerms')?.checked) {
                    showMessage('Você precisa aceitar os termos de uso.', 'error');
                    return;
                }
                
                setLoadingState(form, true, { loading: 'Criando conta...', default: 'Criar conta' });
                
                try {
                    await remoteRegister(name, email, password);
                    showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
                    setTimeout(() => location.href = 'dashboard.html', 1500);
                } catch (err) {
                    setLoadingState(form, false, { loading: 'Criando conta...', default: 'Criar conta' });
                    showMessage('Erro ao cadastrar: ' + err.message, 'error');
                }
            }
            
            if (form.id === 'loginForm' || form.matches?.('.login-form')) {
                e.preventDefault();
                const email = form.querySelector('#loginEmail, [name="email"]')?.value?.trim();
                const password = form.querySelector('#loginPassword, [name="password"]')?.value || '';
                
                if (!email || !password) {
                    showMessage('Informe e-mail e senha.', 'error');
                    return;
                }
                
                setLoadingState(form, true, { loading: 'Entrando...', default: 'Entrar' });
                
                try {
                    await remoteLogin(email, password);
                    showMessage('Login realizado com sucesso! Redirecionando...', 'success');
                    setTimeout(() => location.href = 'dashboard.html', 1500);
                } catch (err) {
                    setLoadingState(form, false, { loading: 'Entrando...', default: 'Entrar' });
                    showMessage('Seu email ou senha estão incorretos, tente novament', 'error');
                }
            }
        }, true);

        // Diagnóstico: informa no console o modo atual 
        (async () => {
            await waitForApiReady();
            if (API()) console.info('[SmartSolar] Modo remoto ON →', API());
            else console.info('[SmartSolar] Modo local (sem API)');
        })();
    })();
});
