(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var isTourSkipped = /[?&]notour/.test(location.search);

  /* ============================ CONSOLA · HERO ============================ */
  function feeds() {
    var feed = $('#feed2');
    if (!feed || feed._on) return;
    feed._on = true;
    var lineas = [
      ['> init bus_actuadores …… OK', 'ok'],
      ['> pin D9 [PWM] online', 'ok'],
      ['> motor DC · mando integrado', 'ok'],
      ['> válvula 5/2 · vía B → escape', 'warn'],
      ['> motobomba · presión 0 bar', 'ok'],
      ['> estado: AGUARDANDO ORDEN', 'err'],
      ['> sistema LISTO · t+0.00s', 'ok'],
      ['> esperando comando …', 'dim']
    ];
    var li = 0, ci = 0, el = null;
    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    feed.appendChild(cursor);
    function lineaActual() {
      el = document.createElement('div');
      el.className = 'l ' + (lineas[li][1] || '');
      feed.insertBefore(el, cursor);
      while (feed.querySelectorAll('.l').length > 7) feed.removeChild(feed.querySelector('.l'));
    }
    function tipear() {
      if (ci === 0) lineaActual();
      ci++;
      el.textContent = lineas[li][0].slice(0, ci);
      if (ci < lineas[li][0].length) setTimeout(tipear, 16 + Math.random() * 26);
      else setTimeout(function () { li = (li + 1) % lineas.length; ci = 0; tipear(); }, 620);
    }
    setTimeout(tipear, 260);
  }

  /* ============================ GLYPH HERO (A C T) ============================ */
  var GLYPH = {
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100']
  };
  function pintarGlyph() {
    var cv = $('#heroGlyph2');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var cell = 7, step = 8;
    var col0 = Math.floor((performance.now() / 60) % 17);
    ctx.clearRect(0, 0, cv.width, cv.height);
    var xo = 8;
    var letras = ['A', 'C', 'T'];
    for (var li = 0; li < letras.length; li++) {
      var bits = GLYPH[letras[li]];
      for (var r = 0; r < 7; r++) {
        for (var c = 0; c < 5; c++) {
          if (bits[r][c] !== '1') continue;
          var gcx = xo + li * 6 * step + c * step;
          var gcy = 8 + r * step;
          var ilu = (li * 6 + c === col0);
          ctx.fillStyle = ilu ? '#ff0036' : '#d9d9d9';
          ctx.fillRect(gcx, gcy, cell, cell);
          if (ilu) { ctx.fillStyle = 'rgba(255,0,54,.18)'; ctx.fillRect(gcx - 2, gcy - 2, cell + 4, cell + 4); }
        }
      }
    }
    ctx.fillStyle = '#ff0036';
    ctx.fillRect(xo, 8 + 7 * step + 3, 3 * 6 * step - step, 2);
    requestAnimationFrame(pintarGlyph);
  }

  /* ============================ SCROLLSPY ============================ */
  function linkificar() {
    var chips = $$('.nav-chip');
    var secs = $$('main .section');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        chips.forEach(function (c) { c.classList.toggle('active', c.getAttribute('href') === '#' + id); });
      });
    }, { threshold: 0.4, rootMargin: '-10% 0px -45% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ============================ 01 CADENA S→C→A ============================ */
  function cadena() {
    var nodes = $$('#chainAct .act-node');
    var arrows = $$('#chainAct .act-chain-arrow');
    var btn = $('#btnExec');
    var read = $('#execRead');
    if (!nodes.length) return;
    var turnos = [
      ['SENSOR', 'fotoeléctrico = 1 · objeto presente', 'ok'],
      ['CONTROLADOR', 'lógica ≥ consigna · decide ACTUAR', 'ok'],
      ['ACTUADOR', 'salida D9 PWM = 70 % · MOTOR ON', 'err'],
      ['resultado', 'CINTA AVANZA · v = 24 m/min', 'ok']
    ];
    var n = 0;
    function refrescar() {
      var on = nodes.every(function (nd) { return nd.classList.contains('lit'); });
      btn.disabled = !on;
      arrows.forEach(function (a, i) { a.classList.toggle('lit', nodes[i] && nodes[i].classList.contains('lit')); });
      if (on) read.innerHTML = '<div class="l dim">bus_actuador :: cadena completa — pulsa EJECUTAR.</div>';
      else read.innerHTML = '<div class="l dim">bus_actuador :: la cadena está incompleta. Activa sensor, controlador y actuador.</div>';
    }
    nodes.forEach(function (nd) {
      nd.addEventListener('click', function () { nd.classList.toggle('lit'); refrescar(); });
    });
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var t = turnos[n % turnos.length];
      n++;
      read.innerHTML = '<div class="l ' + t[2] + '">> ' + t[0] + ' :: ' + t[1] + '</div>' + read.innerHTML.slice(0, 1000);
      while (read.querySelectorAll('.l').length > 6) read.removeChild(read.querySelector('.l'));
    });
    refrescar();
  }

  /* ============================ 01b LAZO CERRADO ============================ */
  function lazo() {
    var stage = $('#cpSet');
    if (!stage) return;
    var pos = 0, setp = 50, Kp = 0.55, reg = false;
    function pintar() {
      var err = setp - pos;
      var out = clamp(Kp * err, -100, 100);
      pos = clamp(pos + out * 0.07, 0, 100);
      $('#lpSensorVal').textContent = pos.toFixed(1) + ' %';
      $('#lpSensorBar').style.width = pos + '%';
      $('#lpCtrlVal').textContent = (out >= 0 ? '+' : '') + out.toFixed(0) + ' %';
      $('#lpCtrlBar').style.width = Math.abs(out) + '%';
      $('#lpActVal').textContent = (out >= 0 ? '+' : '') + Math.abs(out).toFixed(0) + ' %';
      $('#lpActBar').style.width = Math.abs(out) + '%';
      $('#lpErr').textContent = (err >= 0 ? '+' : '') + err.toFixed(1);
      $('#lpSensor').classList.toggle('lit', true);
      $('#lpCtrl').classList.toggle('lit', Math.abs(out) > 1);
      $('#lpAct').classList.toggle('lit', Math.abs(out) > 1);
      var ok = Math.abs(err) < 0.8;
      var st = $('#lpStatus');
      st.className = 'loop-status' + (ok ? ' on' : '');
      st.innerHTML = '<span class="dot"></span>' + (ok ? 'EN SEGUIMIENTO · lazo estable' : 'REGULANDO · reduciendo error');
    }
    stage.addEventListener('input', function () { setp = +stage.value; $('#cpSetVal').textContent = setp; });
    $('#lpPert').addEventListener('click', function () {
      pos = clamp(pos - 16, 0, 100);
      $("#lpActBar").style.background = 'var(--amber)';
      setTimeout(function () { $("#lpActBar").style.background = ''; }, 400);
    });
    pintar();
    setInterval(pintar, 62);
  }

  /* ============================ 02 CLASIFICACIÓN ============================ */
  function clasificar() {
    var grid = $('#amaGrid');
    if (!grid) return;
    var tiles = $$('.tile', grid);
    var segs = $$('#amaSegs .seg');
    var nCount = $('#amaCount');
    var nDet = $('#amaDetail');
    function filtro() {
      var sel = document.querySelector('#amaSegs .seg.active');
      var f = sel ? sel.dataset.f : 'all';
      var vis = 0;
      tiles.forEach(function (t) {
        var show = f === 'all' || t.dataset.c.indexOf(f) !== -1;
        t.style.display = show ? '' : 'none';
        if (show) vis++;
        if (!show && t.classList.contains('on')) { t.classList.remove('on'); nDet.textContent = 'Selecciona un actuador para inspeccionarlo.'; }
      });
      nCount.textContent = tiles.length + ' actuadores / ' + vis + ' visibles';
    }
    segs.forEach(function (se) {
      se.addEventListener('click', function () {
        segs.forEach(function (s) { s.classList.remove('active'); });
        se.classList.add('active');
        filtro();
      });
    });
    tiles.forEach(function (t) {
      t.addEventListener('click', function () {
        tiles.forEach(function (x) { x.classList.remove('on'); });
        t.classList.add('on');
        nDet.textContent = t.dataset.d || '';
      });
    });
    filtro();
  }

  /* ============================ 03 MOTORES ============================ */
  var MOT_PRINC = {
    dc: 'El motor de corriente continua gira proporcional al voltaje. El controlador solo conmuta la alimentación a alta frecuencia (PWM): la velocidad la decide el ciclo de trabajo y el sentido, la polaridad.',
    ac: 'El motor de inducción AC gira a una velocidad ligada a la frecuencia de red (120·f/p). Para invertir el sentido se intercambian dos fases del trifásico y el campo giratorio cambia de dirección.',
    step: 'El motor paso a paso avanza 1.8° por cada pulso del controlador (200 pasos/vuelta). Su posición es exacta por construcción: no necesita encoder para posicionar.'
  };
  function dibMotor(ctx, ang, opt) {
    var W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2, R = 46;
    ctx.strokeStyle = '#202020'; ctx.lineWidth = 1; ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    if (opt.field3) {
      for (var k = 0; k < 3; k++) {
        var a = ang + k * Math.PI * 2 / 3 + (opt.rev ? -0 : 0);
        ctx.strokeStyle = k === 0 ? '#ff0036' : '#555';
        ctx.lineWidth = k === 0 ? 2 : 1.5;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 4, 0, Math.PI * 2); ctx.fillStyle = k === 0 ? '#ff0036' : '#777'; ctx.fill();
      }
      ctx.fillStyle = '#8a8a8a'; ctx.font = '11px Space Mono, monospace';
      ctx.fillText('campo giratorio', 10, 16);
      ctx.fillStyle = '#ff0036'; ctx.fillText(opt.on ? (opt.rev ? 'REV ←' : 'FWD →') : 'SIN ALIMENTACIÓN', 10, H - 8);
      return;
    }
    ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (var n = 0; n < 4; n++) {
      var sp = ang + n * Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(sp) * R * 0.86, cy + Math.sin(sp) * R * 0.86);
      ctx.lineTo(cx + Math.cos(sp + Math.PI) * R * 0.86, cy + Math.sin(sp + Math.PI) * R * 0.86); ctx.stroke();
    }
    ctx.fillStyle = '#0d0d0d'; ctx.strokeStyle = '#ff0036'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff0036'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a8a8a'; ctx.font = '11px Space Mono, monospace';
    if (opt.mode === 'step') {
      ctx.fillText('pasos: ' + opt.steps, 10, 16);
      ctx.fillStyle = '#ff0036';
      ctx.fillText(opt.auto ? 'AUTO · girando' : ((opt.steps % 72) === 0 ? 'posicionado °' : 'pulso emitido'), 10, H - 8);
    } else if (opt.mode === 'dc') {
      ctx.fillText('rpm = ' + Math.round(opt.rpm), 10, 16);
      ctx.fillStyle = opt.rpm === 0 ? '#555' : '#ff0036';
      ctx.fillText(opt.rpm === 0 ? 'PWM 0 % · motor detenido' : (opt.rpm > 0 ? 'CW →' : '← CCW'), 10, H - 8);
    }
  }
  function motores() {
    var cv = $('#motCanvas');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var tabs = $$('#motTabs .seg');
    var mode = 'dc';
    var dc = { pwm: 0, load: 0, dir: 1, ang: 0 };
    var ac = { on: false, rev: false, ang: 0 };
    var sp = { ang: 0, dir: 1, auto: false, t: null };
    var coilRow = $('#coilRow');
    var coils = $$('.coil', $('#coilRow'));
    var PAT = [[1, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 1], [1, 0, 0, 1]];
    function coilBits() {
      var step = ((Math.round(sp.ang / 1.8) % 4) + 4) % 4;
      return PAT[step];
    }
    function syncCoils() {
      var b = coilBits();
      if (coils.length) coils.forEach(function (c, i) { c.classList.toggle('on', b[i]); });
    }
    function pintarCtrl() {
      $('#ctlDC').style.display = mode === 'dc' ? '' : 'none';
      $('#dcCtl2').style.display = mode === 'dc' ? '' : 'none';
      $('#ctlAC').style.display = mode === 'ac' ? '' : 'none';
      $('#ctlSTEP').style.display = mode === 'step' ? '' : 'none';
      coilRow.style.display = mode === 'step' ? '' : 'none';
      $('#motPrinc').textContent = MOT_PRINC[mode] || '';
      $('#mR1').textContent = '·'; $('#mR2').textContent = '·';
      $('#mR3').textContent = '·'; $('#mR4').textContent = '·';
    }
    function anim(ts) {
      var d = Math.min(1.2, (ts - (anim.last || ts)) / 1000); anim.last = ts;
      if (mode === 'dc') {
        var derate = 0.2 + 0.8 * (1 - dc.load / 100);
        dc.ang += dc.pwm / 100 * 3000 / 60 * 2 * Math.PI * d * dc.dir;
        var rpm = dc.pwm * 30 * derate * dc.dir;
        var Tq = dc.pwm > 0 ? (dc.load / 100) * (dc.pwm / 100) * 0.55 : 0;
        var I = 0.15 + (dc.pwm / 100) * (0.45 + dc.load / 100 * 1.1);
        var P = Math.abs(Tq * rpm * 0.10472);
        $('#mR1').textContent = Math.round(rpm) + ' rpm';
        $('#mR2').textContent = Tq.toFixed(2) + ' N·m';
        $('#mR3').textContent = I.toFixed(2) + ' A';
        $('#mR4').textContent = P.toFixed(0) + ' W';
        dibMotor(ctx, dc.ang, { mode: 'dc', rpm: rpm });
      } else if (mode === 'ac') {
        var vel = 120 * 60 / 2; // 3600 rpm, 2 polos
        if (ac.on) ac.ang += (ac.rev ? -1 : 1) * vel / 60 * 2 * Math.PI * d;
        $('#mR1').textContent = ac.on ? Math.round(vel) + ' rpm (síncrona)' : '0 rpm';
        $('#mR2').textContent = ac.on ? 'campo giratorio' : 'desconectado';
        $('#mR3').textContent = ac.on ? (ac.rev ? 'fases L1/L2 → invertidas' : 'secuencia L1-L2-L3') : '—';
        $('#mR4').textContent = ac.on ? '380 V · 60 Hz' : '—';
        dibMotor(ctx, ac.ang, { field3: true, on: ac.on, rev: ac.rev });
      } else {
        if (sp.auto) sp.ang += 1.8 * sp.dir;
        $('#spAngle').textContent = ((sp.ang % 360) + 360) % 360 + '°';
        $('#mR1').textContent = clib((sp.ang % 360)) + '°';
        $('#mR2').textContent = Math.round(sp.ang / 1.8) + ' pasos';
        $('#mR3').textContent = sp.auto ? 'auto · ' + sp.dir + ' /s' : 'manual';
        $('#mR4').textContent = '1.8°/paso';
        dibMotor(ctx, sp.ang * Math.PI / 180, { mode: 'step', auto: sp.auto, steps: Math.round(sp.ang / 1.8) });
        syncCoils();
      }
      requestAnimationFrame(anim);
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        mode = t.dataset.m;
        pintarCtrl();
      });
    });
    $('#dcPwm').addEventListener('input', function () { dc.pwm = +this.value; });
    $('#dcLoad').addEventListener('input', function () { dc.load = +this.value; });
    $('#dcDir').addEventListener('click', function () {
      dc.dir *= -1;
      $('#dcDirV').textContent = dc.dir > 0 ? 'CW →' : '← CCW';
    });
    $('#acOn').addEventListener('click', function () {
      ac.on = !ac.on;
      this.textContent = ac.on ? 'Apagar' : 'Encender';
      this.classList.toggle('red', ac.on);
      $('#acRev').disabled = !ac.on;
      if (!ac.on) ac.ang = 0;
    });
    $('#acRev').addEventListener('click', function () {
      ac.rev = !ac.rev;
      this.textContent = ac.rev ? 'Reinvertir fases' : 'Invertir fases';
    });
    function spStep(d) {
      if (sp.auto) return;
      sp.ang += 1.8 * d;
      $('#spAngle').textContent = ((sp.ang % 360) + 360) % 360 + '°';
    }
    $('#spL').addEventListener('click', function () { spStep(-1); });
    $('#spR').addEventListener('click', function () { spStep(1); });
    $('#spAuto').addEventListener('click', function () {
      sp.auto = !sp.auto;
      this.textContent = 'Auto: ' + (sp.auto ? 'ON' : 'OFF');
      this.classList.toggle('red', sp.auto);
    });
    function clib(v) { return ((v % 360) + 360) % 360; }
    pintarCtrl();
    requestAnimationFrame(anim);
  }

  /* ============================ 04 NEUMÁTICA ============================ */
  function neumatica() {
    var avBtn = $('#pneAv'), reBtn = $('#pneRe');
    if (!avBtn) return;
    var piston = $('#pnePiston'), rod = $('#pneRod'), tip = $('#pneTip'), hose = $('#pneHose');
    var tabs = $$('#pneTabs .seg');
    var ptab = 'se', posP = 0, targetP = 0, air = false, iv = null;
    function mover() {
      clearInterval(iv);
      iv = setInterval(function () {
        var d = targetP - posP;
        if (Math.abs(d) < 0.005) { posP = targetP; clearInterval(iv); apply(); return; }
        posP += Math.sign(d) * 0.03;
        apply();
      }, 30);
    }
    function apply() {
      var pl = 62 + posP * 50;
      piston.style.left = pl + 'px';
      rod.style.width = (10 + posP * 54) + 'px';
      tip.style.left = (160 + posP * 54) + 'px';
      air = posP > 0.04;
      hose.classList.toggle('live', air);
      $('#pneValve').textContent = posP > 0.5 ? 'vía A → avance' : 'vía B → escape';
      $('#pnePos').textContent = Math.round(posP * 100) + ' mm';
      $('#pnePress').textContent = air ? '6.0 bar' : '0 bar';
    }
    avBtn.addEventListener('click', function () { targetP = 1; mover(); });
    reBtn.addEventListener('click', function () { targetP = 0; mover(); });
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        ptab = t.dataset.p;
        $('#pnePrinc').textContent = ptab === 'se'
          ? 'Simple efecto: una sola vía de aire (A). El avance lo hace la presión y el retroceso lo hace un resorte interno. Menos fuerza y carrera limitada.'
          : 'Doble efecto: aire en ambas cámaras (A avanza, B retrocede). Fuerza controlada en los dos sentidos y carrera completa: el cilindro estándar de automatización.';
      });
    });
    $('#pnePrinc').textContent = 'Simple efecto: una sola vía de aire (A). El avance lo hace la presión y el retroceso lo hace un resorte interno. Menos fuerza y carrera limitada.';
    apply();
  }

  /* ============================ 05 HIDRÁULICA ============================ */
  function hidraulica() {
    var pump = $('#hydPump'), vent = $('#hydVent');
    if (!pump) return;
    var piston = $('#hydPiston'), rod = $('#hydRod'), pumpIcon = $('#hydPumpIcon'), bar = $('#hydBarFill');
    var pr = 0, pumpT = null, ventT = null;
    function pintar() {
      var posP = pr / 120;
      piston.style.bottom = (4 + posP * 96) + 'px';
      rod.style.bottom = (30 + posP * 96) + 'px';
      rod.style.height = (24 + posP * 8) + 'px';
      bar.style.height = (posP * 100) + '%';
      $('#hydPress').textContent = Math.round(pr) + ' bar';
      $('#hydForce').textContent = (pr * 2.5).toFixed(1) + ' kN';
      $('#hydPos').textContent = Math.round(posP * 100) + ' %';
      pumpIcon.classList.toggle('spin', pr > 0);
      var run = (pr > 0 && pumpT !== null);
      $('#hydPrinc').textContent = run
        ? 'La motobomba entrega aceite a ' + Math.round(pr) + ' bar: el caudal vence la carga y el cilindro eleva. F = p·A.'
        : 'La motobomba genera presión (bar) y caudal (l/min); el cilindro convierte la presión en fuerza: F = p·A. Con un pistón grande, 120 bar levantan cientos de kilonewtons con un giro suave.';
    }
    function onDown(e) {
      e.preventDefault();
      if (pumpT || ventT) return;
      pumpT = setInterval(function () {
        pr = Math.min(120, pr + 6);
        pintar();
        if (pr >= 120) { clearInterval(pumpT); pumpT = null; }
      }, 26);
    }
    function onUp() { if (pumpT) { clearInterval(pumpT); pumpT = null; pintar(); } }
    ['mousedown', 'touchstart'].forEach(function (ev) { pump.addEventListener(ev, onDown); });
    ['mouseup', 'mouseleave', 'touchend'].forEach(function (ev) { pump.addEventListener(ev, onUp); });
    vent.addEventListener('click', function () {
      onUp();
      if (ventT) return;
      ventT = setInterval(function () {
        pr = Math.max(0, pr - 14);
        pintar();
        if (pr <= 0) { clearInterval(ventT); ventT = null; }
      }, 26);
    });
    pintar();
  }

  /* ============================ 06 ON/OFF ============================ */
  function dispositivos() {
    var solBtn = $('#solBtn');
    if (solBtn) {
      var vis = $('#solVis'), st = $('#solState'), on = false;
      solBtn.dataset.lbl = 'Apagar';
      solBtn.addEventListener('click', function () {
        on = !on;
        vis.classList.toggle('on', on);
        st.textContent = on ? 'VA · abierta' : 'VF · cerrada';
        $('#solPortR').textContent = on ? 'flujo ●' : 'VA·VF';
        $('#solPortL').textContent = on ? 'salida ●' : 'O entrada';
        $('#solPortL').classList.toggle('live', on);
        $('#solPortR').classList.toggle('live', on);
        solBtn.textContent = on ? 'Desenergizar bobina' : 'Energizar bobina';
        solBtn.classList.toggle('red', on);
      });
    }
    var pilBtn = $('#pilBtn');
    if (pilBtn) {
      var pvis = $('#pilVis'), pst = $('#pilState'), pon = false;
      pilBtn.addEventListener('click', function () {
        pon = !pon;
        pvis.classList.toggle('on', pon);
        pst.textContent = pon ? 'ON · señal' : 'OFF';
        pilBtn.textContent = pon ? 'Apagar piloto' : 'Encender piloto';
        pilBtn.classList.toggle('red', pon);
      });
    }
    var buzzBtn = $('#buzzBtn');
    if (buzzBtn) {
      var bvis = $('#buzzVis'), bst = $('#buzzState');
      function bOn(e) {
        e.preventDefault();
        bvis.classList.add('on');
        bst.textContent = 'SONANDO · 4 kHz';
      }
      function bOff() {
        bvis.classList.remove('on');
        bst.textContent = 'silenciado';
      }
      ['mousedown', 'touchstart'].forEach(function (ev) { buzzBtn.addEventListener(ev, bOn); });
      ['mouseup', 'mouseleave', 'touchend'].forEach(function (ev) { buzzBtn.addEventListener(ev, bOff); });
    }
  }

