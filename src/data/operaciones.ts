/**
 * Operaciones de Factoring: cada una agrupa las facturas que se cedieron en un
 * mismo movimiento. Ver DESIGN.md §5.6
 */

/** Resolución del estudio de la operación. */
export type EstadoOperacion = "pendiente" | "aprobada" | "rechazada";

/**
 * Avance del desembolso. Solo existe una vez aprobada la operación: mientras
 * está en estudio no hay proceso que reportar, y por eso el renglón "Proceso"
 * desaparece de la pantalla en lugar de mostrarse vacío.
 */
export type ProcesoOperacion =
  | "aprobada_kapital"
  | "en_desembolso"
  | "finalizada";

export const ETIQUETA_PROCESO: Record<ProcesoOperacion, string> = {
  aprobada_kapital: "Aprobada en Kapital",
  en_desembolso: "En desembolso",
  finalizada: "Finalizada",
};

export type FacturaOperacion = {
  cliente: string;
  /** Folio del CFDI/factura electrónica, p. ej. SETP9000543210 */
  numero: string;
  diasFinanciar: number;
  /** Valor nominal de la factura cedida */
  montoNominal: number;
  descuento: number;
  /**
   * Una operación puede estar aprobada con alguna factura todavía en revisión.
   * Esas se muestran atenuadas y no suman a los totales.
   */
  resuelta: boolean;
};

export type Operacion = {
  id: string;
  estado: EstadoOperacion;
  proceso: ProcesoOperacion | null;
  fechaSolicitud: string;
  /** Cuenta de abono, con los últimos dígitos visibles */
  cuentaDesembolso: string;
  tiempoAnalisisHoras: number;
  facturas: FacturaOperacion[];
  /** Solo cuando `estado === "rechazada"` */
  motivoRechazo?: string;
};

/**
 * Totales derivados de las facturas resueltas.
 *
 * En el mockup los totales del encabezado ($400.000.000 − $200.000.000 =
 * $392.000.000) no cuadran entre sí ni con la tabla de abajo. Se calculan desde
 * las facturas para que el resumen y el detalle no puedan contradecirse.
 */
export function totalesOperacion(operacion: Operacion) {
  const computables = operacion.facturas.filter((f) => f.resuelta);

  const montoFacturas = computables.reduce((s, f) => s + f.montoNominal, 0);
  const descuentos = computables.reduce((s, f) => s + f.descuento, 0);

  return {
    numeroClientes: new Set(computables.map((f) => f.cliente)).size,
    numeroFacturas: computables.length,
    montoFacturas,
    descuentos,
    montoAFinanciar: montoFacturas - descuentos,
    /** Facturas todavía en revisión dentro de una operación ya resuelta */
    enRevision: operacion.facturas.length - computables.length,
  };
}

export const montoARecibir = (f: FacturaOperacion) =>
  f.montoNominal - f.descuento;

/* -------------------------------------------------------------------------- */

export const operaciones: Operacion[] = [
  {
    id: "op-2041",
    estado: "aprobada",
    proceso: "finalizada",
    fechaSolicitud: "2026-08-15",
    cuentaDesembolso: "Kapital • 1712",
    tiempoAnalisisHoras: 24,
    facturas: [
      {
        cliente: "Innovación Digital S.L.",
        numero: "SETP9000543210",
        diasFinanciar: 45,
        montoNominal: 325_000_000,
        descuento: 25_000_000,
        resuelta: true,
      },
      {
        cliente: "Innovación Digital S.L.",
        numero: "SETP9000234512",
        diasFinanciar: 28,
        montoNominal: 162_500_000,
        descuento: 12_500_000,
        resuelta: true,
      },
      {
        cliente: "Desarrollo Tecnológico Ltda",
        numero: "SETP9000789123",
        diasFinanciar: 60,
        montoNominal: 380_000_000,
        descuento: 30_000_000,
        resuelta: true,
      },
    ],
  },
  {
    id: "op-2042",
    estado: "aprobada",
    proceso: "en_desembolso",
    fechaSolicitud: "2026-08-18",
    cuentaDesembolso: "Kapital • 1712",
    tiempoAnalisisHoras: 24,
    facturas: [
      {
        cliente: "Distribuciones Andinas S.A.",
        numero: "SETP9000901233",
        diasFinanciar: 90,
        montoNominal: 430_000_000,
        descuento: 30_000_000,
        resuelta: true,
      },
      {
        cliente: "Tecnología Avanzada S.L.",
        numero: "SETP9000901234",
        diasFinanciar: 75,
        montoNominal: 372_000_000,
        descuento: 22_000_000,
        resuelta: true,
      },
    ],
  },
  {
    id: "op-2043",
    estado: "pendiente",
    proceso: null,
    fechaSolicitud: "2026-08-20",
    cuentaDesembolso: "Kapital • 1712",
    tiempoAnalisisHoras: 24,
    facturas: [
      {
        cliente: "Soluciones Ecológicas S.A.",
        numero: "SETP9001120045",
        diasFinanciar: 45,
        montoNominal: 300_000_000,
        descuento: 20_000_000,
        resuelta: true,
      },
      {
        cliente: "Servicios Globales Ltda.",
        numero: "SETP9001120046",
        diasFinanciar: 30,
        montoNominal: 160_000_000,
        descuento: 10_000_000,
        resuelta: false,
      },
    ],
  },
  {
    id: "op-2044",
    estado: "rechazada",
    proceso: null,
    fechaSolicitud: "2026-07-28",
    cuentaDesembolso: "Kapital • 1712",
    tiempoAnalisisHoras: 48,
    motivoRechazo:
      "El pagador supera el límite de concentración por cliente de tu línea. Puedes volver a presentar la operación con otro pagador.",
    facturas: [
      {
        cliente: "Servicios Globales Ltda.",
        numero: "SETP9000445511",
        diasFinanciar: 120,
        montoNominal: 165_000_000,
        descuento: 15_000_000,
        resuelta: true,
      },
    ],
  },
];

export const buscarOperacion = (id: string) =>
  operaciones.find((o) => o.id === id);
