"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  RANGO_VACIO,
  SelectorRango,
  type Rango,
} from "@/components/factoring/selector-rango";
import {
  conteos,
  facturasDashboard,
  type EstadoFactura,
  type FacturaDashboard,
} from "@/data/negociadas";
import { cn } from "@/lib/cn";
import { formatCOP, formatCOPExacto, formatFecha, formatNIT } from "@/lib/format";
import {
  aparecer,
  barraFlotante,
  desplegar,
  DURACION,
  RESORTE,
  SALIDA,
} from "@/lib/motion";
import { useContador } from "@/lib/use-contador";

const PESTANAS: { estado: EstadoFactura; label: string; chip: string }[] = [
  { estado: "por_cobrar", label: "Por cobrar", chip: "bg-info-soft" },
  { estado: "pendiente", label: "Pendientes", chip: "bg-warning-soft" },
  { estado: "aprobada", label: "Aprobadas", chip: "bg-success-soft" },
  { estado: "rechazada", label: "Rechazadas", chip: "bg-neutral-soft" },
];

type Orden = { columna: "emision" | "vencimiento"; asc: boolean };

const enRango = (fecha: string, rango: Rango) =>
  (!rango.desde || fecha >= rango.desde) && (!rango.hasta || fecha <= rango.hasta);

/**
 * Tablero de facturas del Factoring activo — nodo `1.1_Dashboard [Full]` y sus
 * estados de filtro (`1.6.1`, `1.6.2`). Ver DESIGN.md §5.4
 */
