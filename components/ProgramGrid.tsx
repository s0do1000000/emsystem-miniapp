"use client";

import { motion } from "framer-motion";
import SectionEyebrow from "./SectionEyebrow";
import { ru } from "@/locales/ru";

export default function ProgramGrid() {
  return (
    <section className="px-6 py-10">
      <SectionEyebrow>{ru.program.title}</SectionEyebrow>
      <p className="mb-5 text-sm text-goldLight/70">{ru.program.subtitle}</p>

      <div className="flex flex-col">
        {ru.program.modules.map((m, i) => (
          <motion.div
            key={m.n}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="flex items-center gap-4 border-b border-line py-4 last:border-none"
          >
            <span className="font-display text-lg text-gold/60">{m.n}</span>
            <span className="text-[15px] text-goldLight">{m.title}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
