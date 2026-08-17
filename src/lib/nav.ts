import type { IconName } from "@/components/icons";

export type NavItem = {
  icon: IconName;
  label: string;
  href: string;
};

/**
 * Los 5 módulos del sidebar del portal Colombia, en el orden del Core Base
 * Layout. "Operaciones" es la raíz: funciona como el tablero de la empresa.
 *
 * Crédito Pyme no aparece aquí a propósito — es un producto que se solicita
 * desde el catálogo del inicio, no un módulo con pantalla propia todavía.
 * Ver DESIGN.md §4.
 */
export const NAV_ITEMS: NavItem[] = [
  { icon: "operaciones", label: "Operaciones", href: "/" },
  { icon: "flex", label: "Crédito FLEX", href: "/flex" },
  { icon: "factoring", label: "Factoring", href: "/factoring" },
  { icon: "tarjeta", label: "Tarjeta de crédito", href: "/tarjeta" },
  { icon: "tutoriales", label: "Tutoriales", href: "/tutoriales" },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

/** Índice plano ruta → etiqueta, para que el header sepa cómo titularse. */
const TITULOS = new Map(NAV_ITEMS.map((i) => [i.href, i.label] as const));

/**
 * Toda pantalla del portal cuelga de un módulo del sidebar, así que el fallback
 * solo se alcanza desde `not-found.tsx`: una ruta que no pertenece a ningún
 * módulo. Titularla "Operaciones" mentiría sobre dónde está el usuario.
 */
export function getPageTitle(pathname: string): string {
  return (
    TITULOS.get(pathname) ??
    [...TITULOS.entries()]
      .filter(([href]) => href !== "/" && pathname.startsWith(href))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    "Página no encontrada"
  );
}

export type Migaja = { label: string; href?: string };

/**
 * Pantallas que cuelgan de un módulo y necesitan migas de pan en vez de
 * título. Se declaran aquí y no en cada página para que el header sea la única
 * pieza que decide cómo titularse.
 */
const SUBRUTAS: { patron: RegExp; padre: string; label: string }[] = [
  {
    patron: /^\/factoring\/operaciones\/[^/]+$/,
    padre: "/factoring",
    label: "Detalle de operación",
  },
  {
    patron: /^\/factoring\/operaciones$/,
    padre: "/factoring",
    label: "Operaciones",
  },
  {
    patron: /^\/factoring\/cobro$/,
    padre: "/factoring",
    label: "Información de facturas",
  },
];

/**
 * El cobro es una secuencia, así que sus migas acumulan los pasos anteriores
 * en vez de mostrar solo el actual: el rastro es lo que dice cuánto falta y
 * permite volver a revisar sin perder la selección.
 */
const PASOS_COBRO_MIGAJAS: { patron: RegExp; label: string }[] = [
  { patron: /^\/factoring\/cobro\/resumen$/, label: "Resumen" },
  { patron: /^\/factoring\/cobro\/comprobante$/, label: "Comprobante" },
];

/** Devuelve las migas de pan de la ruta, o `null` si basta con el título. */
export function getMigajas(pathname: string): Migaja[] | null {
  const paso = PASOS_COBRO_MIGAJAS.find((p) => p.patron.test(pathname));
  if (paso) {
    return [
      { label: "Factoring", href: "/factoring" },
      { label: "Información de facturas", href: "/factoring/cobro" },
      { label: paso.label },
    ];
  }

  const sub = SUBRUTAS.find((s) => s.patron.test(pathname));
  if (!sub) return null;

  return [
    { label: getPageTitle(sub.padre), href: sub.padre },
    { label: sub.label },
  ];
}
