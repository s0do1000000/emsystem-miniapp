"use client";

import Hero from "@/components/Hero";
import TrustBlock from "@/components/TrustBlock";
import CTAButton from "@/components/CTAButton";
import LanguageButton from "@/components/LanguageButton";
import { useLocale } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useLocale();
  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-40">
        <LanguageButton />
      </div>
      <Hero />
      <TrustBlock />
      <section className="px-6 pb-6">
        <CTAButton href="/buy">{t.menu.buyCourse}</CTAButton>
      </section>
    </div>
  );
}
