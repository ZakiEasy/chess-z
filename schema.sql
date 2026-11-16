-- =====================================================================
-- Échecs pour enfants — schéma Supabase (session 1)
-- À coller dans Supabase > SQL Editor > Run
-- Principe : le compte (auth.users) = le parent ; les enfants sont des
-- "profils" rattachés au parent. Le contenu pédagogique est dans le dépôt
-- (content/*.json) ; la base ne stocke que la progression.
-- =====================================================================

create table public.children (
  id             uuid primary key default gen_random_uuid(),
  parent_id      uuid not null references auth.users(id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 30),
  avatar         text not null default 'knight',
  track          text not null default 'explorer'
                 check (track in ('explorer', 'strategist')),   -- 7-10 ans / 10-14 ans
  pin_hash       text,                  -- verrou facultatif du profil (hash côté client)
  xp             integer not null default 0 check (xp >= 0),
  level          integer not null default 1 check (level >= 1),
  streak         integer not null default 0,
  best_streak    integer not null default 0,
  last_active_on date,
  created_at     timestamptz not null default now()
);
create index children_parent_idx on public.children(parent_id);

-- Une ligne par tentative d'exercice
create table public.exercise_attempts (
  id          bigint generated always as identity primary key,
  child_id    uuid not null references public.children(id) on delete cascade,
  exercise_id text not null,            -- ex. 'm1-e1' (défini dans content/curriculum.json)
  success     boolean not null,
  tries       smallint not null default 1,
  hints_used  smallint not null default 0,
  played_on   date not null default current_date,
  created_at  timestamptz not null default now()
);
create index attempts_child_idx on public.exercise_attempts(child_id, played_on);

-- Badges obtenus
create table public.child_badges (
  child_id  uuid not null references public.children(id) on delete cascade,
  badge_id  text not null,
  earned_at timestamptz not null default now(),
  primary key (child_id, badge_id)
);

-- Parties contre le robot + bilan après défaite ("apprendre à perdre")
create table public.games (
  id         bigint generated always as identity primary key,
  child_id   uuid not null references public.children(id) on delete cascade,
  bot_level  smallint not null check (bot_level between 1 and 8),
  result     text not null check (result in ('win', 'loss', 'draw')),
  pgn        text,
  mood       text check (mood in ('proud', 'ok', 'sad', 'angry')),
  reflection text,                      -- "Qu'ai-je appris ?"
  handshake  boolean not null default false,  -- a fait la "poignée de main"
  created_at timestamptz not null default now()
);
create index games_child_idx on public.games(child_id, created_at);

-- ---------------------------------------------------------------------
-- Sécurité : chaque parent ne voit que ses enfants
-- ---------------------------------------------------------------------
alter table public.children          enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.child_badges      enable row level security;
alter table public.games             enable row level security;

create policy "parent gère ses enfants" on public.children
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

create policy "parent gère les tentatives" on public.exercise_attempts
  for all using (exists (select 1 from public.children c
                         where c.id = child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from public.children c
                      where c.id = child_id and c.parent_id = auth.uid()));

create policy "parent gère les badges" on public.child_badges
  for all using (exists (select 1 from public.children c
                         where c.id = child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from public.children c
                      where c.id = child_id and c.parent_id = auth.uid()));

create policy "parent gère les parties" on public.games
  for all using (exists (select 1 from public.children c
                         where c.id = child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from public.children c
                      where c.id = child_id and c.parent_id = auth.uid()));
