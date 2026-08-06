-- 立て札への載せ方を参加者が選ぶ方式へ変更し、参加者メッセージを廃止します。
-- 何度実行しても安全です。

-- 肩書き・役職
alter table public.participants
  add column if not exists title text not null default '';

-- 立て札への載せ方
alter table public.participants
  add column if not exists tag_style text not null default 'name';

-- 旧 include_in_tag からの移行。掲載を希望していなかった方は 'none' に。
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'participants'
      and column_name = 'include_in_tag'
  ) then
    update public.participants
      set tag_style = case when include_in_tag then 'name' else 'none' end
      where tag_style = 'name';

    -- 以後は使わないため、既存行を壊さないよう既定値だけ残して制約を外す
    alter table public.participants alter column include_in_tag drop not null;
  end if;
end $$;

-- 匿名参加は立て札に載せない
update public.participants set tag_style = 'none' where is_anonymous;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'participants_tag_style_check'
  ) then
    alter table public.participants
      add constraint participants_tag_style_check
      check (tag_style in ('title_name', 'name', 'none'));
  end if;
end $$;

-- 参加者メッセージは使わなくなりました。
-- 過去の投稿を残したい場合はこの行をそのままに、不要なら次の行のコメントを外してください。
-- alter table public.participants drop column if exists message;
alter table public.participants alter column message drop not null;
