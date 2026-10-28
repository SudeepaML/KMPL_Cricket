/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Baddi Chitti (Loan Ledger) Screen (Player Portal View 3).
 * Features:
 * - Shows all 13 tournament months
 * - Past and current months unlock to show Paid Players list and Pending Players list
 * - Upcoming months show locked mode with live ticking countdown (Xd Yh Zm Ws) to the 15th
 * - Loan details modal with Web Share and WhatsApp fallback
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { Loan } from '../types';
import { LoanDetailsModal } from '../components/LoanDetailsModal';
import { LockedMonthModal } from '../components/LockedMonthModal';
import { RulesRegulationsModal } from '../components/RulesRegulationsModal';
import { UserGuideModal } from '../components/UserGuideModal';
import { formatINR, TOURNAMENT_MONTHS, isFutureMonth, getMonthDeadlineDate } from '../lib/database';
import { CircleDollarSign, CheckCircle2, Clock, Lock, ArrowLeft, Share2, Calendar, AlertTriangle, ScrollText, BookOpen } from 'lucide-react';

export const BaddiChittiPage: React.FC = () => {
  const { loans, players, loading } = useRealtimeData();
  const { t } = useLanguage();

  const [activeMonthView, setActiveMonthView] = useState<string | null>(null);
  const [lockedModalMonth, setLockedModalMonth] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Month detail calculations
  const monthDetailData = (() => {
    if (!activeMonthView) return null;

    // Loans lent in this month
    const monthLoans = loans.filter((l) => l.lending_month === activeMonthView);
    const paidList = monthLoans.filter((l) => l.status === 'PAID');
    const pendingList = monthLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');

    const totalPrincipal = monthLoans.reduce((sum, l) => sum + Number(l.principal), 0);
    const totalInterest = monthLoans.reduce((sum, l) => sum + Number(l.interest), 0);

    return {
      month: activeMonthView,
      monthLoans,
      paidList,
      pendingList,
      totalPrincipal,
      totalInterest,
    };
  })();

  const allActiveLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const grandInterest = loans.reduce((sum, l) => sum + Number(l.interest), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Detail View of an Unlocked Month's Baddi Chitti */}
      {activeMonthView && monthDetailData ? (
        <div>
          {/* Back button */}
          <button
            onClick={() => setActiveMonthView(null)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200 mb-4 p-2 -ml-2 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-800 min-h-[44px] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All 13 Months</span>
          </button>

          {/* Month Header Banner */}
          <div className="bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-950 rounded-3xl p-6 text-white shadow-md mb-6 border border-amber-800/80 dark:border-slate-800 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 dark:bg-amber-900/60 text-amber-200 uppercase tracking-wider mb-1 inline-block border border-amber-700/60">
                  Baddi Chitti Ledger
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {activeMonthView} Loans
                </h1>
                <p className="text-xs text-amber-100 dark:text-amber-200 mt-1">
                  10% interest tournament emergency loans disbursed during {activeMonthView}.
                </p>
              </div>

              <div className="bg-amber-950/60 dark:bg-black/40 backdrop-blur-md rounded-2xl p-3.5 border border-amber-400/30 text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-amber-200 block">
                  Total Disbursed
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-white block">
                  {formatINR(monthDetailData.totalPrincipal)}
                </span>
                <span className="text-[11px] text-amber-200 font-mono block mt-0.5">
                  10% Interest: +{formatINR(monthDetailData.totalInterest)}
                </span>
              </div>
            </div>
          </div>

          {/* Split Sections: Paid Loans & Pending Loans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paid Players List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Paid Players ({monthDetailData.paidList.length})
                  </h2>
                </div>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  Repayments Settled
                </span>
              </div>

              {monthDetailData.paidList.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center">
                  No loans repaid for this month yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {monthDetailData.paidList.map((loan, idx) => (
                    <button
                      key={loan.id}
                      onClick={() => setSelectedLoan(loan)}
                      className="w-full text-left p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/40 transition-colors flex items-center justify-between gap-2 group min-h-[56px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 w-5">
                          {idx + 1}.
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block group-hover:text-emerald-900 dark:group-hover:text-emerald-400">
                            {loan.player_name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            Principal: {formatINR(loan.principal)} + {formatINR(loan.interest)} (10%)
                            {loan.payment_method ? ` · ${loan.payment_method}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black font-mono text-emerald-800 dark:text-emerald-300 block">
                          {formatINR(loan.total_return)}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">PAID</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pending / Active Players List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pending Players ({monthDetailData.pendingList.length})
                  </h2>
                </div>
                <span className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                  Awaiting Repayment
                </span>
              </div>

              {monthDetailData.pendingList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                  {players.length === 0 ? t.noPlayersYet : 'No active loans for this month.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {monthDetailData.pendingList.map((loan, idx) => {
                    const isOverdue = loan.status === 'OVERDUE';
                    return (
                      <button
                        key={loan.id}
                        onClick={() => setSelectedLoan(loan)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-colors flex items-center justify-between gap-2 group min-h-[56px] ${
                          isOverdue
                            ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                            : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 w-5">
                            {idx + 1}.
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {loan.player_name}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isOverdue ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200' : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                              }`}>
                                {loan.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                              Due: {loan.due_date} (15th)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-black font-mono text-slate-900 dark:text-white block">
                              {formatINR(loan.total_return)}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                              +{formatINR(loan.interest)}
                            </span>
                          </div>
                          <Share2 className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 13 Months Grid for Baddi Chitti */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {t.baddiChitti}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 font-mono">
                  10% Interest
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select a month to inspect Paid Players (settled loans) and Pending Players. Upcoming months are locked with live countdowns.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsRulesOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors shadow-2xs min-h-[38px]"
              >
                <ScrollText className="w-3.5 h-3.5 text-teal-700" />
                <span>{t.rulesAndRegulations}</span>
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs min-h-[38px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.userGuide}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Active / Overdue
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 block">
                {allActiveLoans.length} Loans
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total 10% Interest
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-600 mt-1 block">
                +{formatINR(grandInterest)}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Repayment Rule
              </span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">
                Due 15th next month
              </span>
            </div>
          </div>

          {/* 13 Month Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOURNAMENT_MONTHS.map((monthName, idx) => {
              const isFuture = isFutureMonth(monthName);
              const monthLoans = loans.filter((l) => l.lending_month === monthName);
              const paidCount = monthLoans.filter((l) => l.status === 'PAID').length;
              const pendingCount = monthLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE').length;
              const totalPrincipal = monthLoans.reduce((sum, l) => sum + Number(l.principal), 0);

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
                      ? 'bg-slate-900 text-white border-slate-800 hover:border-slate-700'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-amber-500 hover:bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-600 block">
                        Cycle {idx + 1} of 13
                      </span>
                      <h3 className={`text-lg font-bold tracking-tight mt-0.5 ${
                        isFuture ? 'text-white' : 'text-slate-900'
                      }`}>
                        {monthName}
                      </h3>
                    </div>

                    {isFuture ? (
                      <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                        <Lock className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 shrink-0">
                        {monthLoans.length} Loans
                      </span>
                    )}
                  </div>

                  <div className="mt-4 w-full">
                    {isFuture ? (
                      <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/60">
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
                          <span className="text-slate-500 font-medium">Disbursed:</span>
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {formatINR(totalPrincipal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                          <span>{paidCount} Paid · {pendingCount} Pending</span>
                          <span className="text-amber-700 font-semibold group-hover:underline">
                            View Details →
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

      {/* Loan Details Modal */}
      <LoanDetailsModal
        loan={selectedLoan}
        onClose={() => setSelectedLoan(null)}
      />

      {/* Locked Month Modal */}
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
