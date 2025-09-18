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
    if (isLoggedIn === 'true' && window.location.pathname.endsWith('index.html')) {
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
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                // Atualiza último acesso
                const now = new Date();
                localStorage.setItem('userLastAccess', now.toLocaleString());

                // Verificar se há nome no cadastro
                const userName = localStorage.getItem('userName');
                // Não sobrescreve o nome completo se já existir
                if (!userName || userName === email.split('@')[0]) {
                    // Tenta recuperar nome do cadastro salvo
                    const users = JSON.parse(localStorage.getItem('users') || '{}');
                    if (users[email] && users[email].name) {
                        localStorage.setItem('userName', users[email].name);
                    } else {
                        localStorage.setItem('userName', email.split('@')[0]);
                    }
                }

                alert('Login realizado com sucesso!');
                authModal.classList.remove('active');
                document.body.style.overflow = '';
                
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
                let users = {};
                try {
                    users = JSON.parse(localStorage.getItem('users')) || {};
                } catch {}
                users[email] = { name };
                localStorage.setItem('users', JSON.stringify(users));
                // Atualiza último acesso
                const now = new Date();
                localStorage.setItem('userLastAccess', now.toLocaleString());

                alert('Cadastro realizado com sucesso!');
                authModal.classList.remove('active');
                document.body.style.overflow = '';
                
                // Redirecionar para o dashboard
                window.location.href = 'dashboard.html';
            }, 800);
        });
    }
    
    // Recuperação de senha
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value || prompt('Digite seu e-mail para recuperação:');
            if (email) {
                alert(`Um e-mail de recuperação será enviado para: ${email}`);
            }
        });
    }
});