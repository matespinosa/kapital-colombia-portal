"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { getMigajas, getPageTitle, type Migaja } from "@/lib/nav";

export type { Migaja };

/**
 * Header de 86px, sticky y translúcido. Muestra el título del módulo, o unas
 * migas de pan cuando se está dentro de un flujo (Factoring › Solicitud).
 *
 * Las migas se pueden pasar explícitamente (flujo de solicitud, que vive en
 * otro shell) o dejar que se deriven de la ruta. Ver DESIGN.md §3.4
 */
export function Header({
  razonSocial,
  migajas,
  onAbrirMenu,
}: {
  razonSocial: string;
  migajas?: Migaja[];
  /** Solo lo pasa el shell del portal: el flujo de solicitud no tiene menú. */
  onAbrirMenu?: () => void;
}) {
  const pathname = usePathname();
  const rastro = migajas ?? getMigajas(pathname);

  return (
    <header className="sticky top-0 z-10 h-header bg-surface/80 backdrop-blur-[30px]">
      <div className="flex h-full items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-3">
          {onAbrirMenu && (
            <button
              type="button"
              onClick={onAbrirMenu}
              aria-label="Abrir menú de navegación"
              className="area-tactil cursor-pointer text-ink transition-colors hover:text-ink-secondary lg:hidden"
            >
              <IconoMenu />
            </button>
          )}

          {rastro?.length ? (
            <Breadcrumbs migajas={rastro} />
          ) : (
            <h1 className="truncate text-title-m font-semibold text-ink">
              {getPageTitle(pathname)}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* El saludo es lo primero que cede el sitio: identifica la sesión, no
              la tarea. */}
          <p className="hidden text-body-m font-semibold whitespace-nowrap text-ink-tertiary md:block">
            Hola, {razonSocial}
          </p>

          <span aria-hidden className="hidden h-3 w-px bg-hairline md:block" />

          <div className="flex items-center gap-4">
            <HeaderAction icon="profile" label="Mi perfil" />
            <HeaderAction icon="support" label="Soporte" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Breadcrumbs({ migajas }: { migajas: Migaja[] }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex items-center gap-2">
        {migajas.map((migaja, i) => {
          const ultima = i === migajas.length - 1;

          return (
            <li key={migaja.label} className="flex items-center gap-2">
              {migaja.href && !ultima ? (
                <Link
                  href={migaja.href}
                  className="area-tactil text-body-m font-semibold text-ink-tertiary transition-colors hover:text-ink"
                >
                  {migaja.label}
                </Link>
              ) : (
                <span
                  aria-current={ultima ? "page" : undefined}
                  className={cn(
                    "text-body-m font-semibold",
                    ultima ? "text-ink" : "text-ink-tertiary",
                  )}
                >
                  {migaja.label}
                </span>
              )}

              {!ultima && (
                <span aria-hidden className="text-ink-tertiary">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function HeaderAction({
  icon,
  label,
}: {
  icon: "profile" | "support";
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "area-tactil cursor-pointer rounded-nav text-ink-secondary",
        "transition-[color,transform] duration-150 ease-salida",
        "hover:scale-110 hover:text-ink active:scale-95",
      )}
    >
      <Icon name={icon} />
    </button>
  );
}

function IconoMenu() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-6">
      <path
        d="M3 6h14M3 10h14M3 14h14"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </svg>
  );
}
