import Link from "next/link";

import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeading } from "@/components/ui/card";
import { Metric, ProgressBar } from "@/components/ui/metric";
import {
  cartera,
  cupoFlex,
  cupoPyme,
  empresa,
  movimientos,
  productos,
  type Cupo,
} from "@/data/mock";
import { cn } from "@/lib/cn";
import {
  formatCOP,
  formatCOPCompact,
  formatFecha,
  formatNIT,
  formatPorcentaje,
} from "@/lib/format";

/**
 * Operaciones — la raíz del portal. Responde "¿cómo está mi empresa hoy?" y
 * "¿qué más puedo contratar?". Ver DESIGN.md §5.1
 */
export default function OperacionesPage() {
  return (
    <div className="flex flex-col gap-6 px-6 pb-16">
      <Cupos />
      <FactoringDestacado />
      <CatalogoProductos />
      <UltimosMovimientos />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Cupos() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <CupoCard cupo={cupoPyme} href="/creditos/pyme" />
      <CupoCard cupo={cupoFlex} href="/flex" />
    </section>
  );
}

function CupoCard({ cupo, href }: { cupo: Cupo; href: string }) {
  const disponible = cupo.autorizado - cupo.utilizado;
  const razon = cupo.utilizado / cupo.autorizado;

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardHeading>{cupo.producto}</CardHeading>
          <p className="mt-1 text-body-s text-ink-tertiary">
            {empresa.razonSocial} · NIT {formatNIT(empresa.nit)}
          </p>
        </div>
        <span className="rounded-pill bg-surface-muted px-3 py-1.5 text-body-s font-semibold whitespace-nowrap text-ink-secondary">
          {formatPorcentaje(cupo.tasaAnual)} E.A.
        </span>
      </div>

      <Metric label="Cupo disponible" value={formatCOP(disponible)} size="md" />

      <div className="flex flex-col gap-3">
        <ProgressBar
          ratio={razon}
          label={`Cupo utilizado de ${cupo.producto}`}
        />
        <div className="flex justify-between text-body-s text-ink-tertiary">
          <span>Utilizado {formatCOPCompact(cupo.utilizado)}</span>
          <span>Aprobado {formatCOPCompact(cupo.autorizado)}</span>
        </div>
      </div>

      <ButtonLink href={href} variant="secondary" className="self-start">
        Usar cupo
      </ButtonLink>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Banner de conversión de Factoring. Usa la cartera real registrada en RADIAN
 * para que la oferta sea concreta y no un genérico "solicita ahora".
 */
function FactoringDestacado() {
  return (
    <section className="rounded-card bg-ink p-8 text-ink-inverse">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="flex max-w-[560px] flex-col gap-4">
          <p className="text-body-s font-semibold text-ink-inverse/60">
            Factoring
          </p>
          <h2 className="text-display-s font-semibold text-balance">
            Tienes {formatCOPCompact(cartera.montoPorCobrar)} por cobrar que
            podrías tener esta semana.
          </h2>
          <p className="text-body-m text-ink-inverse/70">
            Tus clientes te pagan en {cartera.plazoPromedioDias} días en
            promedio. Adelantamos hasta el 90 % del valor de tus facturas
            electrónicas, con desembolso en menos de 48 horas.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
          <Metric
            inverse
            label="Facturas en RADIAN"
            value={cartera.facturasPorCobrar.toLocaleString("es-CO")}
          />
          <Metric
            inverse
            label="Clientes pagadores"
            value={cartera.clientes.toLocaleString("es-CO")}
          />
          <ButtonLink href="/factoring" icon="up-right" variant="inverse">
            Solicitar Factoring
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function CatalogoProductos() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title-m font-semibold text-ink">
        Productos para tu empresa
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {productos.map((producto) => (
          <Link
            key={producto.id}
            href={producto.href}
            className={cn(
              "group flex flex-col gap-4 rounded-card bg-surface-raised p-6",
              // El sistema no usa sombra, así que la tarjeta no puede "flotar":
              // el realce es un desplazamiento de 2px hacia arriba, que da la
              // misma lectura de "esto responde" sin salirse del lenguaje.
              "transition-[background-color,transform] duration-150 ease-salida",
              "hover:-translate-y-0.5 hover:bg-surface-muted active:translate-y-0",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <Icon name={producto.icon} size={24} className="text-ink" />
              {producto.contratado && (
                <span className="rounded-pill bg-surface-muted px-3 py-1 text-body-s font-semibold whitespace-nowrap text-ink-secondary group-hover:bg-surface-raised">
                  Activo
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-title-s font-semibold text-ink">
                {producto.nombre}
              </h3>
              <p className="text-body-m text-ink-secondary">
                {producto.descripcion}
              </p>
            </div>

            <p className="mt-auto pt-2 text-body-s font-semibold text-ink-tertiary">
              {producto.detalle}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function UltimosMovimientos() {
  return (
    <Card as="section" className="flex flex-col gap-5">
      <CardHeading
        meta={
          <Link href="/operaciones" className="area-tactil">
            Ver todos
          </Link>
        }
      >
        Últimos movimientos
      </CardHeading>

      {/* Cinco columnas con concepto y contraparte no caben en 375px. El piso
          es el desplazamiento, no la compresión: `-mx-6 … px-6` lleva la zona
          desplazable hasta el filo de la tarjeta, y `min-w-0` es lo que permite
          que el contenedor se encoja por debajo de su contenido — sin él, un
          hijo de flex conserva `min-width: auto` y empuja la página entera.
          Ver la skill responsive-financiero. */}
      <div className="-mx-6 min-w-0 overflow-x-auto px-6">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="border-b border-hairline text-left">
              {["Fecha", "Concepto", "Contraparte", "Monto"].map((th, i) => (
                <th
                  key={th}
                  scope="col"
                  className={cn(
                    "pb-3 text-body-s font-semibold text-ink-tertiary",
                    i === 3 && "text-right",
                  )}
                >
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr
                key={mov.id}
                className="border-b border-hairline last:border-0"
              >
                <td className="py-4 text-body-m whitespace-nowrap text-ink-secondary tabular-nums">
                  {formatFecha(mov.fecha)}
                </td>
                <td className="py-4 text-body-m font-semibold text-ink">
                  {mov.concepto}
                </td>
                <td className="py-4 text-body-m text-ink-secondary">
                  {mov.contraparte}
                </td>
                <td
                  className={cn(
                    "py-4 text-right text-body-m font-semibold whitespace-nowrap tabular-nums",
                    mov.tipo === "abono" ? "text-ink" : "text-ink-secondary",
                  )}
                >
                  {mov.tipo === "abono" ? "+" : "−"} {formatCOP(mov.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
