-- 既に schema.sql を実行済みの環境向けの差分。
-- Square 決済・用途・見本写真を追加します。何度実行しても安全です。

-- =========================================================
-- 企画: 用途と花の形
-- =========================================================
alter table public.projects
  add column if not exists purpose text not null default 'other';
alter table public.projects
  add column if not exists arrangement text not null default 'stand';

-- =========================================================
-- 参加者: 決済まわり
-- =========================================================
alter table public.participants
  add column if not exists payment_status text not null default 'pending';
alter table public.participants
  add column if not exists payment_token text;
alter table public.participants
  add column if not exists square_payment_link_id text;
alter table public.participants
  add column if not exists square_order_id text;
alter table public.participants
  add column if not exists square_payment_id text;
alter table public.participants
  add column if not exists paid_at timestamptz;

-- 決済導入前に登録済みの参加者は、集金済みとして扱う（幹事が現金で集めたもの）。
update public.participants
  set payment_status = 'paid',
      paid_at = coalesce(paid_at, created_at)
  where payment_status = 'pending'
    and square_order_id is null
    and created_at < now() - interval '1 hour';

-- 既存行に決済トークンを補充してから NOT NULL 制約をかける。
update public.participants
  set payment_token = encode(gen_random_bytes(16), 'hex')
  where payment_token is null;

alter table public.participants
  alter column payment_token set default encode(gen_random_bytes(16), 'hex');
alter table public.participants
  alter column payment_token set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'participants_payment_status_check'
  ) then
    alter table public.participants
      add constraint participants_payment_status_check
      check (payment_status in ('pending', 'paid', 'canceled'));
  end if;
end $$;

create unique index if not exists participants_payment_token_idx
  on public.participants (payment_token);
create index if not exists participants_paid_idx
  on public.participants (project_id, payment_status);
create unique index if not exists participants_square_order_idx
  on public.participants (square_order_id) where square_order_id is not null;

-- =========================================================
-- 見本写真
-- =========================================================
create table if not exists public.flower_samples (
  id uuid primary key default gen_random_uuid(),
  purpose text not null,
  color_key text not null,
  arrangement text not null default 'stand',
  storage_path text not null,
  public_url text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists flower_samples_lookup_idx
  on public.flower_samples (purpose, color_key, arrangement);

alter table public.flower_samples enable row level security;

drop policy if exists "flower_samples_select" on public.flower_samples;
create policy "flower_samples_select" on public.flower_samples
  for select using (auth.uid() is not null);

drop policy if exists "flower_samples_write_florist" on public.flower_samples;
create policy "flower_samples_write_florist" on public.flower_samples
  for insert with check (public.is_florist());

drop policy if exists "flower_samples_delete_florist" on public.flower_samples;
create policy "flower_samples_delete_florist" on public.flower_samples
  for delete using (public.is_florist());

-- =========================================================
-- 花屋が変更してよい列に purpose を追加（差し替え）
-- =========================================================
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
      or new.purpose is distinct from old.purpose
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
