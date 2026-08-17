import type { Metadata } from "next";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
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
 */
export default function NotFound() {
  return (
    <div className="min-h-dvh bg-surface">
      <Sidebar ultimoInicioSesion={empresa.ultimoInicioSesion} />

      <div className="ml-sidebar">
        <Header razonSocial={empresa.razonSocial} />

        <main className="px-6 pb-16">
          <EmptyState
            titulo="Esta sección todavía no está disponible"
            descripcion="La página que buscas no existe o aún no se ha habilitado para tu empresa. Vuelve a Operaciones para ver tus cupos, tus productos y tus últimos movimientos."
            cta={{ label: "Ir a Operaciones", href: "/" }}
          />
        </main>
      </div>
    </div>
  );
}
