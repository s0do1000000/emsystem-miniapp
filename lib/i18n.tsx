"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ru, type Locale } from "@/locales/ru";
import { en } from "@/locales/en";

// Add a new language here once its locales/<code>.ts file exists —
// everything else (switcher, cookie persistence, bot deep links) picks
// it up automatically.
export const locales: Record<string, Locale> = { ru, en };

export const SUPPORTED_LANGS: { code: string; label: string }[] = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
];

const COOKIE_NAME = "em_lang";
const DEFAULT_LANG = "ru";

function isSupported(code: string | null | undefined): code is keyof typeof locales {
  return !!code && code in locales;
}

function readCookieLang(): string {
  if (typeof document === "undefined") return DEFAULT_LANG;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const code = match?.[1];
  return isSupported(code) ? code : DEFAULT_LANG;
}

function persistLang(code: string) {
  document.cookie = `${COOKIE_NAME}=${code}; path=/; max-age=31536000`;
}

type LocaleContextValue = {
  lang: string;
  t: Locale;
  setLang: (code: string) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [lang, setLangState] = useState<string>(DEFAULT_LANG);

  useEffect(() => {
    // Priority: ?lang= in the URL (set by the bot's language buttons when
    // opening the Mini App) > previously saved cookie > Russian default.
    const fromUrl = searchParams.get("lang");
    if (isSupported(fromUrl)) {
      persistLang(fromUrl);
      setLangState(fromUrl);
      return;
    }
    setLangState(readCookieLang());
    // Only run this on first mount — after that, language changes go
    // through setLang() below, not the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLang(code: string) {
    if (!isSupported(code)) return;
    persistLang(code);
    setLangState(code);
  }

  const t = isSupported(lang) ? locales[lang] : locales[DEFAULT_LANG];

  return <LocaleContext.Provider value={{ lang, t, setLang }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used inside <LocaleProvider>");
  }
  return ctx;
}
