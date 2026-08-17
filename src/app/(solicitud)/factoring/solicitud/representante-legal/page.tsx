"use client";

import { useRouter } from "next/navigation";

import { useSolicitud } from "@/components/factoring/solicitud-context";
import { Paso } from "@/components/factoring/solicitud-shell";
import { FieldGrid, SelectField, TextField } from "@/components/ui/field";
import { TIPOS_DOCUMENTO, rutaPaso } from "@/lib/factoring";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function PasoRepresentante() {
  const router = useRouter();
  const { representante, setRepresentante, pasoCompleto } = useSolicitud();

  // Solo se marca error cuando ya hay algo escrito: avisar sobre un campo
  // vacío que el usuario aún no ha tocado es ruido, no ayuda.
  const correoInvalido =
    representante.correo.length > 0 && !CORREO.test(representante.correo);

  return (
    <Paso
      slug="representante-legal"
      puedeContinuar={pasoCompleto("representante-legal") && !correoInvalido}
      onContinuar={() => router.push(rutaPaso("confirmacion"))}
    >
      <FieldGrid>
        <TextField
          label="Nombre completo"
          autoComplete="name"
          value={representante.nombre}
          onChange={(e) => setRepresentante({ nombre: e.target.value })}
        />
        <SelectField
          label="Tipo de documento"
          options={TIPOS_DOCUMENTO}
          value={representante.tipoDocumento}
          onChange={(e) => setRepresentante({ tipoDocumento: e.target.value })}
        />
        <TextField
          label="Número de documento"
          inputMode="numeric"
          value={representante.documento}
          onChange={(e) => setRepresentante({ documento: e.target.value })}
        />
        <TextField
          label="Teléfono de contacto"
          inputMode="tel"
          autoComplete="tel"
          value={representante.telefono}
          onChange={(e) => setRepresentante({ telefono: e.target.value })}
        />
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={representante.correo}
          error={correoInvalido ? "Revisa el formato del correo" : undefined}
          onChange={(e) => setRepresentante({ correo: e.target.value })}
        />
      </FieldGrid>

      <p className="rounded-card border border-hairline p-5 text-body-m text-ink-secondary">
        A este correo enviaremos los documentos para firma electrónica. Debe ser
        el del representante legal inscrito en el certificado de existencia y
        representación.
      </p>
    </Paso>
  );
}
