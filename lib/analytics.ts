"use client";

import { getTelegramWebApp } from "./telegram";

/**
 * Fire-and-forget funnel event tracker. Matches the events list from the
 * spec (section 34): mini_app_open, course_open, free_lesson_open,
 * works_open, faq_open, buy_open, checkout_start, payment_success, etc.
 */
export function track(event: string, payload: Record<string, unknown> = {}) {
  try {
    const tg = getTelegramWebApp();
    const telegram_id = tg?.initDataUnsafe?.user?.id ?? null;
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, telegram_id, payload }),
      keepalive: true,
    });
  } catch {
    // Analytics must never break the UI.
  }
}
