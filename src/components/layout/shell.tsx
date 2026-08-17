"use client";

import { useState, type ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

/**
 * Shell del portal. Debajo de `lg` el sidebar se convierte en un panel que se
 * abre desde el header; encima, es la columna fija de siempre.
 * Ver DESIGN.md §3.4
 */
export function PortalShell({
  razonSocial,
  ultimoInicioSesion,
  children,
}: {
  razonSocial: string;
  ultimoInicioSesion: string;
  children: ReactNode;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="min-h-dvh bg-surface">
      <Sidebar
        ultimoInicioSesion={ultimoInicioSesion}
        abierto={menuAbierto}
        // Cualquier navegación cierra el panel: en móvil el sidebar tapa el
        // contenido, así que dejarlo abierto escondería el destino.
        onNavegar={() => setMenuAbierto(false)}
      />

      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-20 cursor-default bg-ink/50 lg:hidden"
        />
      )}

      <div className="lg:ml-sidebar">
        <Header
          razonSocial={razonSocial}
          onAbrirMenu={() => setMenuAbierto(true)}
        />
        <main>{children}</main>
      </div>
    </div>
  );
}
