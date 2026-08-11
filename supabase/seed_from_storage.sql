-- ============================================================
-- EmSystem: заполнение works / certificates / reviews на основе
-- файлов, уже загруженных в Storage.
--
-- Проект: ygplwjrcispfkusjrism
-- Безопасно запускать повторно — каждый блок пропускает файлы,
-- которые уже добавлены в таблицу (проверка через NOT EXISTS),
-- так что при загрузке новых файлов просто выполните скрипт ещё раз.
-- ============================================================

-- ------------------------------------------------------------
-- 0) ОБЗОР: что вообще лежит в bucket'ах works / reviews / certificates
--    Запустите это первым, чтобы увидеть список файлов и ссылок
--    до того, как что-то добавлять в таблицы.
-- ------------------------------------------------------------
select
  bucket_id,
  name as path,
  'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/' || bucket_id || '/' || name as public_url,
  (metadata->>'size')::bigint as size_bytes,
  created_at
from storage.objects
where bucket_id in ('works', 'reviews', 'certificates')
order by bucket_id, name;


-- ------------------------------------------------------------
-- 1) works: bucket "works" -> таблица works
--    .mp4/.mov/.webm/.avi/.mkv  -> category = 'video'
--    остальное (jpg/png/webp)   -> category = 'before_after'
-- ------------------------------------------------------------
insert into works (title, category, image_url, video_url, sort_order)
select
  regexp_replace(o.name, '^.*/', '') as title,             -- имя файла без пути к папке
  case
    when lower(o.name) ~ '\.(mp4|mov|webm|avi|mkv)$' then 'video'
    else 'before_after'
  end as category,
  case
    when lower(o.name) ~ '\.(mp4|mov|webm|avi|mkv)$' then null
    else 'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/works/' || o.name
  end as image_url,
  case
    when lower(o.name) ~ '\.(mp4|mov|webm|avi|mkv)$'
      then 'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/works/' || o.name
    else null
  end as video_url,
  row_number() over (order by o.name) as sort_order
from storage.objects o
where o.bucket_id = 'works'
  and not exists (
    select 1 from works w
    where w.image_url = 'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/works/' || o.name
       or w.video_url = 'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/works/' || o.name
  );


-- ------------------------------------------------------------
-- 2) certificates: bucket "certificates" -> таблица certificates
--    полностью автоматически, вручную ничего дописывать не нужно
-- ------------------------------------------------------------
insert into certificates (title, image_url, sort_order)
select
  regexp_replace(o.name, '^.*/', '') as title,
  'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/certificates/' || o.name as image_url,
  row_number() over (order by o.name) as sort_order
from storage.objects o
where o.bucket_id = 'certificates'
  and not exists (
    select 1 from certificates c
    where c.image_url = 'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/certificates/' || o.name
  );


-- ------------------------------------------------------------
-- 3) reviews: bucket "reviews" -> таблица reviews (черновики)
--    Видео -> video_url, фото/скриншот -> avatar_url.
--    is_active = false, потому что имя/страна/текст отзыва скрипт
--    придумать не может — впишите их вручную в Table Editor и
--    переключите is_active на true, тогда отзыв появится на сайте.
-- ------------------------------------------------------------
insert into reviews (name, country, text, avatar_url, video_url, rating, is_active)
select
  '⚠️ Заполните имя' as name,
  null as country,
  '⚠️ Заполните текст отзыва' as text,
  case
    when lower(o.name) ~ '\.(mp4|mov|webm|avi|mkv)$' then null
    else 'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/reviews/' || o.name
  end as avatar_url,
  case
    when lower(o.name) ~ '\.(mp4|mov|webm|avi|mkv)$'
      then 'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/reviews/' || o.name
    else null
  end as video_url,
  5 as rating,
  false as is_active
from storage.objects o
where o.bucket_id = 'reviews'
  and not exists (
    select 1 from reviews r
    where r.video_url = 'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/reviews/' || o.name
       or r.avatar_url = 'https://ygplwjrcispfkusjrism.supabase.co/storage/v1/object/public/reviews/' || o.name
  );


-- ------------------------------------------------------------
-- 4) Проверка результата
-- ------------------------------------------------------------
select category, count(*) from works group by category;
select count(*) from certificates;
select name, is_active from reviews order by created_at desc;
