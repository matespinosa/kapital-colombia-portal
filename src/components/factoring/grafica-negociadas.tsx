"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { cupoMensual, negociadas, type MesNegociado } from "@/data/negociadas";
import { cn } from "@/lib/cn";
import { formatCOP, formatCOPExacto, formatPorcentaje } from "@/lib/format";
import { tooltip as varTooltip } from "@/lib/motion";

/** Alto del carril en px, tomado del nodo `2090:10021`. */
const ALTO_CARRIL = 54;

/**
 * Facturas negociadas por mes.
 *
 * Cada barra es un carril rayado (el cupo mensual disponible) con un relleno
 * sólido proporcional a lo negociado. El rayado no es decorativo: comunica
 * cuánto cupo quedó sin usar ese mes.
 *
 * Ver DESIGN.md §5.4
 */
export function GraficaNegociadas() {
  const [activo, setActivo] = useState<number | null>(null);

  const ultimo = negociadas.at(-1)!;
  const previo = negociadas.at(-2);

  // Se calcula, no se escribe a mano: ver el comentario en data/negociadas.ts
  const variacion = previo?.monto ? ultimo.monto / previo.monto - 1 : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-title-s font-semibold text-ink">
          Facturas negociadas
        </h2>

        {/* Con el cursor sobre la gráfica se rotula a qué mes pertenece la
            cifra grande: sin eso se confunde con el mes que muestra el tooltip. */}
        <div className="flex items-center gap-3">
          <p className="text-body-m text-ink-tertiary">Monto facturas vendidas</p>
          {activo !== null && (
            <>
              <span aria-hidden className="h-3 w-px bg-hairline" />
              <p className="text-body-m text-ink-tertiary">{ultimo.mes}</p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-display-s font-semibold tabular-nums text-ink">
            {formatCOP(ultimo.monto)}
          </p>
          {variacion !== null && (
            <p className="text-body-m text-ink-tertiary">
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  variacion >= 0 ? "text-positive" : "text-ink",
                )}
              >
                {variacion >= 0 ? "+" : "−"}
                {formatPorcentaje(Math.abs(variacion))}
              </span>{" "}
              del mes anterior
            </p>
          )}
        </div>
      </div>

      <div
        className="flex items-end gap-2"
        onMouseLeave={() => setActivo(null)}
      >
        {negociadas.map((punto, i) => (
          <Carril
            key={punto.mes}
            punto={punto}
            indice={i}
            activo={activo === i}
            onActivar={() => setActivo(i)}
            onDesactivar={() => setActivo(null)}
          />
        ))}
      </div>
    </div>
  );
}

function Carril({
  punto,
  indice,
  activo,
  onActivar,
  onDesactivar,
}: {
  punto: MesNegociado;
  indice: number;
  activo: boolean;
  onActivar: () => void;
  onDesactivar: () => void;
}) {
  const proporcion = Math.min(punto.monto / cupoMensual, 1);

  return (
    <div className="relative flex flex-1 flex-col items-center gap-3">
      <AnimatePresence>{activo && <InfoBox punto={punto} />}</AnimatePresence>

      {/* Botón y no div: el tooltip también tiene que alcanzarse con teclado. */}
      <button
        type="button"
        onMouseEnter={onActivar}
        onFocus={onActivar}
        onBlur={onDesactivar}
        aria-label={
          `${punto.mes} ${punto.anio}: ${punto.facturas} ` +
          `${punto.facturas === 1 ? "factura vendida" : "facturas vendidas"} ` +
          `por ${formatCOP(punto.monto)}`
        }
        className="relative w-full cursor-default overflow-hidden"
        style={{ height: ALTO_CARRIL }}
      >
        <Rayado />
        {/* El relleno se levanta desde el eje al cargar, de izquierda a
            derecha: la gráfica es una serie temporal y el barrido la recorre en
            el mismo orden en que se lee.

            En CSS y no en Motion: el `initial` de Motion viaja en el HTML del
            servidor, así que la gráfica llegaría con las seis barras en
            `scaleY(0)` —vacía— hasta que hidratara. Se anima `scaleY` y no
            `height` porque el alto ya está resuelto en el layout desde el
            primer frame y el navegador no recalcula la caja en cada cuadro. */}
        <span
          className={cn(
            "animar-crecer-y absolute inset-x-0 bottom-0 block bg-chart transition-opacity",
            activo && "opacity-80",
          )}
          style={{
            height: `${proporcion * 100}%`,
            animationDelay: `${60 * indice}ms`,
          }}
        />
      </button>

      <span
        className={cn(
          "text-body-m transition-colors",
          activo ? "text-ink" : "text-ink-tertiary",
        )}
      >
        {punto.mes}
      </span>
    </div>
  );
}

/** Tooltip del nodo `2090:10600`. */
function InfoBox({ punto }: { punto: MesNegociado }) {
  return (
    // El desplazamiento horizontal va en una capa aparte: si `-translate-x-1/2`
    // viviera en el mismo nodo que anima, Motion lo sobrescribiría al componer
    // su propio `transform` y el tooltip saltaría medio ancho al aparecer.
    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2">
      <motion.div
        role="tooltip"
        variants={varTooltip}
        initial="oculto"
        animate="visible"
        exit="saliendo"
        className={cn(
          "flex origin-bottom flex-col gap-2 rounded-nav bg-ink p-2",
          "text-body-s whitespace-nowrap",
        )}
      >
        <p className="text-ink-inverse">
          {punto.mes}, {punto.anio}
        </p>
        <p className="text-ink-tertiary">Vendidas</p>
        <p className="tabular-nums text-ink-inverse">{punto.facturas}</p>
        <p className="text-ink-tertiary">Monto total</p>
        <p className="tabular-nums text-ink-inverse">
          {formatCOPExacto(punto.monto)}
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Trama diagonal del carril. Va como `<pattern>` SVG y no como los seis SVG
 * exportados de Figma: así la trama es independiente del ancho de la barra y
 * el layout puede ser fluido.
 */
function Rayado() {
  return (
    <svg aria-hidden className="absolute inset-0 size-full">
      <defs>
        <pattern
          id="rayado-negociadas"
          width="10.6"
          height="10.6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-52)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10.6"
            stroke="var(--color-chart-track)"
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rayado-negociadas)" />
    </svg>
  );
}
