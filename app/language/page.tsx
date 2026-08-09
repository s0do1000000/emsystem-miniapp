"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { track } from "@/lib/analytics";
import { ru } from "@/locales/ru";

export default function LanguagePage() {
  const router = useRouter();

  function handleSelect(code: string) {
    track("language_selected", { language: code });
    // Persisted server-side against telegram_id in a real deployment
    // (see /api/user/language) so the bot never asks again.
    document.cookie = `em_lang=${code}; path=/; max-age=31536000`;
    router.push("/");
  }

  return (
    <>
      <PageHeader title={ru.start.chooseLanguage} />
      <section className="px-6 pt-8">
        <p className="mb-6 text-sm text-goldLight/70">{ru.start.chooseLanguage}</p>
        <LanguageSwitcher onSelect={handleSelect} />
      </section>
    </>
  );
}
