"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  const { t } = useLocale();

  return (
    <div className="flex flex-col">
      {t.faq.items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-line">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="text-[14.5px] font-medium text-goldLight">{item.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 text-gold"
              >
                <Plus size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-4 text-[13.5px] leading-relaxed text-goldLight/70">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
