---
name: responsive-financiero
description: Reglas y patrones responsive obligatorios para el portal. Úsala SIEMPRE que se cree o modifique cualquier pantalla, componente, tabla, formulario, tarjeta, modal o layout — no solo cuando se mencione "responsive" o "móvil". Toda UI de este repositorio se entrega con su versión responsive en el mismo cambio; una pantalla que solo funciona en escritorio está incompleta. Cubre tablas de datos financieros, shells de navegación, barras de acción, formularios de solicitud, cifras monetarias, áreas táctiles y la verificación en los tres viewports.
---

# Responsive en el portal Kapital

Este portal muestra **dinero y obligaciones legales**. Eso cambia las reglas
respecto a un sitio de contenido: aquí una cifra cortada, un total escondido o
un botón de "Cobrar" a un pulgar de distancia del de "Cancelar" no son defectos
estéticos, son errores con consecuencia económica.

**La regla que engloba todo:** el responsive no es una fase posterior. Cada
componente o pantalla se entrega funcionando en los tres viewports en el mismo
cambio. Si un componente nuevo no declara su comportamiento móvil, está a medias.

## Antes de escribir código

Lee `DESIGN.md` §3.4 (layout base), §5.5 (tabla responsive) y §3.7 (movimiento).
Los tokens de layout (`w-sidebar`, `h-header`, `max-w-form`) ya existen: no
reinventes medidas.

## Breakpoints

Los de Tailwind por defecto. No añadir breakpoints nuevos sin una razón escrita.

| Prefijo | Desde | Qué cambia estructuralmente |
|---|---|---|
| *(base)* | 0 | **Móvil.** Una columna. Sidebar fuera de pantalla. Solo columnas de tabla esenciales. |
| `sm:` | 640px | Ajustes finos: drawers dejan de ser de ancho completo. |
| `md:` | 768px | Rejillas a 2 columnas. Botones dejan de ser de ancho completo. |
| `lg:` | 1024px | **Sidebar fijo visible.** Aparecen columnas secundarias de tabla. Padding de tarjeta a 40px. |
| `xl:` | 1280px | Canvas de referencia de Figma. Aparecen columnas terciarias y piezas decorativas. |

`lg` es el corte importante y no es arbitrario: el sidebar mide 220px, y por
debajo de 1024px deja al contenido en una franja demasiado estrecha para una
tabla de facturas.

**Mobile-first.** La clase sin prefijo es el estado móvil; los prefijos suman
hacia arriba. Nunca `hidden` + `lg:hidden` peleando entre sí.

## Reglas propias de UI financiera

Estas no se negocian por falta de espacio:

1. **Un importe nunca se oculta ni se corta.** Si no cabe, se reubica (ver
   patrón de tabla) o el contenedor se desplaza. Jamás `truncate` sobre una
   cifra, jamás `hidden` sobre la columna de monto.
2. **Los totales sobreviven al scroll.** Si una pantalla suma valores para que
   el usuario decida (cobrar, confirmar), el total va en una barra `sticky`.
   En móvil eso es más crítico, no menos: la lista es más larga en proporción.
3. **`tabular-nums` en toda cifra.** Sin ancho de dígito fijo, una columna de
   montos no se puede comparar de un vistazo.
4. **Precisión constante entre breakpoints.** No se abrevia a "$ 4,2 M" en móvil
   si en escritorio dice "$ 4.200.000,00". El usuario que revisa desde el
   celular toma la misma decisión que desde el escritorio.
5. **Áreas táctiles de 44px en acciones con consecuencia.** Cobrar, confirmar,
   descargar, marcar una factura. El *objetivo* táctil llega a 44px aunque el
   glifo mida 16px — se consigue con padding o con un pseudo-elemento, sin
   agrandar el diseño. Ver `.area-tactil` en globals.css.
6. **Acciones destructivas o irreversibles separadas.** En móvil, "Cancelar" y
   "Cobrar" no van pegados en la misma fila; se apilan con el confirmatorio
   abajo o se separan con espacio real.
7. **Nada crítico detrás de un hover.** El hover no existe en táctil. Si un dato
   solo aparece al pasar el cursor, en móvil no existe: hazlo visible o dale un
   estado de tap.
8. **Textos legales completos.** Los disclaimers (corresponsalía, Ley 1581, Ley
   1266) no se recortan ni se esconden tras un acordeón en móvil. Son una
   obligación de cara al cliente.

