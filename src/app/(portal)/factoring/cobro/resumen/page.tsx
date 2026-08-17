"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useCobro } from "@/components/factoring/cobro-context";
import { ValidacionOtp } from "@/components/factoring/validacion-otp";
import { Button } from "@/components/ui/button";
import { celularRepresentante, cuentaDesembolso } from "@/data/mock";
import { cn } from "@/lib/cn";
import { CONDICIONES_COBRO, RUTA_COBRO } from "@/lib/cobro";
import { formatCOP, formatPorcentaje } from "@/lib/format";

/**
 * 4.0 Resumen de operación — nodo `2094:12876`.
 *
 * Último punto de revisión antes de firmar. El desglose por factura muestra
 * comisión y descuento por separado porque son dos cobros distintos: uno fijo
 * sobre el monto y otro que depende de los días al vencimiento.
 *
 * Ver DESIGN.md §5.7
 */
export default function ResumenCobroPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { facturas, totales, vacio } = useCobro();
  const [validando, setValidando] = useState(false);

  if (vacio) return null;

  return (
    <div className="px-6 pb-16">
      <div className="flex flex-col gap-8 rounded-card bg-surface-raised p-6 lg:p-10">
        <h2 className="text-title-l font-semibold text-ink">Resumen</h2>

        <dl className="flex flex-col gap-4 md:w-[440px]">
          <Renglon label="Cuenta a desembolsar">{cuentaDesembolso}</Renglon>
          <Renglon label="Tiempo análisis facturas">24 horas</Renglon>
          <Renglon label="Número de facturas">{totales.numeroFacturas}</Renglon>
          <Renglon label="Monto total a negociar" destacado>
            {formatCOP(totales.montoTotal)}
          </Renglon>
        </dl>

        <hr className="border-hairline" />

        <div className="-mx-6 min-w-0 overflow-x-auto px-6 lg:mx-0 lg:px-0">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="text-left">
                <Encabezado>Nombre del proveedor</Encabezado>
                <Encabezado className="hidden lg:table-cell">
                  No. Factura
                </Encabezado>
                <Encabezado className="hidden xl:table-cell">
                  Financiar
                </Encabezado>
                <Encabezado className="hidden xl:table-cell">
                  Comisión
                </Encabezado>
                <Encabezado>Descuento</Encabezado>
                <Encabezado alineado="right">Monto a recibir</Encabezado>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura) => (
                <tr key={factura.id} className="border-t border-hairline">
                  <td className="py-4 pr-4 text-body-m text-ink-secondary">
                    {factura.pagador}
                    <span className="mt-1 block text-body-s whitespace-nowrap text-ink-tertiary tabular-nums lg:hidden">
                      {factura.numero}
                    </span>
                  </td>

                  <td className="hidden py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums lg:table-cell">
                    {factura.numero}
                  </td>

                  <td className="hidden py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums xl:table-cell">
                    {factura.diasFinanciar} días
                  </td>

                  <td className="hidden py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums xl:table-cell">
                    {formatPorcentaje(CONDICIONES_COBRO.comision)}
                  </td>

                  <td className="py-4 pr-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums">
                    {formatCOP(factura.descuentoTotal)}
                    <span className="mt-1 block text-body-s text-ink-tertiary xl:hidden">
                      {factura.diasFinanciar} días ·{" "}
                      {formatPorcentaje(CONDICIONES_COBRO.comision)} comisión
                    </span>
                  </td>

                  <td className="py-4 text-right text-body-m font-semibold whitespace-nowrap text-ink tabular-nums">
                    {formatCOP(factura.montoARecibir)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[520px] text-body-m text-ink-secondary">
            Al continuar confirmas que estas facturas no se han cedido a un
            tercero y que no serán canceladas.
          </p>

          <Button
            shape="rect"
            icon="up-right"
            className="w-full md:w-[220px]"
            onClick={() => setValidando(true)}
          >
            Continuar
          </Button>
        </div>
      </div>

      <ValidacionOtp
        celular={celularRepresentante}
        abierto={validando}
        onCerrar={() => setValidando(false)}
        onValidar={() =>
          router.push(`${RUTA_COBRO}/comprobante?${params.toString()}`)
        }
      />
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
      className={cn(
        "pb-4 text-body-m font-normal whitespace-nowrap text-ink-tertiary",
        alineado === "right" && "text-right",
        className,
      )}
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
