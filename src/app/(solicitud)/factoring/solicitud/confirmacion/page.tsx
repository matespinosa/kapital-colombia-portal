"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useSolicitud } from "@/components/factoring/solicitud-context";
import { Paso } from "@/components/factoring/solicitud-shell";
import { rutaPaso } from "@/lib/factoring";
import { formatFechaLarga, formatNIT } from "@/lib/format";

export default function PasoConfirmacion() {
  const router = useRouter();
  const { precargado, dv, empresa, representante } = useSolicitud();

  return (
    <Paso
      slug="confirmacion"
      etiquetaContinuar="Confirmar y continuar"
      onContinuar={() => router.push(rutaPaso("terminos"))}
    >
      <Bloque
        titulo="Empresa"
        editar={() => router.push(rutaPaso("empresa"))}
        datos={[
          ["Razón social", precargado.razonSocial],
          ["NIT", formatNIT(precargado.nit, dv)],
          ["Fecha de constitución", formatFechaLarga(precargado.fechaConstitucion)],
          ["Municipio sede", empresa.municipio],
          ["Dirección física", empresa.direccion],
          ["Código postal", empresa.codigoPostal],
          ["Actividad económica", empresa.actividadEconomica],
        ]}
      />

      <Bloque
        titulo="Representante legal"
        editar={() => router.push(rutaPaso("representante-legal"))}
        datos={[
          ["Nombre completo", representante.nombre],
          [
            "Documento",
            `${representante.tipoDocumento} ${representante.documento}`,
          ],
          ["Correo electrónico", representante.correo],
          ["Teléfono", representante.telefono],
        ]}
      />
    </Paso>
  );
}

function Bloque({
  titulo,
  datos,
  editar,
}: {
  titulo: string;
  datos: [string, ReactNode][];
  editar: () => void;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-card bg-surface-raised p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-title-s font-semibold text-ink">{titulo}</h3>
        <button
          type="button"
          onClick={editar}
          className="cursor-pointer text-body-m font-semibold text-ink-tertiary transition-colors hover:text-ink"
        >
          Editar
        </button>
      </div>

      <dl className="flex flex-col">
        {datos.map(([label, valor]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-6 border-b border-hairline py-3 last:border-0"
          >
            <dt className="text-body-m whitespace-nowrap text-ink-secondary">
              {label}
            </dt>
            <dd className="text-right text-body-m font-semibold text-ink">
              {valor}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
