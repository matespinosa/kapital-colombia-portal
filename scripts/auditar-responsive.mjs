/**
 * Auditoría responsive del portal.
 *
 *   npm run dev                              # en otra terminal
 *   npm run responsive -- http://localhost:3000
 *
 * Comprueba en móvil, tablet y escritorio lo que la revisión a ojo se salta:
 * desborde horizontal de la página, elementos que se salen del viewport y
 * objetivos táctiles por debajo de 44px. Ver
 * .claude/skills/responsive-financiero/SKILL.md
 *
 * Usa `playwright-core` con el Chrome ya instalado en la máquina: no descarga
 * navegadores. Si falla el arranque, es que no hay Chrome en el sistema.
 */
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:3000";

const VIEWPORTS = [
  { nombre: "móvil", width: 375, height: 812, tactil: true },
  { nombre: "tablet", width: 768, height: 1024, tactil: false },
  { nombre: "escritorio", width: 1280, height: 800, tactil: false },
];

/**
 * Rutas representativas de cada patrón de layout. Al añadir una pantalla con
 * una estructura nueva —no una variante de las de aquí—, añádela también.
 */
const RUTAS = [
  "/",
  "/factoring",
  "/factoring/operaciones",
  "/factoring/operaciones/op-2043",
  "/factoring/solicitud/empresa",
  "/factoring/solicitud/representante-legal",
  "/factoring/solicitud/confirmacion",
  "/factoring/solicitud/terminos",
  "/factoring/cobro?facturas=f-01,f-02",
  "/ruta-inexistente",
];

/** Corre dentro de la página. No puede cerrar sobre nada del módulo. */
const AUDITORIA = () => {
  const ancho = document.documentElement.clientWidth;

  /** Un desborde dentro de un contenedor desplazable es intencional. */
  const enScrollerHorizontal = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const ov = getComputedStyle(p).overflowX;
      if (ov === "auto" || ov === "scroll") return true;
    }
    return false;
  };

  const desbordan = [...document.querySelectorAll("body *")]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      return r.right > ancho + 1 && !enScrollerHorizontal(el);
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      const clase = (el.className?.toString() || "").slice(0, 55);
      return `${el.tagName.toLowerCase()} →${Math.round(r.right)}px · ${clase}`;
    });

  const tactilesChicos = [
    ...document.querySelectorAll("button, a, input, select, [role=button]"),
  ]
    .filter((el) => {
      // `.area-tactil` amplía la zona sensible con un ::after que no entra en
      // getBoundingClientRect, así que medirla daría un falso positivo.
      if (el.classList.contains("area-tactil")) return false;
      if (el.type === "hidden" || el.disabled) return false;
      // Elementos de visualización de datos (barras de gráfica): su tamaño lo
      // fija el dato, no la ergonomía, y no disparan ninguna acción — llevan
      // `cursor-default` justamente para decirlo.
      if (getComputedStyle(el).cursor === "default") return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44);
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      const etiqueta = (el.getAttribute("aria-label") || el.innerText || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 34);
      return `${el.tagName.toLowerCase()} ${Math.round(r.width)}×${Math.round(r.height)} · ${etiqueta}`;
    });

  return {
    scrollHorizontal: document.documentElement.scrollWidth > ancho + 1,
    scrollWidth: document.documentElement.scrollWidth,
    desbordan: [...new Set(desbordan)].slice(0, 6),
    tactilesChicos: [...new Set(tactilesChicos)].slice(0, 10),
  };
};

const navegador = await chromium.launch({ channel: "chrome" });
const errores = [];
let fallos = 0;

for (const vp of VIEWPORTS) {
  const ctx = await navegador.newContext({
    viewport: { width: vp.width, height: vp.height },
    hasTouch: vp.tactil,
    isMobile: vp.tactil,
  });
  const page = await ctx.newPage();
  const anotar = (t) => {
    // El 404 de la ruta inexistente es el comportamiento esperado de la prueba.
    if (t.includes("404")) return;
    errores.push(`${vp.nombre} · ${t.slice(0, 140)}`);
  };
  page.on("console", (m) => m.type() === "error" && anotar(m.text()));
  page.on("pageerror", (e) => anotar(e.message));

  console.log(`\n══ ${vp.nombre.toUpperCase()} ${vp.width}×${vp.height} ══`);

  for (const ruta of RUTAS) {
    await page.goto(BASE + ruta, { waitUntil: "networkidle" });
    await page.waitForTimeout(200);
    const r = await page.evaluate(AUDITORIA);

    const tactiles = vp.tactil ? r.tactilesChicos : [];
    const problemas = [
      r.scrollHorizontal && `scroll horizontal (${r.scrollWidth}px)`,
      r.desbordan.length && `desborde ×${r.desbordan.length}`,
      tactiles.length && `táctil ×${tactiles.length}`,
    ].filter(Boolean);

    if (problemas.length === 0) {
      console.log(`  ✓ ${ruta}`);
      continue;
    }

    fallos++;
    console.log(`  ✗ ${ruta} — ${problemas.join(", ")}`);
    r.desbordan.forEach((d) => console.log(`      desborda: ${d}`));
    tactiles.forEach((t) => console.log(`      táctil:   ${t}`));
  }

  await ctx.close();
}

await navegador.close();

if (errores.length) {
  console.log(`\n── Errores de consola (${errores.length}) ──`);
  [...new Set(errores)].slice(0, 10).forEach((e) => console.log("  " + e));
} else {
  console.log("\n── Sin errores de consola ──");
}

console.log(
  fallos === 0
    ? "\nRESULTADO: limpio\n"
    : `\nRESULTADO: ${fallos} combinaciones con problemas\n`,
);

process.exit(fallos === 0 ? 0 : 1);