/* ============================ 07 COMPARADOR ============================ */
  var CMP = [
    ['Motor DC', 'fa-compress-alt', [2, 4, 3, 2, 4], 'Regulación fina por PWM y par moderado. Pierde eficiencia a cargas altas; perfecto para bandas con variador.', 'bandas · bombas'],
    ['Motor AC', 'fa-bolt', [4, 4, 2, 3, 5], 'Potencia y robustez para trabajo continuo. Velocidad ligada a la red; necesita variador si se quiere regular.', 'máquinas industriales'],
    ['Paso a paso', 'fa-list-ul', [2, 2, 5, 2, 3], 'Posicionamiento exacto por pulsos, sin encoder. Bajo par; ideal donde la carga es ligera.', 'impresoras · CNC'],
    ['Servomotor', 'fa-robot', [3, 4, 5, 3, 2], 'El lazo cerrado interno (encoder) da precisión, velocidad y par controlados. El más caro del grupo.', 'robótica'],
    ['Solenoide', 'fa-magnet', [2, 5, 2, 2, 4], 'On/off instantáneo con bobina. Sin posiciones intermedias: perfecto para válvulas y contactos.', 'válvulas · pilotos'],
    ['Cil. neumático', 'fa-wind', [3, 5, 3, 4, 4], 'Rápido, limpio y económico. Exige compresor; fuerza limitada y posiciones discretas.', 'empuje · sujeción'],
    ['Cil. hidráulico', 'fa-arrows-alt-v', [5, 3, 4, 4, 2], 'La mayor fuerza del grupo con movimiento suave. Costo de instalación y mantenimiento alto.', 'prensas · excavadoras'],
    ['Motobomba', 'fa-cog', [4, 3, 2, 2, 3], 'Energiza el circuito hidráulico: presión y caudal. El corazón de cualquier instalación de aceite.', 'alimenta cilindros']
  ];
  function comparador() {
    var tbl = $('#cmpTbl');
    if (!tbl) return;
    CMP.forEach(function (r, i) {
      var lab = document.createElement('div');
      lab.className = 'row';
      lab.style.gridColumn = '1';
      lab.dataset.row = String(i);
      lab.innerHTML = '<span class="rk" data-i="' + i + '"><i class="fas ' + r[1] + '"></i>' + r[0] + '</span>';
      tbl.appendChild(lab);
      r[2].forEach(function (v) {
        var b = document.createElement('div');
        b.className = 'row';
        b.dataset.row = String(i);
        b.innerHTML = '<div class="cmp-bar"><i style="width:' + (v * 20) + '%"></i></div>';
        tbl.appendChild(b);
      });
      lab.style.cursor = 'pointer';
    });
    function detalle(i) {
      var r = CMP[i];
      $('#cmpDetail').innerHTML = '<span class="muted">' + r[3] + '</span><b class="red">usa: ' + r[4] + '</b>';
      $$('#cmpTbl .row').forEach(function (x) {
        x.classList.toggle('active', x.dataset.row === String(i));
      });
    }
    $$('#cmpTbl .rk').forEach(function (k) {
      k.addEventListener('click', function () { detalle(+k.dataset.i); });
    });
  }

  /* ============================ 08 CRITERIOS ============================ */
  var PROF = [
    ['Motor DC', [2, 3, 4, 4]],
    ['Motor AC', [4, 2, 4, 5]],
    ['Paso a paso', [2, 5, 2, 3]],
    ['Servomotor', [3, 5, 4, 2]],
    ['Cil. neumático', [3, 3, 5, 4]],
    ['Cil. hidráulico', [5, 4, 3, 2]],
    ['Solenoide', [2, 2, 5, 4]],
    ['Motobomba', [4, 2, 3, 3]]
  ];
  function criterios() {
    var list = $('#rankList');
    if (!list) return;
    var el = ['crF', 'crP', 'crV', 'crE'];
    var vl = ['crFv', 'crPv', 'crVv', 'crEv'];
    var rows = [];
    PROF.forEach(function (p) {
      var r = document.createElement('div');
      r.className = 'rank-row';
      r.innerHTML = '<span class="mono small muted">' + p[0] + '</span><div class="rank-track"><span class="rank-fill"></span></div><span class="rank-score">0</span>';
      list.appendChild(r);
      rows.push({ p: p, node: r });
    });
    function calc() {
      var w = el.map(function (id) { return +document.getElementById(id).value; });
      el.forEach(function (id, i) { document.getElementById(vl[i]).textContent = w[i]; });
      var scores = PROF.map(function (p, i) {
        var s = 0;
        for (var k = 0; k < 4; k++) s += p[1][k] * w[k];
        return { i: i, s: s };
      });
      var maxS = 0;
      scores.forEach(function (x) { if (x.s > maxS) maxS = x.s; });
      rows.forEach(function (R) {
        var x = scores[rows.indexOf(R)];
        R.node.querySelector('.rank-fill').style.width = (maxS ? x.s / maxS * 100 : 0) + '%';
        R.node.querySelector('.rank-score').textContent = x.s;
        R.node.classList.toggle('top', x.s === maxS && x.s > 0);
      });
      var best = scores[0];
      scores.forEach(function (x) { if (x.s > best.s) best = x; });
      $('#rankRecom').textContent = 'Recomendación → ' + (best.s > 0 ? PROF[best.i][0] : 'ajusta los criterios');
    }
    el.forEach(function (id) {
      var t = document.getElementById(id);
      if (t) t.addEventListener('input', calc);
    });
    var PRESSET = {
      vel: [[0, 2, 5, 3]], pres: [[2, 5, 1, 2]], frz: [[5, 3, 0, 2]], eco: [[1, 2, 2, 5]]
    };
    $$('#critPresets .seg').forEach(function (s) {
      s.addEventListener('click', function () {
        var v = PRESSET[s.dataset.s][0];
        el.forEach(function (id, i) { document.getElementById(id).value = v[i]; });
        calc();
      });
    });
    calc();
  }

  /* ============================ 09 APLICACIONES ============================ */
  var APPS = {
    cinta: {
      t: 'Cinta transportadora',
      d: 'Clasificación de paquetes sobre banda. Un sensor fotoeléctrico de barrera detecta la caja; el PLC compara con la consigna y ordena el arranque; el motor DC con variador mueve la banda a la velocidad programada.',
      chain: [
        ['Sensor', 'fotoeléctrico de barrera', 'fa-bullseye'],
        ['Controlador', 'PLC · compara y decide', 'fa-code'],
        ['Actuador', 'motor DC + banda', 'fa-conveyor']
      ]
    },
    brazo: {
      t: 'Brazo robótico',
      d: 'Posicionado de piezas. Los encoders y sensores de final de carrera reportan la posición real; el controlador de servos calcula la trayectoria; los servomotores y reductores mecánicos ejecutan el movimiento exacto del lazo cerrado.',
      chain: [
        ['Sensor', 'encoders · finales de carrera', 'fa-camera'],
        ['Controlador', 'controlador de servos', 'fa-code-branch'],
        ['Actuador', 'servomotor + reductor', 'fa-robot']
      ]
    },
    prensa: {
      t: 'Prensa hidráulica',
      d: 'Estampado de metales a decenas de toneladas. El sensor de presión (galgas en el puente de Wheatstone) vigila la fuerza; el PLC gobierna la válvula proporcional; el cilindro hidráulico aplica la carga con un movimiento suave y controlado.',
      chain: [
        ['Sensor', 'presión · galgas / puente', 'fa-chart-line'],
        ['Controlador', 'PLC + válvula proporcional', 'fa-code'],
        ['Actuador', 'cilindro hidráulico', 'fa-arrows-alt-v']
      ]
    },
    puerta: {
      t: 'Puerta automática',
      d: 'Acceso peatonal. Los sensores de presencia (radar/infrarrojo) detectan al usuario en la zona; la unidad de control valida la apertura y la cierra con retardo de seguridad; el motor AC más la solenoide de bloqueo ejecutan y fijan la puerta.',
      chain: [
        ['Sensor', 'presencia · radar / IR', 'fa-satellite-dish'],
        ['Controlador', 'unidad de control', 'fa-microchip'],
        ['Actuador', 'motor AC + solenoide de bloqueo', 'fa-door-open']
      ]
    },
    llenado: {
      t: 'Llenado de envases',
      d: 'Dosificación por altura. Un sensor de nivel capacitivo detecta cuándo el líquido llega a la marca; el temporizador del controlador corta la orden; la válvula solenoide cierra el flujo al instante (VA→VF).',
      chain: [
        ['Sensor', 'nivel capacitivo', 'fa-tint'],
        ['Controlador', 'temporizador · lógica', 'fa-stopwatch'],
        ['Actuador', 'válvula solenoide', 'fa-fill-drip']
      ]
    },
    hvac: {
      t: 'Climatización HVAC',
      d: 'Confort térmico de un edificio. El sensor de temperatura (PT100) mide el aula; el controlador compara contra la consigna (setpoint); la motobomba recircula el agua y el ventilador impulsa el aire hasta equilibrar la temperatura.',
      chain: [
        ['Sensor', 'temperatura · PT100', 'fa-thermometer-half'],
        ['Controlador', 'termostato lógico', 'fa-code'],
        ['Actuador', 'motobomba + ventilador', 'fa-wind']
      ]
    }
  };
  function aplicaciones() {
    var grid = $('#appGrid');
    var modal = $('#modalBack');
    if (!grid || !modal) return;
    function abrir(a) {
      var data = APPS[a];
      if (!data) return;
      $('#modalTitle').textContent = data.t;
      $('#modalDesc').textContent = data.d;
      var chain = $('#modalChain');
      chain.innerHTML = '';
      data.chain.forEach(function (c, i) {
        if (i) {
          var arr = document.createElement('div');
          arr.className = 'scc-arr';
          arr.textContent = '→';
          chain.appendChild(arr);
        }
        var b = document.createElement('div');
        b.className = 'scc-box';
        b.innerHTML = '<i class="fas ' + c[2] + '"></i><b>' + c[0] + '</b><span>' + c[1] + '</span>';
        chain.appendChild(b);
      });
      modal.classList.add('open');
    }
    function cerrar() { modal.classList.remove('open'); }
    $$('#appGrid .app-card').forEach(function (c) {
      c.addEventListener('click', function () { abrir(c.dataset.a); });
    });
    $('#modalClose').addEventListener('click', cerrar);
    modal.addEventListener('click', function (e) { if (e.target === modal) cerrar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
  }

  /* ============================ 10 RETO ============================ */
  var QUIZ = [
    { q: '¿Cuál es la función principal de un actuador?', opts: ['Medir una variable del proceso', 'Convertir la orden del controlador en movimiento o trabajo', 'Almacenar energía del sistema', 'Mostrar datos al operador'], ok: 1 },
    { q: 'Un motor DC alimentado por un PWM con ciclo de trabajo alto…', opts: ['Gira más lento', 'Gira más rápido', 'No gira', 'Consume menos que apagado'], ok: 1 },
    { q: '¿Qué tipo de actuador trabaja con aire comprimido?', opts: ['Eléctrico', 'Neumático · aire', 'Hidráulico', 'Térmico'], ok: 1 },
    { q: 'En un cilindro de doble efecto, el retroceso del vástago se logra…', opts: ['Con un resorte interno', 'Aplicando presión en la cámara B', 'Por gravedad', 'Con un imán permanente'], ok: 1 },
    { q: 'Una válvula solenoide conmuta su émbolo gracias a…', opts: ['Un electroimán', 'Aire comprimido', 'Un engranaje', 'Una leva externa'], ok: 0 },
    { q: 'La motobomba de un circuito hidráulico aporta al sistema…', opts: ['Presión y caudal de aceite', 'Señal eléctrica al PLC', 'Aire a los cilindros', 'Energía térmica de escape'], ok: 0 },
    { q: 'Se elige un motor paso a paso cuando se requiere…', opts: ['Gran potencia continua', 'Posicionamiento angular exacto por pasos', 'Velocidad sin control', 'Máximo silencio de operación'], ok: 1 },
    { q: 'Para estampar chapa metálica a decenas de toneladas, el actuador ideal es…', opts: ['Motor paso a paso', 'Zumbador', 'Cilindro hidráulico', 'Piloto de señal'], ok: 2 }
  ];
  function reto() {
    var stage = $('#quizStage2');
    if (!stage) return;
    var prog = $('#qprog2'), count = $('#qcount2'), text = $('#qtext2'), opts = $('#qopts2'), fb = $('#qfb2');
    var idx = 0, score = 0, bloqueado = false;
    var dots = [];
    for (var i = 0; i < QUIZ.length; i++) {
      var d2 = document.createElement('div');
      d2.className = 'pd';
      prog.appendChild(d2);
      dots.push(d2);
    }
    function fin() {
      stage.innerHTML =
        '<div class="qend"><h3>Puntuación: ' + score + ' / ' + QUIZ.length + '</h3>' +
        '<p>' + (score >= 6 ? 'MÓDULO COMPLETADO · orden liberada' : 'INTERRUPCIÓN DEL SISTEMA · reintenta el módulo') + '</p>' +
        '<button class="btn red" id="qretry2" type="button">Reintentar módulo</button></div>';
      var b = $('#qretry2');
      if (b) b.addEventListener('click', function () {
        score = 0; idx = 0;
        stage.innerHTML = '<div class="qprog" id="qprog2"></div><div class="qcount" id="qcount2"></div><div class="qtext" id="qtext2"></div><div class="qopts" id="qopts2"></div><div class="quiz-fb" id="qfb2"></div>';
        reto();
      });
      if (score >= 6 && window.confetti) {
        confetti({ particleCount: 170, spread: 78, origin: { y: 0.65 }, colors: ['#ff0036', '#ffffff', '#f4f4f4'] });
      }
    }
    function frame() {
      if (idx >= QUIZ.length) { fin(); return; }
      var item = QUIZ[idx];
      count.textContent = 'Pregunta ' + String(idx + 1).padStart(2, '0') + ' / ' + String(QUIZ.length).padStart(2, '0');
      text.textContent = item.q;
      fb.textContent = '';
      opts.innerHTML = '';
      item.opts.forEach(function (o, k) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'qopt';
        b.innerHTML = '<span class="qk">' + 'ABCD'[k] + '</span>' + o;
        opts.appendChild(b);
      });
      $$('.qopt', opts).forEach(function (b, k) {
        b.addEventListener('click', function () {
          if (bloqueado) return;
          bloqueado = true;
          if (k === item.ok) {
            score++;
            b.classList.add('correct');
            fb.textContent = 'RESPUESTA CORRECTA';
            fb.className = 'quiz-fb good';
            dots[idx].classList.add('done');
            setTimeout(avanzar, 700);
          } else {
            b.classList.add('wrong');
            $$('.qopt', opts)[item.ok].classList.add('correct');
            fb.textContent = 'INCORRECTO · respuesta: ' + 'ABCD'[item.ok];
            fb.className = 'quiz-fb';
            dots[idx].classList.add('done');
            setTimeout(avanzar, 1300);
          }
        });
      });
    }
    function avanzar() { idx++; bloqueado = false; frame(); }
    frame();
  }

  /* ============================ 11 GLOSARIO ============================ */
  var TERMS = [
    ['Actuador', 'Dispositivo que convierte la orden del controlador en movimiento, fuerza o trabajo mecánico.', 'fa-cogs'],
    ['PWM', 'Modulación por ancho de pulso: regula la potencia media conmutando la salida. Así se controla un motor DC.', 'fa-wave-square'],
    ['Par motor', 'El momento de giro que entrega el motor (N·m). Fuerza por punto de aplicación: a más par, más carga puede mover.', 'fa-sync-alt'],
    ['Velocidad síncrona', 'La velocidad de giro del campo rotatorio de un motor AC: 120·f/p con f en Hz y p polos.', 'fa-tachometer-alt'],
    ['Paso del motor', 'Ángulo angular que avanza el rotor por cada pulso. Común: 1.8° → 200 pasos por vuelta.', 'fa-list-ul'],
    ['Bobina', 'Arrollamiento conductor que genera un campo magnético al circular corriente. Base del solenoide y del electroimán.', 'fa-magnet'],
    ['Válvula solenoide', 'Electroválvula que corta o deja pasar fluido mediante un émbolo movido por una bobina (VA/VF).', 'fa-fill-drip'],
    ['Cilindro de doble efecto', 'Actuador neumático con aire en ambas cámaras: avanza con A y retrocede con B. Fuerza en los dos sentidos.', 'fa-arrows-alt-h'],
    ['Vástago', 'La barra que sale del cilindro y entrega el movimiento lineal al mecanismo.', 'fa-long-arrow-alt-right'],
    ['Émbolo / pistón', 'El disco interno del cilindro que separa las cámaras y transmite la presión al vástago.', 'fa-circle-notch'],
    ['Distribuidor 5/2', 'Válvula neumática de 5 vías y 2 posiciones que dirige la presión hacia A o B y ventila la opuesta.', 'fa-exchange-alt'],
    ['Presión (bar)', 'Fuerza por unidad de área. En neumática e hidráulica define la capacidad de trabajo (1 bar ≈ 10 N/cm²).', 'fa-gauge-high'],
    ['Caudal', 'Volumen de fluido por unidad de tiempo (l/min). Junto con la presión define la potencia del fluido.', 'fa-water'],
    ['Motobomba', 'Conjunto motor eléctrico + bomba que entrega presión y caudal de aceite al circuito hidráulico.', 'fa-tint'],
    ['Servomotor', 'Motor con encoder y control que cierra el lazo de posición, velocidad y par. Estándar en robótica y CNC.', 'fa-robot'],
    ['Piloto', 'Lámpara indicadora de estado: enciende para señalizar condiciones del proceso (encendido, falla, fin de ciclo).', 'fa-lightbulb'],
    ['Zumbador', 'Actuador acústico on/off. Genera tono con una señal PWM en un altavoz piezoeléctrico o magnético.', 'fa-volume-up']
  ];
  function glosario() {
    var list = $('#glist2');
    if (!list) return;
    var items = TERMS.map(function (t, i) {
      var d = document.createElement('div');
      d.className = 'gitem';
      d.innerHTML = '<b><i class="fas ' + t[2] + '"></i>' + t[0] + '</b><p>' + t[1] + '</p>';
      d.dataset.term = t[0].toLowerCase();
      list.appendChild(d);
      return d;
    });
    var input = $('#gInput2');
    function filtro() {
      var f = input.value.trim().toLowerCase();
      var vis = 0;
      items.forEach(function (d) {
        var hit = !f || d.dataset.term.indexOf(f) !== -1;
        d.style.display = hit ? '' : 'none';
        if (hit) vis++;
      });
      $('#gcount2').textContent = vis + ' de ' + items.length + ' términos';
    }
    input.addEventListener('input', filtro);
    filtro();
  }

  /* ============================ NAV / BOTONES ============================ */
  function navegar() {
    $$('[data-goto]').forEach(function (b) {
      b.addEventListener('click', function () {
        var el = document.querySelector(b.dataset.goto);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ============================ TOUR ============================ */
  function factoryDriver() {
    var root = window.driver;
    if (!root) return null;
    if (typeof root === 'function') return root;
    var cands = [root.js, root.driver, root.js && root.js.driver];
    for (var i = 0; i < cands.length; i++) if (typeof cands[i] === 'function') return cands[i];
    return null;
  }
  function tour() {
    var fac = factoryDriver();
    if (!fac) return;
    var pasos = [];
    function add(sel, t, d) { pasos.push({ element: sel, popover: { title: t, description: d } }); }
    add('#inicio', 'Inicio', 'El bus de actuadores lee la línea en vivo. Aquí mandas mover el mundo físico.');
    add('#concepto', 'Concepto', 'Arma la cadena S→C→A y dispara EJECUTAR; luego reta al lazo cerrado con CONSIGNA.');
    add('#clas', 'Clasificación', 'Filtra por familia de energía y toca cada actuador para inspeccionarlo.');
    add('#elect', 'Motores', 'Cambia entre DC, AC y paso a paso: PWM, fases y pulsos de verdad.');
    add('#neum', 'Neumáticos', 'Avanza y retrocede el cilindro; cambia simple/doble efecto.');
    add('#hidr', 'Hidráulicos', 'Mantén BOMBEAR y mira crecer la presión y la fuerza del cilindro.');
    add('#ond', 'On/off', 'Energiza la solenoide, el piloto y el zumbador: tres salidas, tres sentidos.');
    add('#comp', 'Comparador', 'Compara perfiles de fuerza, velocidad, precisión, silencio y economía.');
    add('#criterio', 'Selección', 'Pondera criterios o usa presets y deja que el asistente recomiende.');
    add('#apli', 'Aplicaciones', 'Abre cada tarjeta y explora el lazo completo SENSOR → CONTROLADOR → ACTUADOR.');
    add('#reto', 'Reto final', 'Ocho preguntas cierran el tema II.');
    add('#glos', 'Glosario', 'Filtra la jerga de actuadores en vivo.');
    try {
      var obj = fac({ steps: pasos, showProgress: true, overlayColor: '#000' });
      if (obj && typeof obj.drive === 'function') obj.drive(0);
      else if (obj && typeof obj.moveTo === 'function') obj.moveTo(0);
    } catch (e) {
      if (window.console && console.log) console.log('tour skip', e && e.message);
    }
  }

  /* ============================ ARRANQUE ============================ */
  function inicio() {
    function safe(nombre, fn) {
      try { fn(); }
      catch (e) { if (window.console && console.log) console.log('x', nombre, e && e.message); }
    }
    safe('cadena', cadena);
    safe('lazo', lazo);
    safe('clasificar', clasificar);
    safe('motores', motores);
    safe('neumatica', neumatica);
    safe('hidraulica', hidraulica);
    safe('dispositivos', dispositivos);
    safe('comparador', comparador);
    safe('criterios', criterios);
    safe('aplicaciones', aplicaciones);
    safe('reto', reto);
    safe('glosario', glosario);
    safe('navegar', navegar);
    safe('linkificar', linkificar);
    safe('pintarGlyph', pintarGlyph);
    safe('feeds', feeds);
    if (!isTourSkipped) setTimeout(tour, 1200);
    safe('btnTour', function () {
      var t1 = $('#btnTour'), t2 = $('#btnTour2');
      if (t1) t1.addEventListener('click', tour);
      if (t2) t2.addEventListener('click', tour);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicio);
  else inicio();
})();