## Patrones por tipo de componente

### Tablas de datos — el caso más difícil

**La estrategia de este repo es reubicar, no esconder.** Al angostarse, una
columna secundaria no desaparece: baja como segunda línea dentro de la celda que
la contextualiza. Así la tabla se comprime sin perder ningún dato. Ver
DESIGN.md §5.5 y `tabla-facturas.tsx` como referencia.

```tsx
{/* La columna vive como celda propia en pantallas anchas... */}
<Encabezado className="hidden lg:table-cell">NIT</Encabezado>
...
<td className="hidden py-4 pr-4 ... lg:table-cell">{formatNIT(f.nit)}</td>

{/* ...y como segunda línea bajo el nombre del cliente cuando no cabe. */}
<td className="py-4 pr-4 ...">
  {f.cliente}
  <span className="mt-1 block text-body-s text-ink-tertiary lg:hidden">
    {formatNIT(f.nit)}
  </span>
</td>
```

Jerarquía de columnas, de la que nunca se va a la primera que cede:

1. **Siempre visible:** identificador (cliente), monto, y la casilla o acción.
2. **`lg:`** — el dato de identidad secundario (NIT, número de factura).
3. **`xl:`** — fechas y plazos secundarios (emisión cuando ya se ve vencimiento).

Debajo de eso, el piso es el desplazamiento horizontal, nunca la compresión:

```tsx
<div className="-mx-6 overflow-x-auto px-6">
  <table className="w-full min-w-[640px] border-collapse">
```

El `-mx-6 … px-6` sangra el contenedor hasta el borde de la tarjeta para que la
zona de desplazamiento llegue al filo de la pantalla, sin romper el padding.

> Una tabla que se convierte en tarjetas apiladas en móvil es un patrón válido
> en general, pero **no aquí**: el usuario compara filas entre sí (¿qué factura
> vence antes?, ¿cuál es la de mayor monto?), y las tarjetas destruyen esa
> comparación. Se mantiene la rejilla y se reubica.

### Shell y navegación

El sidebar de 220px se sale de pantalla por debajo de `lg` y vuelve como panel
deslizante con velo. Referencia: `components/layout/shell.tsx`.

- El panel usa `translate-x` (compositable), no `width` ni `display`.
- El velo es un `<button>` con `aria-label`, no un `<div>`: cerrarlo tiene que
  ser alcanzable con teclado.
- **Cualquier navegación cierra el panel.** En móvil el panel tapa el contenido;
  dejarlo abierto esconde el destino al que se acaba de llegar.
- El disparador vive en el header con `lg:hidden` y `aria-label`.
- Cerrar con `Escape` y bloquear el scroll del fondo mientras está abierto.

**Progreso de un flujo (solicitud):** el indicador vertical del sidebar no cabe
en móvil. No lo metas en el panel del hamburguesa — el progreso debe verse
**siempre**, es lo que dice cuánto falta. Se convierte en una barra horizontal
compacta bajo el header.

### Barras de acción flotantes

`sticky bottom-*` con los datos a la izquierda y las acciones a la derecha. En
móvil se apila: los datos arriba en fila desplazable, las acciones abajo a
ancho completo. El botón confirmatorio va al final.

Deja `pb-*` suficiente en el contenedor para que la barra no tape la última fila.

### Formularios

- Rejilla `grid gap-6 sm:grid-cols-2` — un campo por fila en móvil. Nunca dos
  campos de 48px lado a lado en 375px.
- Los campos ya son de 48px de alto: cumplen el área táctil mínima.
- El botón de avance: `w-full md:w-[220px]`. En móvil ocupa el ancho porque es
  la única acción de la pantalla.
- `inputMode` y `autoComplete` correctos: `inputMode="numeric"` en NIT, montos y
  OTP levanta el teclado numérico. Esto es responsive, no un extra.
- Etiquetas encima del campo, nunca al lado: al lado se rompen en móvil.

### Tarjetas y contenedores

Padding `p-6 lg:p-10`. Un padding de 40px en 375px deja 295px de contenido útil.

### Rejillas de tarjetas

`grid gap-6 md:grid-cols-2 xl:grid-cols-4`. Sin `lg:grid-cols-3` intermedio a
menos que el contenido lo pida: tres columnas entre 1024 y 1280 dejan tarjetas
más estrechas que dos.

