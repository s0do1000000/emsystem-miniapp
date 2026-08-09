import PageHeader from "@/components/PageHeader";
import FAQAccordion from "@/components/FAQAccordion";
import CTAButton from "@/components/CTAButton";
import { ru } from "@/locales/ru";

export default function FAQPage() {
  return (
    <>
      <PageHeader title={ru.faq.title} />
      <section className="px-6 pt-4">
        <FAQAccordion />
        <div className="mt-8">
          <CTAButton href="/buy">{ru.faq.ctaBuy}</CTAButton>
        </div>
      </section>
    </>
  );
}
