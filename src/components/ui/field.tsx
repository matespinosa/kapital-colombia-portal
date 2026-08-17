import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Campos del flujo de solicitud. Altura 48px, radio 8px y etiqueta encima en
 * tinta terciaria. Los campos precargados desde los registros oficiales van
 * en modo lectura: se muestran para que la empresa los verifique, no para que
 * los edite. Ver DESIGN.md §3.6
 */

const CONTROL = cn(
  "h-12 w-full rounded-nav border px-4",
  "text-body-m text-ink placeholder:text-ink-tertiary",
  "transition-colors duration-150 ease-salida",
  "focus:border-ink focus:outline-none",
);

function Wrapper({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    // La etiqueta pasa a tinta plena mientras el campo tiene el foco: es la
    // única señal que confirma cuál de los campos de la rejilla está recibiendo
    // lo que se escribe, y no depende del cursor, que puede quedar fuera.
    <label className="group flex flex-col gap-2">
      <span className="text-body-s text-ink-tertiary transition-colors duration-150 ease-salida group-focus-within:text-ink">
        {label}
      </span>
      {children}
      {error && (
        <span className="animar-entrada text-body-s text-ink">{error}</span>
      )}
    </label>
  );
}

export function TextField({
  label,
  error,
  readOnly,
  className,
  ...props
}: { label: string; error?: string } & ComponentProps<"input">) {
  return (
    <Wrapper label={label} error={error}>
      <input
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL,
          readOnly
            ? "cursor-default border-hairline bg-surface text-ink-tertiary"
            : "border-hairline bg-surface-raised hover:border-ink-quaternary",
          error && "border-ink",
          className,
        )}
        {...props}
      />
    </Wrapper>
  );
}

export function SelectField({
  label,
  error,
  options,
  className,
  ...props
}: {
  label: string;
  error?: string;
  options: readonly string[];
} & ComponentProps<"select">) {
  return (
    <Wrapper label={label} error={error}>
      {/* El chevron va como SVG hermano y no como background-image: así hereda
          el color del tema y no depende de un asset externo. */}
      <span className="relative block">
        <select
          aria-invalid={error ? true : undefined}
          className={cn(
            CONTROL,
            "cursor-pointer appearance-none border-hairline bg-surface-raised pr-11",
            error && "border-ink",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <svg
          aria-hidden
          viewBox="0 0 12 8"
          fill="none"
          className="pointer-events-none absolute top-1/2 right-4 size-3 -translate-y-1/2 text-ink-secondary"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Wrapper>
  );
}

/** Rejilla de dos columnas del formulario. */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2">{children}</div>;
}
