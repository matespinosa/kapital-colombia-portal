import type { Metadata } from "next";
import Link from "next/link";

import { ResumenOperacion } from "@/components/factoring/detalle-operacion";
import { operaciones } from "@/data/operaciones";

export const metadata: Metadata = {
  title: "Operaciones de Factoring",
};

/** Historial de operaciones. Cada una lleva a su detalle. */
export default function OperacionesPage() {
  return (
    <div className="flex flex-col gap-4 px-6 pb-16">
      <h2 className="text-title-m font-semibold text-ink">
        Tus operaciones de Factoring
      </h2>

      <ul className="flex flex-col gap-3">
        {operaciones.map((operacion) => (
          <li key={operacion.id}>
            <Link
              href={`/factoring/operaciones/${operacion.id}`}
              className="block rounded-card bg-surface-raised p-6 transition-colors duration-150 hover:bg-surface-muted"
            >
              <ResumenOperacion operacion={operacion} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
