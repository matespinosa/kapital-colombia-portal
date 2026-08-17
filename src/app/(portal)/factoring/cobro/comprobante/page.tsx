"use client";

import { useCobro } from "@/components/factoring/cobro-context";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { cuentaDesembolso } from "@/data/mock";
import { CONDICIONES as CONDICIONES_FACTORING } from "@/lib/factoring";
import { formatCOP } from "@/lib/format";

/**
 * 6.0 Comprobante — cierre del cobro.
 *
 * El radicado se deriva de las facturas cedidas y no de la hora: la misma
 * operación recargada tiene que mostrar el mismo número, o el comprobante
 * dejaría de servir como referencia.
 *
 * Ver DESIGN.md §5.7
 */
export default function ComprobantePage() {
  const { facturas, totales, vacio } = useCobro();

  if (vacio) return null;

  const radicado = `CO-${facturas
    .map((f) => f.id.replace(/\D/g, ""))
    .join("")
    .padStart(6, "0")
    .slice(-6)}`;

  return (
    <div className="px-6 pb-16">
      <div className="flex flex-col gap-8">
        <section className="flex flex-col items-start gap-6 rounded-card bg-ink p-8 text-ink-inverse lg:p-10">
          <p className="text-body-s font-semibold text-ink-inverse/60">
            Comprobante {radicado}
          </p>

          <div className="flex flex-col gap-3">
            <h2 className="text-display-s font-semibold text-balance">
              Tu dinero va en camino.
            </h2>
            <p className="max-w-[560px] text-title-m text-ink-inverse/70">
              Depositamos {formatCOP(totales.montoARecibir)} en tu cuenta{" "}
              {cuentaDesembolso} en menos de {CONDICIONES_FACTORING.desembolsoHoras}{" "}
              horas. Te avisamos por correo en cuanto se refleje.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="inverse" shape="rect" icon="descargar">
              Descargar comprobante
            </Button>
            <ButtonLink
              href="/factoring"
              variant="ghost"
              shape="rect"
              className="text-ink-inverse/70 hover:bg-ink-inverse/10 hover:text-ink-inverse"
            >
              Volver a Factoring
            </ButtonLink>
          </div>
        </section>

        <section className="flex flex-col gap-5 rounded-card bg-surface-raised p-6 lg:p-10">
          <h3 className="text-title-s font-semibold text-ink">
            Facturas cedidas
          </h3>

          <ul className="flex flex-col">
            {facturas.map((factura) => (
              <li
                key={factura.id}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline py-4 last:border-0"
              >
                <span className="flex flex-col gap-1">
                  <span className="text-body-m font-semibold text-ink">
                    {factura.pagador}
                  </span>
                  <span className="text-body-s text-ink-tertiary tabular-nums">
                    {factura.numero} · {factura.diasFinanciar} días
                  </span>
                </span>

                <span className="flex items-center gap-4">
                  <span className="text-body-m font-semibold whitespace-nowrap text-ink tabular-nums">
                    {formatCOP(factura.montoARecibir)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Descargar el comprobante de la factura ${factura.numero}`}
                    className="cursor-pointer text-ink-secondary transition-colors hover:text-ink"
                  >
                    <Icon name="descargar" size={20} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
