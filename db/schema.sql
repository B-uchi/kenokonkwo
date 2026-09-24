-- Idempotent: safe to run repeatedly (npm run db:setup)

create table if not exists tributes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  relation    text not null,
  message     text not null,
  status      text not null default 'approved'
              check (status in ('pending', 'approved', 'hidden')),
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists tributes_status_created_idx
  on tributes (status, created_at desc);

create table if not exists photos (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  width      integer not null check (width > 0),
  height     integer not null check (height > 0),
  caption    text not null default '',
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists photos_position_idx
  on photos (position, created_at);

create table if not exists biography (
  id         smallint primary key default 1 check (id = 1),
  title      text not null default '',
  body       jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

-- added later: optional author, plus a second account (his sister's)
alter table biography add column if not exists author text not null default '';
alter table biography add column if not exists second_title text not null default '';
alter table biography add column if not exists second_author text not null default '';
alter table biography add column if not exists second_body jsonb not null default '{"type":"doc","content":[]}'::jsonb;
alter table biography add column if not exists second_visible boolean not null default false;

insert into biography (id) values (1) on conflict (id) do nothing;

create table if not exists rsvps (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  email      text not null default '',
  guests     integer not null default 1 check (guests between 1 and 50),
  created_at timestamptz not null default now()
);

create index if not exists rsvps_created_idx on rsvps (created_at desc);
