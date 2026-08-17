"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { SALIDA } from "@/lib/motion";

/**
 * Interpola una cifra hasta su nuevo valor. Ver DESIGN.md §3.7
 *
 * Se usa solo donde el número **es** el resultado de la acción del usuario —el
 * monto total de la selección de facturas, por ejemplo—: el barrido de dígitos
 * es lo que conecta "marqué esta factura" con "el total subió". En cifras que
 * solo se leen (saldos, cupos) sería ruido, y peor: una cifra en movimiento no
 * se puede leer mientras se mueve.
 *
 * Devuelve el valor tal cual si el usuario pidió menos movimiento.
 */
export function useContador(valor: number, duracion = 0.45) {
  const reducido = useReducedMotion();
  const [mostrado, setMostrado] = useState(valor);
  // El punto de partida es lo que hay en pantalla, no el valor anterior de la
  // prop: si se marcan tres facturas seguidas, cada animación tiene que
  // arrancar donde la interrumpieron y no saltar hacia atrás.
  const actual = useRef(valor);

  useEffect(() => {
    // Con movimiento reducido no hay animación que correr: basta dejar el ref
    // sincronizado por si la preferencia cambia a mitad de sesión. Escribir
    // estado aquí provocaría un render extra para llegar al valor que el propio
    // hook ya devuelve sin pasar por él.
    if (reducido) {
      actual.current = valor;
      return;
    }

    const control = animate(actual.current, valor, {
      duration: duracion,
      ease: SALIDA,
      onUpdate: (v) => {
        actual.current = v;
        setMostrado(v);
      },
    });

    return () => control.stop();
  }, [valor, duracion, reducido]);

  return reducido ? valor : mostrado;
}
