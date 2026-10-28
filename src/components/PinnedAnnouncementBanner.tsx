/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PinnedAnnouncementBanner Component.
 * Displays the latest pinned announcement across the player dashboard home.
 * Tapping or clicking the banner navigates immediately to the Announcements tab.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { Pin, ArrowRight, ShieldCheck } from 'lucide-react';

export const PinnedAnnouncementBanner: React.FC = () => {
  const { latestPinnedAnnouncement } = useRealtimeData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!latestPinnedAnnouncement) {
    return null;
  }

  // Format date and time for the banner
  const formattedDate = new Date(latestPinnedAnnouncement.created_at).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => navigate('/announcements')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate('/announcements');
        }
      }}
      className="group mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 dark:from-amber-400/15 dark:via-emerald-400/10 dark:to-teal-400/15 border border-amber-300/40 dark:border-amber-400/30 hover:border-amber-400 dark:hover:border-amber-300 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 group-hover:rotate-12 transition-transform">
            <Pin className="w-4 h-4 fill-amber-500 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 dark:bg-amber-400 dark:text-slate-950">
                {t.pinnedNotice}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold truncate max-w-[150px]">{latestPinnedAnnouncement.posted_by}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
              {latestPinnedAnnouncement.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
              {latestPinnedAnnouncement.body}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 shrink-0 self-center group-hover:translate-x-0.5 transition-transform">
          <span className="hidden sm:inline">{t.viewAllAnnouncements}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
