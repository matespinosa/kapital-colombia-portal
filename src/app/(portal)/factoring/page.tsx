import type { Metadata } from "next";
import Image from "next/image";

import { DashboardFactoring } from "@/components/factoring/dashboard";
import { ButtonLink } from "@/components/ui/button";
import { correoRepresentante, estadoFactoring } from "@/data/mock";
import type { EstadoFactoring } from "@/data/mock";
import { formatCOP } from "@/lib/format";

export const metadata: Metadata = {
  title: "Factoring",
  description:
    "Adelanta el valor de tus facturas electrónicas con plazos flexibles y mantén liquidez cuando la necesites.",
};

/**
 * Pantalla de Factoring — nodo `2090:3857` del Core Base Layout.
 *
 * Es una máquina de estados: el mismo layout (pieza visual a la izquierda,
 * copy a la derecha — espejado respecto al portal de México) cambia el mensaje
 * y la acción según en qué punto va la solicitud. Ver DESIGN.md §5.2
 */
export default function FactoringPage() {
  // Con la línea activa la pantalla deja de vender el producto y pasa a
  // operarlo: mismo módulo, misma cabecera, contenido completamente distinto.
  if (estadoFactoring === "activo") return <DashboardFactoring />;

  return (
    <div className="flex min-h-[calc(100dvh-var(--spacing-header))] items-center">
      {/* Espejo del layout de México: la pieza va a la izquierda y el copy a
          la derecha. Las medidas salen del nodo 2090:3857. */}
      <div className="flex w-full items-center gap-[71px] px-6 pb-8">
        <PiezaVisual />
        <Copy estado={estadoFactoring} />
      </div>
    </div>
  );
}


/* -------------------------------------------------------------------------- */

type Mensaje = {
  titulo: string;
  cuerpo: React.ReactNode;
  accion?: { label: string; href: string };
  ayuda?: boolean;
};

const MENSAJES: Record<EstadoFactoring, Mensaje> = {
  sin_solicitar: {
    titulo: "Recibe tu dinero sin esperar los plazos de pago.",
    cuerpo:
      "Te adelantamos el valor de tus facturas con plazos flexibles, para que mantengas liquidez cuando la necesites.",
    accion: { label: "Solicitar Factoring", href: "/factoring/solicitud" },
  },
  en_revision: {
    titulo: "Tu solicitud está en estudio.",
    cuerpo:
      "Estamos validando la información de tu empresa. Te avisamos por correo en cuanto tengamos una respuesta.",
    ayuda: true,
  },
  pendiente_firma: {
    titulo: "Tu solicitud está lista para firmar",
    cuerpo: (
      <>
        Enviamos los documentos al correo del representante legal{" "}
        <strong className="font-semibold text-ink">{correoRepresentante}</strong>
        . Fírmalos para completar tu proceso de Factoring.
      </>
    ),
    ayuda: true,
  },
  rechazada: {
    titulo: "No pudimos aprobar tu solicitud.",
    cuerpo:
      "Por ahora tu empresa no cumple los criterios de la línea de Factoring. Puedes volver a intentarlo en 90 días o revisar otros productos.",
    accion: { label: "Ver otros productos", href: "/" },
    ayuda: true,
  },
  activo: {
    titulo: "Tu línea de Factoring está activa.",
    cuerpo:
      "Carga tus facturas electrónicas desde la DIAN y recibe hasta el 90 % de su valor en menos de 48 horas.",
    accion: { label: "Cargar facturas", href: "/factoring/facturas" },
  },
};

