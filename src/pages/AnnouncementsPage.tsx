/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Announcements Page for KMPL Cricket.
 * 
 * Requirements implemented:
 * 1. Players: Read-only list of announcements from Supabase table `announcements`.
 * 2. Pinned announcements sorted first, then newest first. Pin icon on pinned ones, plus admin name, date & time.
 * 3. Admins: "New announcement" form with title (max 100 chars) and body (max 1000 chars), validation, character counters, success toast.
 * 4. Admins can pin/unpin and delete any announcement with a confirmation dialog.
 * 5. Players do NOT see the form or edit controls; shown strictly when logged in as admin via Supabase Auth (`isAdmin`).
 * 6. Supabase Realtime INSERT, UPDATE, and DELETE subscription: channel created once, all handlers attached before .subscribe(), supabase.removeChannel called on cleanup.
 * 7. Bilingual Kannada & English support.
 * 8. Empty state: "No announcements yet."
 * 9. Clear code comments for every component and function.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../lib/database';
import { Announcement } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Megaphone,
  Pin,
  PinOff,
  Trash2,
  PlusCircle,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { isAdmin, adminDisplayName, currentAdmin } = useAuth();
  const { t } = useLanguage();

  // Component state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Deletion modal confirmation state
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  /**
   * Fetch announcements sorted by pinned first, then newest first.
   */
  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await db.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Realtime Subscription Setup.
   * Requirement 6:
   * 1. Create channel once.
   * 2. Add all handlers (INSERT, UPDATE, DELETE) before subscribe().
   * 3. Call supabase.removeChannel on unmount cleanup.
   */
  useEffect(() => {
    fetchAnnouncements();

    if (isSupabaseConfigured) {
      const channelName = `kmpl_announcements_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'announcements' },
          (payload) => {
            const newRecord = payload.new as Announcement;
            setAnnouncements((prev) => {
              const updated = [newRecord, ...prev.filter((a) => a.id !== newRecord.id)];
              return updated.sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              });
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'announcements' },
          (payload) => {
            const updatedRecord = payload.new as Announcement;
            setAnnouncements((prev) => {
              const updated = prev.map((a) => (a.id === updatedRecord.id ? updatedRecord : a));
              return updated.sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              });
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'announcements' },
          (payload) => {
            const oldRecord = payload.old as { id: string };
            setAnnouncements((prev) => prev.filter((a) => a.id !== oldRecord.id));
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.warn(`[Supabase Realtime] Announcements subscription error:`, err);
          }
        });

      // Cleanup: remove the channel
      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (cleanupErr) {
          console.warn(`[Supabase Realtime] Error removing channel ${channelName}:`, cleanupErr);
        }
      };
    } else {
      // Local fallback subscription
      const unsubscribe = db.subscribeToChanges(() => {
        fetchAnnouncements();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [fetchAnnouncements]);

  /**
   * Handle Admin Announcement Submission.
   * Validates title (max 100), body (max 1000), trims inputs, and shows success toast.
   */
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (!cleanTitle) {
      setFormError('Please enter an announcement title.');
      return;
    }
    if (cleanTitle.length > 100) {
      setFormError('Title must be 100 characters or less.');
      return;
    }
    if (!cleanBody) {
      setFormError('Please enter announcement details.');
      return;
    }
    if (cleanBody.length > 1000) {
      setFormError('Announcement details must be 1000 characters or less.');
      return;
    }

    const posterName = currentAdmin?.name || adminDisplayName || 'KMPL Admin';

    setSubmitting(true);
    try {
      await db.createAnnouncement({
        title: cleanTitle,
        body: cleanBody,
        posted_by: posterName,
        is_pinned: isPinned,
      });

      // Reset form
      setTitle('');
      setBody('');
      setIsPinned(false);
      setSuccessToast(t.announcementPostedSuccess);

      // Auto-dismiss success toast after 4 seconds
      setTimeout(() => {
        setSuccessToast(null);
      }, 4000);

      // Refresh list
      await fetchAnnouncements();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle Pin / Unpin Toggle (Admins only).
   */
  const handleTogglePin = async (announcement: Announcement) => {
    if (!isAdmin) return;
    try {
      await db.togglePinAnnouncement(announcement.id, !announcement.is_pinned);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  /**
   * Execute Announcement Deletion after confirmation.
   */
  const handleConfirmDelete = async () => {
    if (!announcementToDelete || !isAdmin) return;
    setIsDeleting(true);
    try {
      await db.deleteAnnouncement(announcementToDelete.id);
      setAnnouncementToDelete(null);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Helper to format date and time in localized Indian format.
   */
  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-5 sm:p-6 text-white shadow-lg mb-6 border border-emerald-800/80 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <Megaphone className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950">
                Official Bulletins
              </span>
              <span className="text-xs text-emerald-300/80 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Live Realtime Sync
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.announcements}
            </h1>
            <p className="text-xs text-emerald-200/90 dark:text-emerald-300/90 mt-0.5">
              {t.announcementsSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-sm shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ADMIN ONLY: New Announcement Creation Card */}
      {isAdmin && (
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.newAnnouncement}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized tournament officers can publish ground notices and tournament updates.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.announcementTitle} *
                </label>
                <span className={`text-[11px] font-mono ${title.length > 90 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                  {title.length}/100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Body Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.announcementBody} *
                </label>
                <span className={`text-[11px] font-mono ${body.length > 900 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                  {body.length}/1000
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={1000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t.bodyPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-y"
              />
            </div>

            {/* Pin Checkbox & Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.pinAnnouncement}</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !title.trim() || !body.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm transition-all"
              >
                <Megaphone className="w-4 h-4" />
                <span>{submitting ? 'Publishing...' : t.postAnnouncement}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            All Bulletins ({announcements.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Pinned notices appear first
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          /* Empty State Requirement 9: "No announcements yet." */
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t.noAnnouncementsYet}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {isAdmin
                ? 'Use the form above to post the first official announcement for KMPL Season 01.'
                : 'Check back soon for tournament schedules, ground notifications, and match bulletins.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const isPinnedItem = ann.is_pinned;

              return (
                <article
                  key={ann.id}
                  className={`p-5 sm:p-6 rounded-3xl transition-all border ${
                    isPinnedItem
                      ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-400/10 dark:via-slate-900 dark:to-slate-900 border-amber-300/60 dark:border-amber-400/40 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isPinnedItem && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 dark:bg-amber-400 dark:text-slate-950 shadow-2xs">
                          <Pin className="w-3 h-3 fill-slate-950" />
                          <span>{t.pinnedNotice}</span>
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {ann.posted_by}
                        </span>
                      </span>

                      <span className="text-slate-400 dark:text-slate-600">•</span>

                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimestamp(ann.created_at)}</span>
                      </span>
                    </div>

                    {/* ADMIN ONLY Edit Controls: Pin/Unpin & Delete */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleTogglePin(ann)}
                          title={isPinnedItem ? t.unpinAnnouncement : t.pinAnnouncement}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isPinnedItem
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isPinnedItem ? (
                            <PinOff className="w-3.5 h-3.5" />
                          ) : (
                            <Pin className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => setAnnouncementToDelete(ann)}
                          title={t.deleteAnnouncement}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                    {ann.title}
                  </h3>

                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {ann.body}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ADMIN ONLY: Delete Confirmation Modal Dialog */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.deleteAnnouncement}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Officer Security Confirmation
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              {t.deleteAnnouncementConfirm}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-6 truncate">
              &quot;{announcementToDelete.title}&quot;
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAnnouncementToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-bold text-white shadow-sm transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : t.deleteAnnouncement}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
