"use client";

import { useRouter } from "next/navigation";

import { useSolicitud } from "@/components/factoring/solicitud-context";
import { Paso } from "@/components/factoring/solicitud-shell";
import { FieldGrid, SelectField, TextField } from "@/components/ui/field";
import { ACTIVIDADES, MUNICIPIOS, rutaPaso } from "@/lib/factoring";
import { formatFechaLarga } from "@/lib/format";

export default function PasoEmpresa() {
  const router = useRouter();
  const { precargado, dv, empresa, setEmpresa, pasoCompleto } = useSolicitud();

  return (
    <Paso
      slug="empresa"
      puedeContinuar={pasoCompleto("empresa")}
      onContinuar={() => router.push(rutaPaso("representante-legal"))}
    >
      <FieldGrid>
        {/* Precargados del registro mercantil: se verifican, no se editan. */}
        <TextField
          readOnly
          label="Razón social"
          value={precargado.razonSocial}
        />
        <TextField
          readOnly
          label="Fecha de constitución"
          value={formatFechaLarga(precargado.fechaConstitucion)}
        />
        <TextField readOnly label="NIT" value={precargado.nit} />
        <TextField readOnly label="Dígito de verificación" value={dv} />

        <SelectField
          label="Municipio sede"
          options={MUNICIPIOS}
          value={empresa.municipio}
          onChange={(e) => setEmpresa({ municipio: e.target.value })}
        />
        <TextField
          label="Dirección física"
          value={empresa.direccion}
          onChange={(e) => setEmpresa({ direccion: e.target.value })}
        />
        <TextField
          label="Código postal"
          inputMode="numeric"
          value={empresa.codigoPostal}
          onChange={(e) => setEmpresa({ codigoPostal: e.target.value })}
        />
        <SelectField
          label="Actividad económica"
          options={ACTIVIDADES}
          value={empresa.actividadEconomica}
          onChange={(e) => setEmpresa({ actividadEconomica: e.target.value })}
        />
      </FieldGrid>
    </Paso>
  );
}
