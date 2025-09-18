        // Atualiza título do gráfico de barras
        const barTitle = document.querySelector('h3#barChartTitle, h3.producao-bar-title');
        if (barTitle) {
          if (idx === 1) barTitle.textContent = 'Produção Semanal';
          else if (idx === 2) barTitle.textContent = 'Produção Mensal';
          else barTitle.textContent = 'Produção por Hora';
        }
  // Filtro de tempo na Visão Geral
  document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach((btn, idx) => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Atualiza KPIs conforme filtro
        let fator = 1;
        if (idx === 1) fator = 7; // Semana
        if (idx === 2) fator = 30; // Mês
        // Geração, Consumo, Energia, Economia
        const placas = [
          { potencia: 2.5 },
          { potencia: 2.5 },
          { potencia: 3.0 }
        ];
        const totalPotencia = placas.reduce((sum, p) => sum + p.potencia, 0);
        document.getElementById('powerNow').textContent = `${(totalPotencia * fator).toFixed(1)} kW`;
        document.getElementById('loadNow').textContent = `${(totalPotencia * 0.8 * fator).toFixed(2)} kW`;
        document.getElementById('energyToday').textContent = `${(totalPotencia * 5 * fator).toFixed(2)} kWh`;
        document.getElementById('revenueToday').textContent = `R$ ${(totalPotencia * 2 * fator).toFixed(2)}`;

        // Atualiza gráfico geração vs consumo
        if (typeof realtimeChart !== 'undefined') {
          window._realtimeChartFilter = idx;
          if (idx === 0) {
            // Hoje: por hora
            realtimeChart.data.labels = [
              '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'
            ];
            realtimeChart.data.datasets[0].data = [2, 3, 4, 5, 4.5, 3.8, 2.5, 2, 1.5];
            realtimeChart.data.datasets[1].data = [1.5, 2.2, 2.8, 3.5, 3.2, 2.7, 2, 1.8, 1.2];
            realtimeChart.options.scales.x.title.text = 'Hora';
            if (typeof dailyBarChart !== 'undefined') {
              dailyBarChart.data.labels = ['06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
              dailyBarChart.data.datasets[0].data = [4,5,6,7,5,4,6,5,4];
              dailyBarChart.options.scales.x.title.text = 'Hora';
              dailyBarChart.update();
            }
          } else if (idx === 1) {
            // Semana: por dia
            realtimeChart.data.labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
            realtimeChart.data.datasets[0].data = [25, 28, 30, 27, 26, 29, 31];
            realtimeChart.data.datasets[1].data = [20, 22, 24, 23, 21, 25, 26];
            realtimeChart.options.scales.x.title.text = 'Dia da Semana';
            if (typeof dailyBarChart !== 'undefined') {
              dailyBarChart.data.labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
              dailyBarChart.data.datasets[0].data = [45, 52, 48, 50];
              dailyBarChart.options.scales.x.title.text = 'Semana';
              dailyBarChart.update();
            }
          } else if (idx === 2) {
            // Mês: por mês
            realtimeChart.data.labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            realtimeChart.data.datasets[0].data = [210, 220, 230, 240, 250, 260, 270, 265, 255, 245, 235, 225];
            realtimeChart.data.datasets[1].data = [180, 190, 200, 210, 220, 230, 240, 235, 225, 215, 205, 195];
            realtimeChart.options.scales.x.title.text = 'Mês';
            if (typeof dailyBarChart !== 'undefined') {
              dailyBarChart.data.labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
              dailyBarChart.data.datasets[0].data = [120, 130, 140, 150, 160, 170, 180, 175, 165, 155, 145, 135];
              dailyBarChart.options.scales.x.title.text = 'Mês';
              dailyBarChart.update();
            }
          }
          realtimeChart.update();
        }
      });
    });
  });
  // Botão Salvar Notificações
  const saveNotifications = document.getElementById('saveNotifications');
  if (saveNotifications && emailNotify && smsNotify && alertLowGen) {
    saveNotifications.addEventListener('click', function() {
      localStorage.setItem('notifyEmail', emailNotify.value);
      localStorage.setItem('notifySMS', smsNotify.value);
      localStorage.setItem('alertLowGen', alertLowGen.checked);
      alert('Notificações salvas!');
    });
  }
  // Permissões de usuário
  const setPermBtn = document.getElementById('setPermBtn');
  const userPermSelect = document.getElementById('userPermSelect');
  const permUserName = document.getElementById('permUserName');

  function getUserPerms() {
    return JSON.parse(localStorage.getItem('userPerms') || '{}');
  }
  function setUserPerm(name, perm) {
    let perms = getUserPerms();
    perms[name] = perm;
    localStorage.setItem('userPerms', JSON.stringify(perms));
  }
  function getPermForUser(name) {
    let perms = getUserPerms();
    return perms[name] || 'viewer';
  }

  if (setPermBtn && userPermSelect && permUserName) {
    setPermBtn.addEventListener('click', function() {
      const name = permUserName.value.trim();
      if (!name) return alert('Informe o nome ou e-mail do usuário!');
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      if (!users.includes(name)) return alert('Usuário não cadastrado!');
      setUserPerm(name, userPermSelect.value);
      alert('Permissão definida!');
      updateUserList();
      permUserName.value = '';
    });
  }

  // Atualiza lista de usuários cadastrados
  function updateUserList() {
    const userList = document.getElementById('userList');
    if (userList) {
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      let perms = getUserPerms();
      userList.innerHTML = '';
      if (users.length === 0) {
        userList.innerHTML = '<li style="color:#e63946;">Nenhum usuário cadastrado</li>';
      } else {
        users.forEach(u => {
          const li = document.createElement('li');
          const perm = perms[u] || 'visualizador';
          li.innerHTML = `${u} <span style="font-size:0.9em; color:#fff; background:#00d4ff; border-radius:6px; padding:2px 8px; margin-left:8px;">${perm === 'admin' ? 'Administrador' : 'Visualizador'}</span>`;
          userList.appendChild(li);
        });
      }
    }
  }

