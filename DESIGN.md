# DESIGN.md — Portal de Clientes B2B · Kapital Colombia

> Documento vivo. Cada decisión de diseño, token, componente o regla de producto
> que se acuerde se registra aquí. Es la fuente de verdad entre Figma y el código.

**Última actualización:** 2026-08-16
**Mercado:** Colombia
**Archivo Figma:** [Core Base Layout](https://www.figma.com/design/HC828onIREdpSpgEcWqN67/Core-Base-Layout)
**Nodo de referencia:** `2090:3856` — *Solicitud de factoring / Cliente Kapital*

---

## 1. Contexto del producto

Portal web B2B para clientes empresariales de **Kapital** en Colombia. Kapital
es una fintech mexicana que opera en Colombia desde hace cuatro años, con más de
US$86 millones colocados, y está en proceso de constituirse como compañía de
financiamiento. Hoy opera como **Corresponsal Digital de Banco Cooperativo
Coopcentral** — de ahí el disclaimer permanente en el sidebar.

### El caso de uso que estamos construyendo

Una empresa cliente entra al portal y **solicita Factoring** para adelantar el
cobro de sus facturas electrónicas. El flujo no es "elegir facturas": es una
**vinculación** — la empresa se somete a estudio antes de poder negociar nada.

### Perfil del usuario

- **Rol:** gerente financiero, tesorero o dueño de PyME.
- **Contexto:** escritorio, sesión larga, revisión de flujo de caja.
- **Motivación:** liquidez inmediata sin esperar los plazos de pago.
- **Fricción principal:** desconfianza en costos ocultos y procesos lentos.

---

## 2. Los cuatro productos de Kapital Colombia

| Producto | Qué es | Datos |
|---|---|---|
| **Crédito Pyme** | Financiamiento a plazo para capital de trabajo, nómina e inventario. | 72,8 % de la cartera |
| **Crédito FLEX** | Cupo rotativo para pagar proveedores. Funciona como tarjeta de crédito sin plástico, plazos cortos y destino específico. | 23,6 % de la cartera |
| **Factoring** | Adelanto del valor de facturas electrónicas. El foco de este portal. | 3,5 % de la cartera |
| **Tarjeta empresarial AMEX** | Tarjeta de crédito empresarial con control de gastos y beneficios de viaje. | En lanzamiento |

### Condiciones reales de Factoring

| Parámetro | Valor |
|---|---|
| Anticipo | Hasta el **90 %** del valor de la factura |
| Primera operación | $10.000.000 – $600.000.000 COP |
| Operaciones siguientes | Desde $500.000 COP |
| Desembolso | Menos de 48 horas |
| Vigencia de la factura | Hasta 120 días de emisión a vencimiento |
| Antigüedad mínima | 2 años de operación |
| Requisito clave | Facturas **inscritas y validadas en RADIAN** |

**RADIAN** es el registro oficial de la DIAN que convierte una factura
electrónica de venta en **título valor negociable**. Sin RADIAN no hay
factoring: es el equivalente colombiano del CFDI/SAT mexicano, y es lo que
hace legalmente posible ceder el derecho de cobro.

El 10 % que no se adelanta cubre retenciones e impuestos, la comisión de
infraestructura tecnológica y una tasa variable según los días al vencimiento.

> **Nota de modelado:** Kapital Colombia comunica el costo como "recibes hasta
> el 90 %", sin desglosar aforo y descuento por separado como en México.
> `calcularAnticipo()` respeta esa comunicación — desglosarlo sería inventar
> una precisión que el producto no publica.

---

## 3. Sistema de diseño

### 3.1 Tokens de color

Los nombres espejean 1:1 las variables de Figma. En código viven como primitivas
CSS (`--figma-*`) y se exponen a Tailwind con alias semánticos legibles.

| Token Figma | Valor | Alias en código | Uso |
|---|---|---|---|
| `bg/01` | `#FFFFFF` | `surface-raised` | Sidebar, tarjetas, superficies elevadas |
| `bg/02` | `#F8F8F8` | `surface` | Fondo de página, header |
| `bg/07` | `rgba(21,21,21,.85)` | `overlay` | Barras flotantes sobre contenido |
| `ui/01` | `#171618` | `ink` | Botón primario, fondos sólidos oscuros |
| `ui/07` | `#F4F4F4` | `surface-muted` | Base de la tarjeta ilustrativa, chips |
| `text/01` | `#171618` | `ink` | Titulares y texto principal |
| `text/02` | `#454546` | `ink-secondary` | Párrafos, descripciones |
| `text/03` | `#969697` | `ink-tertiary` | Metadatos, etiquetas, módulos inactivos |
| `text/04` | `#FFFFFF` | `ink-inverse` | Texto sobre superficies oscuras |
| — | `#A2A2A3` | `ink-quaternary` | Iconos inactivos |
| — | `#E8E8E8` | `hairline` | Bordes y divisores de 1px |
| `accent/02` | `#67BC72` | `positive` | Variación positiva del periodo |
| `dialog/01` | `#EFF4FC` | `info-soft` | Chip "Por cobrar" |
| `dialog/03` | `#F1FBF9` | `success-soft` | Chip "Aprobadas" |
| `dialog/05` | `#FDF3DF` | `warning-soft` | Chip "Pendientes" |
| `ui/06` | `#F0F0F0` | `neutral-soft` | Chip "Rechazadas" |
| — | `#8E95EF` | `chart` | Relleno de barra de la gráfica |
| — | `#CDD9FE` | `chart-track` | Trama del carril de la gráfica |

**Regla:** nunca escribir un hex directo en un componente. Siempre el token.

### 3.2 Tipografía

Familia oficial: **TT Interfaces** (TypeType, licencia comercial). Como no se
puede redistribuir, el stack prioriza la fuente con licencia si se instala, con
fallback libre:

```
TT Interfaces → Onest (Google Fonts, match más cercano) → system-ui
```

> **Para producción:** colocar los `.woff2` con licencia en `public/fonts/` y
> descomentar el bloque `@font-face` en `globals.css`. Cero cambios de código.

Line-height uniforme de **1.25** en todo el sistema.

| Estilo Figma | Tamaño | Peso | Tracking | Utilidad |
|---|---|---|---|---|
| Display / Hero | 40px | DemiBold | 0 | `text-display-m` |
| Display S | 32px | DemiBold | 0 | `text-display-s` |
| Title L | 24px | Bold | 0 | `text-title-l` |
| Title M | 20px | Regular / DemiBold | 0 | `text-title-m` |
| Body L | 16px | DemiBold | 0.5px | `text-body-l` |
| Body M | 14px | Regular / DemiBold | 0.5px | `text-body-m` |
| Body S | 12px | Regular / DemiBold | 0.5px | `text-body-s` |
| Body XS (TAG) | 10px | Regular | 0.5px | — |

**Título a dos tonos.** Los encabezados del flujo de solicitud parten el título:
el sustantivo en tinta plena y el resto en terciaria — *"**Datos** de la
empresa"*, *"**Representante** legal"*. Está modelado en `PASOS` como
`tituloFuerte` / `tituloSuave`, no como markup ad hoc en cada pantalla.

### 3.3 Radios y elevación

| Token | Valor | Uso |
|---|---|---|
| `rounded-nav` | 8px | Campos de formulario, botones de flujo, item de navegación |
| `rounded-card` | 12px | Tarjetas estándar |
| `rounded-card-lg` | 16px | Tarjeta ilustrativa grande |
| `rounded-pill` | 24px | Botones de contenido (altura 48px → píldora perfecta) |

**La forma del botón es una variante (`shape`), no un `className`.** Ver §7.

No hay sombras: la jerarquía se construye con **contraste de superficie**
(`#F8F8F8` de fondo vs `#FFFFFF` elevado), no con elevación.

### 3.4 Layout base

Canvas de referencia 1280×832.

```
┌──────────┬───────────────────────────────────────────┐
│ Sidebar  │  Header (86px, sticky, backdrop-blur 30px)│
│ 220px    ├───────────────────────────────────────────┤
│ pegado   │                                           │
│ al borde │  Contenido — padding 24px                 │
│ altura   │                                           │
│ completa │                                           │
└──────────┴───────────────────────────────────────────┘
```

- **Sidebar:** 220px, pegado al borde, altura completa, sin radio ni inset.
  Expandido con etiquetas. `px-8px py-32px`, gap 32px.
  *(Difiere del portal de México, que usa un sidebar flotante de 72px solo con
  iconos e inset de 16px.)*
- **Header:** 86px, `backdrop-blur-[30px]`, sticky. Izquierda: título del módulo
  o migas de pan. Derecha: razón social + divisor + iconos.
- **Contenido:** padding horizontal de 24px.
- **Formulario de solicitud:** centrado, ancho fijo de 664px (`max-w-form`).

### 3.5 Iconografía

Iconos de línea, **stroke 1.4px**, extremos redondeados, caja de **24px**.
Exportados de Figma y convertidos a componentes React con `stroke="currentColor"`
para poder tematizar estados.

Set Colombia: `operaciones`, `flex`, `factoring`, `tarjeta`, `tutoriales`.
Compartidos: `up-right`, `profile`, `support`.

**Regla:** los paths son datos exportados de Figma, nunca dibujados a mano. Para
un icono nuevo, exportarlo del archivo y agregarlo a `src/components/icons.tsx`.

### 3.6 Campos de formulario

Altura 48px, radio 8px, borde `hairline`, etiqueta encima en tinta terciaria.

Los campos precargados de registros oficiales (razón social, NIT, fecha de
constitución, dígito de verificación) van en **modo lectura**: se muestran para
que la empresa los verifique contra sus documentos, no para que los edite.
Visualmente se distinguen por fondo `surface` y texto en terciaria.

### 3.7 Movimiento

El movimiento en este portal **explica una relación de causa y efecto**. Si algo
se mueve sin que el usuario haya hecho nada, o se mueve de una forma que no
aclara qué pasó, sobra. Es una herramienta de trabajo con cifras de dinero: nada
rebota, nada llama la atención sobre sí mismo.

**Curvas y tiempos.** Dos curvas, expuestas como `ease-salida` y `ease-estandar`
(globals.css) y como `SALIDA` / `ESTANDAR` en `lib/motion.ts`:

| Token | Curva | Para qué |
|---|---|---|
| `ease-salida` | `cubic-bezier(0.16, 1, 0.3, 1)` | Casi todo. Arranca rápido y frena largo: se lee como "esto respondió". |
| `ease-estandar` | `cubic-bezier(0.2, 0, 0, 1)` | Salidas de capas flotantes, donde un frenado suave se siente lento. |

Tres duraciones: **120ms** para la respuesta directa al cursor (color, presión),
**200ms** para entradas y salidas de contenido, **320ms** para reacomodos de
layout. Nada supera 320ms — por encima de eso deja de percibirse como respuesta
y empieza a percibirse como espera.

**Los desplazamientos usan resorte, no duración.** El subrayado de las pestañas,
el realce del módulo activo del sidebar y la barra del paso de la solicitud son
un **único nodo compartido** (`layoutId` de Motion) que viaja de una posición a
otra. Ese recorrido es el mensaje: dice "cambiaste de vista sobre lo mismo".
Apagarlo aquí y encenderlo allá no diría nada. El resorte no rebota
(`damping: 38`).

**Sin sombra, el realce es desplazamiento.** El sistema no usa sombras (§3.3),
así que una tarjeta no puede "flotar" al pasar el cursor: se levanta 2px. Los
botones se hunden un 2 % al pulsarse.

#### Reparto entre CSS y Motion

No es una preferencia de estilo, es una regla con una razón:

- **CSS** — todo lo que anima al cargar la página: barras de la gráfica, barras
  de cupo, filas de la tabla, entrada de cada paso de la solicitud. El `initial`
  de Motion se serializa en el HTML del servidor, así que una tabla de facturas
  con variantes llegaría con todas las filas en `opacity: 0` y no se leería una
  sola cifra hasta que hidratara el bundle. Una animación CSS corre con la hoja
  de estilos y siempre termina. Utilidades: `.animar-crecer-x`,
  `.animar-crecer-y`, `.animar-entrada`, `.animar-aparecer`.
- **Motion** — todo lo que reacciona a un gesto: paneles que se despliegan,
  popovers, listas que se rehacen al filtrar, indicadores compartidos, la barra
  de selección. Es lo que CSS no puede hacer.

El escalonado de listas va en CSS con `animation-delay` inline, con tope a las
~10 filas: sin tope, una tabla larga tardaría segundos en terminar de aparecer.

#### Cifras animadas

`useContador` interpola una cifra hasta su nuevo valor. Se usa **solo donde el
número es el resultado de la acción del usuario** — el monto total de la
selección de facturas. El barrido de dígitos es lo que conecta "marqué esta
factura" con "el total subió". En cifras que solo se leen (saldos, cupos) sería
ruido, y peor: una cifra en movimiento no se puede leer mientras se mueve.

#### Movimiento reducido

Dos capas cubren `prefers-reduced-motion`: `MotionConfig reducedMotion="user"`
en el layout raíz para los componentes de Motion, y una regla global en
globals.css para las transiciones y animaciones CSS. Esta última usa `0.01ms` y
no `none` a propósito: a duración cero la transición sigue disparando
`transitionend`, y hay lógica que espera ese evento.

---

## 4. Navegación

Los 5 módulos del sidebar, en el orden del Core Base Layout:

| # | Icono | Módulo | Ruta |
|---|---|---|---|
| 1 | `operaciones` | Operaciones | `/` |
| 2 | `flex` | Crédito FLEX | `/flex` |
| 3 | `factoring` | **Factoring** | `/factoring` |
| 4 | `tarjeta` | Tarjeta de crédito | `/tarjeta` |
| 5 | `tutoriales` | Tutoriales | `/tutoriales` |

**Operaciones es la raíz** (`/`): funciona como el tablero de la empresa.
**Crédito Pyme no está en el sidebar** a propósito — se solicita desde el
catálogo del inicio, no tiene pantalla de módulo todavía.

### Footer del sidebar

Tres piezas, y ninguna es decorativa:

1. **Último inicio de sesión** — señal de seguridad para banca empresarial.
2. **"Kapital es Corresponsal Digital de Banco Cooperativo Coopcentral"** —
   obligación regulatoria de cara al cliente. **No removerla** al reacomodar.
3. **Powered by Redem Tech** — atribución del proveedor tecnológico.

---

## 5. Pantallas

### 5.1 `/` — Operaciones

Tablero de entrada. Responde "¿cómo está mi empresa hoy?" y "¿qué más puedo
contratar?".

1. **Cupos** — Crédito Pyme y Crédito FLEX, con disponible, barra de uso y tasa E.A.
2. **Banner de Factoring** — cartera en RADIAN, con la oferta concreta.
3. **Productos para tu empresa** — los 4 productos, con estado de contratación.
4. **Últimos movimientos** — tabla compacta de la operación reciente.

### 5.2 `/factoring` — Factoring

Implementación del nodo `2090:3857`. **Layout espejado** respecto a México: la
pieza visual va a la izquierda (492px) y el copy a la derecha (410px), con 71px
de separación.

**Es una máquina de estados.** El mismo layout cambia mensaje y acción según en
qué punto va la solicitud:

| Estado | Mensaje | Acción |
|---|---|---|
| `sin_solicitar` | "Recibe tu dinero sin esperar los plazos de pago." | Solicitar Factoring |
| `en_revision` | "Tu solicitud está en estudio." | Contacto |
| `pendiente_firma` | "Tu solicitud está lista para firmar" | Contacto |
| `rechazada` | "No pudimos aprobar tu solicitud." | Ver otros productos |
| `activo` | "Tu línea de Factoring está activa." | Cargar facturas |

**Pieza visual.** Tarjeta texturizada de 426×540 (base plana + wash de luz al
25 % + grano en `mix-blend-hard-light`) con el tablero de facturas y una barra
de selección flotante encima. Tanto el tablero (465px) como la barra (492px)
**exceden el ancho de la tarjeta** a propósito: por eso el recorte vive solo en
la capa de texturas y no en el contenedor.

La barra flotante va como DOM y no como parte de la imagen porque en el producto
real es interactiva (Facturas · Clientes · Monto total · Descargar · Cancelar ·
Cobrar).

### 5.3 `/factoring/solicitud` — Flujo de solicitud

Cuatro pasos, cada uno en su propia ruta para que sea deep-linkable y el botón
"atrás" del navegador funcione.

| # | Ruta | Qué resuelve |
|---|---|---|
| 1 | `/empresa` | Verificar datos precargados y completar los faltantes |
| 2 | `/representante-legal` | Quién firma en nombre de la empresa |
| 3 | `/confirmacion` | Revisión antes de enviar a estudio |
| 4 | `/terminos` | Autorizaciones de ley y radicado |

**Vive en su propio route group** (`src/app/(solicitud)/`) para poder reemplazar
el shell del portal: durante el flujo el sidebar deja de ser navegación de
módulos y pasa a ser el **indicador de progreso vertical**. Sacar los módulos es
deliberado — es un flujo, y salirse a medias tiene un costo.

**Guarda de navegación.** Entrar por URL a un paso sin cumplir los anteriores
redirige al primero que falte (`redireccionPara()`). Sin esto, `/confirmacion`
en frío renderizaría un resumen vacío.

**El stepper no es clickeable.** Cada paso depende del anterior; un stepper
navegable invita a saltar a estados que el borrador no soporta.

**Estado final:** la solicitud queda radicada y la pelota pasa al representante
legal, que firma desde su correo. Espeja el estado `pendiente_firma` de §5.2.

### 5.4 `/factoring` con la línea activa — Dashboard

Cuando `estadoFactoring === "activo"` la misma ruta deja de vender el producto y
pasa a operarlo: misma cabecera, contenido completamente distinto. Implementa el
nodo `1.1_Dashboard [Full]`.

**Fila superior** — una sola tarjeta partida por un divisor vertical, no dos
tarjetas: la gráfica y el ranking son dos lecturas del mismo periodo.

- **Facturas negociadas** — monto del último mes en Display S (32px), variación
  contra el mes anterior en `positive`, y la gráfica de barras.
- **Proveedores** — ranking de pagadores por monto, con enlace a "Ver todos".

**Fila inferior — Facturas**

- Acciones de carga: *Cargar facturas manual* · *Cargar facturas DIAN*.
- Pestañas con contador en chip de color: Por cobrar (`info-soft`), Pendientes
  (`warning-soft`), Aprobadas (`success-soft`), Rechazadas (`neutral-soft`).
- Columnas: cliente, NIT, Emisión, Vencimiento, Monto total, Acciones. Emisión y
  Vencimiento son ordenables de verdad — la flecha del diseño lo promete.
- **Barra de selección** pegada al borde inferior (`sticky`) mientras haya
  facturas marcadas: la decisión de cobrar se toma mirando el total, y ese total
  tiene que seguir visible al recorrer una tabla larga.
- Cambiar de pestaña **limpia la selección**: cobrar mezclando estados no aplica.

#### La gráfica

Cada barra es un **carril rayado** (el cupo mensual disponible) con un relleno
sólido proporcional a lo negociado. El rayado no es decorativo: comunica cuánto
cupo quedó sin usar ese mes. Por eso la barra más alta llena ~54 % de su carril.

Se dibuja con un `<pattern>` SVG y no con los seis SVG que exporta Figma, para
que la trama sea independiente del ancho de la barra y el layout pueda ser
fluido. Carril de 54px y barras de 68px, tomados del nodo `2090:10021`.

**Hover** (nodo `2090:10600`). Al apuntar una barra aparece un tooltip oscuro
(`ink`, radio 8px, Body S) con el mes y año, las facturas vendidas y el monto
total en precisión exacta. Además:

- Junto a "Monto facturas vendidas" se rotula el mes de la **cifra grande**. Sin
  ese rótulo la cifra grande y la del tooltip se confunden, porque son meses
  distintos: la grande es siempre el último mes, el tooltip el mes apuntado.
- La etiqueta del eje pasa a tinta plena y el relleno baja a 80 % de opacidad.
- Cada carril es un `<button>`, no un `<div>`: el tooltip se alcanza con teclado
  (`focus`), no solo con puntero.

> **Corrección respecto al mockup:** el diseño muestra "+20.1 %" junto a unas
> barras cuya proporción real da +45 %. La variación se **calcula** desde la
> serie (`monto / anterior − 1`); un porcentaje escrito a mano al lado de una
> gráfica es una inconsistencia esperando a pasar. El dato de agosto se ajustó
> para que ambos coincidan.

#### El filtro le cede la pantalla a la tabla

Al abrir el filtro (nodos `1.6.1`, `1.6.2`) el resumen superior —gráfica y
proveedores— **se retira** y la tabla ocupa todo el alto. No es un efecto: es la
razón de ser del estado. Filtrar es una tarea de lectura detallada, y dejar el
resumen ocupando media pantalla obligaría a desplazarse para ver el efecto de
cada filtro sobre las filas, que es justamente lo que se está evaluando.

El botón cambia de "Filtrar" a "Cerrar" con una ✕, y aparecen tres campos:

| Campo | Control |
|---|---|
| Emisión | Rango de fechas con calendario propio |
| Vencimiento | Rango de fechas con calendario propio |
| Buscar por | Texto libre sobre cliente o NIT |

**Calendario propio y no dos `<input type="date">`:** un rango se elige mirando
el mes completo, y dos campos nativos separados obligan a razonar la relación
entre extremos sin verla. El panel usa `bg/04` sobre fondo oscuro, con el rango
en `ui/02` y los días de meses vecinos en `ui/03`.

Detalles de comportamiento que el mockup no cubre pero el control necesita:

- Si el segundo clic cae **antes** del primero, los extremos se **invierten** en
  vez de rechazar el clic.
- El panel se cierra al hacer clic fuera o con `Escape`. Un panel flotante que
  solo se cierra con su propio botón atrapa al usuario.
- Con filtros activos y cero resultados aparece un enlace de **Limpiar filtros**:
  sin él, un rango mal elegido deja la tabla vacía sin salida evidente.

#### Dos precisiones de moneda

`formatCOP()` (sin centavos) para cifras de tablero; `formatCOPExacto()` (con
centavos) para importes de línea. Un renglón de factura sí lleva centavos: es el
valor exacto que se cede, no una cifra de resumen. El mockup usa las dos.

### 5.5 Tabla responsive

Una tabla de facturas existe para **comparar filas** — ver de un vistazo qué
monto vence antes. Cualquier estrategia que rompa esa comparación destruye lo
que hace útil a la tabla. Eso descarta dos caminos habituales:

| Estrategia | Por qué no aquí |
|---|---|
| Scroll horizontal como solución principal | Esconde columnas fuera de vista; el usuario compara montos sin ver de quién son. |
| Colapsar cada fila a una tarjeta | Legible en móvil, pero elimina justamente la comparación entre filas. |

**Lo que hacemos: priorizar y reubicar.** Las columnas se ordenan por su peso en
la decisión de ceder una factura, y al angostarse las secundarias no se
esconden — **bajan como segunda línea dentro de la celda que las contextualiza**.

Jerarquía, de más a menos decisiva:

1. **Selección** — la casilla
2. **Monto total** — la cifra que decide
3. **Cliente** — quién paga
4. **Vencimiento** — cuándo, y por lo tanto cuánto cuesta el anticipo
5. **Emisión** — contexto
6. **NIT** — identificador secundario; el nombre ya identifica

| Ancho | Columnas propias | Reubicado |
|---|---|---|
| ≥ 1280px | todas | — |
| 1024–1279px | sin Emisión | *Emitida 10 may 2026* bajo Vencimiento |
| < 1024px | sin Emisión ni NIT | NIT bajo el nombre del cliente |
| < 640px | — | `overflow-x-auto` con `min-w-[640px]` |

El scroll horizontal queda solo como **piso**, no como estrategia: por debajo de
~640px comprimir más volvería ilegibles las cifras.

**El shell también cede.** Por debajo de `lg` (1024px) el sidebar de 220px se
sale de la pantalla y vuelve como panel desde un botón de menú en el header —
a 480px ocupaba media ventana y dejaba el contenido en una franja inservible.
Cualquier navegación cierra el panel: en móvil tapa el contenido, así que
dejarlo abierto escondería el destino. El saludo "Hola, {empresa}" también
desaparece por debajo de `md`: identifica la sesión, no la tarea.

### 5.6 `/factoring/operaciones/[id]` — Detalle de operación

Implementa los nodos `[E] 1.6 Detalle Operación`. Una **operación** agrupa las
facturas cedidas en un mismo movimiento; no es lo mismo que una factura.

La pantalla es una sola para todos los estados: **lo que cambia es qué se
muestra**, no el layout.

| Estado | Insignia | Renglón "Proceso" | "Ver comprobante" | Extra |
|---|---|---|---|---|
| `pendiente` | ámbar (`warning-soft`) | oculto | oculto | — |
| `aprobada` | verde (`badge-success`) | visible | solo si finalizada | — |
| `rechazada` | gris (`neutral-soft`) | oculto | oculto | motivo del rechazo |

**El "Proceso" desaparece, no se vacía.** Mientras la operación está en estudio
no hay desembolso que reportar; mostrar el renglón con un guion sugeriría que
falta un dato cuando lo que pasa es que aún no existe. Sus tres fases son
*Aprobada en Kapital* → *En desembolso* → *Finalizada*.

**El comprobante solo aparece al finalizar.** Ofrecerlo antes llevaría a un
documento que todavía no se generó.

**Facturas en revisión dentro de una operación resuelta.** Una operación puede
estar aprobada con alguna factura aún sin resolver: esas se muestran atenuadas,
con su descarga deshabilitada, y **no suman a los totales**. Cuando hay alguna,
un rótulo lo dice explícitamente — si no, los totales parecerían mal sumados.

> **Corrección respecto al mockup:** los totales del encabezado
> ($400.000.000 − $200.000.000 = $392.000.000) no cuadran entre sí ni con la
> tabla de abajo. `totalesOperacion()` los deriva de las facturas, de modo que
> el resumen y el detalle no puedan contradecirse.

**Enlace desde la tabla de facturas.** El `⋮` de cada fila lleva a la operación
que la contiene. Una factura *por cobrar* todavía no se ha cedido, así que no
tiene operación: ahí el `⋮` se atenúa en lugar de ser un enlace muerto.

### 5.7 `/factoring/cobro` — Cobrar facturas

Board *Cobro de facturas* (`2094:10662`). Empieza donde termina el tablero: se
marcan facturas, se pulsa **Cobrar**, y a partir de ahí la operación se revisa,
se confirma y se firma.

| # | Ruta | Nodo | Qué resuelve |
|---|---|---|---|
| 1 | `/cobro` | `3.0` | Revisar lo que RADIAN validó y quitar lo que no se quiera ceder |
| 2 | `/cobro/resumen` | `4.0` | Desglose por factura y confirmación |
| — | panel sobre el resumen | `5.0/5.1` | Código de un solo uso al celular |
| 3 | `/cobro/comprobante` | `6.0` | Comprobante de la operación |

**La selección viaja en la URL** (`?facturas=d-01,d-03`). El flujo se puede
recargar y compartir entre pestañas sin perder lo elegido.

#### El costo se congela al entrar

Los días al vencimiento —y por lo tanto el descuento— se calculan **una sola
vez**, al montar el flujo. Si se recalcularan en cada render, cruzar la
medianoche a mitad del proceso cambiaría el importe que el usuario ya vio y
aceptó. `hoy` llega del servidor en `America/Bogota`, igual que en la solicitud.

#### Modelo de costo

El cliente ve dos cobros distintos, y por eso se muestran separados:

```
comisión   = monto × 1,4 %              ← fija, por operación
descuento  = monto × 2,4 % × (días/30)  ← financiero, según plazo
recibe     = monto − comisión − descuento
```

> **Corrección respecto al mockup:** la misma factura aparece con 4 %, 20 % y
> 22 % de descuento en distintos frames, y "Número de facturas: 4" sobre una
> tabla de 3 filas. Todo se deriva de las facturas seleccionadas.

#### Detalles de comportamiento

- **Quitar la última factura sale del flujo.** Una pantalla de cobro sin nada
  que cobrar no tiene objeto: se vuelve al tablero.
- **El panel de OTP se monta y desmonta**, no se esconde. Un código a medio
  escribir de un intento anterior no sobrevive a un cierre.
- **Pegar el código completo llena las seis casillas** de una vez, que es como
  llega desde el SMS en la mayoría de teclados móviles. `Backspace` sobre una
  casilla vacía se lleva la anterior.
- **El radicado del comprobante se deriva de las facturas**, no de la hora: la
  misma operación recargada muestra el mismo número, o dejaría de servir como
  referencia.
- Las migas acumulan los pasos (*Factoring › Información de facturas ›
  Resumen*) para poder volver a revisar sin perder la selección.

---

## 6. Stack técnico

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Server Components para tablas pesadas, route groups para separar shells, middleware para sesión. |
| Lenguaje | **TypeScript** (strict) | Contratos de datos financieros sin ambigüedad. |
| Estilos | **Tailwind CSS v4** | El `@theme` de v4 *es* un sistema de tokens: mapea 1:1 con las variables de Figma. |
| Fuente | `next/font/google` (Onest) | Auto-hospedada, sin CLS, sin request externo. |
| Formato | `Intl` es-CO | Moneda COP, fechas y NIT nativos, sin dependencias. |
| Movimiento | **Motion** (`motion/react`) + CSS | Layout compartido (`layoutId`) y salidas coordinadas que CSS no puede hacer; el resto va en CSS. Ver §3.7. |

**Sin librería de componentes.** El diseño es suficientemente propio como para
que una librería genérica estorbe más de lo que ayuda.

### Estructura

```
src/
├── app/
│   ├── layout.tsx                  # Root: fuentes, metadata, lang="es-CO"
│   ├── globals.css                 # Tokens + @theme
│   ├── (portal)/                   # Shell con sidebar de módulos
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Operaciones
│   │   └── factoring/page.tsx
│   └── (solicitud)/                # Shell con sidebar de progreso
│       └── factoring/solicitud/
│           ├── layout.tsx
│           ├── empresa/
│           ├── representante-legal/
│           ├── confirmacion/
│           └── terminos/
├── components/
│   ├── icons.tsx                   # Iconos exportados de Figma
│   ├── motion-provider.tsx         # MotionConfig raíz (movimiento reducido)
│   ├── layout/{sidebar,header}.tsx
│   ├── factoring/{solicitud-context,solicitud-shell}.tsx
│   └── ui/{button,card,field,metric}.tsx
├── lib/
│   ├── factoring.ts                # Dominio: condiciones, pasos, catálogos
│   ├── format.ts                   # COP, fechas es-CO, NIT + DV
│   ├── motion.ts                   # Curvas, duraciones y variantes — §3.7
│   ├── use-contador.ts             # Interpolación de cifras — §3.7
│   └── nav.ts
└── data/{mock,facturas}.ts         # Datos de ejemplo (reemplazar por API)
```

---

## 7. Convenciones

- **Idioma:** toda la UI en español de Colombia. `lang="es-CO"`.
- **Moneda:** siempre vía `formatCOP()` / `formatCOPCompact()`. El peso
  colombiano se muestra **sin decimales** y con **punto** como separador de
  miles: `$ 200.000.000`.
- **Cifras grandes en millones.** `Intl` con notación compacta devuelve
  `$1450 M` sin separador, ilegible de un vistazo. `formatCOPCompact()` produce
  `$ 1.450 M`, que es como se habla en Colombia.
- **Fechas:** `formatFecha()` produce `10 ago 2025`. `Intl` en es-CO devuelve
  "10 de ago de 2025"; el diseño usa la forma compacta, así que se arma desde
  las partes.
- **Fechas sin hora son días de calendario.** `new Date("2026-08-14")` se
  interpreta como medianoche UTC y en Colombia (UTC-5) imprime el día anterior.
  `formatFecha()` ya lo resuelve construyendo la fecha en zona local — usarlo
  siempre, nunca `new Date()` suelto.
- **NIT:** siempre vía `formatNIT()` → `901.234.567-7`. El dígito de
  verificación se calcula con `calcularDV()`, que implementa el algoritmo de la
  DIAN (pesos 3,7,13,17,19,23,29,37,41,43,47,53,59,67,71 de derecha a
  izquierda; `DV = residuo > 1 ? 11 - residuo : residuo`). Permite validar en el
  cliente antes de mandar la solicitud a underwriting.
- **Variantes sobre overrides.** Para cambiar color o forma de un componente se
  agrega una variante, no se pasa una clase por `className`. Dos utilidades
  Tailwind del mismo grupo (`rounded-pill` vs `rounded-nav`, `text-ink` vs
  `text-ink-inverse`) tienen la misma especificidad y gana la del orden del
  stylesheet, no la del atributo: el resultado es aleatorio. Este bug ya
  apareció dos veces — de ahí `variant` y `shape` en `Button`.
- **Server Components por defecto.** `"use client"` solo donde haya estado o
  eventos.
- **Tokens sobre valores.** Un hex en un `.tsx` es un bug.
- **Los datos mock viven en `src/data/`,** nunca inline en un componente.

---

## 8. Seguridad

- **El portal nunca captura credenciales de terceros.** La conexión con la DIAN
  se hace por el conector oficial, no pidiendo usuario y contraseña de la DIAN
  en un formulario propio. Cualquier rediseño que agregue ese campo es un bug de
  seguridad, no una mejora de UX.
- **No se capturan números de cuenta nuevos.** El desembolso se hace a cuentas
  ya vinculadas y verificadas, que se seleccionan.
- **Las autorizaciones de ley son explícitas y separadas:** tratamiento de datos
  (Ley 1581 de 2012) y consulta en centrales de riesgo (Ley 1266 de 2008) son
  dos casillas distintas, no una sola. Agruparlas invalida el consentimiento.

---

## 9. Pendientes

- [ ] Instalar TT Interfaces con licencia en `public/fonts/`
- [x] Flujo de solicitud de Factoring — 4 pasos, con guarda de navegación
- [ ] Persistir el borrador de la solicitud (hoy se pierde al recargar)
- [ ] Conector real con RADIAN/DIAN y carga manual de facturas
- [x] Tablero de Factoring activo — gráfica, proveedores y tabla con selección
- [x] Panel de filtros con rangos de Emisión/Vencimiento y búsqueda
- [x] Colapsar el sidebar por debajo de `lg` — panel con velo desde el header
- [ ] Modal de detalle de factura (`1.6.3 Ver factura`)
- [x] Detalle de operación por estado (`1.6 Detalle Operación`)
- [ ] Generación real del comprobante PDF
- [x] Flujo de cobro completo — validación, resumen, OTP y comprobante
- [ ] Envío real del OTP y verificación en backend
- [ ] Estados vacíos por pestaña (`1.5 Pendientes [Dashboard / Empty]`)
- [ ] Firma electrónica del representante legal
- [ ] Pantallas de los otros 3 productos (FLEX, Pyme, Tarjeta AMEX)
- [ ] Estados de error de carga de archivos (`ERROR [CARGA]`, `[FORMATO]`, `[PESO ARCHIVO]`)
- [ ] Overlay "Salir del proceso" al abandonar la solicitud a medias
- [ ] Autenticación y middleware de sesión
- [ ] Auditoría de accesibilidad (contraste de `ink-tertiary`, focus visible)
- [ ] Responsive: el diseño es desktop-first, definir breakpoint de tablet

---

## 10. Bitácora de decisiones

| Fecha | Decisión | Razón |
|---|---|---|
| 2026-08-15 | Next.js sobre React SPA | Portal con datos sensibles y tablas grandes: SSR + middleware de sesión son requisito, no lujo. |
| 2026-08-15 | Tailwind v4 sin librería de componentes | `@theme` mapea directo a los tokens de Figma; una librería genérica pelearía con el diseño propio. |
| 2026-08-15 | Iconos inline en vez de `<img>` | Los del diseño traen `stroke` hardcodeado; inline con `currentColor` permite estados activo/inactivo. |
| 2026-08-15 | Onest como fallback de TT Interfaces | Match geométrico más cercano en Google Fonts; TT Interfaces es de licencia comercial. |
| 2026-08-15 | Una ruta por paso del wizard | Deep-linking, botón atrás del navegador y, más adelante, retomar un borrador desde un correo. |
| 2026-08-15 | **Pivote de México a Colombia** | Otro mercado, otra mecánica: DIAN/RADIAN en vez de SAT/CFDI, NIT en vez de RFC, COP, y 4 productos distintos. |
| 2026-08-15 | La solicitud es onboarding, no selección de facturas | En Colombia la empresa se vincula y pasa a estudio **antes** de poder negociar. El selector de facturas viene después de la aprobación. |
| 2026-08-15 | Route group propio para la solicitud | Durante el flujo el sidebar cambia de función (progreso, no navegación); un route group permite reemplazar el shell sin condicionales en el layout. |
| 2026-08-15 | No desglosar aforo y descuento | Kapital Colombia publica "hasta el 90 %" sin desglose. Modelar un desglose sería inventar precisión que el producto no comunica. |
| 2026-08-15 | `shape` como variante de `Button` | El override por `className` perdía contra la clase base por orden de stylesheet. Segundo caso del mismo bug: ahora color y forma son variantes. |
| 2026-08-15 | `/factoring` se bifurca por estado en vez de tener ruta aparte | El diseño usa la misma cabecera "Factoring" para el hero y el tablero; son el mismo módulo en dos momentos, no dos destinos. |
| 2026-08-15 | La variación del periodo se calcula, no se escribe | El mockup mostraba "+20.1 %" junto a barras que daban +45 %. Un porcentaje hardcodeado al lado de una gráfica se desincroniza al primer cambio de datos. |
| 2026-08-15 | Gráfica con `<pattern>` SVG en vez de los 6 SVG exportados | La trama queda independiente del ancho de barra y el layout puede ser fluido. |
| 2026-08-15 | Dos precisiones de moneda | Cifras de tablero sin centavos, importes de línea con centavos. El mockup usa ambas y la distinción es real: un renglón de factura es el valor exacto que se cede. |
| 2026-08-15 | El filtro retira el resumen superior | Filtrar es lectura detallada; con el resumen ocupando media pantalla habría que desplazarse para ver el efecto de cada filtro sobre las filas. |
| 2026-08-15 | Calendario propio en vez de `<input type="date">` | Un rango se elige mirando el mes completo; dos campos nativos obligan a razonar la relación entre extremos sin verla. |
| 2026-08-15 | Responsive por priorización + reubicación, no por tarjetas | Una tabla de facturas existe para comparar filas; colapsarlas a tarjetas destruye esa comparación. Las columnas secundarias bajan como segunda línea en vez de esconderse. |
| 2026-08-16 | La selección del cobro viaja en la URL | El flujo se recarga y se comparte sin perderla; el estado derivado (costos) se calcula una vez y se congela. |
| 2026-08-16 | El costo se congela al entrar al cobro | Recalcular por render haría que cruzar la medianoche cambiara el importe que el usuario ya aceptó. |
| 2026-08-16 | El sidebar colapsa a panel bajo `lg` | A 480px un sidebar fijo de 220px ocupaba media ventana; era el bloqueador real de móvil, no la tabla. |
| 2026-08-16 | Motion para el movimiento, CSS para las entradas | El `initial` de Motion se serializa en el HTML del servidor: una tabla de facturas con variantes llegaría en `opacity: 0` y no se leería una cifra hasta hidratar. CSS corre con la hoja de estilos y siempre termina. Motion se queda con lo que CSS no puede: `layoutId`, salidas coordinadas, gestos. Ver §3.7. |
| 2026-08-16 | Indicadores activos como nodo compartido | Pestañas, módulo del sidebar y paso de la solicitud usan un único nodo con `layoutId`. El recorrido comunica "cambiaste de vista sobre lo mismo"; apagar y encender no comunica nada. |
| 2026-08-16 | Cifras animadas solo si son resultado de una acción | El total de la selección se interpola porque el barrido conecta el clic con el efecto. Saldos y cupos no: una cifra en movimiento no se puede leer mientras se mueve. |
