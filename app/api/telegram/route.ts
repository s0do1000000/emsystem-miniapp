import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN is not set!");
}

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Текст на русском
const TEXTS_RU = {
  welcome: "👋 Добро пожаловать! Выберите язык:",
  menu: "📋 Главное меню",
  about: "📚 О курсе",
  lesson: "🎬 Бесплатный урок",
  works: "🖼️ Работы учеников",
  faq: "❓ FAQ",
  buy: "💳 Купить курс",
};

async function sendMessage(chatId: number, text: string, keyboard: any = null) {
  try {
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    };

    if (keyboard) {
      payload.reply_markup = keyboard;
    }

    await axios.post(`${API_URL}/sendMessage`, payload);
    console.log(`✅ Message sent to ${chatId}`);
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
}

async function editMessage(chatId: number, messageId: number, text: string, keyboard: any = null) {
  try {
    const payload: any = {
      chat_id: chatId,
      message_id: messageId,
      text: text,
      parse_mode: "HTML",
    };

    if (keyboard) {
      payload.reply_markup = keyboard;
    }

    await axios.post(`${API_URL}/editMessageText`, payload);
    console.log(`✅ Message edited: ${chatId}/${messageId}`);
  } catch (error) {
    console.error("❌ Error editing message:", error);
  }
}

async function saveUser(userId: number, username: string, firstName: string) {
  try {
    const { error } = await supabase.from("telegram_users").upsert(
      {
        telegram_id: userId,
        username: username || "",
        first_name: firstName || "",
        language: "ru",
        updated_at: new Date(),
      },
      { onConflict: "telegram_id" }
    );

    if (error) {
      console.error("❌ Supabase error:", error);
    } else {
      console.log(`✅ User saved: ${userId}`);
    }
  } catch (error) {
    console.error("❌ Error saving user:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("📩 Received update:", JSON.stringify(update, null, 2));

    // Обработать /start
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const username = update.message.from.username;
      const firstName = update.message.from.first_name;

      console.log(`🚀 /start от ${userId}`);

      await saveUser(userId, username, firstName);

      const keyboard = {
        inline_keyboard: [
          [{ text: "🇷🇺 Русский", callback_data: "lang:ru" }],
          [{ text: "🇬🇧 English", callback_data: "lang:en" }],
          [{ text: "🇮🇹 Italiano", callback_data: "lang:it" }],
          [{ text: "🇫🇷 Français", callback_data: "lang:fr" }],
        ],
      };

      await sendMessage(chatId, TEXTS_RU.welcome, keyboard);
      return NextResponse.json({ ok: true });
    }

    // Обработать callback_query (нажатие кнопки)
    if (update.callback_query) {
      const callbackId = update.callback_query.id;
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;
      const data = update.callback_query.data;

      console.log(`🔘 Callback: ${data} from ${chatId}`);

      // Ответить на callback (уберет loading на кнопке)
      try {
        await axios.post(`${API_URL}/answerCallbackQuery`, {
          callback_query_id: callbackId,
          text: "✅ OK",
          show_alert: false,
        });
      } catch (error) {
        console.error("❌ Error answering callback:", error);
      }

      // Обработать lang:ru
      if (data.startsWith("lang:")) {
        const language = data.split(":")[1];
        console.log(`🌍 Language selected: ${language}`);

        const menuKeyboard = {
          inline_keyboard: [
            [{ text: TEXTS_RU.about, callback_data: "menu:about" }],
            [{ text: TEXTS_RU.lesson, callback_data: "menu:lesson" }],
            [{ text: TEXTS_RU.works, callback_data: "menu:works" }],
            [{ text: TEXTS_RU.faq, callback_data: "menu:faq" }],
            [{ text: TEXTS_RU.buy, callback_data: "menu:buy" }],
          ],
        };

        await editMessage(chatId, messageId, TEXTS_RU.menu, menuKeyboard);
        return NextResponse.json({ ok: true });
      }

      // Обработать menu:*
      if (data.startsWith("menu:")) {
        const menuItem = data.split(":")[1];
        console.log(`📄 Menu item: ${menuItem}`);

        let responseText = TEXTS_RU.menu;

        switch (menuItem) {
          case "about":
            responseText = "📚 Информация о курсе";
            break;
          case "lesson":
            responseText = "🎬 Смотрите бесплатный урок";
            break;
          case "works":
            responseText = "🖼️ Работы наших учеников";
            break;
          case "faq":
            responseText = "❓ Часто задаваемые вопросы";
            break;
          case "buy":
            responseText = "💳 Перейти на сайт: https://emsystem.me/";
            break;
        }

        const backKeyboard = {
          inline_keyboard: [
            [{ text: "← Назад в меню", callback_data: "lang:ru" }],
          ],
        };

        await editMessage(chatId, messageId, responseText, backKeyboard);
        return NextResponse.json({ ok: true });
      }
    }

    console.log("⚠️ Unknown update type");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Fatal error:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "✅ Telegram webhook is running",
    botToken: BOT_TOKEN ? "✅ Set" : "❌ Not set",
  });
}