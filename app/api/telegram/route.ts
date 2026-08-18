import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Языки и тексты из твоих локалей
const TEXTS = {
  ru: {
    welcome: "Добро пожаловать! Выберите язык:",
    about: "О курсе",
    free_lesson: "Бесплатный урок",
    student_works: "Работы учеников",
    faq: "FAQ",
    buy_course: "Купить курс",
    main_menu: "Главное меню",
  },
  en: {
    welcome: "Welcome! Choose language:",
    about: "About course",
    free_lesson: "Free lesson",
    student_works: "Student works",
    faq: "FAQ",
    buy_course: "Buy course",
    main_menu: "Main menu",
  },
  it: {
    welcome: "Benvenuto! Scegli la lingua:",
    about: "Sul corso",
    free_lesson: "Lezione gratuita",
    student_works: "Lavori degli studenti",
    faq: "FAQ",
    buy_course: "Acquista il corso",
    main_menu: "Menu principale",
  },
  fr: {
    welcome: "Bienvenue! Choisissez la langue:",
    about: "À propos du cours",
    free_lesson: "Leçon gratuite",
    student_works: "Travaux des étudiants",
    faq: "FAQ",
    buy_course: "Acheter le cours",
    main_menu: "Menu principal",
  },
};

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

async function saveUser(userId: number, username: string, firstName: string, language: string) {
  try {
    const { error } = await supabase.from("telegram_users").upsert(
      {
        telegram_id: userId,
        username,
        first_name: firstName,
        language,
        updated_at: new Date(),
      },
      { onConflict: "telegram_id" }
    );

    if (error) console.error("Error saving user:", error);
  } catch (error) {
    console.error("Error in saveUser:", error);
  }
}

async function handleStart(update: any) {
  const chatId = update.message.chat.id;
  const userId = update.message.from.id;
  const username = update.message.from.username || "";
  const firstName = update.message.from.first_name || "";

  await saveUser(userId, username, firstName, "ru");

  const keyboard = {
    inline_keyboard: [
      [{ text: "🇷🇺 Русский", callback_data: "lang:ru" }],
      [{ text: "🇬🇧 English", callback_data: "lang:en" }],
      [{ text: "🇮🇹 Italiano", callback_data: "lang:it" }],
      [{ text: "🇫🇷 Français", callback_data: "lang:fr" }],
    ],
  };

  await sendMessage(chatId, TEXTS.ru.welcome, keyboard);
}

async function handleLanguageChange(update: any, language: string) {
  const chatId = update.callback_query.message.chat.id;
  const userId = update.callback_query.from.id;
  const messageId = update.callback_query.message.message_id;

  await saveUser(
    userId,
    update.callback_query.from.username || "",
    update.callback_query.from.first_name || "",
    language
  );

  const texts = TEXTS[language as keyof typeof TEXTS] || TEXTS.ru;

  const keyboard = {
    inline_keyboard: [
      [{ text: texts.about, callback_data: `menu:about:${language}` }],
      [{ text: texts.free_lesson, callback_data: `menu:free_lesson:${language}` }],
      [{ text: texts.student_works, callback_data: `menu:works:${language}` }],
      [{ text: texts.faq, callback_data: `menu:faq:${language}` }],
      [{ text: texts.buy_course, callback_data: `menu:buy:${language}` }],
    ],
  };

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      chat_id: chatId,
      message_id: messageId,
      text: `${texts.welcome}\n\n${texts.main_menu}`,
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Error editing message:", error);
  }

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      callback_query_id: update.callback_query.id,
      text: `Language: ${language}`,
      show_alert: false,
    });
  } catch (error) {
    console.error("Error answering callback:", error);
  }
}

async function handleMenu(update: any, menuItem: string, language: string) {
  const chatId = update.callback_query.message.chat.id;
  const messageId = update.callback_query.message.message_id;
  const texts = TEXTS[language as keyof typeof TEXTS] || TEXTS.ru;

  let responseText = texts.main_menu;
  let keyboard = null;

  switch (menuItem) {
    case "about":
      responseText = texts.about;
      keyboard = {
        inline_keyboard: [[{ text: texts.main_menu, callback_data: `lang:${language}` }]],
      };
      break;

    case "free_lesson":
      responseText = texts.free_lesson;
      keyboard = {
        inline_keyboard: [
          [{ text: texts.buy_course, callback_data: `menu:buy:${language}` }],
          [{ text: texts.main_menu, callback_data: `lang:${language}` }],
        ],
      };
      break;

    case "works":
      responseText = texts.student_works;
      keyboard = {
        inline_keyboard: [[{ text: texts.main_menu, callback_data: `lang:${language}` }]],
      };
      break;

    case "faq":
      responseText = texts.faq;
      keyboard = {
        inline_keyboard: [[{ text: texts.main_menu, callback_data: `lang:${language}` }]],
      };
      break;

    case "buy":
      responseText = texts.buy_course;
      keyboard = {
        inline_keyboard: [
          [{ text: "🔗 Перейти на сайт", url: "https://emsystem.me/" }],
          [{ text: texts.main_menu, callback_data: `lang:${language}` }],
        ],
      };
      break;
  }

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      chat_id: chatId,
      message_id: messageId,
      text: responseText,
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Error editing message:", error);
  }

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      callback_query_id: update.callback_query.id,
    });
  } catch (error) {
    console.error("Error answering callback:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (update.message?.text === "/start") {
      await handleStart(update);
    }

    if (update.callback_query) {
      const data = update.callback_query.data;

      if (data.startsWith("lang:")) {
        const language = data.split(":")[1];
        await handleLanguageChange(update, language);
      }

      if (data.startsWith("menu:")) {
        const parts = data.split(":");
        const menuItem = parts[1];
        const language = parts[2] || "ru";
        await handleMenu(update, menuItem, language);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Telegram webhook is running" });
}