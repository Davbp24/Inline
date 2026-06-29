-- Multi-agent persistence: run logs, per-call usage, chat sessions,
-- integrations, and automation runs. All owner-scoped via RLS, matching the
-- existing ai_feedback / workspace_embeddings conventions (text workspace_id).

-- 1. Agent runs ----------------------------------------------------------
create table if not exists public.agent_runs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  workspace_id      text not null default '',
  intent            text not null,
  routed_by         text,
  agents_used       text[] not null default '{}',
  input             jsonb not null default '{}'::jsonb,
  output            text,
  status            text not null default 'completed',
  eval_pass         boolean,
  eval_notes        text,
  prompt_tokens     int not null default 0,
  completion_tokens int not null default 0,
  latency_ms        int not null default 0,
  est_cost_usd      numeric(12,6) not null default 0,
  value_category    text,
  surface           text,
  created_at        timestamptz not null default now()
);

create index if not exists agent_runs_user_workspace_idx
  on public.agent_runs (user_id, workspace_id, created_at desc);
create index if not exists agent_runs_intent_idx
  on public.agent_runs (user_id, intent);

alter table public.agent_runs enable row level security;
drop policy if exists "agent runs are owner-only" on public.agent_runs;
create policy "agent runs are owner-only" on public.agent_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Per-call usage events ----------------------------------------------
create table if not exists public.ai_usage_events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  workspace_id      text not null default '',
  run_id            uuid references public.agent_runs(id) on delete cascade,
  agent             text not null,
  provider          text not null,
  model             text not null,
  prompt_tokens     int not null default 0,
  completion_tokens int not null default 0,
  latency_ms        int not null default 0,
  est_cost_usd      numeric(12,6) not null default 0,
  surface           text,
  created_at        timestamptz not null default now()
);

create index if not exists ai_usage_events_user_workspace_idx
  on public.ai_usage_events (user_id, workspace_id, created_at desc);
create index if not exists ai_usage_events_run_idx
  on public.ai_usage_events (run_id);

alter table public.ai_usage_events enable row level security;
drop policy if exists "ai usage events are owner-only" on public.ai_usage_events;
create policy "ai usage events are owner-only" on public.ai_usage_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Agent chat sessions + messages (persisted workflow history) ---------
create table if not exists public.agent_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  workspace_id text not null default '',
  title        text not null default 'New session',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists agent_sessions_user_workspace_idx
  on public.agent_sessions (user_id, workspace_id, updated_at desc);

alter table public.agent_sessions enable row level security;
drop policy if exists "agent sessions are owner-only" on public.agent_sessions;
create policy "agent sessions are owner-only" on public.agent_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.agent_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  session_id  uuid not null references public.agent_sessions(id) on delete cascade,
  run_id      uuid references public.agent_runs(id) on delete set null,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null default '',
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists agent_messages_session_idx
  on public.agent_messages (session_id, created_at);

alter table public.agent_messages enable row level security;
drop policy if exists "agent messages are owner-only" on public.agent_messages;
create policy "agent messages are owner-only" on public.agent_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Integration connections (Notion, etc.) -----------------------------
create table if not exists public.integration_connections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  workspace_id text not null default '',
  provider     text not null,
  access_token text,
  config       jsonb not null default '{}'::jsonb,
  status       text not null default 'connected',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index if not exists integration_connections_unique_idx
  on public.integration_connections (user_id, workspace_id, provider);

alter table public.integration_connections enable row level security;
drop policy if exists "integration connections are owner-only" on public.integration_connections;
create policy "integration connections are owner-only" on public.integration_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. Automation runs (e.g. Internship Tracker) --------------------------
create table if not exists public.automation_runs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  workspace_id   text not null default '',
  kind           text not null,
  status         text not null default 'completed',
  input          jsonb not null default '{}'::jsonb,
  output         jsonb not null default '{}'::jsonb,
  run_id         uuid references public.agent_runs(id) on delete set null,
  value_category text,
  created_at     timestamptz not null default now()
);

create index if not exists automation_runs_user_workspace_idx
  on public.automation_runs (user_id, workspace_id, created_at desc);

alter table public.automation_runs enable row level security;
drop policy if exists "automation runs are owner-only" on public.automation_runs;
create policy "automation runs are owner-only" on public.automation_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
