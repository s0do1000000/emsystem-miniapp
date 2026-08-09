# EmSystem by Yevgeniya Em — Telegram Bot + Mini App

Премиальный Telegram Mini App для презентации и продажи курса EmSystem, плюс
минималистичный Telegram-бот, который его открывает.

**Важное упрощение относительно исходного ТЗ:** кнопка «Перейти к оплате»
ведёт напрямую на `https://emsystem.me/`, где уже настроена оплата. Поэтому
в этой версии **нет** интеграции платёжного шлюза, автоматического webhook
об оплате и автоматической выдачи доступа — эти узлы (раздел 20 ТЗ) в схеме
и коде оставлены как задел на будущее, но не активны. Доступ ученику после
оплаты на внешнем сайте выдаётся вручную командой `/grant` (см. ниже), либо
это дорабатывается позже, если emsystem.me сможет слать webhook.

---

## 1. Структура проекта

```
em-system/
├── app/            # Next.js App Router: страницы Mini App + API routes
│   ├── page.tsx           Главная
│   ├── course/             О курсе
│   ├── free-lesson/        Бесплатный урок
│   ├── works/               Работы учеников
│   ├── faq/                 FAQ
│   ├── buy/                 Покупка (редирект на emsystem.me)
│   ├── language/            Выбор языка
│   ├── profile/              Мой курс
│   └── api/
│       ├── bot/route.ts     Webhook Telegram-бота (для Vercel)
│       └── track/route.ts   Приём аналитических событий
├── bot/
│   ├── bot.ts               Логика бота (Telegraf)
│   └── dev.ts                Локальный запуск (long polling)
├── components/               UI-компоненты Mini App
├── lib/
│   ├── supabase.ts            Supabase-клиенты (browser + service role)
│   ├── telegram.ts             Проверка Telegram initData
│   └── analytics.ts            Трекинг воронки
├── locales/ru.ts              Весь текстовый контент (русский, основной язык)
└── supabase/schema.sql        Полная схема БД + RLS + сиды
```

---

## 2. Развернуть на GitHub

```bash
cd em-system
git init
git add .
git commit -m "EmSystem: initial scaffold"
gh repo create em-system --private --source=. --push
# или вручную: создайте пустой репозиторий на github.com и
# git remote add origin https://github.com/<you>/em-system.git && git push -u origin main
```

---

## 3. Настроить Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. В разделе **SQL Editor** выполните файл `supabase/schema.sql` целиком —
   он создаст все таблицы, включит Row Level Security и добавит запись о
   курсе.
3. В разделе **Storage** создайте buckets (Public для всех, кроме
   `course-videos`, которое лучше сделать приватным и отдавать через
   подписанные ссылки после проверки доступа):
   - `course-videos` (private)
   - `works`
   - `reviews`
   - `certificates`
   - `avatars`
   - `course-images`
4. Скопируйте из **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` ключ → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` ключ → `SUPABASE_SERVICE_ROLE_KEY` (никогда не публикуйте
     его и не используйте в клиентском коде).

---

## 4. Создать Telegram-бота

1. В [@BotFather](https://t.me/BotFather): `/newbot` → получите токен
   (`TELEGRAM_BOT_TOKEN`).
2. Настройте меню команд: `/setcommands` →
   ```
   start - Открыть EmSystem
   course - О курсе
   free - Бесплатный урок
   works - Работы учениц
   faq - Частые вопросы
   buy - Купить курс
   support - Поддержка
   ```
3. Настройте кнопку Mini App: `/newapp` (или `/setmenubutton`) и укажите URL
   вашего будущего Vercel-домена, например
   `https://em-system.vercel.app`.
4. Узнайте свой `chat_id`, чтобы получать админ-уведомления — напишите
   [@userinfobot](https://t.me/userinfobot) и сохраните число как
   `ADMIN_CHAT_ID`.

---

## 5. Развернуть на Vercel

1. Импортируйте GitHub-репозиторий на [vercel.com](https://vercel.com).
2. В **Environment Variables** добавьте все переменные из `.env.example`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `WEBAPP_URL`
   (= ваш будущий Vercel-домен), `ADMIN_CHAT_ID`.
3. Deploy. После первого деплоя скопируйте финальный домен (или подключите
   свой, раздел 18 ТЗ) и обновите `WEBAPP_URL`, если он изменился.

### Подключить webhook бота к Vercel

После деплоя один раз выполните (подставив свои значения):

```bash
curl -F "url=https://em-system.vercel.app/api/bot" \
     "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook"
```

Проверить, что webhook подключён:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

### Локальная разработка бота

Для разработки без webhook удобнее long polling:

```bash
npm install
npm run bot:dev
```

(предварительно снимите webhook: `.../deleteWebhook`, иначе Telegram будет
слать апдейты только на него).

---

## 6. Наполнение контентом

Все тексты — в `locales/ru.ts`, это единственный источник контента для
русского интерфейса. Медиа (фото работ, видео, отзывы, сертификаты)
добавляются через Supabase Table Editor в таблицы `works`, `reviews`,
`certificates`, а файлы — в соответствующие Storage buckets. Полноценная
защищённая админ-панель (раздел 32 ТЗ) — следующий шаг: быстрее всего
сделать её на базе Supabase Table Editor с ограничением доступа по email,
либо как отдельный `/admin` роут в этом же Next.js проекте.

---

## 7. Локализация

Сейчас реализован русский язык (обязательный, основной). Структура уже
готова для добавления English/Deutsch/Français/Español/Italiano — по
аналогии с `locales/ru.ts` создайте `locales/en.ts` и т.д., и переключайте
их по cookie/`users.language` в `app/language/page.tsx`.

---

## 8. Что доработать под полный охват ТЗ

- Полноценная защита платного видео (проверка `access` перед выдачей
  подписанной ссылки Supabase Storage) — точка расширения в
  `app/free-lesson/page.tsx` / будущей странице урока курса.
- Если emsystem.me сможет слать webhook об оплате — добавить
  `app/api/payment-webhook/route.ts`, который создаёт запись в `orders`,
  `access` и шлёт админ-уведомление (функция `notifyAdminNewPurchase` в
  `bot/bot.ts` уже готова).
- Отдельная защищённая админ-панель (раздел 32 ТЗ).
- Полные переводы EN/DE/FR/ES/IT.
