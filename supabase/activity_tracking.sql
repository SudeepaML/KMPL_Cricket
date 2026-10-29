-- KMPL Cricket: website activity and chat sender audit
-- Run in Supabase SQL Editor. Guest sessions are pseudonymous; no IP address is collected.

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS sender_type text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS sender_id text,
  ADD COLUMN IF NOT EXISTS session_id text;

ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;
ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_sender_type_check
  CHECK (sender_type IN ('admin', 'player_profile', 'guest', 'unknown'));

CREATE TABLE IF NOT EXISTS public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'heartbeat', 'chat_message')),
  path text NOT NULL DEFAULT '/',
  actor_type text NOT NULL DEFAULT 'guest' CHECK (actor_type IN ('admin', 'player_profile', 'guest')),
  actor_id text,
  actor_name text NOT NULL DEFAULT 'Guest',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_events_created_at_idx
  ON public.activity_events (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_events_session_created_idx
  ON public.activity_events (session_id, created_at DESC);

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activity events can be submitted by site visitors" ON public.activity_events;
CREATE POLICY "Activity events can be submitted by site visitors"
  ON public.activity_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(session_id) BETWEEN 8 AND 100
    AND length(path) <= 300
    AND length(actor_name) <= 120
    AND event_type IN ('page_view', 'heartbeat', 'chat_message')
    AND actor_type IN ('admin', 'player_profile', 'guest')
  );

DROP POLICY IF EXISTS "Only registered admins can view activity events" ON public.activity_events;
CREATE POLICY "Only registered admins can view activity events"
  ON public.activity_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.admins a
      WHERE lower(trim(a.email)) = lower(trim(auth.jwt() ->> 'email'))
    )
  );

REVOKE ALL ON TABLE public.activity_events FROM PUBLIC;
REVOKE ALL ON TABLE public.activity_events FROM anon, authenticated;
GRANT INSERT ON TABLE public.activity_events TO anon, authenticated;
GRANT SELECT ON TABLE public.activity_events TO authenticated;

-- Activity history is append-only for browser clients: no UPDATE or DELETE grants/policies.
