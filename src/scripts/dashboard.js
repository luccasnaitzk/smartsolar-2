/* SmartSolar Dashboard – Refatorado e Estabilizado
 * Principais melhorias:
 * - Um único DOMContentLoaded
 * - Remoção de duplicatas (atualizarCards, renderPlacas, modais, etc.)
 * - Guards para elementos inexistentes (evita ReferenceError que para os gráficos)
 * - Inicialização única de gráficos + função restartCharts se abrir aba depois
 * - Loop de simulação resiliente com try/catch
 * - Atualizações em tempo real para aba Análises (Forecast, Radar, Heatmap, Ranking, Timeline)
 * - Badge de alertas e Ticket modal preservados
 */

(function () {
  const TICK_MS = 2000;

  const SS = {
    placas: [],
    panelState: {},     // estado por placa
    panelEvents: [],    // eventos timeline
    charts: {},         // refs Chart.js
    sparks: {},         // sparklines
    sim: { interval: null, lastTick: 0 },
    els: {},
    inited: false,
    clockInterval: null
  };

  /* --------------------- UTIL --------------------- */
  function $(id) { return document.getElementById(id); }
  function safeNumber(v, d = 0) { const n = parseFloat(v); return isNaN(n) ? d : n; }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* --------------------- ESTADO --------------------- */
  function initPlacasDefault() {
    if (!SS.placas.length) {
      SS.placas = [
        { nome: "Placa 01", potencia: 2.5, status: "Ativa" },
        { nome: "Placa 02", potencia: 2.5, status: "Ativa" },
        { nome: "Placa 03", potencia: 3.0, status: "Ativa" }
      ];
    }
  }
  function ensurePanelState() {
    SS.placas.forEach(p => {
      if (!SS.panelState[p.nome]) {
        SS.panelState[p.nome] = {
          eff: 0.85 + Math.random() * 0.1,
            tempC: 28 + Math.random() * 6,
            genKwh: 0,
            powerKw: 0,
            prevPowerKw: 0,
            activeTicks: 0,
            totalTicks: 0,
            idealKwh: 0,
            actualKwh: 0,
            lastStatus: p.status,
            lastLowEventAt: 0
        };
      }
    });
  }

  /* --------------------- DOM CACHE --------------------- */
  function cacheElements() {
    const ids = [
      "powerNow","loadNow","energyToday","revenueToday","co2Saved","efficiency",
      "totalPlacas","potenciaTotal","economia","faturamento","gaugePotencia","gaugeValue",
      "placaTable","placaForm","placaNome","placaPotencia","placaStatus","placaCadastrarBtn",
      "placaNomeError","placaPotenciaError","placaSuccess","analysisRange",
      "analysisHeatmap","analysisRanking","analysisTimeline","analysisHeatMetric",
      "analysisEventType","analysisEventSeverity","analysisPR","analysisUptime",
      "analysisCO2","analysisAuto","alertsTable","clearAlerts","darkToggle","pageTitle",
      "supportFab","supportPanel","supportClose","supportBadge","supportWhatsApp",
      "supportTicket","openTicketFab","ticketFabBadge","toggleView","section-dashboard",
      "section-placas","placaMiniSelect","year","userMenu","profileModal","closeProfile",
      "editProfileBtn","saveProfile","cancelEdit","profileView","profileEdit","profileName",
      "profileEmail","profileStatus","editName","editEmail","editStatus","userProfileImg",
      "editProfileImg","previewProfileImg","logoutBtn","userSearch","addUserBtn","addUser",
      "removeUserBtn","removeUser","userPermSelect","setPermBtn","permUserName","emailNotify",
      "smsNotify","alertLowGen","saveNotifications","headerTime","headerTimeValue"
    ];
    ids.forEach(id => SS.els[id] = $(id));
  }

  /* --------------------- RELÓGIO HEADER --------------------- */
  function initClock() {
    const el = SS.els.headerTimeValue || $("headerTimeValue");
    if (!el) return; // se elemento não existir, não faz nada
    // Evita múltiplos intervals se init() for chamado de forma defensiva
    if (SS.clockInterval) clearInterval(SS.clockInterval);
    const update = () => {
      try {
        const now = new Date();
        // Formato HH:MM:SS 24h
        el.textContent = now.toLocaleTimeString('pt-BR', { hour12: false });
      } catch { /* noop */ }
    };
    update();
    SS.clockInterval = setInterval(update, 1000);
  }

  /* --------------------- USUÁRIOS / PERMISSÕES --------------------- */
  function loadUsersObj() {
    try {
      const raw = localStorage.getItem('users');
      if (!raw) return {};
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        const obj = {};
        data.forEach(v => {
          const k = String(v).trim();
          const isEmail = k.includes('@');
          obj[k] = { name: isEmail ? k.split('@')[0] : k, email: isEmail ? k : '' };
        });
        return obj;
      }
      return data && typeof data === 'object' ? data : {};
    } catch { return {}; }
  }
  function saveUsersObj(obj) { localStorage.setItem('users', JSON.stringify(obj || {})); }
  function getUserPerms() { return JSON.parse(localStorage.getItem('userPerms') || '{}'); }
  function setUserPerm(key, perm) {
    const perms = getUserPerms();
    perms[key] = perm;
    localStorage.setItem('userPerms', JSON.stringify(perms));
  }
  function findUserKey(obj, query) {
    if (!query) return null;
    const q = query.toLowerCase();
    return Object.keys(obj).find(k => {
      const u = obj[k] || {};
      return k.toLowerCase() === q ||
        (u.name || '').toLowerCase() === q ||
        (u.email || '').toLowerCase() === q;
    });
  }
  function updateUserList() {
    const list = $('userList');
    if (!list) return;
    const usersObj = loadUsersObj();
    const perms = getUserPerms();
    const keys = Object.keys(usersObj);
    const q = (SS.els.userSearch?.value || '').trim().toLowerCase();
    list.innerHTML = '';
    if (!keys.length) {
      list.innerHTML = '<li style="color:#e63946;padding:6px 4px;">Nenhum usuário</li>';
      return;
    }
    keys.filter(k => {
      if (!q) return true;
      const u = usersObj[k] || {};
      return (u.name || k).toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    }).forEach(k => {
      const u = usersObj[k] || {};
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name||k)}&background=00d4ff&color=fff`;
      const li = document.createElement('li');
      li.className = 'user-item';
      li.innerHTML = `
        <img class="user-avatar" src="${avatar}" alt="">
        <span class="user-name" title="${u.email || k}">${u.name || k}</span>
        <select class="user-role-select">
          <option value="viewer" ${perms[k]==='viewer'?'selected':''}>Visualizador</option>
          <option value="admin" ${perms[k]==='admin'?'selected':''}>Administrador</option>
        </select>
        <button class="user-remove-btn" title="Remover">&times;</button>`;
      li.querySelector('.user-role-select').addEventListener('change', e => setUserPerm(k, e.target.value));
      li.querySelector('.user-remove-btn').addEventListener('click', () => {
        const obj = loadUsersObj();
        delete obj[k]; saveUsersObj(obj);
        const p = getUserPerms(); delete p[k]; localStorage.setItem('userPerms', JSON.stringify(p));
        updateUserList();
      });
      list.appendChild(li);
    });
  }

  /* --------------------- ALERTAS --------------------- */
  function loadAlertas() {
    let arr;
    try { arr = JSON.parse(localStorage.getItem('alertas') || '[]'); } catch { arr = []; }
    if (!Array.isArray(arr) || !arr.length) {
      arr = [
        { data: "17/09/2025 10:15", tipo: "Manutenção", descricao: "Placa 02 precisa de verificação.", nivel: "Médio" },
        { data: "17/09/2025 09:30", tipo: "Geração", descricao: "Geração abaixo do esperado.", nivel: "Baixo" },
        { data: "16/09/2025 18:00", tipo: "Sistema", descricao: "Atualização de software realizada.", nivel: "Informativo" }
      ];
      localStorage.setItem('alertas', JSON.stringify(arr));
    }
    return arr;
  }
  function renderAlertas() {
    const tbl = SS.els.alertsTable;
    if (!tbl) return;
    let alertas = loadAlertas();
    const tbody = tbl.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    alertas.forEach((a, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.data || ''}</td><td>${a.tipo||''}</td><td>${a.descricao||''}</td><td>${a.nivel||''}</td>`;
      const td = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = 'btn-secondary';
      btn.textContent = a.lido ? 'Lido' : 'Marcar como lido';
      btn.addEventListener('click', () => {
        alertas[i] = { ...a, lido: !a.lido };
        localStorage.setItem('alertas', JSON.stringify(alertas));
        renderAlertas();
        updateSupportBadge();
      });
      td.appendChild(btn);
      tr.appendChild(td);
      if (a.lido) tr.style.opacity = 0.6;
      tbody.appendChild(tr);
    });
  }
  function updateSupportBadge() {
    const badge1 = SS.els.supportBadge;
    const badge2 = SS.els.ticketFabBadge;
    let arr = loadAlertas();
    const count = arr.length;
    const text = count > 9 ? '9+' : (count ? String(count) : '');
    [badge1, badge2].forEach(b => {
      if (!b) return;
      if (count) { b.textContent = text; b.style.display = 'flex'; }
      else { b.textContent = ''; b.style.display = 'none'; }
    });
  }

  /* --------------------- PLACAS (CRUD SIMPLES) --------------------- */
  function renderPlacas() {
    const table = SS.els.placaTable;
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    SS.placas.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nome}</td>
        <td>${p.potencia} kWp</td>
        <td>${p.status}</td>
        <td>
          <button class="btn-secondary btn-edit" data-i="${idx}">Editar</button>
          <button class="btn-secondary btn-dup" data-i="${idx}">Duplicar</button>
          <button class="btn-secondary btn-rem" data-i="${idx}">Remover</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }
  // Atualiza imediatamente componentes de análise após mudanças estruturais em placas
  function refreshAnalisesImmediate() {
    // análises removidas
  }
  function bindPlacaTable() {
    const table = SS.els.placaTable;
    if (!table) return;
    // Evita adicionar múltiplos listeners ao recriar tabela
    if (table._bound) return;
    table._bound = true;
    table.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const idx = +btn.dataset.i;
      if (isNaN(idx)) return;
      if (btn.classList.contains('btn-rem')) {
        SS.placas.splice(idx, 1);
        ensurePanelState();
        renderPlacas();
        atualizarCards();
        updatePlacasDoughnut();
        refreshAnalisesImmediate();
      } else if (btn.classList.contains('btn-dup')) {
        const base = SS.placas[idx];
        if (!base) return;
        let newName = base.nome + ' (Cópia)';
        let c = 2;
        while (SS.placas.some(p => p.nome.toLowerCase() === newName.toLowerCase())) {
          newName = base.nome + ` (Cópia ${c++})`;
        }
        SS.placas.push({ ...base, nome: newName });
        ensurePanelState();
        renderPlacas();
        atualizarCards();
        updatePlacasDoughnut();
        refreshAnalisesImmediate();
      } else if (btn.classList.contains('btn-edit')) {
        openEditPlacaModal(idx);
      }
    });
  }
  function openEditPlacaModal(idx) {
    const p = SS.placas[idx];
    if (!p) return;
    closeModalById('editPlacaModal');
    const ov = document.createElement('div');
    ov.id = 'editPlacaModal';
    Object.assign(ov.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    });
    ov.innerHTML = `
      <div style="background:#23243a;padding:28px 22px;border-radius:16px;min-width:320px;max-width:92vw;">
        <h3 style="margin:0 0 14px;color:#00d4ff;">Editar Placa</h3>
        <label style="color:#fff;font-weight:500;display:block;margin-bottom:8px;">Nome
          <input id="editNome" value="${p.nome}" style="width:100%;padding:8px;border:1px solid #444;border-radius:6px;background:#1c1d32;color:#fff;margin-top:4px;">
        </label>
        <label style="color:#fff;font-weight:500;display:block;margin-bottom:8px;">Potência (kWp)
          <input id="editPot" type="number" step="0.01" value="${p.potencia}" style="width:100%;padding:8px;border:1px solid #444;border-radius:6px;background:#1c1d32;color:#fff;margin-top:4px;">
        </label>
        <label style="color:#fff;font-weight:500;display:block;margin-bottom:14px;">Status
          <select id="editStatus" style="width:100%;padding:8px;border:1px solid #444;border-radius:6px;background:#1c1d32;color:#fff;margin-top:4px;">
            <option ${p.status==='Ativa'?'selected':''}>Ativa</option>
            <option ${p.status==='Inativa'?'selected':''}>Inativa</option>
            <option ${p.status==='Manutenção'?'selected':''}>Manutenção</option>
          </select>
        </label>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="savePlaca" class="btn-primary" style="background:#00d4ff;color:#111;font-weight:700;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;">Salvar</button>
          <button id="cancelPlaca" class="btn-secondary" style="background:#333;color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;">Cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', ev => { if (ev.target === ov) closeModalById('editPlacaModal'); });
    ov.querySelector('#cancelPlaca').onclick = () => closeModalById('editPlacaModal');
    ov.querySelector('#savePlaca').onclick = () => {
      const nome = ov.querySelector('#editNome').value.trim();
      const pot = safeNumber(ov.querySelector('#editPot').value, p.potencia);
      const status = ov.querySelector('#editStatus').value;
      if (!nome || pot <= 0) return alert('Dados inválidos.');
      SS.placas[idx] = { nome, potencia: +pot.toFixed(2), status };
      ensurePanelState();
      renderPlacas();
      atualizarCards();
      updatePlacasDoughnut();
      refreshAnalisesImmediate();
      closeModalById('editPlacaModal');
    };
  }
  function closeModalById(id) {
    const m = $(id);
    if (m && m.parentNode) m.parentNode.removeChild(m);
  }

  /* --------------------- KPIs --------------------- */
  function atualizarCards() {
    const total = SS.placas.length;
    const pot = SS.placas.reduce((s, p) => s + (p.potencia || 0), 0);
    if (SS.els.totalPlacas) SS.els.totalPlacas.textContent = total;
    if (SS.els.potenciaTotal) SS.els.potenciaTotal.textContent = pot.toFixed(2) + ' kWp';
    if (SS.els.economia) SS.els.economia.textContent = 'R$ ' + (pot * 20).toFixed(2);
    if (SS.els.faturamento) SS.els.faturamento.textContent = 'R$ ' + (pot * 100).toFixed(2);
  }
  function updateGauge(valKw) {
    if (SS.els.gaugePotencia) {
      const pct = clamp01(valKw / 8) * 100;
      SS.els.gaugePotencia.style.setProperty('--val', pct);
    }
    if (SS.els.gaugeValue) SS.els.gaugeValue.textContent = valKw.toFixed(1) + ' kW';
  }

  /* --------------------- CHARTS --------------------- */
  function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Evitar recriar se já existem
    if (!SS.charts.realtime) {
      const ctx = $('realtimeChart');
      if (ctx) SS.charts.realtime = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [
          { label: 'Geração', data: [], borderColor: '#4361ee', backgroundColor: 'rgba(67,97,238,0.12)', fill:true, tension:0.35 },
          { label: 'Consumo', data: [], borderColor: '#f72585', backgroundColor: 'rgba(247,37,133,0.12)', fill:true, tension:0.35 }
        ]},
        options: baseLineOptions('Hora','kW')
      });
    }
    if (!SS.charts.monitoring) {
      const ctx = $('monitoringChart');
      if (ctx) SS.charts.monitoring = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Geração (kW)', data: [], borderColor: '#00d4ff', backgroundColor:'rgba(0,212,255,0.12)', fill:true, tension:0.35 }]},
        options: baseLineOptions('Tempo','kW')
      });
    }
    if (!SS.charts.dailyBar) {
      const ctx = $('dailyBarChart');
      if (ctx) SS.charts.dailyBar = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'], datasets:[{ label:'kWh', data:[4,5,6,7,5,4,6], backgroundColor:'#4361ee', borderRadius:6 }]},
        options: {
          responsive:true, maintainAspectRatio:false,
          scales:{ y:{ beginAtZero:true, title:{display:true,text:'kWh'} } }
        }
      });
    }
    if (!SS.charts.placaDoughnut) {
      const ctx = $('placaDoughnut');
      if (ctx) SS.charts.placaDoughnut = new Chart(ctx, {
        type:'doughnut',
        data:{ labels:['Ativas','Inativas','Manutenção'], datasets:[{ data:[0,0,0], backgroundColor:['#2a9d8f','#999','#ffcc00'] }]},
        options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } } }
      });
      updatePlacasDoughnut();
    }
    if (!SS.charts.radiation) {
      const ctx = $('solarRadiationChart');
      if (ctx) SS.charts.radiation = new Chart(ctx, {
        type:'line',
        data:{ labels:["6h","8h","10h","12h","14h","16h","18h"],
          datasets:[{ label:'Radiação (W/m²)', data:[200,450,750,950,850,600,300], borderColor:'#ffcc00', backgroundColor:'rgba(255,204,0,0.12)', fill:true, tension:0.35 }]},
        options: baseLineOptions('', 'W/m²')
      });
    }
    // Gráficos de análises removidos

    initSparklines();
    updateChartsTheme();
  }

  // Pré-preenche gráficos com histórico sintético para evitar linha reta inicial
  function seedInitialCharts() {
    if (!SS.charts.realtime && !SS.charts.monitoring) return; // garante que initCharts já rodou
    const now = Date.now();
    const points = 15; // ~15 amostras prévias
    const baseIrr = () => 0.2 + Math.random()*0.15; // variação suave inicial
    let lastPower = 0;
    for (let i = points; i > 0; i--) {
      const t = new Date(now - i * (TICK_MS));
      // Simula uma leve curva ascendente com ruído
      const factor = 0.4 + ( (points - i) / points ) * 0.4; // 0.4 .. 0.8
      const noise = 0.85 + Math.random()*0.3;
      const potTotal = SS.placas.reduce((s,p)=> s + p.potencia, 0) || 1;
      const power = potTotal * factor * noise * 0.6; // kW aproximado inicial
      const load = power * (0.8 + Math.random()*0.4);
      lastPower = power;
      if (SS.charts.realtime) {
        const c = SS.charts.realtime;
        c.data.labels.push(t.toLocaleTimeString());
        c.data.datasets[0].data.push(+power.toFixed(2));
        c.data.datasets[1].data.push(+load.toFixed(2));
      }
      if (SS.charts.monitoring) {
        const m = SS.charts.monitoring;
        m.data.labels.push(t.toLocaleTimeString());
        m.data.datasets[0].data.push(+power.toFixed(2));
      }
    }
    if (SS.charts.realtime) SS.charts.realtime.update();
    if (SS.charts.monitoring) SS.charts.monitoring.update();
  }

  function baseLineOptions(xTitle, yTitle, noAnim) {
    return {
      responsive:true,
      maintainAspectRatio:false,
      animation: noAnim ? { duration:0 } : { duration:0 },
      scales:{
        x:{ title:{ display: !!xTitle, text:xTitle } },
        y:{ beginAtZero:true, title:{ display: !!yTitle, text:yTitle } }
      },
      plugins:{ legend:{ labels:{ color:'#fff' } } }
    };
  }

  function initSparklines() {
    const defs = [
      { id:'spark-powerNow', color:'#00d4ff' },
      { id:'spark-loadNow', color:'#ffcc00' },
      { id:'spark-energyToday', color:'#4361ee' },
      { id:'spark-revenueToday', color:'#2a9d8f' }
    ];
    defs.forEach(d => {
      if (SS.sparks[d.id]) return;
      const el = $(d.id);
      if (!el) return;
      SS.sparks[d.id] = new Chart(el, {
        type:'line',
        data:{ labels:[], datasets:[{ data:[], borderColor:d.color, backgroundColor:'transparent', borderWidth:2, pointRadius:0, tension:0.35 }]},
        options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{enabled:false} }, scales:{ x:{display:false}, y:{display:false} } }
      });
    });
  }

  function pushSpark(id, v) {
    const ch = SS.sparks[id];
    if (!ch) return;
    ch.data.labels.push('');
    ch.data.datasets[0].data.push(v);
    if (ch.data.datasets[0].data.length > 40) {
      ch.data.datasets[0].data.shift();
      ch.data.labels.shift();
    }
    ch.update();
  }

  function updatePlacasDoughnut() {
    const ch = SS.charts.placaDoughnut;
    if (!ch) return;
    const counts = { Ativa:0, Inativa:0, 'Manutenção':0 };
    SS.placas.forEach(p => { if (counts[p.status] != null) counts[p.status]++; });
    ch.data.datasets[0].data = [counts.Ativa, counts.Inativa, counts['Manutenção']];
    ch.update();
  }

  function updateChartsTheme() {
    const isDark = (document.body.getAttribute('data-theme') || 'dark') === 'dark';
    const g = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
    const t = isDark ? '#f0f0f0' : '#222';
    Object.values(SS.charts).concat(Object.values(SS.sparks)).forEach(ch => {
      if (!ch) return;
      if (ch.options.scales) {
        ['x','y'].forEach(ax => {
          if (ch.options.scales[ax]) {
            if (ch.options.scales[ax].grid) ch.options.scales[ax].grid.color = g;
            if (ch.options.scales[ax].ticks) ch.options.scales[ax].ticks.color = t;
            if (ch.options.scales[ax].title) ch.options.scales[ax].title.color = t;
          }
        });
      }
      if (ch.options.plugins?.legend?.labels) ch.options.plugins.legend.labels.color = t;
      ch.update();
    });
  }

  /* --------------------- ANÁLISES desativadas --------------------- */
  function renderAnalysisHeatmap() { /* noop */ }
  function renderAnalysisRanking() { /* noop */ }
  function renderAnalysisTimeline() { /* noop */ }
  function updateAnalysisKPIs() { /* noop */ }

  /* --------------------- SIMULAÇÃO --------------------- */
  function simulationTick() {
    const now = Date.now();
    SS.sim.lastTick = now;
    const irradiance = 0.2 + Math.max(0, Math.sin((now/1000/60)*Math.PI/6))*0.8; // 0.2..1
    let totalPower = 0;
    let totalLoad = 0;
    SS.placas.forEach(p => {
      const st = SS.panelState[p.nome];
      if (!st) return;
      st.prevPowerKw = st.powerKw || 0;
      const statusFactor = p.status === 'Ativa' ? 1 : (p.status === 'Manutenção' ? 0.5 : 0);
      const idealKw = (p.potencia||0) * irradiance;
      const tempAdj = 1 - Math.max(0, ((st.tempC||30)-25)*0.004);
      const noise = 0.9 + Math.random()*0.2;
      st.powerKw = Math.max(0, idealKw * (st.eff||0.9) * tempAdj * noise * statusFactor);
      st.genKwh += st.powerKw * (TICK_MS/3600000); // kWh increment
      st.idealKwh += idealKw * (TICK_MS/3600000);
      st.actualKwh += st.powerKw * (TICK_MS/3600000);
      st.totalTicks++;
      if (statusFactor>0.1 && st.powerKw>0.01) st.activeTicks++;
      st.tempC = (st.tempC||30) + (Math.random()-0.5)*0.4;
      st.eff = clamp01((st.eff||0.9) + (Math.random()-0.5)*0.01);
      totalPower += st.powerKw;
      totalLoad += st.powerKw * (0.7 + Math.random()*0.6);
      // Eventos (gên. baixa)
      const expected = idealKw;
      if (expected>0.3 && st.powerKw < expected*0.4) {
        if (!st.lastLowEventAt || (now - st.lastLowEventAt) > 120000) {
          SS.panelEvents.push({ time: now, tipo:'geracao', sev:'baixa', desc:`Geração baixa em ${p.nome}` });
          st.lastLowEventAt = now;
        }
      }
      if (st.lastStatus !== p.status) {
        SS.panelEvents.push({ time: now, tipo:'manutencao', sev: p.status==='Inativa'?'alta':'media', desc:`${p.nome} agora ${p.status}` });
        st.lastStatus = p.status;
      }
    });
    SS.panelEvents = SS.panelEvents.slice(-300);

    const power = totalPower;
    const load = Math.max(0.5, totalLoad);
    updateGauge(power);
    if (SS.els.powerNow) SS.els.powerNow.textContent = power.toFixed(1) + ' kW';
    if (SS.els.loadNow) SS.els.loadNow.textContent = load.toFixed(1) + ' kW';

    const energy = SS.placas.reduce((s,p)=> s + (SS.panelState[p.nome]?.actualKwh||0), 0);
    if (SS.els.energyToday) SS.els.energyToday.textContent = energy.toFixed(1) + ' kWh';
    const rev = energy * 0.95;
    if (SS.els.revenueToday) SS.els.revenueToday.textContent = 'R$ ' + rev.toFixed(2);
    if (SS.els.co2Saved) SS.els.co2Saved.textContent = (energy*0.85).toFixed(1) + ' kg';
    const eff = clamp01(power / Math.max(load, 0.1)) * 100;
    if (SS.els.efficiency) SS.els.efficiency.textContent = eff.toFixed(0) + ' %';
    SS._lastPower = power;
    SS._lastLoad = load;
    SS._lastEff = eff;

    atualizarCards();

    // KPIs spark
    pushSpark('spark-powerNow', power);
    pushSpark('spark-loadNow', load);
    pushSpark('spark-energyToday', energy);
    pushSpark('spark-revenueToday', rev);

    // Charts principais
    if (SS.charts.realtime) {
      const c = SS.charts.realtime;
      c.data.labels.push(new Date().toLocaleTimeString());
      c.data.datasets[0].data.push(power);
      c.data.datasets[1].data.push(load);
      if (c.data.labels.length > 30) {
        c.data.labels.shift();
        c.data.datasets.forEach(ds => ds.data.shift());
      }
      c.update();
    }
    if (SS.charts.monitoring) {
      const c = SS.charts.monitoring;
      c.data.labels.push(new Date().toLocaleTimeString());
      c.data.datasets[0].data.push(power);
      if (c.data.labels.length > 20) {
        c.data.labels.shift();
        c.data.datasets[0].data.shift();
      }
      c.update();
    }

    // Forecast e análises removidos
  }

  function startSimulation() {
    if (SS.sim.interval) clearInterval(SS.sim.interval);
    SS.sim.interval = setInterval(() => {
      try { simulationTick(); } catch (e) { /* falha silenciosa */ }
    }, TICK_MS);
  }

  /* --------------------- SUPORTE / TICKET --------------------- */
  function bindSupport() {
    const { supportFab, supportPanel, supportClose, supportWhatsApp, supportTicket, openTicketFab } = SS.els;
    function openPanel() {
      if (!supportPanel) return;
      supportPanel.hidden = false;
      requestAnimationFrame(()=> supportPanel.classList.add('open'));
      supportFab && supportFab.classList.add('active');
    }
    function closePanel() {
      if (!supportPanel) return;
      supportPanel.classList.remove('open');
      supportFab && supportFab.classList.remove('active');
      setTimeout(()=> { if (!supportPanel.classList.contains('open')) supportPanel.hidden = true; }, 220);
    }
    function toggle() { supportPanel && (supportPanel.hidden ? openPanel() : closePanel()); }
    supportFab?.addEventListener('click', toggle);
    supportClose?.addEventListener('click', closePanel);
    document.addEventListener('click', e => {
      if (!supportPanel || supportPanel.hidden) return;
      if (!supportPanel.contains(e.target) && !supportFab?.contains(e.target)) closePanel();
    });
    supportWhatsApp?.addEventListener('click', () =>
      window.open('https://wa.me/5519995983782?text=Olá%20SmartSolar%20-%20preciso%20de%20ajuda.', '_blank')
    );
    function openTicketModal() {
      closeModalById('ticketModalOverlay');
      const ov = document.createElement('div');
      ov.id = 'ticketModalOverlay';
      Object.assign(ov.style, {
        position:'fixed', inset:'0', background:'rgba(0,0,0,0.55)', display:'flex',
        alignItems:'center', justifyContent:'center', zIndex:10000
      });
      const emailPref = localStorage.getItem('userEmail') || localStorage.getItem('notifyEmail') || '';
      ov.innerHTML = `
        <div style="background:#23243a;color:#fff;padding:22px 20px;border-radius:16px;min-width:320px;max-width:92vw;width:420px;">
          <h3 style="margin:0 0 12px;color:#00d4ff;">Abrir Chamado</h3>
          <div style="display:grid;gap:10px;">
            <label>Título
              <input id="tkTitulo" style="margin-top:4px;width:100%;padding:10px 12px;border-radius:10px;border:1px solid #3a3b54;background:#1c1d32;color:#fff;">
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <label>Tipo
                <select id="tkTipo" style="margin-top:4px;padding:10px 12px;border-radius:10px;border:1px solid #3a3b54;background:#1c1d32;color:#fff;">
                  <option>Suporte</option><option>Geração</option><option>Manutenção</option><option>Sistema</option>
                </select>
              </label>
              <label>Nível
                <select id="tkNivel" style="margin-top:4px;padding:10px 12px;border-radius:10px;border:1px solid #3a3b54;background:#1c1d32;color:#fff;">
                  <option>Informativo</option><option>Baixo</option><option>Médio</option><option>Alto</option>
                </select>
              </label>
            </div>
            <label>E-mail
              <input id="tkEmail" value="${emailPref}" type="email" style="margin-top:4px;width:100%;padding:10px 12px;border-radius:10px;border:1px solid #3a3b54;background:#1c1d32;color:#fff;">
            </label>
            <label>Descrição
              <textarea id="tkDesc" rows="4" style="margin-top:4px;width:100%;padding:10px 12px;border-radius:10px;border:1px solid #3a3b54;background:#1c1d32;color:#fff;resize:vertical;"></textarea>
            </label>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
              <button id="tkCancel" class="btn-secondary" style="padding:10px 14px;border-radius:10px;border:1px solid #3a3b54;background:#323453;color:#fff;">Cancelar</button>
              <button id="tkSubmit" class="btn-primary" style="padding:10px 14px;border-radius:10px;background:#00d4ff;color:#111;font-weight:700;border:none;">Enviar</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(ov);
      const titulo = ov.querySelector('#tkTitulo');
      const btnSend = ov.querySelector('#tkSubmit');
      const btnCancel = ov.querySelector('#tkCancel');
      titulo?.focus();
      btnCancel.addEventListener('click', ()=> closeModalById('ticketModalOverlay'));
      ov.addEventListener('click', ev => { if (ev.target===ov) closeModalById('ticketModalOverlay'); });
      btnSend.addEventListener('click', ()=> {
        const ti = titulo.value.trim();
        if (!ti) return alert('Informe um título.');
        const tipo = ov.querySelector('#tkTipo').value;
        const nivel = ov.querySelector('#tkNivel').value;
        const em = ov.querySelector('#tkEmail').value.trim();
        const de = ov.querySelector('#tkDesc').value.trim();
        if (em && !localStorage.getItem('notifyEmail')) localStorage.setItem('notifyEmail', em);
        const novo = { data: new Date().toLocaleString(), tipo, descricao: ti + (de? ' – '+de:''), nivel };
        let arr = loadAlertas(); arr.unshift(novo);
        localStorage.setItem('alertas', JSON.stringify(arr));
        renderAlertas();
        updateSupportBadge();
        closeModalById('ticketModalOverlay');
        alert('Chamado registrado.');
      });
    }
    supportTicket?.addEventListener('click', () => { openPanel(); openTicketModal(); });
    openTicketFab?.addEventListener('click', (e)=> { e.preventDefault(); openTicketModal(); });
  }

  /* --------------------- TEMA --------------------- */
  function initTheme() {
    const stored = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', stored);
    if (SS.els.darkToggle) SS.els.darkToggle.textContent = stored === 'dark' ? '☀️' : '🌙';
    // Sincroniza select de tema se existir
    const themeSelectEl = document.getElementById('themeSelect');
    if (themeSelectEl) themeSelectEl.value = stored;
    SS.els.darkToggle?.addEventListener('click', () => {
      const cur = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', cur);
      localStorage.setItem('theme', cur);
      SS.els.darkToggle.textContent = cur === 'dark' ? '☀️' : '🌙';
      // Atualiza select para refletir mudança via botão
      if (themeSelectEl) themeSelectEl.value = cur;
      updateChartsTheme();
    });
  }

  /* --------------------- VIEW / TABS SIMPLES --------------------- */
  function initTabs() {
    const tabs = document.querySelectorAll('.tab[data-section]');
    const sections = document.querySelectorAll('main section');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = 'section-' + tab.dataset.section;
        sections.forEach(s => s.hidden = s.id !== target);
        if (SS.els.pageTitle) SS.els.pageTitle.textContent = tab.textContent.trim();
        // Aba de análises removida
      });
    });
  }

  /* --------------------- EVENTOS FORM / BUSCAS --------------------- */
  function bindForms() {
    // Placa form
    if (SS.els.placaForm && !SS.els.placaForm._bound) {
      SS.els.placaForm._bound = true;
      SS.els.placaForm.addEventListener('submit', e => {
        e.preventDefault();
        const nome = SS.els.placaNome?.value.trim();
        const pot = safeNumber(SS.els.placaPotencia?.value, 0);
        const status = SS.els.placaStatus?.value || 'Ativa';
        if (!nome || pot <= 0) return alert('Dados inválidos.');
        if (SS.placas.some(p => p.nome.toLowerCase() === nome.toLowerCase()))
          return alert('Nome já existe.');
        SS.placas.push({ nome, potencia: +pot.toFixed(2), status });
        ensurePanelState();
        renderPlacas();
        atualizarCards();
        updatePlacasDoughnut();
        refreshAnalisesImmediate();
        SS.els.placaForm.reset();
      });
    }
    // Busca usuários
    if (SS.els.userSearch && !SS.els.userSearch._deb) {
      let t;
      const h = () => { clearTimeout(t); t = setTimeout(updateUserList, 180); };
      ['input','change','keyup'].forEach(ev => SS.els.userSearch.addEventListener(ev, h));
      SS.els.userSearch._deb = true;
    }
    // Add user
    SS.els.addUserBtn?.addEventListener('click', () => {
      const val = (SS.els.addUser?.value || '').trim();
      if (!val) return alert('Informe nome ou e-mail.');
      const obj = loadUsersObj();
      if (obj[val]) return alert('Já existe.');
      const isEmail = val.includes('@');
      obj[val] = { name: isEmail ? val.split('@')[0] : val, email: isEmail ? val : '' };
      saveUsersObj(obj);
      setUserPerm(val, 'viewer');
      SS.els.addUser.value = '';
      updateUserList();
      alert('Usuário adicionado.');
    });
    // Remove user
    SS.els.removeUserBtn?.addEventListener('click', () => {
      const q = (SS.els.removeUser?.value || '').trim();
      if (!q) return;
      const obj = loadUsersObj();
      const key = findUserKey(obj, q);
      if (!key) return alert('Não encontrado.');
      delete obj[key];
      saveUsersObj(obj);
      const perms = getUserPerms(); delete perms[key];
      localStorage.setItem('userPerms', JSON.stringify(perms));
      SS.els.removeUser.value = '';
      updateUserList();
      alert('Removido.');
    });
    // Permissão direta
    SS.els.setPermBtn?.addEventListener('click', () => {
      const q = (SS.els.permUserName?.value || '').trim();
      if (!q) return;
      const obj = loadUsersObj();
      const key = findUserKey(obj, q);
      if (!key) return alert('Usuário não cadastrado.');
      setUserPerm(key, SS.els.userPermSelect?.value || 'viewer');
      updateUserList();
      alert('Permissão atualizada.');
    });
    // Notificações
    if (SS.els.emailNotify) SS.els.emailNotify.value = localStorage.getItem('notifyEmail') || '';
    if (SS.els.smsNotify) SS.els.smsNotify.value = localStorage.getItem('notifySMS') || '';
    if (SS.els.alertLowGen) SS.els.alertLowGen.checked = localStorage.getItem('alertLowGen') === 'true';
    SS.els.saveNotifications?.addEventListener('click', () => {
      if (SS.els.emailNotify) localStorage.setItem('notifyEmail', SS.els.emailNotify.value);
      if (SS.els.smsNotify) localStorage.setItem('notifySMS', SS.els.smsNotify.value);
      if (SS.els.alertLowGen) localStorage.setItem('alertLowGen', SS.els.alertLowGen.checked);
      alert('Notificações salvas.');
    });

    // Filtros análises
    SS.els.analysisHeatMetric?.addEventListener('change', renderAnalysisHeatmap);
    SS.els.analysisEventType?.addEventListener('change', renderAnalysisTimeline);
    SS.els.analysisEventSeverity?.addEventListener('change', renderAnalysisTimeline);
    SS.els.analysisRange?.addEventListener('change', () => {
      if (SS.charts.forecast) SS.charts.forecast.update();
    });

    // Limpar alertas
    SS.els.clearAlerts?.addEventListener('click', () => {
      localStorage.setItem('alertas', JSON.stringify([]));
      renderAlertas();
      updateSupportBadge();
    });

    // Logout
    SS.els.logoutBtn?.addEventListener('click', () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'index.html';
    });

    /* ---------------- CONFIGURAÇÕES (Parâmetros / Limites / Preferências) ---------------- */
    // Carregar valores persistidos
    const plantCapacity = $('plantCapacity');
    const tariff = $('tariff');
    const minGen = $('minGen');
    const maxDelta = $('maxDelta');
    const themeSelect = $('themeSelect');
    const langSelect = $('langSelect');
    const saveSettings = $('saveSettings');
    const saveThresholds = $('saveThresholds');
    const backupBtn = $('backupBtn');
    const restoreBtn = $('restoreBtn');

    // Util para parse seguro
    const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

    // Inicialização de campos se já salvos
    if (plantCapacity) {
      const v = localStorage.getItem('plantCapacity');
      if (v) plantCapacity.value = v;
    }
    if (tariff) {
      const v = localStorage.getItem('tariff');
      if (v) tariff.value = v;
    }
    if (minGen) {
      const v = localStorage.getItem('minGen');
      if (v) minGen.value = v;
    }
    if (maxDelta) {
      const v = localStorage.getItem('maxDelta');
      if (v) maxDelta.value = v;
    }
    if (themeSelect) {
      const cur = localStorage.getItem('theme') || document.body.getAttribute('data-theme') || 'dark';
      themeSelect.value = cur;
      themeSelect.addEventListener('change', () => {
        const val = themeSelect.value;
        document.body.setAttribute('data-theme', val);
        localStorage.setItem('theme', val);
        updateChartsTheme();
        if (SS.els.darkToggle) SS.els.darkToggle.textContent = val === 'dark' ? '☀️' : '🌙';
      });
    }
    // Suporte simples a idioma (stub) – se existir função futura setLanguage
    function setLanguage(lang){
      localStorage.setItem('lang', lang);
      // Placeholder: aqui poderia percorrer map de traduções
    }
    if (langSelect) {
      const cur = localStorage.getItem('lang') || 'pt';
      langSelect.value = cur;
      langSelect.addEventListener('change', () => setLanguage(langSelect.value));
    }

    saveSettings?.addEventListener('click', () => {
      if (plantCapacity) localStorage.setItem('plantCapacity', plantCapacity.value);
      if (tariff) localStorage.setItem('tariff', tariff.value);
      alert('Parâmetros salvos.');
    });
    saveThresholds?.addEventListener('click', () => {
      if (minGen) localStorage.setItem('minGen', minGen.value);
      if (maxDelta) localStorage.setItem('maxDelta', maxDelta.value);
      alert('Limites salvos.');
    });

    // Backup & Restore simples
    backupBtn?.addEventListener('click', () => {
      const keys = [
        'users','userPerms','alertas','tickets','theme','lang','plantCapacity','tariff','minGen','maxDelta',
        'notifyEmail','notifySMS','alertLowGen','userProfileImg'
      ];
      const data = {};
      keys.forEach(k => { const v = localStorage.getItem(k); if (v!=null) data[k]=v; });
      const blob = new Blob([JSON.stringify({ ts:Date.now(), data }, null, 2)], { type:'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'smartsolar-backup.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    restoreBtn?.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'application/json';
      inp.onchange = () => {
        const file = inp.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = ev => {
          try {
            const json = JSON.parse(ev.target.result);
            if (!json || !json.data) return alert('Arquivo inválido.');
            Object.entries(json.data).forEach(([k,v]) => localStorage.setItem(k, v));
            alert('Restauração concluída. Recarregando...');
            window.location.reload();
          } catch { alert('Falha ao restaurar.'); }
        };
        r.readAsText(file);
      };
      inp.click();
    });
  }

  /* --------------------- PERFIL (Modal simples) --------------------- */
  function initProfile() {
    const {
      profileModal, userMenu, closeProfile, editProfileBtn,
      saveProfile, cancelEdit, profileView, profileEdit,
      profileName, profileEmail, profileStatus, editName,
      editEmail, editStatus, userProfileImg, editProfileImg, previewProfileImg
    } = SS.els;

    if (!profileModal || !userMenu) return;
    profileModal.style.display = 'none';
    userMenu.addEventListener('click', ()=> profileModal.style.display = 'flex');
    closeProfile?.addEventListener('click', ()=> profileModal.style.display = 'none');

    editProfileBtn?.addEventListener('click', ()=> {
      profileView?.classList.add('hidden');
      profileEdit?.classList.remove('hidden');
      if (editName && profileName) editName.value = profileName.textContent;
      if (editEmail && profileEmail) editEmail.value = profileEmail.textContent;
      if (editStatus && profileStatus) editStatus.value = profileStatus.textContent;
    });
    cancelEdit?.addEventListener('click', ()=> {
      profileView?.classList.remove('hidden');
      profileEdit?.classList.add('hidden');
    });
    saveProfile?.addEventListener('click', ()=> {
      if (profileName && editName) profileName.textContent = editName.value;
      if (profileEmail && editEmail) profileEmail.textContent = editEmail.value;
      if (profileStatus && editStatus) profileStatus.textContent = editStatus.value;
      // Persiste o nome atualizado
      if (editName && editName.value) localStorage.setItem('userName', editName.value);
      if (previewProfileImg && previewProfileImg.src.startsWith('data:image')) {
        localStorage.setItem('userProfileImg', previewProfileImg.src);
        if (userProfileImg) userProfileImg.src = previewProfileImg.src;
        // sidebar menu
        const img = userMenu.querySelector('img');
        if (img) img.src = previewProfileImg.src;
      }
      profileView?.classList.remove('hidden');
      profileEdit?.classList.add('hidden');
      const span = userMenu.querySelector('span');
      if (span && editName) span.textContent = editName.value;
    });
    editProfileImg?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = ev => { if (previewProfileImg) previewProfileImg.src = ev.target.result; };
      r.readAsDataURL(file);
    });

    // Preenche nome/email iniciais
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    if (profileEmail && userEmail) profileEmail.textContent = userEmail;
    const displayName = userName || (userEmail ? userEmail.split('@')[0] : 'Usuário');
    if (profileName) profileName.textContent = displayName;
    // Avatar e nome do modal de perfil
    if (userProfileImg) {
      const saved = localStorage.getItem('userProfileImg');
      if (saved) userProfileImg.src = saved;
      else userProfileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00d4ff&color=fff`;
    }
    // Sincroniza também o menu lateral (avatar + nome)
    if (userMenu) {
      const menuImg = userMenu.querySelector('img');
      const menuSpan = userMenu.querySelector('span');
      if (menuSpan) menuSpan.textContent = displayName;
      const saved = localStorage.getItem('userProfileImg');
      const avatarUrl = saved || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00d4ff&color=fff`;
      if (menuImg) menuImg.src = avatarUrl;
    }
  }

  /* --------------------- VIEW TOGGLE (Dashboard / Placas) --------------------- */
  function bindToggleView() {
    const { toggleView, sectionDashboard, sectionPlacas, pageTitle } = SS.els;
    if (!toggleView || !sectionDashboard || !sectionPlacas) return;
    let showingPlacas = false;
    sectionPlacas.hidden = true;
    toggleView.addEventListener('click', () => {
      showingPlacas = !showingPlacas;
      sectionDashboard.hidden = showingPlacas;
      sectionPlacas.hidden = !showingPlacas;
      if (pageTitle) pageTitle.textContent = showingPlacas ? 'Placas' : 'Dashboard';
    });
  }

  /* --------------------- INIT --------------------- */
  function init() {
    if (SS.inited) return;
    SS.inited = true;

    cacheElements();
    initPlacasDefault();
    ensurePanelState();
    if (!SS.panelEvents.length) SS.panelEvents.push({ time: Date.now(), tipo:'sistema', sev:'baixa', desc:'Monitor iniciado' });

    initTheme();
    initTabs();
    bindForms();
    bindSupport();
    initProfile();
    bindToggleView();
  initClock();

    renderPlacas();
  bindPlacaTable(); // Necessário para botões de Editar / Duplicar / Remover
    atualizarCards();
    renderAlertas();
    updateSupportBadge();
    updateUserList();
    initCharts();
  seedInitialCharts();
    updateAnalysisKPIs();
    renderAnalysisHeatmap();
    renderAnalysisRanking();
    renderAnalysisTimeline();

    // Ano
    if (SS.els.year) SS.els.year.textContent = new Date().getFullYear();

    startSimulation();
  }

  document.addEventListener('DOMContentLoaded', init);

  // Expose para debug opcional
  window.SmartSolar = SS;
})();