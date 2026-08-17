"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, LogoKapital } from "@/components/icons";
import { cn } from "@/lib/cn";
import { RESORTE } from "@/lib/motion";
import { formatSelloSesion } from "@/lib/format";
import { NAV_ITEMS, isNavItemActive } from "@/lib/nav";

/**
 * Sidebar del portal Colombia: 220px, pegado al borde y a toda la altura —
 * sin el inset ni el radio del layout de México.
 *
 * Por debajo de `lg` se sale de la pantalla y vuelve como panel: a 480px un
 * sidebar fijo de 220px se come media ventana y deja el contenido en una franja
 * inservible. Ver DESIGN.md §3.4 y §5.5
 */
export function Sidebar({
  ultimoInicioSesion,
  abierto = false,
  onNavegar,
}: {
  ultimoInicioSesion: string;
  abierto?: boolean;
  onNavegar?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div
      onClick={onNavegar}
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-sidebar flex-col items-center gap-8 bg-surface-raised px-2 py-8",
        "transition-transform duration-200 ease-salida lg:translate-x-0",
        abierto ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <Link href="/" aria-label="Kapital — ir al inicio">
        <LogoKapital size={54} className="text-ink" />
      </Link>

      <nav aria-label="Navegación principal" className="w-full">
        <ul className="flex w-full flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const activo = isNavItemActive(item, pathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    // p-2 daba 40px de alto: cuatro por debajo del mínimo táctil, y este es
                    // el control de navegación principal en móvil.
                    "group relative isolate flex w-full items-center gap-2 rounded-nav px-2 py-2.5",
                    "text-body-m font-semibold transition-colors duration-150 ease-salida",
                    activo
                      ? "text-ink"
                      : "text-ink-tertiary hover:bg-surface-muted hover:text-ink-secondary",
                  )}
                >
                  {/* El realce del módulo activo es un solo nodo compartido por
                      toda la lista: al navegar se desliza hasta el nuevo destino
                      en lugar de reaparecer allí. En una navegación de cinco
                      entradas ese recorrido es lo que dice "sigues en el mismo
                      sitio, cambiaste de sección". Ver DESIGN.md §3.7 */}
                  {activo && (
                    <motion.span
                      aria-hidden
                      layoutId="nav-modulo-activo"
                      transition={RESORTE}
                      className="absolute inset-0 -z-10 rounded-nav bg-surface-muted"
                    />
                  )}

                  <span className="flex transition-transform duration-150 ease-salida group-hover:scale-110">
                    <Icon name={item.icon} size={24} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <SidebarFooter ultimoInicioSesion={ultimoInicioSesion} />
    </div>
  );
}

/**
 * El disclaimer de corresponsalía no es decorativo: Kapital opera en Colombia
 * como Corresponsal Digital de Coopcentral, y esa leyenda es una obligación
 * de cara al cliente. No removerla al reacomodar el sidebar.
 */
function SidebarFooter({ ultimoInicioSesion }: { ultimoInicioSesion: string }) {
  return (
    <footer className="mt-auto flex w-full flex-col items-center gap-4 px-2">
      <p className="text-center text-body-s text-ink-secondary">
        Último inicio de sesión
        <br />
        {formatSelloSesion(ultimoInicioSesion)}
      </p>

      <p className="text-center text-[10px] leading-none tracking-[0.5px] text-ink-secondary">
        Kapital es Corresponsal Digital de Banco Cooperativo Coopcentral
      </p>

      <Image
        src="/icons/powered-by-redem.svg"
        alt="Powered by Redem Tech"
        width={93}
        height={37}
      />
    </footer>
  );
}
