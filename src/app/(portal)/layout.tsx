import { PortalShell } from "@/components/layout/shell";
import { empresa } from "@/data/mock";

/**
 * Shell del portal Colombia: sidebar fijo de 220px + header sticky. Debajo de
 * `lg` el sidebar pasa a ser un panel. Ver DESIGN.md §3.4
 */
export default function PortalLayout({ children }: LayoutProps<"/">) {
  return (
    <PortalShell
      razonSocial={empresa.razonSocial}
      ultimoInicioSesion={empresa.ultimoInicioSesion}
    >
      {children}
    </PortalShell>
  );
}
