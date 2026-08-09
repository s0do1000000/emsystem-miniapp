"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PageHeader({ title, back = "/" }: { title: string; back?: string }) {
  return (
    <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-ink/90 px-4 py-4 backdrop-blur">
      <Link href={back} className="rounded-full p-1 text-goldLight/70">
        <ChevronLeft size={22} />
      </Link>
      <h1 className="font-display text-[17px] italic text-goldLight">{title}</h1>
    </div>
  );
}
