# Página web interactiva v2 — Tema I: Sensores (estilo «Nothing»)

### Sistemas Programables

Segunda versión del material didáctico. Mismo contenido (Tema I: Sensores) con un lenguaje
visual inspirado en la marca **Nothing**: negro puro, rojo de acento, tipografía puntual
(Space Grotesk / Space Mono), glifos en matriz de puntos y cero ruido visual.
Cambian las interacciones respecto a la versión 1.

## Cómo abrir
Abre `index.html` con cualquier navegador. Todo (librerías y tipografías) está en `assets/`,
así que **funciona 100% sin internet**.

## Interacciones (distintas a la v1)
1. **Consola teletipo** en el hero: el «bus» escribe lecturas en vivo.
2. **Glifo 5×7** animado (S N R) dibujado punto a punto en canvas.
3. **Cadena de medición por interruptores**: activa los 3 stages y dispara `MEDIR`.
4. **Matriz de clasificación** filtrable por familia + inspección por toque.
5. **Escáner de componentes**: perilla o barrido automático sobre el corte del sensor.
6. **Linterna LDR**: mueves el puntero (control por posición, no deslizador) + curva R-luz dibujada en canvas.
7. **Modos**: perilla de distancia + botón inserta/retira objeto (barrera · retro · difuso).
8. **Proximidad**: campo inductivo con potencia, material capacitivo (εr), `ENVIAR PING` ultrasónico y reed magnético por botón.
9. **Temperatura**: stepper −/+ y **display de matriz de puntos** que dibuja los °C; 3 sensores.
10. **Presión**: mantener pulsado `INFLAR` (diafragma + barra LED) y válvula de seguridad automática.
11. **Reto**: quiz con progreso por puntos, confeti y reintento.
12. **Glosario con filtro en vivo** mientras escribes.
13. Recorrido guiado (Driver.js) con estética red/black; tipografías y glifos en matrix-dot.

## Estructura
```
index.html
README.md
assets/
  css/styles.css          → estilos propios
  js/app.js               → lógica e interacciones
  fonts/                  → tipografías locales (Space Grotesk / Mono)
  vendor/                 → librerías de terceros (sin modificar)
    fontawesome/          → iconos (css + webfonts/)
    driver/               → recorrido guiado (Driver.js)
    confetti/             → confettis del quiz
capturas/                 → capturas para el reporte
tools/                    → utilidades de verificación (dev)
  check-tags.cjs
  check-quiz.cjs
```

## Entregables (nomenclatura)
- `ApellidoNombrePaginaSensores2.docx` — reporte de esta versión.
- `ApellidoNombrePaginaSensores2.zip` — archivo de entrega.

Edita nombres/números de control en el pie (footer) del `index.html` y en la portada del Word.

## Publicar (opcional)
GitHub Pages (rama main) o arrastra la carpeta a https://app.netlify.com/drop

> Sugerencia para equipos: usen la **v1** o la **v2** como página principal y mencionen en el
> reporte la otra como boceto comparativo de diseño.