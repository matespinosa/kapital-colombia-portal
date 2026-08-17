import type { Transition, Variants } from "motion/react";

/**
 * Vocabulario de movimiento del portal. Ver DESIGN.md §3.7
 *
 * El archivo solo exporta constantes y tipos —`import type` se borra al
 * compilar—, así que puede importarse desde componentes de servidor sin
 * arrastrar el runtime de Motion.
 *
 * La regla del sistema: el movimiento explica una relación de causa y efecto,
 * no decora. Si un elemento aparece, entra desde donde lo invocaron; si un
 * indicador cambia de sitio, viaja en vez de saltar. Nada dura más de 320ms:
 * por encima de eso el usuario deja de percibirlo como respuesta y empieza a
 * percibirlo como espera.
 */

/** Curvas — espejo de `--ease-salida` / `--ease-estandar` en globals.css. */
export const SALIDA: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const ESTANDAR: [number, number, number, number] = [0.2, 0, 0, 1];

export const DURACION = {
  /** Respuesta directa al cursor: color, opacidad, presión. */
  rapida: 0.12,
  /** Entradas y salidas de contenido. */
  base: 0.2,
  /** Reacomodos de layout: paneles que se despliegan, listas que se rehacen. */
  lenta: 0.32,
} as const;

export const TRANSICION: Transition = {
  duration: DURACION.base,
  ease: SALIDA,
};

/**
 * Resorte para lo que se desplaza físicamente: el subrayado de las pestañas,
 * la barra de selección, el indicador del sidebar. Sin rebote (`damping` alto)
 * — es una herramienta de trabajo, no una app de consumo.
 */
export const RESORTE: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.9,
};

/** Variante del resorte para recorridos largos (barras flotantes, sheets). */
export const RESORTE_AMPLIO: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
};

/* -------------------------------------------------------------------------- */
/* Variantes                                                                  */
/* -------------------------------------------------------------------------- */

/** Entrada genérica de un bloque de contenido. */
export const aparecer: Variants = {
  oculto: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: TRANSICION },
  saliendo: { opacity: 0, y: -4, transition: { duration: DURACION.rapida } },
};

/**
 * No hay variantes de lista escalonada aquí a propósito. El escalonado de
 * entrada vive en CSS (`.animar-aparecer` + `animation-delay`, globals.css):
 * el `initial` de Motion se serializa en el HTML del servidor, así que una
 * tabla de facturas con variantes llegaría en `opacity: 0` y no se leería
 * ninguna cifra hasta que hidratara el bundle. Motion se queda con lo que CSS
 * no puede hacer — salidas coordinadas, layout compartido, gestos.
 */

/**
 * Panel que se despliega en el flujo del documento (filtros, acordeones).
 * `height: auto` obliga a Motion a medir el contenido en cada frame; por eso
 * el contenedor necesita `overflow-hidden` mientras dura la animación.
 */
export const desplegar: Variants = {
  oculto: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: DURACION.lenta, ease: SALIDA },
      opacity: { duration: DURACION.base, delay: 0.06 },
    },
  },
  saliendo: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.24, ease: ESTANDAR },
      opacity: { duration: 0.1 },
    },
  },
};

/**
 * Capa flotante anclada a su disparador (calendario, menús). El origen de la
 * escala lo pone el componente con `origin-*`: el panel tiene que crecer desde
 * el botón que lo abrió, no desde su propio centro.
 */
export const popover: Variants = {
  oculto: { opacity: 0, scale: 0.96, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.18, ease: SALIDA },
  },
  saliendo: {
    opacity: 0,
    scale: 0.97,
    y: -2,
    transition: { duration: 0.12, ease: ESTANDAR },
  },
};

/** Barra de acción que entra desde el borde inferior. */
export const barraFlotante: Variants = {
  oculto: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: RESORTE_AMPLIO },
  saliendo: { opacity: 0, y: 16, transition: { duration: 0.16, ease: ESTANDAR } },
};

/** Tooltip de la gráfica: crece desde su borde inferior (donde está la barra). */
export const tooltip: Variants = {
  oculto: { opacity: 0, scale: 0.94, y: 4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.14, ease: SALIDA } },
  saliendo: { opacity: 0, scale: 0.98, transition: { duration: 0.1 } },
};
