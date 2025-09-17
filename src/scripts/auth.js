// Script para funcionalidade de autenticação
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do modal de autenticação
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
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
            
            // Simulação de login bem-sucedido
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            
            // Verificar se há nome no cadastro
            const userName = localStorage.getItem('userName');
            if (!userName) {
                localStorage.setItem('userName', email.split('@')[0]);
            }
            
            alert('Login realizado com sucesso!');
            authModal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Redirecionar para o dashboard
            window.location.href = 'dashboard.html';
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
            
            // Simulação de cadastro bem-sucedido
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            
            alert('Cadastro realizado com sucesso!');
            authModal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Redirecionar para o dashboard
            window.location.href = 'dashboard.html';
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