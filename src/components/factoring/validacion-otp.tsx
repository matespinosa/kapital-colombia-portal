"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  CONDICIONES_COBRO,
  enmascararCelular,
  formatCuentaRegresiva,
} from "@/lib/cobro";

/**
 * 5.0 / 5.1 Código de validación — nodos `2094:11792` y `2094:11442`.
 *
 * Panel lateral sobre la pantalla de resumen: el usuario no cambia de lugar,
 * solo firma lo que ya está viendo. Ver DESIGN.md §5.7
 */
export function ValidacionOtp({
  celular,
  abierto,
  onCerrar,
  onValidar,
}: {
  celular: string;
  abierto: boolean;
  onCerrar: () => void;
  onValidar: () => void;
}) {
  // El panel se monta y desmonta en vez de esconderse: así el código a medio
  // escribir de un intento anterior no sobrevive a un cierre, sin necesidad de
  // reiniciar estado desde un efecto.
  if (!abierto) return null;

  return (
    <PanelOtp celular={celular} onCerrar={onCerrar} onValidar={onValidar} />
  );
}

function PanelOtp({
  celular,
  onCerrar,
  onValidar,
}: {
  celular: string;
  onCerrar: () => void;
  onValidar: () => void;
}) {
  const [digitos, setDigitos] = useState<string[]>(
    Array(CONDICIONES_COBRO.digitosOtp).fill(""),
  );
  // Anotado como `number`: `CONDICIONES_COBRO` es `as const`, así que sin esto
  // TypeScript infiere el literal 299 y rechaza cualquier otro valor.
  const [restante, setRestante] = useState<number>(
    CONDICIONES_COBRO.vigenciaOtpSegundos,
  );
  const [validando, setValidando] = useState(false);
  const campos = useRef<(HTMLInputElement | null)[]>([]);

  const completo = digitos.every((d) => d !== "");
  const expirado = restante === 0;

  // Cuenta regresiva de vigencia del código.
  useEffect(() => {
    const id = setInterval(
      () => setRestante((s) => (s > 0 ? s - 1 : 0)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  // El foco arranca en la primera casilla: el panel existe para escribir aquí.
  useEffect(() => {
    campos.current[0]?.focus();
  }, []);

  useEffect(() => {
    const escape = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [onCerrar]);

  function escribir(indice: number, valor: string) {
    const limpio = valor.replace(/\D/g, "");
    if (!limpio) return;

    setDigitos((prev) => {
      const siguiente = [...prev];
      // Pegar el código completo llena todas las casillas de una vez, que es
      // como llega desde el SMS en la mayoría de teclados móviles.
      [...limpio].slice(0, siguiente.length - indice).forEach((d, i) => {
        siguiente[indice + i] = d;
      });
      return siguiente;
    });

    const salto = Math.min(
      indice + limpio.length,
      CONDICIONES_COBRO.digitosOtp - 1,
    );
    campos.current[salto]?.focus();
  }

  function retroceder(indice: number, e: React.KeyboardEvent) {
    if (e.key !== "Backspace") return;

    setDigitos((prev) => {
      const siguiente = [...prev];
      // Si la casilla ya está vacía, el borrado se lleva la anterior: es lo que
      // espera quien corrige un dígito sin mirar el teclado.
      if (!siguiente[indice] && indice > 0) {
        siguiente[indice - 1] = "";
        campos.current[indice - 1]?.focus();
      } else {
        siguiente[indice] = "";
      }
      return siguiente;
    });
  }

  function confirmar() {
    setValidando(true);
    setTimeout(() => {
      setValidando(false);
      onValidar();
    }, 900);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar validación"
        onClick={onCerrar}
        className="absolute inset-0 cursor-default bg-ink/70"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-otp"
        className={cn(
          "relative flex h-full w-full flex-col gap-8 overflow-y-auto bg-surface-raised p-8",
          "sm:w-[556px]",
        )}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="cursor-pointer text-ink transition-colors hover:text-ink-secondary"
          >
            <IconoCerrar />
          </button>
        </div>

        <header className="flex flex-col gap-3">
          <h2 id="titulo-otp" className="text-title-l font-semibold text-ink">
            Código de validación
          </h2>
          <p className="text-body-m text-ink-secondary">
            Para mayor seguridad ingresa el código de validación de{" "}
            {CONDICIONES_COBRO.digitosOtp} dígitos que te enviamos al número
            celular {enmascararCelular(celular)}
          </p>
        </header>

        <div className="flex flex-col items-center gap-6 py-8">
          <div className="flex gap-3">
            {digitos.map((digito, i) => (
              <input
                key={i}
                ref={(el) => {
                  campos.current[i] = el;
                }}
                value={digito}
                onChange={(e) => escribir(i, e.target.value)}
                onKeyDown={(e) => retroceder(i, e)}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={CONDICIONES_COBRO.digitosOtp}
                aria-label={`Dígito ${i + 1} de ${CONDICIONES_COBRO.digitosOtp}`}
                disabled={expirado}
                className={cn(
                  "size-12 rounded-nav bg-surface-muted text-center",
                  "text-title-m font-semibold text-ink tabular-nums",
                  "border border-transparent transition-colors",
                  "focus:border-ink focus:outline-none",
                  "disabled:opacity-40",
                )}
              />
            ))}
          </div>

          <p className="text-body-m text-ink-secondary">
            {expirado ? (
              "El código expiró."
            ) : (
              <>
                El código expira en{" "}
                <strong className="font-semibold tabular-nums text-ink">
                  {formatCuentaRegresiva(restante)}
                </strong>
              </>
            )}
          </p>

          <p className="flex items-center gap-2 text-body-m text-ink-secondary">
            ¿No recibiste el sms?
            <button
              type="button"
              onClick={() => {
                setRestante(CONDICIONES_COBRO.vigenciaOtpSegundos);
                setDigitos(Array(CONDICIONES_COBRO.digitosOtp).fill(""));
                campos.current[0]?.focus();
              }}
              className="cursor-pointer font-semibold text-ink underline-offset-4 hover:underline"
            >
              Enviar de nuevo
            </button>
          </p>
        </div>

        <Button
          shape="rect"
          className="mt-auto w-full"
          disabled={!completo || expirado || validando}
          onClick={confirmar}
        >
          {validando ? "Validando…" : "Continuar"}
        </Button>
      </div>
    </div>
  );
}

function IconoCerrar() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="M4.5 4.5l11 11M15.5 4.5l-11 11"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </svg>
  );
}
