import { Telegraf, Markup } from "telegraf";
import { InputMediaPhoto, InputMediaVideo } from "telegraf/types";
import { getServiceSupabase } from "../lib/supabase";
import {
  BUY_URL,
  DEFAULT_LANG,
  LANGUAGES,
  Lang,
  TEXTS,
  VIDEO_ABOUT_FILE_ID_BY_LANG,
  VIDEO_LESSON_FILE_ID_BY_LANG,
  WORKS_CATEGORIES,
  WORKS_PHOTOS_PAGE_SIZE,
  WorksCategory,
} from "./content";

/**
 * Логика бота EmSystem, портированная из embrowbot/bot.py (Python,
 * python-telegram-bot, long polling) на Telegraf, чтобы работать через
 * вебхук на Vercel (serverless — long polling там не поддерживается).
 *
 * Т.к. каждый вызов вебхука — отдельный, не связанный с предыдущими HTTP-запрос
 * (в отличие от одного долгоживущего процесса при polling), язык пользователя
 * НЕ хранится в памяти процесса. Вместо этого он передаётся прямо внутри
 * callback_data каждой кнопки (например "menu:root:ru") — это делает бота
 * полностью stateless и работающим одинаково при холодном и тёплом старте.
 * Дополнительно язык сохраняется в Supabase (users.language) для истории/аналитики.
 */

const BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN as string) || "0:placeholder";
const WEBAPP_URL = (process.env.WEBAPP_URL as string) || "https://example.com";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn(
    "[bot] TELEGRAM_BOT_TOKEN is not set. Set it in Vercel → Project Settings → Environment Variables."
  );
}

export const bot = new Telegraf(BOT_TOKEN);

function isLang(value: string): value is Lang {
  return value in LANGUAGES;
}

function t(lang: Lang) {
  return TEXTS[lang] ?? TEXTS[DEFAULT_LANG];
}

async function upsertUser(ctx: {
  from?: { id: number; username?: string; first_name?: string; last_name?: string };
}, lang?: Lang) {
  if (!ctx.from) return;
  try {
    const supabase = getServiceSupabase();
    await supabase.from("users").upsert(
      {
        telegram_id: ctx.from.id,
        username: ctx.from.username ?? null,
        first_name: ctx.from.first_name ?? null,
        last_name: ctx.from.last_name ?? null,
        ...(lang ? { language: lang } : {}),
      },
      { onConflict: "telegram_id", ignoreDuplicates: false }
    );
  } catch (err) {
    // Не блокируем ответ пользователю, если Supabase недоступен — это
    // вспомогательная запись для аналитики/админки, а не критичная логика.
    console.error("[bot] upsertUser failed:", err);
  }
}

// ============================================================
// КЛАВИАТУРЫ
// ============================================================

function languageKeyboard(showBack = false, texts?: ReturnType<typeof t>) {
  const grid: Lang[][] = [
    ["en", "ru"],
    ["fr", "it"],
  ];
  const rows = grid.map((row) =>
    row.map((code) => Markup.button.callback(LANGUAGES[code], `lang:${code}`))
  );
  if (showBack && texts) {
    rows.push([Markup.button.callback(texts.btn_main_menu, "menu:root")]);
  }
  return Markup.inlineKeyboard(rows);
}

function homeKeyboard(lang: Lang, texts: ReturnType<typeof t>) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(texts.btn_watch_free_lesson, `menu:free_lesson:${lang}`)],
  ]);
}

function freeLessonKeyboard(lang: Lang, texts: ReturnType<typeof t>) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(texts.btn_works, `menu:works:${lang}`),
      Markup.button.callback(texts.btn_faq, `menu:faq:${lang}`),
    ],
    [
      Markup.button.callback(texts.btn_main_menu, `menu:root:${lang}`),
      Markup.button.callback(texts.btn_language, `menu:language:${lang}`),
    ],
    [Markup.button.callback(texts.btn_buy, `menu:buy:${lang}`)],
  ]);
}

