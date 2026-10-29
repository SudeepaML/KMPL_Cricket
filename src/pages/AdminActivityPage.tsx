import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, MessageSquare, Users, RefreshCw, ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type ActivityEvent = {
  id: string;
  session_id: string;
  event_type: 'page_view' | 'heartbeat' | 'chat_message';
  path: string;
  actor_type: 'admin' | 'player_profile' | 'guest';
  actor_id: string | null;
  actor_name: string;
  details: Record<string, unknown>;
  created_at: string;
};

type ChatRow = {
  id: string;
  sender_name: string;
  sender_kmpl_id: string;
  sender_type?: 'admin' | 'player_profile' | 'guest' | 'unknown';
  sender_id?: string | null;
  session_id?: string | null;
  message: string;
  created_at: string;
};

const timeLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const since = (minutes: number) => Date.now() - minutes * 60_000;

export const AdminActivityPage: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Activity tracking needs the live database.');
      setLoading(false);
      return;
    }

    try {
      const [activityResult, chatResult] = await Promise.all([
        supabase.from('activity_events').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('chat_messages')
          .select('id, sender_name, sender_kmpl_id, sender_type, sender_id, session_id, message, created_at')
          .order('created_at', { ascending: false }).limit(100),
      ]);

      if (activityResult.error) {
        setError(activityResult.error.message.includes('activity_events')
          ? 'Activity table is not ready. Run supabase/activity_tracking.sql in the Supabase SQL Editor first.'
          : activityResult.error.message);
        setEvents([]);
      } else {
        setEvents((activityResult.data || []) as ActivityEvent[]);
      }

      if (chatResult.error) {
        console.warn('[KMPL activity] Could not load chat history:', chatResult.error.message);
        setMessages([]);
      } else {
        setMessages((chatResult.data || []) as ChatRow[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load activity data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const recentEvents = events.filter((event) => new Date(event.created_at).getTime() >= since(24 * 60));
  const activeSessions = new Map<string, ActivityEvent>();
  events.forEach((event) => {
    const ts = new Date(event.created_at).getTime();
    if (ts >= since(3)) {
      const old = activeSessions.get(event.session_id);
      if (!old || new Date(old.created_at).getTime() < ts) activeSessions.set(event.session_id, event);
    }
  });
  const visitorSessions24h = new Set(recentEvents.map((event) => event.session_id)).size;
  const guestMessages = messages.filter((message) => (message.sender_type || 'guest') === 'guest').length;

  const identityLabel = (type?: string) => {
    if (type === 'admin') return 'Admin account';
    if (type === 'player_profile') return 'Player profile · not verified';
    if (type === 'unknown') return 'Legacy message · identity unknown';
    return 'Guest / anonymous';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Portal
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Website Activity & Chat Audit</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Pseudonymous browser sessions, page visits, and recent chat messages.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-sm font-bold disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 flex gap-2 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" /><span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500"><Users className="w-4 h-4" /> Browser sessions · 24 hours</div>
          <div className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{visitorSessions24h}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500"><Activity className="w-4 h-4" /> Active in last 3 minutes</div>
          <div className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{activeSessions.size}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500"><MessageSquare className="w-4 h-4" /> Guest messages · last 100</div>
          <div className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{guestMessages}</div>
        </div>
      </div>

      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">Recent website activity</h2>
          <p className="text-xs text-slate-500 mt-1">A session is considered active when it sends an event within 3 minutes. Data begins after the SQL migration is applied.</p>
        </div>
        {loading ? <p className="p-6 text-sm text-slate-500">Loading activity…</p> : events.length === 0 ? <p className="p-6 text-sm text-slate-500">No activity recorded yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                <tr><th className="p-3">Time</th><th className="p-3">Visitor label</th><th className="p-3">Event</th><th className="p-3">Page</th><th className="p-3">Session</th></tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3 whitespace-nowrap text-slate-500"><Clock className="w-3 h-3 inline mr-1" />{timeLabel(event.created_at)}</td>
                    <td className="p-3"><div className="font-semibold text-slate-900 dark:text-white">{event.actor_name}</div><div className="text-slate-500">{identityLabel(event.actor_type)}</div></td>
                    <td className="p-3">{event.event_type.replace('_', ' ')}</td>
                    <td className="p-3 font-mono">{event.path}</td>
                    <td className="p-3 font-mono text-slate-500">{event.session_id.slice(0, 12)}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">Recent community chat messages</h2>
          <p className="text-xs text-slate-500 mt-1">Guest and selected player profiles are shown distinctly; selected player profiles are not proof of identity.</p>
        </div>
        {messages.length === 0 ? <p className="p-6 text-sm text-slate-500">No chat messages found, or chat history could not be read.</p> : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {messages.map((message) => (
              <div key={message.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{message.sender_name || 'Guest'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{identityLabel(message.sender_type)}</span>
                    <span className="text-[10px] text-slate-500">{message.sender_kmpl_id}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words mt-1 text-slate-700 dark:text-slate-300">{message.message}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{timeLabel(message.created_at)}{message.session_id ? ` · Session ${message.session_id.slice(0, 12)}…` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-[11px] text-slate-500">Privacy note: guest sessions use a random tab-session identifier. This does not reveal a visitor's legal identity, device owner, or IP address. Player profile selection is not identity verification.</p>
    </div>
  );
};