function Copy({ estado }: { estado: EstadoFactoring }) {
  const mensaje = MENSAJES[estado];

  return (
    <div className="flex w-[410px] max-w-full shrink-0 flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-display-m font-semibold text-balance text-ink">
          {mensaje.titulo}
        </h2>

        <p className="text-title-m text-ink-secondary">
          <span aria-hidden className="mr-1">
            —
          </span>
          {mensaje.cuerpo}
        </p>
      </div>

      {mensaje.accion && (
        <ButtonLink
          href={mensaje.accion.href}
          icon="up-right"
          className="self-start"
        >
          {mensaje.accion.label}
        </ButtonLink>
      )}

      {mensaje.ayuda && (
        <div className="flex flex-col gap-3 pt-4">
          <p className="text-body-m text-ink-secondary">
            ¿Tienes dudas o necesitas ayuda?
          </p>
          <a
            href="mailto:soporte@kapital.cc"
            className="text-body-m font-semibold text-ink underline-offset-4 hover:underline"
          >
            Contáctanos
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Pieza visual: tarjeta texturizada de 426×540 con el tablero de facturas y la
 * barra de selección flotando encima. Tanto el tablero como la barra **exceden
 * el ancho de la tarjeta** a propósito — por eso el recorte vive solo en la
 * capa de texturas y no en el contenedor.
 *
 * Geometría tomada del nodo `2090:3866`, con el origen en la esquina superior
 * izquierda de la barra flotante (el elemento más ancho de la composición).
 */
function PiezaVisual() {
  return (
    <div
      aria-hidden
      className="relative hidden h-[540px] w-[492px] shrink-0 xl:block"
    >
      {/* Tarjeta base con las texturas recortadas a su radio */}
      <div className="absolute top-0 left-[30px] h-[540px] w-[426px] overflow-hidden rounded-[11.6px] bg-surface-muted">
        <Image
          src="/img/co-bg-light.png"
          alt=""
          width={969}
          height={784}
          priority
          className="pointer-events-none absolute max-w-none object-cover opacity-25"
          style={{ left: "-272px", top: "-244px" }}
        />
        <Image
          src="/img/co-noise.png"
          alt=""
          fill
          sizes="426px"
          className="pointer-events-none object-cover mix-blend-hard-light"
        />
      </div>

      <Image
        src="/img/co-dash.png"
        alt=""
        width={465}
        height={287}
        priority
        className="absolute max-w-none"
        style={{ left: "13.4px", top: "106.6px", width: "465px" }}
      />

      <BarraSeleccion />
    </div>
  );
}

/**
 * Barra de selección de facturas. Va como DOM y no como parte de la imagen
 * porque en el producto real es interactiva; aquí se conserva a escala para
 * que la pieza comunique qué se puede hacer con las facturas.
 */
function BarraSeleccion() {
  return (
    <div
      className="absolute flex w-[492px] items-center justify-between rounded-[5.7px] bg-overlay px-[11.4px] py-[10.9px] text-ink-inverse backdrop-blur-[2px]"
      style={{ left: 0, top: "369px" }}
    >
      <div className="flex gap-[11.4px]">
        <DatoBarra label="Facturas" valor="3" />
        <DatoBarra label="Clientes" valor="3" />
        <DatoBarra label="Monto total" valor={formatCOP(200_000_000)} />
      </div>

      <div className="flex items-center gap-[11.4px]">
        <span className="flex size-[22.8px] items-center justify-center rounded-full border-[0.5px] border-white">
          <svg viewBox="0 0 9.21313 9.21313" fill="none" className="size-[11.4px]">
            <path
              d="M4.60656 6.98108V0.332432M8.88069 6.98108C8.88069 8.03014 8.03014 8.88069 6.98108 8.88069H2.23205C1.18298 8.88069 0.332432 8.03014 0.332432 6.98108M6.98108 4.60656L4.60609 6.98156L2.23157 4.60656"
              stroke="currentColor"
              strokeWidth={0.665}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="flex h-[22.8px] items-center rounded-[3.3px] border-[0.5px] border-white px-[15.2px] text-[6.65px] font-semibold tracking-[0.5px]">
          Cancelar
        </span>
        <span className="flex h-[22.8px] items-center rounded-[3.3px] bg-white px-[15.2px] text-[6.65px] font-medium tracking-[0.5px] text-ink">
          Cobrar
        </span>
      </div>
    </div>
  );
}

function DatoBarra({ label, valor }: { label: string; valor: string }) {
  return (
    <span className="flex flex-col gap-[1.9px] whitespace-nowrap">
      <span className="text-[6.65px] tracking-[0.24px]">{label}</span>
      <span className="text-[9.5px] font-bold tracking-[0.47px]">{valor}</span>
    </span>
  );
}
