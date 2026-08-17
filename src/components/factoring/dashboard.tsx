"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { GraficaNegociadas } from "@/components/factoring/grafica-negociadas";
import { PanelProveedores } from "@/components/factoring/panel-proveedores";
import { TablaFacturas } from "@/components/factoring/tabla-facturas";
import { desplegar } from "@/lib/motion";

/**
 * Tablero de Factoring activo — nodo `1.1_Dashboard [Full]`.
 *
 * Al abrir el filtro, el resumen superior (gráfica y proveedores) se retira y
 * la tabla toma toda la pantalla. Filtrar es una tarea de lectura detallada:
 * dejar el resumen ocupando media pantalla obligaría a desplazarse para ver el
 * efecto de cada filtro sobre las filas, que es justamente lo que se está
 * evaluando. Ver DESIGN.md §5.4
 */
export function DashboardFactoring() {
  const [filtroAbierto, setFiltroAbierto] = useState(false);

  return (
    <div className="flex flex-col gap-6 px-6 pb-16">
      {/* El resumen se pliega hacia arriba en vez de desaparecer: el usuario
          acaba de pulsar "Filtrar" abajo, y ver el espacio cerrarse es lo que
          conecta ese clic con el hecho de que la tabla ahora ocupa todo. */}
      <AnimatePresence initial={false}>
        {!filtroAbierto && (
          <motion.div
            key="resumen"
            variants={desplegar}
            initial="oculto"
            animate="visible"
            exit="saliendo"
            className="overflow-hidden"
          >
            {/* Una sola tarjeta partida por un divisor vertical, no dos tarjetas:
                gráfica y ranking son dos lecturas del mismo periodo. */}
            <section className="grid gap-8 rounded-card bg-surface-raised p-6 lg:grid-cols-2 lg:gap-0">
              <div className="lg:pr-8">
                <GraficaNegociadas />
              </div>
              <div className="lg:border-l lg:border-hairline lg:pl-8">
                <PanelProveedores />
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <TablaFacturas
        filtroAbierto={filtroAbierto}
        onToggleFiltro={() => setFiltroAbierto((v) => !v)}
      />
    </div>
  );
}
