-- ============================================================================
-- KMPL CRICKET (Kagalagere Megala Hatti Premier League)
-- Village Cricket Tournament Transparent Finance Tracker Database Schema
-- Compatible with Supabase (PostgreSQL 15+, Auth, Realtime & RLS)
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES CREATION

-- Table: admins
-- Stores registered tournament administrators.
-- First seeded admin is Developer Sudeepa ML.
-- Co-officers can be added at any time so data entry is never delayed.
create table if not exists public.admins (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text not null,
    email text unique not null,
    is_developer boolean default false,
    role_title text default 'Tournament Officer',
    created_at timestamptz default now()
);

-- Table: players
-- Village cricket members participating in KMPL.
-- Member types: 'Senior' (₹200/mo) | 'Junior' (₹100/mo).
create table if not exists public.players (
    id uuid primary key default gen_random_uuid(),
    kmpl_id text unique not null,
    name text not null,
    phone text not null,
    type text not null check (type in ('Senior', 'Junior')),
    monthly_amount integer not null check (monthly_amount in (100, 200)),
    join_date date default current_date,
    chitti_taken boolean default false,
    created_at timestamptz default now()
);

-- Table: monthly_payments
-- Monthly fund ledger for 13 tournament months (April 2026 to April 2027).
-- Enforces one record per player per month.
-- Multi-admin audit: recorded_by tracks which officer collected the payment.
create table if not exists public.monthly_payments (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references public.players(id) on delete cascade,
    month text not null,
    status text not null check (status in ('PAID', 'PENDING')),
    payment_method text check (payment_method in ('Cash', 'UPI')),
    upi_reference text,
    paid_at timestamptz,
    recorded_by text,
    created_at timestamptz default now(),
    constraint unique_player_month unique (player_id, month)
);

-- Table: loans
-- "Baddi Chitti" interest-bearing emergency/tournament loan fund.
-- 10% monthly interest rate. Due date: 15th of next month.
-- Multi-admin audit: recorded_by tracks which officer issued or settled the loan.
create table if not exists public.loans (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references public.players(id) on delete cascade,
    player_name text not null,
    principal numeric(10, 2) not null check (principal > 0),
    interest numeric(10, 2) not null check (interest >= 0),
    total_return numeric(10, 2) not null check (total_return >= principal),
    lending_month text not null,
    repayment_month text,
    due_date date not null,
    status text not null check (status in ('ACTIVE', 'PAID', 'OVERDUE')),
    payment_method text check (payment_method in ('Cash', 'UPI')),
    upi_reference text,
    paid_at timestamptz,
    recorded_by text,
    created_at timestamptz default now()
);

-- Table: closed_months
-- Historical audit lock for monthly collections. Once locked, records are read-only.
create table if not exists public.closed_months (
    month text primary key,
    closed_by text not null,
    closed_at timestamptz default now()
);

