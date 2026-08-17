/**
 * Concatenador de clases mínimo. No usamos clsx/tailwind-merge: el sistema
 * tiene pocas variantes y no hay conflictos de utilidades que resolver.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
