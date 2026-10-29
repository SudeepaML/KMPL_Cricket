import { supabase, isSupabaseConfigured } from './supabase';

export type ActivityActorType = 'admin' | 'player_profile' | 'guest';
export type ActivityEventType = 'page_view' | 'heartbeat' | 'chat_message';

export interface ActivityActor {
  type: ActivityActorType;
  id?: string | null;
  name?: string | null;
}

let cachedSessionId: string | null = null;

/**
 * Session-scoped pseudonymous identifier. It is not a real-world identity
 * and is cleared when the browser tab/session storage is cleared.
 */
export const getActivitySessionId = (): string => {
  if (cachedSessionId) return cachedSessionId;

  if (typeof window === 'undefined') {
    cachedSessionId = `server-${Math.random().toString(36).slice(2)}`;
    return cachedSessionId;
  }

  try {
    const existing = window.sessionStorage.getItem('kmpl_activity_session_id');
    if (existing && existing.length >= 8) {
      cachedSessionId = existing;
      return existing;
    }
    const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `kmpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem('kmpl_activity_session_id', generated);
    cachedSessionId = generated;
    return generated;
  } catch {
    cachedSessionId = `kmpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    return cachedSessionId;
  }
};

/**
 * Best-effort telemetry only. It intentionally stores no IP address,
 * message body, password, or other sensitive input.
 */
export const recordActivity = async (args: {
  eventType: ActivityEventType;
  path: string;
  actor: ActivityActor;
  details?: Record<string, string | number | boolean | null>;
}): Promise<void> => {
  if (!isSupabaseConfigured) return;

  try {
    const path = args.path.split('?')[0].slice(0, 300) || '/';
    const actorName = (args.actor.name || 'Guest').trim().slice(0, 120) || 'Guest';
    const { error } = await supabase.from('activity_events').insert({
      session_id: getActivitySessionId(),
      event_type: args.eventType,
      path,
      actor_type: args.actor.type,
      actor_id: args.actor.id || null,
      actor_name: actorName,
      details: args.details || {},
    });
    if (error) {
      // The SQL migration must be applied before tracking can be saved.
      console.warn('[KMPL activity tracking] Event not saved:', error.message);
    }
  } catch (error) {
    console.warn('[KMPL activity tracking] Event not saved:', error);
  }
};
