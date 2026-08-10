"use client";

import PageHeader from "@/components/PageHeader";
import FAQAccordion from "@/components/FAQAccordion";
import CTAButton from "@/components/CTAButton";
import { useLocale } from "@/lib/i18n";

export default function FAQPage() {
  const { t } = useLocale();
  return (
    <>
      <PageHeader title={t.faq.title} />
      <section className="px-6 pt-4">
        <FAQAccordion />
        <div className="mt-8">
          <CTAButton href="/buy">{t.faq.ctaBuy}</CTAButton>
        </div>
      </section>
    </>
  );
}