// Configurações: Preferências do Usuário, Notificações, Backup/Restauração, Gerenciamento de Usuários
document.addEventListener("DOMContentLoaded", () => {
  // Tema
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = localStorage.getItem('theme') || 'light';
    themeSelect.addEventListener('change', function() {
      document.body.setAttribute('data-theme', themeSelect.value);
      localStorage.setItem('theme', themeSelect.value);
    });
    document.body.setAttribute('data-theme', themeSelect.value);
  }

  // Idioma
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = localStorage.getItem('lang') || 'pt';
    langSelect.addEventListener('change', function() {
      localStorage.setItem('lang', langSelect.value);
      setLanguage(langSelect.value);
    });
    setLanguage(langSelect.value);
  }

  // Função para trocar textos da interface
  function setLanguage(lang) {
    const translations = {
      pt: {
        configTitle: 'Configurações',
        userPref: 'Preferências do Usuário',
        theme: 'Tema',
        language: 'Idioma',
        notifications: 'Notificações',
        email: 'E-mail',
        sms: 'SMS',
        alertLowGen: 'Alertar geração baixa',
        backup: 'Fazer Backup',
        restore: 'Restaurar',
        userMgmt: 'Gerenciamento de Usuários',
        addUser: 'Adicionar Usuário',
        removeUser: 'Remover Usuário',
        usersList: 'Usuários cadastrados',
        permTitle: 'Permissão do Usuário',
        admin: 'Administrador',
        viewer: 'Visualizador',
        setPerm: 'Definir Permissão'
      },
      en: {
        configTitle: 'Settings',
        userPref: 'User Preferences',
        theme: 'Theme',
        language: 'Language',
        notifications: 'Notifications',
        email: 'Email',
        sms: 'SMS',
        alertLowGen: 'Alert low generation',
        backup: 'Backup',
        restore: 'Restore',
        userMgmt: 'User Management',
        addUser: 'Add User',
        removeUser: 'Remove User',
        usersList: 'Registered Users',
        permTitle: 'User Permission',
        admin: 'Administrator',
        viewer: 'Viewer',
        setPerm: 'Set Permission'
      }
    };
    const t = translations[lang] || translations.pt;
    // Títulos
    const configTitle = document.querySelector('#section-configuracoes h2');
    if (configTitle) configTitle.innerHTML = `<i class="fas fa-cogs"></i> ${t.configTitle}`;
    // Preferências do Usuário
    const userPref = document.querySelector('.config-card .card-header h3 i.fa-user-cog')?.parentNode;
    if (userPref) userPref.innerHTML = `<i class="fas fa-user-cog"></i> ${t.userPref}`;
    // Tema
    const themeLabel = document.querySelector('label[for="themeSelect"]');
    if (themeLabel) themeLabel.innerHTML = `<i class="fas fa-paint-brush"></i> ${t.theme}`;
    // Idioma
    const langLabel = document.querySelector('label[for="langSelect"]');
    if (langLabel) langLabel.innerHTML = `<i class="fas fa-language"></i> ${t.language}`;
    // Notificações
    const notifHeader = document.querySelector('.config-card .card-header h3 i.fa-bell')?.parentNode;
    if (notifHeader) notifHeader.innerHTML = `<i class="fas fa-bell"></i> ${t.notifications}`;
    const emailLabel = document.querySelector('label[for="emailNotify"]');
    if (emailLabel) emailLabel.innerHTML = `<i class="fas fa-envelope"></i> ${t.email}`;
    const smsLabel = document.querySelector('label[for="smsNotify"]');
    if (smsLabel) smsLabel.innerHTML = `<i class="fas fa-mobile-alt"></i> ${t.sms}`;
    const alertLowGenLabel = document.querySelector('label[for="alertLowGen"]');
    if (alertLowGenLabel) alertLowGenLabel.innerHTML = `<input type="checkbox" id="alertLowGen"> ${t.alertLowGen}`;
    // Backup/Restauração
    const backupHeader = document.querySelector('.config-card .card-header h3 i.fa-database')?.parentNode;
    if (backupHeader) backupHeader.innerHTML = `<i class="fas fa-database"></i> ${t.backup} & ${t.restore}`;
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) backupBtn.innerHTML = `<i class="fas fa-download"></i> ${t.backup}`;
    const restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) restoreBtn.innerHTML = `<i class="fas fa-upload"></i> ${t.restore}`;
    // Gerenciamento de Usuários
    const userMgmtHeader = document.querySelector('.config-card .card-header h3 i.fa-users-cog')?.parentNode;
    if (userMgmtHeader) userMgmtHeader.innerHTML = `<i class="fas fa-users-cog"></i> ${t.userMgmt}`;
    const addUserLabel = document.querySelector('label[for="addUser"]');
    if (addUserLabel) addUserLabel.innerHTML = `<i class="fas fa-user-plus"></i> ${t.addUser}`;
    const removeUserLabel = document.querySelector('label[for="removeUser"]');
    if (removeUserLabel) removeUserLabel.innerHTML = `<i class="fas fa-user-minus"></i> ${t.removeUser}`;
    const usersListLabel = document.querySelector('.config-field label i.fa-users')?.parentNode;
    if (usersListLabel) usersListLabel.innerHTML = `<i class="fas fa-users"></i> ${t.usersList}`;
    // Permissão
    const permTitleLabel = document.querySelector('label[for="userPermSelect"]');
    if (permTitleLabel) permTitleLabel.innerHTML = `<i class="fas fa-user-shield"></i> ${t.permTitle}`;
    const adminOption = document.querySelector('#userPermSelect option[value="admin"]');
    if (adminOption) adminOption.textContent = t.admin;
    const viewerOption = document.querySelector('#userPermSelect option[value="viewer"]');
    if (viewerOption) viewerOption.textContent = t.viewer;
    const setPermBtn = document.getElementById('setPermBtn');
    if (setPermBtn) setPermBtn.innerHTML = `<i class="fas fa-check"></i> ${t.setPerm}`;
  }

  // Notificações
  const emailNotify = document.getElementById('emailNotify');
  const smsNotify = document.getElementById('smsNotify');
  const alertLowGen = document.getElementById('alertLowGen');
  if (emailNotify) {
    emailNotify.value = localStorage.getItem('notifyEmail') || '';
    emailNotify.addEventListener('input', function() {
      localStorage.setItem('notifyEmail', emailNotify.value);
    });
  }
  if (smsNotify) {
    smsNotify.value = localStorage.getItem('notifySMS') || '';
    smsNotify.addEventListener('input', function() {
      localStorage.setItem('notifySMS', smsNotify.value);
    });
  }
  if (alertLowGen) {
    alertLowGen.checked = localStorage.getItem('alertLowGen') === 'true';
    alertLowGen.addEventListener('change', function() {
      localStorage.setItem('alertLowGen', alertLowGen.checked);
    });
  }

  // Backup & Restauração
  const backupBtn = document.getElementById('backupBtn');
  const restoreBtn = document.getElementById('restoreBtn');
  if (backupBtn) {
    backupBtn.addEventListener('click', function() {
      const config = {
        theme: localStorage.getItem('theme'),
        lang: localStorage.getItem('lang'),
        notifyEmail: localStorage.getItem('notifyEmail'),
        notifySMS: localStorage.getItem('notifySMS'),
        alertLowGen: localStorage.getItem('alertLowGen'),
      };
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'config_backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
  if (restoreBtn) {
    restoreBtn.addEventListener('click', function() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
          try {
            const config = JSON.parse(ev.target.result);
            if (config.theme) localStorage.setItem('theme', config.theme);
            if (config.lang) localStorage.setItem('lang', config.lang);
            if (config.notifyEmail) localStorage.setItem('notifyEmail', config.notifyEmail);
            if (config.notifySMS) localStorage.setItem('notifySMS', config.notifySMS);
            if (config.alertLowGen !== undefined) localStorage.setItem('alertLowGen', config.alertLowGen);
            window.location.reload();
          } catch (err) {
            alert('Arquivo de configuração inválido!');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  // Gerenciamento de Usuários (simples, local)
  const addUserBtn = document.getElementById('addUserBtn');
  const addUser = document.getElementById('addUser');
  const removeUserBtn = document.getElementById('removeUserBtn');
  const removeUser = document.getElementById('removeUser');
  if (addUserBtn && addUser) {
    addUserBtn.addEventListener('click', function() {
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      if (addUser.value && !users.includes(addUser.value)) {
        users.push(addUser.value);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Usuário adicionado!');
        addUser.value = '';
        updateUserList();
      }
    });
  }
  if (removeUserBtn && removeUser) {
    removeUserBtn.addEventListener('click', function() {
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      if (removeUser.value && users.includes(removeUser.value)) {
        users = users.filter(u => u !== removeUser.value);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Usuário removido!');
        removeUser.value = '';
        updateUserList();
      }
    });
  }
  updateUserList();
});
  // Atualiza horário sincronizado no header
  function updateHeaderTime() {
    const headerTimeValue = document.getElementById('headerTimeValue');
    if (headerTimeValue) {
      const now = new Date();
      headerTimeValue.textContent = now.toLocaleTimeString();
    }
  }
  setInterval(updateHeaderTime, 1000);
  updateHeaderTime();
  // Relatórios: geração e exportação
  const reportForm = document.getElementById('reportForm');
  const reportsTable = document.getElementById('reportsTable');
  const exportCsvBtn = document.getElementById('exportCsv');
  if (reportForm && reportsTable) {
    reportForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const start = document.getElementById('dateStart').value;
      const end = document.getElementById('dateEnd').value;
      const tbody = reportsTable.querySelector('tbody');
      tbody.innerHTML = '';
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10);
          // Simulação: alterna entre consumo e geração
          const tipo = (d.getDate() % 2 === 0) ? 'Consumo' : 'Geração';
          const descricao = tipo === 'Consumo' ? 'Consumo total' : 'Geração total';
          const valor = tipo === 'Consumo' ? `${100 + d.getDate()} kWh` : `${120 + d.getDate()} kWh`;
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${dateStr}</td><td>${tipo}</td><td>${descricao}</td><td>${valor}</td>`;
          tbody.appendChild(tr);
        }
      }
    });
  }
  if (exportCsvBtn && reportsTable) {
    exportCsvBtn.addEventListener('click', function() {
      const rows = Array.from(reportsTable.querySelectorAll('tr'));
      const csv = rows.map(row => Array.from(row.children).map(cell => cell.textContent).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
// Dashboard.js otimizado e funcional
document.addEventListener("DOMContentLoaded", () => {
  // Botão Sair: redireciona para página inicial
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'index.html';
    });
  }
  // Inicialização de placas
  const placas = [
    { nome: "Placa 01", potencia: 2.5, status: "Ativa" },
    { nome: "Placa 02", potencia: 2.5, status: "Ativa" },
    { nome: "Placa 03", potencia: 3.0, status: "Ativa" }
  ];

  // Função para renderizar tabela de placas
  function renderPlacas() {
    const placaTable = document.getElementById("placaTable");
    if (!placaTable) return;
    const tbody = placaTable.querySelector("tbody");
    tbody.innerHTML = "";
    placas.forEach((placa, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${placa.nome}</td><td>${placa.potencia} kWp</td><td>${placa.status}</td><td>
        <button data-idx='${idx}' class='btn-secondary btn-edit-placa'>Editar</button>
        <button data-idx='${idx}' class='btn-secondary btn-remove-placa'>Remover</button>
      </td>`;
      tbody.appendChild(tr);
    });
  }

  // Adiciona placa
  const placaForm = document.getElementById("placaForm");
  if (placaForm) {
    placaForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = placaForm.placaNome.value.trim();
      const potencia = parseFloat(placaForm.placaPotencia.value);
      const status = placaForm.placaStatus.value;
      if (nome && !isNaN(potencia)) {
        placas.push({ nome, potencia, status });
        renderPlacas();
        atualizarCards();
        placaForm.reset();
      }
    });
  }

  // Edita/Remove placa
  const placaTable = document.getElementById("placaTable");
  if (placaTable) {
    placaTable.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      if (e.target.classList.contains("btn-remove-placa") && !isNaN(idx)) {
        placas.splice(idx, 1);
        renderPlacas();
        atualizarCards();
      }
      if (e.target.classList.contains("btn-edit-placa") && !isNaN(idx)) {
        // Sempre remova qualquer modal de edição existente antes de criar um novo
        const oldModal = document.getElementById('editPlacaModal');
        if (oldModal) {
          oldModal.parentNode.removeChild(oldModal);
        }
        // Cria o modal único
  let modal = document.createElement('div');
  modal.id = 'editPlacaModal';
  // Remover qualquer classe 'modal' que possa ser adicionada
  modal.className = '';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';
        modal.innerHTML = `
          <div style=\"background:#23243a;padding:32px 24px;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,0.18);min-width:320px;max-width:90vw;\">
            <h2 style='color:#00d4ff;text-align:center;margin-bottom:18px;'>Editar Placa</h2>
            <div style='margin-bottom:14px;'>
              <label style='color:#fff;font-weight:500;'>Nome:</label>
              <input id='editPlacaNome' type='text' style='width:100%;padding:8px;border-radius:6px;border:1px solid #444;background:#23243a;color:#fff;' value='${placas[idx].nome}'>
            </div>
            <div style='margin-bottom:14px;'>
              <label style='color:#fff;font-weight:500;'>Potência (kWp):</label>
              <input id='editPlacaPotencia' type='number' step='0.01' style='width:100%;padding:8px;border-radius:6px;border:1px solid #444;background:#23243a;color:#fff;' value='${placas[idx].potencia}'>
            </div>
            <div style='margin-bottom:18px;'>
              <label style='color:#fff;font-weight:500;'>Status:</label>
              <select id='editPlacaStatus' style='width:100%;padding:8px;border-radius:6px;border:1px solid #444;background:#23243a;color:#fff;'>
                <option${placas[idx].status==="Ativa"?" selected":""}>Ativa</option>
                <option${placas[idx].status==="Inativa"?" selected":""}>Inativa</option>
              </select>
            </div>
            <div style='display:flex;gap:10px;'>
              <button id='savePlacaEdit' style='flex:1;background:#00d4ff;color:#fff;border:none;border-radius:6px;padding:10px 0;font-weight:600;cursor:pointer;'>Salvar</button>
              <button id='cancelPlacaEdit' style='flex:1;background:#e0e0e0;color:#333;border:none;border-radius:6px;padding:10px 0;font-weight:500;cursor:pointer;'>Cancelar</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        // Eventos dos botões
        document.getElementById('savePlacaEdit').onclick = function() {
          const nome = document.getElementById('editPlacaNome').value.trim();
          const potencia = parseFloat(document.getElementById('editPlacaPotencia').value);
          const status = document.getElementById('editPlacaStatus').value;
          if (nome && !isNaN(potencia) && status) {
            placas[idx] = { nome, potencia, status };
            renderPlacas();
            atualizarCards();
            if (modal) {
              modal.parentNode.removeChild(modal);
            }
          }
        };
        document.getElementById('cancelPlacaEdit').onclick = function() {
          if (modal) {
            modal.parentNode.removeChild(modal);
          }
        };
      }
    });
    renderPlacas();
  }

  // KPIs e cards
  function atualizarCards() {
    const totalPlacas = document.getElementById("totalPlacas");
    const potenciaTotal = document.getElementById("potenciaTotal");
    const economia = document.getElementById("economia");
    const faturamento = document.getElementById("faturamento");
    const total = placas.length;
    const potencia = placas.reduce((sum, p) => sum + p.potencia, 0);
    if (totalPlacas) totalPlacas.textContent = total;
    if (potenciaTotal) potenciaTotal.textContent = potencia.toFixed(2) + " kWp";
    if (economia) economia.textContent = `R$ ${(potencia * 20).toFixed(2)}`;
    if (faturamento) faturamento.textContent = `R$ ${(potencia * 100).toFixed(2)}`;
  }
  atualizarCards();

  // Alternância de visão
  const toggleViewBtn = document.getElementById("toggleView");
  const sectionDashboard = document.getElementById("section-dashboard");
  const sectionPlacas = document.getElementById("section-placas");
  let showingPlacas = false;
  if (toggleViewBtn && sectionDashboard && sectionPlacas) {
    // Adiciona seletor de placas
    const placaMiniSelect = document.getElementById('placaMiniSelect');
    let selectedPlacaIdx = null;
    function renderPlacaSelector() {
      placaMiniSelect.innerHTML = '';
      const select = document.createElement('select');
      select.style.padding = '8px';
      select.style.borderRadius = '6px';
      select.style.background = '#23243a';
      select.style.color = '#00d4ff';
      select.style.fontWeight = '600';
      select.style.marginRight = '1rem';
      // Opção GERAL
      const geralOption = document.createElement('option');
      geralOption.value = 'geral';
      geralOption.textContent = 'GERAL';
      select.appendChild(geralOption);
      // Placas cadastradas
      placas.forEach((placa, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = placa.nome;
        select.appendChild(option);
      });
      select.onchange = function() {
        selectedPlacaIdx = this.value;
        renderPlacaDados();
      };
      placaMiniSelect.appendChild(select);
      // Botão de cadastro se não houver placas
      if (placas.length === 0) {
        const btn = document.createElement('button');
        btn.textContent = 'Cadastrar nova placa';
        btn.className = 'btn-primary';
        btn.onclick = () => {
          showingPlacas = true;
          sectionDashboard.hidden = true;
          sectionPlacas.hidden = false;
          document.getElementById("pageTitle").textContent = "Placas";
        };
        placaMiniSelect.appendChild(btn);
      }
      selectedPlacaIdx = 'geral';
      renderPlacaDados();
    }
    function renderPlacaDados() {
      if (selectedPlacaIdx === 'geral') {
        // Visão geral de todas as placas
        const totalPotencia = placas.reduce((sum, p) => sum + p.potencia, 0);
        document.getElementById('powerNow').textContent = `${totalPotencia} kW`;
        document.getElementById('loadNow').textContent = `${(totalPotencia * 0.8).toFixed(2)} kW`;
        document.getElementById('energyToday').textContent = `${(totalPotencia * 5).toFixed(2)} kWh`;
        document.getElementById('revenueToday').textContent = `R$ ${(totalPotencia * 2).toFixed(2)}`;
        document.getElementById('gaugeValue').textContent = `${totalPotencia} kW`;
        document.getElementById('totalPlacas').textContent = placas.length.toString();
        document.getElementById('potenciaTotal').textContent = `${totalPotencia} kWp`;
      } else {
        // Exibe apenas os dados da placa selecionada
        const placa = placas[selectedPlacaIdx];
        document.getElementById('powerNow').textContent = placa ? `${placa.potencia} kW` : '0.0 kW';
        document.getElementById('loadNow').textContent = placa ? `${(placa.potencia * 0.8).toFixed(2)} kW` : '0.0 kW';
        document.getElementById('energyToday').textContent = placa ? `${(placa.potencia * 5).toFixed(2)} kWh` : '0.0 kWh';
        document.getElementById('revenueToday').textContent = placa ? `R$ ${(placa.potencia * 2).toFixed(2)}` : 'R$ 0,00';
        document.getElementById('gaugeValue').textContent = placa ? `${placa.potencia} kW` : '0.0 kW';
        document.getElementById('totalPlacas').textContent = placa ? '1' : '0';
        document.getElementById('potenciaTotal').textContent = placa ? `${placa.potencia} kWp` : '0 kWp';
      }
    }
    let selectorVisible = false;
    placaMiniSelect.style.display = 'none';
    toggleViewBtn.addEventListener("click", () => {
      selectorVisible = !selectorVisible;
      placaMiniSelect.style.display = selectorVisible ? 'block' : 'none';
      if (selectorVisible) {
        renderPlacaSelector();
      } else {
        placaMiniSelect.innerHTML = '';
      }
    });
    sectionPlacas.hidden = true;
  }

  // Simulação de KPIs e gráficos (simplificado)
  setInterval(() => {
    atualizarCards();
    // Não sobrescrever gráfico se filtro não for 'Hoje'
    if (typeof realtimeChart !== 'undefined' && window._realtimeChartFilter === 0) {
      const now = new Date();
      realtimeChart.data.labels.push(now.toLocaleTimeString());
      realtimeChart.data.datasets[0].data.push(Math.random() * 8);
      realtimeChart.data.datasets[1].data.push(2 + Math.random() * 6);
      if (realtimeChart.data.labels.length > 20) {
        realtimeChart.data.labels.shift();
        realtimeChart.data.datasets.forEach(ds => ds.data.shift());
      }
      realtimeChart.update();
    }
  }, 2000);

  // Ano no footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  // ========== PLACAS: INICIALIZAÇÃO GLOBAL ==========
  const placas = [
    { nome: "Placa 01", potencia: 2.5, status: "Ativa" },
    { nome: "Placa 02", potencia: 2.5, status: "Ativa" },
    { nome: "Placa 03", potencia: 3.0, status: "Ativa" }
  ];

  // ========== MODAL DE EDIÇÃO DE PLACA (apenas estilizado) ========== 
  // ========== PLACAS: DOM E EVENTOS ==========
  const placaForm = document.getElementById("placaForm");
  const placaTable = document.getElementById("placaTable");
  const placaNome = document.getElementById("placaNome");
  const placaPotencia = document.getElementById("placaPotencia");
  const placaStatus = document.getElementById("placaStatus");

  function renderPlacas() {
    if (!placaTable) return;
    const tbody = placaTable.querySelector("tbody");
    tbody.innerHTML = "";
    placas.forEach((placa, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${placa.nome}</td><td>${placa.potencia} kWp</td><td>${placa.status}</td><td>
        <button data-idx='${idx}' class='btn-secondary btn-edit-placa'>Editar</button>
        <button data-idx='${idx}' class='btn-secondary btn-remove-placa'>Remover</button>
      </td>`;
      tbody.appendChild(tr);
    });
  }

  if (placaTable) renderPlacas();

  if (placaForm) {
    placaForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = placaNome.value.trim();
      const potencia = parseFloat(placaPotencia.value);
      const status = placaStatus.value;
      if (nome && !isNaN(potencia)) {
        placas.push({ nome, potencia, status });
        renderPlacas();
        atualizarCards();
        placaForm.reset();
      }
    });
  }

  if (placaTable) {
    placaTable.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-remove-placa")) {
        const idx = parseInt(e.target.getAttribute("data-idx"));
        if (!isNaN(idx)) {
          placas.splice(idx, 1);
          renderPlacas();
          atualizarCards();
        }
      }
      if (e.target.classList.contains("btn-edit-placa")) {
        const idx = parseInt(e.target.getAttribute("data-idx"));
        if (!isNaN(idx)) {
          createPlacaEditModal();
          editPlacaIdx = idx;
          placaEditNome.value = placas[idx].nome;
          placaEditPotencia.value = placas[idx].potencia;
          placaEditStatus.value = placas[idx].status;
          placaEditModal.style.display = 'flex';
        }
      }
    });
  }
  /* ========== ALERTAS ========== */
  const alertsTable = document.getElementById("alertsTable");
  const clearAlertsBtn = document.getElementById("clearAlerts");
  let alertas = JSON.parse(localStorage.getItem('alertas') || 'null');
  if (!alertas) {
    alertas = [
      { data: "17/09/2025 10:15", tipo: "Manutenção", descricao: "Placa 02 precisa de verificação.", nivel: "Médio" },
      { data: "17/09/2025 09:30", tipo: "Geração", descricao: "Geração abaixo do esperado.", nivel: "Baixo" },
      { data: "16/09/2025 18:00", tipo: "Sistema", descricao: "Atualização de software realizada.", nivel: "Informativo" }
    ];
    localStorage.setItem('alertas', JSON.stringify(alertas));
  }

  function renderAlertas() {
    if (!alertsTable) return;
    const tbody = alertsTable.querySelector("tbody");
    tbody.innerHTML = "";
    alertas.forEach(alerta => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${alerta.data}</td><td>${alerta.tipo}</td><td>${alerta.descricao}</td><td>${alerta.nivel}</td>`;
      tbody.appendChild(tr);
    });
    localStorage.setItem('alertas', JSON.stringify(alertas));
  }

  if (alertsTable) renderAlertas();

  if (clearAlertsBtn) {
    clearAlertsBtn.addEventListener("click", () => {
      alertas = [];
      renderAlertas();
      localStorage.setItem('alertas', JSON.stringify(alertas));
    });
  }
  /* ========== VARIÁVEIS GLOBAIS ========== */
  const yearSpan = document.getElementById("year");
  const tabs = document.querySelectorAll(".tab");
  const sections = document.querySelectorAll("main section");
  const darkToggle = document.getElementById("darkToggle");
  const userMenu = document.getElementById("userMenu");
  const pageTitle = document.getElementById("pageTitle");

  const gaugePotencia = document.getElementById("gaugePotencia");
  const gaugeValue = document.getElementById("gaugeValue");
  const powerNow = document.getElementById("powerNow");
  const loadNow = document.getElementById("loadNow");

  const energyToday = document.getElementById("energyToday");
  const revenueToday = document.getElementById("revenueToday");
  const co2Saved = document.getElementById("co2Saved");
  const efficiency = document.getElementById("efficiency");

  const totalPlacas = document.getElementById("totalPlacas");
  const potenciaTotal = document.getElementById("potenciaTotal");
  const economia = document.getElementById("economia");
  const faturamento = document.getElementById("faturamento");

  const profileModal = document.getElementById("profileModal");
  const closeProfile = document.getElementById("closeProfile");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const saveProfile = document.getElementById("saveProfile");
  const cancelEdit = document.getElementById("cancelEdit");
  const profileView = document.getElementById("profileView");
  const profileEdit = document.getElementById("profileEdit");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileStatus = document.getElementById("profileStatus");
  const editName = document.getElementById("editName");
  const editEmail = document.getElementById("editEmail");
  const editStatus = document.getElementById("editStatus");

  /* ========== INICIALIZAÇÃO DO MODAL ========== */
  profileModal.style.display = "none"; 
  profileView.classList.remove("hidden"); 
  profileEdit.classList.add("hidden"); 

  /* ========== ANO NO FOOTER ========== */
  yearSpan.textContent = new Date().getFullYear();

  /* ========== TROCA DE ABAS ========== */
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const sectionId = `section-${tab.dataset.section}`;
      sections.forEach(s => (s.hidden = true));
      document.getElementById(sectionId).hidden = false;
      
      // Atualiza o título da página
      pageTitle.textContent = tab.textContent.trim();
    });
  });

  /* ========== TEMA ESCURO ========== */
  darkToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    darkToggle.textContent = isDark ? "🌙" : "☀️";
    
    // Atualiza os gráficos quando o tema muda
    updateChartsTheme();
  });

  /* ========== SINCRONIZAÇÃO DE DADOS DO USUÁRIO LOGADO ========== */
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  // Sidebar user
  const sidebarUserMenu = document.getElementById('userMenu');
  const savedProfileImg = localStorage.getItem('userProfileImg');
  if (sidebarUserMenu) {
    const sidebarImg = sidebarUserMenu.querySelector('img');
    const sidebarSpan = sidebarUserMenu.querySelector('span');
    if (sidebarImg) {
      if (savedProfileImg) {
        sidebarImg.src = savedProfileImg;
      } else if (userName) {
        sidebarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=00d4ff&color=fff`;
      }
    }
    if (sidebarSpan && userName) sidebarSpan.textContent = userName;
  }
  // Modal profile avatar
  const profileImg = document.getElementById('userProfileImg');
  if (profileImg) {
    if (savedProfileImg) {
      profileImg.src = savedProfileImg;
    } else if (userName) {
      profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=00d4ff&color=fff`;
    }
  }
  // Foto de perfil: preview e salvar
  const editProfileImg = document.getElementById('editProfileImg');
  const previewProfileImg = document.getElementById('previewProfileImg');
  if (editProfileImg && previewProfileImg) {
    editProfileImg.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          previewProfileImg.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  if (userEmail && profileEmail) {
    profileEmail.textContent = userEmail;
    if (editEmail) editEmail.value = userEmail;
  }
  if (userName && profileName) {
    profileName.textContent = userName;
    if (editName) editName.value = userName;
  }
  // Atualiza último acesso
  const lastAccess = localStorage.getItem('userLastAccess');
  const lastAccessSpan = document.querySelector('#profileView .profile-details p:last-child span');
  if (lastAccess && lastAccessSpan) {
    lastAccessSpan.textContent = lastAccess;
  }
  /* ========== MODAL PERFIL ========== */
  userMenu.addEventListener("click", () => profileModal.style.display = "flex");
  closeProfile.addEventListener("click", () => profileModal.style.display = "none");
  editProfileBtn.addEventListener("click", () => {
    profileView.classList.add("hidden");
    profileEdit.classList.remove("hidden");
    
    // Preenche os campos de edição com os valores atuais
    editName.value = profileName.textContent;
    editEmail.value = profileEmail.textContent;
    editStatus.value = profileStatus.textContent;
  });
  
  cancelEdit.addEventListener("click", () => {
    profileView.classList.remove("hidden");
    profileEdit.classList.add("hidden");
  });
  
  saveProfile.addEventListener("click", () => {
    profileName.textContent = editName.value;
    profileEmail.textContent = editEmail.value;
    profileStatus.textContent = editStatus.value;
    // Salva foto de perfil personalizada
    if (previewProfileImg && previewProfileImg.src && previewProfileImg.src.startsWith('data:image')) {
      localStorage.setItem('userProfileImg', previewProfileImg.src);
      if (profileImg) profileImg.src = previewProfileImg.src;
      if (sidebarUserMenu) {
        const sidebarImg = sidebarUserMenu.querySelector('img');
        if (sidebarImg) sidebarImg.src = previewProfileImg.src;
      }
    }
    profileView.classList.remove("hidden");
    profileEdit.classList.add("hidden");
    
    // Atualiza o nome no menu do usuário
    userMenu.querySelector("span").textContent = editName.value;
  });

  /* ========== GAUGE ========== */
  function updateGaugePotencia(val) {
    const percent = Math.min((val / 8) * 100, 100);
    if (gaugePotencia) {
      gaugePotencia.style.setProperty("--val", percent);
    }
    if (gaugeValue) {
      gaugeValue.textContent = `${val.toFixed(1)} kW`;
    }
  }

  /* ========== GRÁFICOS PRINCIPAIS ========== */
  let realtimeChart, dailyBarChart, placaDoughnut, placaBar, monitoringChart, solarRadiationChart;
  
  function initCharts() {
    // Gráfico em tempo real
    realtimeChart = new Chart(document.getElementById("realtimeChart"), {
      type: "line",
      data: { 
        labels: [], 
        datasets: [
          { 
            label: "Geração", 
            borderColor: "#4361ee", 
            backgroundColor: "rgba(67, 97, 238, 0.1)",
            data: [], 
            fill: true,
            tension: 0.4
          },
          { 
            label: "Consumo", 
            borderColor: "#f72585", 
            backgroundColor: "rgba(247, 37, 133, 0.1)",
            data: [], 
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        scales: { 
          x: { 
            display: true,
            title: {
              display: true,
              text: 'Hora'
            }
          },
          y: {
            title: {
              display: true,
              text: 'kW'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });

    // Gráfico de barras diário
    dailyBarChart = new Chart(document.getElementById("dailyBarChart"), {
      type: "bar",
      data: { 
        labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"], 
        datasets: [
          { 
            label: "kWh", 
            data: [4,5,6,7,5,4,6], 
            backgroundColor: "#4361ee",
            borderRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'kWh'
            }
          }
        }
      }
    });

    // Gráfico de pizza para status das placas
    placaDoughnut = new Chart(document.getElementById("placaDoughnut"), {
      type: "doughnut",
      data: { 
        labels: ["Ativas", "Inativas", "Manutenção"], 
        datasets: [{ 
          data: [8, 1, 1], 
          backgroundColor: ["#00ff00", "#e0e0e0", "#ffcc00"]
        }] 
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        animation: { 
          animateRotate: true, 
          animateScale: true 
        }, 
        plugins: { 
          legend: { 
            position: "bottom" 
          } 
        } 
      }
    });

    // Gráfico de monitoramento em tempo real
    monitoringChart = new Chart(document.getElementById("monitoringChart"), {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Geração (kW)",
          data: [],
          borderColor: "#4361ee",
          backgroundColor: "rgba(67, 97, 238, 0.1)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tempo'
            }
          },
          y: {
            title: {
              display: true,
              text: 'kW'
            }
          }
        }
      }
    });

    // Gráfico de radiação solar
    solarRadiationChart = new Chart(document.getElementById("solarRadiationChart"), {
      type: "line",
      data: {
        labels: ["6h", "8h", "10h", "12h", "14h", "16h", "18h"],
        datasets: [{
          label: "Radiação Solar (W/m²)",
          data: [200, 450, 750, 950, 850, 600, 300],
          borderColor: "#ffcc00",
          backgroundColor: "rgba(255, 204, 0, 0.1)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'W/m²'
            }
          }
        }
      }
    });
  }

  // Inicializar gráficos
  initCharts();

  // Atualizar tema dos gráficos
  function updateChartsTheme() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#f0f0f0' : '#333';
    
    // Atualizar todos os gráficos
    const charts = [realtimeChart, dailyBarChart, placaDoughnut, monitoringChart, solarRadiationChart];
    
    charts.forEach(chart => {
      if (chart) {
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.plugins.legend.labels.color = textColor;
        chart.update();
      }
    });
  }

  /* ========== SIMULAÇÃO TEMPO REAL ========== */
  const economiaPorKwp = 20;
  const faturamentoPorKwp = 100;
  let simulationInterval;

  function startSimulation() {
    if (simulationInterval) clearInterval(simulationInterval);
    simulationInterval = setInterval(() => {
      const now = new Date();
      const power = Math.random() * 8;
      const load = 2 + Math.random() * 6;

      // Potência instantânea no card
      updateGaugePotencia(power);
      powerNow.textContent = power.toFixed(1);
      loadNow.textContent = load.toFixed(1);

      energyToday.textContent = (Math.random() * 30).toFixed(1);
      revenueToday.textContent = `R$ ${(parseFloat(energyToday.textContent) * 0.95).toFixed(2)}`;
      co2Saved.textContent = (parseFloat(energyToday.textContent) * 0.85).toFixed(1);
      efficiency.textContent = ((power / load) * 100).toFixed(0);

      // Atualizar gráfico de geração vs consumo normalmente
      realtimeChart.data.labels.push(now.toLocaleTimeString());
      realtimeChart.data.datasets[0].data.push(power);
      realtimeChart.data.datasets[1].data.push(load);
      if (realtimeChart.data.labels.length > 20) {
        realtimeChart.data.labels.shift();
        realtimeChart.data.datasets.forEach(ds => ds.data.shift());
      }
      realtimeChart.update();

      // Atualizar gráfico de monitoramento
      monitoringChart.data.labels.push(now.toLocaleTimeString());
      monitoringChart.data.datasets[0].data.push(power);
      if (monitoringChart.data.labels.length > 15) {
        monitoringChart.data.labels.shift();
        monitoringChart.data.datasets[0].data.shift();
      }
      monitoringChart.update();

      atualizarCards();
    }, 2000);
  }

  startSimulation();

  /* ========== CARDS DE PLACAS ========== */
  function atualizarCards() {
    const total = placas.length;
    const potencia = placas.reduce((sum, p) => sum + p.potencia, 0);
    totalPlacas.textContent = total;
    // Animação de contagem para o card de potência instantânea
    animatePotenciaValue(potencia);
    // NOVO: Se não houver placas, foca no formulário
    const placaForm = document.getElementById("placaForm");
    if (placas.length === 0 && placaForm) {
      placaForm.scrollIntoView({ behavior: "smooth", block: "center" });
      placaForm.querySelector("input")?.focus();
    }
    economia.textContent = `R$ ${(potencia * economiaPorKwp).toFixed(2)}`;
    faturamento.textContent = `R$ ${(potencia * faturamentoPorKwp).toFixed(2)}`;
  }

  // Função para animar o valor do card de potência instantânea
  function animatePotenciaValue(finalValue) {
    const potenciaValor = document.getElementById("potenciaValor");
    if (!potenciaValor) return;
    const current = parseFloat(potenciaValor.textContent) || 0;
    const duration = 900;
    const frameRate = 30;
    const steps = Math.round(duration / (1000 / frameRate));
    let step = 0;
    const increment = (finalValue - current) / steps;
    let value = current;
    clearInterval(potenciaValor._interval);
    potenciaValor._interval = setInterval(() => {
      step++;
      value += increment;
      if (step >= steps) {
        potenciaValor.textContent = finalValue.toFixed(2) + " kWp";
        clearInterval(potenciaValor._interval);
      } else {
        potenciaValor.textContent = value.toFixed(2) + " kWp";
      }
    }, 1000 / frameRate);
  }

  atualizarCards();

  /* ========== CLIQUE FORA DO MODAL PARA FECHAR ========== */
  window.addEventListener("click", (event) => {
    if (event.target === profileModal) {
      profileModal.style.display = "none";
    }
  });

  /* ========== PREVENIR FECHAMENTO ACIDENTAL ========== */
  window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = "Tem certeza que deseja sair? As alterações podem não ter sido salvas.";
  });

  /* ========== TOGGLE VISÃO GERAL / PLACAS ========== */
  const toggleViewBtn = document.getElementById("toggleView");
  const sectionDashboard = document.getElementById("section-dashboard");
  const sectionPlacas = document.getElementById("section-placas");
  let showingPlacas = false;

  if (toggleViewBtn && sectionDashboard && sectionPlacas) {
    toggleViewBtn.addEventListener("click", () => {
      showingPlacas = !showingPlacas;
      if (showingPlacas) {
        sectionDashboard.hidden = true;
        sectionPlacas.hidden = false;
        pageTitle.textContent = "Placas";
        toggleViewBtn.title = "Alternar para visão geral do sistema";
        toggleViewBtn.querySelector("i").classList.remove("fa-chevron-right");
        toggleViewBtn.querySelector("i").classList.add("fa-chevron-left");
      } else {
        sectionDashboard.hidden = false;
        sectionPlacas.hidden = true;
        pageTitle.textContent = "Dashboard";
        toggleViewBtn.title = "Alternar para visão de placas";
        toggleViewBtn.querySelector("i").classList.remove("fa-chevron-left");
        toggleViewBtn.querySelector("i").classList.add("fa-chevron-right");
      }
    });
    // Inicialmente, garantir que placas está oculta
    sectionPlacas.hidden = true;
  }
});