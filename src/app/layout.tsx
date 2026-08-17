import type { Metadata } from "next";
import { Onest } from "next/font/google";

import { MotionProvider } from "@/components/motion-provider";

import "./globals.css";

/**
 * Fallback libre de TT Interfaces (licencia comercial de TypeType). El stack
 * en `--font-sans` prioriza TT Interfaces si se instala en public/fonts/.
 * Ver DESIGN.md §3.2
 */
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portal Empresarial · Kapital",
    template: "%s · Kapital",
  },
  description:
    "Administra los productos financieros de tu empresa y solicita Factoring para adelantar el valor de tus facturas electrónicas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${onest.variable} h-full`}>
      <body className="min-h-full font-sans">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
