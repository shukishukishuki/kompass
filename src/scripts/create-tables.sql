-- diagnosis_results テーブル
create table if not exists diagnosis_results (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  layer_completed integer not null default 1,
  mbti text,
  answers jsonb,
  created_at timestamp with time zone default timezone('utc', now())
);

-- users テーブル（メール登録）
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  diagnosis_type text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- RLS（Row Level Security）を有効化
alter table diagnosis_results enable row level security;
alter table users enable row level security;

-- 匿名ユーザーからのinsertを許可
create policy "allow insert diagnosis_results" on diagnosis_results
  for insert with check (true);

create policy "allow insert users" on users
  for insert with check (true);

-- 集計用のselectを許可（全件）
create policy "allow select diagnosis_results" on diagnosis_results
  for select using (true);

-- 手動実行用マイグレーション（既存 DB にカラム／UPDATE ポリシーが無い場合）
alter table diagnosis_results add column if not exists age_range text;
alter table diagnosis_results add column if not exists infrastructure text;
alter table diagnosis_results add column if not exists clicked_ai_button text;
alter table diagnosis_results add column if not exists clicked_prompt_copy boolean;
alter table diagnosis_results add column if not exists clicked_share boolean;
alter table diagnosis_results add column if not exists visited_at timestamptz;
alter table diagnosis_results add column if not exists ai_execution_feedback text;
alter table diagnosis_results add column if not exists task_type text;

drop policy if exists "allow update diagnosis_results behavior" on diagnosis_results;
create policy "allow update diagnosis_results behavior" on diagnosis_results
  for update using (true) with check (true);
