"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Empresa } from "@/data/mock";
import { PASOS, type PasoSlug } from "@/lib/factoring";
import { calcularDV } from "@/lib/format";

export type DatosEmpresa = {
  municipio: string;
  direccion: string;
  codigoPostal: string;
  actividadEconomica: string;
};

export type DatosRepresentante = {
  nombre: string;
  tipoDocumento: string;
  documento: string;
  correo: string;
  telefono: string;
};

type Borrador = {
  empresa: DatosEmpresa;
  representante: DatosRepresentante;
  autorizaDatos: boolean;
  autorizaCentrales: boolean;
};

type SolicitudValue = Borrador & {
  /** Datos precargados de registros oficiales: se verifican, no se editan. */
  precargado: Empresa;
  dv: number;
  setEmpresa: (parche: Partial<DatosEmpresa>) => void;
  setRepresentante: (parche: Partial<DatosRepresentante>) => void;
  setAutorizaDatos: (v: boolean) => void;
  setAutorizaCentrales: (v: boolean) => void;
  pasoCompleto: (slug: PasoSlug) => boolean;
  /** Si un paso todavía no es alcanzable, devuelve a dónde hay que volver. */
  redireccionPara: (slug: PasoSlug) => PasoSlug | null;
};

const SolicitudContext = createContext<SolicitudValue | null>(null);

export function SolicitudProvider({
  empresa,
  children,
}: {
  empresa: Empresa;
  children: ReactNode;
}) {
  const [borrador, setBorrador] = useState<Borrador>({
    empresa: {
      municipio: empresa.municipio,
      direccion: empresa.direccion,
      codigoPostal: empresa.codigoPostal,
      actividadEconomica: empresa.actividadEconomica,
    },
    representante: {
      nombre: "",
      tipoDocumento: "Cédula de ciudadanía",
      documento: "",
      correo: "",
      telefono: "",
    },
    autorizaDatos: false,
    autorizaCentrales: false,
  });

  const dv = useMemo(() => calcularDV(empresa.nit), [empresa.nit]);

  const setEmpresa = useCallback((parche: Partial<DatosEmpresa>) => {
    setBorrador((p) => ({ ...p, empresa: { ...p.empresa, ...parche } }));
  }, []);

  const setRepresentante = useCallback(
    (parche: Partial<DatosRepresentante>) => {
      setBorrador((p) => ({
        ...p,
        representante: { ...p.representante, ...parche },
      }));
    },
    [],
  );

  const setAutorizaDatos = useCallback(
    (v: boolean) => setBorrador((p) => ({ ...p, autorizaDatos: v })),
    [],
  );

  const setAutorizaCentrales = useCallback(
    (v: boolean) => setBorrador((p) => ({ ...p, autorizaCentrales: v })),
    [],
  );

  const pasoCompleto = useCallback(
    (slug: PasoSlug): boolean => {
      const { empresa: e, representante: r } = borrador;

      switch (slug) {
        case "empresa":
          return Boolean(
            e.municipio && e.direccion && e.codigoPostal && e.actividadEconomica,
          );
        case "representante-legal":
          return Boolean(r.nombre && r.documento && r.correo && r.telefono);
        case "confirmacion":
          return true;
        case "terminos":
          return borrador.autorizaDatos && borrador.autorizaCentrales;
      }
    },
    [borrador],
  );

  /**
   * Guarda de navegación: entrar por URL a un paso sin cumplir los anteriores
   * devuelve al primero que falte, en vez de mostrar un formulario huérfano.
   */
  const redireccionPara = useCallback(
    (slug: PasoSlug): PasoSlug | null => {
      const indice = PASOS.findIndex((p) => p.slug === slug);
      const faltante = PASOS.slice(0, indice).find((p) => !pasoCompleto(p.slug));
      return faltante?.slug ?? null;
    },
    [pasoCompleto],
  );

  const value = useMemo<SolicitudValue>(
    () => ({
      ...borrador,
      precargado: empresa,
      dv,
      setEmpresa,
      setRepresentante,
      setAutorizaDatos,
      setAutorizaCentrales,
      pasoCompleto,
      redireccionPara,
    }),
    [
      borrador,
      empresa,
      dv,
      setEmpresa,
      setRepresentante,
      setAutorizaDatos,
      setAutorizaCentrales,
      pasoCompleto,
      redireccionPara,
    ],
  );

  return (
    <SolicitudContext.Provider value={value}>
      {children}
    </SolicitudContext.Provider>
  );
}

export function useSolicitud(): SolicitudValue {
  const ctx = useContext(SolicitudContext);
  if (!ctx) {
    throw new Error("useSolicitud debe usarse dentro de <SolicitudProvider>");
  }
  return ctx;
}
