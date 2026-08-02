# ACLIC Membership Application

A web form for joining the **Addis Child-Led Initiatives Coalition (ACLIC)**, in
partnership with Save the Children and the Organization for Social Development (OSD).

It is a digital version of the coalition's paper membership application: the same six
sections, the same questions, turned into a mobile-first wizard that saves as you type.
Submissions land in Supabase, and coalition staff review them in a built-in dashboard.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres,
Auth, Storage) · deployed on Vercel.

---

## What it does

**For applicants** — `/` and `/apply`

- Seven-step wizard: the six sections of the paper form plus a review page.
- Answers autosave to the browser, so a child filling it in on a shared phone can stop
  and come back.
- Validation is friendly and inline: no lost work, no cryptic messages. Applicants who
  fall outside the 12–17 age range are told why.
- A recommendation letter (PDF, photo, or Word) uploads straight to private storage.
- Parent/guardian consent replaces the paper signature block and is required.
- On submit, the applicant gets a reference code such as `ACLIC-2026-7QK4ZB`.

**For coalition staff** — `/admin`

- Email + password sign-in, restricted to an explicit allowlist of reviewer accounts.
- List, filter by status, and search every application.
- Full detail view with a download link for the recommendation letter.
- The "FOR ACLIC OFFICE USE ONLY" box from the paper form: Approved / Waitlisted /
  Follow-up needed / Not accepted, plus internal reviewer notes.
- One-click CSV export of everything, UTF-8 with a BOM so Amharic survives Excel.

---

## Setup

### 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a region close to
   your users (`eu-central-1` is a reasonable choice from Addis Ababa).
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it.

That one script creates the `applications` table, the `admins` allowlist, the enums,
the reference-code generator, row-level security, and the private
`recommendation-letters` storage bucket.

### 2. Collect the three keys

In Supabase, go to **Project Settings → API**:

| Value | Environment variable |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` / secret key | `SUPABASE_SERVICE_ROLE_KEY` |

The `service_role` key bypasses all security rules. Keep it server-side only — never
prefix it with `NEXT_PUBLIC_`, never paste it into client code, never commit it.

### 3. Run it locally

```bash
cp .env.example .env.local     # then fill in the three values
npm install
npm run dev                    # http://localhost:3000
```

### 4. Deploy to Vercel

1. Push this repository to GitHub (see below if you have not yet).
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
   Vercel detects Next.js; the defaults are correct.
3. Under **Environment Variables**, add all three variables from step 2 for the
   Production, Preview and Development environments.
4. **Deploy.**

Every push to your default branch redeploys automatically.

### 5. Create your first reviewer account

1. Supabase → **Authentication → Users → Add user**. Enter an email and password and
   tick **Auto Confirm User**.
2. Copy the new user's UUID, then run this in the SQL Editor:

   ```sql
   insert into public.admins (user_id, email, full_name)
   values ('paste-the-uuid-here', 'you@example.org', 'Your Name')
   on conflict (user_id) do nothing;
   ```

3. Sign in at `/admin`.

Repeat for each staff member. A Supabase account that is *not* in `admins` can sign in
but sees nothing — the allowlist, not the account, grants access.

---

## How the data is protected

Applicants are children, so the design assumes the public keys will leak eventually and
makes that survivable.

- **Row Level Security is on, with no policies.** Neither the `anon` key nor a
  signed-in browser session can read or write `applications` directly. Someone who
  lifts the public key out of the page source gets nothing.
- **Every read and write goes through a server route** that holds the `service_role`
  key and performs its own validation and admin checks.
- **The storage bucket is private.** Uploads use a single-use signed URL minted
  server-side; downloads use a 2-minute signed URL minted for a verified reviewer.
- **Validation runs twice** — in the browser for fast feedback, and again on the server
  from the same schema (`src/lib/form-schema.ts`), so a crafted request cannot skip it.
- **The database enforces the rules too.** `CHECK` constraints reject any row where
  safeguarding, the declaration, or guardian consent is missing, or where the age falls
  outside 12–17, no matter what wrote it.
- Uploaded filenames are discarded and replaced with a UUID; the original is kept only
  as a display label. Submitted paths are pattern-checked and confirmed to exist before
  a row is written.
- A hidden honeypot field silently drops bot submissions.

---

## Project layout

```
supabase/schema.sql            One-shot database + storage setup

src/lib/
  form-schema.ts               The form's single source of truth: fields, rules,
                               wizard steps, per-step and whole-form validation
  form-values.ts               React state shape, defaults, draft save/restore
  supabase/{admin,server,client}.ts   Service-role, SSR-auth, and browser clients
  auth.ts                      Reviewer allowlist check
  types.ts, labels.ts, constants.ts

src/app/
  page.tsx                     Landing page
  apply/                       The wizard
  thank-you/                   Confirmation + reference code
  admin/                       Login, dashboard, application detail, review actions
  api/upload-url/              Mints signed upload URLs
  api/applications/            Validates and stores a submission
  api/admin/letter/[id]/       Signed download for reviewers
  api/admin/export/            CSV export

src/components/
  form/                        Wizard shell, progress, file upload, step components
  ui/Fields.tsx                Inputs, textareas, selects, radios, checkboxes
  admin/StatusBadge.tsx

src/proxy.ts                   Refreshes auth cookies, gates /admin
```

### Where to change things

| To change… | Edit |
| --- | --- |
| A question's wording | the matching step in `src/components/form/steps/` |
| A validation rule | `src/lib/form-schema.ts` |
| Add or remove a field | `form-schema.ts`, `form-values.ts`, the step component, `api/applications/route.ts`, and `supabase/schema.sql` |
| Brand colours | the `@theme` block in `src/app/globals.css` |
| CSV columns | `COLUMNS` in `src/app/api/admin/export/route.ts` |

---

## Commands

```bash
npm run dev         # development server
npm run build       # production build
npm run start       # serve the production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

---

## Notes and possible next steps

- **No email is sent.** Applicants see a reference code on screen; staff contact them
  using the phone or email supplied. To add confirmation emails, plug Resend or
  Supabase Auth hooks into `src/app/api/applications/route.ts`.
- **The admin list loads up to 1000 applications** and filters in memory. That is right
  for a coalition-sized dataset; past a few thousand, move filtering and paging into the
  Supabase query.
- **English only.** Strings live in the step components and `form-schema.ts`, so an
  Amharic translation is a contained change. The font stack already includes
  Noto Sans Ethiopic, and Amharic typed into the form stores and exports correctly today.
- **No rate limiting on submissions.** If the form is publicised widely, put Vercel
  Firewall rate limits in front of `/api/applications` and `/api/upload-url`.
