import Image from "next/image";
import { Play } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionEyebrow from "@/components/SectionEyebrow";
import ProgramGrid from "@/components/ProgramGrid";
import CTAButton from "@/components/CTAButton";
import { ru } from "@/locales/ru";

export default function CoursePage() {
  return (
    <>
      <PageHeader title={ru.about.title} />

      <section className="px-6 pt-6">
        <SectionEyebrow>{ru.about.videoLabel}</SectionEyebrow>
        <div className="relative aspect-video overflow-hidden rounded-xl2 border border-line bg-surface">
          <Image
            src="https://thb.tildacdn.com/tild3935-6535-4939-b431-313536626363/-/resize/600x/photo_2026-06-16_12-.jpg"
            alt="Евгения Эм"
            fill
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/90 text-ink">
              <Play size={22} fill="currentColor" />
            </div>
          </div>
        </div>

        <p className="mt-6 text-[15px] leading-relaxed text-goldLight">{ru.about.intro}</p>
        <p className="mt-4 text-[14px] leading-relaxed text-goldLight/70">{ru.about.body}</p>

        <div className="mt-6 rounded-xl2 border border-line bg-surface p-5">
          <div className="mb-3 font-display italic text-gold">{ru.about.achievementsTitle}</div>
          <ul className="flex flex-col gap-2">
            {ru.about.achievements.map((a) => (
              <li key={a} className="flex gap-2 text-[13px] leading-snug text-goldLight/75">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <CTAButton href="/free-lesson">{ru.about.ctaFree}</CTAButton>
        </div>
      </section>

      <ProgramGrid />

      <section className="px-6 pb-6">
        <CTAButton href="/buy">{ru.menu.buyCourse}</CTAButton>
      </section>
    </>
  );
}
