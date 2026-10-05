(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var isTourSkipped = /[?&]notour/.test(location.search);
  var RED = '#ff0036', DIM = '#4c4c4c', TXT = '#f4f4f4', MUT = '#828282', OK = '#23ffa8', AMB = '#ffb300';

  /* ==========================================================
     CONSOLA · HERO
     ========================================================== */
  function feeds() {
    var feed = $('#feed3');
    if (!feed || feed._on) return;
    feed._on = true;
    var lineas = [
      ['> reset vector @ 0x0000 …… OK', 'ok'],
      ['> reloj 20 MHz · prescaler x1', 'ok'],
      ['> GPIO 24 bits configurados', 'ok'],
      ['> ADC 10 bits · referencia 5 V', 'ok'],
      ['> TMR0 PWM en PA0 · ciclo 50 %', 'warn'],
      ['> UART a 9600 baudios en PB1', 'ok'],
      ['> TENSION: timer1 sin prescaler', 'err'],
      ['> lazo SENSOR→µC→ACTUADOR armed', 'ok'],
      ['> esperando consigna …', 'dim']
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
      else setTimeout(function () { li = (li + 1) % lineas.length; ci = 0; tipear(); }, 640);
    }
    setTimeout(tipear, 260);
  }

  /* ==========================================================
     GLYPH HERO (M C U)
     ========================================================== */
  var GLYPH = {
    M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110']
  };
  function pintarGlyph() {
    var cv = $('#heroGlyph3');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var cell = 7, step = 8;
    var col0 = Math.floor((performance.now() / 60) % 17);
    ctx.clearRect(0, 0, cv.width, cv.height);
    var xo = 8, letras = ['M', 'C', 'U'];
    for (var li = 0; li < letras.length; li++) {
      var bits = GLYPH[letras[li]];
      for (var r = 0; r < 7; r++) {
        for (var c = 0; c < 5; c++) {
          if (bits[r][c] !== '1') continue;
          var gcx = xo + li * 6 * step + c * step;
          var gcy = 8 + r * step;
          var ilu = (li * 6 + c === col0);
          ctx.fillStyle = ilu ? RED : '#d9d9d9';
          ctx.fillRect(gcx, gcy, cell, cell);
          if (ilu) { ctx.fillStyle = 'rgba(255,0,54,.18)'; ctx.fillRect(gcx - 2, gcy - 2, cell + 4, cell + 4); }
        }
      }
    }
    ctx.fillStyle = RED;
    ctx.fillRect(xo, 8 + 7 * step + 3, 3 * 6 * step - step, 2);
    requestAnimationFrame(pintarGlyph);
  }

  /* ==========================================================
     SCROLLSPY
     ========================================================== */
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

  /* ==========================================================
     DATOS COMPARTIDOS · FAMILIAS
     ========================================================== */
  var FAMILIAS = [
    {
      id: 'avr', nombre: 'AVR', cat: '8bit', ico: 'fa-microchip',
      bits: 8, flash: 32, ram: 2, eep: 1, freq: 20, gpio: 24, adc: '10 bits',
      per: ['ADC 10 bits', '4 timers', 'UART', 'SPI', 'I²C', 'watchdog'],
      uso: 'Ensamblador de AVR y USB con bootloader; la familia clásica del aprendizaje, el estándar de Arduino.',
      addr: { f: '0x0000', r: '0x0060', e: '0x8100' }
    },
    {
      id: 'pic', nombre: 'PIC', cat: '8bit', ico: 'fa-microchip',
      bits: 8, flash: 8, ram: 0.25, eep: 0.25, freq: 20, gpio: 14, adc: '10 bits',
      per: ['ADC 10 bits', '3 timers', 'USART', 'MSSP (I²C/SPI)', 'comparadores'],
      uso: 'Muy extendida en industria y automatización: hay un modelo para casi cualquier tamaño de memoria.',
      addr: { f: '0x0000', r: '0x0A0', e: '0x4000' }
    },
    {
      id: 'i8051', nombre: '8051', cat: '8bit', ico: 'fa-microchip',
      bits: 8, flash: 8, ram: 0.5, eep: 0, freq: 12, gpio: 32, adc: '8 bits (externo)',
      per: ['2 timers', 'UART', 'sin ADC interno', 'bus externo 8/16 bits'],
      uso: 'Arquitectura CISC clásica de 51 instrucciones: la más antigua y todavía presente en motores y elevators.',
      addr: { f: '0x0000', r: '0x0030', e: '0x0000' }
    },
    {
      id: 'msp430', nombre: 'MSP430', cat: '16bit', ico: 'fa-microchip',
      bits: 16, flash: 16, ram: 0.5, eep: 0.5, freq: 24, gpio: 12, adc: '12 bits',
      per: ['ADC 12 bits', '2 timers', 'USART', 'SPI', 'watchdog'],
      uso: 'Pensada para el ultra bajo consumo: instrumentos de campo y dispositivos con años de autonomía.',
      addr: { f: '0xC000', r: '0x0000', e: '0xA000' }
    },
    {
      id: 'dspic', nombre: 'dsPIC', cat: 'dsp', ico: 'fa-wave-square',
      bits: 16, flash: 64, ram: 8, eep: 0, freq: 40, gpio: 30, adc: '12 bits',
      per: ['ADC 12 bits', '3 timers PWM', '2 DSP', 'encoders QEI'],
      uso: 'Procesamiento de señal en tiempo real: filtrado, audio, control de motores con encoder.',
      addr: { f: '0x0000', r: '0x0800', e: '0x7FE0' }
    },
    {
      id: 'cm0', nombre: 'Cortex-M0/M0+', cat: '32bit', ico: 'fa-microchip',
      bits: 32, flash: 64, ram: 8, eep: 0, freq: 48, gpio: 32, adc: '12 bits',
      per: ['ADC 12 bits', 'timers', 'UART', 'I²C/SPI', 'sin FPU'],
      uso: 'La entrada al mundo de 32 bits: núcleo muy pequeño, ARMv6-M con las instrucciones más básicas.',
      addr: { f: '0x0000', r: '0x2000', e: '0x4000' }
    },
    {
      id: 'cm3', nombre: 'Cortex-M3/M4', cat: '32bit', ico: 'fa-microchip',
      bits: 32, flash: 256, ram: 64, eep: 4, freq: 100, gpio: 54, adc: '12–16 bits',
      per: ['ADC 12 bits', 'timers PWM', 'UART/I²C/SPI/USB', 'FPU en M4'],
      uso: 'El equilibrio entre potencia y consumo: automoción, instrumentación médica.',
      addr: { f: '0x0000', r: '0x2000', e: '0x0800' }
    },
    {
      id: 'cm7', nombre: 'Cortex-M7/M33', cat: 'dsp', ico: 'fa-microchip',
      bits: 32, flash: 512, ram: 192, eep: 8, freq: 400, gpio: 96, adc: '16 bits',
      per: ['ADC 12 bits', '2 DAC', 'FPU doble', 'Ethernet MAC', 'caché'],
      uso: 'Gráfica, procesamiento de imagen y control industrial de alto rendimiento en tiempo real.',
      addr: { f: '0x0000', r: '0x2000', e: '0x4000' }
    }
  ];
  function famPorId(id) {
    for (var i = 0; i < FAMILIAS.length; i++) if (FAMILIAS[i].id === id) return FAMILIAS[i];
    return FAMILIAS[0];
  }
  var FAM = FAMILIAS[0];
  function kb(n) { return n >= 1 ? n + ' KB' : (n * 1024) + ' B'; }

  /* cada sección registra aquí su redibujado: al cambiar de familia
     el bus, el mapa de memoria y el pinout se vuelven a pintar */
  var REFRESH = { buses: null, mem: null, io: null };
  function refrescaTodo() {
    refrescaFicha();
    if (REFRESH.buses) REFRESH.buses();
    if (REFRESH.mem) REFRESH.mem();
    if (REFRESH.io) REFRESH.io();
  }

  /* ==========================================================
     01 · ANATOMÍA DEL CHIP
     ========================================================== */
  var PARTES = {
    cpu: ['CPU · unidad central', 'Núcleo con ALU, registros de trabajo y contador de programa. Lee una instrucción de la memoria de programa, la decodifica y la ejecuta. En un microcontrolador comparte bus y memoria con todo lo demás.'],
    flash: ['Memoria de programa · Flash', 'No volátil: conserva el programa sin energía. En un µC se puede reescribir desde el programador o, en algunas familias, desde la propia aplicación mediante el bootloader.'],
    ram: ['Memoria de datos · SRAM', 'Volátil: guarda variables, pila de llamadas y búferes. Se borra al cortar la alimentación, y su capacidad marca cuántos cálculos admite el programa a la vez.'],
    eeprom: ['Memoria no volátil · EEPROM', 'Guarda calibraciones, números de serie y parámetros que deben sobrevivir a un reinicio. Se escribe byte a byte y su duración de vida se cuenta en ciclos de escritura.'],
    timer: ['Temporizadores', 'Generan retardos y pulsos de base de tiempo sin depender del programa: PWM, captura de pulsos y medidores de tiempo. Es la razón principal de un pin dedicado de temporizador.'],
    adc: ['Conversor analógico-digital', 'Mide una tensión y la convierte en un número. Su resolución —8, 10 o 12 bits— fija cuántos niveles distintos puede ver el sistema: 10 bits son 1024.'],
    uart: ['Puerto serie UART', 'Convierte el byte paralelo del microcontrolador en bits con una velocidad fija acordada con el otro extremo. Se usa para consola, GPS, Bluetooth y diagnóstico.'],
    gpio: ['Puertos de entrada/salida', 'Los registros de puerto son la memoria de trabajo más basic: un bit por pin. Controlan dirección, nivel y resistencias internas, y una parte de ellos se comparte con funciones alternativas.']
  };
  var ORDEN = ['flash', 'ram', 'timer', 'adc', 'uart', 'cpu', 'eeprom', 'gpio'];

  function anatomia() {
    var svg = $('#mcuSvg'), label = $('#mcuLabel');
    var range = $('#mcuRange'), auto = $('#mcuAuto');
    if (!svg || !range) return;
    var scan = $('#mcuScan');
    var grupos = $$('#mcuSvg .part');
    var autoOn = false, timer = null, pos = 10;
    function mostrar(p) {
      var y = 8 + (p / 100) * 174;
      if (scan) scan.setAttribute('y1', y), scan.setAttribute('y2', y);
      var idx = clamp(Math.floor((p / 100) * ORDEN.length), 0, ORDEN.length - 1);
      var key = ORDEN[idx];
      grupos.forEach(function (g) { g.classList.toggle('scan', g.getAttribute('data-part') === key); });
      var d = PARTES[key];
      if (label && d) {
        label.innerHTML = '<b>' + d[0] + '</b><span>' + d[1] + '</span>';
      }
    }
    range.addEventListener('input', function () {
      pos = +range.value;
      if (autoOn) { autoOn = false; auto.textContent = 'Barrido automático: OFF'; }
      mostrar(pos);
    });
    auto.addEventListener('click', function () {
      autoOn = !autoOn;
      auto.textContent = 'Barrido automático: ' + (autoOn ? 'ON' : 'OFF');
      if (autoOn) {
        timer = setInterval(function () {
          pos = (pos + 7) % 101;
          range.value = pos;
          mostrar(pos);
        }, 130);
      } else { clearInterval(timer); }
    });
    mostrar(pos);
  }

  var CARAC = [
    ['fa-microchip', 'CPU integrada', 'Procesador, ALU y registros dentro del mismo chip.'],
    ['fa-memory', 'Memorias internas', 'Programa, datos y EEPROM ya en el encapsulado.'],
    ['fa-plug', 'Entradas/salidas digitales', 'Pines de uso general y funciones alternativas.'],
    ['fa-bolt', 'Bajo consumo', 'Work en rangos de 1.8–5 V, del reposo de µA.'],
    ['fa-tachometer-alt', 'Tiempo real', 'Temporizadores y Compare hardware.'],
    ['fa-sliders-h', 'Periféricos', 'ADC, PWM, UART, I²C, SPI y watch.'],
    ['fa-lock', 'Determinismo', 'Reset y watchdog como base de tiempos.'],
    ['fa-box-open', 'Encapsulado único', 'SOIC, DIP, TQFP: de 8 a más de 100 pines.']
  ];
  var CARAC_TXT = [
    'Sin una CPU no hay programa: el microcontrolador no es un chip «de apoyo», es una computadora completa que se controla a sí misma.',
    'Memoria y procesador en el mismo silicio reducen el número de componentes, las rutas de señal y el costo del sistema completo.',
    'Los pines son la interfaz física con el mundo: el mismo pin puede ser entrada digital, salida, comparación analógica o una línea de bus.',
    'El bajo consumo es una consecuencia de la integración: se puede alimentar desde una batería durante meses o años.',
    'Los temporizadores corren con el reloj del sistema, no con el del programa, así que el tiempo sigue siendo correcto aunque el programa tarde en responder.',
    'Los periféricos hacen el trabajo pesado por hardware: convertir, generar pulsos y transmitir datos sin ocupar los ciclos del procesador.',
    'El Reset y el watchdog defienden laapplication: si el programa se cuelga, el watchdog reinicia el chip y recupera el control del sistema.',
    'Un solo encapsulado reduce el número de conexiones y simplifica elPCB: todo lo que el diseño necesita cabe en una pieza.'
  ];
  function caracteristicas() {
    var grid = $('#caracGrid');
    if (!grid) return;
    var det = $('#caracDetT');
    CARAC.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carac-card';
      b.innerHTML = '<i class="fas ' + c[0] + ' cc-ico"></i><b>' + c[1] + '</b><p>' + c[2] + '</p>';
      b.addEventListener('click', function () {
        var on = b.classList.contains('on');
        $$('#caracGrid .carac-card').forEach(function (x) { x.classList.remove('on'); });
        if (on) { if (det) det.textContent = '—'; return; }
        b.classList.add('on');
        if (det) det.textContent = CARAC_TXT[i];
      });
      grid.appendChild(b);
    });
  }

  /* ==========================================================
     02 · SENSOR → µC → ACTUADOR
     ========================================================== */
  var PROGRAMAS = {
    termo: {
      nom: 'Termostato', sensor: 'Pt100', uni: '°C', act: 'ventilador', actIcon: 'fa-fan',
      setNom: 'temperatura objetivo', setV: 60, sens: 25, errFn: function (m, s) { return m - s; },
      lin: [
        ['LDI  R16, 0xFF', 'carga el valor leído'],
        ['OUT  ADCH, R16', 'lee el ADC'],
        ['OUT  ADCL, R16', 'complemento'],
        ['CPI  R16, CONSIGNA', 'compara con el setpoint'],
        ['BRLO LENTA', 'dura más que la consigna'],
        ['OUT  TIFR1, PWM_ALTO', 'ventilador al 100 %'],
        ['RJMP LEER', 'vuelve al lazo'],
        ['OUT  TIFR1, PWM_BAJO', 'ventilador al 30 %'],
        ['LEER:', 'punto de espera de la lectura']
      ],
      calc: function (m, s) {
        var e = m - s;
        return { out: e > 0 ? clamp(1, 0, 1) : 0.3, stat: e > 0 ? 'SOBRE TEMPERATURA · enfría' : 'EN CONSIGNA · Hold' };
      }
    },
    nivel: {
      nom: 'Control de nivel', sensor: 'HC-SR04', uni: ' cm', act: 'bomba', actIcon: 'fa-tint',
      setNom: 'distancia máxima', setV: 60, sens: 25, errFn: function (m, s) { return m - s; },
      lin: [
        ['CLR  TRIG', 'pulso de disparo'],
        ['OUT  PORTB, TRIG', 'activa el ultrasonido'],
        ['IN   PIN, ECHO', 'espera el eco'],
        ['CPI  R1, MAX_CM', '¿pasó el nivel?'],
        ['BRLO LLENAR', 'todavía hay líquido'],
        ['SBRA PORTB, BOMBA', 'enciende la bomba'],
        ['RET', 'vuelve a medir'],
        ['BCLR PORTB, BOMBA', 'apaga la bomba'],
        ['LLENAR:', 'punto de retorno']
      ],
      calc: function (m, s) {
        var e = m - s;
        return { out: e > 0 ? 1 : 0, stat: e > 0 ? 'NIVEL BAJO · bomba ON' : 'NIVEL OK · bomba OFF' };
      }
    },
    cinta: {
      nom: 'Cinta clasificadora', sensor: 'inductivo NPN', uni: ' uds', act: 'motor DC', actIcon: 'fa-gears',
      setNom: 'piezas por minuto', setV: 60, sens: 25, errFn: function (m, s) { return m - s; },
      lin: [
        ['WAIT TMR1, 0', 'espera el flanco'],
        ['IN   PINC, 1', '¿pieza detectada?'],
        ['BRNE RECHAZO', 'pieza tipo B'],
        ['SBS  PORTC, 0', 'abre la compuerta'],
        ['LDI  R17, 200', '2 s de ventana'],
        ['RCALL MOTOR', 'pulso al motor'],
        ['RET', 'vuelve a esperar'],
        ['SBRA PORTC, 0', 'cierra la compuerta'],
        ['RECHAZO:', 'etiqueta especial']
      ],
      calc: function (m, s) {
        var e = m - s;
        return { out: e > 0 ? 1 : 0, stat: e > 0 ? 'FLUJO ALTO · motor ON' : 'FLUJO BAJO · motor OFF' };
      }
    },
    posic: {
      nom: 'Posicionamiento', sensor: 'encoder incremental', uni: ' °', act: 'servo SG90', actIcon: 'fa-crosshairs',
      setNom: 'posición objetivo', setV: 60, sens: 25, errFn: function (m, s) { return m - s; },
      lin: [
        ['SBRA PORTA, PB0', 'lee canal A'],
        ['SBRA PORTA, PB1', 'lee canal B'],
        ['SBRC PINA, PB1', 'sentido horario'],
        ['SUBI R0, R1', 'suma el conteo'],
        ['CPI  R0, OBJETIVO', '¿llegó?'],
        ['BRNE MOVER', 'todavía no'],
        ['SBRA TIMER0, PWM_CENTRO', 'servo al centro'],
        ['RETI', 'fin del lazo'],
        ['MOVER:', 'sigue contando']
      ],
      calc: function (m, s) {
        var e = m - s;
        return { out: e > 0 ? clamp(0.5 + e / 120, 0, 1) : clamp(0.5 + e / 120, 0, 1), stat: e > 0 ? 'CORRIENDO · avanza' : 'REGRESANDO · retrocede' };
      }
    }
  };
  var PROG = 'termo';

  function sistema() {
    var setR = $('#sysSet'), sensR = $('#sysSens');
    if (!setR) return;
    var setV = $('#sysSetV'), sensV2 = $('#sysSensV2'), consName = $('#sysConsName');
    var nodeS = $('#sysSensor'), nodeM = $('#sysMcu'), nodeA = $('#sysAct');
    var sensVal = $('#sysSensV'), sensSub = $('#sysSensS');
    var mcuVal = $('#sysMcuV'), mcuSub = $('#sysMcuS');
    var actVal = $('#sysActV'), actSub = $('#sysActS');
    var linkA = $('#slA').parentNode, linkB = $('#slB').parentNode;
    var fb = $('#sysFb'), code = $('#sysCode'), pc = $('#sysPc');
    var adc = $('#sysAdc'), reg = $('#sysReg'), err = $('#sysErr'), stat = $('#sysStatus');
    var log = $('#sysLog'), pins = $$('#sysMcu .sn-pins span');
    var run = $('#sysRun'), pert = $('#sysPert');
    var p = PROGRAMAS[PROG], running = true, step = 0, lines = [];

    function hex(n, d) { var s = (n >>> 0).toString(16).toUpperCase(); while (s.length < (d || 4)) s = '0' + s; return '0x' + s; }
    function bytes(n) { return n >= 1024 ? (n / 1024).toFixed(n % 1024 ? 1 : 0) + ' MB/s' : n.toFixed(2) + ' MB/s'; }

    function pintarCode() {
      code.innerHTML = '';
      p.lin.forEach(function (l, i) {
        var d = document.createElement('div');
        d.className = 'cl' + (i === step ? ' on' : '');
        d.innerHTML = '<span class="ad">' + String(i * 2).padStart(4, '0') + ':</span> ' +
          l[0] + '  <span class="cm">; ' + l[1] + '</span>';
        code.appendChild(d);
      });
    }
    function loguear(txt, cls) {
      var d = document.createElement('div');
      d.className = 'l ' + (cls || 'dim');
      d.textContent = '> ' + txt;
      log.insertBefore(d, log.firstChild);
      while (log.children.length > 40) log.removeChild(log.lastChild);
    }
    function ciclo() {
      var sv = +sensR.value, st = +setR.value;
      step = (step + 1) % p.lin.length;
      var res = p.calc(sv, st);
      var e = p.errFn(sv, st);
      var raw = clamp(sv, 0, 100) / 100 * 1023;

      sensVal.textContent = sv + ' ' + p.uni;
      sensSub.textContent = p.sensor;
      mcuVal.textContent = FAM.bits + ' bits';
      mcuSub.textContent = p.nom + ' · ' + (running ? 'ejecutando' : 'en pausa');
      actVal.textContent = Math.round(res.out * 100) + ' %';
      actSub.textContent = p.act + ' · ' + (res.out > 0.05 ? 'ON' : 'OFF');

      setV.textContent = st + p.uni;
      sensV2.textContent = sv.toFixed(1) + p.uni;
      consName.textContent = p.setNom;

      adc.textContent = raw.toFixed(0) + ' / 1023';
      reg.textContent = 'PORT' + (PROG === 'posic' ? 'A' : 'C') + ' = 0b' + (res.out > 0.5 ? '11111111' : '00111111');
      err.textContent = (e >= 0 ? '+' : '') + e.toFixed(1) + p.uni;
      stat.textContent = res.stat;
      pc.textContent = 'PC ' + hex(step * 2);

      linkA.classList.toggle('flow', running);
      linkB.classList.toggle('flow', running && res.out > 0.02);
      fb.classList.toggle('on', running && res.out > 0.02);
      nodeS.classList.toggle('hit', running);
      nodeM.classList.toggle('hit', running);
      nodeA.classList.toggle('hit', running && res.out > 0.02);

      var live = [p === PROGRAMAS.termo ? 4 : p === PROGRAMAS.posic ? 0 : 2,
                  p === PROGRAMAS.posic ? 1 : 5, p === PROGRAMAS.posic ? 4 : 3];
      pins.forEach(function (s2, i) { s2.classList.toggle('live', running && live.indexOf(i) !== -1); });

      pintarCode();
    }
    var t = setInterval(function () { if (running) ciclo(); }, 420);

    $$('#sysProgram .seg').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#sysProgram .seg').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        PROG = b.getAttribute('data-p');
        p = PROGRAMAS[PROG];
        setR.value = p.setV;
        sensR.value = p.sens;
        step = 0;
        log.innerHTML = '';
        loguear('programa cargado: ' + p.nom, 'ok');
        loguear('sensor ' + p.sensor + ' → ' + p.act, 'dim');
        ciclo();
      });
    });
    run.addEventListener('click', function () {
      running = !running;
      run.textContent = running ? 'Pausar programa' : 'Reanudar programa';
      loguear(running ? 'ejecución reanudada en ' + hex(step * 2) : 'ejecución pausada en ' + hex(step * 2), running ? 'ok' : 'warn');
      if (running) ciclo();
    });
    pert.addEventListener('click', function () {
      var base = p === PROGRAMAS.posic ? 25 : 25;
      var salto = Math.random() > 0.5 ? 1 : -1;
      sensR.value = clamp(base + salto * (12 + Math.random() * 20), 0, 100);
      loguear('PERTURBACIÓN · sensor = ' + sensR.value + p.uni, 'err');
      ciclo();
    });
    [setR, sensR].forEach(function (r) { r.addEventListener('input', ciclo); });

    ciclo();
    loguear('programa cargado: ' + p.nom, 'ok');
    loguear('lazo cerrado S → µC → A habilitado', 'dim');
  }

  /* ==========================================================
     03 · FAMILIAS
     ========================================================== */
  function familias() {
    var grid = $('#famGrid');
    if (!grid) return;
    var count = $('#famCount'), det = $('#famDet');
    var filtro = 'all';
    function pinta() {
      grid.innerHTML = '';
      var vis = 0;
      FAMILIAS.forEach(function (f) {
        if (filtro !== 'all' && f.cat !== filtro) return;
        vis++;
        var t = document.createElement('button');
        t.type = 'button';
        t.className = 'tile' + (f.id === FAM.id ? ' on' : '');
        t.innerHTML = '<span class="cat">' + (f.cat === 'dsp' ? 'DSP' : f.cat) + '</span>' +
          '<i class="fas ' + f.ico + '"></i><b>' + f.nombre + '</b>' +
          '<span>' + f.bits + ' bits · ' + f.freq + ' MHz</span>';
        t.addEventListener('click', function () {
          if (f.id === FAM.id) return;
          FAM = f;
          refrescaTodo();
          pinta();
          if (det) det.textContent = 'Familia activa: ' + f.nombre + ' · ' + f.bits + ' bits. Buses, mapa de memoria y pinout actualizados.';
        });
        grid.appendChild(t);
      });
      if (count) count.textContent = FAMILIAS.length + ' familias / ' + vis + ' visibles';
    }
    $$('#famSegs .seg').forEach(function (s) {
      s.addEventListener('click', function () {
        $$('#famSegs .seg').forEach(function (x) { x.classList.remove('active'); });
        s.classList.add('active');
        filtro = s.getAttribute('data-f');
        pinta();
      });
    });
    pinta();
  }
  function refrescaFicha() {
    var map = { fsBits: FAM.bits + ' bits', fsFlash: kb(FAM.flash), fsRam: kb(FAM.ram), fsEep: FAM.eep ? kb(FAM.eep) : 'sin EEPROM',
      fsFreq: FAM.freq + ' MHz', fsGpio: FAM.gpio + ' pines', fsAdc: FAM.adc, fsPer: FAM.per.join(' · '), fsUso: FAM.uso };
    for (var k in map) { var e = document.getElementById(k); if (e) e.textContent = map[k]; }
    var n = $('#famActName'); if (n) n.textContent = FAM.nombre;
    var m = $('#mcuFam'); if (m) m.textContent = FAM.nombre;
    var bf = $('#busFam'); if (bf) bf.textContent = 'familia activa: ' + FAM.nombre;
    var mf = $('#memFam'); if (mf) mf.textContent = FAM.nombre;
    var iof = $('#ioFam'); if (iof) iof.textContent = FAM.nombre;
    var s1 = $('#mcuSpec1'), s2 = $('#mcuSpec2'), s3 = $('#mcuSpec3'), s4 = $('#mcuSpec4');
    if (s1) s1.textContent = FAM.bits + ' bits';
    if (s2) s2.textContent = FAM.freq + ' MHz';
    if (s3) s3.textContent = kb(FAM.flash);
    if (s4) s4.textContent = kb(FAM.ram);
  }

  /* ==========================================================
     04 · BUSES
     ========================================================== */
  var BUSW = 8, BUSF = 20;
  function tam(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(n % 1024 ? 1 : 0) + ' KB';
    if (n < 1073741824) return (n / 1048576).toFixed(n % 1048576 ? 2 : 0) + ' MB';
    return (n / 1073741824).toFixed(2) + ' GB';
  }
  function mbs(bits, mhz) { return (bits / 8 * mhz).toFixed(2) + ' MB/s'; }

  function buses() {
    var row = $('#busRow');
    if (!row) return;
    var wEl = $('#busW'), b2 = $('#busByte2'), by = $('#busBytes'), instr = $('#busInstr');
    var thr = $('#busThr'), use = $('#busUse'), fR = $('#busFreq'), fV = $('#busFreqV');
    var thrB = $('#busThrBig'), cmpFreq = $('#busCmpFreq'), cmpRows = $('#busCmpRows');

    function pintaFila() {
      row.innerHTML = '';
      var v = 0;
      for (var i = 0; i < 64; i++) {
        var bit = Math.floor(Math.random() * 2);
        v = (v << 1) | bit;
        var c = document.createElement('div');
        c.className = 'bus-cell' + (bit ? ' on' : '') + (i % 8 === 0 ? ' dv' : '');
        c.textContent = bit;
        row.appendChild(c);
        if (i + 1 >= BUSW) {
          if (wEl) wEl.textContent = BUSW + ' bits';
          if (b2) b2.textContent = 'byte = 0b' + v.toString(2).padStart(BUSW, '0').replace(/(.{8})/, '$1 ').trim();
          if (by) by.textContent = (BUSW / 8).toFixed(0);
          if (instr) instr.textContent = BUSW <= 16 ? BUSW + ' bits' : '32 bits';
          if (thr) thr.textContent = mbs(BUSW, 1);
          var ls = FAMILIAS.filter(function (f) { return f.bits === BUSW; });
          if (use) {
            use.textContent = BUSW === 64
              ? 'ninguna: 64 bits pertenece a microprocesadores, no a microcontroladores'
              : (ls.length ? ls.map(function (f) { return f.nombre; }).join(' · ') : 'ninguna de esta lista');
          }
          return;
        }
      }
    }
    function pintaCmp() {
      if (!cmpRows) return;
      var max = mbs(64, BUSF);
      cmpRows.innerHTML = '';
      [8, 16, 32, 64].forEach(function (w) {
        var v = mbs(w, BUSF);
        var n = parseFloat(v);
        var mx = parseFloat(max);
        var d = document.createElement('div');
        d.className = 'bcmp-row' + (w === BUSW ? ' on' : '');
        d.innerHTML = '<span class="bl">' + (w === BUSW ? '<i class="fas fa-chevron-right"></i>' : '') + w + ' bits</span>' +
          '<span class="bt"><i style="width:' + (n / mx * 100).toFixed(1) + '%"></i></span>' +
          '<span class="bv">' + v + '</span>';
        cmpRows.appendChild(d);
      });
    }
    $$('#busSegs .seg').forEach(function (s) {
      s.addEventListener('click', function () {
        $$('#busSegs .seg').forEach(function (x) { x.classList.remove('active'); });
        s.classList.add('active');
        BUSW = +s.getAttribute('data-w');
        pintaFila();
        pintaCmp();
      });
    });
    function frec() {
      BUSF = +fR.value;
      if (fV) fV.textContent = BUSF + ' MHz';
      if (thrB) thrB.textContent = mbs(BUSW, BUSF);
      if (cmpFreq) cmpFreq.textContent = BUSF + ' MHz';
      pintaCmp();
    }
    fR.addEventListener('input', frec);

    var ab = $('#addrBits'), av = $('#addrVal'), am = $('#addrMem'), an = $('#addrNote');
    ab.addEventListener('input', function () {
      var n = +ab.value, bytes = Math.pow(2, n);
      var s = tam(bytes);
      if (av) av.textContent = s;
      if (am) am.textContent = s;
      if (an) {
        an.textContent = n <= 11
          ? 'Con ' + n + ' líneas solo se direccionan ' + s + ': alcanza para un puerto o un registro, no para un programa real.'
          : n <= 16
            ? 'Con ' + n + ' líneas caben ' + s + ': es justo el rango de la memoria de programa de un microcontrolador de 8 o 16 bits.'
            : n <= 24
              ? 'Con ' + n + ' líneas se direccionan ' + s + ': aquí ya hace falta memoria externa, un bus de direcciones completo y direccionamiento por paginación.'
              : 'Con ' + n + ' líneas se direccionan ' + s + ': es el rango de un microprocesador; ningún microcontrolador de esta página lo necesita.';
      }
    });

    pintaFila();
    pintaCmp();
    frec();
    ab.dispatchEvent(new Event('input'));

    REFRESH.buses = function () {
      BUSW = FAM.bits;
      $$('#busSegs .seg').forEach(function (x) { x.classList.toggle('active', +x.getAttribute('data-w') === BUSW); });
      pintaFila();
      pintaCmp();
    };
  }

  /* ==========================================================
     05 · MAPA DE MEMORIA
     ========================================================== */
  var ARCH = 'harvard';
  function mapaMemoria() {
    var map = $('#memMap');
    if (!map) return;
    var arch = $('#memArch'), label = $('#memLabel'), load = $('#memLoad');
    var mf = $('#memFlash'), mr = $('#memRam'), me = $('#memEep');
    var tabla = $('#memTable');

    function bloques() {
      return [
        { k: 'f', n: 'Memoria de programa · Flash', s: kb(FAM.flash), a: FAM.addr.f, v: FAM.flash },
        { k: 'r', n: 'Memoria de datos · SRAM', s: kb(FAM.ram), a: FAM.addr.r, v: FAM.ram },
        { k: 'e', n: 'Memoria no volátil · EEPROM', s: FAM.eep ? kb(FAM.eep) : 'no implementada', a: FAM.addr.e, v: FAM.eep || 0.001 }
      ];
    }
    function pinta() {
      var bs = bloques();
      var max = Math.sqrt(Math.max(FAM.flash, FAM.ram, FAM.eep || 0.001));
      map.innerHTML = '';
      bs.forEach(function (b) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'mem-block';
        el.dataset.k = b.k;
        var wpc = clamp(Math.sqrt(b.v) / max * 100, 4, 100);
        el.innerHTML = '<span class="mb-fill" style="width:' + wpc.toFixed(1) + '%"></span>' +
          '<span class="mb-top"><span class="mb-name">' + b.n + '</span><span class="mb-size">' + b.s + '</span></span>' +
          '<span class="mb-addr">dirección inicial ' + b.a + '</span>';
        el.addEventListener('click', function () {
          var on = el.classList.contains('on');
          $$('#memMap .mem-block').forEach(function (x) { x.classList.remove('on'); });
          if (on) { if (label) label.innerHTML = '<b>—</b><span>Toca un bloque del mapa para ver qué guarda y para qué sirve.</span>'; return; }
          el.classList.add('on');
          var d = MEMDESC[b.k];
          if (label) label.innerHTML = '<b>' + d[0] + '</b><span>' + d[1] + '</span>';
        });
        map.appendChild(el);
      });
      $$('#memMap .mem-block')[0].classList.add('on');

      arch.innerHTML = ARCH === 'harvard'
        ? '<div class="ma-row hit"><span class="n">P</span> bus de programa · CPU ↔ Flash ' + kb(FAM.flash) + '</div>' +
          '<div class="ma-row"><span class="n">D</span> bus de datos · CPU ↔ SRAM ' + kb(FAM.ram) + '</div>' +
          '<div class="ma-row"><span class="n">E</span> bus de EEPROM · CPU ↔ ' + (FAM.eep ? kb(FAM.eep) : 'no implementada') + '</div>' +
          '<div class="ma-row"><span class="n">X</span> Harvard: el programa nunca se sobrescribe por un dato</div>'
        : '<div class="ma-row hit"><span class="n">B</span> bus único compartido · CPU ↔ memoria</div>' +
          '<div class="ma-row"><span class="n">F</span> el programa ocupa el mismo espacio que los datos</div>' +
          '<div class="ma-row"><span class="n">W</span> un dato puede llegar a pisar código: requiere watchdog</div>' +
          '<div class="ma-row"><span class="n">X</span> Von Neumann: un solo bus, más lento pero más simple</div>';

      if (mf) mf.textContent = kb(FAM.flash);
      if (mr) mr.textContent = kb(FAM.ram);
      if (me) me.textContent = FAM.eep ? kb(FAM.eep) : 'sin EEPROM';
      var reg = $('#memReg');
      if (reg) reg.textContent = (FAM.bits >= 32 ? '32' : FAM.bits) + ' × ' + FAM.bits + ' bits';

      tabla.innerHTML = '<div class="mtr"><span>arquitectura</span><b>' + (ARCH === 'harvard' ? 'Harvard · buses separados' : 'Von Neumann · bus único') + '</b></div>' +
        '<div class="mtr"><span>buses de memoria</span><b>' + (ARCH === 'harvard' ? '2 o 3' : '1') + '</b></div>' +
        '<div class="mtr"><span>dirección del programa</span><b>' + FAM.addr.f + '</b></div>' +
        '<div class="mtr"><span>dirección de datos</span><b>' + FAM.addr.r + '</b></div>' +
        '<div class="mtr"><span>contenido del reset</span><b>vector en ' + FAM.addr.f + '</b></div>' +
        '<div class="mtr"><span>memoria total interna</span><b>' + tam(FAM.flash * 1024 + FAM.ram * 1024 + FAM.eep * 1024) + '</b></div>';
    }
    $$('#memSegs .seg').forEach(function (s) {
      s.addEventListener('click', function () {
        $$('#memSegs .seg').forEach(function (x) { x.classList.remove('active'); });
        s.classList.add('active');
        ARCH = s.getAttribute('data-m');
        pinta();
      });
    });
    var running = false, t = null;
    load.addEventListener('click', function () {
      running = !running;
      load.textContent = running ? 'Detener ejecución' : 'Cargar programa';
      if (running) {
        t = setInterval(function () {
          $$('#memMap .mem-block').forEach(function (x) { x.classList.toggle('on', x.dataset.k === 'f'); });
          $$('#memArch .ma-row').forEach(function (r, i) { r.classList.toggle('hit', i === 0); });
        }, 260);
      } else {
        clearInterval(t);
        pinta();
      }
    });
    pinta();
    REFRESH.mem = pinta;
  }
  var MEMDESC = {
    f: ['Memoria de programa · Flash', 'Guarda las instrucciones. Al alimentar el chip el contador de programa salta al vector de reset y empieza a leer aquí. Es no volátil y solo se modifica con el programador.'],
    r: ['Memoria de datos · SRAM', 'Guarda variables, la pila y los búferes. Volátil: se borra al quitar la alimentación. Su límite real no es solo el tamaño, también el stack de la familia.'],
    e: ['Memoria no volátil · EEPROM', 'Guarda lo que debe sobrevivir al corte: calibraciones, contador de piezas, última consigna. Escritura lenta por byte, pero de larga vida útil.']
  };

  /* ==========================================================
     06 · TIPOS DE MEMORIA
     ========================================================== */
  var TIPOS = [
    { n: 'Flash', ico: 'fa-microchip', cat: 'novol', tag: 'PROGRAMA', fn: 'Guardar el programa', vol: 'No volátil', acc: 'Aleatorio · lectura en 1 ciclo',
      d: 'Es la memoria de programa de prácticamente todos los microcontroladores. No volátil, de lectura rápida y de escritura por páginas con un número limitado de ciclos de borrado.',
      u: 'Es donde vive el firmware. En familia AVR se llama Flash y va de 1 KB a 256 KB; en Cortex-M es la memoria mapeada en 0x0000.' },
    { n: 'SRAM', ico: 'fa-bolt', cat: 'vol', tag: 'DATOS', fn: 'Variables de trabajo', vol: 'Volátil', acc: 'Aleatorio · 1 ciclo',
      d: 'Memoria estática de acceso aleatorio, volátil y la más rápida del chip. Es la memoria de datos por excelencia: sin ella el programa no podría calcular.',
      u: 'Todas las variables, la pila de llamadas y los búferes viven aquí. Su escasez es la causa clásica del error «stack overflow».' },
    { n: 'DRAM', ico: 'fa-database', cat: 'ext', tag: 'EXTERNA', fn: 'Capacidad y costo', vol: 'Volátil', acc: 'Acceso aleatorio · con refresco',
      d: 'Memoria dinámica de alta densidad y bajo costo por bit, pero necesita refresco periódico y un circuito de addressing. No se integra en un µC pequeño.',
      u: 'Solo aparece en sistemas con memoria externa SDRAM, muy por encima del alcance de un microcontrolador.' },
    { n: 'EEPROM', ico: 'fa-save', cat: 'novol', tag: 'DATOS', fn: 'Parámetros que sobreviven', vol: 'No volátil', acc: 'Aleatorio · escritura lenta',
      d: 'Memoria no volátil con escritura byte a byte muy lenta comparada con la lectura, pero con una larga vida útil en ciclos de escritura.',
      u: 'Calibraciones, número de serie, contraseña del dispositivo y contadores que deben conservar su valor tras un reinicio.' },
    { n: 'Data Flash', ico: 'fa-layer-group', cat: 'novol', tag: 'MIXTA', fn: 'Programa y datos', vol: 'No volátil', acc: 'Lectura rápida · escritura por páginas',
      d: 'Bloque de Flash adicional mapeado en el espacio de datos para guardar ajustes sin tocar la memoria de programa.',
      u: 'Muy usada en 32 bits para parámetros de configuración y trazas de diagnóstico.' },
    { n: 'ROM OTP', ico: 'fa-lock', cat: 'novol', tag: 'UNA VEZ', fn: 'Fijar configuración', vol: 'No volátil', acc: 'Solo lectura tras programar',
      d: 'Celdas programables una sola vez: al grabarlas no se pueden volver a cambiar. Es la forma más barata de proteger una clave o un identificador.',
      u: 'Número de serie único, clave deactivation y ajustes de fábrica que el usuario no debe poder modificar.' },
    { n: 'Registros', ico: 'fa-calculator', cat: 'vol', tag: 'CPU', fn: 'Operar con los datos', vol: 'Volátil', acc: '1 ciclo · sin direccionar',
      d: 'Memoria interna del procesador a la que se accede sin dirección de bus. Guarda acumuladores, punteros y banderas de estado.',
      u: 'Son la memoria más rápida posible porque está en la propia ALU. Hay 8, 16 o 32 según la familia.' },
    { n: 'Caché / scratchpad', ico: 'fa-layer-group', cat: 'vol', tag: 'DSP', fn: 'Datos muy repetidos', vol: 'Volátil', acc: '1 ciclo · local',
      d: 'Memoria pequeña y rápida pegada al núcleo para guardar variables que se usan en cada ciclo, sin penalizar el bus.',
      u: 'En DSP y en FPU acelera acumuladores y coeficientes. En los núcleos modernos es caché L1 con invalidación por hardware.' },
    { n: 'FRAM externa', ico: 'fa-microchip', cat: 'ext', tag: 'SPI', fn: 'No volátil por SPI', vol: 'No volátil', acc: 'SPI · latencia de bus',
      d: 'Módulo de memoria no volátil con interfaz serie. La lectura es casi tan rápida como un Random Access, aunque pasa por el bus.',
      u: 'Registros de datos de un datalogger: alta endurance y acceso por bytes sin desgaste.' },
    { n: 'EEPROM externa', ico: 'fa-envelope-open-text', cat: 'ext', tag: 'I²C', fn: 'No volátil por I²C', vol: 'No volátil', acc: 'I²C · baja velocidad',
      d: 'Módulo 24Cxx conectado al bus de dos hilos. La velocidad la marca el bus, no el chip: mucho más lenta que la interna.',
      u: 'Cuando se necesitan más de unos cientos de bytes persistentes sin gastar la EEPROM del microcontrolador.' },
    { n: 'NVRAM / RTC', ico: 'fa-clock', cat: 'ext', tag: 'ENERGÍA', fn: 'Conserva con batería', vol: 'No volátil', acc: 'I²C · lenta',
      d: 'Memoria no volátil que conserva el dato gracias a una celda auxiliar con batería de respaldo.',
      u: 'Reloj de tiempo real, registro de eventos y datos que deben sobrevivir hasta años.' }
  ];
  function tiposMemoria() {
    var grid = $('#tmGrid');
    if (!grid) return;
    var count = $('#tmCount'), dl = $('#tmDetLine'), filtro = 'all';
    function detalle(t) {
      if (!t) return;
      var I = $('#tmDetIcon'), N = $('#tmDetName'), G = $('#tmDetTag'), D = $('#tmDetDesc');
      var F = $('#tmDetFn'), V = $('#tmDetVol'), A = $('#tmDetAcc'), U = $('#tmDetUso');
      if (I) I.className = 'fas ' + t.ico;
      if (N) N.textContent = t.n;
      if (G) G.textContent = t.tag;
      if (D) D.textContent = t.d;
      if (F) F.textContent = t.fn;
      if (V) V.textContent = t.vol;
      if (A) A.textContent = t.acc;
      if (U) U.textContent = t.u;
    }
    function pinta() {
      grid.innerHTML = '';
      var vis = 0;
      TIPOS.forEach(function (t) {
        if (filtro !== 'all' && t.cat !== filtro) return;
        vis++;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tm-card';
        b.innerHTML = '<i class="fas ' + t.ico + ' tmc-ico"></i><b>' + t.n + '</b>' +
          '<p>' + t.fn + '</p>' +
          '<span class="tmc-flags"><i>' + (t.cat === 'vol' ? 'volátil' : t.cat === 'novol' ? 'no volátil' : 'externa') + '</i><i>' + t.tag.toLowerCase() + '</i></span>';
        b.addEventListener('click', function () {
          var on = b.classList.contains('on');
          $$('#tmGrid .tm-card').forEach(function (x) { x.classList.remove('on'); });
          if (on) { if (dl) dl.textContent = 'Toca un tipo de memoria para ver su función.'; return; }
          b.classList.add('on');
          detalle(t);
          if (dl) dl.textContent = t.n + ' · ' + t.fn.toLowerCase() + ' · ' + t.vol.toLowerCase();
        });
        grid.appendChild(b);
      });
      if (count) count.textContent = TIPOS.length + ' tipos / ' + vis + ' visibles';
      if (vis) $$('#tmGrid .tm-card')[0].click();
    }
    $$('#tmSegs .seg').forEach(function (s) {
      s.addEventListener('click', function () {
        $$('#tmSegs .seg').forEach(function (x) { x.classList.remove('active'); });
        s.classList.add('active');
        filtro = s.getAttribute('data-f');
        pinta();
      });
    });
    pinta();
  }

  /* ==========================================================
     07 · CIRCUITERÍA DE E/S
     ========================================================== */
  var FN = {
    gpio: { n: 'GPIO · entrada/salida', dir: 'entrada o salida', lvl: '0 o 1', pull: 'ninguna', i: '20 mA', w: 'Uso general: el pin no hace nada especial, solo sigue el valor del registro de puerto.' },
    ain: { n: 'ADC · entrada analógica', dir: 'solo entrada', lvl: '0 – 3.3 V', pull: 'ninguna', i: 'no aplica', w: 'La función alternativa más útil: convierte la tensión del pin en un número de 10 o 12 bits. Al activarla, el pin deja de ser digital.' },
    pwm: { n: 'PWM · salida de temporizador', dir: 'solo salida', lvl: '0 o 5 V pulsado', pull: 'ninguna', i: '20 mA', w: 'El temporizador genera el pulso y el pin solo lo reproduce. La frecuencia la fija el prescaler y el ciclo de trabajo el registro de comparación.' },
    spi: { n: 'SPI · bus serial', dir: 'entrada–salida', lvl: '0 o 3.3 V', pull: 'ninguna', i: '8 mA', w: 'El pin es una línea de datos con reloj y selector. Varias líneas comparten el bus, así que cada dispositivo necesita su propio selector para separarlos.' },
    uart: { n: 'UART · transmisión asíncrona', dir: 'entrada–salida', lvl: '0 o 3.3 V', pull: 'ninguna', i: '8 mA', w: 'Dos líneas solo: transmisión y recepción. La velocidad se fija por software en ambos extremos.' },
    i2c: { n: 'I²C · bus de dos hilos', dir: 'entrada–salida (abierto)', lvl: '0 – 3.3 V', pull: 'pull-up externo', i: 'baja corriente', w: 'SDA y SCL comparten línea con pull-up externo a 3.3 V. Un solo par de líneas puede Addressingar decenas de dispositivos por su dirección.' }
  };
  var PIN = 'PA0', PINFN = 'gpio', PORTV = 0;

  function io() {
    var grid = $('#pinGrid');
    if (!grid) return;
    var nombre = $('#pinName'), fns = $('#fnSegs');
    var fFn = $('#pinFn'), fDir = $('#pinDir'), fLvl = $('#pinLvl');
    var fPull = $('#pinPull'), fI = $('#pinI'), warn = $('#pinWarn');
    var pk1 = $('#ioPk'), pk2 = $('#ioPk2'), pk3 = $('#ioPk3');
    var outName = $('#ioPinName');
    var W1 = pk1 ? pk1.parentNode : null, W2 = pk2 ? pk2.parentNode : null, W3 = pk3 ? pk3.parentNode : null;

    var PUERTOS = [
      { p: 'PA', n: 8, af: ['ADC', 'UART'], v: 3.3 },
      { p: 'PB', n: 8, af: ['PWM', 'SPI'], v: 5 },
      { p: 'PC', n: 8, af: ['I²C'], v: 5 }
    ];
    var FNS = ['gpio', 'ain', 'pwm', 'spi', 'uart', 'i2c'];

    function afDe(pin) {
      for (var i = 0; i < PUERTOS.length; i++) {
        var u = PUERTOS[i];
        if (pin.indexOf(u.p) !== 0) continue;
        var n = +pin.slice(2);
        var f = [];
        if (n < u.n) f.push('gpio');
        if (u.p === 'PA') { if (n < 8) f.push('ain'); if (n >= 4) f.push('uart'); }
        if (u.p === 'PB') { if (n === 5 || n === 6 || n === 7) f.push('pwm'); f.push('spi'); }
        if (u.p === 'PC') f.push('i2c');
        return { fns: f, volt: u.v };
      }
      return { fns: ['gpio'], volt: 5 };
    }
    function pintaFns() {
      fns.innerHTML = '';
      var info = afDe(PIN);
      FNS.forEach(function (k) {
        if (info.fns.indexOf(k) === -1) return;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'seg' + (k === PINFN ? ' active' : '');
        b.textContent = FN[k].n.split(' · ')[0];
        b.addEventListener('click', function () {
          PINFN = k;
          pintaFns();
          refresh();
        });
        fns.appendChild(b);
      });
    }
    function refresh() {
      var d = FN[PINFN], info = afDe(PIN);
      if (nombre) nombre.textContent = PIN;
      if (fFn) fFn.textContent = d.n;
      if (fDir) fDir.textContent = d.dir;
      if (fLvl) fLvl.textContent = d.lvl;
      if (fPull) fPull.textContent = d.pull;
      if (fI) fI.textContent = d.i;
      if (outName) outName.textContent = PIN;
      if (warn) {
        warn.className = 'io-warn' + (info.fns.length > 2 ? ' warn' : '');
        warn.textContent = d.w + ' · Tensión de trabajo ' + info.volt + ' V. Alternativas del pin: ' + info.fns.length + '.';
      }
      [W1, W2, W3].forEach(function (w, i) {
        if (!w) return;
        var flujo = i === 0 ? PINFN !== 'gpio' : i === 1 ? PINFN !== 'gpio' : PINFN === 'gpio' || PINFN === 'pwm';
        w.classList.toggle('flow', flujo);
        w.classList.toggle('rev', i === 2 && PINFN === 'ain');
      });
      $$('#pinGrid .io-port-g').forEach(function (g) { g.classList.toggle('on', g.dataset.pin === PIN); });
    }
    function pintaPines() {
      grid.innerHTML = '';
      PUERTOS.forEach(function (u) {
        for (var i = 0; i < u.n; i++) {
          var pin = u.p + i;
          var info = afDe(pin);
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'io-port-g';
          b.dataset.pin = pin;
          var dots = '';
          for (var d2 = 0; d2 < 4; d2++) dots += '<i class="' + (d2 < info.fns.length - 1 ? 'af' : '') + '"></i>';
          b.innerHTML = '<span class="pn">' + pin + '</span><span class="pd2">' + dots + '</span>';
          b.title = info.fns.length + ' funciones · ' + info.volt + ' V';
          b.addEventListener('click', function () {
            PIN = pin;
            if (info2(PIN).fns.indexOf(PINFN) === -1) PINFN = info2(PIN).fns[0];
            pintaFns();
            refresh();
          });
          grid.appendChild(b);
        }
      });
    }
    function info2(pin) { return afDe(pin); }

    var bits = $('#portBits');
    function pintaBits() {
      bits.innerHTML = '';
      for (var i = 7; i >= 0; i--) {
        var bit = (PORTV >> i) & 1;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'io-bit' + (bit ? ' on' : '');
        b.innerHTML = '<span class="b1">PB' + i + '</span><span class="b2">' + bit + '</span><span class="b3">' + (bit ? 'HIGH' : 'LOW') + '</span>';
        b.addEventListener('click', function () {
          PORTV ^= (1 << i);
          pintaBits();
          var pv = $('#portVal');
          if (pv) pv.textContent = '0b' + PORTV.toString(2).padStart(8, '0');
        });
        bits.appendChild(b);
      }
    }

    pintaPines();
    pintaFns();
    refresh();
    pintaBits();
    REFRESH.io = function () { pintaPines(); pintaFns(); refresh(); };
  }

  /* ==========================================================
     08 · DISPOSITIVOS DE E/S
     ========================================================== */
  var DISP = [
    { n: 'Termistor NTC', dir: 'in', ico: 'fa-thermometer-half', t: 'analógico', if: 'ADC de 10 o 12 bits', p: '1', s: 'resistencia 0 – 10 kΩ', b: 'ADC + temporizador', d: 'Su resistencia baja con la temperatura. Se conecta con una resistencia fija y se lee la tensión del punto medio, así que la curva no es lineal y hay que tabularla.' },
    { n: 'LDR fotorresistencia', dir: 'in', ico: 'fa-sun', t: 'analógico', if: 'ADC', p: '1', s: 'resistencia variable con la luz', b: 'ADC', d: 'La luz aumenta el paso de corriente y baja la resistencia. Es el sensor más barato para distinguir día de noche, pero su respuesta es lenta y no es lineal.' },
    { n: 'Pt100 RTD', dir: 'in', ico: 'fa-bullseye', t: 'analógico', if: 'ADC + amplificador', p: '2 – 3', s: 'resistencia 100 Ω', b: 'ADC + comparador', d: 'Su resistencia crece de forma casi lineal con la temperatura, lo que da buena exactitud. Exige corriente constante y amplificación para leerla con resolución.' },
    { n: 'HC-SR04 ultrasonido', dir: 'in', ico: 'fa-ruler-vertical', t: 'digital + tiempo', if: 'GPIO con temporizador', p: '2', s: 'pulso 10 µs → eco', b: 'temporizador de captura', d: 'Mide distancia por el tiempo de vuelo del sonido. Se dispara con un pulso y el ancho del eco da la distancia: sin temporizador de captura la medida es imprecisa.' },
    { n: 'Sensor inductivo NPN', dir: 'in', ico: 'fa-magnet', t: 'digital', if: 'GPIO con pull-up', p: '3', s: '0 V o 3.3 V', b: 'GPIO + pull-up', d: 'Detecta material metálico sin contacto. Su salida es un colector abierto: hace falta un pull-up para leer un nivel alto.' },
    { n: 'DHT11 / DHT22', dir: 'in', ico: 'fa-cloud', t: 'digital', if: 'un solo hilo', p: '2 – 3', s: 'trama de 40 bits', b: 'GPIO con cronómetro', d: 'Mide temperatura y humedad con un microcontrolador propio. Envía una trama de bits temporizada: hay que cronometrar cada pulso para leerla.' },
    { n: 'LED con resistencia', dir: 'out', ico: 'fa-lightbulb', t: 'digital', if: 'GPIO a 5 – 20 mA', p: '1', s: 'nivel alto o bajo', b: 'GPIO', d: 'La salida digital más simple. La resistencia limita la corriente: sin ella el LED y el pin se queman. Se puede modular en brillo con PWM.' },
    { n: 'Zumbador piezo', dir: 'out', ico: 'fa-volume-up', t: 'digital', if: 'GPIO o PWM', p: '1', s: 'tono o pitido', b: 'GPIO + temporizador', d: 'Genera un tono audible con una señal square. Con PWM se controla el tono; con un simple nivel alto suena el tono natural del piezo.' },
    { n: 'Motor DC con driver', dir: 'out', ico: 'fa-fan', t: 'analógico', if: 'PWM + dirección', p: '4 – 6', s: 'PWM 0 – 100 %', b: 'PWM + comparadores', d: 'El motor nunca se alimenta directo del pin: un driver como el L298N aporta la corriente. Dos señales de dirección y una de PWM controlan sentido y velocidad.' },
    { n: 'Servomotor SG90', dir: 'out', ico: 'fa-crosshairs', t: 'PWM', if: 'PWM de 50 Hz', p: '3', s: 'pulso 1 – 2 ms', b: 'temporizador PWM', d: 'Un PWM normal no sirve: la posición depende del ancho del pulso a 50 Hz. El temporizador genera pulsos de 1 a 2 ms y el ángulo sigue la consigna.' },
    { n: 'Relé con optoacoplador', dir: 'out', ico: 'fa-toggle-on', t: 'digital', if: 'GPIO → bobina', p: '2', s: 'nivel alto cierra', b: 'GPIO + retardo', d: 'Aísla galvanicamente la parte de potencia. El pin activa la bobina y los contactos conmutan la carga; hay que dejar tiempo entre activación y cambio.' },
    { n: 'LCD HD44780 16×2', dir: 'io', ico: 'fa-display', t: 'bus paralelo', if: '4 bits en paralelo o I²C', p: '4 – 6', s: 'bytes de caracteres', b: 'GPIO + temporizador', d: 'Tiene su propio controlador: el microcontrolador solo envía bytes de comandos y de caracteres. Con cuatro líneas de datos se reduce el cableado a expensas de velocidad.' },
    { n: 'Teclado matricial 4×4', dir: 'in', ico: 'fa-keyboard', t: 'digital', if: '8 GPIO multiplexados', p: '8', s: 'filas y columnas', b: 'GPIO + barrido', d: 'Dieciseis teclas con ocho pines: se excite una fila y se leen las columnas. El microcontrolador no puede leer las dieciséis a la vez, así que barre.' },
    { n: 'EEPROM 24C32', dir: 'io', ico: 'fa-database', t: 'bus serial', if: 'I²C', p: '2 + dirección', s: 'dirección + bytes', b: 'I²C', d: 'Memoria no volátil externa en el bus de dos hilos. Cada chip tiene una dirección de 7 bits, así que varios pueden compartir SDA y SCL.' },
    { n: 'Módulo WiFi ESP-01', dir: 'io', ico: 'fa-wifi', t: 'bus serial', if: 'UART + GPIO', p: '4 – 8', s: 'comandos AT', b: 'UART + temporizador', d: 'Añade conexión de red al microcontrolador con un módulo aparte. El µC solo envía comandos AT por el puerto serie y atiende la respuesta.' }
  ];
  var DIRN = { in: 'entrada', out: 'salida', io: 'entrada–salida' };

  function dispositivos() {
    var grid = $('#io2Grid');
    if (!grid) return;
    var count = $('#io2Count'), dl = $('#io2DetLine'), filtro = 'all';
    function detalle(d) {
      if (!d) return;
      var I = $('#io2DetIcon'), N = $('#io2DetName'), G = $('#io2DetTag'), T = $('#io2DetDesc');
      var F = $('#io2DetIf'), P = $('#io2DetPins'), S = $('#io2DetSig'), B = $('#io2DetBlk'), U = $('#io2DetUso');
      if (I) I.className = 'fas ' + d.ico;
      if (N) N.textContent = d.n;
      if (G) G.textContent = DIRN[d.dir] + ' · ' + d.t;
      if (T) T.textContent = d.d;
      if (F) F.textContent = d.if;
      if (P) P.textContent = d.p;
      if (S) S.textContent = d.s;
      if (B) B.textContent = d.b;
      if (U) U.textContent = 'Bloque implicado: ' + d.b + '. Es la razón por la que el microcontrolador necesita esa función y no solo un pin libre.';
    }
    function pinta() {
      grid.innerHTML = '';
      var vis = 0;
      DISP.forEach(function (d) {
        if (filtro !== 'all' && d.dir !== filtro) return;
        vis++;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'io2-card';
        b.innerHTML = '<i class="fas ' + d.ico + ' i2c-ico"></i><b>' + d.n + '</b>' +
          '<p>' + d.if + '</p><span class="i2c-dir">' + DIRN[d.dir] + '</span>';
        b.addEventListener('click', function () {
          var on = b.classList.contains('on');
          $$('#io2Grid .io2-card').forEach(function (x) { x.classList.remove('on'); });
          if (on) { if (dl) dl.textContent = 'Toca un dispositivo para ver su interfacing.'; return; }
          b.classList.add('on');
          detalle(d);
          if (dl) dl.textContent = d.n + ' · ' + DIRN[d.dir] + ' · ' + d.if;
        });
        grid.appendChild(b);
      });
      if (count) count.textContent = DISP.length + ' dispositivos / ' + vis + ' visibles';
      if (vis) $$('#io2Grid .io2-card')[0].click();
    }
    $$('#io2Segs .seg').forEach(function (s) {
      s.addEventListener('click', function () {
        $$('#io2Segs .seg').forEach(function (x) { x.classList.remove('active'); });
        s.classList.add('active');
        filtro = s.getAttribute('data-f');
        pinta();
      });
    });
    pinta();
  }

  /* ==========================================================
     09 · DISPLAYS LED
     ========================================================== */
  var SEG = {
    ' ': [0, 0, 0, 0, 0, 0, 0],
    '0': [1, 1, 1, 1, 1, 1, 0], '1': [0, 1, 1, 0, 0, 0, 0], '2': [1, 1, 0, 1, 1, 0, 1],
    '3': [1, 1, 1, 1, 0, 0, 1], '4': [0, 1, 1, 0, 0, 1, 1], '5': [1, 0, 1, 1, 0, 1, 1],
    '6': [1, 0, 1, 1, 1, 1, 1], '7': [1, 1, 1, 0, 0, 0, 0], '8': [1, 1, 1, 1, 1, 1, 1],
    '9': [1, 1, 1, 1, 0, 1, 1], '-': [0, 0, 0, 0, 0, 1, 0]
  };
  function displayLED() {
    var tabs = $('#ledTabs');
    if (!tabs) return;
    var panes = { seg: $('#paneSeg'), matriz: $('#paneMat'), barra: $('#paneBar') };

    function show(k) {
      Object.keys(panes).forEach(function (x) { if (panes[x]) panes[x].style.display = x === k ? '' : 'none'; });
    }
    $$('#ledTabs .seg').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#ledTabs .seg').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        show(b.getAttribute('data-d'));
        if (b.getAttribute('data-d') === 'matriz') animaMatriz();
      });
    });

    /* --- 7 segmentos --- */
    var cv = $('#segCanvas');
    var val = 7;
    var SEGBITS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    function dibujaSeg() {
      if (!cv) return;
      var ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, cv.width, cv.height);
      var n = String(val % 100).padStart(2, '0');
      var segs = [SEG[n[0]], SEG[n[1]]];
      for (var d = 0; d < 2; d++) {
        var ox = 26 + d * 112;
        ctx.strokeStyle = '#262626';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        var H = [
          [ox + 14, 14, ox + 56, 14], [ox + 62, 18, ox + 62, 52], [ox + 62, 66, ox + 62, 100],
          [ox + 14, 104, ox + 56, 104], [ox + 8, 66, ox + 8, 100], [ox + 8, 18, ox + 8, 52],
          [ox + 14, 59, ox + 56, 59]
        ];
        for (var s2 = 0; s2 < 7; s2++) {
          ctx.strokeStyle = segs[d][s2] ? RED : '#262626';
          if (segs[d][s2]) { ctx.shadowColor = RED; ctx.shadowBlur = 12; } else { ctx.shadowBlur = 0; }
          ctx.beginPath();
          ctx.moveTo(H[s2][0], H[s2][1]);
          ctx.lineTo(H[s2][2], H[s2][3]);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }
      var bpb = $('#segPB'), bpd = $('#segPD');
      if (bpb) bpb.textContent = '0b' + segs[0].slice(0, 5).join('') + ' · ' + segs[0].slice(5).join('') + ' · ' + segs[0][6];
      if (bpd) bpd.textContent = '0b' + segs[1].slice(0, 5).join('') + ' · ' + segs[1].slice(5).join('') + ' · ' + segs[1][6];
      var vEl = $('#segVal');
      if (vEl) vEl.textContent = String(val % 100).padStart(2, '0');
      var row = $('#segBits');
      if (row) {
        row.innerHTML = '';
        var todos = segs[1].concat(segs[0]);
        todos.forEach(function (b2, i) {
          var el = document.createElement('div');
          el.className = 'sbit' + (b2 ? ' on' : '');
          el.innerHTML = '<span class="sb-l">PD' + i + '</span><span class="sb-v">' + b2 + '</span><span class="sb-n">' + SEGBITS[i] + '</span>';
          row.appendChild(el);
        });
      }
      var nt = $('#segNote');
      if (nt) nt.textContent = 'Valor ' + String(val % 100).padStart(2, '0') + ': el microcontrolador escribe un byte por dígito. Con catodo común la luz se enciende con un cero, así que se invierte el byte antes de enviarlo.';
    }
    var dn = $('#segDown'), up = $('#segUp');
    if (up) up.addEventListener('click', function () { val = (val + 1) % 100; dibujaSeg(); });
    if (dn) dn.addEventListener('click', function () { val = (val + 99) % 100; dibujaSeg(); });
    dibujaSeg();

    /* --- matriz de puntos --- */
    var MAT = 'T03';
    var FONT5 = {
      T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
      '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
      '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110']
    };
    var shifting = null;
    function dibujaMat() {
      var m = $('#matCanvas');
      if (!m) return;
      var ctx = m.getContext('2d');
      ctx.clearRect(0, 0, m.width, m.height);
      var s2 = 6, ox = 14, oy = 16;
      for (var c2 = 0; c2 < MAT.length; c2++) {
        var pat = FONT5[MAT[c2]];
        for (var r = 0; r < 7; r++) {
          for (var col = 0; col < 5; col++) {
            ctx.fillStyle = pat[r][col] === '1' ? RED : '#1c1c1c';
            ctx.fillRect(ox + (c2 * 6 + col) * s2, oy + r * s2, s2 - 1, s2 - 1);
          }
        }
      }
      ctx.fillStyle = MUT;
      ctx.font = '8px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('8x8 en cascada · 3 columnas visibles', 14, 68);
    }
    function animaMatriz() {
      var cnt = $('#shCount');
      if (shifting) clearInterval(shifting);
      var i = 0;
      shifting = setInterval(function () {
        var v = (0x1F >> (i % 5)) & 0x1F;
        var b1 = $('#sh0'), b2 = $('#sh1'), b3 = $('#sh2');
        if (b1) b1.textContent = '0x07';
        if (b2) b2.textContent = '0x' + v.toString(16).toUpperCase().padStart(2, '0');
        if (b3) b3.textContent = '0x' + ((v >> 2) & 0x1F).toString(16).toUpperCase().padStart(2, '0');
        if (cnt) cnt.textContent = i;
        i++;
      }, 340);
      dibujaMat();
    }
    dibujaMat();

    /* --- barra de LED --- */
    var br = $('#barRange');
    function barra() {
      if (!br) return;
      var v = +br.value;
      var track = $('#barTrack');
      var bw = $('#barByte'), bp = $('#barPort'), bi = $('#barPin');
      if (track) {
        track.innerHTML = '';
        for (var i = 0; i < 10; i++) {
          var umbral = (i + 1) * 10;
          var c = document.createElement('div');
          c.className = 'bar-cell' + (v >= umbral ? ' on' : '');
          c.textContent = (i + 1) * 10;
          track.appendChild(c);
        }
      }
      var b = Math.round(v / 100 * 255);
      if (bw) bw.textContent = b;
      if (bp) bp.textContent = '0b' + b.toString(2).padStart(8, '0');
      if (bi) bi.textContent = 'PB' + (v > 0 ? 0 : '—');
      var bv = $('#barVal');
      if (bv) bv.textContent = b + ' · ' + (b / 255 * 5).toFixed(2) + ' V';
    }
    if (br) br.addEventListener('input', barra);
    barra();
    show('seg');
  }

  /* ==========================================================
     10 · LCD
     ========================================================== */
  function lcd() {
    var cv = $('#lcdCanvas');
    if (!cv) return;
    var buf = new Array(32).fill(' ');
    var pos = 0, cursorOn = true, wireCur = -1, logn = 0;
    var log = $('#lcdLog');
    var FONT = {
      ' ': [0, 0, 0, 0, 0, 0], '0': [1, 1, 1, 1, 1, 0], '1': [0, 0, 1, 1, 0, 0], '2': [1, 0, 1, 0, 1, 1],
      '3': [1, 0, 1, 1, 1, 0], '4': [0, 1, 1, 1, 0, 1], '5': [1, 1, 0, 1, 1, 0], '6': [1, 1, 0, 1, 1, 1],
      '7': [1, 0, 0, 0, 0, 0], '8': [1, 1, 1, 1, 1, 1], '9': [1, 1, 1, 1, 0, 1], '-': [0, 0, 0, 0, 1, 1]
    };
    var PINS = [
      ['VSS', 'GND', '0'], ['VDD', '+5 V', '1'], ['V0', 'contraste', '1'], ['RS', 'cmd/dato', '0'],
      ['RW', 'lectura', '0'], ['E', 'enable', '0'], ['D4', 'dato', '0'], ['D5', 'dato', '0'],
      ['D6', 'dato', '0'], ['D7', 'dato', '0'], ['A', 'retroilum.', '1'], ['K', 'cátodo', '0'],
      ['D0', 'libre', ''], ['D1', 'libre', ''], ['D2', 'libre', ''], ['D3', 'libre', '']
    ];
    function pinta() {
      var ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (var i = 0; i < 16; i++) {
        var ch = buf[i] === ' ' ? '-' : buf[i];
        var pat = FONT[ch] || FONT['-'];
        var x = 10 + i * 19, y = 14;
        ctx.fillStyle = 'rgba(190,225,255,.75)';
        for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) {
          if (pat[r] >> (3 - c) & 1) ctx.fillRect(x + c * 4, y + r * 4, 3, 3);
        }
      }
      for (var j = 0; j < 16; j++) {
        var ch2 = buf[16 + j] === ' ' ? '-' : buf[16 + j];
        var pat2 = FONT[ch2] || FONT['-'];
        var x2 = 10 + j * 19, y2 = 52;
        ctx.fillStyle = 'rgba(190,225,255,.75)';
        for (var r2 = 0; r2 < 5; r2++) for (var c2 = 0; c2 < 4; c2++) {
          if (pat2[r2] >> (3 - c2) & 1) ctx.fillRect(x2 + c2 * 4, y2 + r2 * 4, 3, 3);
        }
      }
      if (cursorOn) {
        var lin = pos < 16 ? 0 : 1;
        var col = pos % 16;
        ctx.fillStyle = RED;
        ctx.fillRect(10 + col * 19, (lin === 0 ? 14 : 52) + (lin === 0 ? 20 : 20), 14, 2);
      }
      var pe = $('#lcdPos');
      if (pe) pe.textContent = 'fila ' + (pos < 16 ? 1 : 2) + ' · col ' + (pos % 16 + 1);
      var pc = $('#lcdChar');
      var usados = buf.filter(function (c) { return c !== ' '; }).length;
      if (pc) pc.textContent = usados + ' / 32 caracteres';
    }
    function loguea(t, cls) {
      if (!log) return;
      var d = document.createElement('div');
      d.className = 'l ' + (cls || 'dim');
      d.textContent = '> ' + t;
      log.insertBefore(d, log.firstChild);
      if (++logn > 40) log.removeChild(log.lastChild);
    }
    function train(wire) {
      wireCur = wire;
      var bEl = $('#lcdByte'), nEl = $('#lcdNib'), eEl = $('#lcdE');
      if (wire === null) {
        if (bEl) bEl.textContent = '—';
        if (nEl) nEl.textContent = '0b0000';
        if (eEl) eEl.textContent = 'E = 0';
        $$('#lcdWire .lcd-pin').forEach(function (x) { x.classList.remove('on'); });
      } else {
        var code = wire.code || 0, rs = wire.rs ? 1 : 0;
        if (bEl) bEl.textContent = '0x' + code.toString(16).toUpperCase().padStart(2, '0') + ' · RS = ' + rs;
        if (nEl) nEl.textContent = '0b' + ((code >> 4) & 0xF).toString(2).padStart(4, '0');
        if (eEl) eEl.textContent = 'E = 1 · 1 µs';
        $$('#lcdWire .lcd-pin').forEach(function (x) {
          x.classList.toggle('on', wire.pins.indexOf(x.dataset.n) !== -1);
        });
        setTimeout(function () { if (wireCur === wire) train(null); }, 420);
      }
    }
    function escribe(ch) {
      if (pos >= 32) pos = 0;
      buf[pos] = ch;
      pos = (pos + 1) % 32;
      train({ code: ch.charCodeAt(0), rs: true, pins: ['RS', 'E', 'D4', 'D5', 'D6', 'D7'] });
      loguea('envía ' + (ch === ' ' ? 'espacio' : '"' + ch + '"') + ' · RS = 1', 'ok');
      pinta();
    }
    function comando(code, nom, pns) {
      train({ code: code, rs: false, pins: pns || ['RS', 'E', 'D4', 'D5', 'D6', 'D7'] });
      loguea(nom + ' · 0x' + code.toString(16).toUpperCase().padStart(2, '0') + ' · RS = 0', 'warn');
    }
    var wireBox = $('#lcdWire');
    if (wireBox) {
      wireBox.innerHTML = '';
      PINS.forEach(function (p) {
        var b = document.createElement('div');
        b.className = 'lcd-pin' + (p[1] === 'libre' ? ' hi' : '');
        b.dataset.n = p[0];
        b.innerHTML = '<span class="lp-n">' + p[0] + '</span><span class="lp-f">' + p[1] + '</span><span class="lp-d">' + p[2] + '</span>';
        wireBox.appendChild(b);
      });
    }
    var KEYS = [
      { t: 'A' }, { t: 'B' }, { t: 'C' }, { t: 'D' }, { t: 'E' }, { t: 'F' },
      { t: 'G' }, { t: 'H' }, { t: 'I' }, { t: 'J' }, { t: 'K' }, { t: 'L' },
      { t: 'M' }, { t: 'N' }, { t: 'O' }, { t: 'P' }, { t: 'Q' }, { t: 'R' },
      { t: 'S' }, { t: 'T' }, { t: 'U' }, { t: 'V' }, { t: 'W' }, { t: 'X' },
      { t: 'Y' }, { t: 'Z' }, { t: '0' }, { t: '1' }, { t: '2' }, { t: '3' },
      { t: ' ' }, { t: '9' }, { t: '8' }, { t: '7' }, { t: '6' }, { t: '5' },
      { t: '4' }
    ];
    var keys = $('#lcdKeys');
    if (keys) {
      keys.innerHTML = '';
      KEYS.forEach(function (k) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'lcd-key';
        b.textContent = k.t === ' ' ? '␣' : k.t;
        b.addEventListener('click', function () {
          b.classList.add('hit');
          setTimeout(function () { b.classList.remove('hit'); }, 180);
          escribe(k.t);
        });
        keys.appendChild(b);
      });
    }
    $$('#lcdCmd .seg').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-c');
        if (c === 'init') { loguea('inicialización: 0x38, 0x0C, 0x01, 0x06 · modo 4 bits', 'ok'); train({ code: 0x38, rs: false, pins: ['RS', 'E', 'D4', 'D5', 'D6', 'D7'] }); }
        if (c === 'clear') { buf.fill(' '); pos = 0; comando(0x01, 'limpiar pantalla'); pinta(); }
        if (c === 'home') { pos = 0; comando(0x02, 'ir al inicio'); pinta(); }
        if (c === 'cursor') { cursorOn = !cursorOn; b.textContent = 'Cursor: ' + (cursorOn ? 'ON' : 'OFF'); b.classList.toggle('active', cursorOn); pinta(); }
        if (c === 'line2') { pos = 16; comando(0xC0, 'dirección de memoria 0x40'); pinta(); }
      });
    });
    pinta();
  }

  /* ==========================================================
     11 · OTROS DISPOSITIVOS DE VISUALIZACIÓN
     ========================================================== */
  var OTROS = [
    { n: 'LED 7 segmentos', ico: 'fa-square', tag: 'GPIO', if: '1 puerto directo', res: '1 dígito', idle: 'n/a · pasivo', u: 'marcador de un valor',
      d: 'La solución más barata y más rápida: ocho diodos y un byte escrito en el puerto. Sin reloj, sin protocolo y sin consumo en reposo.' },
    { n: 'Matriz 8×8 con 74HC595', ico: 'fa-th', tag: 'SPI', if: 'SPI + 3 líneas', res: '64 puntos', idle: 'n/a · pasivo', u: 'texto en cascada',
      d: 'El microcontrolador envía los bytes de una columna y el registro de desplazamiento los reparte. Una fila entera se dibuja en ocho bytes.' },
    { n: 'Barra de LED', ico: 'fa-chart-bar', tag: 'GPIO', if: '1 puerto + PWM', res: '8 – 16 LEDs', idle: 'n/a · pasivo', u: 'nivel de proceso',
      d: 'Una columna de LEDs alineados que representa una magnitud. Barata y robusta, ideal para mostrar un nivel o un caudal sin leer números.' },
    { n: 'LCD de caracteres 16×2', ico: 'fa-display', tag: '4 bits', if: 'paralelo 4 bits', res: '32 caracteres', idle: '1 – 5 mA', u: 'texto alfanumérico',
      d: 'El HD44780 dibuja letras a partir de bytes. Muy legible y barato, con la limitación de caracteres predefined y 32 posiciones.' },
    { n: 'LCD gráfico 84×48', ico: 'fa-project-diagram', tag: 'SPI', if: 'SPI o I²C', res: '84 × 48 píxeles', idle: '1 – 3 mA', u: 'curvas y menús',
      d: 'Controlador gráfico con memoria de video propia: el microcontrolador envía píxeles o comandos de dibujo. Permite representar curvas, no solo texto.' },
    { n: 'OLED SSD1306 128×64', ico: 'fa-mobile-alt', tag: 'I²C', if: 'I²C (o SPI)', res: '128 × 64 píxeles', idle: '10 – 20 µA', u: 'instrumentación',
      d: 'Cada píxel es un diodo orgánico que emite su propia luz: contraste infinito y consumo casi nulo en reposo. Es el display preferido para datos.' },
    { n: 'Display de tinta electrónica', ico: 'fa-book', tag: 'SPI', if: 'SPI', res: '200 × 200 píxeles', idle: 'µA · semanas', u: 'etiqueta persistente',
      d: 'Solo consume al refrescar y después mantiene la imagen sin energía, como el papel. Ideal para etiquetas de almacén o tarjetas de identificación.' },
    { n: 'Display con MAX7219', ico: 'fa-microchip', tag: 'SPI', if: 'SPI + 3 líneas', res: '8 dígitos', idle: 'n/a · pasivo', u: 'varios dígitos',
      d: 'Un driver que maneja ocho dígitos de un solo byte por dígito. Evita los transistores de control del microcontrolador y multiplexa los displays.' }
  ];
  function otrosDisplays() {
    var grid = $('#otGrid');
    if (!grid) return;
    var cv = $('#otCanvas');
    var act = 0;
    function detalle(d) {
      if (!d) return;
      var N = $('#otName'), G = $('#otTag'), D = $('#otDesc');
      var I = $('#otIf'), R = $('#otRes'), E = $('#otIdle'), U = $('#otUse');
      if (N) N.textContent = d.n;
      if (G) G.textContent = d.tag;
      if (D) D.textContent = d.d;
      if (I) I.textContent = d.if;
      if (R) R.textContent = d.res;
      if (E) E.textContent = d.idle;
      if (U) U.textContent = d.u;
      $$('#otGrid .ot-card').forEach(function (x, i) { x.classList.toggle('on', i === act); });
      $$('#otTbl .row').forEach(function (x, i) { x.classList.toggle('active', i === act); });
      dibuja();
    }
    function dibuja() {
      if (!cv) return;
      var ctx = cv.getContext('2d');
      var w = cv.width, h = cv.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060606';
      ctx.fillRect(0, 0, w, h);
      var v = PROG ? +$('#sysSens').value : 25;
      var k = act;
      if (k === 0) {
        ctx.fillStyle = '#141414';
        ctx.fillRect(40, 40, 90, 90);
        ctx.fillStyle = RED;
        ctx.font = '700 54px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(Math.round(v) % 100).padStart(2, '0'), 85, 100);
        ctx.strokeStyle = '#2c2c2c';
        ctx.strokeRect(40, 40, 90, 90);
      } else if (k === 1) {
        var s = 15;
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
          var on = Math.hypot(c - 3.5, r - 3.5) < 2.2 || ((r === 7 || c === 7) && Math.abs(c - r) < 2);
          ctx.fillStyle = on ? RED : '#1e1e1e';
          ctx.fillRect(60 + c * s, 20 + r * s, s - 3, s - 3);
        }
      } else if (k === 2) {
        for (var i = 0; i < 8; i++) {
          var enc = v / 100 * 8;
          ctx.fillStyle = i < enc ? RED : '#1e1e1e';
          ctx.fillRect(50 + i * 26, 55, 18, 60);
        }
        ctx.fillStyle = MUT;
        ctx.font = '11px "Space Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('nivel ' + v + ' %', 50, 140);
      } else if (k === 3) {
        ctx.fillStyle = '#0d1a24';
        ctx.fillRect(30, 42, 240, 86);
        ctx.fillStyle = 'rgba(190,225,255,.8)';
        ctx.font = '15px "Space Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('LLAZADO ' + String(Math.round(v)).padStart(3, ' '), 44, 78);
        ctx.fillText('SET 060 OK', 44, 104);
        ctx.strokeStyle = '#1c3a4c';
        ctx.strokeRect(30, 42, 240, 86);
      } else if (k === 4) {
        ctx.fillStyle = '#0a1420';
        ctx.fillRect(30, 30, 240, 110);
        ctx.strokeStyle = '#16324a';
        for (var g2 = 1; g2 < 6; g2++) {
          ctx.beginPath();
          ctx.moveTo(30, 30 + g2 * 18);
          ctx.lineTo(270, 30 + g2 * 18);
          ctx.stroke();
        }
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (var x2 = 0; x2 <= 240; x2 += 8) {
          var yv = 95 - Math.sin((x2 / 240) * 6.28 * 2 + performance.now() / 900) * 34;
          if (x2 === 0) ctx.moveTo(30 + x2, yv); else ctx.lineTo(30 + x2, yv);
        }
        ctx.stroke();
        ctx.lineWidth = 1;
      } else if (k === 5) {
        ctx.fillStyle = '#000';
        ctx.fillRect(30, 30, 240, 110);
        ctx.fillStyle = '#e8f4ff';
        ctx.font = '700 26px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(Math.round(v)) + ' %', 150, 92);
        ctx.strokeStyle = '#123';
        ctx.strokeRect(30, 30, 240, 110);
      } else if (k === 6) {
        ctx.fillStyle = '#d8d2c4';
        ctx.fillRect(40, 34, 220, 100);
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '700 30px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('T03', 150, 92);
        ctx.fillStyle = '#6a6558';
        ctx.font = '9px "Space Mono", monospace';
        ctx.fillText('NO REQUIERE ENERGÍA', 150, 120);
      } else {
        ctx.fillStyle = '#141414';
        ctx.fillRect(24, 46, 250, 72);
        ctx.fillStyle = RED;
        ctx.font = '700 40px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(Math.round(v) * 10).padStart(4, '0'), 149, 98);
        ctx.strokeStyle = '#2c2c2c';
        ctx.strokeRect(24, 46, 250, 72);
      }
    }
    grid.innerHTML = '';
    OTROS.forEach(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ot-card';
      b.innerHTML = '<i class="fas ' + d.ico + ' otc-ico"></i><span><b>' + d.n + '</b><p>' + d.if + ' · ' + d.res + '</p></span>';
      b.addEventListener('click', function () { act = i; detalle(d); });
      grid.appendChild(b);
    });
    var tbl = $('#otTbl');
    if (tbl) {
      tbl.innerHTML = '<div class="hd">dispositivo</div><div class="hd">interfaz</div><div class="hd">resolución</div><div class="hd">reposo</div><div class="hd">uso</div>';
      OTROS.forEach(function (d, i) {
        var r = document.createElement('div');
        r.className = 'row';
        r.innerHTML = '<span class="rk"><i class="fas fa-chevron-right"></i>' + d.n + '</span>' +
          '<span class="cv">' + d.if + '</span><span class="cv">' + d.res + '</span>' +
          '<span class="cv">' + d.idle + '</span><span class="cv">' + d.u + '</span>';
        r.addEventListener('click', function () { act = i; detalle(d); });
        tbl.appendChild(r);
      });
    }
    var rr = $('#sysSens');
    if (rr) rr.addEventListener('input', dibuja);
    detalle(OTROS[0]);
  }

  /* ==========================================================
     12 · CODIFICADORES DE POSICIÓN
     ========================================================== */
  var ENC = 'cuad', ENCA = 0, PPR = 250, XMODO = 4, ABSB = 12, POT = 25, ENCAUTO = false;
  function encoders() {
    var cv = $('#encCanvas');
    if (!cv) return;
    var stage = $('#encStage');
    var ctl = { cuad: $('#encCtlCuad'), abs: $('#encCtlAbs'), pot: $('#encCtlPot') };
    var hint = $('#encHint');

    function r1k(k, v) { var e = $('#encR' + k + 'k'); if (e) e.textContent = v; }
    function r1(v) { var e = $('#encR1'); if (e) e.textContent = v; }
    function r2(v) { var e = $('#encR2'); if (e) e.textContent = v; }
    function r3(v) { var e = $('#encR3'); if (e) e.textContent = v; }
    function r4(v) { var e = $('#encR4'); if (e) e.textContent = v; }
    function r5(v) { var e = $('#encR5'); if (e) e.textContent = v; }
    function nota(v) { var e = $('#encNote'); if (e) e.textContent = v; }

    function refresca() {
      if (ENC === 'cuad') {
        r1k('1', 'dirección'); r1k('2', 'conteo'); r1k('3', 'posición'); r1k('4', 'canales'); r1k('5', 'resolución');
        var vueltas = ENCA / PPR;
        r1(ENCA > 0 ? 'horario' : ENCA < 0 ? 'antihorario' : 'detenido');
        r2(ENCA + ' pulsos');
        r3((vueltas * 360).toFixed(1) + ' °');
        r4('2 · A y B desfasados 90°');
        r5((PPR * XMODO) + ' cuentas / vuelta');
        nota('Con ' + PPR + ' PPR y modo x' + XMODO + ' el conteo real es ' + (PPR * XMODO) + ' cuentas por vuelta. El microcontrolador deduce el sentido comparando qué canal cambia primero; por eso ambas señales deben entrar por el mismo puerto.');
      } else if (ENC === 'abs') {
        r1k('1', 'posición'); r1k('2', 'código'); r1k('3', 'pistas'); r1k('4', 'trama'); r1k('5', 'resolución');
        r1((ENCA / PPR * 360 % 360).toFixed(1) + ' °');
        var code = Math.round((ENCA / PPR) * Math.pow(2, ABSB)) & (Math.pow(2, ABSB) - 1);
        r2('0b' + code.toString(2).padStart(ABSB, '0').replace(/(.{4})/g, '$1 ').trim());
        r3('8 pistas concéntricas');
        r4((Math.pow(2, ABSB)) + ' posiciones');
        r5(ABSB + ' bits');
        nota('Un encoder absoluto entrega un código único por posición: el microcontrolador lee los ' + ABSB + ' bits y ya sabe dónde está, aunque arranque con el eje movido. En código Gray solo un bit cambia a la vez, lo que evita lecturas erratas.');
      } else {
        r1k('1', 'posición'); r1k('2', 'voltaje'); r1k('3', 'ángulo'); r1k('4', 'señal'); r1k('5', 'resolución');
        r1(POT + ' %');
        r2((POT / 100 * 3.3).toFixed(2) + ' V');
        r3((POT / 100 * 270).toFixed(0) + ' °');
        r4('analógica pura');
        r5('10 bits del ADC');
        nota('Un potenciómetro no cuenta pulsos: entrega una tensión proporcional al ángulo. El ADC la convierte a número, pero la resolución real la fija el convertidor, no el sensor.');
      }
      dibuja();
    }
    function dibuja() {
      var ctx = cv.getContext('2d');
      var w = cv.width, h = cv.height;
      ctx.clearRect(0, 0, w, h);
      var cx = 100, cy = 100, R = 66;
      ctx.strokeStyle = '#1e1e1e';
      ctx.lineWidth = 1;
      for (var i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(cx, cy, R + i * 14, 0, 6.2832); ctx.stroke(); }

      if (ENC === 'cuad') {
        var ang = ENCA / PPR * 6.2832;
        ctx.strokeStyle = '#2c2c2c';
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke();
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        for (var s = 0; s < 24; s++) {
          var a = ang + s / 24 * 6.2832;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12));
          ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
          ctx.stroke();
        }
        ctx.strokeStyle = TXT;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * (R - 20), cy + Math.sin(ang) * (R - 20));
        ctx.stroke();
        ctx.lineWidth = 1;
        dibujaOndas(ctx, ENCA);
      } else if (ENC === 'abs') {
        var ang2 = ENCA / PPR * 6.2832;
        for (var p = 0; p < 8; p++) {
          ctx.strokeStyle = p % 2 ? '#2c2c2c' : '#3a3a3a';
          ctx.beginPath(); ctx.arc(cx, cy, R - p * 7, 0, 6.2832); ctx.stroke();
        }
        var g = Math.round((ENCA / PPR) * Math.pow(2, ABSB)) & (Math.pow(2, ABSB) - 1);
        for (var b2 = 0; b2 < Math.min(ABSB, 12); b2++) {
          var on = (g >> b2) & 1;
          ctx.fillStyle = on ? RED : '#1a1a1a';
          ctx.beginPath();
          ctx.arc(cx, cy, R - b2 * 7, -0.9, 0.9);
          ctx.lineWidth = on ? 3 : 1;
          ctx.strokeStyle = on ? RED : '#242424';
          ctx.stroke();
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = TXT;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang2) * (R - 60), cy + Math.sin(ang2) * (R - 60));
        ctx.stroke();
        ctx.lineWidth = 1;
      } else {
        var a3 = POT / 100 * 4.712 - 2.356;
        ctx.strokeStyle = '#2c2c2c';
        ctx.beginPath(); ctx.arc(cx, cy, R, -2.356, 2.356); ctx.stroke();
        ctx.strokeStyle = RED;
        ctx.beginPath(); ctx.arc(cx, cy, R - 12, -2.356, a3); ctx.stroke();
        ctx.strokeStyle = '#333';
        ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 6.2832); ctx.stroke();
        ctx.strokeStyle = TXT;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a3) * 20, cy + Math.sin(a3) * 20);
        ctx.lineTo(cx + Math.cos(a3) * (R - 6), cy + Math.sin(a3) * (R - 6));
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    }
    function dibujaOndas(ctx, pos) {
      var x0 = 196, y0 = 44, w = 122, h = 34;
      ctx.strokeStyle = '#222';
      ctx.strokeRect(x0, y0, w, h * 2 + 14);
      var A = [], B = [];
      for (var i = 0; i <= 40; i++) {
        A.push(((Math.floor(pos / 4) + i) % 2) ? 1 : 0);
        B.push(((Math.floor(pos / 2) + i) % 2) ? 1 : 0);
      }
      function onda(arr, y0b, col, lbl) {
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (var i = 0; i < arr.length; i++) {
          var x = x0 + i / arr.length * w;
          var y = y0b + (arr[i] ? 0 : h);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.font = '9px "Space Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(lbl, x0 - 4, y0b + 10);
      }
      onda(A, y0, '#ff5c7d', 'A');
      onda(B, y0 + h + 14, '#5c8dff', 'B');
      ctx.textAlign = 'left';
      ctx.fillStyle = MUT;
      ctx.font = '8px "Space Mono", monospace';
      ctx.fillText('cuadratura 90° · x' + XMODO, x0, y0 + h * 2 + 30);
    }

    var dragging = false, lastX = 0;
    function mueve(dx) {
      if (ENC === 'cuad') ENCA += dx * XMODO;
      else if (ENC === 'abs') ENCA += dx * 4;
      refresca();
    }
    function down(x) { dragging = true; lastX = x; if (stage) stage.classList.add('drag'); }
    function move(x) { if (!dragging) return; mueve(Math.round((x - lastX) / 6)); lastX = x; }
    function up() { dragging = false; if (stage) stage.classList.remove('drag'); }
    stage.addEventListener('mousedown', function (e) { down(e.clientX); });
    window.addEventListener('mousemove', function (e) { move(e.clientX); });
    window.addEventListener('mouseup', up);
    stage.addEventListener('touchstart', function (e) { down(e.touches[0].clientX); }, { passive: true });
    stage.addEventListener('touchmove', function (e) { move(e.touches[0].clientX); }, { passive: true });
    stage.addEventListener('touchend', up);

    $$('#encTabs .seg').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#encTabs .seg').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        ENC = b.getAttribute('data-e');
        Object.keys(ctl).forEach(function (k) { if (ctl[k]) ctl[k].style.display = k === ENC ? '' : 'none'; });
        if (hint) hint.textContent = ENC === 'pot' ? 'Mueve el cursor del potenciómetro' : 'Arrastra el disco · o pulsa GIRO AUTO';
        refresca();
      });
    });
    $$('#encMode .seg').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#encMode .seg').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        XMODO = +b.getAttribute('data-x');
        refresca();
      });
    });
    $$('#encBits .seg').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#encBits .seg').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        ABSB = +b.getAttribute('data-b');
        refresca();
      });
    });
    var pr = $('#encPpr'), prv = $('#encPprV');
    if (pr) pr.addEventListener('input', function () { PPR = +pr.value; if (prv) prv.textContent = PPR; refresca(); });
    var pot = $('#potRange'), potv = $('#potVal');
    if (pot) pot.addEventListener('input', function () { POT = +pot.value; if (potv) potv.textContent = POT + ' %'; dibuja(); refresca(); });

    var timers = { 1: null, 2: null, 3: null };
    function auto(idx, btn) {
      ENCAUTO = !ENCAUTO;
      if (btn) btn.textContent = 'Giro auto: ' + (ENCAUTO ? 'ON' : 'OFF');
      if (ENCAUTO) {
        timers[idx] = setInterval(function () {
          if (ENC === 'pot') {
            POT = (POT + 3) % 101;
            if (pot) pot.value = POT;
            if (potv) potv.textContent = POT + ' %';
          } else {
            ENCA += 3;
          }
          refresca();
        }, 40);
      } else { clearInterval(timers[idx]); }
    }
    var a1 = $('#encAuto'), a2 = $('#encAuto2'), a3b = $('#encAuto3');
    if (a1) a1.addEventListener('click', function () { auto(1, a1); });
    if (a2) a2.addEventListener('click', function () { auto(2, a2); });
    if (a3b) a3b.addEventListener('click', function () { auto(3, a3b); });

    refresca();
  }

  /* ==========================================================
     13 · RETO
     ========================================================== */
  var QUIZ = [
    { q: '¿Qué hace un microcontrolador dentro de un sistema sensor-actuador?', opts: ['Solo amplifica la señal del sensor', 'Ejecuta el programa que decide cuándo actuar', 'Almacena la energía del sistema', 'Convierte tensión en corriente constante'], ok: 1 },
    { q: 'La longitud de palabra de 8 bits en un microcontrolador significa…', opts: ['Que trabaja a 8 MHz', 'Que el bus de datos mueve 8 bits por ciclo', 'Que tiene ocho pines', 'Que la memoria es de 8 KB'], ok: 1 },
    { q: 'En la arquitectura Harvard, la memoria de programa y la de datos…', opts: ['Comparten un único bus', 'Están en chips separados con buses separados', 'Son la misma memoria', 'Solo existe la de datos'], ok: 1 },
    { q: '¿Para qué sirve principalmente la memoria EEPROM?', opts: ['Para el programa', 'Para las variables de la pila', 'Para guardar datos que sobreviven al corte de energía', 'Para las direcciones del bus'], ok: 2 },
    { q: 'La función alternativa ADC en un pin significa que ese pin…', opts: ['Deja de ser digital y mide una tensión', 'Genera un pulso de reloj', 'Se convierte en alimentación', 'Transmite datos en serie'], ok: 0 },
    { q: 'Un PWM con ciclo de trabajo bajo aplicado a un motor DC…', opts: ['Lo hace girar más rápido', 'Lo hace girar más lento', 'Lo detiene siempre', 'Lo invierte de sentido'], ok: 1 },
    { q: '¿Por qué la EEPROM externa se conecta por I²C en lugar de al bus de direcciones?', opts: ['Porque es más rápida', 'Porque comparte dos líneas con otros dispositivos direccionados', 'Porque necesita más pines de dirección', 'Porque no es memoria no volátil'], ok: 1 },
    { q: 'Un codificador incremental en cuadratura entrega…', opts: ['Un código binario absoluto', 'Dos señales desfasadas 90° que indican sentido y pulsos', 'Una tensión proporcional al ángulo', 'Un byte por posición'], ok: 1 }
  ];
  function reto() {
    var stage = $('#quizStage3');
    if (!stage) return;
    var prog = $('#qprog3'), count = $('#qcount3'), text = $('#qtext3'), opts = $('#qopts3'), fb = $('#qfb3');
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
        '<p>' + (score >= 6 ? 'MÓDULO COMPLETADO · orden liberada' : 'SISTEMA SIN CALIFICAR · reintenta el módulo') + '</p>' +
        '<button class="btn red" id="qretry3" type="button">Reintentar módulo</button></div>';
      var b = $('#qretry3');
      if (b) b.addEventListener('click', function () {
        score = 0; idx = 0;
        stage.innerHTML = '<div class="qprog" id="qprog3"></div><div class="qcount" id="qcount3"></div><div class="qtext" id="qtext3"></div><div class="qopts" id="qopts3"></div><div class="quiz-fb" id="qfb3"></div>';
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

  /* ==========================================================
     14 · GLOSARIO
     ========================================================== */
  var TERMS = [
    ['Microcontrolador', 'Computadora completa —CPU, memorias y periféricos— sobre un único chip, capaz de gobernar un sistema sin componentes externos.', 'fa-microchip'],
    ['Word length', 'Cantidad de bits que el procesador procesa por ciclo. Define el tamaño del bus de datos y el ancho de un registro.', 'fa-ruler-horizontal'],
    ['Harvard', 'Arquitectura con buses separados para programa y datos: la CPU puede leer código y variables a la vez.', 'fa-project-diagram'],
    ['Von Neumann', 'Arquitectura con un único bus compartido: más simple de cablear, pero el acceso a datos detiene la lectura de código.', 'fa-sitemap'],
    ['Flash', 'Memoria de programa no volátil. Se reescribe por páginas y admite un número alto de ciclos de borrado.', 'fa-microchip'],
    ['EEPROM', 'Memoria no volátil para datos que sobreviven al reinicio. Escritura byte a byte y lenta, con larga vida útil.', 'fa-save'],
    ['GPIO', 'Pin de uso general que puede configurarse como entrada o salida digital, con resistencia interna opcional.', 'fa-plug'],
    ['ADC', 'Conversor analógico-digital: convierte la tensión de un pin en un número. Su resolución define cuántos niveles distingue.', 'fa-sliders-h'],
    ['PWM', 'Modulación por ancho de pulso: regula la potencia media conmutando la salida. Base de la velocidad de motores y del brillo.', 'fa-wave-square'],
    ['UART', 'Puerto serie asíncrono. Solo dos líneas y una velocidad acordada: se usa para consola, GPS y módulos.', 'fa-ethernet'],
    ['I²C', 'Bus de dos hilos con pull-up: SDA y SCL direccionan varios dispositivos con una dirección de 7 bits.', 'fa-code-branch'],
    ['SPI', 'Bus de cuatro hilos con reloj: más rápido que I²C y con más Pines, pero necesita uno por dispositivo.', 'fa-grip'],
    ['Timer', 'Bloque que cuenta pulsos del reloj sin intervención del programa: base de tiempos, PWM y captura de pulsos.', 'fa-stopwatch'],
    ['Watchdog', 'Temporizador que reinicia el chip si el programa deja de responder. Protege el sistema de un cuelgue.', 'fa-dog'],
    ['Reset vector', 'Dirección de la primera instrucción que ejecuta el microcontrolador al recibir alimentación.', 'fa-anchor'],
    ['Firmware', 'Programa guardado en la memoria no volátil del propio chip, que se ejecuta al encender el dispositivo.', 'fa-download'],
    ['Bootloader', 'Pequeño programa que reside al inicio de la memoria de programa y permite recargar el firmware desde un bus externo.', 'fa-usb'],
    ['Multiplexor', 'Circuito que reparte un mismo pin entre varias funciones alternativas según la configuración del registro.', 'fa-random'],
    ['Pull-up / Pull-down', 'Resistencia interna que fija el nivel de un pin cuando no hay nada conectado, evitando flotaciones.', 'fa-arrow-up'],
    ['Codificador incremental', 'Sensor que entrega dos señales desfasadas 90° para contar pulsos y deducir el sentido de giro.', 'fa-redo'],
    ['Cuadratura', 'Técnica que usa las dos señales de un incremental para detectar sentido y mejorar la resolución del conteo.', 'fa-arrows-alt'],
    ['Codificador absoluto', 'Sensor con pistas que devuelve un código binario de la posición, incluso con el eje ya girado al arrancar.', 'fa-compass'],
    ['Código Gray', 'Codificación en la que solo un bit cambia entre posiciones consecutivas: evita lecturas erratas durante el barrido.', 'fa-th'],
    ['Matriz de LED', 'Display de puntos en el que las filas y columnas se multiplexan para iluminar un punto cada vez.', 'fa-th-large'],
    ['HD44780', 'Controlador interno del LCD de caracteres: el microcontrolador solo le envía comandos y bytes de caracteres.', 'fa-display'],
    ['Realimentación', 'Retorno del estado del actuador al microcontrolador para que corrija su orden y cierre el lazo.', 'fa-rotate-left'],
    ['Lazo cerrado', 'Sistema que compara la lectura del sensor con la consigna y ajusta la salida hasta reducir el error.', 'fa-closed-door-open'],
    ['Setpoint', 'Valor consigna que el sistema intenta mantener: es la referencia contra la que se compara la lectura del sensor.', 'fa-bullseye'],
    ['Tiempo real', 'Capacidad de responder en un plazo fijo, garantizada por los temporizadores y no por la velocidad del programa.', 'fa-stopwatch']
  ];
  function glosario() {
    var list = $('#glist3');
    if (!list) return;
    var items = TERMS.map(function (t) {
      var d = document.createElement('div');
      d.className = 'gitem';
      d.innerHTML = '<b><i class="fas ' + t[2] + '"></i>' + t[0] + '</b><p>' + t[1] + '</p>';
      d.dataset.term = t[0].toLowerCase() + ' ' + t[1].toLowerCase();
      list.appendChild(d);
      return d;
    });
    var input = $('#gInput3');
    function filtro() {
      var f = input.value.trim().toLowerCase();
      var vis = 0;
      items.forEach(function (d) {
        var hit = !f || d.dataset.term.indexOf(f) !== -1;
        d.style.display = hit ? '' : 'none';
        if (hit) vis++;
      });
      $('#gcount3').textContent = vis + ' de ' + items.length + ' términos';
    }
    input.addEventListener('input', filtro);
    filtro();
  }

  /* ==========================================================
     NAV / BOTONES
     ========================================================== */
  function navegar() {
    $$('[data-goto]').forEach(function (b) {
      b.addEventListener('click', function () {
        var el = document.querySelector(b.dataset.goto);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ==========================================================
     TOUR
     ========================================================== */
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
    add('#inicio', 'Inicio', 'Un microcontrolador es una computadora completa en un chip. Aquí se cierra el lazo SENSOR → µC → ACTUADOR.');
    add('#concepto', 'Concepto', 'Escanea el encapsulado bloque por bloque y toca una característica general para ver por qué importa.');
    add('#sistema', 'Sistema programable', 'Elige un programa y mueve la variable del sensor: mira cómo el error cae y el actuador responde.');
    add('#familias', 'Familias', 'Filtra por 8, 16 y 32 bits. La familia activa reescribe el bus, el mapa de memoria y el pinout.');
    add('#buses', 'Buses', 'Cambia el ancho de bus y el reloj: el ancho multiplica la velocidad de transferencia de datos.');
    add('#memoria', 'Memoria', 'Harvard o Von Neumann: compara el mapa de programa, datos y EEPROM de la familia activa.');
    add('#tiposmem', 'Tipos de memoria', 'Volátil o no volátil: cada memoria tiene una función y un coste distinto.');
    add('#io', 'Entrada/salida', 'Toca un pin y asígnale ADC, PWM, SPI o I²C para ver dirección, nivel y conflictos.');
    add('#dispositivos', 'Dispositivos', 'Filtra por entrada, salida o bidireccional y revisa con qué bloque se conecta cada uno.');
    add('#leds', 'Displays LED', '7 segmentos, matriz de puntos en cascada y barra de LED: el mismo byte, tres soluciones de hardware.');
    add('#lcd', 'Displays LCD', 'Escribe en el HD44780 y observa los bytes viajar por el bus de cuatro líneas.');
    add('#otros', 'Otros displays', 'Compara interfaces, resolución y consumo en reposo entre LED, LCD, OLED y tinta electrónica.');
    add('#encoders', 'Codificadores', 'Arrastra el disco: cuadratura para contar, código Gray para absolutos, divisor para el ángulo.');
    add('#reto', 'Reto final', 'Ocho preguntas cierran el tema III.');
    add('#glos', 'Glosario', 'Filtra la jerga de microcontroladores en vivo.');
    try {
      var obj = fac({ steps: pasos, showProgress: true, overlayColor: '#000' });
      if (obj && typeof obj.drive === 'function') obj.drive(0);
      else if (obj && typeof obj.moveTo === 'function') obj.moveTo(0);
    } catch (e) {
      if (window.console && console.log) console.log('tour skip', e && e.message);
    }
  }

  /* ==========================================================
     ARRANQUE
     ========================================================== */
  function inicio() {
    function safe(nombre, fn) {
      try { fn(); }
      catch (e) { if (window.console && console.log) console.log('x', nombre, e && e.message); }
    }
    safe('feeds', feeds);
    safe('pintarGlyph', pintarGlyph);
    safe('anatomia', anatomia);
    safe('caracteristicas', caracteristicas);
    safe('sistema', sistema);
    safe('familias', familias);
    safe('buses', buses);
    safe('mapaMemoria', mapaMemoria);
    safe('tiposMemoria', tiposMemoria);
    safe('io', io);
    safe('dispositivos', dispositivos);
    safe('displayLED', displayLED);
    safe('lcd', lcd);
    safe('otrosDisplays', otrosDisplays);
    safe('encoders', encoders);
    safe('reto', reto);
    safe('glosario', glosario);
    safe('navegar', navegar);
    safe('linkificar', linkificar);
    if (!isTourSkipped) setTimeout(tour, 1200);
    safe('btnTour', function () {
      var t1 = $('#btnTour'), t2 = $('#btnTour2');
      if (t1) t1.addEventListener('click', tour);
      if (t2) t2.addEventListener('click', tour);
    });
    refrescaTodo();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicio);
  else inicio();
})();
