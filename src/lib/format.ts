/**
 * Formatters de es-CO. Toda cifra, fecha o identificación de la UI pasa por
 * aquí: nunca concatenar strings a mano. Ver DESIGN.md §7.
 */

/**
 * El peso colombiano no se maneja en centavos en la operación diaria, así que
 * se muestra sin decimales: `$ 200.000.000`, con punto como separador de miles.
 */
const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});


/** "10 ago 2025" — el formato de las tablas de facturas del diseño. */
const FECHA_TABLA = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const FECHA_LARGA = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const PORCENTAJE = new Intl.NumberFormat("es-CO", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

/** $ 200.000.000 — cifras de resumen, sin centavos. */
export const formatCOP = (monto: number) => COP.format(monto);

const COP_EXACTO = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * $ 200.000.000,00 — importes de línea (facturas). Un renglón de factura sí
 * lleva centavos: es el valor exacto que se cede, no una cifra de tablero.
 */
export const formatCOPExacto = (monto: number) => COP_EXACTO.format(monto);

/**
 * $ 1.450 M — en Colombia las cifras grandes se hablan en millones, así que se
 * expresan así y no con la notación compacta de `Intl`, que devuelve "$1450 M"
 * sin separador de miles y resulta difícil de leer de un vistazo.
 */
export function formatCOPCompact(monto: number): string {
  const millones = monto / 1_000_000;
  if (Math.abs(millones) < 1) return COP.format(monto);

  const decimales = Math.abs(millones) < 100 ? 1 : 0;
  const cifra = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: decimales,
  }).format(millones);

  return `$ ${cifra} M`;
}

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * `new Date("2025-08-14")` se interpreta como medianoche **UTC** por spec, así
 * que en Colombia (UTC-5) se formatea como el día anterior. Una fecha sin hora
 * es un día de calendario, no un instante: se construye en zona local.
 */
function aFecha(valor: Date | string): Date {
  if (valor instanceof Date) return valor;
  if (!SOLO_FECHA.test(valor)) return new Date(valor);

  const [anio, mes, dia] = valor.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

/**
 * 10 ago 2025 — `Intl` en es-CO devuelve "10 de sept. de 2025": con
 * preposiciones, punto abreviador y un mes de cuatro letras que desalinea la
 * columna. El diseño usa día de dos dígitos y mes de tres letras, así que se
 * arma desde las partes.
 */
export function formatFecha(fecha: Date | string): string {
  const partes = FECHA_TABLA.formatToParts(aFecha(fecha));
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? "";

  const mes = parte("month").replace(".", "").slice(0, 3);
  return `${parte("day")} ${mes} ${parte("year")}`;
}

/** 10 de agosto de 2025 */
export const formatFechaLarga = (fecha: Date | string) =>
  FECHA_LARGA.format(aFecha(fecha));

/** 01-02-2024 17:21:15 — el sello de último inicio de sesión del sidebar. */
export function formatSelloSesion(fecha: Date | string): string {
  const d = aFecha(fecha);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  );
}

/** 0.185 → 18,5 % */
export const formatPorcentaje = (razon: number) => PORCENTAJE.format(razon);

/* -------------------------------------------------------------------------- */
/* NIT                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Pesos del algoritmo de dígito de verificación de la DIAN, aplicados de
 * derecha a izquierda sobre los dígitos del NIT.
 */
const PESOS_DV = [
  3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71,
] as const;

/**
 * Calcula el dígito de verificación de un NIT según el algoritmo de la DIAN.
 * Permite validar en el cliente antes de mandar la solicitud a underwriting.
 */
export function calcularDV(nit: string): number {
  const digitos = nit.replace(/\D/g, "");

  const suma = [...digitos]
    .reverse()
    .reduce((acc, d, i) => acc + Number(d) * PESOS_DV[i], 0);

  const residuo = suma % 11;
  return residuo > 1 ? 11 - residuo : residuo;
}

export const dvEsValido = (nit: string, dv: number | string) =>
  calcularDV(nit) === Number(dv);

/** 901.234.567-8 — NIT con separadores de miles y dígito de verificación. */
export function formatNIT(nit: string, dv?: number | string): string {
  const digitos = nit.replace(/\D/g, "");
  const conPuntos = digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const verificador = dv ?? calcularDV(digitos);
  return `${conPuntos}-${verificador}`;
}