### Capas flotantes (popovers, calendarios, tooltips)

Un panel de ancho fijo posicionado en `absolute left-0` se sale de la pantalla.

- Ancho: `w-full` con tope (`max-w-[328px]`), no ancho fijo.
- Considera anclar a la derecha (`right-0`) cuando el disparador está al final
  de una fila.
- Tooltips de gráfica: en táctil no hay hover. Si el dato importa, que también
  responda al tap.

### Modales y drawers

Ancho completo en móvil, ancho fijo desde `sm:`. Con `overflow-y-auto` y
`h-full` para que el teclado virtual no deje contenido inalcanzable.

```tsx
className="h-full w-full overflow-y-auto ... sm:w-[556px]"
```

### Gráficas

El contenedor es fluido (`flex-1` por barra), no un ancho calculado. Si la
gráfica pierde legibilidad por debajo de cierto ancho, reduce la cantidad de
puntos antes de encogerla — nunca la dejes ilegible.

Piezas puramente decorativas: `hidden xl:block`. No consumen datos ni atención
en móvil.

## Antipatrones

| No hagas | Por qué | Haz |
|---|---|---|
| `w-[492px]` sin `max-w-full` | Desborda y provoca scroll horizontal de página | `w-full max-w-[492px]` |
| `gap-[71px]` fijo entre columnas | En móvil son 71px de vacío | `gap-8 xl:gap-[71px]` |
| `whitespace-nowrap` en ambos lados de un `justify-between` | No hay dónde romper: desborda | `nowrap` solo en la cifra |
| Ocultar la columna de montos | Se pierde el dato que importa | Reubicar como segunda línea |
| `100vh` | En móvil ignora la barra del navegador | `100dvh` |
| Tabla → tarjetas apiladas | Impide comparar filas | Reubicar columnas |
| Dato crítico solo en `hover:` | No existe en táctil | Visible o con estado de tap |
| Breakpoint nuevo ad hoc | Rompe la coherencia del sistema | Los cinco de Tailwind |

## Verificación — obligatoria antes de cerrar

No se declara terminado sin esto. Los tres viewports:

| Viewport | Medida | Qué se comprueba |
|---|---|---|
| Móvil | 375×812 | Una columna, sin scroll horizontal, áreas táctiles, panel de navegación |
| Tablet | 768×1024 | Rejillas a 2 columnas, tabla desplazable, botones ya no a ancho completo |
| Escritorio | 1280×800 | Sidebar fijo, todas las columnas, fidelidad al nodo de Figma |

Con las herramientas del navegador (`resize_window` + `javascript_tool`):

```js
// Desborde horizontal de la página: debe dar 0 en los tres viewports.
(() => {
  const culpables = [...document.querySelectorAll('*')]
    .filter(el => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
    .map(el => `${el.tagName.toLowerCase()}.${el.className?.toString().slice(0, 60)}`);
  return JSON.stringify({
    scrollHorizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ancho: document.documentElement.clientWidth,
    culpables: [...new Set(culpables)].slice(0, 10),
  });
})()
```

Un contenedor con `overflow-x-auto` desplazándose es correcto y esperado — lo
que no puede pasar es que **la página entera** se desplace en horizontal.

```js
// Áreas táctiles por debajo de 44px en controles interactivos.
(() => {
  const chicos = [...document.querySelectorAll('button, a, input, select, [role=button]')]
    .map(el => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 0 && (r.height < 44 || r.width < 44))
    .map(({ el, r }) => `${el.tagName.toLowerCase()} ${Math.round(r.width)}×${Math.round(r.height)} · ${(el.ariaLabel || el.innerText || '').slice(0, 30)}`);
  return JSON.stringify(chicos.slice(0, 15), null, 1);
})()
```

Y siempre: `read_console_messages` sin errores, `npx tsc --noEmit`, `npx eslint
src --max-warnings=0`.

## Al terminar

Si el cambio introduce una decisión responsive que no estaba en este documento
—un patrón nuevo, un corte distinto, una excepción con razón—, **anótala en
DESIGN.md** (§5.5 o la sección de la pantalla) y en la bitácora de decisiones
§10. El repo trata DESIGN.md como fuente de verdad; una decisión que solo vive
en el código se pierde.
