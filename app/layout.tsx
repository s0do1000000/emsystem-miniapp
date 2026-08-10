import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";
import { LocaleProvider } from "@/lib/i18n";

const displayFont = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EmSystem by Yevgeniya Em",
  description:
    "Авторская система обучения микроблейдингу для мастеров, которые хотят создавать чистые, естественные и предсказуемые результаты.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16130F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${displayFont.variable} ${manrope.variable}`}>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-ink text-goldLight font-body antialiased">
        <div className="mx-auto flex min-h-screen max-w-app flex-col">
          <Suspense fallback={null}>
            <LocaleProvider>
              <main className="flex-1 pb-24">{children}</main>
              <BottomNavigation />
            </LocaleProvider>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
