import { NextRequest, NextResponse } from "next/server";
import { bot } from "../../../bot/bot";

export const runtime = "nodejs";

// Telegram calls this URL after you register it with setWebhook
// (see README "Деплой Telegram-бота"). Protect it with a secret path
// segment or the X-Telegram-Bot-Api-Secret-Token header in production.
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "EmSystem bot webhook is running." });
}
