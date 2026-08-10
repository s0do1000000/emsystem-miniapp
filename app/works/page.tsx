"use client";

import PageHeader from "@/components/PageHeader";
import WorksGallery from "@/components/WorksGallery";
import CTAButton from "@/components/CTAButton";
import { useLocale } from "@/lib/i18n";

export default function WorksPage() {
  const { t } = useLocale();
  return (
    <>
      <PageHeader title={t.works.title} />
      <section className="px-6 pt-6">
        <p className="mb-6 text-sm text-goldLight/70">{t.works.subtitle}</p>
        <WorksGallery />
        <div className="mt-8">
          <CTAButton href="/buy">{t.menu.buyCourse}</CTAButton>
        </div>
      </section>
    </>
  );
}
