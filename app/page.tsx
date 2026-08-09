import Hero from "@/components/Hero";
import TrustBlock from "@/components/TrustBlock";
import CTAButton from "@/components/CTAButton";
import { ru } from "@/locales/ru";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBlock />
      <section className="px-6 pb-6">
        <CTAButton href="/buy">{ru.menu.buyCourse}</CTAButton>
      </section>
    </>
  );
}
