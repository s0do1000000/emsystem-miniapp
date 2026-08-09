import { Play } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CTAButton from "@/components/CTAButton";
import Stroke from "@/components/Stroke";
import { ru } from "@/locales/ru";

const LESSON_VIDEO_URL = process.env.NEXT_PUBLIC_FREE_LESSON_VIDEO_URL;
const LESSON_VIDEO_POSTER =
  process.env.NEXT_PUBLIC_FREE_LESSON_VIDEO_POSTER ??
  "https://static.tildacdn.com/tild3133-3338-4638-a637-666430643439/photo_main.jpg";

export default function FreeLessonPage() {
  return (
    <>
      <PageHeader title={ru.free.title} />

      <section className="px-6 pt-6">
        <h1 className="font-display text-2xl italic text-goldLight">{ru.free.title}</h1>
        <Stroke className="my-3 text-gold" width={70} />
        <p className="mb-6 text-sm text-goldLight/70">{ru.free.subtitle}</p>

        <div className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-xl2 border border-line bg-surface">
          <video
            className="h-full w-full object-cover"
            poster={LESSON_VIDEO_POSTER}
            controls
            playsInline
          >
            {LESSON_VIDEO_URL && <source src={LESSON_VIDEO_URL} type="video/mp4" />}
          </video>
          {!LESSON_VIDEO_URL && (
            <div className="pointer-events-none absolute flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 text-ink">
              <Play size={26} fill="currentColor" />
            </div>
          )}
        </div>

        <p className="mt-6 text-[14px] leading-relaxed text-goldLight/80">{ru.free.afterText}</p>

        <div className="mt-6">
          <CTAButton href="/buy">{ru.free.cta}</CTAButton>
        </div>
      </section>
    </>
  );
}
