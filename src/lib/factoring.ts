/**
 * Dominio de Factoring (Colombia).
 *
 * A diferencia de México, aquí el cuello de botella no es elegir facturas sino
 * la **vinculación**: la empresa se somete a estudio antes de poder negociar
 * nada. Por eso la solicitud es un flujo de onboarding (datos → representante
 * legal → confirmación → firma), no un selector de facturas.
 *
 * Las facturas deben estar inscritas y validadas en **RADIAN**, el registro
 * oficial de la DIAN que convierte una factura electrónica de venta en título
 * valor negociable. Sin RADIAN no hay factoring.
 *
 * Ver DESIGN.md §5.2
 */

/** Condiciones comerciales publicadas de la línea de Factoring de Kapital CO. */
export const CONDICIONES = {
  /** Porcentaje máximo del valor de la factura que se adelanta */
  anticipoMaximo: 0.9,
  /** Monto mínimo de la primera operación */
  montoMinimoPrimera: 10_000_000,
  /** Monto máximo de la primera operación */
  montoMaximoPrimera: 600_000_000,
  /** Monto mínimo de operaciones siguientes */
  montoMinimoSiguientes: 500_000,
  /** Vigencia máxima de la factura, de emisión a vencimiento */
  vigenciaMaximaDias: 120,
  /** Antigüedad mínima de la empresa para ser elegible */
  antiguedadMinimaAnios: 2,
  /** Tiempo máximo de desembolso */
  desembolsoHoras: 48,
} as const;

/* -------------------------------------------------------------------------- */

export type Factura = {
  id: string;
  cliente: string;
  /** NIT del pagador, sin dígito de verificación */
  nitCliente: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoTotal: number;
  /** Estado en el registro RADIAN de la DIAN */
  radian: "validada" | "pendiente" | "no_inscrita";
};

export const esNegociable = (factura: Factura) => factura.radian === "validada";

/** Días entre hoy y el vencimiento. Nunca negativo: una factura vencida es 0. */
export function diasAlVencimiento(
  factura: Factura,
  hoy: Date = new Date(),
): number {
  const [y, m, d] = factura.fechaVencimiento.split("-").map(Number);
  const vencimiento = new Date(y, m - 1, d);
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  return Math.max(
    Math.round((vencimiento.getTime() - base.getTime()) / 86_400_000),
    0,
  );
}

/**
 * Kapital Colombia comunica el costo como "recibes hasta el 90 %": el 10 %
 * restante cubre retenciones e impuestos, la comisión de infraestructura y una
 * tasa variable según los días al vencimiento. No se desglosa en aforo y
 * descuento como en México — modelarlo así sería inventar precisión.
 */
export function calcularAnticipo(facturas: Factura[]) {
  const montoTotal = facturas.reduce((s, f) => s + f.montoTotal, 0);
  const clientes = new Set(facturas.map((f) => f.nitCliente)).size;

  return {
    numeroFacturas: facturas.length,
    clientes,
    montoTotal,
    anticipoEstimado: montoTotal * CONDICIONES.anticipoMaximo,
  };
}

/* -------------------------------------------------------------------------- */

export const PASOS = [
  {
    slug: "empresa",
    /** El título se parte en dos tonos: la primera parte en tinta plena. */
    tituloFuerte: "Datos",
    tituloSuave: "de la empresa",
    navegacion: "Empresa",
    descripcion:
      "Revisa que la información precargada sea correcta y agrega los datos faltantes para continuar con tu solicitud. Asegúrate de que todo coincida con los registros oficiales.",
  },
  {
    slug: "representante-legal",
    tituloFuerte: "Representante",
    tituloSuave: "legal",
    navegacion: "Representante legal",
    descripcion:
      "Necesitamos los datos de quien firma en nombre de la empresa. A este correo enviaremos los documentos para firma electrónica.",
  },
  {
    slug: "confirmacion",
    tituloFuerte: "Confirma",
    tituloSuave: "tu información",
    navegacion: "Confirmación",
    descripcion:
      "Revisa que todo esté correcto antes de enviar tu solicitud a estudio.",
  },
  {
    slug: "terminos",
    tituloFuerte: "Términos",
    tituloSuave: "y condiciones",
    navegacion: "Términos y condiciones",
    descripcion:
      "Autoriza el tratamiento de datos y la consulta en centrales de riesgo para completar tu solicitud de Factoring.",
  },
] as const;

export type PasoSlug = (typeof PASOS)[number]["slug"];

export const rutaPaso = (slug: PasoSlug) => `/factoring/solicitud/${slug}`;

/* -------------------------------------------------------------------------- */

/** Municipios sede más frecuentes. En producción viene del catálogo DANE. */
export const MUNICIPIOS = [
  "Bogotá D.C.",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Manizales",
] as const;

/** Actividad económica. En producción es el catálogo CIIU completo. */
export const ACTIVIDADES = [
  "Agricultura",
  "Comercio al por mayor",
  "Comercio al por menor",
  "Construcción",
  "Industria manufacturera",
  "Servicios profesionales",
  "Tecnología y comunicaciones",
  "Transporte y almacenamiento",
] as const;

export const TIPOS_DOCUMENTO = [
  "Cédula de ciudadanía",
  "Cédula de extranjería",
  "Pasaporte",
] as const;
