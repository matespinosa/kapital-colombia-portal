import type { ReactNode } from "react";

import { Icon } from "@/components/icons";
import {
  ETIQUETA_PROCESO,
  montoARecibir,
  totalesOperacion,
  type EstadoOperacion,
  type Operacion,
} from "@/data/operaciones";
import { cn } from "@/lib/cn";
import { formatCOP, formatCOPExacto, formatFechaLarga } from "@/lib/format";

const plural = (n: number, singular: string, plural: string) =>
  `${n} ${n === 1 ? singular : plural}`;

const INSIGNIA: Record<EstadoOperacion, { label: string; clase: string }> = {
  aprobada: { label: "Aprobado", clase: "bg-badge-success" },
  pendiente: { label: "Pendiente", clase: "bg-warning-soft" },
  rechazada: { label: "Rechazado", clase: "bg-neutral-soft" },
};

/**
 * Detalle de una operación de Factoring — nodos `[E] 1.6 Detalle Operación`.
 *
 * La pantalla es la misma para todos los estados; lo que cambia es qué se
 * muestra. Ver DESIGN.md §5.6
 */
export function DetalleOperacion({ operacion }: { operacion: Operacion }) {
  const totales = totalesOperacion(operacion);
  const insignia = INSIGNIA[operacion.estado];

  return (
    <div className="px-6 pb-16">
      <article className="flex flex-col gap-8 rounded-card bg-surface-raised p-10">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-title-l font-semibold text-ink">
              Resumen operación
            </h2>

            {/* Sin desembolso no hay comprobante que ver: ofrecerlo llevaría a
                un documento inexistente. */}
            {operacion.proceso === "finalizada" && (
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 text-body-m text-ink transition-colors hover:text-ink-secondary"
              >
                Ver comprobante
                <Icon name="descargar" size={20} />
              </button>
            )}
          </div>

          <span
            className={cn(
              "w-fit rounded-nav px-2 py-1 text-body-s font-semibold text-ink",
              insignia.clase,
            )}
          >
            {insignia.label}
          </span>
        </header>

        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-2">
          <dl className="flex flex-col gap-4">
            <Dato label="Fecha de solicitud">
              {formatFechaLarga(operacion.fechaSolicitud)}
            </Dato>
            <Dato label="Cuenta a desembolsar">
              {operacion.cuentaDesembolso}
            </Dato>
            <Dato label="Tiempo análisis facturas">
              {operacion.tiempoAnalisisHoras} horas
            </Dato>

            {/* El proceso solo existe una vez aprobada la operación. Mientras
                está en estudio el renglón desaparece en lugar de ir vacío. */}
            {operacion.proceso && (
              <Dato label="Proceso">{ETIQUETA_PROCESO[operacion.proceso]}</Dato>
            )}
          </dl>

          <div className="flex flex-col gap-8">
            <dl className="flex flex-col gap-4">
              <Dato label="Número de clientes">{totales.numeroClientes}</Dato>
              <Dato label="Número de facturas">{totales.numeroFacturas}</Dato>
            </dl>

            <dl className="flex flex-col gap-4">
              <Dato label="Monto de facturas">
                {formatCOPExacto(totales.montoFacturas)}
              </Dato>
              <Dato label="Descuentos totales">
                {formatCOPExacto(totales.descuentos)}
              </Dato>
              <div className="border-t border-ink-secondary pt-4">
                <Dato label="Monto a financiar" destacado>
                  {formatCOPExacto(totales.montoAFinanciar)}
                </Dato>
              </div>
            </dl>
          </div>
        </div>

        {operacion.estado === "rechazada" && operacion.motivoRechazo && (
          <p className="rounded-card border border-hairline p-5 text-body-m text-ink-secondary">
            <strong className="font-semibold text-ink">
              Por qué no se aprobó.
            </strong>{" "}
            {operacion.motivoRechazo}
          </p>
        )}

        <hr className="border-hairline" />

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-title-s font-semibold text-ink">
              Facturas negociadas
            </h3>
            {totales.enRevision > 0 && (
              <p className="text-body-s text-ink-tertiary">
                {plural(totales.enRevision, "factura sigue", "facturas siguen")}{" "}
                en revisión y no {totales.enRevision === 1 ? "suma" : "suman"} a
                los totales
              </p>
            )}
          </div>

          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="text-left">
                  <Encabezado>Nombre del cliente</Encabezado>
                  <Encabezado>No. Factura</Encabezado>
                  <Encabezado>Financiar</Encabezado>
                  <Encabezado>Descuento</Encabezado>
                  <Encabezado>Monto a recibir</Encabezado>
                  <th scope="col" className="w-10 pb-4">
                    <span className="sr-only">Comprobante</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {operacion.facturas.map((factura) => (
                  <tr
                    key={factura.numero}
                    // Una factura aún en revisión se atenúa entera, incluido su
                    // comprobante: todavía no hay nada que descargar.
                    className={cn(!factura.resuelta && "opacity-40")}
                  >
                    <td className="py-3 pr-4 text-body-m text-ink-secondary">
                      {factura.cliente}
                    </td>
                    <td className="py-3 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums">
                      {factura.numero}
                    </td>
                    <td className="py-3 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums">
                      {factura.diasFinanciar} días
                    </td>
                    <td className="py-3 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums">
                      {formatCOPExacto(factura.descuento)}
                    </td>
                    <td className="py-3 pr-4 text-body-m font-semibold whitespace-nowrap text-ink tabular-nums">
                      {formatCOPExacto(montoARecibir(factura))}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        disabled={!factura.resuelta}
                        aria-label={`Descargar comprobante de la factura ${factura.numero}`}
                        className="cursor-pointer text-ink-secondary transition-colors hover:text-ink disabled:cursor-not-allowed"
                      >
                        <Icon name="descargar" size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </article>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Dato({
  label,
  children,
  destacado,
}: {
  label: string;
  children: ReactNode;
  destacado?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-body-m whitespace-nowrap text-ink-tertiary">
        {label}
      </dt>
      <dd
        className={cn(
          "text-right whitespace-nowrap tabular-nums",
          destacado
            ? "text-title-m font-semibold text-ink"
            : "text-body-m text-ink",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

function Encabezado({ children }: { children: string }) {
  return (
    <th
      scope="col"
      className="pb-4 text-body-m font-normal whitespace-nowrap text-ink-tertiary"
    >
      {children}
    </th>
  );
}

/** Resumen de una línea para listar operaciones. */
export function ResumenOperacion({ operacion }: { operacion: Operacion }) {
  const totales = totalesOperacion(operacion);
  const insignia = INSIGNIA[operacion.estado];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-3">
          <span className="text-body-m font-semibold text-ink">
            {formatFechaLarga(operacion.fechaSolicitud)}
          </span>
          <span
            className={cn(
              "rounded-nav px-2 py-0.5 text-body-s font-semibold text-ink",
              insignia.clase,
            )}
          >
            {insignia.label}
          </span>
        </span>
        <span className="text-body-s text-ink-tertiary">
          {plural(totales.numeroFacturas, "factura", "facturas")} ·{" "}
          {plural(totales.numeroClientes, "cliente", "clientes")}
          {operacion.proceso && ` · ${ETIQUETA_PROCESO[operacion.proceso]}`}
        </span>
      </div>

      <span className="text-title-s font-semibold tabular-nums text-ink">
        {formatCOP(totales.montoAFinanciar)}
      </span>
    </div>
  );
}
