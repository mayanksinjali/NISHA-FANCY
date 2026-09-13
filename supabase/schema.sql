-- ---------------------------------------------------------------------------
-- Online clothing store — Supabase schema
-- Run this in: Supabase dashboard -> SQL Editor -> New query -> Run
-- ---------------------------------------------------------------------------

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  category text,
  description text,
  image_url text,
  in_stock boolean default true,
  created_at timestamp default now()
);

-- The shop filters by category and always sorts newest-first.
create index if not exists products_created_at_idx on products (created_at desc);
create index if not exists products_category_idx on products (category);

-- ---------------------------------------------------------------------------
-- Row level security
-- The public site reads with the anon key -> SELECT only.
-- The admin panel writes with the service_role key, which bypasses RLS, so no
-- insert/update/delete policy is needed (and none should exist).
-- ---------------------------------------------------------------------------
alter table products enable row level security;

drop policy if exists "Public can read products" on products;
create policy "Public can read products"
  on products for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for product photos.
-- You can also create this in the dashboard: Storage -> New bucket ->
-- name "product-images", Public bucket ON.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Anyone can view the images; uploads/deletes go through the service role.
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- ---------------------------------------------------------------------------
-- Optional: a few sample rows so the grid isn't empty while you set things up.
-- Delete them from /admin once you add real stock.
-- ---------------------------------------------------------------------------
-- insert into products (name, price, category, description, image_url) values
--   ('Oversized linen shirt', 2450, 'Women', 'Washed linen, relaxed fit. S–XL.', null),
--   ('Heavyweight cotton tee', 1290, 'Men', '240gsm cotton, boxy cut.', null),
--   ('Woven leather belt', 1850, 'Accessories', 'Full grain leather, brass buckle.', null);