export function TablaFacturas({
  filtroAbierto,
  onToggleFiltro,
}: {
  filtroAbierto: boolean;
  onToggleFiltro: () => void;
}) {
  const [pestana, setPestana] = useState<EstadoFactura>("por_cobrar");
  const [orden, setOrden] = useState<Orden>({ columna: "vencimiento", asc: true });
  const [marcadas, setMarcadas] = useState<string[]>([]);

  const [emision, setEmision] = useState<Rango>(RANGO_VACIO);
  const [vencimiento, setVencimiento] = useState<Rango>(RANGO_VACIO);
  const [busqueda, setBusqueda] = useState("");

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const soloDigitos = termino.replace(/\D/g, "");

    return facturasDashboard
      .filter((f) => f.estado === pestana)
      .filter((f) => enRango(f.emision, emision))
      .filter((f) => enRango(f.vencimiento, vencimiento))
      .filter(
        (f) =>
          !termino ||
          f.cliente.toLowerCase().includes(termino) ||
          (soloDigitos.length > 0 && f.nit.includes(soloDigitos)),
      )
      .sort((a, b) => {
        const dif = a[orden.columna].localeCompare(b[orden.columna]);
        return orden.asc ? dif : -dif;
      });
  }, [pestana, emision, vencimiento, busqueda, orden]);

  const seleccionadas = visibles.filter((f) => marcadas.includes(f.id));
  const todasMarcadas =
    visibles.length > 0 && seleccionadas.length === visibles.length;

  const hayFiltros =
    Boolean(emision.desde || vencimiento.desde || busqueda.trim());

  /** Cambiar de pestaña limpia la selección: cobrar mezclando estados no aplica. */
  function cambiarPestana(estado: EstadoFactura) {
    setPestana(estado);
    setMarcadas([]);
  }

  function limpiarFiltros() {
    setEmision(RANGO_VACIO);
    setVencimiento(RANGO_VACIO);
    setBusqueda("");
  }

  return (
    <section className="flex flex-col gap-5 rounded-card bg-surface-raised p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <h2 className="text-title-s font-semibold text-ink">Facturas</h2>

        {/* Los dos rótulos completos suman ~330px: en 375px caben justos y
            envuelven mal. Se apilan, con el divisor solo cuando van en fila. El
            `py-2.5` de móvil no es decorativo — sube el objetivo táctil de 18px
            a 38px sin separar visualmente los dos enlaces. */}
        <div className="flex flex-col text-body-m font-semibold sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            className="min-h-11 cursor-pointer text-left text-ink transition-colors hover:text-ink-secondary sm:min-h-0"
          >
            Cargar facturas manual
          </button>
          <span aria-hidden className="hidden h-3 w-px bg-hairline sm:block" />
          <button
            type="button"
            className="min-h-11 cursor-pointer text-left text-ink transition-colors hover:text-ink-secondary sm:min-h-0"
          >
            Cargar facturas DIAN
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between gap-4 border-b border-hairline">
        {/* La franja se desplaza en vez de envolver: con las pestañas en dos
            renglones el subrayado deslizante salta entre filas y la línea
            inferior deja de leerse como una sola. Ver la skill. */}
        <nav className="tira-scroll -mb-px flex items-center gap-6 pb-px">
          {PESTANAS.map((p) => {
            const activa = p.estado === pestana;

            return (
              <button
                key={p.estado}
                type="button"
                onClick={() => cambiarPestana(p.estado)}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  // pb-3.5 = pb-3 + los 2px que antes ocupaba `border-b-2`:
                  // el subrayado salió del box del botón, la altura no cambia.
                  "area-tactil relative flex shrink-0 cursor-pointer items-center gap-2 pb-3.5 text-body-m transition-colors",
                  activa ? "font-semibold text-ink" : "text-ink-secondary hover:text-ink",
                )}
              >
                {p.label}
                <span
                  className={cn(
                    "rounded-pill px-2 py-0.5 text-body-s font-semibold tabular-nums text-ink",
                    "transition-transform duration-150 ease-salida",
                    activa && "scale-105",
                    p.chip,
                  )}
                >
                  {conteos[p.estado].toLocaleString("es-CO")}
                </span>

                {/* El subrayado es un único nodo compartido entre las cuatro
                    pestañas: `layoutId` hace que Motion lo desplace de una a
                    otra en vez de apagarlo aquí y encenderlo allá. El recorrido
                    es lo que comunica que se cambió de vista sobre el mismo
                    conjunto de datos — un salto no diría nada. */}
                {activa && (
                  <motion.span
                    aria-hidden
                    layoutId="pestana-activa"
                    transition={RESORTE}
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-ink"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onToggleFiltro}
          aria-expanded={filtroAbierto}
          className="area-tactil flex shrink-0 cursor-pointer items-center gap-2 pb-3 text-body-m font-semibold text-ink-secondary transition-colors hover:text-ink"
        >
          {filtroAbierto ? "Cerrar" : "Filtrar"}
          {/* Los dos iconos se relevan girando sobre el mismo punto: el control
              es uno solo con dos estados, y un corte seco lo haría parecer que
              el botón fue reemplazado por otro. */}
          <span className="relative flex size-4 items-center justify-center">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={filtroAbierto ? "cerrar" : "filtrar"}
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ duration: 0.16, ease: SALIDA }}
                className="absolute flex"
              >
                {filtroAbierto ? <IconoCerrar /> : <IconoFiltro />}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
      </div>

      {/* El panel crece empujando la tabla hacia abajo en lugar de aparecer
          encima: así se ve que los controles y las filas son la misma pieza.
          `overflow-hidden` es obligatorio mientras la altura se interpola —
          sin él el contenido se derrama fuera del panel a media animación. */}
      <AnimatePresence initial={false}>
        {filtroAbierto && (
          <motion.div
            key="filtros"
            variants={desplegar}
            initial="oculto"
            animate="visible"
            exit="saliendo"
            className="overflow-hidden"
          >
            <div className="grid gap-6 pb-2 md:grid-cols-2 xl:grid-cols-3">
              <SelectorRango label="Emisión" valor={emision} onChange={setEmision} />
              <SelectorRango
                label="Vencimiento"
                valor={vencimiento}
                onChange={setVencimiento}
              />
              <div className="flex flex-col gap-2">
                <label htmlFor="buscar-facturas" className="text-body-s text-ink-tertiary">
                  Buscar por
                </label>
                <div className="group relative">
                  <input
                    id="buscar-facturas"
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Cliente o NIT"
                    className="h-12 w-full rounded-nav border border-hairline bg-surface-raised pr-11 pl-4 text-body-m text-ink transition-colors duration-150 ease-salida placeholder:text-ink-tertiary hover:border-ink-quaternary focus:border-ink focus:outline-none"
                  />
                  <IconoLupa />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* overflow-x-auto es el piso: por debajo de ~700px la tabla se desplaza
          en lugar de comprimir las cifras hasta volverlas ilegibles. */}
      <div className="-mx-6 min-w-0 overflow-x-auto px-6">
        <table className="w-full min-w-[360px] border-collapse sm:min-w-[640px]">
          <thead>
            <tr className="text-left">
              <th scope="col" className="w-10 pr-3 pb-4 align-top">
                <input
                  type="checkbox"
                  checked={todasMarcadas}
                  onChange={() => setMarcadas(todasMarcadas ? [] : visibles.map((f) => f.id))}
                  aria-label="Seleccionar todas las facturas visibles"
                  className="area-tactil mt-0.5 size-4 cursor-pointer accent-ink"
                />
              </th>
              <Encabezado>Nombre del cliente</Encabezado>
              <Encabezado className="hidden lg:table-cell">NIT</Encabezado>
              <Encabezado
                className="hidden xl:table-cell"
                orden={orden.columna === "emision" ? orden.asc : undefined}
                onClick={() => setOrden({ columna: "emision", asc: orden.columna === "emision" ? !orden.asc : true })}
              >
                Emisión
              </Encabezado>
              <Encabezado
                className="hidden sm:table-cell"
                orden={orden.columna === "vencimiento" ? orden.asc : undefined}
                onClick={() => setOrden({ columna: "vencimiento", asc: orden.columna === "vencimiento" ? !orden.asc : true })}
              >
                Vencimiento
              </Encabezado>
              <Encabezado>Monto total</Encabezado>
              <Encabezado alineado="right">Acciones</Encabezado>
            </tr>
          </thead>

          {/* `key={pestana}` remonta el cuerpo al cambiar de estado, y ese
              remontaje es lo que vuelve a disparar la animación CSS de entrada
              de cada fila: al cambiar de pestaña el contenido es otro conjunto
              de facturas y conviene que se lea como tal.

              El escalonado va en CSS y no en variantes de Motion porque el
              `initial` de Motion se serializa en el HTML del servidor: la
              tabla llegaría con todas las filas en `opacity: 0` y no se leería
              una sola cifra hasta que hidratara el bundle. `AnimatePresence`
              se queda con lo que CSS no puede hacer — retirar de a una las
              filas que dejan de coincidir al filtrar. */}
          <tbody key={pestana}>
            <AnimatePresence initial={false} mode="popLayout">
              {visibles.map((factura, i) => (
                <Fila
                  key={factura.id}
                  factura={factura}
                  indice={i}
                  marcada={marcadas.includes(factura.id)}
                  onToggle={() =>
                    setMarcadas((p) =>
                      p.includes(factura.id)
                        ? p.filter((x) => x !== factura.id)
                        : [...p, factura.id],
                    )
                  }
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {visibles.length === 0 && (
          <motion.div
            key="vacio"
            variants={aparecer}
            initial="oculto"
            animate="visible"
            exit="saliendo"
            // El mensaje entra después de que las filas terminaron de salir:
            // encimarlos deja un instante en el que se lee "no hay facturas"
            // sobre facturas todavía visibles.
            transition={{ delay: 0.12 }}
            className="flex flex-col items-center gap-3 py-12"
          >
            <p className="text-body-m text-ink-tertiary">
              {hayFiltros
                ? "Ninguna factura coincide con los filtros."
                : "No tienes facturas en este estado."}
            </p>
            {hayFiltros && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="cursor-pointer text-body-m font-semibold text-ink underline-offset-4 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {seleccionadas.length > 0 && (
          <BarraSeleccion
            key="barra-seleccion"
            facturas={seleccionadas}
            onCancelar={() => setMarcadas([])}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Encabezado({
  children,
  orden,
  onClick,
  alineado,
  className,
}: {
  children: string;
  orden?: boolean;
  onClick?: () => void;
  alineado?: "right";
  className?: string;
}) {
  const contenido = (
    <>
      {children}
      {onClick && (
        <motion.span
          aria-hidden
          // La flecha gira en vez de intercambiarse por su opuesta: el giro
          // dice "misma columna, orden invertido"; dos glifos distintos harían
          // pensar en dos controles distintos.
          animate={{ rotate: orden === false ? 180 : 0, opacity: orden === undefined ? 0.35 : 1 }}
          transition={RESORTE}
          className="inline-block"
        >
          ↓
        </motion.span>
      )}
    </>
  );

  return (
    <th
      scope="col"
      // aria-sort es propiedad de columnheader, no del botón que va dentro.
      aria-sort={
        !onClick ? undefined : orden === undefined ? "none" : orden ? "ascending" : "descending"
      }
      className={cn(
        "pb-4 text-body-m font-semibold whitespace-nowrap text-ink",
        alineado === "right" && "text-right",
        className,
      )}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="area-tactil flex cursor-pointer items-center gap-1.5 transition-colors hover:text-ink-secondary"
        >
          {contenido}
        </button>
      ) : (
        contenido
      )}
    </th>
  );
}

/**
 * Estrategia responsive: al angostarse, las columnas secundarias no se
 * esconden — se **reubican** como segunda línea dentro de la celda que las
 * contextualiza. El NIT baja bajo el nombre del cliente y la emisión bajo el
 * vencimiento. Así la tabla se comprime sin que se pierda ningún dato.
 * Ver DESIGN.md §5.5
 */
function Fila({
  factura,
  indice,
  marcada,
  onToggle,
}: {
  factura: FacturaDashboard;
  indice: number;
  marcada: boolean;
  onToggle: () => void;
}) {
  return (
    // `layout="position"` y no `layout` a secas: al reordenar por fecha
    // interesa que la fila viaje a su nuevo sitio, no que además interpole su
    // ancho — en una tabla eso deforma las columnas a media animación.
    <motion.tr
      layout="position"
      exit={{ opacity: 0, transition: { duration: DURACION.rapida } }}
      transition={RESORTE}
      // El tope del retardo evita que una tabla larga tarde segundos en
      // terminar de aparecer: pasadas ~10 filas todas entran a la vez.
      style={{ animationDelay: `${Math.min(indice, 10) * 25}ms` }}
      className={cn(
        "animar-aparecer border-t border-hairline",
        "transition-colors duration-150 ease-salida",
        marcada ? "bg-surface-muted/60" : "hover:bg-surface/70",
      )}
    >
      {/* `align-top` y no el centrado por defecto: en móvil un nombre de cliente
          largo ocupa tres líneas y la casilla quedaba flotando a media altura,
          lejos de la fila que representa. */}
      <td className="py-4 pr-3 align-top">
        <input
          type="checkbox"
          checked={marcada}
          onChange={onToggle}
          aria-label={`Seleccionar factura de ${factura.cliente}`}
          // 16px es el tamaño correcto del control en el diseño, pero un
          // objetivo de 16px en táctil se falla — y fallar aquí significa
          // marcar la factura de al lado. `area-tactil` amplía la zona
          // sensible a 44px sin tocar el glifo.
          className="area-tactil mt-0.5 size-4 cursor-pointer accent-ink"
        />
      </td>

      <td className="py-4 pr-4 text-body-m text-ink-secondary">
        {factura.cliente}
        <span className="mt-1 block text-body-s whitespace-nowrap text-ink-tertiary tabular-nums lg:hidden">
          {formatNIT(factura.nit)}
        </span>
        {/* En 375px, con el vencimiento ocupando columna propia el monto
            quedaba fuera de pantalla: había que arrastrar la tabla para ver
            cuánto vale cada factura, que es el dato por el que se entra aquí.
            El vencimiento baja aquí y el monto sube a primera vista. */}
        <span className="mt-1 block text-body-s whitespace-nowrap text-ink-tertiary tabular-nums sm:hidden">
          Vence {formatFecha(factura.vencimiento)}
        </span>
      </td>

      <td className="hidden py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums lg:table-cell">
        {formatNIT(factura.nit)}
      </td>

      <td className="hidden py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums xl:table-cell">
        {formatFecha(factura.emision)}
      </td>

      <td className="hidden py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums sm:table-cell">
        {formatFecha(factura.vencimiento)}
        <span className="mt-1 block text-body-s text-ink-tertiary xl:hidden">
          Emitida {formatFecha(factura.emision)}
        </span>
      </td>

      <td className="py-4 pr-4 text-body-m font-semibold whitespace-nowrap text-ink tabular-nums">
        {formatCOPExacto(factura.monto)}
      </td>

      {/* Una factura por cobrar todavía no se ha cedido, así que no tiene
          operación que abrir. En vez de un enlace muerto, no hay enlace. */}
      <td className="py-4 text-right">
        {factura.operacionId ? (
          <Link
            href={`/factoring/operaciones/${factura.operacionId}`}
            aria-label={`Ver la operación de la factura de ${factura.cliente}`}
            className="area-tactil inline-block rounded-nav px-2 leading-none text-ink-tertiary transition-[color,transform] duration-150 ease-salida hover:scale-125 hover:text-ink active:scale-105"
          >
            ⋮
          </Link>
        ) : (
          <span aria-hidden className="px-2 leading-none text-ink-quaternary">
            ⋮
          </span>
        )}
      </td>
    </motion.tr>
  );
}

/**
 * Barra de acción de la selección. Se queda pegada al borde inferior mientras
 * haya facturas marcadas: la decisión de cobrar se toma mirando el total, y ese
 * total tiene que seguir visible al recorrer una tabla larga.
 */
function BarraSeleccion({
  facturas,
  onCancelar,
}: {
  facturas: FacturaDashboard[];
  onCancelar: () => void;
}) {
  const total = facturas.reduce((s, f) => s + f.monto, 0);
  const clientes = new Set(facturas.map((f) => f.nit)).size;

  // El monto es la cifra sobre la que se decide cobrar, y es la única que se
  // mueve al marcar una factura más. Interpolarla hace visible esa relación;
  // conteos y clientes cambian de a uno y no ganarían nada con el barrido.
  const totalAnimado = useContador(total);

  return (
    <motion.div
      variants={barraFlotante}
      initial="oculto"
      animate="visible"
      exit="saliendo"
      // En móvil la barra se apila: las tres cifras arriba y las acciones
      // abajo. Los datos van primero porque el total es lo que se está mirando
      // para decidir. Ver la skill responsive-financiero.
      className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-card bg-overlay px-4 py-3 text-ink-inverse backdrop-blur-[2px] sm:bottom-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
    >
      {/* Envuelve, no se desplaza. Con `overflow-x-auto` el monto total —que es
          justo la cifra sobre la que se decide— quedaba cortado al borde de la
          barra en 375px, y había que arrastrar para leerlo. Al envolver baja a
          una segunda línea y siempre se lee entero. */}
      <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-2 sm:gap-8">
        <Dato label="Facturas" valor={facturas.length.toLocaleString("es-CO")} />
        <Dato label="Clientes" valor={clientes.toLocaleString("es-CO")} />
        <Dato label="Monto total" valor={formatCOP(Math.round(totalAnimado))} />
      </div>

      {/* "Cobrar" no comparte fila con "Cancelar" en móvil: son la acción que
          mueve dinero y la que la descarta, y a un pulgar de distancia una se
          confunde con la otra. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Descargar selección"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/80 transition-[background-color,transform] duration-150 ease-salida hover:bg-white/10 active:scale-95"
        >
          <svg viewBox="0 0 9.21313 9.21313" fill="none" className="size-4">
            <path
              d="M4.60656 6.98108V0.332432M8.88069 6.98108C8.88069 8.03014 8.03014 8.88069 6.98108 8.88069H2.23205C1.18298 8.88069 0.332432 8.03014 0.332432 6.98108M6.98108 4.60656L4.60609 6.98156L2.23157 4.60656"
              stroke="currentColor"
              strokeWidth={0.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={onCancelar}
          className="h-10 flex-1 cursor-pointer rounded-nav border border-white/80 px-6 text-body-m font-semibold transition-[background-color,transform] duration-150 ease-salida hover:bg-white/10 active:scale-[0.97] sm:flex-none"
        >
          Cancelar
        </button>
        </div>

        {/* La selección viaja en la URL: el flujo de cobro se puede recargar
            y compartir sin perderla. Ver DESIGN.md §5.7 */}
        <Link
          href={`/factoring/cobro?facturas=${facturas.map((f) => f.id).join(",")}`}
          className="flex h-10 cursor-pointer items-center justify-center rounded-nav bg-surface-raised px-6 text-body-m font-semibold text-ink transition-[background-color,transform] duration-150 ease-salida hover:bg-surface-muted active:scale-[0.97]"
        >
          Cobrar
        </Link>
      </div>
    </motion.div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <span className="flex flex-col gap-1 whitespace-nowrap">
      <span className="text-body-s text-ink-inverse/60">{label}</span>
      <span className="text-body-m font-bold tabular-nums">{valor}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */

function IconoFiltro() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-4">
      <path
        d="M1.5 3.5h13M3.5 8h9M6.5 12.5h3"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconoCerrar() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-4">
      <path
        d="M3.5 3.5l9 9M12.5 3.5l-9 9"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconoLupa() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-secondary transition-colors duration-150 group-focus-within:text-ink"
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth={1.4} />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}
