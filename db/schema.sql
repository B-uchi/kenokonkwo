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
