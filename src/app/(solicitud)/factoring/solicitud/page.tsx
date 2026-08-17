import { redirect } from "next/navigation";

import { PASOS, rutaPaso } from "@/lib/factoring";

/** La solicitud siempre entra por el primer paso. */
export default function SolicitudIndex() {
  redirect(rutaPaso(PASOS[0].slug));
}
