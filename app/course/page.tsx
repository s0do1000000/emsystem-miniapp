"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionEyebrow from "@/components/SectionEyebrow";
import ProgramGrid from "@/components/ProgramGrid";
import CTAButton from "@/components/CTAButton";
import { useLocale } from "@/lib/i18n";

// Next.js only inlines literal process.env.NEXT_PUBLIC_* expressions, so
// each language's variable must be written out explicitly (no dynamic
// key building). Falls back to the RU video if a language-specific one
// isn't set yet — add languages here as you upload more videos.
const ABOUT_VIDEO_URLS: Record<string, string | undefined> = {
  ru: process.env.NEXT_PUBLIC_ABOUT_VIDEO_URL_RU || process.env.NEXT_PUBLIC_ABOUT_VIDEO_URL,
  en: process.env.NEXT_PUBLIC_ABOUT_VIDEO_URL_EN,
  fr: process.env.NEXT_PUBLIC_ABOUT_VIDEO_URL_FR,
  it: process.env.NEXT_PUBLIC_ABOUT_VIDEO_URL_IT,
};
const ABOUT_VIDEO_POSTER =
  process.env.NEXT_PUBLIC_ABOUT_VIDEO_POSTER ??
  "https://thb.tildacdn.com/tild3935-6535-4939-b431-313536626363/-/resize/600x/photo_2026-06-16_12-.jpg";

export default function CoursePage() {
  const { t, lang } = useLocale();
  const aboutVideoUrl = ABOUT_VIDEO_URLS[lang] ?? ABOUT_VIDEO_URLS.ru;

  return (
    <>
      <PageHeader title={t.about.title} />

      <section className="px-6 pt-6">
        <SectionEyebrow>{t.about.videoLabel}</SectionEyebrow>
        <div className="relative aspect-video overflow-hidden rounded-xl2 border border-line bg-surface">
          {aboutVideoUrl ? (
            <video
              className="h-full w-full object-cover"
              poster={ABOUT_VIDEO_POSTER}
              controls
              playsInline
            >
              <source src={aboutVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <>
              <Image
                src={ABOUT_VIDEO_POSTER}
                alt="Евгения Эм"
                fill
                className="object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/90 text-ink">
                  <Play size={22} fill="currentColor" />
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-[15px] leading-relaxed text-goldLight">{t.about.intro}</p>
        <p className="mt-4 text-[14px] leading-relaxed text-goldLight/70">{t.about.body}</p>

        <div className="mt-6 rounded-xl2 border border-line bg-surface p-5">
          <div className="mb-3 font-display italic text-gold">{t.about.achievementsTitle}</div>
          <ul className="flex flex-col gap-2">
            {t.about.achievements.map((a) => (
              <li key={a} className="flex gap-2 text-[13px] leading-snug text-goldLight/75">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <CTAButton href="/free-lesson">{t.about.ctaFree}</CTAButton>
        </div>
      </section>

      <ProgramGrid />

      <section className="px-6 pb-6">
        <CTAButton href="/buy">{t.menu.buyCourse}</CTAButton>
      </section>
    </>
  );
}
