import Link from "next/link";

import { Icon } from "@/components/icons";
import { proveedores } from "@/data/negociadas";
import { formatCOPExacto } from "@/lib/format";

/** Ranking de pagadores por monto facturado. Nodo `2090:10056`. */
export function PanelProveedores() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-title-s font-semibold text-ink">Proveedores</h2>
        <Link
          href="/factoring/proveedores"
          className="flex items-center gap-1 text-body-m font-semibold text-ink transition-colors hover:text-ink-secondary"
        >
          Ver todos
          <Icon name="up-right" size={16} />
        </Link>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left">
            <th scope="col" className="pb-3 text-body-m font-normal text-ink-tertiary">
              Empresa
            </th>
            <th scope="col" className="pb-3 text-right text-body-m font-normal text-ink-tertiary">
              Monto de facturas
            </th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => (
            <tr key={proveedor.empresa} className="border-t border-hairline">
              <td className="py-3 pr-4 text-body-m text-ink-secondary">
                {proveedor.empresa}
              </td>
              <td className="py-3 text-right text-body-m font-semibold whitespace-nowrap text-ink tabular-nums">
                {formatCOPExacto(proveedor.monto)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
