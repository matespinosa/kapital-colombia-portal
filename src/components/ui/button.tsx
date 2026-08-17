import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "inverse";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-ink-inverse hover:bg-ink/90",
  secondary:
    "bg-surface-raised text-ink border border-hairline hover:bg-surface-muted",
  ghost: "text-ink-secondary hover:bg-surface-muted",
  /** Para superficies oscuras: invierte el primario. */
  inverse: "bg-surface-raised text-ink hover:bg-surface-muted",
};

/**
 * Botón de 48px del sistema: texto Body M DemiBold (14/1.25/0.5px) e icono
 * opcional de 24px. La forma es una variante, no un override por `className`:
 * dos utilidades de radio tienen la misma especificidad y gana la del orden
 * del stylesheet, no la del atributo. Ver DESIGN.md §3.3 y §7.
 */
type Shape = "pill" | "rect";

const SHAPES: Record<Shape, string> = {
  /** Acciones dentro del contenido — 24px, píldora perfecta a 48px de alto */
  pill: "rounded-pill",
  /** Avance de formulario en el flujo de solicitud — 8px */
  rect: "rounded-nav",
};

/**
 * La retroalimentación de presión va en CSS y no en Motion a propósito: es el
 * gesto más frecuente de toda la plataforma, ocurre en botones que también son
 * enlaces del servidor, y `:active` responde en el mismo frame del `pointerdown`
 * sin montar runtime de animación. El hundimiento es de un 2 %: suficiente para
 * que el dedo/cursor sienta el clic, no tanto como para que el texto vibre.
 * Ver DESIGN.md §3.7
 */
const BASE = cn(
  "group inline-flex h-12 items-center justify-center gap-2 px-8",
  "text-body-m font-semibold whitespace-nowrap",
  "cursor-pointer transition-[color,background-color,border-color,transform]",
  "duration-150 ease-salida active:scale-[0.98] active:duration-75",
  "disabled:pointer-events-none disabled:opacity-40",
);

type SharedProps = {
  variant?: Variant;
  shape?: Shape;
  icon?: IconName;
  children: ReactNode;
  className?: string;
};

/**
 * El icono direccional se adelanta unos píxeles al pasar el cursor — la flecha
 * apunta hacia donde lleva la acción, así que moverla en esa dirección refuerza
 * el destino. Los iconos no direccionales se quedan quietos: ahí el mismo gesto
 * no significaría nada.
 */
function IconoBoton({ name }: { name: IconName }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex transition-transform duration-150 ease-salida",
        name === "up-right" && "group-hover:-translate-y-px group-hover:translate-x-px",
      )}
    >
      <Icon name={name} />
    </span>
  );
}

export function Button({
  variant = "primary",
  shape = "pill",
  icon,
  children,
  className,
  ...props
}: SharedProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SHAPES[shape], className)}
      {...props}
    >
      {children}
      {icon && <IconoBoton name={icon} />}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  shape = "pill",
  icon,
  children,
  className,
  ...props
}: SharedProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SHAPES[shape], className)}
      {...props}
    >
      {children}
      {icon && <IconoBoton name={icon} />}
    </Link>
  );
}
