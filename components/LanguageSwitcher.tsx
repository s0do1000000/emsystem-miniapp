"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
];

export default function LanguageSwitcher({
  onSelect,
}: {
  onSelect?: (code: string) => void;
}) {
  const [selected, setSelected] = useState("ru");

  function handleSelect(code: string) {
    setSelected(code);
    onSelect?.(code);
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {LANGUAGES.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => handleSelect(lang.code)}
          whileTap={{ scale: 0.97 }}
          className={`rounded-xl2 border px-4 py-3 text-sm transition-colors ${
            selected === lang.code
              ? "border-gold bg-gold/10 text-gold"
              : "border-line text-goldLight/70"
          }`}
        >
          {lang.label}
        </motion.button>
      ))}
    </div>
  );
}
