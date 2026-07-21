create table public.application_health
(
    id bigint generated always as identity primary key,
    message text not null,
    created_at timestamptz not null default now()
);

alter table public.application_health
enable row level security;

create policy "Application health is publicly readable"
on public.application_health
for select
to anon, authenticated
using (true);

insert into public.application_health (message)
values ('Supabase connection is working.');