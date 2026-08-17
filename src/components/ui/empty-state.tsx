import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type Cta = {
  label: string;
  href: string;
  icon?: IconName;
};

/**
 * Estado vacío del sistema: superficie elevada, icono en un disco `bg/07`
 * atenuado, y una sola acción que devuelve al usuario a terreno conocido.
 *
 * La jerarquía sigue la regla de las tarjetas — contraste de superficie, sin
 * sombra — y el bloque se centra vertical y horizontalmente en el hueco que
 * deja el shell del portal. Ver DESIGN.md §3.3
 */
export function EmptyState({
  icon = "operaciones",
  titulo,
  descripcion,
  cta,
  className,
}: {
  icon?: IconName;
  titulo: string;
  descripcion: ReactNode;
  cta: Cta;
  className?: string;
}) {
  return (
    <Card
      as="section"
      className={cn(
        "flex flex-col items-center gap-6 px-6 py-16 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-16 items-center justify-center rounded-pill bg-surface-muted text-ink-quaternary"
      >
        <Icon name={icon} size={32} />
      </span>

      <div className="flex max-w-form flex-col gap-3">
        <h2 className="text-title-l font-semibold text-ink">{titulo}</h2>
        <p className="text-body-l text-ink-secondary">{descripcion}</p>
      </div>

      <ButtonLink href={cta.href} icon={cta.icon}>
        {cta.label}
      </ButtonLink>
    </Card>
  );
}
