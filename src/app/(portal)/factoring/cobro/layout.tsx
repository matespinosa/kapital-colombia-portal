import { Suspense } from "react";

import { CobroProvider } from "@/components/factoring/cobro-context";

/** Los días al vencimiento dependen de la fecha real: no se prerenderiza. */
export const dynamic = "force-dynamic";

/**
 * `hoy` se resuelve en el servidor y en la zona horaria de operación del banco,
 * igual que en la solicitud: dos clientes en husos distintos no pueden ver
 * descuentos distintos para la misma factura. Ver DESIGN.md §7
 */
const hoyEnColombia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export default function CobroLayout({
  children,
}: LayoutProps<"/factoring/cobro">) {
  return (
    // `useSearchParams` obliga a un límite de Suspense: la selección viaja en
    // la URL, así que el árbol de cobro no puede renderizarse sin leerla.
    <Suspense fallback={null}>
      <CobroProvider hoyISO={hoyEnColombia()}>{children}</CobroProvider>
    </Suspense>
  );
}
