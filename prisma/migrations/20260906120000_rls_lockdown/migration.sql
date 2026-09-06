-- Close the database off to the browser-facing Postgres roles.
--
-- Prisma creates every table in `public`, which on Supabase is the schema
-- PostgREST serves at https://<ref>.supabase.co/rest/v1/. Supabase's default
-- privileges grant new tables in that schema to `anon` and `authenticated` —
-- the two roles anyone can reach with NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, a
-- value that ships inside the client bundle by design (Row Level Security,
-- not secrecy of that key, is what is supposed to protect the data).
--
-- Until this migration there was no RLS on any table, which made the auth in
-- proxy.ts and the ownership checks in every route handler bypassable: a
-- single GET /rest/v1/Lead?select=* with the published key returns every
-- captured lead's name, email and phone, and the same request against
-- "Message", "Contract" and "Payment" returns every client's conversation,
-- contract text and payment record. A DELETE or PATCH would have been
-- accepted just as readily.
--
-- Nothing in this app reads its data through PostgREST — Prisma connects as
-- the table owner over DATABASE_URL and every query is server-side, behind
-- checks that already exist — so the right posture is the closed one: RLS
-- enabled with no policies at all, and the grants revoked underneath it. Two
-- independent locks; either one alone would be enough.
--
-- The table owner is exempt from RLS unless FORCE ROW LEVEL SECURITY is set,
-- which is deliberately NOT set here: forcing it with zero policies would
-- lock the application out of its own database. That does mean DATABASE_URL
-- must point at the role that owns these tables (on Supabase, `postgres` —
-- the role Prisma migrations already run as). A deployment that runs the app
-- as some other non-owner role needs policies for that role before this
-- migration, or every query returns zero rows.
--
-- Adding a table later? It needs both halves. ALTER DEFAULT PRIVILEGES below
-- covers the grant half for anything this role creates from now on, but RLS
-- still has to be enabled per table — add it to the list here.

DO $$
DECLARE
  target text;
  browser_role text;
  browser_roles text[] := ARRAY['anon', 'authenticated'];
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'DiscoverySession',
    'Message',
    'Attachment',
    'ProjectSummary',
    'Lead',
    'NewsletterSubscriber',
    'Contract',
    'Payment',
    -- Prisma's own bookkeeping: it names every migration that has run, which
    -- is free reconnaissance on an otherwise closed schema.
    '_prisma_migrations'
  ]
  LOOP
    -- Skipped rather than failed: this migration must stay applicable to a
    -- database where an earlier migration has not created every table yet.
    CONTINUE WHEN to_regclass(format('public.%I', target)) IS NULL;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target);

    FOREACH browser_role IN ARRAY browser_roles
    LOOP
      -- Plain Postgres (local dev, CI) has neither role; Supabase has both.
      CONTINUE WHEN NOT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = browser_role
      );
      EXECUTE format(
        'REVOKE ALL PRIVILEGES ON TABLE public.%I FROM %I',
        target,
        browser_role
      );
    END LOOP;
  END LOOP;

  -- The durable half: without this, the next `prisma migrate deploy` that
  -- creates a table hands it straight back to anon and authenticated.
  FOREACH browser_role IN ARRAY browser_roles
  LOOP
    CONTINUE WHEN NOT EXISTS (
      SELECT 1 FROM pg_roles WHERE rolname = browser_role
    );
    EXECUTE format(
      'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I',
      browser_role
    );
    EXECUTE format(
      'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I',
      browser_role
    );
    EXECUTE format(
      'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I',
      browser_role
    );
  END LOOP;
END
$$;
