"use client";

import { useState } from "react";

import { useSolicitud } from "@/components/factoring/solicitud-context";
import { Paso } from "@/components/factoring/solicitud-shell";
import { ButtonLink } from "@/components/ui/button";
import { CONDICIONES } from "@/lib/factoring";

export default function PasoTerminos() {
  const {
    representante,
    autorizaDatos,
    autorizaCentrales,
    setAutorizaDatos,
    setAutorizaCentrales,
    pasoCompleto,
  } = useSolicitud();

  const [enviando, setEnviando] = useState(false);
  const [radicado, setRadicado] = useState<string | null>(null);

  function enviar() {
    setEnviando(true);
    // Simula el radicado en underwriting y el envío a firma electrónica.
    setTimeout(() => {
      setRadicado(`SF-${Date.now().toString().slice(-8)}`);
      setEnviando(false);
    }, 1100);
  }

  if (radicado) {
    return <Radicada radicado={radicado} correo={representante.correo} />;
  }

  return (
    <Paso
      slug="terminos"
      etiquetaContinuar={enviando ? "Enviando…" : "Enviar solicitud"}
      puedeContinuar={pasoCompleto("terminos") && !enviando}
      onContinuar={enviar}
    >
      <section className="flex flex-col gap-5 rounded-card bg-surface-raised p-6">
        <h3 className="text-title-s font-semibold text-ink">
          Lo que estás autorizando
        </h3>

        <Autorizacion
          checked={autorizaDatos}
          onChange={setAutorizaDatos}
          titulo="Tratamiento de datos personales"
          detalle="Autorizo a Kapital a recolectar y tratar los datos de la empresa y de su representante legal conforme a la Ley 1581 de 2012 y a la política de privacidad."
        />

        <Autorizacion
          checked={autorizaCentrales}
          onChange={setAutorizaCentrales}
          titulo="Consulta y reporte en centrales de riesgo"
          detalle="Autorizo la consulta y el reporte de mi comportamiento crediticio ante las centrales de información financiera, conforme a la Ley 1266 de 2008."
        />
      </section>

      <p className="rounded-card border border-hairline p-5 text-body-m text-ink-secondary">
        Al enviar, tu solicitud pasa a estudio. Si es aprobada, podrás negociar
        facturas electrónicas inscritas en RADIAN por montos entre{" "}
        {(CONDICIONES.montoMinimoPrimera / 1_000_000).toLocaleString("es-CO")} y{" "}
        {(CONDICIONES.montoMaximoPrimera / 1_000_000).toLocaleString("es-CO")}{" "}
        millones en tu primera operación.
      </p>
    </Paso>
  );
}

function Autorizacion({
  checked,
  onChange,
  titulo,
  detalle,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  titulo: string;
  detalle: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-t border-hairline pt-5 first:border-0 first:pt-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 accent-ink"
      />
      <span className="flex flex-col gap-1">
        <span className="text-body-m font-semibold text-ink">{titulo}</span>
        <span className="text-body-m text-ink-secondary">{detalle}</span>
      </span>
    </label>
  );
}

/**
 * Estado final del flujo. Espeja el mensaje `pendiente_firma` de la pantalla
 * de Factoring: la solicitud queda radicada y la pelota pasa al representante
 * legal, que debe firmar desde su correo.
 */
function Radicada({
  radicado,
  correo,
}: {
  radicado: string;
  correo: string;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-var(--spacing-header))] items-center px-6">
      <section className="mx-auto flex w-full max-w-form flex-col items-start gap-6 rounded-card bg-ink p-10 text-ink-inverse">
        <p className="text-body-s font-semibold text-ink-inverse/60">
          Radicado {radicado}
        </p>

        <div className="flex flex-col gap-3">
          <h2 className="text-display-s font-semibold text-balance">
            Tu solicitud está lista para firmar
          </h2>
          <p className="text-title-m text-ink-inverse/70">
            Enviamos los documentos al correo del representante legal{" "}
            <strong className="font-semibold text-ink-inverse">{correo}</strong>
            . Fírmalos para completar tu proceso de Factoring.
          </p>
        </div>

        <ButtonLink href="/factoring" variant="inverse" icon="up-right">
          Volver a Factoring
        </ButtonLink>
      </section>
    </div>
  );
}
