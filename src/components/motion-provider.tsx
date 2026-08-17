"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { TRANSICION } from "@/lib/motion";

/**
 * Configuración global de Motion. Ver DESIGN.md §3.7
 *
 * `reducedMotion="user"` es lo importante: respeta `prefers-reduced-motion` en
 * todos los componentes de Motion sin que cada uno tenga que consultarlo. Las
 * animaciones de transformación y opacidad se desactivan; los cambios de
 * layout siguen ocurriendo, pero instantáneos.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={TRANSICION}>
      {children}
    </MotionConfig>
  );
}
