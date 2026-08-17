import type { Factura } from "@/lib/factoring";

/**
 * Facturas electrónicas de venta de la empresa, tal como llegarían desde
 * RADIAN. Reemplazar por el fetch al conector DIAN. Ver DESIGN.md §7.
 */
export const facturas: Factura[] = [
  {
    id: "f-001",
    cliente: "Estudio Marketing Col S.A",
    nitCliente: "921382193",
    fechaEmision: "2026-06-10",
    fechaVencimiento: "2026-09-27",
    montoTotal: 200_000_000,
    radian: "validada",
  },
  {
    id: "f-002",
    cliente: "Innovación Digital S.L.",
    nitCliente: "712345678",
    fechaEmision: "2026-07-15",
    fechaVencimiento: "2026-11-10",
    montoTotal: 150_000_000,
    radian: "validada",
  },
  {
    id: "f-003",
    cliente: "Consultores Estratégicos Ltda",
    nitCliente: "843215678",
    fechaEmision: "2026-05-20",
    fechaVencimiento: "2026-09-15",
    montoTotal: 250_000_000,
    radian: "validada",
  },
  {
    id: "f-004",
    cliente: "Soluciones Creativas S.A.S",
    nitCliente: "634578912",
    fechaEmision: "2026-06-01",
    fechaVencimiento: "2026-10-22",
    montoTotal: 175_000_000,
    radian: "validada",
  },
  {
    id: "f-005",
    cliente: "Soluciones Creativas S.A.S",
    nitCliente: "634578912",
    fechaEmision: "2026-07-01",
    fechaVencimiento: "2026-11-22",
    montoTotal: 175_000_000,
    radian: "pendiente",
  },
  {
    id: "f-006",
    cliente: "Café del Norte S.A.S",
    nitCliente: "556781234",
    fechaEmision: "2026-08-01",
    fechaVencimiento: "2026-12-01",
    montoTotal: 98_000_000,
    radian: "no_inscrita",
  },
];
