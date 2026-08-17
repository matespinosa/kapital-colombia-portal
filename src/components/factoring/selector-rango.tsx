"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { formatFecha } from "@/lib/format";
import { ESTANDAR, popover, SALIDA } from "@/lib/motion";

export type Rango = { desde: string | null; hasta: string | null };

export const RANGO_VACIO: Rango = { desde: null, hasta: null };

const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"] as const;

const MESES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
] as const;

/** "2026-08-14" en zona local, sin pasar por UTC. Ver DESIGN.md §7. */
const aISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Selector de rango de fechas — nodo `2090:11315`.
 *
 * Calendario propio en vez de dos `<input type="date">`: un rango se elige
 * mirando el mes completo, y dos campos nativos separados obligan a razonar la
 * relación entre extremos sin verla.
 */
export function SelectorRango({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: Rango;
  onChange: (rango: Rango) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera o con Escape: un panel flotante que solo se
  // cierra con su propio botón atrapa al usuario.
  useEffect(() => {
    if (!abierto) return;

    const fuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  const resumen =
    valor.desde && valor.hasta
      ? `${formatFecha(valor.desde)} — ${formatFecha(valor.hasta)}`
      : valor.desde
        ? `${formatFecha(valor.desde)} — …`
        : null;

  return (
    <div ref={contenedor} className="relative flex flex-col gap-2">
      <span className="text-body-s text-ink-tertiary">{label}</span>

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        className={cn(
          "flex h-12 cursor-pointer items-center justify-between gap-3 rounded-nav border px-4",
          "bg-surface-raised text-body-m transition-colors",
          abierto ? "border-ink" : "border-hairline hover:border-ink-quaternary",
          resumen ? "text-ink" : "text-ink-tertiary",
        )}
      >
        {resumen ?? "Selecciona un rango"}
        <IconoCalendario abierto={abierto} />
      </button>

      <AnimatePresence>
        {abierto && (
          <Calendario
            valor={valor}
            onChange={(rango) => {
              onChange(rango);
              if (rango.desde && rango.hasta) setAbierto(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Calendario({
  valor,
  onChange,
}: {
  valor: Rango;
  onChange: (rango: Rango) => void;
}) {
  const inicial = valor.desde ? new Date(valor.desde) : new Date();
  const [cursor, setCursor] = useState(
    new Date(inicial.getFullYear(), inicial.getMonth(), 1),
  );

  const celdas = useMemo(() => construirMes(cursor), [cursor]);

  function elegir(iso: string) {
    // Primer clic fija el inicio; el segundo cierra el rango. Si el segundo es
    // anterior al primero, se invierten en vez de rechazar el clic.
    if (!valor.desde || valor.hasta) {
      onChange({ desde: iso, hasta: null });
      return;
    }
    onChange(
      iso < valor.desde
        ? { desde: iso, hasta: valor.desde }
        : { desde: valor.desde, hasta: iso },
    );
  }

  // Signo del último salto de mes: la rejilla entra por el lado del que vino.
  const [direccion, setDireccion] = useState(0);

  const mover = (delta: number) => {
    setDireccion(delta);
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  return (
    <motion.div
      role="dialog"
      aria-label="Selecciona un rango de fechas"
      variants={popover}
      initial="oculto"
      animate="visible"
      exit="saliendo"
      // El panel crece desde su esquina superior izquierda, que es donde está
      // el botón que lo abrió. Escalar desde el centro lo haría aparecer como
      // una capa suelta en vez de como el despliegue de ese control.
      // Ancho fluido con tope y no fijo en 328px: dentro del panel de filtros la
      // columna mide ~327px en móvil, y un panel de 328px desborda la página por
      // un píxel. Las 7 celdas necesitan 280px, así que abajo no aprieta.
      className="absolute top-full left-0 z-30 mt-2 w-full max-w-[328px] origin-top-left rounded-nav bg-ink p-4 text-ink-inverse"
    >
      <div className="flex items-center justify-between pb-4">
        <p className="text-body-m font-semibold tabular-nums">
          {MESES[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <div className="flex items-center gap-1">
          <FlechaMes direccion="anterior" onClick={() => mover(-1)} />
          <FlechaMes direccion="siguiente" onClick={() => mover(1)} />
        </div>
      </div>

      <div className="grid grid-cols-7">
        {DIAS_SEMANA.map((dia, i) => (
          <span
            key={`${dia}-${i}`}
            aria-hidden
            className="flex h-10 items-center justify-center text-body-m text-calendar-outside"
          >
            {dia}
          </span>
        ))}
      </div>

      {/* La rejilla se desliza en el sentido del salto — a la izquierda si se
          avanzó de mes, a la derecha si se retrocedió. Es lo que evita el
          efecto de "los números cambiaron solos": el mes se mueve, y el gesto
          de la flecha queda ligado al resultado.

          Alto fijo de 6 semanas y `mode="popLayout"`: los dos meses coexisten
          durante el cruce, así que sin altura fija el panel daría un salto. */}
      <div className="relative h-60 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={direccion}>
          <motion.div
            key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
            // El sentido va por `custom` y variantes, no por valores literales:
            // el mes que sale se renderizó con la dirección del salto anterior,
            // así que un objeto inline lo mandaría hacia el lado equivocado.
            // `custom` en `AnimatePresence` es lo que le entrega el valor actual.
            custom={direccion}
            variants={MES}
            initial="entra"
            animate="centro"
            exit="sale"
            className="absolute inset-0 grid grid-cols-7 content-start"
          >
            {celdas.map(({ fecha, iso, delMes }) => {
              const esInicio = iso === valor.desde;
              const esFin = iso === valor.hasta;
              const dentro =
                valor.desde && valor.hasta && iso > valor.desde && iso < valor.hasta;

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => elegir(iso)}
                  aria-pressed={esInicio || esFin || Boolean(dentro)}
                  className={cn(
                    "flex h-10 cursor-pointer items-center justify-center text-body-m tabular-nums",
                    "transition-[color,background-color,transform] duration-150 ease-salida active:scale-90",
                    delMes ? "text-ink-inverse" : "text-calendar-outside",
                    (esInicio || esFin || dentro) && "bg-calendar-range",
                    esInicio && "rounded-l-full",
                    esFin && "rounded-r-full",
                    !esInicio && !esFin && !dentro && "hover:bg-calendar-range/50",
                  )}
                >
                  {fecha.getDate()}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const MES: Variants = {
  entra: (direccion: number) => ({ opacity: 0, x: direccion >= 0 ? 24 : -24 }),
  centro: { opacity: 1, x: 0, transition: { duration: 0.22, ease: SALIDA } },
  sale: (direccion: number) => ({
    opacity: 0,
    x: direccion >= 0 ? -24 : 24,
    transition: { duration: 0.18, ease: ESTANDAR },
  }),
};

/** Rejilla de 6 semanas: mes completo más el relleno de los meses vecinos. */
function construirMes(cursor: Date) {
  const primero = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const arranque = new Date(primero);
  arranque.setDate(1 - primero.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const fecha = new Date(arranque);
    fecha.setDate(arranque.getDate() + i);
    return {
      fecha,
      iso: aISO(fecha),
      delMes: fecha.getMonth() === cursor.getMonth(),
    };
  });
}

function FlechaMes({
  direccion,
  onClick,
}: {
  direccion: "anterior" | "siguiente";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direccion === "anterior" ? "Mes anterior" : "Mes siguiente"}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded-nav",
        "transition-[background-color,transform] duration-150 ease-salida",
        "hover:bg-calendar-range active:scale-90",
        direccion === "anterior" ? "hover:-translate-x-0.5" : "hover:translate-x-0.5",
      )}
    >
      <svg viewBox="0 0 8 12" fill="none" className="size-3">
        <path
          d={direccion === "anterior" ? "M6.5 1L1.5 6l5 5" : "M1.5 1l5 5-5 5"}
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function IconoCalendario({ abierto }: { abierto: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className={cn(
        "size-5 shrink-0 transition-colors duration-150 ease-salida",
        abierto ? "text-ink" : "text-ink-secondary",
      )}
    >
      <path
        d="M2.5 7.5h15M6 2.5v2.5M14 2.5v2.5M4.5 4.5h11a2 2 0 012 2v9a2 2 0 01-2 2h-11a2 2 0 01-2-2v-9a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
