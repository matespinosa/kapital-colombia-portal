/**
 * Datos del dashboard de Factoring activo. Ver DESIGN.md §5.4
 */

export type MesNegociado = {
  /** Etiqueta corta del eje: Abr, May, … */
  mes: string;
  anio: number;
  monto: number;
  /** Cuántas facturas se vendieron ese mes — se muestra en el tooltip. */
  facturas: number;
};

/**
 * Serie de facturas negociadas por mes. La variación contra el mes anterior se
 * **calcula** desde estos valores, no se escribe a mano: en el mockup el
 * "+20.1%" no coincidía con la altura de sus propias barras, y un porcentaje
 * hardcodeado junto a una gráfica es una inconsistencia esperando a pasar.
 */
export const negociadas: MesNegociado[] = [
  { mes: "Abr", anio: 2026, monto: 152_000_000, facturas: 3 },
  { mes: "May", anio: 2026, monto: 7_000_000, facturas: 1 },
  { mes: "Jun", anio: 2026, monto: 41_000_000, facturas: 1 },
  { mes: "Jul", anio: 2026, monto: 90_000_000, facturas: 2 },
  { mes: "Ago", anio: 2026, monto: 166_500_000, facturas: 4 },
  { mes: "Sep", anio: 2026, monto: 200_000_000, facturas: 5 },
];

/**
 * Techo del eje: el cupo mensual de la línea, no el máximo de la serie. Por eso
 * la barra más alta llena ~54 % de su carril — el espacio rayado que queda es
 * cupo disponible, no relleno decorativo.
 */
export const cupoMensual = 370_000_000;

export type Proveedor = {
  empresa: string;
  monto: number;
};

export const proveedores: Proveedor[] = [
  { empresa: "Distribuciones Andinas S.A.", monto: 400_000_000 },
  { empresa: "Tecnología Avanzada S.L.", monto: 350_000_000 },
  { empresa: "Soluciones Ecológicas S.A.", monto: 280_000_000 },
  { empresa: "Innovaciones Digitales S.R.L.", monto: 220_000_000 },
  { empresa: "Servicios Globales Ltda.", monto: 150_000_000 },
];

/* -------------------------------------------------------------------------- */

export type EstadoFactura =
  | "por_cobrar"
  | "pendiente"
  | "aprobada"
  | "rechazada";

export type FacturaDashboard = {
  id: string;
  cliente: string;
  nit: string;
  emision: string;
  vencimiento: string;
  monto: number;
  estado: EstadoFactura;
  /**
   * Operación en la que se cedió. Las facturas "por cobrar" todavía no se han
   * cedido, así que no tienen una: el menú de acciones lo refleja.
   */
  operacionId?: string;
};

export const facturasDashboard: FacturaDashboard[] = [
  {
    id: "d-01",
    cliente: "Estudio Marketing Col S.A",
    nit: "921382193",
    emision: "2026-08-10",
    vencimiento: "2026-09-27",
    monto: 200_000_000,
    estado: "por_cobrar",
  },
  {
    id: "d-02",
    cliente: "Innovación Digital S.L.",
    nit: "712345678",
    emision: "2026-07-15",
    vencimiento: "2026-11-10",
    monto: 150_000_000,
    estado: "por_cobrar",
  },
  {
    id: "d-03",
    cliente: "Consultores Estratégicos Ltda",
    nit: "843215678",
    emision: "2026-06-20",
    vencimiento: "2026-09-15",
    monto: 250_000_000,
    estado: "por_cobrar",
  },
  {
    id: "d-04",
    cliente: "Soluciones Creativas S.A.S",
    nit: "634578912",
    emision: "2026-07-01",
    vencimiento: "2026-10-22",
    monto: 175_000_000,
    estado: "por_cobrar",
  },
  {
    id: "d-05",
    cliente: "Innovaciones Tecnológicas Ltda",
    nit: "987654321",
    emision: "2026-06-15",
    vencimiento: "2026-09-30",
    monto: 250_000_000,
    estado: "por_cobrar",
  },
  {
    id: "d-06",
    cliente: "Desarrollo Sustentable Corp.",
    nit: "456789123",
    emision: "2026-05-10",
    vencimiento: "2026-08-15",
    monto: 300_000_000,
    estado: "por_cobrar",
  },
  {
    id: "d-07",
    cliente: "Distribuciones Andinas S.A.",
    nit: "890123456",
    emision: "2026-08-01",
    vencimiento: "2026-12-01",
    monto: 400_000_000,
    estado: "pendiente",
    operacionId: "op-2043",
  },
  {
    id: "d-08",
    cliente: "Tecnología Avanzada S.L.",
    nit: "345678901",
    emision: "2026-07-20",
    vencimiento: "2026-11-18",
    monto: 350_000_000,
    estado: "pendiente",
    operacionId: "op-2043",
  },
  {
    id: "d-09",
    cliente: "Soluciones Ecológicas S.A.",
    nit: "567890123",
    emision: "2026-04-05",
    vencimiento: "2026-08-03",
    monto: 280_000_000,
    estado: "aprobada",
    operacionId: "op-2041",
  },
  {
    id: "d-10",
    cliente: "Servicios Globales Ltda.",
    nit: "234567890",
    emision: "2026-03-12",
    vencimiento: "2026-07-10",
    monto: 150_000_000,
    estado: "rechazada",
    operacionId: "op-2044",
  },
];

/** Totales de cada pestaña. En producción vienen del backend, no del arreglo. */
export const conteos: Record<EstadoFactura, number> = {
  por_cobrar: 10,
  pendiente: 36,
  aprobada: 1712,
  rechazada: 12,
};
