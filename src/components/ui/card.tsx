import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Superficie elevada. La jerarquía en este sistema se construye con contraste
 * de superficie (#F8F8F8 de fondo vs #FFFFFF elevado), nunca con sombra.
 * Ver DESIGN.md §3.3
 */
export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag className={cn("rounded-card bg-surface-raised p-6", className)}>
      {children}
    </Tag>
  );
}

export function CardHeading({
  children,
  meta,
}: {
  children: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-title-s font-semibold text-ink">{children}</h2>
      {meta && <span className="text-body-s text-ink-tertiary">{meta}</span>}
    </div>
  );
}

/** Etiqueta pequeña en mayúsculas suaves para metadatos de tarjeta. */
export function CardLabel({ children }: { children: ReactNode }) {
  return <p className="text-body-s text-ink-tertiary">{children}</p>;
}
