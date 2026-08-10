"use client";

import { motion } from "framer-motion";
import { locales, SUPPORTED_LANGS, useLocale } from "@/lib/i18n";

export default function LanguageSwitcher({
  onSelect,
}: {
  onSelect?: (code: string) => void;
}) {
  const { lang } = useLocale();

  function handleSelect(code: string) {
    if (!(code in locales)) return; // not translated yet — button stays disabled
    onSelect?.(code);
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {SUPPORTED_LANGS.map((l) => {
        const available = l.code in locales;
        const selected = lang === l.code;
        return (
          <motion.button
            key={l.code}
            disabled={!available}
            onClick={() => handleSelect(l.code)}
            whileTap={available ? { scale: 0.97 } : undefined}
            className={`relative rounded-xl2 border px-4 py-3 text-sm transition-colors ${
              selected
                ? "border-gold bg-gold/10 text-gold"
                : available
                  ? "border-line text-goldLight/70"
                  : "border-line/50 text-goldLight/30"
            }`}
          >
            {l.label}
            {!available && (
              <span className="absolute right-2 top-2 text-[9px] uppercase tracking-widest2 text-goldLight/30">
                soon
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
