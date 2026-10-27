/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Monthly Fund Screen (Player Portal View 2).
 * Features:
 * - 13 colorful month cards (April 2026 to April 2027)
 * - Future months locked with live ticking countdown (Xd Yh Zm Ws) to the 15th
 * - Tapping locked month opens LockedMonthModal
 * - Unlocked months show Paid Players (ordered by paid_at ascending) and Pending Players
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { TOURNAMENT_MONTHS, isFutureMonth, getMonthDeadlineDate, formatINR } from '../lib/database';
import { LockedMonthModal } from '../components/LockedMonthModal';
import { RulesRegulationsModal } from '../components/RulesRegulationsModal';
import { UserGuideModal } from '../components/UserGuideModal';
import { Player, MonthlyPayment } from '../types';
import { Lock, CheckCircle2, Clock, Calendar, ChevronRight, ArrowLeft, ScrollText, BookOpen } from 'lucide-react';

// Color themes for the 13 month cards
const MONTH_CARD_STYLES = [
  { bg: 'from-emerald-700 to-teal-800', border: 'border-emerald-600', badge: 'bg-emerald-100 text-emerald-900' },
  { bg: 'from-amber-600 to-yellow-700', border: 'border-amber-500', badge: 'bg-amber-100 text-amber-900' },
  { bg: 'from-blue-700 to-indigo-800', border: 'border-blue-600', badge: 'bg-blue-100 text-blue-900' },
  { bg: 'from-purple-700 to-pink-800', border: 'border-purple-600', badge: 'bg-purple-100 text-purple-900' },
  { bg: 'from-teal-700 to-emerald-800', border: 'border-teal-600', badge: 'bg-teal-100 text-teal-900' },
  { bg: 'from-orange-600 to-red-700', border: 'border-orange-500', badge: 'bg-orange-100 text-orange-900' },
  { bg: 'from-cyan-700 to-blue-800', border: 'border-cyan-600', badge: 'bg-cyan-100 text-cyan-900' },
  { bg: 'from-rose-700 to-pink-800', border: 'border-rose-600', badge: 'bg-rose-100 text-rose-900' },
  { bg: 'from-indigo-700 to-violet-800', border: 'border-indigo-600', badge: 'bg-indigo-100 text-indigo-900' },
  { bg: 'from-lime-700 to-emerald-800', border: 'border-lime-600', badge: 'bg-lime-100 text-lime-900' },
  { bg: 'from-amber-700 to-orange-800', border: 'border-amber-600', badge: 'bg-amber-100 text-amber-900' },
  { bg: 'from-emerald-800 to-teal-900', border: 'border-emerald-700', badge: 'bg-emerald-100 text-emerald-900' },
  { bg: 'from-fuchsia-700 to-purple-800', border: 'border-fuchsia-600', badge: 'bg-fuchsia-100 text-fuchsia-900' },
];

