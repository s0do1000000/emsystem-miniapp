// Run with: npm run bot:dev
// Uses long polling — convenient for local development. In production
// (Vercel) the bot runs via the /api/bot webhook route instead.
import "dotenv/config";
import { bot } from "./bot";

bot.launch().then(() => {
  console.log("EmSystem bot is running (long polling, dev mode).");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
