"use client";

import { Play } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CTAButton from "@/components/CTAButton";
import Stroke from "@/components/Stroke";
import { useLocale } from "@/lib/i18n";

// Same pattern as course/page.tsx — one literal env var per language so
// Next.js can inline each at build time, looked up dynamically at runtime.
const LESSON_VIDEO_URLS: Record<string, string | undefined> = {
  ru: process.env.NEXT_PUBLIC_FREE_LESSON_VIDEO_URL_RU || process.env.NEXT_PUBLIC_FREE_LESSON_VIDEO_URL,
  en: process.env.NEXT_PUBLIC_FREE_LESSON_VIDEO_URL_EN,
  fr: process.env.NEXT_PUBLIC_FREE_LESSON_VIDEO_URL_FR,
  it: process.env.NEXT_PUBLIC_FREE_LESSON_VIDEO_URL_IT,
};
const LESSON_VIDEO_POSTER =
  process.env.NEXT_PUBLIC_FREE_LESSON_VIDEO_POSTER ??
  "https://static.tildacdn.com/tild3133-3338-4638-a637-666430643439/photo_main.jpg";

export default function FreeLessonPage() {
  const { t, lang } = useLocale();
  const lessonVideoUrl = LESSON_VIDEO_URLS[lang] ?? LESSON_VIDEO_URLS.ru;

  return (
    <>
      <PageHeader title={t.free.title} />

      <section className="px-6 pt-6">
        <h1 className="font-display text-2xl italic text-goldLight">{t.free.title}</h1>
        <Stroke className="my-3 text-gold" width={70} />
        <p className="mb-6 text-sm text-goldLight/70">{t.free.subtitle}</p>

        <div className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-xl2 border border-line bg-surface">
          <video
            className="h-full w-full object-cover"
            poster={LESSON_VIDEO_POSTER}
            controls
            playsInline
          >
            {lessonVideoUrl && <source src={lessonVideoUrl} type="video/mp4" />}
          </video>
          {!lessonVideoUrl && (
            <div className="pointer-events-none absolute flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 text-ink">
              <Play size={26} fill="currentColor" />
            </div>
          )}
        </div>

        <p className="mt-6 text-[14px] leading-relaxed text-goldLight/80">{t.free.afterText}</p>

        <div className="mt-6">
          <CTAButton href="/buy">{t.free.cta}</CTAButton>
        </div>
      </section>
    </>
  );
}