function buyKeyboard(lang: Lang, texts: ReturnType<typeof t>) {
  return Markup.inlineKeyboard([
    [Markup.button.url(texts.btn_buy, BUY_URL)],
    [Markup.button.callback(texts.btn_main_menu, `menu:root:${lang}`)],
  ]);
}

function worksMenuKeyboard(lang: Lang, texts: ReturnType<typeof t>) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(texts.btn_works_before_after, `works:before_after:0:${lang}`)],
    [Markup.button.callback(texts.btn_works_certificates, `works:certificates:0:${lang}`)],
    [Markup.button.callback(texts.btn_works_videos, `works:videos:0:${lang}`)],
    [Markup.button.callback(texts.btn_buy, `menu:buy:${lang}`)],
    [Markup.button.callback(texts.btn_main_menu, `menu:root:${lang}`)],
  ]);
}

function worksCategoryFooterKeyboard(
  lang: Lang,
  texts: ReturnType<typeof t>,
  category: WorksCategory,
  nextOffset: number | null
) {
  const rows = [];
  if (nextOffset !== null) {
    rows.push([Markup.button.callback(texts.btn_works_more, `works:${category}:${nextOffset}:${lang}`)]);
  }
  rows.push([Markup.button.callback(texts.btn_works, `menu:works:${lang}`)]);
  rows.push([Markup.button.callback(texts.btn_buy, `menu:buy:${lang}`)]);
  rows.push([Markup.button.callback(texts.btn_main_menu, `menu:root:${lang}`)]);
  return Markup.inlineKeyboard(rows);
}

function faqListKeyboard(lang: Lang, texts: ReturnType<typeof t>) {
  const rows = texts.faq_items.map((item, i) => [Markup.button.callback(item.short, `faq:${i}:${lang}`)]);
  rows.push([Markup.button.callback(texts.btn_main_menu, `menu:root:${lang}`)]);
  return Markup.inlineKeyboard(rows);
}

function faqAnswerKeyboard(lang: Lang, texts: ReturnType<typeof t>) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(texts.btn_back_to_faq, `menu:faq:${lang}`)],
    [Markup.button.callback(texts.btn_buy, `menu:buy:${lang}`)],
    [Markup.button.callback(texts.btn_home, `menu:root:${lang}`)],
  ]);
}

// ============================================================
// ОТПРАВКА ВИДЕО
// ============================================================

async function sendCourseVideo(
  chatId: number,
  lang: Lang,
  which: "about" | "lesson",
  replyMarkup?: ReturnType<typeof Markup.inlineKeyboard>
) {
  const texts = t(lang);
  const fileIdMap = which === "about" ? VIDEO_ABOUT_FILE_ID_BY_LANG : VIDEO_LESSON_FILE_ID_BY_LANG;
  const fileId = fileIdMap[lang] || fileIdMap[DEFAULT_LANG];

  if (!fileId) {
    await bot.telegram.sendMessage(chatId, texts.video_unavailable, replyMarkup);
    return;
  }

  try {
    await bot.telegram.sendVideo(chatId, fileId, { supports_streaming: true, ...replyMarkup });
  } catch (err) {
    console.error(`[bot] sendCourseVideo(${which}, ${lang}) failed:`, err);
    await bot.telegram.sendMessage(chatId, texts.video_send_failed, replyMarkup);
  }
}

// ============================================================
// ЭКРАНЫ
// ============================================================

async function showWelcome(chatId: number) {
  const texts = t(DEFAULT_LANG);
  await bot.telegram.sendMessage(chatId, texts.welcome_text, languageKeyboard());
}

async function showMainMenu(chatId: number, lang: Lang) {
  const texts = t(lang);
  await sendCourseVideo(chatId, lang, "about");
  await bot.telegram.sendMessage(chatId, texts.about_caption, homeKeyboard(lang, texts));
}

