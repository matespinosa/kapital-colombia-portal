import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";

const VALUE_SIZE: Record<Size, string> = {
  sm: "text-title-s",
  md: "text-display-s",
  lg: "text-display-m",
};

/** Par label + cifra. La cifra siempre en DemiBold, el label en tinta terciaria. */
export function Metric({
  label,
  value,
  hint,
  size = "sm",
  inverse = false,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  size?: Size;
  inverse?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className={cn(
          "text-body-s",
          inverse ? "text-ink-inverse/60" : "text-ink-tertiary",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          VALUE_SIZE[size],
          "font-semibold tabular-nums",
          inverse ? "text-ink-inverse" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint && (
        <p
          className={cn(
            "text-body-s",
            inverse ? "text-ink-inverse/60" : "text-ink-tertiary",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/** Barra de proporción. `ratio` en 0..1. */
export function ProgressBar({
  ratio,
  label,
}: {
  ratio: number;
  label: string;
}) {
  const pct = Math.min(Math.max(ratio, 0), 1);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
    >
      {/* Dos movimientos con propósitos distintos: la animación de entrada
          barre la barra al montar (el cupo se "llena" a la vista), y la
          transición de `width` cubre los cambios posteriores del dato. */}
      <div
        className="animar-crecer-x h-full rounded-full bg-ink transition-[width] duration-500 ease-salida"
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}
