-- مخطط قاعدة بيانات "ختمتنا" — يُنفَّذ في SQL Editor داخل Supabase عند إنشاء مشروع جديد
create table public.readers (
  id smallint primary key,
  name text not null,
  color text not null default '#2f7d6b',
  daily_goal smallint not null default 4 check (daily_goal between 1 and 100),
  gender text not null default 'm' check (gender in ('m','f')),
  created_at timestamptz not null default now()
);
create table public.khatmas (
  id uuid primary key default gen_random_uuid(),
  reader_id smallint not null references public.readers(id) on delete cascade,
  number int not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (reader_id, number)
);
create index khatmas_reader_idx on public.khatmas(reader_id, completed_at);
create unique index khatmas_one_open_per_reader on public.khatmas(reader_id) where completed_at is null;
create table public.page_reads (
  khatma_id uuid not null references public.khatmas(id) on delete cascade,
  page smallint not null check (page between 1 and 604),
  read_at timestamptz not null default now(),
  primary key (khatma_id, page)
);
create index page_reads_read_at_idx on public.page_reads(khatma_id, read_at);

insert into public.readers (id, name, color, daily_goal, gender) values
  (1, 'سالم', '#2f7d6b', 4, 'm'),
  (2, 'نسمة', '#b5653a', 4, 'f');
insert into public.khatmas (reader_id, number) values (1, 1), (2, 1);

alter table public.readers enable row level security;
alter table public.khatmas enable row level security;
alter table public.page_reads enable row level security;
create policy "anon_all_readers" on public.readers for all to anon using (true) with check (true);
create policy "anon_all_khatmas" on public.khatmas for all to anon using (true) with check (true);
create policy "anon_all_page_reads" on public.page_reads for all to anon using (true) with check (true);

alter publication supabase_realtime add table public.page_reads;
alter publication supabase_realtime add table public.khatmas;