async function showFreeLesson(chatId: number, lang: Lang) {
  const texts = t(lang);
  await sendCourseVideo(chatId, lang, "lesson", freeLessonKeyboard(lang, texts));
}

async function showWorks(chatId: number, lang: Lang) {
  const texts = t(lang);
  await bot.telegram.sendMessage(chatId, texts.student_works_text, worksMenuKeyboard(lang, texts));
}

async function showWorksCategory(chatId: number, lang: Lang, category: WorksCategory, offset: number) {
  const texts = t(lang);
  const catData = WORKS_CATEGORIES[category];
  if (!catData) {
    console.warn(`[bot] unknown works category: ${category}`);
    return;
  }

  const { items, type: mediaType } = catData;
  const pageSize = WORKS_PHOTOS_PAGE_SIZE;
  const chunk = items.slice(offset, offset + pageSize);
  const hasMore = items.length > offset + pageSize;
  const nextOffset = hasMore ? offset + pageSize : null;

  const introKey = `works_${category}_intro` as keyof ReturnType<typeof t>;
  if (offset === 0 && texts[introKey]) {
    await bot.telegram.sendMessage(chatId, texts[introKey] as string);
  }

  if (chunk.length === 0) {
    await bot.telegram.sendMessage(
      chatId,
      texts.works_photos_done,
      worksCategoryFooterKeyboard(lang, texts, category, null)
    );
    return;
  }

  try {
    if (chunk.length === 1) {
      if (mediaType === "video") {
        await bot.telegram.sendVideo(chatId, chunk[0], { supports_streaming: true });
      } else {
        await bot.telegram.sendPhoto(chatId, chunk[0]);
      }
    } else {
      const mediaGroup: (InputMediaPhoto | InputMediaVideo)[] = chunk.map((fileId) =>
        mediaType === "video" ? { type: "video", media: fileId } : { type: "photo", media: fileId }
      );
      await bot.telegram.sendMediaGroup(chatId, mediaGroup);
    }
  } catch (err) {
    console.error(`[bot] showWorksCategory(${category}) media send failed:`, err);
    await bot.telegram.sendMessage(chatId, texts.video_send_failed);
  }

  if (nextOffset !== null) {
    await bot.telegram.sendMessage(
      chatId,
      texts.works_continue_prompt,
      worksCategoryFooterKeyboard(lang, texts, category, nextOffset)
    );
  } else {
    await bot.telegram.sendMessage(
      chatId,
      texts.works_photos_done,
      worksCategoryFooterKeyboard(lang, texts, category, null)
    );
  }
}

async function showFaqList(chatId: number, lang: Lang) {
  const texts = t(lang);
  await bot.telegram.sendMessage(chatId, texts.faq_intro_text, faqListKeyboard(lang, texts));
}

async function showFaqAnswer(chatId: number, lang: Lang, index: number) {
  const texts = t(lang);
  const item = texts.faq_items[index];
  if (!item) return;
  await bot.telegram.sendMessage(
    chatId,
    `❓ ${item.question}\n\n${item.answer}`,
    faqAnswerKeyboard(lang, texts)
  );
}

async function showLanguageSelect(chatId: number, lang: Lang) {
  const texts = t(lang);
  await bot.telegram.sendMessage(chatId, texts.choose_language_text, languageKeyboard(true, texts));
}

async function showBuy(chatId: number, lang: Lang) {
  const texts = t(lang);
  await bot.telegram.sendMessage(chatId, texts.buy_text, buyKeyboard(lang, texts));
}

// ============================================================
// ХЕНДЛЕРЫ
// ============================================================

bot.start(async (ctx) => {
  await upsertUser(ctx);
  await showWelcome(ctx.chat.id);
});

// lang:<code> — выбор языка на первом экране
bot.action(/^lang:(\w+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const code = ctx.match[1];
  const lang: Lang = isLang(code) ? code : DEFAULT_LANG;
  await upsertUser(ctx, lang);
  await showMainMenu(ctx.chat!.id, lang);
});

