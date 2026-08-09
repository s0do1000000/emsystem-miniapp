import PageHeader from "@/components/PageHeader";
import WorksGallery from "@/components/WorksGallery";
import CTAButton from "@/components/CTAButton";
import { ru } from "@/locales/ru";

export default function WorksPage() {
  return (
    <>
      <PageHeader title={ru.works.title} />
      <section className="px-6 pt-6">
        <p className="mb-6 text-sm text-goldLight/70">{ru.works.subtitle}</p>
        <WorksGallery />
        <div className="mt-8">
          <CTAButton href="/buy">{ru.menu.buyCourse}</CTAButton>
        </div>
      </section>
    </>
  );
}
