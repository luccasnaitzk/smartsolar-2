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
        // Modal de edição (simplificado)
        const nome = prompt("Editar nome da placa:", placas[idx].nome);
        const potencia = parseFloat(prompt("Editar potência:", placas[idx].potencia));
        const status = prompt("Editar status:", placas[idx].status);
        if (nome && !isNaN(potencia) && status) {
          placas[idx] = { nome, potencia, status };
          renderPlacas();
          atualizarCards();
        }
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
    toggleViewBtn.addEventListener("click", () => {
      showingPlacas = !showingPlacas;
      sectionDashboard.hidden = showingPlacas;
      sectionPlacas.hidden = !showingPlacas;
      document.getElementById("pageTitle").textContent = showingPlacas ? "Placas" : "Dashboard";
      toggleViewBtn.title = showingPlacas ? "Alternar para visão geral do sistema" : "Alternar para visão de placas";
      const icon = toggleViewBtn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-chevron-right", !showingPlacas);
        icon.classList.toggle("fa-chevron-left", showingPlacas);
      }
    });
    sectionPlacas.hidden = true;
  }

  // Simulação de KPIs e gráficos (simplificado)
  setInterval(() => {
    atualizarCards();
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

  // ========== MODAL DE EDIÇÃO DE PLACA ==========
  var editPlacaIdx = null;
  var placaEditModal = null;
  var placaEditNome = null;
  var placaEditPotencia = null;
  var placaEditStatus = null;
  var placaEditSave = null;
  var placaEditCancel = null;

  function createPlacaEditModal() {
    if (document.getElementById('placaEditModal')) {
      placaEditModal = document.getElementById('placaEditModal');
      placaEditNome = placaEditModal.querySelector('#placaEditNome');
      placaEditPotencia = placaEditModal.querySelector('#placaEditPotencia');
      placaEditStatus = placaEditModal.querySelector('#placaEditStatus');
      placaEditSave = placaEditModal.querySelector('#placaEditSave');
      placaEditCancel = placaEditModal.querySelector('#placaEditCancel');
      return;
    }
    placaEditModal = document.createElement('div');
    placaEditModal.id = 'placaEditModal';
    placaEditModal.className = 'modal';
    placaEditModal.innerHTML = `
      <div class="modal-content">
        <span id="closePlacaEdit" class="close">&times;</span>
        <h3>Editar Placa</h3>
        <div class="form-group">
          <label>Nome:</label>
          <input type="text" id="placaEditNome" />
        </div>
        <div class="form-group">
          <label>Potência (kWp):</label>
          <input type="number" id="placaEditPotencia" step="0.1" />
        </div>
        <div class="form-group">
          <label>Status:</label>
          <select id="placaEditStatus">
            <option value="Ativa">Ativa</option>
            <option value="Inativa">Inativa</option>
            <option value="Manutenção">Manutenção</option>
          </select>
        </div>
        <div class="form-actions">
          <button id="placaEditSave" class="btn-primary">Salvar</button>
          <button id="placaEditCancel" class="btn-secondary">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(placaEditModal);
    placaEditNome = placaEditModal.querySelector('#placaEditNome');
    placaEditPotencia = placaEditModal.querySelector('#placaEditPotencia');
    placaEditStatus = placaEditModal.querySelector('#placaEditStatus');
    placaEditSave = placaEditModal.querySelector('#placaEditSave');
    placaEditCancel = placaEditModal.querySelector('#placaEditCancel');
    placaEditModal.querySelector('#closePlacaEdit').onclick = () => placaEditModal.style.display = 'none';
    placaEditCancel.onclick = () => placaEditModal.style.display = 'none';
    placaEditSave.onclick = () => {
      if (editPlacaIdx !== null) {
        placas[editPlacaIdx].nome = placaEditNome.value.trim();
        placas[editPlacaIdx].potencia = parseFloat(placaEditPotencia.value);
        placas[editPlacaIdx].status = placaEditStatus.value;
        renderPlacas();
        atualizarCards();
        placaEditModal.style.display = 'none';
      }
    };
  }
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
  let alertas = [
    { data: "17/09/2025 10:15", tipo: "Manutenção", descricao: "Placa 02 precisa de verificação.", nivel: "Médio" },
    { data: "17/09/2025 09:30", tipo: "Geração", descricao: "Geração abaixo do esperado.", nivel: "Baixo" },
    { data: "16/09/2025 18:00", tipo: "Sistema", descricao: "Atualização de software realizada.", nivel: "Informativo" }
  ];

  function renderAlertas() {
    if (!alertsTable) return;
    const tbody = alertsTable.querySelector("tbody");
    tbody.innerHTML = "";
    alertas.forEach(alerta => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${alerta.data}</td><td>${alerta.tipo}</td><td>${alerta.descricao}</td><td>${alerta.nivel}</td>`;
      tbody.appendChild(tr);
    });
  }

  if (alertsTable) renderAlertas();

  if (clearAlertsBtn) {
    clearAlertsBtn.addEventListener("click", () => {
      alertas = [];
      renderAlertas();
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