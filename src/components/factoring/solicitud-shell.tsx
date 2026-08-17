"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useSolicitud } from "@/components/factoring/solicitud-context";
import { LogoKapital } from "@/components/icons";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { PASOS, rutaPaso, type PasoSlug } from "@/lib/factoring";
import { RESORTE } from "@/lib/motion";

/**
 * Durante la solicitud el sidebar cambia de función: deja de ser navegación
 * del portal y pasa a ser el indicador de progreso. Sacar los módulos del
 * portal es deliberado — es un flujo, y salirse a medias tiene un costo.
 * Ver DESIGN.md §5.3
 */
export function SolicitudSidebar() {
  const pathname = usePathname();
  const { pasoCompleto } = useSolicitud();

  return (
    <div className="fixed inset-y-0 left-0 z-20 flex w-sidebar flex-col gap-8 bg-surface-raised px-2 py-8">
      <Link
        href="/factoring"
        aria-label="Kapital — salir de la solicitud"
        className="self-center"
      >
        <LogoKapital size={54} className="text-ink" />
      </Link>

      <nav aria-label="Progreso de la solicitud">
        <ol className="flex flex-col">
          {PASOS.map((paso) => {
            const activo = pathname.endsWith(paso.slug);
            const completo = pasoCompleto(paso.slug);

            return (
              <li key={paso.slug} className="relative">
                {/* La barra del paso actual desciende por la lista a medida que
                    se avanza. Ver el trayecto —y no un salto— es lo que hace
                    legible el progreso: se percibe cuánto se recorrió y cuánto
                    falta sin necesidad de un porcentaje. */}
                {activo && (
                  <motion.span
                    aria-hidden
                    layoutId="paso-activo"
                    transition={RESORTE}
                    className="absolute inset-y-0 left-0 w-0.5 bg-ink"
                  />
                )}

                <span
                  aria-current={activo ? "step" : undefined}
                  className={cn(
                    "flex border-l-2 border-transparent py-2 pl-4 text-body-m",
                    "transition-colors duration-200 ease-salida",
                    activo
                      ? "font-semibold text-ink"
                      : completo
                        ? "text-ink-secondary"
                        : "text-ink-tertiary",
                  )}
                >
                  {paso.navegacion}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Marco de cada paso: título a dos tonos, descripción, formulario centrado de
 * 664px y el botón de avance anclado abajo.
 */
export function Paso({
  slug,
  children,
  onContinuar,
  etiquetaContinuar = "Continuar",
  puedeContinuar = true,
}: {
  slug: PasoSlug;
  children: ReactNode;
  onContinuar: () => void;
  etiquetaContinuar?: string;
  puedeContinuar?: boolean;
}) {
  const router = useRouter();
  const { redireccionPara } = useSolicitud();
  const destino = redireccionPara(slug);
  const paso = PASOS.find((p) => p.slug === slug)!;

  useEffect(() => {
    if (destino) router.replace(rutaPaso(destino));
  }, [destino, router]);

  if (destino) return null;

  return (
    <div className="flex min-h-[calc(100dvh-var(--spacing-header))] flex-col px-6 pb-10">
      {/* Cada paso es una ruta propia, así que solo se anima la entrada: en el
          App Router la pantalla anterior ya se desmontó cuando esta monta.

          Va en CSS y no en Motion por una razón concreta: `initial` de Motion
          se serializa en el HTML del servidor, así que el formulario saldría
          con `opacity: 0` y no se vería hasta que hidrate — en un flujo de
          solicitud eso es contenido crítico detrás de un bundle. Una animación
          CSS corre con la hoja de estilos y siempre termina. El retardo del
          cuerpo escalona la lectura: primero el título, después el formulario. */}
      <div className="mx-auto flex w-full max-w-form flex-col gap-8 pt-6">
        <header className="animar-entrada flex flex-col gap-3">
          {/* Dos tonos: el sustantivo en tinta plena, el resto en secundaria. */}
          <h2 className="text-display-s text-ink-tertiary">
            <strong className="font-semibold text-ink">
              {paso.tituloFuerte}
            </strong>{" "}
            {paso.tituloSuave}
          </h2>
          <p className="text-body-m text-ink-secondary">{paso.descripcion}</p>
        </header>

        <div
          className="animar-entrada flex flex-col gap-8"
          style={{ animationDelay: "70ms" }}
        >
          {children}
        </div>
      </div>

      <div className="mx-auto mt-auto flex w-full max-w-form justify-center pt-12">
        <Button
          shape="rect"
          onClick={onContinuar}
          disabled={!puedeContinuar}
          className="w-[220px]"
        >
          {etiquetaContinuar}
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function SolicitudLayout({
  razonSocial,
  children,
}: {
  razonSocial: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface">
      <SolicitudSidebar />
      <div className="ml-sidebar">
        <Header
          razonSocial={razonSocial}
          migajas={[
            { label: "Factoring", href: "/factoring" },
            { label: "Solicitud" },
          ]}
        />
        <main>{children}</main>
      </div>
    </div>
  );
}
