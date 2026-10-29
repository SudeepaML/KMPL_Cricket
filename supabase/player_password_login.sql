-- KMPL Cricket player password login
-- Run this file in Supabase SQL Editor before using /player/login.
create extension if not exists pgcrypto;

create table if not exists public.player_credentials (
  player_id uuid primary key references public.players(id) on delete cascade,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.player_credentials enable row level security;
revoke all on table public.player_credentials from public, anon, authenticated;

create or replace function public.player_password_status(p_player_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (select 1 from public.players where id = p_player_id) then
    return jsonb_build_object('success', false, 'error', 'Player not found.');
  end if;
  return jsonb_build_object(
    'success', true,
    'registered', exists(select 1 from public.player_credentials where player_id = p_player_id)
  );
end;
$$;

create or replace function public.player_register_password(p_player_id uuid, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_password is null or char_length(p_password) < 4 or char_length(p_password) > 72 then
    return jsonb_build_object('success', false, 'error', 'Password must be 4–72 characters.');
  end if;
  if not exists (select 1 from public.players where id = p_player_id) then
    return jsonb_build_object('success', false, 'error', 'Player not found.');
  end if;
  insert into public.player_credentials(player_id, password_hash)
  values (p_player_id, extensions.crypt(p_password, extensions.gen_salt('bf')))
  on conflict (player_id) do nothing;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Password already set. Please log in.');
  end if;
  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.player_login(p_player_id uuid, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  player_row public.players%rowtype;
begin
  if p_password is null or length(p_password) > 72 then
    return jsonb_build_object('success', false, 'error', 'Invalid player name or password.');
  end if;
  select * into player_row from public.players where id = p_player_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid player name or password.');
  end if;
  if not exists (
    select 1 from public.player_credentials
    where player_id = p_player_id
      and password_hash = extensions.crypt(p_password, password_hash)
  ) then
    return jsonb_build_object('success', false, 'error', 'Invalid player name or password.');
  end if;
  return jsonb_build_object(
    'success', true,
    'player', jsonb_build_object(
      'id', player_row.id,
      'kmpl_id', player_row.kmpl_id,
      'name', player_row.name,
      'phone', player_row.phone,
      'type', player_row.type,
      'monthly_amount', player_row.monthly_amount,
      'join_date', player_row.join_date,
      'chitti_taken', player_row.chitti_taken,
      'created_at', player_row.created_at
    )
  );
end;
$$;

revoke all on function public.player_password_status(uuid) from public;
revoke all on function public.player_register_password(uuid, text) from public;
revoke all on function public.player_login(uuid, text) from public;
grant execute on function public.player_password_status(uuid) to anon, authenticated;
grant execute on function public.player_register_password(uuid, text) to anon, authenticated;
grant execute on function public.player_login(uuid, text) to anon, authenticated;
