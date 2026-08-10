"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Stroke from "./Stroke";
import CTAButton from "./CTAButton";
import { useLocale } from "@/lib/i18n";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://static.tildacdn.com/tild3133-3338-4638-a637-666430643439/photo_main.jpg"
          alt=""
          fill
          priority
          className="object-cover object-top opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/80 to-ink" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative flex flex-col gap-6 px-6 pb-10 pt-16"
      >
        <motion.span variants={item} className="eyebrow text-gold">
          {t.home.kicker}
        </motion.span>

        <motion.h1
          variants={item}
          className="font-display text-[2.4rem] italic leading-[1.05] text-goldLight"
        >
          {t.home.title.split("\n").map((line) => (
            <span key={line} className="block not-italic font-medium">
              {line}
            </span>
          ))}
          <span className="mt-1 block text-xl not-italic tracking-widest2 text-gold">
            {t.home.titleAccent.toUpperCase()}
          </span>
        </motion.h1>

        <motion.div variants={item}>
          <Stroke className="text-gold" width={90} />
        </motion.div>

        <motion.p variants={item} className="max-w-[38ch] text-[15px] leading-relaxed text-goldLight/80">
          {t.home.subtitle}
        </motion.p>

        <motion.div variants={item} className="mt-2 flex flex-col gap-3">
          <CTAButton href="/course">{t.home.ctaPrimary}</CTAButton>
          <CTAButton href="/free-lesson" variant="outline">
            {t.home.ctaSecondary}
          </CTAButton>
        </motion.div>

        <motion.div variants={item} className="mt-4 grid grid-cols-4 gap-2 border-t border-line pt-5">
          {t.home.stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-lg text-gold">{s.value}</div>
              <div className="mt-1 text-[10px] leading-tight text-goldLight/60">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
