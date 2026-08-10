"use client";

import { motion } from "framer-motion";
import SectionEyebrow from "./SectionEyebrow";
import { useLocale } from "@/lib/i18n";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function TrustBlock() {
  const { t } = useLocale();

  return (
    <section className="px-6 py-10">
      <div className="grid grid-cols-1 gap-3 rounded-xl2 border border-line bg-surface p-5">
        {[t.hero.what, t.hero.forWhom, t.hero.result].map((h, i) => (
          <motion.div
            key={h.title}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className={i > 0 ? "border-t border-line pt-3" : ""}
          >
            <div className="font-display text-base italic text-gold">{h.title}</div>
            <div className="mt-1 text-sm text-goldLight/80">{h.text}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12">
        <SectionEyebrow>{t.trust.title}</SectionEyebrow>
        <div className="grid grid-cols-2 gap-3">
          {t.trust.items.map((it, i) => (
            <motion.div
              key={it.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="rounded-xl2 border border-line bg-surface p-4"
            >
              <div className="font-display text-[15px] text-goldLight">{it.title}</div>
              <div className="mt-1.5 text-[12.5px] leading-snug text-goldLight/65">{it.text}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
