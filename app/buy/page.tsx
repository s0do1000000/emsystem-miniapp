"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Stroke from "@/components/Stroke";
import CTAButton from "@/components/CTAButton";
import { track } from "@/lib/analytics";
import { ru } from "@/locales/ru";

export default function BuyPage() {
  useEffect(() => {
    track("buy_open");
  }, []);

  return (
    <>
      <PageHeader title={ru.buySummary.title} />

      <section className="px-6 pt-6">
        <h1 className="font-display text-2xl italic text-goldLight">{ru.buySummary.subtitle}</h1>
        <Stroke className="my-3 text-gold" width={70} />

        <ul className="mb-8 flex flex-col gap-2.5">
          {ru.buySummary.benefits.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-[14px] text-goldLight/85">
              <Check size={16} className="shrink-0 text-gold" />
              {b}
            </li>
          ))}
        </ul>

        <div className="rounded-xl2 border border-gold/40 bg-surface p-5">
          <div className="mb-1 text-xs uppercase tracking-widest2 text-gold">{ru.buy.title}</div>
          <div className="mt-3 font-display text-xl italic text-goldLight">{ru.buy.planName}</div>
          <p className="mt-1 text-[13px] text-goldLight/65">{ru.buy.planDesc}</p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl text-gold">{ru.buy.price}</span>
            <span className="text-sm text-goldLight/40 line-through">{ru.buy.oldPrice}</span>
          </div>

          <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            {ru.buy.includes.map((i) => (
              <li key={i} className="flex items-center gap-2.5 text-[13.5px] text-goldLight/80">
                <Check size={15} className="shrink-0 text-gold" />
                {i}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <CTAButton
              href={ru.external.buyUrl}
              external
              className="!bg-gold"
              variant="solid"
              onClick={() => track("checkout_start", { destination: ru.external.buyUrl })}
            >
              {ru.buy.cta}
            </CTAButton>
          </div>
          <p className="mt-3 text-center text-[11.5px] leading-snug text-goldLight/45">
            {ru.buy.redirectNote}
          </p>
        </div>
      </section>
    </>
  );
}
