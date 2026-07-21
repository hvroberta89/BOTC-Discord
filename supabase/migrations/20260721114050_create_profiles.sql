create table public.profiles
(
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    display_name text not null,
    avatar_url text,
    discord_user_id text unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles
enable row level security;

create policy "Users can read profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles
    (
        id,
        display_name,
        avatar_url,
        discord_user_id
    )
    values
    (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'name',
            new.raw_user_meta_data ->> 'preferred_username',
            'Unknown player'
        ),
        new.raw_user_meta_data ->> 'avatar_url',
        new.raw_user_meta_data ->> 'provider_id'
    );

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();