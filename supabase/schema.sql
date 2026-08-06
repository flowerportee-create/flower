-- お祝い花取りまとめアプリ スキーマ
-- Supabase SQL Editor でそのまま実行できます。

create extension if not exists "pgcrypto";

-- =========================================================
-- プロフィール（幹事 / 花屋管理者）
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role text not null default 'organizer' check (role in ('organizer', 'florist')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    case when new.raw_user_meta_data ->> 'role' = 'florist' then 'florist' else 'organizer' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_florist()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'florist'
  );
$$;

-- =========================================================
-- 企画
-- =========================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references auth.users (id) on delete cascade,

  share_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  report_token text not null unique default encode(gen_random_bytes(12), 'hex'),

  title text not null,
  recipient_name text not null,
  delivery_address text not null,
  delivery_date date not null,
  entry_deadline date not null,
  target_amount integer not null default 0 check (target_amount >= 0),
  unit_amount integer not null default 0 check (unit_amount >= 0),
  flower_type text not null default '',
  color_preference text not null default '',
  tag_name text not null default '',
  message text not null default '',
  note text not null default '',

  status text not null default 'open' check (status in ('open', 'closed')),
  production_status text not null default 'pending'
    check (production_status in ('pending', 'accepted', 'in_progress', 'completed', 'delivered')),
  florist_comment text not null default '',
  completed_photo_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_organizer_idx on public.projects (organizer_id);
create index if not exists projects_delivery_date_idx on public.projects (delivery_date);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- =========================================================
-- 参加者
-- =========================================================
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  amount integer not null check (amount > 0),
  message text not null default '',
  include_in_tag boolean not null default true,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists participants_project_idx on public.participants (project_id);

-- =========================================================
-- 完成写真（複数枚）
-- =========================================================
create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists project_photos_project_idx on public.project_photos (project_id);

-- =========================================================
-- RLS
-- 参加者向けの公開ページはサーバー側の service role 経由で読み書きするため、
-- ここでは認証ユーザー（幹事・花屋）のみを対象にポリシーを定義します。
-- =========================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.participants enable row level security;
alter table public.project_photos enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- projects
drop policy if exists "projects_select" on public.projects;
create policy "projects_select" on public.projects
  for select using (auth.uid() = organizer_id or public.is_florist());

drop policy if exists "projects_insert_organizer" on public.projects;
create policy "projects_insert_organizer" on public.projects
  for insert with check (auth.uid() = organizer_id);

drop policy if exists "projects_update" on public.projects;
create policy "projects_update" on public.projects
  for update using (auth.uid() = organizer_id or public.is_florist());

drop policy if exists "projects_delete_organizer" on public.projects;
create policy "projects_delete_organizer" on public.projects
  for delete using (auth.uid() = organizer_id);

-- 花屋が更新できるのは制作関連の列のみに限定する。
-- （RLS は列単位の制限ができないため、トリガーで担保する）
create or replace function public.guard_project_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.organizer_id = auth.uid() then
    return new;
  end if;

  if public.is_florist() then
    if new.organizer_id is distinct from old.organizer_id
      or new.share_token is distinct from old.share_token
      or new.report_token is distinct from old.report_token
      or new.title is distinct from old.title
      or new.recipient_name is distinct from old.recipient_name
      or new.delivery_address is distinct from old.delivery_address
      or new.delivery_date is distinct from old.delivery_date
      or new.entry_deadline is distinct from old.entry_deadline
      or new.target_amount is distinct from old.target_amount
      or new.unit_amount is distinct from old.unit_amount
      or new.tag_name is distinct from old.tag_name
      or new.message is distinct from old.message
      or new.status is distinct from old.status
    then
      raise exception '花屋が変更できるのは制作ステータス・コメント・完成写真のみです。';
    end if;
    return new;
  end if;

  raise exception '更新権限がありません。';
end;
$$;

drop trigger if exists projects_guard_columns on public.projects;
create trigger projects_guard_columns
  before update on public.projects
  for each row execute function public.guard_project_columns();

-- participants
drop policy if exists "participants_select" on public.participants;
create policy "participants_select" on public.participants
  for select using (
    public.is_florist()
    or exists (
      select 1 from public.projects p
      where p.id = participants.project_id and p.organizer_id = auth.uid()
    )
  );

drop policy if exists "participants_delete_organizer" on public.participants;
create policy "participants_delete_organizer" on public.participants
  for delete using (
    exists (
      select 1 from public.projects p
      where p.id = participants.project_id and p.organizer_id = auth.uid()
    )
  );

-- project_photos
drop policy if exists "project_photos_select" on public.project_photos;
create policy "project_photos_select" on public.project_photos
  for select using (
    public.is_florist()
    or exists (
      select 1 from public.projects p
      where p.id = project_photos.project_id and p.organizer_id = auth.uid()
    )
  );

drop policy if exists "project_photos_insert_florist" on public.project_photos;
create policy "project_photos_insert_florist" on public.project_photos
  for insert with check (public.is_florist());

drop policy if exists "project_photos_delete_florist" on public.project_photos;
create policy "project_photos_delete_florist" on public.project_photos
  for delete using (public.is_florist());

-- =========================================================
-- Storage（完成写真）
-- =========================================================
insert into storage.buckets (id, name, public)
values ('flower-photos', 'flower-photos', true)
on conflict (id) do nothing;

drop policy if exists "flower_photos_public_read" on storage.objects;
create policy "flower_photos_public_read" on storage.objects
  for select using (bucket_id = 'flower-photos');

drop policy if exists "flower_photos_florist_write" on storage.objects;
create policy "flower_photos_florist_write" on storage.objects
  for insert with check (bucket_id = 'flower-photos' and public.is_florist());

drop policy if exists "flower_photos_florist_delete" on storage.objects;
create policy "flower_photos_florist_delete" on storage.objects
  for delete using (bucket_id = 'flower-photos' and public.is_florist());
