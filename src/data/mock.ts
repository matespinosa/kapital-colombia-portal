/**
 * Datos de ejemplo del portal Colombia. Aislados aquí a propósito: cuando
 * exista API real, cada export se reemplaza por un fetch sin tocar los
 * componentes. Ver DESIGN.md §7.
 */

import type { IconName } from "@/components/icons";

export type Empresa = {
  razonSocial: string;
  /** NIT sin dígito de verificación; el DV se calcula con `calcularDV()`. */
  nit: string;
  fechaConstitucion: string;
  municipio: string;
  direccion: string;
  codigoPostal: string;
  actividadEconomica: string;
  ultimoInicioSesion: string;
};

export const empresa: Empresa = {
  razonSocial: "Café Bogotano S.A",
  nit: "901234567",
  fechaConstitucion: "2020-04-10",
  municipio: "Bogotá D.C.",
  direccion: "Cll 162 a #5c 24",
  codigoPostal: "112222",
  actividadEconomica: "Agricultura",
  ultimoInicioSesion: "2026-08-14T17:21:15",
};

/**
 * Estado de la solicitud de Factoring. La pantalla de Factoring es una máquina
 * de estados: el mismo layout cambia copy y acción según en qué punto va la
 * empresa. Ver DESIGN.md §5.2
 */
export type EstadoFactoring =
  | "sin_solicitar"
  | "en_revision"
  | "pendiente_firma"
  | "rechazada"
  | "activo";

export const estadoFactoring: EstadoFactoring = "activo";

/** Correo del representante legal al que se envían los documentos a firmar. */
export const correoRepresentante = "ana.michelle@cafebogotano.co";

/** Celular al que llega el código de un solo uso que firma cada cobro. */
export const celularRepresentante = "3115553445";

/** Cuenta donde se abonan los desembolsos de Factoring. */
export const cuentaDesembolso = "Kapital • 1712";

/* -------------------------------------------------------------------------- */

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  detalle: string;
  href: string;
  icon: IconName;
  contratado: boolean;
  destacado?: boolean;
};

/**
 * Los cuatro productos de Kapital Colombia. La distribución real de la cartera
 * es Pyme 72,8 % · FLEX 23,6 % · Factoring 3,5 %.
 */
export const productos: Producto[] = [
  {
    id: "factoring",
    nombre: "Factoring",
    descripcion:
      "Adelanta el valor de tus facturas electrónicas y deja de esperar los plazos de pago.",
    detalle: "Hasta el 90 % del valor · desembolso en 48 h",
    href: "/factoring",
    icon: "factoring",
    contratado: false,
    destacado: true,
  },
  {
    id: "pyme",
    nombre: "Crédito Pyme",
    descripcion:
      "Financiamiento a plazo para capital de trabajo, nómina e inventario.",
    detalle: "Cuota fija mensual",
    href: "/creditos/pyme",
    icon: "operaciones",
    contratado: true,
  },
  {
    id: "flex",
    nombre: "Crédito FLEX",
    descripcion:
      "Cupo rotativo para pagar a tus proveedores, sin plástico de por medio.",
    detalle: "Disponible al instante",
    href: "/flex",
    icon: "flex",
    contratado: true,
  },
  {
    id: "amex",
    nombre: "Tarjeta empresarial AMEX",
    descripcion:
      "Tarjeta de crédito empresarial American Express con control de gastos y beneficios de viaje.",
    detalle: "Próximamente",
    href: "/tarjeta",
    icon: "tarjeta",
    contratado: false,
  },
];

/* -------------------------------------------------------------------------- */

export type Cupo = {
  producto: string;
  autorizado: number;
  utilizado: number;
  tasaAnual: number;
};

export const cupoPyme: Cupo = {
  producto: "Crédito Pyme",
  autorizado: 800_000_000,
  utilizado: 312_000_000,
  tasaAnual: 0.243,
};

export const cupoFlex: Cupo = {
  producto: "Crédito FLEX",
  autorizado: 250_000_000,
  utilizado: 96_500_000,
  tasaAnual: 0.279,
};

/** Cartera por cobrar registrada en RADIAN, insumo del producto de Factoring. */
export const cartera = {
  facturasPorCobrar: 10,
  clientes: 6,
  montoPorCobrar: 1_450_000_000,
  plazoPromedioDias: 68,
};

export type Movimiento = {
  id: string;
  fecha: string;
  concepto: string;
  contraparte: string;
  monto: number;
  tipo: "cargo" | "abono";
};

export const movimientos: Movimiento[] = [
  {
    id: "mov-1",
    fecha: "2026-08-14",
    concepto: "Desembolso Crédito FLEX",
    contraparte: "Soluciones Creativas S.A.S",
    monto: 45_000_000,
    tipo: "abono",
  },
  {
    id: "mov-2",
    fecha: "2026-08-13",
    concepto: "Pago a proveedor",
    contraparte: "Innovación Digital S.L.",
    monto: 18_400_000,
    tipo: "cargo",
  },
  {
    id: "mov-3",
    fecha: "2026-08-12",
    concepto: "Cuota Crédito Pyme",
    contraparte: "Kapital",
    monto: 27_850_000,
    tipo: "cargo",
  },
  {
    id: "mov-4",
    fecha: "2026-08-11",
    concepto: "Recaudo de cartera",
    contraparte: "Estudio Marketing Col S.A",
    monto: 200_000_000,
    tipo: "abono",
  },
];
