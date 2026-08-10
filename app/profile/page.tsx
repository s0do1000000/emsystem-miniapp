"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import CTAButton from "@/components/CTAButton";
import { supabase } from "@/lib/supabase";
import { getTelegramWebApp } from "@/lib/telegram";
import { useLocale } from "@/lib/i18n";

type Access = {
  status: string;
  started_at: string;
  expires_at: string;
};

export default function ProfilePage() {
  const { t } = useLocale();
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const tg = getTelegramWebApp();
      const telegramId = tg?.initDataUnsafe?.user?.id;
      if (!telegramId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("access")
        .select("status,started_at,expires_at")
        .eq("telegram_id", telegramId)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setAccess(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <PageHeader title={t.menu.about} />
      <section className="px-6 pt-8">
        {loading && <p className="text-sm text-goldLight/50">Загрузка…</p>}

        {!loading && access && (
          <div className="rounded-xl2 border border-gold/40 bg-surface p-5">
            <div className="font-display text-lg italic text-gold">
              {t.about.title}
            </div>
            <dl className="mt-4 flex flex-col gap-3 text-[13.5px]">
              <Row label="Статус доступа" value={access.status === "active" ? "Активен" : access.status} />
              <Row label="Дата покупки" value={new Date(access.started_at).toLocaleDateString("ru-RU")} />
              <Row label="Действует до" value={new Date(access.expires_at).toLocaleDateString("ru-RU")} />
            </dl>
          </div>
        )}

        {!loading && !access && (
          <div className="rounded-xl2 border border-line bg-surface p-5 text-center">
            <p className="mb-4 text-sm text-goldLight/70">{t.pending.text}</p>
            <CTAButton href="/buy">{t.pending.cta}</CTAButton>
          </div>
        )}
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-line pt-3 first:border-none first:pt-0">
      <dt className="text-goldLight/55">{label}</dt>
      <dd className="text-goldLight">{value}</dd>
    </div>
  );
}
