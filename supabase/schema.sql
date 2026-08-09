-- EmSystem by Yevgeniya Em — Supabase schema
-- Run this in Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- =========================================================
-- USERS
-- =========================================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text,
  last_name text,
  language text default 'ru',
  created_at timestamptz default now()
);

-- =========================================================
-- COURSE
-- =========================================================
create table if not exists course (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(10,2),
  currency text default 'USD',
  access_days int default 365,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =========================================================
-- LESSONS
-- =========================================================
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references course(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  sort_order int default 0,
  is_free boolean default false,
  created_at timestamptz default now()
);

-- =========================================================
-- WORKS  (category: 'before_after' | 'video' | 'certificate')
-- =========================================================
create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text not null check (category in ('before_after', 'video', 'certificate')),
  image_url text,
  video_url text,
  description text,
  student_name text,
  country text,
  sort_order int default 0,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- =========================================================
-- REVIEWS
-- =========================================================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  text text not null,
  avatar_url text,
  video_url text,
  rating int check (rating between 1 and 5),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =========================================================
-- CERTIFICATES (showcase examples, distinct from works/certificate)
-- =========================================================
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- =========================================================
-- ORDERS  (kept for a future in-app payment integration;
-- current flow redirects to emsystem.me for checkout)
-- =========================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  course_id uuid references course(id),
  amount numeric(10,2),
  currency text default 'USD',
  payment_status text default 'new' check (payment_status in ('new','paid','failed','refunded')),
  payment_id text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- =========================================================
-- ACCESS
-- =========================================================
create table if not exists access (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  course_id uuid references course(id),
  started_at timestamptz default now(),
  expires_at timestamptz,
  status text default 'active' check (status in ('active','expired','revoked'))
);

-- =========================================================
-- ANALYTICS EVENTS (funnel tracking, section 34 of the spec)
-- =========================================================
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  telegram_id bigint,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY
-- Public content (works/reviews/certificates/course/lessons) is readable
-- by the anon key. Personal data (users/orders/access) is NOT readable by
-- anon — only the server (service role key) can read/write it, after
-- verifying Telegram initData. See lib/telegram.ts.
-- =========================================================
alter table users enable row level security;
alter table course enable row level security;
alter table lessons enable row level security;
alter table works enable row level security;
alter table reviews enable row level security;
alter table certificates enable row level security;
alter table orders enable row level security;
alter table access enable row level security;
alter table analytics_events enable row level security;

create policy "public read course" on course for select using (is_active = true);
create policy "public read lessons (free only)" on lessons for select using (is_free = true);
create policy "public read works" on works for select using (true);
create policy "public read reviews" on reviews for select using (is_active = true);
create policy "public read certificates" on certificates for select using (true);

-- users, orders, access, analytics_events: no anon policies —
-- all access goes through server-side API routes using the service role key.

-- =========================================================
-- STORAGE BUCKETS
-- Create these in Supabase Dashboard -> Storage (or via API):
--   course-videos  (private — served through a signed URL after access check)
--   works          (public)
--   reviews        (public)
--   certificates   (public)
--   avatars        (public)
--   course-images  (public)
-- =========================================================

-- Seed the single course row (adjust price/description as needed).
insert into course (title, description, price, currency, access_days, is_active)
values (
  'EmSystem',
  'Авторская система обучения микроблейдингу by Yevgeniya Em',
  150,
  'USD',
  365,
  true
)
on conflict do nothing;
