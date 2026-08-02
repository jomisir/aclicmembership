-- =====================================================================
-- ACLIC Membership Application — Supabase schema
-- Addis Child-Led Initiatives Coalition
--
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New
-- query → paste → Run). It is idempotent: safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------

do $$ begin
  create type application_status as enum (
    'pending',      -- submitted, not yet reviewed
    'approved',
    'waitlisted',
    'follow_up',    -- "Follow-up needed" on the paper form
    'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type time_commitment as enum (
    'lt_2_hours',
    '2_to_5_hours',
    '5_to_10_hours',
    'gt_10_hours'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type meeting_availability as enum ('yes', 'no', 'depends');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2. Reference code generator (human-friendly, e.g. ACLIC-2026-7QK4ZB)
-- ---------------------------------------------------------------------

create or replace function generate_reference_code()
returns text
language plpgsql
as $$
declare
  -- Crockford-ish alphabet: no I, L, O, U, 0, 1 — unambiguous when read aloud.
  alphabet constant text := 'ABCDEFGHJKMNPQRSTVWXYZ23456789';
  code text := '';
  i int;
begin
  for i in 1..6 loop
    code := code || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
  end loop;
  return 'ACLIC-' || to_char(now(), 'YYYY') || '-' || code;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Applications table — mirrors the paper form section by section
-- ---------------------------------------------------------------------

create table if not exists public.applications (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  reference_code              text not null unique default generate_reference_code(),

  -- --- Section 1: Personal Information -----------------------------
  structure_name              text not null,
  lead_child_full_name        text not null,
  age                         smallint not null check (age between 12 and 17),
  gender                      text not null,
  members_female              smallint not null default 0 check (members_female >= 0),
  members_male                smallint not null default 0 check (members_male >= 0),
  members_total               smallint generated always as (members_female + members_male) stored,
  school_institution          text,
  grade_or_occupation         text,
  woreda_subcity_city         text not null,
  phone                       text not null,
  email                       text,
  support_agency              text,

  parent_guardian_name        text not null,
  parent_guardian_phone       text not null,
  -- Digital stand-in for the parent/guardian signature block.
  parent_guardian_consent     boolean not null default false,
  parent_guardian_consent_at  timestamptz,

  -- --- Section 2: Motivation for Joining ---------------------------
  motivation_why              text not null,
  structure_profile           text,           -- optional on the paper form
  motivation_hopes            text not null,

  -- --- Section 3: Understanding of Children's Rights ---------------
  rights_meaning              text not null,
  uncrc_familiar              boolean not null,
  uncrc_rights                text,           -- required when uncrc_familiar is true
  rights_at_risk              text not null,
  rights_violation_witnessed  text not null,
  why_child_led               text not null,

  -- --- Section 4: Experience & Involvement -------------------------
  prior_involvement           text,
  skills_strengths            text not null,
  -- [{ name, email, phone, address }, ...] — at least one required.
  recommenders                jsonb not null default '[]'::jsonb,
  recommendation_letter_path  text not null,  -- path inside the storage bucket
  recommendation_letter_name  text,           -- original filename, for display

  -- --- Section 5: Commitment & Safeguarding ------------------------
  time_commitment             time_commitment not null,
  attends_meetings            meeting_availability not null,
  attends_meetings_note       text,           -- required when attends_meetings = 'depends'
  safeguarding_agreed         boolean not null default false,

  -- --- Section 6: Declaration --------------------------------------
  declaration_agreed          boolean not null default false,
  applicant_signature         text not null,  -- typed full name = e-signature
  declaration_date            date not null,

  -- --- For ACLIC office use only -----------------------------------
  status                      application_status not null default 'pending',
  reviewer_notes              text,
  reviewed_at                 timestamptz,
  reviewed_by                 text,

  -- Membership is conditional on both of these, enforced at the database
  -- level so a bad client can never write a non-compliant application.
  constraint safeguarding_must_be_agreed check (safeguarding_agreed),
  constraint declaration_must_be_agreed  check (declaration_agreed),
  constraint guardian_consent_required   check (parent_guardian_consent),
  constraint at_least_one_recommender    check (jsonb_array_length(recommenders) >= 1)
);

create index if not exists applications_created_at_idx on public.applications (created_at desc);
create index if not exists applications_status_idx     on public.applications (status);
create index if not exists applications_reference_idx  on public.applications (reference_code);

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists applications_touch_updated_at on public.applications;
create trigger applications_touch_updated_at
  before update on public.applications
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 4. Admins — who may read applications in the review dashboard
-- ---------------------------------------------------------------------

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. Row Level Security
--
-- Deliberately deny-all: no policies are defined for the `anon` or
-- `authenticated` roles, so neither the public form nor a logged-in
-- browser session can touch these tables directly. Every read and write
-- goes through a Next.js server route using the service role key, which
-- bypasses RLS and applies its own validation and admin checks.
--
-- This matters because the data is about children: locking the tables
-- means a leaked anon key exposes nothing.
-- ---------------------------------------------------------------------

alter table public.applications enable row level security;
alter table public.admins       enable row level security;

-- ---------------------------------------------------------------------
-- 6. Storage: recommendation letters (private bucket)
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recommendation-letters',
  'recommendation-letters',
  false,
  10485760, -- 10 MB
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- No storage policies either: uploads use a short-lived signed upload URL
-- minted server-side, and downloads use a short-lived signed download URL
-- minted for an authenticated admin. Nothing in the bucket is public.

-- ---------------------------------------------------------------------
-- 7. Bootstrapping your first admin
--
--   1. Supabase Dashboard → Authentication → Users → "Add user"
--      (email + password, tick "Auto Confirm User").
--   2. Copy the new user's UUID, then run:
--
--        insert into public.admins (user_id, email, full_name)
--        values ('<paste-uuid>', 'you@example.org', 'Your Name')
--        on conflict (user_id) do nothing;
--
-- ---------------------------------------------------------------------
