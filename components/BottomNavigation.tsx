"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, Images, HelpCircle, ShoppingBag } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLocale();

  const items = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/course", label: t.nav.course, icon: GraduationCap },
    { href: "/works", label: t.nav.works, icon: Images },
    { href: "/faq", label: t.nav.faq, icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-app -translate-x-1/2 border-t border-line bg-ink/95 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="flex items-center justify-between gap-1 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px]"
            >
              <Icon size={20} className={active ? "text-gold" : "text-goldLight/50"} />
              <span className={active ? "text-gold" : "text-goldLight/50"}>{label}</span>
            </Link>
          );
        })}
        <Link
          href="/buy"
          className="ml-1 flex flex-1 flex-col items-center gap-1 rounded-xl bg-gold py-1.5 text-[11px] font-semibold text-ink"
        >
          <ShoppingBag size={20} />
          <span>{t.nav.buy}</span>
        </Link>
      </div>
    </nav>
  );
}
