import type { Metadata } from "next";

import { SolicitudProvider } from "@/components/factoring/solicitud-context";
import { SolicitudLayout } from "@/components/factoring/solicitud-shell";
import { empresa } from "@/data/mock";

export const metadata: Metadata = {
  title: "Solicitud de Factoring",
};

/**
 * La solicitud vive en su propio route group para poder reemplazar el shell
 * del portal: durante el flujo el sidebar es el indicador de progreso, no la
 * navegación de módulos. Ver DESIGN.md §5.3
 */
export default function Layout({
  children,
}: LayoutProps<"/factoring/solicitud">) {
  return (
    <SolicitudProvider empresa={empresa}>
      <SolicitudLayout razonSocial={empresa.razonSocial}>
        {children}
      </SolicitudLayout>
    </SolicitudProvider>
  );
}
