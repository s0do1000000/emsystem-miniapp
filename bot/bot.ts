import { Telegraf, Markup } from "telegraf";
import { getServiceSupabase } from "../lib/supabase";

const BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN as string) || "0:placeholder";
const WEBAPP_URL = (process.env.WEBAPP_URL as string) || "https://example.com"; // e.g. https://em-system.vercel.app
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; // your Telegram numeric id, for manual /grant

// Optional: file_ids of videos already uploaded to Telegram once before
// (via BotFather/any upload), reused here so the bot never re-uploads them.
const VIDEO_ABOUT_FILE_ID = process.env.VIDEO_ABOUT_FILE_ID;
const VIDEO_LESSON_FILE_ID = process.env.VIDEO_LESSON_FILE_ID;

if (!process.env.TELEGRAM_BOT_TOKEN) {
  // Doesn't throw at module scope — see the same reasoning in lib/supabase.ts.
  console.warn(
    "[bot] TELEGRAM_BOT_TOKEN is not set. Set it in Vercel → Project Settings → Environment Variables."
  );
}

export const bot = new Telegraf(BOT_TOKEN);

const WELCOME_TEXT =
  "*EmSystem by Yevgeniya Em*\n\n" +
  "Авторская система обучения микроблейдингу для мастеров, которые хотят повысить качество и предсказуемость своих результатов.\n\n" +
  "Выберите язык обучения:";

const openAppKeyboard = Markup.inlineKeyboard([
  [Markup.button.webApp("Открыть EmSystem", WEBAPP_URL)],
]);

// Languages offered on /start. Add a row here once locales/<code>.ts
// exists in the Mini App (see lib/i18n.tsx SUPPORTED_LANGS) — each button
// opens the Mini App with ?lang=<code>, so it launches already translated,
// no separate in-app language step needed.
const START_LANGUAGES: { code: string; label: string }[] = [
  { code: "ru", label: "🇷🇺 Русский" },
  { code: "en", label: "🇬🇧 English" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "it", label: "🇮🇹 Italiano" },
];

function languageKeyboard() {
  const buttons = START_LANGUAGES.map((l) =>
    Markup.button.webApp(l.label, `${WEBAPP_URL}/?lang=${l.code}`)
  );
  // two per row
  const rows: ReturnType<typeof Markup.button.webApp>[][] = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }
  return Markup.inlineKeyboard(rows);
}

async function upsertUser(ctx: { from?: { id: number; username?: string; first_name?: string; last_name?: string; language_code?: string } }) {
  if (!ctx.from) return;
  const supabase = getServiceSupabase();
  await supabase.from("users").upsert(
    {
      telegram_id: ctx.from.id,
      username: ctx.from.username ?? null,
      first_name: ctx.from.first_name ?? null,
      last_name: ctx.from.last_name ?? null,
    },
    { onConflict: "telegram_id", ignoreDuplicates: false }
  );
}

bot.start(async (ctx) => {
  await upsertUser(ctx);
  await ctx.reply(WELCOME_TEXT, { parse_mode: "Markdown", ...languageKeyboard() });
});

bot.command("course", async (ctx) => {
  if (VIDEO_ABOUT_FILE_ID) {
    await ctx.replyWithVideo(VIDEO_ABOUT_FILE_ID, { caption: "EmSystem by Yevgeniya Em" });
  }
  await ctx.reply(
    "О курсе EmSystem:",
    Markup.inlineKeyboard([[Markup.button.webApp("Открыть раздел «О курсе»", `${WEBAPP_URL}/course`)]])
  );
});

bot.command("free", async (ctx) => {
  if (VIDEO_LESSON_FILE_ID) {
    await ctx.replyWithVideo(VIDEO_LESSON_FILE_ID, { caption: "Бесплатный урок EmSystem" });
  }
  await ctx.reply(
    "Бесплатный урок:",
    Markup.inlineKeyboard([[Markup.button.webApp("Смотреть бесплатный урок", `${WEBAPP_URL}/free-lesson`)]])
  );
});

bot.command("works", (ctx) =>
  ctx.reply("Работы учеников:", Markup.inlineKeyboard([[Markup.button.webApp("Смотреть работы", `${WEBAPP_URL}/works`)]]))
);

bot.command("faq", (ctx) =>
  ctx.reply("Частые вопросы:", Markup.inlineKeyboard([[Markup.button.webApp("Открыть FAQ", `${WEBAPP_URL}/faq`)]]))
);

bot.command("buy", (ctx) =>
  ctx.reply("Оформление покупки:", Markup.inlineKeyboard([[Markup.button.webApp("Купить курс", `${WEBAPP_URL}/buy`)]]))
);

bot.command("support", (ctx) =>
  ctx.reply(
    "Напишите нам, и мы поможем разобраться перед покупкой. Ответим как можно скорее."
  )
);

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
    openAppKeyboard
  );
});

export async function notifyAdminNewPurchase(details: {
  username?: string;
  language: string;
  amount: string;
}) {
  if (!ADMIN_CHAT_ID) return;
  await bot.telegram.sendMessage(
    ADMIN_CHAT_ID,
    `🎉 НОВАЯ ПОКУПКА\n\nEmSystem\n\n👤 Пользователь: @${details.username ?? "—"}\n🌍 Язык: ${details.language}\n💰 Сумма: ${details.amount}\n📅 Дата: ${new Date().toLocaleDateString("ru-RU")}\n✅ Оплата: Успешно`
  );
}