// menu:<screen>:<lang>
bot.action(/^menu:(root|about|free_lesson|works|faq|buy|language):(\w+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const [, screen, code] = ctx.match;
  const lang: Lang = isLang(code) ? code : DEFAULT_LANG;
  const chatId = ctx.chat!.id;

  switch (screen) {
    case "root":
    case "about":
      await showMainMenu(chatId, lang);
      break;
    case "free_lesson":
      await showFreeLesson(chatId, lang);
      break;
    case "works":
      await showWorks(chatId, lang);
      break;
    case "faq":
      await showFaqList(chatId, lang);
      break;
    case "buy":
      await showBuy(chatId, lang);
      break;
    case "language":
      await showLanguageSelect(chatId, lang);
      break;
  }
});

// works:<category>:<offset>:<lang>
bot.action(/^works:(before_after|certificates|videos):(\d+):(\w+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const [, category, offsetStr, code] = ctx.match;
  const lang: Lang = isLang(code) ? code : DEFAULT_LANG;
  await showWorksCategory(ctx.chat!.id, lang, category as WorksCategory, parseInt(offsetStr, 10));
});

// faq:<index>:<lang>
bot.action(/^faq:(\d+):(\w+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const [, indexStr, code] = ctx.match;
  const lang: Lang = isLang(code) ? code : DEFAULT_LANG;
  await showFaqAnswer(ctx.chat!.id, lang, parseInt(indexStr, 10));
});

// Manual access grant for the admin, since checkout currently happens on
// the external emsystem.me site and there's no automatic payment webhook.
// Usage (admin only): /grant <telegram_id>
bot.command("grant", async (ctx) => {
  if (!ADMIN_CHAT_ID || String(ctx.chat.id) !== ADMIN_CHAT_ID) return;
  const parts = ctx.message.text.split(" ");
  const telegramId = Number(parts[1]);
  if (!telegramId) {
    await ctx.reply("Использование: /grant <telegram_id>");
    return;
  }

  const supabase = getServiceSupabase();
  const { data: course } = await supabase.from("course").select("id,access_days").eq("is_active", true).limit(1).maybeSingle();
  const accessDays = course?.access_days ?? 365;
  const expires = new Date();
  expires.setDate(expires.getDate() + accessDays);

  await supabase.from("access").insert({
    telegram_id: telegramId,
    course_id: course?.id,
    expires_at: expires.toISOString(),
    status: "active",
  });

  await ctx.reply(`Доступ выдан пользователю ${telegramId} до ${expires.toLocaleDateString("ru-RU")}.`);
  await bot.telegram.sendMessage(
    telegramId,
    "🎉 Оплата подтверждена! Добро пожаловать в EmSystem — ваш доступ активирован.",
    Markup.inlineKeyboard([[Markup.button.webApp("Открыть EmSystem", WEBAPP_URL)]])
  );
});

bot.on("text", async (ctx) => {
  // Неизвестная команда/сообщение — просим воспользоваться кнопками.
  // /start и /grant уже перехвачены выше и сюда не попадают.
  const texts = t(DEFAULT_LANG);
  await ctx.reply(texts.unknown_command);
});

bot.catch((err, ctx) => {
  console.error(`[bot] Unhandled error for update ${ctx.updateType}:`, err);
});

export async function notifyAdminNewPurchase(details: { username?: string; language: string; amount: string }) {
  if (!ADMIN_CHAT_ID) return;
  await bot.telegram.sendMessage(
    ADMIN_CHAT_ID,
    `🎉 НОВАЯ ПОКУПКА\n\nEmSystem\n\n👤 Пользователь: @${details.username ?? "—"}\n🌍 Язык: ${details.language}\n💰 Сумма: ${details.amount}\n📅 Дата: ${new Date().toLocaleDateString("ru-RU")}\n✅ Оплата: Успешно`
  );
}
