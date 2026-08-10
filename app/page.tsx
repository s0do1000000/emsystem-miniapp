"use client";

import Hero from "@/components/Hero";
import TrustBlock from "@/components/TrustBlock";
import CTAButton from "@/components/CTAButton";
import { useLocale } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useLocale();
  return (
    <>
      <Hero />
      <TrustBlock />
      <section className="px-6 pb-6">
        <CTAButton href="/buy">{t.menu.buyCourse}</CTAButton>
      </section>
    </>
  );
}
