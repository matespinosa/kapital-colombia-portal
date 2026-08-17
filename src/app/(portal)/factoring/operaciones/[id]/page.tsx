import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetalleOperacion } from "@/components/factoring/detalle-operacion";
import { buscarOperacion, operaciones } from "@/data/operaciones";

export function generateStaticParams() {
  return operaciones.map((o) => ({ id: o.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/factoring/operaciones/[id]">): Promise<Metadata> {
  const { id } = await params;
  const operacion = buscarOperacion(id);

  return {
    title: operacion ? `Operación ${operacion.id}` : "Operación no encontrada",
  };
}

export default async function OperacionPage({
  params,
}: PageProps<"/factoring/operaciones/[id]">) {
  const { id } = await params;
  const operacion = buscarOperacion(id);

  if (!operacion) notFound();

  return <DetalleOperacion operacion={operacion} />;
}
