"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { track } from "@/lib/analytics";
import { useLocale } from "@/lib/i18n";

export default function LanguagePage() {
  const router = useRouter();
  const { t, setLang } = useLocale();

  function handleSelect(code: string) {
    track("language_selected", { language: code });
    setLang(code);
    router.push("/");
  }

  return (
    <>
      <PageHeader title={t.start.chooseLanguage} />
      <section className="px-6 pt-8">
        <p className="mb-6 text-sm text-goldLight/70">{t.start.chooseLanguage}</p>
        <LanguageSwitcher onSelect={handleSelect} />
      </section>
    </>
  );
}
