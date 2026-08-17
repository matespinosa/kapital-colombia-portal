import type { Metadata } from "next";

import { PortalShell } from "@/components/layout/shell";
import { EmptyState } from "@/components/ui/empty-state";
import { empresa } from "@/data/mock";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

/**
 * 404 de toda la app: Next enruta aquí tanto las URLs sin match como cualquier
 * `notFound()`. Se monta el mismo shell del portal a mano —el `layout.tsx` de
 * `(portal)` no envuelve este archivo— para que los módulos del sidebar que
 * todavía no tienen pantalla (FLEX, Tarjeta, Tutoriales) caigan en una página
 * que sigue siendo el portal, con salida a Operaciones.
 *
 * Reutiliza `PortalShell` y no monta Sidebar + Header por separado: el sidebar
 * está fuera de pantalla por debajo de `lg` y necesita el estado del panel para
 * poder abrirse. Con las piezas sueltas, en móvil esta página quedaba sin
 * ninguna navegación — justo donde el usuario llega perdido.
 */
export default function NotFound() {
  return (
    <PortalShell
      razonSocial={empresa.razonSocial}
      ultimoInicioSesion={empresa.ultimoInicioSesion}
    >
      {/* `PortalShell` ya aporta el `<main>`: aquí solo va el contenedor. */}
      <div className="px-6 pb-16">
        <EmptyState
          titulo="Esta sección todavía no está disponible"
          descripcion="La página que buscas no existe o aún no se ha habilitado para tu empresa. Vuelve a Operaciones para ver tus cupos, tus productos y tus últimos movimientos."
          cta={{ label: "Ir a Operaciones", href: "/" }}
        />
      </div>
    </PortalShell>
  );
}