-- Table: tournament_rules
-- Dynamic rules and regulations set by admins and shown to all players on the website
create table if not exists public.tournament_rules (
    id text primary key,
    "order" integer not null default 1,
    category text not null default 'general',
    title text not null,
    title_kn text not null,
    description text not null,
    description_kn text not null,
    is_active boolean not null default true,
    updated_at timestamptz default now(),
    updated_by text
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
alter table public.admins enable row level security;
alter table public.players enable row level security;
alter table public.monthly_payments enable row level security;
alter table public.loans enable row level security;
alter table public.closed_months enable row level security;
alter table public.tournament_rules enable row level security;

-- Helper function: is_registered_admin()
-- Checks if the authenticated Supabase user's email exists in the admins table.
create or replace function public.is_registered_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Policies for admins table:
-- Public can SELECT to show the registered officer selector for OTP login.
-- Registered admins can insert new co-officers at any time.
drop policy if exists "Public can view admins for login selection" on public.admins;
create policy "Public can view admins for login selection"
    on public.admins for select
    using (true);

drop policy if exists "Admins can manage admins" on public.admins;
create policy "Admins can manage admins"
    on public.admins for all
    to authenticated
    using (public.is_registered_admin())
    with check (public.is_registered_admin());

-- Policies for players table:
drop policy if exists "Public can view players" on public.players;
create policy "Public can view players"
    on public.players for select
    using (true);

drop policy if exists "Admins can manage players" on public.players;
create policy "Admins can manage players"
    on public.players for all
    to authenticated
    using (public.is_registered_admin())
    with check (public.is_registered_admin());

-- Policies for monthly_payments table:
drop policy if exists "Public can view monthly payments" on public.monthly_payments;
create policy "Public can view monthly payments"
    on public.monthly_payments for select
    using (true);

drop policy if exists "Admins can manage monthly payments" on public.monthly_payments;
create policy "Admins can manage monthly payments"
    on public.monthly_payments for all
    to authenticated
    using (public.is_registered_admin())
    with check (public.is_registered_admin());

-- Policies for loans table:
drop policy if exists "Public can view loans" on public.loans;
create policy "Public can view loans"
    on public.loans for select
    using (true);

drop policy if exists "Admins can manage loans" on public.loans;
create policy "Admins can manage loans"
    on public.loans for all
    to authenticated
    using (public.is_registered_admin())
    with check (public.is_registered_admin());

-- Policies for closed_months table:
drop policy if exists "Public can view closed months" on public.closed_months;
create policy "Public can view closed months"
    on public.closed_months for select
    using (true);

drop policy if exists "Admins can manage closed months" on public.closed_months;
create policy "Admins can manage closed months"
    on public.closed_months for all
    to authenticated
    using (public.is_registered_admin())
    with check (public.is_registered_admin());

-- Policies for tournament_rules table:
drop policy if exists "Public can view tournament rules" on public.tournament_rules;
create policy "Public can view tournament rules"
    on public.tournament_rules for select
    using (true);

drop policy if exists "Admins can manage tournament rules" on public.tournament_rules;
create policy "Admins can manage tournament rules"
    on public.tournament_rules for all
    to authenticated
    using (public.is_registered_admin())
    with check (public.is_registered_admin());

-- 4. SECURITY-DEFINER RPC FUNCTIONS

-- RPC: verify_developer(phone text)
-- Returns true if phone matches developer admin phone (7760880282 stored in DB).
create or replace function public.verify_developer(phone_input text)
returns boolean
language plpgsql
security definer
as $$
declare
    clean_input text;
    is_valid boolean := false;
begin
    clean_input := regexp_replace(phone_input, '[^0-9]', '', 'g');
    
    select exists (
        select 1 
        from public.admins 
        where is_developer = true 
          and regexp_replace(phone, '[^0-9]', '', 'g') = clean_input
    ) into is_valid;
    
    return is_valid;
end;
$$;

-- RPC: close_month(target_month text, phone text)
-- Allows any registered admin to lock a month using their registered mobile phone number.
create or replace function public.close_month(target_month text, phone_input text)
returns jsonb
language plpgsql
security definer
as $$
declare
    clean_input text;
    admin_record record;
begin
    clean_input := regexp_replace(phone_input, '[^0-9]', '', 'g');

    -- Verify that phone matches an active tournament officer
    select * into admin_record
    from public.admins
    where regexp_replace(phone, '[^0-9]', '', 'g') = clean_input
    limit 1;

    if admin_record is null then
        return jsonb_build_object('success', false, 'error', 'Authorization failed: Phone number is not registered to an active tournament officer.');
    end if;

    -- Lock the month with audit trail of the officer
    insert into public.closed_months (month, closed_by, closed_at)
    values (target_month, admin_record.name || ' (' || admin_record.phone || ')', now())
    on conflict (month) do update 
    set closed_by = excluded.closed_by, closed_at = now();

    return jsonb_build_object('success', true, 'month', target_month, 'closed_by', admin_record.name);
end;
$$;

-- RPC: delete_admin(target_admin_id uuid, phone text)
-- STRICT RULE: The primary Developer Admin (Sudeepa ML) CANNOT be deleted by anyone!
create or replace function public.delete_admin(target_admin_id uuid, phone_input text)
returns jsonb
language plpgsql
security definer
as $$
declare
    is_dev boolean;
    target_is_dev boolean;
begin
    -- 1. Prevent deleting the primary developer admin under any condition
    select is_developer into target_is_dev from public.admins where id = target_admin_id;
    if target_is_dev then
        return jsonb_build_object('success', false, 'error', 'The primary Developer Admin (Sudeepa ML) is permanently protected and cannot be deleted.');
    end if;

    -- 2. Verify developer phone for officer removal
    is_dev := public.verify_developer(phone_input);
    if not is_dev then
        return jsonb_build_object('success', false, 'error', 'Invalid developer authorization code.');
    end if;

    -- 3. Delete co-admin
    delete from public.admins where id = target_admin_id;

    return jsonb_build_object('success', true);
end;
$$;

-- 5. REALTIME REPLICATION CONFIGURATION
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.admins;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.monthly_payments;
alter publication supabase_realtime add table public.loans;
alter publication supabase_realtime add table public.closed_months;
alter publication supabase_realtime add table public.tournament_rules;

-- 6. SEED DATA

-- Seed Primary Developer Admin & Initial Officers
insert into public.admins (name, phone, email, is_developer, role_title)
values 
    ('Developer Sudeepa ML', '7760880282', 'sudeepaml63@gmail.com', true, 'Lead Developer & Officer'),
    ('Kiran Kumar (President)', '9900112233', 'kirankumar.kmpl@gmail.com', false, 'President & Co-Admin'),
    ('Manjunath H (Treasurer)', '9844556677', 'manjunath.treasurer@gmail.com', false, 'Treasurer & Co-Admin')
on conflict (email) do update 
set name = excluded.name, phone = excluded.phone, is_developer = excluded.is_developer, role_title = excluded.role_title;

-- Seed Village Players (Senior ₹200 and Junior ₹100)
insert into public.players (kmpl_id, name, phone, type, monthly_amount, join_date, chitti_taken)
values
    ('KMPL01', 'Sudeepa ML', '7760880282', 'Senior', 200, '2026-04-01', true),
    ('KMPL02', 'Kiran Kumar K', '9900112233', 'Senior', 200, '2026-04-01', false),
    ('KMPL03', 'Manjunath H', '9844556677', 'Senior', 200, '2026-04-01', false),
    ('KMPL04', 'Ravi Gowda', '9448123456', 'Senior', 200, '2026-04-01', true),
    ('KMPL05', 'Chetan Kumar', '9880123456', 'Senior', 200, '2026-04-01', false),
    ('KMPL06', 'Darshan M', '9741234567', 'Senior', 200, '2026-04-01', false),
    ('KMPL07', 'Naveen Kumar', '9611234567', 'Senior', 200, '2026-04-01', false),
    ('KMPL08', 'Praveen Gowda', '9480234567', 'Senior', 200, '2026-04-01', false),
    ('KMPL09', 'Abhishek R', '9986345678', 'Senior', 200, '2026-04-01', false),
    ('KMPL10', 'Shashank B', '9845345678', 'Senior', 200, '2026-04-01', false),
    ('KMPL11', 'Varun Gowda', '9731456789', 'Junior', 100, '2026-04-01', false),
    ('KMPL12', 'Yashwanth M', '9620456789', 'Junior', 100, '2026-04-01', false),
    ('KMPL13', 'Girish K', '9535567890', 'Junior', 100, '2026-04-01', false),
    ('KMPL14', 'Chandan S', '9449567890', 'Junior', 100, '2026-04-01', false),
    ('KMPL15', 'Puneeth Kumar', '9164678901', 'Junior', 100, '2026-04-01', false),
    ('KMPL16', 'Sharath Gowda', '9008678901', 'Junior', 100, '2026-04-01', false)
on conflict (kmpl_id) do nothing;

-- Seed Sample Monthly Collections for April 2026 with Multi-Admin audit info
insert into public.monthly_payments (player_id, month, status, payment_method, upi_reference, paid_at, recorded_by)
select id, 'April 2026', 'PAID', 'UPI', 'UPI/20260405/9823412', '2026-04-05 10:30:00+05:30', 'Developer Sudeepa ML'
from public.players where kmpl_id in ('KMPL01', 'KMPL02', 'KMPL03', 'KMPL04')
on conflict (player_id, month) do nothing;

insert into public.monthly_payments (player_id, month, status, payment_method, upi_reference, paid_at, recorded_by)
select id, 'April 2026', 'PAID', 'Cash', null, '2026-04-08 14:15:00+05:30', 'Kiran Kumar (President)'
from public.players where kmpl_id in ('KMPL05', 'KMPL06', 'KMPL11', 'KMPL12')
on conflict (player_id, month) do nothing;

-- Remaining players for April 2026 marked PENDING
insert into public.monthly_payments (player_id, month, status)
select id, 'April 2026', 'PENDING'
from public.players where kmpl_id in ('KMPL07', 'KMPL08', 'KMPL09', 'KMPL10', 'KMPL13', 'KMPL14', 'KMPL15', 'KMPL16')
on conflict (player_id, month) do nothing;

-- Seed Sample Baddi Chitti Loans with recorded_by
insert into public.loans (player_id, player_name, principal, interest, total_return, lending_month, repayment_month, due_date, status, payment_method, upi_reference, paid_at, recorded_by)
select id, name, 10000.00, 1000.00, 11000.00, 'April 2026', 'May 2026', '2026-05-15', 'PAID', 'UPI', 'UPI/20260514/9912001', '2026-05-14 11:20:00+05:30', 'Kiran Kumar (President)'
from public.players where kmpl_id = 'KMPL01'
on conflict do nothing;

insert into public.loans (player_id, player_name, principal, interest, total_return, lending_month, repayment_month, due_date, status, recorded_by)
select id, name, 5000.00, 500.00, 5500.00, 'April 2026', 'May 2026', '2026-05-15', 'ACTIVE', 'Developer Sudeepa ML'
from public.players where kmpl_id = 'KMPL04'
on conflict do nothing;

-- Seed Official Tournament Fund Rules & Regulations
insert into public.tournament_rules (id, "order", category, title, title_kn, description, description_kn, is_active, updated_by)
values
    ('rule-01', 1, 'contribution', 'Monthly Contribution Tiers', 'ಮಾಸಿಕ ದೇಣಿಗೆ ವರ್ಗಗಳು', 'Senior members contribute ₹200/month. Junior members contribute ₹100/month across all 13 tournament months (April 2026 to April 2027).', 'ಹಿರಿಯ ಆಟಗಾರರು ಪ್ರತಿ ತಿಂಗಳು ₹200 ಹಾಗೂ ಕಿರಿಯ ಆಟಗಾರರು ಪ್ರತಿ ತಿಂಗಳು ₹100 ರಂತೆ ಒಟ್ಟು 13 ತಿಂಗಳು (ಏಪ್ರಿಲ್ 2026 ರಿಂದ ಏಪ್ರಿಲ್ 2027) ಪಾವತಿಸಬೇಕು.', true, 'Developer Sudeepa ML'),
    ('rule-02', 2, 'deadline', 'Strict Payment Deadline on 15th', 'ಪ್ರತಿ ತಿಂಗಳ 15 ನೇ ತಾರೀಖು ಅಂತಿಮ ಗಡುವು', 'All monthly contributions must be paid on or before the 15th of each month. Future months remain locked with a live countdown clock until their cycle starts.', 'ಪ್ರತಿ ತಿಂಗಳ 15 ನೇ ತಾರೀಖಿನೊಳಗೆ ಮಾಸಿಕ ಹಣ ಪಾವತಿಸುವುದು ಕಡ್ಡಾಯ. ಮುಂದಿನ ತಿಂಗಳುಗಳು ಅವುಗಳ ದಿನಾಂಕ ಬರುವವರೆಗೆ ಲೈವ್ ಕೌಂಟ್‌ಡೌನ್‌ನೊಂದಿಗೆ ಲಾಕ್ ಆಗಿರುತ್ತವೆ.', true, 'Developer Sudeepa ML'),
    ('rule-03', 3, 'loan', 'Baddi Chitti 10% Flat Monthly Interest', 'ಬಡ್ಡಿ ಚಿಟ್ಟಿ 10% ಮಾಸಿಕ ಬಡ್ಡಿ', 'Baddi Chitti loans carry a flat 10% monthly interest. Borrowing opens in April 2026; borrower repayments commence from May 2026 onward.', 'ಬಡ್ಡಿ ಚಿಟ್ಟಿ ಸಾಲಕ್ಕೆ ಪ್ರತಿ ತಿಂಗಳು 10% ನಿಗದಿತ ಬಡ್ಡಿ ಇರುತ್ತದೆ. ಏಪ್ರಿಲ್ 2026 ರಿಂದ ಸಾಲ ನೀಡಿಕೆ ಆರಂಭವಾಗಲಿದ್ದು, ಮೇ 2026 ರಿಂದ ಮರುಪಾವತಿ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.', true, 'Developer Sudeepa ML'),
    ('rule-04', 4, 'loan', 'Single Active Loan Per Member', 'ಒಬ್ಬರಿಗೆ ಒಂದೇ ಸಾಲದ ನಿಯಮ', 'A member may only take one active loan at a time. The borrower must fully settle principal and 10% interest before taking a subsequent chitti.', 'ಒಬ್ಬ ಸದಸ್ಯರಿಗೆ ಒಂದೇ ಸಮಯದಲ್ಲಿ ಒಂದು ಸಾಲಕ್ಕೆ ಮಾತ್ರ ಅವಕಾಶ. ಹಿಂದಿನ ಸಾಲ ಮತ್ತು ಬಡ್ಡಿಯನ್ನು ಪೂರ್ಣವಾಗಿ ತೀರಿಸಿದ ನಂತರವೇ ಹೊಸ ಸಾಲ ಪಡೆಯಬಹುದು.', true, 'Developer Sudeepa ML'),
    ('rule-05', 5, 'accounting', 'Grand Total Accounting Formula', 'ಒಟ್ಟು ನಿಧಿ ಲೆಕ್ಕಾಚಾರದ ಸೂತ್ರ', 'Loan principal is disbursed directly out of the collected monthly fund. Therefore, Tournament Grand Total = Total Monthly Contributions + Baddi Chitti 10% Interest Earned.', 'ಸಾಲದ ಮೂಲ ಮೊತ್ತವನ್ನು ಸಂಗ್ರಹಿಸಿದ ಮಾಸಿಕ ಫಂಡ್‌ನಿಂದಲೇ ನೀಡಲಾಗುತ್ತದೆ. ಆದ್ದರಿಂದ ಟೂರ್ನಮೆಂಟ್ ಒಟ್ಟು ಹಣ = ಒಟ್ಟು ಮಾಸಿಕ ದೇಣಿಗೆ + ಬಂದಿರುವ 10% ಬಡ್ಡಿ ಮೊತ್ತ ಮಾತ್ರ.', true, 'Developer Sudeepa ML'),
    ('rule-06', 6, 'general', '100% Public Transparency — No Player Login Needed', 'ಸಂಪೂರ್ಣ ಗ್ರಾಮ ಪಾರದರ್ಶಕತೆ — ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ', 'No password or login is required for players or villagers! Anyone can freely view player profiles, monthly payment lists, countdown clocks, and loan records anytime.', 'ಆಟಗಾರರಿಗೆ ಮತ್ತು ಊರಿನ ಗ್ರಾಮಸ್ಥರಿಗೆ ಯಾವುದೇ ಲಾಗಿನ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ! ಯಾರು ಬೇಕಾದರೂ ಎಲ್ಲಾ ಸದಸ್ಯರ ಪಟ್ಟಿ, ಪಾವತಿ ಸ್ಥಿತಿ ಮತ್ತು ಸಾಲದ ವಿವರಗಳನ್ನು ಮುಕ್ತವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು.', true, 'Developer Sudeepa ML'),
    ('rule-07', 7, 'general', 'Month Closure & Admin Phone Audit Lock', 'ತಿಂಗಳು ಮುಕ್ತಾಯ ಮತ್ತು ಆಡಿಟ್ ಲಾಕ್', 'Completed months are locked for audit. Only authorized committee members can record collections, issue loans, or close months using phone verification.', 'ಮುಕ್ತಾಯವಾದ ತಿಂಗಳುಗಳನ್ನು ಆಡಿಟ್‌ಗಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ. ನೋಂದಾಯಿತ ಆಡಳಿತ ಅಧಿಕಾರಿಗಳು ಮಾತ್ರ ಮೊಬೈಲ್ ದೃಢೀಕರಣದೊಂದಿಗೆ ತಿಂಗಳು ಲಾಕ್ ಮಾಡಬಹುದು ಮತ್ತು ತಿದ್ದುಪಡಿ ಮಾಡಬಹುದು.', true, 'Developer Sudeepa ML')
on conflict (id) do nothing;
