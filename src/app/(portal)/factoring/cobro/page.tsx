"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useCobro } from "@/components/factoring/cobro-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { RUTA_COBRO } from "@/lib/cobro";
import { formatCOP, formatFecha } from "@/lib/format";

/**
 * 3.0 Información de facturas — nodo `2094:12987`.
 *
 * Primer paso del cobro: la empresa revisa las facturas que RADIAN validó,
 * cuánto le descuentan por cada una y cuánto recibe. Puede quitar las que no
 * quiera antes de continuar.
 *
 * Ver DESIGN.md §5.7
 */
export default function InformacionFacturasPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { facturas, totales, eliminar, vacio } = useCobro();

  if (vacio) return null;

  return (
    <div className="px-6 pb-16">
      <div className="flex min-h-[calc(100dvh-var(--spacing-header)-4rem)] flex-col gap-8 rounded-card bg-surface-raised p-6 lg:p-10">
        <h2 className="text-title-l font-semibold text-ink">Facturas</h2>

        {/* Misma estrategia responsive que el tablero: las columnas
            secundarias no se esconden, bajan a la celda que las
            contextualiza. Ver DESIGN.md §5.5 */}
        <div className="-mx-6 overflow-x-auto px-6 lg:mx-0 lg:px-0">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="text-left">
                <Encabezado>Pagador</Encabezado>
                <Encabezado>Vencimiento</Encabezado>
                <Encabezado className="hidden xl:table-cell">
                  Financiar
                </Encabezado>
                <Encabezado className="hidden lg:table-cell">
                  Monto factura
                </Encabezado>
                <Encabezado>Monto a recibir</Encabezado>
                <Encabezado alineado="right">Acciones</Encabezado>
              </tr>
            </thead>

            <tbody>
              {facturas.map((factura) => (
                <tr key={factura.id} className="border-t border-hairline">
                  <td className="py-4 pr-4 text-body-m text-ink-secondary">
                    {factura.pagador}
                    <span className="mt-1 block text-body-s whitespace-nowrap text-ink-tertiary tabular-nums lg:hidden">
                      Factura {formatCOP(factura.monto)}
                    </span>
                  </td>

                  <td className="py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums">
                    {formatFecha(factura.vencimiento)}
                    <span className="mt-1 block text-body-s text-ink-tertiary xl:hidden">
                      {factura.diasFinanciar} días
                    </span>
                  </td>

                  <td className="hidden py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums xl:table-cell">
                    {factura.diasFinanciar} días
                  </td>

                  <td className="hidden py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums lg:table-cell">
                    {formatCOP(factura.monto)}
                  </td>

                  <td className="py-4 pr-4 text-body-m font-semibold whitespace-nowrap text-ink tabular-nums">
                    {formatCOP(factura.montoARecibir)}
                  </td>

                  <td className="py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => eliminar(factura.id)}
                        aria-label={`Quitar la factura de ${factura.pagador} de esta operación`}
                        className="cursor-pointer text-ink-secondary transition-colors hover:text-ink"
                      >
                        <IconoPapelera />
                      </button>
                      <button
                        type="button"
                        aria-label={`Ver el detalle de la factura de ${factura.pagador}`}
                        className="cursor-pointer text-ink-secondary transition-colors hover:text-ink"
                      >
                        <Icon name="descargar" size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-auto flex flex-col gap-8 pt-8">
          <dl className="flex flex-col gap-4 self-end md:w-[440px]">
            <Renglon label="Número de facturas">
              {totales.numeroFacturas}
            </Renglon>
            <Renglon label="Total descuento">
              {formatCOP(totales.descuentoTotal)}
            </Renglon>

            {/* Divisor punteado, como en el diseño: separa el desglose del
                total sin el peso de una línea sólida. */}
            <div className="border-t border-dashed border-hairline pt-4">
              <Renglon label="Monto total a recibir" destacado>
                {formatCOP(totales.montoARecibir)}
              </Renglon>
            </div>
          </dl>

          <Button
            shape="rect"
            className="w-full md:w-[220px] md:self-end"
            onClick={() =>
              router.push(`${RUTA_COBRO}/resumen?${params.toString()}`)
            }
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Encabezado({
  children,
  alineado,
  className,
}: {
  children: string;
  alineado?: "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={[
        "pb-4 text-body-m font-normal whitespace-nowrap text-ink-tertiary",
        alineado === "right" ? "text-right" : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function Renglon({
  label,
  children,
  destacado,
}: {
  label: string;
  children: React.ReactNode;
  destacado?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-body-m whitespace-nowrap text-ink-tertiary">
        {label}
      </dt>
      <dd
        className={[
          "text-right whitespace-nowrap tabular-nums",
          destacado
            ? "text-title-m font-semibold text-ink"
            : "text-body-m text-ink",
        ].join(" ")}
      >
        {children}
      </dd>
    </div>
  );
}

function IconoPapelera() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="M3.5 5.5h13M8 5.5V4a1 1 0 011-1h2a1 1 0 011 1v1.5M5 5.5l.7 10a1.5 1.5 0 001.5 1.4h5.6a1.5 1.5 0 001.5-1.4l.7-10M8.5 9v5M11.5 9v5"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
