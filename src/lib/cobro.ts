/**
 * Cobro de facturas — el flujo que convierte una selección de facturas
 * validadas en RADIAN en un desembolso. Ver DESIGN.md §5.7
 *
 * Arranca donde termina el tablero: el usuario marca facturas, pulsa "Cobrar",
 * y a partir de ahí revisa, confirma y firma con un código de un solo uso.
 */

import type { FacturaDashboard } from "@/data/negociadas";
import { diasAlVencimiento } from "@/lib/factoring";

/**
 * Condiciones de la operación de cobro.
 *
 * El costo tiene dos componentes que el cliente ve por separado: una comisión
 * fija sobre el monto y un descuento financiero que depende de los días que
 * falten para el vencimiento. Los importes del mockup no son consistentes entre
 * sí (la misma factura aparece con 4 %, 20 % y 22 % de descuento), así que se
 * calculan.
 */
export const CONDICIONES_COBRO = {
  /** Comisión por operación, sobre el monto de cada factura */
  comision: 0.014,
  /** Tasa de descuento mes vencido */
  tasaMensual: 0.024,
  /** Vigencia del código de validación, en segundos */
  vigenciaOtpSegundos: 299,
  /** Longitud del código de un solo uso */
  digitosOtp: 6,
} as const;

export type FacturaCobro = {
  id: string;
  pagador: string;
  nit: string;
  numero: string;
  vencimiento: string;
  /** Días entre hoy y el vencimiento, congelados al iniciar el cobro */
  diasFinanciar: number;
  monto: number;
  comision: number;
  descuentoFinanciero: number;
  descuentoTotal: number;
  montoARecibir: number;
};

/**
 * Calcula el costo de anticipar una factura.
 *
 * `hoy` entra por parámetro y no se lee dentro: los días al vencimiento tienen
 * que quedar congelados al iniciar el cobro, o el importe cambiaría solo por
 * cruzar la medianoche a mitad del flujo.
 */
export function prepararFactura(
  factura: FacturaDashboard,
  numero: string,
  hoy: Date,
): FacturaCobro {
  const dias = diasAlVencimiento(
    { fechaVencimiento: factura.vencimiento } as never,
    hoy,
  );

  const comision = factura.monto * CONDICIONES_COBRO.comision;
  const descuentoFinanciero =
    factura.monto * CONDICIONES_COBRO.tasaMensual * (dias / 30);
  const descuentoTotal = comision + descuentoFinanciero;

  return {
    id: factura.id,
    pagador: factura.cliente,
    nit: factura.nit,
    numero,
    vencimiento: factura.vencimiento,
    diasFinanciar: dias,
    monto: factura.monto,
    comision,
    descuentoFinanciero,
    descuentoTotal,
    montoARecibir: factura.monto - descuentoTotal,
  };
}

export function totalesCobro(facturas: FacturaCobro[]) {
  const montoTotal = facturas.reduce((s, f) => s + f.monto, 0);
  const descuentoTotal = facturas.reduce((s, f) => s + f.descuentoTotal, 0);

  return {
    numeroFacturas: facturas.length,
    pagadores: new Set(facturas.map((f) => f.nit)).size,
    montoTotal,
    descuentoTotal,
    montoARecibir: montoTotal - descuentoTotal,
  };
}

/* -------------------------------------------------------------------------- */

export const PASOS_COBRO = [
  { slug: "", titulo: "Información de facturas" },
  { slug: "resumen", titulo: "Resumen" },
  { slug: "comprobante", titulo: "Comprobante" },
] as const;

export const RUTA_COBRO = "/factoring/cobro";

/** Enmascara un celular dejando visibles los últimos 4 dígitos. */
export const enmascararCelular = (celular: string) =>
  `*****${celular.slice(-4)}`;

/** 04:59 */
export function formatCuentaRegresiva(segundos: number): string {
  const m = Math.floor(Math.max(segundos, 0) / 60);
  const s = Math.max(segundos, 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