export const MonthlyFundPage: React.FC = () => {
  const { players, payments, closedMonths, loading, isPlayerAdmin } = useRealtimeData();
  const { t } = useLanguage();

  const [activeMonthView, setActiveMonthView] = useState<string | null>(null);
  const [lockedModalMonth, setLockedModalMonth] = useState<string | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Ticking countdown timer interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute countdown string (Xd Yh Zm Ws) for a locked month
  const getCountdownString = (month: string) => {
    const deadline = getMonthDeadlineDate(month).getTime();
    const diff = deadline - currentTime;
    if (diff <= 0) return 'Unlocked';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  // Build player maps
  const playerMap = new Map<string, Player>();
  players.forEach((p) => playerMap.set(p.id, p));

  // If a month detail is selected, calculate paid & pending lists
  const monthDetailData = (() => {
    if (!activeMonthView) return null;

    const monthPayments = payments.filter((p) => p.month === activeMonthView);
    const paidPayments = monthPayments.filter((p) => p.status === 'PAID');
    const isClosed = closedMonths.some((c) => c.month === activeMonthView);

    // Paid players ordered by paid_at ascending
    const paidList: { player: Player; payment: MonthlyPayment }[] = [];
    paidPayments
      .sort((a, b) => {
        const tA = a.paid_at ? new Date(a.paid_at).getTime() : 0;
        const tB = b.paid_at ? new Date(b.paid_at).getTime() : 0;
        return tA - tB;
      })
      .forEach((pay) => {
        const p = playerMap.get(pay.player_id);
        if (p) paidList.push({ player: p, payment: pay });
      });

    // Pending players (those who haven't paid or have PENDING record)
    const paidPlayerIds = new Set(paidPayments.map((p) => p.player_id));
    const pendingList: Player[] = players.filter((p) => !paidPlayerIds.has(p.id));

    const totalCollected = paidList.reduce((sum, item) => sum + item.player.monthly_amount, 0);

    return {
      month: activeMonthView,
      isClosed,
      paidList,
      pendingList,
      totalCollected,
    };
  })();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Detail View of an Unlocked Month */}
      {activeMonthView && monthDetailData ? (
        <div>
          {/* Back button */}
          <button
            onClick={() => setActiveMonthView(null)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 mb-4 p-2 -ml-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 min-h-[44px] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All 13 Months</span>
          </button>

          {/* Month Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-6 text-white shadow-md mb-6 border border-emerald-800/80 dark:border-slate-800 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {activeMonthView}
                  </h1>
                  {monthDetailData.isClosed && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-emerald-950 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>{t.closedMonth}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-200 dark:text-emerald-300 mt-1">
                  Collection status for tournament members. Deadline: 15th.
                </p>
              </div>

              <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 dark:border-white/5">
                <span className="block text-[11px] uppercase tracking-wider text-emerald-200 dark:text-emerald-300 font-semibold">
                  Total Collected
                </span>
                <span className="text-2xl font-black font-mono text-amber-300">
                  {formatINR(monthDetailData.totalCollected)}
                </span>
                <span className="text-[10px] text-emerald-200 dark:text-emerald-300 block mt-0.5">
                  {monthDetailData.paidList.length} of {players.length} members paid
                </span>
              </div>
            </div>
          </div>

          {/* Split Sections: Paid Players & Pending Players */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paid Players List (Ordered by paid_at ascending) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Paid Players ({monthDetailData.paidList.length})
                  </h2>
                </div>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  Ordered by paid time
                </span>
              </div>

              {monthDetailData.paidList.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center">
                  No payments recorded for this month yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {monthDetailData.paidList.map(({ player, payment }, idx) => {
                    const isAdmin = isPlayerAdmin(player);
                    return (
                      <div
                        key={player.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 w-5">
                            {idx + 1}.
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
                              {isAdmin && '👑 '}
                              {player.name}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              {payment.payment_method || 'Cash'} · {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'Paid'}
                              {payment.upi_reference ? ` · Ref: ${payment.upi_reference}` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 shrink-0">
                          {formatINR(player.monthly_amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Players List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pending Players ({monthDetailData.pendingList.length})
                  </h2>
                </div>
                <span className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                  Awaiting payment
                </span>
              </div>

              {monthDetailData.pendingList.length === 0 ? (
                <div className="py-8 text-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  🎉 All players have contributed for this month!
                </div>
              ) : (
                <div className="space-y-2">
                  {monthDetailData.pendingList.map((player, idx) => {
                    const isAdmin = isPlayerAdmin(player);
                    return (
                      <div
                        key={player.id}
                        className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/40 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 w-5">
                            {idx + 1}.
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
                              {isAdmin && '👑 '}
                              {player.name}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              {player.kmpl_id} · {player.phone}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-amber-800 dark:text-amber-300 shrink-0">
                          Due: {formatINR(player.monthly_amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 13 Colorful Month Cards Grid */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.monthlyFund}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                13 official tournament cycles (April 2026 to April 2027). Ticking live countdown to each 15th deadline.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsRulesOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-2xs min-h-[38px]"
              >
                <ScrollText className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>{t.rulesAndRegulations}</span>
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs min-h-[38px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{t.userGuide}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOURNAMENT_MONTHS.map((monthName, idx) => {
              const isFuture = isFutureMonth(monthName);
              const isClosed = closedMonths.some((c) => c.month === monthName);

              // Calculate month stats
              const monthPayments = payments.filter((p) => p.month === monthName);
              const paidCount = monthPayments.filter((p) => p.status === 'PAID').length;
              const collected = monthPayments
                .filter((p) => p.status === 'PAID')
                .reduce((sum, pay) => {
                  const p = playerMap.get(pay.player_id);
                  return sum + (p ? p.monthly_amount : 200);
                }, 0);

              return (
                <button
                  key={monthName}
                  onClick={() => {
                    if (isFuture) {
                      setLockedModalMonth(monthName);
                    } else {
                      setActiveMonthView(monthName);
                    }
                  }}
                  className={`relative text-left p-5 rounded-3xl border transition-all duration-150 flex flex-col justify-between overflow-hidden group shadow-2xs hover:shadow-md min-h-[160px] ${
                    isFuture
                      ? 'bg-slate-900 dark:bg-slate-950 text-white border-slate-800 dark:border-slate-800/90 hover:border-slate-700'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/20 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 block">
                        Cycle {idx + 1} of 13
                      </span>
                      <h3 className={`text-lg font-bold tracking-tight mt-0.5 ${
                        isFuture ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}>
                        {monthName}
                      </h3>
                    </div>

                    {isFuture ? (
                      <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                        <Lock className="w-4 h-4" />
                      </span>
                    ) : isClosed ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 shrink-0">
                        Closed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 shrink-0">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Body: Live Countdown or Collection Stats */}
                  <div className="mt-4 w-full">
                    {isFuture ? (
                      <div className="p-2.5 rounded-xl bg-slate-800/90 dark:bg-slate-900 border border-slate-700/60 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-1">
                          <Clock className="w-3 h-3" />
                          <span>15th Deadline Countdown</span>
                        </div>
                        <div className="text-sm sm:text-base font-black font-mono text-emerald-400 tabular-nums">
                          {getCountdownString(monthName)}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Collected:</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                            {formatINR(collected)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          <span>{paidCount} of {players.length} Paid</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold group-hover:underline flex items-center">
                            View Roster <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Month Dialog */}
      <LockedMonthModal
        month={lockedModalMonth}
        onClose={() => setLockedModalMonth(null)}
      />

      {/* Rules & Regulations Modal */}
      <RulesRegulationsModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
