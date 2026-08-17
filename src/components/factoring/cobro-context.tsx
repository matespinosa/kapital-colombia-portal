"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { facturasDashboard } from "@/data/negociadas";
import {
  prepararFactura,
  totalesCobro,
  type FacturaCobro,
} from "@/lib/cobro";

type CobroValue = {
  facturas: FacturaCobro[];
  totales: ReturnType<typeof totalesCobro>;
  /** Quita una factura de la operación sin salir del flujo. */
  eliminar: (id: string) => void;
  /** `true` cuando ya no queda ninguna factura que cobrar. */
  vacio: boolean;
};

const CobroContext = createContext<CobroValue | null>(null);

/**
 * Estado del cobro en curso.
 *
 * Las facturas se preparan **una sola vez**, al montar: los días al vencimiento
 * y por lo tanto el descuento quedan congelados durante todo el flujo. Si se
 * recalcularan en cada render, cruzar la medianoche a mitad del proceso
 * cambiaría el importe que el usuario ya vio y aceptó.
 *
 * Ver DESIGN.md §5.7
 */
export function CobroProvider({
  hoyISO,
  children,
}: {
  hoyISO: string;
  children: ReactNode;
}) {
  const router = useRouter();

  // La selección viaja en la URL para que el flujo sea recargable y compartible
  // entre pestañas; el estado derivado vive aquí.
  const ids = useSearchParams().get("facturas")?.split(",") ?? [];

  const [facturas, setFacturas] = useState<FacturaCobro[]>(() => {
    const [y, m, d] = hoyISO.split("-").map(Number);
    const hoy = new Date(y, m - 1, d);

    return facturasDashboard
      .filter((f) => ids.includes(f.id))
      .map((f, i) =>
        prepararFactura(f, `SETP${900_0000_000 + i}`, hoy),
      );
  });

  const eliminar = useCallback(
    (id: string) => {
      setFacturas((prev) => {
        const quedan = prev.filter((f) => f.id !== id);
        // Quitar la última factura deja el flujo sin objeto: se vuelve al
        // tablero en lugar de dejar una pantalla de cobro sin nada que cobrar.
        if (quedan.length === 0) router.replace("/factoring");
        return quedan;
      });
    },
    [router],
  );

  const value = useMemo<CobroValue>(
    () => ({
      facturas,
      totales: totalesCobro(facturas),
      eliminar,
      vacio: facturas.length === 0,
    }),
    [facturas, eliminar],
  );

  return <CobroContext.Provider value={value}>{children}</CobroContext.Provider>;
}

export function useCobro(): CobroValue {
  const ctx = useContext(CobroContext);
  if (!ctx) throw new Error("useCobro debe usarse dentro de <CobroProvider>");
  return ctx;
}
