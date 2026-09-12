(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var isTourSkipped = /[?&]notour/.test(location.search);

  /* ============================ ROBOTO · FONDO ============================ */
  function feeds() {
    var feed = $('#feed');
    if (!feed || feed._on) return;
    feed._on = true;
    var lineas = [
      ['> init bus_sensors …… OK', 'ok'],
      ['> puerto A2 [analog] online', 'ok'],
      ['> termistor NTC · listo', 'ok'],
      ['> opto LDR · lux = 82', 'warn'],
      ['> presión · 0.00 kPa · calibrado', 'ok'],
      ['> estado: DETECTANDO', 'err'],
      ['> sistema LISTO · t+0.00s', 'ok'],
      ['> esperando medición …', 'dim']
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
      if (ci < lineas[li][0].length) { setTimeout(tipear, 16 + Math.random() * 26); }
      else {
        setTimeout(function () {
          li = (li + 1) % lineas.length;
          ci = 0;
          tipear();
        }, 620);
      }
    }
    setTimeout(tipear, 260);
  }

  /* ============================ GLYPH HERO (5x7) ============================ */
  var GLYPH = {
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001']
  };
  function pintarGlyph() {
    var cv = $('#heroGlyph');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var cell = 7, step = 8;
    var col0 = Math.floor((performance.now() / 60) % 17);
    ctx.clearRect(0, 0, cv.width, cv.height);
    var xo = 8;
    var letras = ['S', 'N', 'R'];
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

  /* ============================ CICLO DE MEDICIÓN ============================ */
  function ciclo() {
    var chain = $('#chain');
    var btn = $('#btnMeasure');
    var box = $('#measureBox');
    var val = $('#measureVal');
    var txt = $('#measureTxt');
    if (!chain) return;
    var switches = $$('.cswitch', chain);
    var arrows = $$('.chain-arrow');
    var lista = [
      ['28 °C', 'Señal del NTC: variación de resistencia → 0.29 V en el divisor. Lectura ADC: 90/1023.'],
      ['812 lux', 'El LDR reduce su resistencia con la luz. Salió 1.88 V por el divisor de voltaje.'],
      ['96.4 kPa', 'Diafragma deformado 2.1 %. Puente de Wheatstone con salida diferencial de 12 mV.'],
      ['34 cm', 'Pulso ultrasónico: 1981 µs de tiempo de vuelo. Blanco detectado a 34 cm.']
    ];
    var n = 0;
    function refrescar() {
      var on = switches.every(function (s) { return s.classList.contains('on'); });
      btn.disabled = !on;
      arrows.forEach(function (a, i) { a.classList.toggle('lit', switches[i] && switches[i].classList.contains('on')); });
      txt.textContent = on
        ? 'Cadena preparada: la magnitud se convirtió y acondicionó. Pulsa MEDIR para ejecutar.'
        : 'La cadena de medición está incompleta. Activa los 3 interruptores para habilitar el sistema.';
      val.textContent = on ? 'CARGANDO' : '--';
      box.classList.remove('lit');
    }
    switches.forEach(function (s) {
      s.addEventListener('click', function () {
        s.classList.toggle('on');
        s.setAttribute('data-on', String(s.classList.contains('on')));
        refrescar();
      });
    });
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var r = lista[n % lista.length];
      n++;
      val.textContent = r[0];
      txt.textContent = r[1];
      box.classList.remove('lit');
      void box.offsetWidth;
      box.classList.add('lit');
    });
    refrescar();
  }

  /* ============================ CLASIFICACIÓN ============================ */
  function clasificar() {
    var grid = $('#clsGrid');
    if (!grid) return;
    var tiles = $$('.tile', grid);
    var segs = $$('#clasSegs .seg');
    var nCount = $('#clasCount');
    var nDet = $('#clasDetail');
    function filtro() {
      var f = (document.querySelector('#clasSegs .seg.active') || {}).dataset ? document.querySelector('#clasSegs .seg.active').dataset.f : 'all';
      var vis = 0;
      tiles.forEach(function (t) {
        var show = (f === 'all') || t.dataset.c.indexOf(f) !== -1;
        t.style.display = show ? '' : 'none';
        if (show) vis++;
        if (!show && t.classList.contains('on')) { t.classList.remove('on'); nDet.textContent = 'Selecciona un sensor para inspeccionarlo.'; }
      });
      nCount.textContent = tiles.length + ' sensores / ' + vis + ' visibles';
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

  /* ============================ ESCÁNER DE COMPONENTES ============================ */
  var COMP_INFO = {
    cover: ['Fuente (LED)', 'Emite el haz luminoso. Se prefiere infrarrojo por eficiencia: genera luz útil con poco calor disipado.'],
    housing: ['Lentes', 'Dirigen y concentran el haz para ampliar la distancia de detección del conjunto.'],
    element: ['Receptor', 'Fotodiodo o fototransistor acoplado espectralmente al emisor: convierte la luz en corriente eléctrica.'],
    pins: ['Circuito de salida', 'Digital (relé, NPN/PNP, TRIAC o MOSFET), analógica o serial para el bus de datos.']
  };
  function escanear() {
    var svg = $('#compSvg');
    if (!svg) return;
    var line = $('#scanLine');
    var rng = $('#scanRange');
    var rot = $('#scanAuto');
    var lbl = $('#compLabel');
    var parts = $$('.part', svg);
    var raf = null, dirY = 1, auto = false, y = 18;
    function parteDe(yy) {
      if (yy >= 64 && yy <= 110) return 'element';
      if (yy <= 40) return 'cover';
      if (yy >= 132) return 'pins';
      return 'housing';
    }
    function aplicar(yy) {
      y = yy;
      line.setAttribute('y1', yy);
      line.setAttribute('y2', yy);
      var p = parteDe(yy);
      parts.forEach(function (g) { g.classList.toggle('scan', g.dataset.part === p); });
      var info = COMP_INFO[p];
      lbl.innerHTML = '<b>' + info[0] + '</b><span>' + info[1] + '</span>';
      rng.value = Math.round(((yy - 16) / 140) * 100);
    }
    function loop() {
      y += 1.3 * dirY;
      if (y > 156) { y = 156; dirY = -1; }
      if (y < 16) { y = 16; dirY = 1; }
      aplicar(y);
      raf = requestAnimationFrame(loop);
    }
    rng.addEventListener('input', function () {
      if (auto) { auto = false; rot.textContent = 'Barrido automático: OFF'; cancelAnimationFrame(raf); }
      aplicar(16 + (rng.value / 100) * 140);
    });
    rot.addEventListener('click', function () {
      auto = !auto;
      rot.textContent = 'Barrido automático: ' + (auto ? 'ON' : 'OFF');
      if (auto) { cancelAnimationFrame(raf); dirY = 1; y = 16; raf = requestAnimationFrame(loop); }
      else cancelAnimationFrame(raf);
    });
    aplicar(18);
  }

  /* ============================ LINTERNA LDR ============================ */
  function linterna() {
    var track = $('#floTrack');
    if (!track) return;
    var cone = $('#fcone');
    var ldr = $('#ldrbox');
    var sp = $('#spark');
    var sctx = sp ? sp.getContext('2d') : null;
    var ptos = {};
    function pintar(x) {
      var rect = track.getBoundingClientRect();
      if (!rect.width) return;
      var rel = clamp((x - rect.left) / rect.width, 0, 1);
      cone.style.left = (rel * rect.width) + 'px';
      var lux = Math.round(Math.pow(rel, 1.6) * 900);
      var Rk = Math.pow(10, 3 - 3 * rel);
      var V = 3.3 * Rk / (Rk + 100);
      $('#floLux').textContent = lux;
      $('#floR').textContent = Rk >= 1000 ? (Rk / 1000).toFixed(2) + ' MΩ' : Rk.toFixed(0) + ' kΩ';
      $('#floV').textContent = V.toFixed(2);
      $('#floLum').textContent = Math.round(rel * 100) + '%';
      ldr.classList.toggle('on', rel > 0.55);
      ptos[Math.round(rel * 60)] = Rk;
      trazar();
    }
    function trazar() {
      if (!sctx) return;
      sctx.clearRect(0, 0, sp.width, sp.height);
      sctx.fillStyle = '#050505';
      sctx.fillRect(0, 0, sp.width, sp.height);
      sctx.strokeStyle = '#202020';
      sctx.lineWidth = 1;
      sctx.setLineDash([3, 5]);
      sctx.beginPath(); sctx.moveTo(0, sp.height / 2); sctx.lineTo(sp.width, sp.height / 2); sctx.stroke();
      sctx.setLineDash([]);
      var ks = Object.keys(ptos);
      if (ks.length > 1) {
        sctx.beginPath();
        ks.forEach(function (k, i) {
          var rr = k / 60;
          var x = rr * sp.width;
          var yL = Math.max(6, sp.height - ((3 - Math.log10(ptos[k])) / 3) * (sp.height - 12));
          if (i === 0) sctx.moveTo(x, yL); else sctx.lineTo(x, yL);
        });
        sctx.strokeStyle = '#ff0036';
        sctx.lineWidth = 1.6;
        sctx.stroke();
      }
      sctx.fillStyle = '#00d493';
      sctx.font = '10px Space Mono, monospace';
      sctx.fillText('R vs luz (log)', 10, 14);
    }
    function mover(e) { pintar(e.clientX); }
    track.addEventListener('mousemove', mover);
    track.addEventListener('click', mover);
    pintar(track.getBoundingClientRect().left + 6);
  }

  /* ============================ MODOS DE DETECCIÓN ============================ */
  var MODE_PRINC = {
    barrera: 'Transmisión directa: emisor y receptor quedan enfrentados. Mayor alcance del grupo (hasta ~270 m), pero cableado más complejo.',
    retro: 'Reflexivo: emisor y receptor juntos apuntando a una superficie reflectora. Más práctico de instalar; alcance menor.',
    difuso: 'Difuso o de proximidad: el propio objeto actúa como reflector del haz. Alcance corto; ideal cuando no hay acceso a ambos lados.'
  };
  function modos() {
    var tabs = $$('#modeTabs .seg');
    var scene = $('#modesScene');
    if (!scene) return;
    var beam = $('#modeBeam'), obj = $('#modeObj'), rec = $('#modeRec'), ref = $('#modeRef');
    var status = $('#modeStatus'), dist = $('#modeDist'), distVal = $('#modeDistVal'), tog = $('#modeTog'), princ = $('#modePrinc');
    var mode = 'barrera', present = false;
    function pintar() {
      var W = scene.clientWidth || 600;
      rec.style.display = (mode === 'barrera' || mode === 'retro') ? '' : 'none';
      ref.style.display = (mode === 'retro') ? '' : 'none';
      beam.classList.toggle('dashed', mode === 'difuso');
      var objLeft = 60 + (dist.value / 200) * (W * 0.56);
      obj.style.display = present ? '' : 'none';
      obj.style.left = objLeft + 'px';
      obj.classList.toggle('present', present);
      if (mode === 'difuso') {
        beam.style.left = '74px';
        beam.style.right = (W - objLeft - 6) + 'px';
      } else {
        beam.style.left = '74px';
        beam.style.right = '74px';
      }
      var on = false, txt = '';
      if (mode === 'difuso') {
        on = present;
        txt = present ? 'REFLECCIÓN DETECTADA' : 'SIN OBJETO';
      } else {
        on = !present;
        txt = present ? 'HAZ OBSTRUIDO · OBJETO' : 'CAMINO LIBRE';
      }
      beam.style.opacity = (present && mode !== 'difuso') ? '0.12' : '1';
      status.className = 'status' + (on ? ' on' : '');
      status.innerHTML = '<span class="dot"></span>' + txt;
      distVal.textContent = dist.value + ' cm';
      princ.textContent = MODE_PRINC[mode] || '';
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        mode = t.dataset.m;
        pintar();
      });
    });
    dist.addEventListener('input', pintar);
    tog.addEventListener('click', function () {
      present = !present;
      tog.textContent = present ? 'Retirar objeto' : 'Insertar objeto';
      pintar();
    });
    window.addEventListener('resize', pintar);
    pintar();
  }

  /* ============================ PROXIMIDAD ============================ */
  var CAPS = { '2': 'Madera · εr ≈ 2', '4': 'Plástico · εr ≈ 4', '80': 'Agua · εr ≈ 80', '1': 'Metal · εr = ∞' };
  function proximidad() {
    var tabs = $$('#proxTabs .seg');
    var stage = $('#proxStage');
    if (!stage) return;
    var phead = $('#phead'), pobj = $('#pobj'), fprobe = $('#fprobe'), echo = $('#echo');
    var st = $('#prxStatus'), sf = $('#prxFamily'), sp = $('#prxPrinc'), ss = $('#prxSensado'), sr = $('#prxRead');
    var ctl = { ind: $('#ctl-ind'), cap: $('#ctl-cap'), us: $('#ctl-us'), mag: $('#ctl-mag'), ir: $('#ctl-ir') };
    var objTog = $('#proxObjTog'), magTog = $('#magTog');
    var ptab = 'ind', objPres = false, magNear = false, mat = '2', it = 40, cuenta = 0;
    function pintar() {
      var W = stage.clientWidth || 600;
      var fam = { ind: ['Inductivo', 'objetos metálicos sin contacto', 'fa-signal'], cap: ['Capacitivo', 'aislantes: papel, plástico, madera', 'fa-hands'], us: ['Ultrasónico', 'eco · tiempo de vuelo (parking)', 'fa-wave-square'], mag: ['Magnético reed', 'interruptor por campo (contactos)', 'fa-magnet'], ir: ['Infrarrojo térmico', 'radiación de materiales calientes', 'fa-fire'] }[ptab];
      sf.textContent = fam[0];
      sp.textContent = fam[1];
      phead.innerHTML = '<i class="fas ' + fam[2] + '"></i>';
      Object.keys(ctl).forEach(function (k) { ctl[k].style.display = (k === ptab) ? '' : 'none'; });
      objTog.style.display = ptab === 'mag' ? 'none' : '';
      var on = false, sens = '—', read = '—', showP = false;
      if (ptab === 'ind') {
        var pow = +$('#indPow').value;
        fprobe.style.display = pow > 8 ? '' : 'none';
        var sz = 26 + (pow / 100) * 84;
        fprobe.style.width = sz + 'px';
        fprobe.style.height = sz + 'px';
        fprobe.style.opacity = 0.25 + (pow / 100) * 0.6;
        echo.style.width = '0px';
        sens = (objPres && pow > 12) ? 'DETECTA METAL' : 'sin metal';
        on = objPres && pow > 12;
        read = pow + '% campo · f osc ' + (620 - pow * 3.2).toFixed(0) + ' kHz';
        showP = objPres;
        pobj.style.left = (W - 150) + 'px';
      } else if (ptab === 'cap') {
        fprobe.style.display = 'none';
        echo.style.width = '0px';
        sens = objPres ? 'DETECTA ' + CAPS[mat] : 'sin objetivo';
        on = objPres;
        read = 'material: ' + (mat === '1' ? 'metal (corriente de Foucault)' : 'dieléctrico εr=' + mat);
        showP = objPres;
        pobj.style.left = (W - 150) + 'px';
        pobj.innerHTML = '<i class="fas ' + (mat === '1' ? 'fa-cube' : 'fa-box') + '"></i>';
      } else if (ptab === 'us') {
        fprobe.style.display = 'none';
        var d = +$('#usDist').value;
        pobj.style.left = (80 + (d / 150) * (W - 210)) + 'px';
        sens = 'objetivo a ' + d + ' cm';
        on = true;
        showP = true;
        read = 'TOF = ' + (d * 2 / 343.1 * 1000).toFixed(0) + ' µs';
      } else if (ptab === 'mag') {
        fprobe.style.display = 'none';
        echo.style.width = '0px';
        sens = magNear ? 'CIRCUITO CERRADO' : 'contactos abiertos';
        on = magNear;
        read = magNear ? 'SALIDA ON · ' + (++cuenta) + ' conmutaciones' : 'SALIDA OFF';
        showP = magNear;
        pobj.style.left = (W - 170) + 'px';
        pobj.innerHTML = '<i class="fas fa-magnet"></i>';
      } else {
        fprobe.style.display = 'none';
        echo.style.width = '0px';
        var flux = Math.pow(it / 100, 4);
        sens = it > 60 ? 'DETECTA RADIACIÓN TÉRMICA' : 'fondo frío · sin radiación';
        on = it > 60;
        read = 'lectura ≈ ' + flux.toExponential(1) + ' u.a. · ∝ T⁴';
        showP = true;
        pobj.style.left = (W - 140) + 'px';
        pobj.innerHTML = '<i class="fas fa-fire"></i>';
        $('#irTmpV').textContent = it + ' °C';
      }
      pobj.style.display = showP ? '' : 'none';
      pobj.classList.toggle('on', on);
      ss.textContent = sens;
      sr.textContent = read;
      st.className = 'status' + (on ? ' on' : '');
      st.innerHTML = '<span class="dot"></span>' + (on ? 'SENSANDO' : 'STANDBY');
      objTog.textContent = 'Objeto: ' + (objPres ? 'presente' : 'ausente');
      if (ptab === 'us') echo.style.width = (80 + (d / 150) * (W * 0.5)) + 'px';
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        ptab = t.dataset.m;
        if (ptab === 'us') { objPres = true; }
        if (ptab === 'mag') { pobj.innerHTML = '<i class="fas fa-magnet"></i>'; }
        pintar();
      });
    });
    $('#indPow').addEventListener('input', pintar);
    $('#usDist').addEventListener('input', pintar);
    $('#usPing').addEventListener('click', function () {
      var old = echo.style.width;
      echo.style.transition = 'width .06s';
      echo.style.width = '4px';
      void echo.offsetWidth;
      echo.style.width = old;
      setTimeout(function () { echo.style.transition = 'width .3s'; }, 90);
    });
    $('#irTemp').addEventListener('input', function () { it = +this.value; pintar(); });
    $$('#capMat .seg').forEach(function (s) {
      s.addEventListener('click', function () {
        $$('#capMat .seg').forEach(function (x) { x.classList.remove('active'); });
        s.classList.add('active');
        mat = s.dataset.e;
        pintar();
      });
    });
    objTog.addEventListener('click', function () { objPres = !objPres; pintar(); });
    magTog.addEventListener('click', function () {
      magNear = !magNear;
      magTog.textContent = magNear ? 'Retirar imán' : 'Acercar imán';
      pintar();
    });
    window.addEventListener('resize', pintar);
    pintar();
  }

  /* ============================ TEMPERATURA ============================ */
  var DIGS = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['11110', '00001', '00001', '00110', '01000', '10000', '11111'],
    '3': ['01110', '10001', '00001', '00110', '00001', '10001', '01110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
    'C': ['01110', '10001', '10000', '10000', '10000', '10001', '01110']
  };
  function temperatura() {
    var cv = $('#templed');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var down = $('#tempDown'), up = $('#tempUp'), val = $('#tempVal'), fill = $('#tempFill');
    var tabs = $$('#tempTabs .seg');
    var ttab = 'ntc', temp = 25;
    function digito(ctx, x, ch, cell, color) {
      if (!DIGS[ch]) return;
      var bits = DIGS[ch];
      for (var r = 0; r < 7; r++) {
        for (var c = 0; c < 5; c++) {
          if (bits[r][c] === '1') {
            ctx.fillStyle = color;
            ctx.fillRect(x + c * (cell + 1), 6 + r * (cell + 1), cell, cell);
          }
        }
      }
    }
    function dibujar() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      var cell = 8;
      var str = String(Math.round(Math.abs(temp)));
      var s = (temp < 0 ? '-' : ' ') + str;
      var chars = s.slice(-3).split('');
      var x = 10;
      chars.forEach(function (ch) { digito(ctx, x, ch, cell, '#f0f0f0'); x += 6 * (cell + 1); });
      ctx.fillStyle = '#ff0036';
      ctx.fillRect(x + 2, 6, 6, 6);
      digito(ctx, x + 2, 'C', 5, '#ff0036');
      fill.style.width = clamp((temp + 20) / 140 * 100, 0, 100) + '%';
      refrescar();
    }
    function refrescar() {
      var T = temp;
      var txt1, v1, txt2, v2, txt3, v3, rango, desc;
      if (ttab === 'ntc') {
        var R = 10000 * Math.exp(3950 * (1 / (T + 273.15) - 1 / 298.15));
        txt1 = 'resistencia'; v1 = (R / 1000).toFixed(1) + ' kΩ';
        txt2 = 'v divisor'; v2 = (3.3 * R / (R + 100000)).toFixed(3) + ' V';
        txt3 = 'coeficiente B'; v3 = '3950 K';
        rango = '−55 a 125 °C';
        desc = 'El NTC baja su resistencia cuando sube la temperatura. Barato pero no lineal, compensa su caída exponencial con un divisor de voltaje que entrega una señal útil para el ADC.';
      } else if (ttab === 'ptc') {
        var rp = 10000 * (1 + 0.02 * (T - 25));
        txt1 = 'resistencia'; v1 = (rp / 1000).toFixed(1) + ' kΩ';
        txt2 = 'v divisor'; v2 = (3.3 * rp / (rp + 100000)).toFixed(3) + ' V';
        txt3 = 'TCR'; v3 = '≈ +2 %/°C';
        rango = '0 a 120 °C';
        desc = 'El PTC hace lo opuesto al NTC: su resistencia crece (+TCR) hasta el punto de conmutación y luego salta con la temperatura. Es el termistor elegido en protección: Corte el salto, corte el peligro.';
      } else if (ttab === 'rtd') {
        var rr = 100 * (1 + 0.00385 * T);
        txt1 = 'resistencia Pt100'; v1 = rr.toFixed(1) + ' Ω';
        txt2 = 'v puente Wheatstone'; v2 = (3.3 * rr / (rr + 100) - 1.65).toFixed(3) + ' V';
        txt3 = 'linealidad'; v3 = '≈ 3.85 Ω/°C';
        rango = '−200 a 850 °C';
        desc = 'Un RTD explota que la resistencia del metal —platino, cobre, níquel o molibdeno— sube con la temperatura. El de platino (Pt100) es el más usado por su linealidad y estabilidad.';
      } else if (ttab === 'tc') {
        var mV = (0.041 * T).toFixed(2);
        txt1 = 'tensión Seebeck'; v1 = mV + ' mV';
        txt2 = 'unión'; v2 = 'K · NiCr/NiAl';
        txt3 = 'sensibilidad'; v3 = '≈ 41 µV/°C';
        rango = '−200 a 1200 °C';
        desc = 'El termopar genera su propia tensión por el efecto Seebeck entre dos metales distintos: económico y de amplio rango (±1200 °C), aunque menos preciso que un RTD y necesita compensación de unión fría.';
      } else {
        txt1 = 'salida lineal'; v1 = (T * 10) + ' mV';
        txt2 = 'ADC 10 bits'; v2 = String(Math.round(T * 10 * 1023 / 3300));
        txt3 = 'factor'; v3 = '10 mV/°C';
        rango = '0 a 150 °C';
        desc = 'El LM35 produce exactamente 10 mV por cada grado centígrado, sin acondicionamiento extra. El valor se convierte directo en el ADC del microcontrolador.';
      }
      $('#tr1k').textContent = txt1; $('#tr1v').textContent = v1;
      $('#tr2k').textContent = txt2; $('#tr2v').textContent = v2;
      $('#tr3k').textContent = txt3; $('#tr3v').textContent = v3;
      $('#trRange').textContent = rango;
      $('#tempTxt').textContent = desc;
      val.textContent = Math.round(temp);
    }
    down.addEventListener('click', function () { temp = clamp(temp - 1, -20, 120); dibujar(); });
    up.addEventListener('click', function () { temp = clamp(temp + 1, -20, 120); dibujar(); });
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        ttab = t.dataset.t;
        refrescar();
      });
    });
    dibujar();
  }

  /* ============================ PRESIÓN ============================ */
  function presion() {
    var btn = $('#inflate'), vent = $('#vent');
    if (!btn) return;
    var pressure = 0, pumpT = null, ventT = null, valveFlow = null;
    var meter = $('#pMeter'), diaflex = $('#diaflex'), core = $('#diacore'), flag = $('#valveFlag');
    var ptabs = $$('#pressTabs .seg'), ptype = 'abs';
    var segs = 10, list = [];
    for (var i = 0; i < segs; i++) { var d = document.createElement('div'); d.className = 'sg'; meter.appendChild(d); list.push(d); }
    function pintar() {
      var ref = ptype === 'abs' ? ' ' : ' rel/dif';
      $('#pressVal').textContent = pressure.toFixed(0) + ' kPa' + ref;
      $('#pressDef').textContent = (pressure / 600 * 100).toFixed(1) + '%';
      var f = pressure / 600;
      diaflex.style.transform = 'translateY(' + (f * 34) + '%)';
      core.style.transform = 'scaleX(' + (1 + f * 1.5) + ')';
      var on = Math.round(f * segs);
      list.forEach(function (sg, k) { sg.classList.toggle('on', k < on); });
      flag.style.display = (pressure >= 500) ? '' : 'none';
      var princ = $('#pressPrinc');
      if (princ) princ.textContent = ptype === 'abs'
        ? 'Absoluta: mide la presión total respecto del vacío (incluye la atmósfera). El elemento elástico se deforma y el transductor la convierte en señal eléctrica.'
        : 'Relativa: lee la diferencia con la atmosférica (manómetro); diferencial: entre dos puntos. El elemento elástico se deforma y el transductor la convierte en señal eléctrica.';
    }
    ptabs.forEach(function (t) {
      t.addEventListener('click', function () {
        ptabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        ptype = t.dataset.pt;
        pintar();
      });
    });
    function abrirValvula() {
      if (valveFlow) return;
      valveFlow = setInterval(function () {
        pressure = Math.max(0, pressure - 9);
        pintar();
        if (pressure <= 0) { clearInterval(valveFlow); valveFlow = null; }
      }, 28);
    }
    function onDown(e) {
      e.preventDefault();
      if (pumpT || valveFlow) return;
      pumpT = setInterval(function () {
        if (pressure >= 560) { clearInterval(pumpT); pumpT = null; abrirValvula(); return; }
        pressure += 5;
        pintar();
      }, 26);
    }
    function onUp() { if (pumpT) { clearInterval(pumpT); pumpT = null; } }
    ['mousedown', 'touchstart'].forEach(function (ev) { btn.addEventListener(ev, onDown); });
    ['mouseup', 'mouseleave', 'touchend'].forEach(function (ev) { btn.addEventListener(ev, onUp); });
    vent.addEventListener('click', function () {
      onUp();
      if (valveFlow) { clearInterval(valveFlow); valveFlow = null; }
      ventT = setInterval(function () {
        pressure = Math.max(0, pressure - 14);
        pintar();
        if (pressure <= 0) { clearInterval(ventT); ventT = null; }
      }, 26);
    });
    pintar();
  }

  /* ============================ RETO ============================ */
  var QUIZ = [
    { q: '¿Cuál es la función principal de un sensor en un sistema programable?', opts: ['Mostrar datos en una pantalla', 'Guardar energía para el circuito', 'Transformar una magnitud física en una señal eléctrica', 'Conectar dos cables del bus'], ok: 2 },
    { q: 'Un termistor NTC, al calentarse, hace que su resistencia…', opts: ['Aumente', 'No cambie', 'Se vuelva infinita', 'Disminuya'], ok: 3 },
    { q: '¿Qué diferencia a un sensor activo de uno pasivo?', opts: ['El activo es más grande', 'El activo genera su propia señal; el pasivo modifica una señal externa', 'El pasivo nunca se daña', 'El activo solo mide temperatura'], ok: 1 },
    { q: '¿Para qué sirve el divisor de voltaje en un circuito con LDR?', opts: ['Convertir el cambio de resistencia en un voltaje medible por el ADC', 'Elevar la corriente de salida', 'Proteger de cortocircuitos', 'Filtrar el ruido de la red'], ok: 0 },
    { q: 'En un sensor fotoeléctrico de barrera, la salida se interrumpe cuando…', opts: ['El emisor se enfría', 'El receptor recibe luz continua', 'El objeto corta el haz entre emisor y receptor', 'Sube la temperatura ambiente'], ok: 2 },
    { q: '¿Qué magnitud calcula un sensor ultrasónico?', opts: ['Campo magnético de la pieza', 'Distancia a partir del tiempo de vuelo del eco', 'Luminosidad ambiente', 'Concentración de gases'], ok: 1 },
    { q: 'La salida del LM35 es…', opts: ['1 V por cada grado', 'Una frecuencia variable', 'Una señal digital SPI', '10 mV por cada grado centígrado'], ok: 3 },
    { q: 'En un sensor de presión de galgas, la deformación del diafragma cambia…', opts: ['La tensión de alimentación', 'El tamaño del orificio', 'La resistencia del puente de Wheatstone', 'La constante dieléctrica'], ok: 2 }
  ];
  function reto() {
    var stage = $('#quizStage');
    if (!stage) return;
    var prog = $('#qprog'), count = $('#qcount'), text = $('#qtext'), opts = $('#qopts'), fb = $('#qfb');
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
        '<p>' + (score >= 6 ? 'MÓDULO COMPLETADO · señal liberada' : 'INTERRUPCIÓN DEL SISTEMA · reintenta el módulo') + '</p>' +
        '<button class="btn red" id="qretry" type="button">Reintentar módulo</button></div>';
      var b = $('#qretry');
      if (b) b.addEventListener('click', function () {
        score = 0; idx = 0;
        stage.innerHTML = '<div class="qprog" id="qprog"><div class="qcount" id="qcount"></div><div class="qtext" id="qtext"></div><div class="qopts" id="qopts"></div><div class="quiz-fb" id="qfb"></div></div>';
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
      var botones = $$('.qopt', opts);
      botones.forEach(function (b, k) {
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
            botones[item.ok].classList.add('correct');
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

  /* ============================ GLOSARIO ============================ */
  var TERMS = [
    ['Lux', 'Unidad de iluminancia: lúmenes por metro cuadrado. Describe cuánta luz llega al fotosensor.', 'fa-sun'],
    ['LDR', 'Fotorresistor: su resistencia cae cuando recibe luz. Elemento pasivo y analógico.', 'fa-moon'],
    ['NTC', 'Termistor de coeficiente negativo: su resistencia disminuye al aumentar la temperatura.', 'fa-thermometer-quarter'],
    ['Termopar', 'Unión de dos metales distintos que genera tensión (efecto Seebeck) proporcional a la temperatura.', 'fa-temperature-high'],
    ['ADC', 'Convertidor analógico-digital: traduce voltajes continuos a números discretos que lee el micro.', 'fa-microchip'],
    ['Tiempo de vuelo', 'Tiempo que tarda el pulso (sonido o luz) en ir y volver; sirve para calcular distancia.', 'fa-wave-square'],
    ['Puente de Wheatstone', 'Red de 4 resistencias que convierte pequeños cambios de resistencia en un voltaje diferencial.', 'fa-sliders-h'],
    ['Medio reflector', 'Superficie que devuelve el haz del sensor retro-reflexivo hacia el receptor.', 'fa-ghost'],
    ['Alcance / histéresis', 'Distancia nominal de detección y la diferencia de respuestas entre acercar y alejar el objetivo.', 'fa-ruler-combined'],
    ['IP "Nothing"', 'Nada de distracciones: el estilo reduce la interfaz a color, señal y datos — como un sensor ideal.', 'fa-eye'],
    ['Histeresis', 'Diferencia entre el punto de encendido y de apagado que evita conmutaciones por ruido.', 'fa-compress-arrows-alt'],
    ['PTC', 'Termistor de coeficiente positivo: su resistencia aumenta con la temperatura hasta el punto de conmutación.', 'fa-thermometer-quarter'],
    ['RTD', 'Detector de temperatura por resistencia: la del platino (Pt100) sube casi lineal con los grados.', 'fa-chart-line'],
    ['Barrera óptica', 'Emisor y receptor enfrentados: el haz queda cortado mientras el objeto pasa entre ambos.', 'fa-bullseye'],
    ['Infrarrojo térmico', 'Mide la radiación que emiten los cuerpos calientes (∝ T⁴) sin contacto directo.', 'fa-fire']
  ];
  function glosario() {
    var list = $('#glist');
    if (!list) return;
    var items = TERMS.map(function (t, i) {
      var d = document.createElement('div');
      d.className = 'gitem';
      d.innerHTML = '<b><i class="fas ' + t[2] + '"></i>' + t[0] + '</b><p>' + t[1] + '</p>';
      d.dataset.term = t[0].toLowerCase();
      list.appendChild(d);
      return d;
    });
    var input = $('#gInput');
    function filtro() {
      var f = input.value.trim().toLowerCase();
      var vis = 0;
      items.forEach(function (d) {
        var hit = !f || d.dataset.term.indexOf(f) !== -1;
        d.style.display = hit ? '' : 'none';
        if (hit) vis++;
      });
      $('#gcount').textContent = vis + ' de ' + items.length + ' términos';
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
    var cands = [];
    if (root.js) cands.push(root.js);
    if (root.driver) cands.push(root.driver);
    if (root.js && root.js.driver) cands.push(root.js.driver);
    for (var i = 0; i < cands.length; i++) if (typeof cands[i] === 'function') return cands[i];
    return null;
  }
  function tour() {
    var fac = factoryDriver();
    if (!fac) return;
    var pasos = [];
    function add(sel, t, d) {
      pasos.push({ element: sel, popover: { title: t, description: d } });
    }
    add('#inicio', 'Inicio', 'El bus del sistema lee sensores en vivo. Los números grandes son demos reales.');
    add('#intro', 'Concepto', 'Arma la cadena de la medición activando los 3 interruptores y dispara MEDIR.');
    add('#clas', 'Clasificación', 'Filtra la matriz por familia y toca cualquier sensor para inspeccionarlo.');
    add('#comp', 'Anatomía', 'El escáner recorre el sensor: mueve la perilla o activa el barrido automático.');
    add('#opticos', 'LDR · linterna', 'Dos vistas: anatomía del sensor y la linterna con su curva R-luz.');
    add('#modos', 'Modos de detección', 'Barrera, retro y difuso: inserta el objeto y mira salir el sistema.');
    add('#prox', 'Proximidad', 'Cuatro sensores, cuatro interacciones: campo, material, eco y reed.');
    add('#temp', 'Temperatura', 'Regula los grados con los botones y cambia entre NTC, termopar y LM35.');
    add('#pres', 'Presión', 'Mantén INFLAR: el diafragma se deforma y la válvula responde.');
    add('#reto', 'Reto final', '8 preguntas cerrarán el módulo. Responde sin trampas.');
    add('#glos', 'Glosario', 'Filtra en vivo cualquier término que no te quede claro.');
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
      catch (e) {
        if (window.console && console.log) console.log('x', nombre, e && e.message);
      }
    }
    safe('ciclo', ciclo);
    safe('clasificar', clasificar);
    safe('escanear', escanear);
    safe('linterna', linterna);
    safe('modos', modos);
    safe('proximidad', proximidad);
    safe('temperatura', temperatura);
    safe('presion', presion);
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