"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export default function LanguageButton({ className = "" }: { className?: string }) {
  const { lang } = useLocale();

  return (
    <Link
      href="/language"
      className={`flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-goldLight/80 ${className}`}
    >
      <Globe size={14} className="text-gold" />
      {lang}
    </Link>
  );
}
