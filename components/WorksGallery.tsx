"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/i18n";

type Tab = "before_after" | "video" | "certificates";

type Work = {
  id: string;
  title: string | null;
  category: string;
  image_url: string | null;
  video_url: string | null;
  student_name: string | null;
  country: string | null;
};

export default function WorksGallery() {
  const { t } = useLocale();
  const tabs: { key: Tab; label: string }[] = [
    { key: "before_after", label: t.works.tabs.before_after },
    { key: "video", label: t.works.tabs.video },
    { key: "certificates", label: t.works.tabs.certificates },
  ];
  const [tab, setTab] = useState<Tab>("before_after");
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const category = tab === "certificates" ? "certificate" : tab;
      const { data } = await supabase
        .from("works")
        .select("id,title,category,image_url,video_url,student_name,country")
        .eq("category", category)
        .order("sort_order", { ascending: true });
      if (!cancelled) setWorks(data ?? []);
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  return (
    <div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition-colors ${
              tab === t.key
                ? "border-gold bg-gold text-ink font-semibold"
                : "border-line text-goldLight/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="py-10 text-center text-sm text-goldLight/50">Загрузка…</div>}

      {!loading && (
        <div className="grid grid-cols-2 gap-3">
          {works.length === 0 && <EmptyState />}
          {works.map((w, i) => (
            <motion.button
              key={w.id}
              type="button"
              onClick={() => w.video_url && setActiveVideo(w.video_url)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl2 border border-line bg-surface text-left"
            >
              {w.image_url ? (
                <Image
                  src={w.image_url}
                  alt={w.title ?? "Работа ученицы"}
                  fill
                  className="object-cover transition-transform duration-500 group-active:scale-105"
                />
              ) : w.video_url ? (
                <div className="flex h-full w-full items-center justify-center bg-surface2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/90 text-ink">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
              ) : null}
              {w.student_name && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-3">
                  <div className="text-[12px] font-medium text-goldLight">{w.student_name}</div>
                  {w.country && <div className="text-[10px] text-goldLight/60">{w.country}</div>}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setActiveVideo(null)}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-goldLight"
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
            <motion.video
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={activeVideo}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full rounded-xl2"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-2 rounded-xl2 border border-dashed border-line py-12 text-center text-[13px] text-goldLight/40">
      Материалы скоро появятся
    </div>
  );
}
