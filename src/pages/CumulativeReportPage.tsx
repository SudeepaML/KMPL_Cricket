/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cumulative Report Screen (Player Portal View 4).
 * Features:
 * - Clear separation of Total Monthly Fund and Total Baddi Chitti Interest
 * - Verified Grand Total logic: Grand Total = All Months Fund + All Months Loan Interest
 *   (Principal is disbursed from monthly fund, so only interest is additive profit)
 * - Rich graphical analysis of month-by-month data with bar graphs and collection rate KPIs
 */

import React, { useState } from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { formatINR, TOURNAMENT_MONTHS } from '../lib/database';
import { Sparkles, Calendar, CircleDollarSign, BarChart3, TrendingUp, Info } from 'lucide-react';

export const CumulativeReportPage: React.FC = () => {
  const { players, payments, loans, stats } = useRealtimeData();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'graph' | 'monthly' | 'baddi'>('graph');
  const [selectedChartMonth, setSelectedChartMonth] = useState<string | null>(null);

  const playerMap = new Map();
  players.forEach((p) => playerMap.set(p.id, p));

  // Compute stats for all 13 months
  const monthlyData = TOURNAMENT_MONTHS.map((month) => {
    const monthPayments = payments.filter((p) => p.month === month && p.status === 'PAID');
    const totalCollected = monthPayments.reduce((sum, pay) => {
      const p = playerMap.get(pay.player_id);
      return sum + (p ? p.monthly_amount : 200);
    }, 0);

    // Interest from loans lent in this month
    const monthLoans = loans.filter((l) => l.lending_month === month);
    const monthInterest = monthLoans.reduce((sum, l) => sum + Number(l.interest), 0);
    const monthPrincipalLent = monthLoans.reduce((sum, l) => sum + Number(l.principal), 0);

    const paidRate = players.length > 0 ? Math.round((monthPayments.length / players.length) * 100) : 0;

    return {
      month,
      shortMonth: month.split(' ')[0].substring(0, 3) + ' ' + month.split(' ')[1].slice(-2),
      paidCount: monthPayments.length,
      totalCollected,
      monthInterest,
      monthPrincipalLent,
      paidRate,
    };
  });

  const maxCollected = Math.max(...monthlyData.map((m) => m.totalCollected), 3000);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.cumulativeReport}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Audited treasury ledger combining monthly contributions, Baddi Chitti net interest, and monthly graphical analytics.
        </p>
      </div>

      {/* Logic Clarification Note */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs mb-6 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Treasury Accounting Rule:</strong> Principal loan amounts are disbursed directly from the monthly collected fund. Therefore, only the <strong>10% Baddi Chitti interest earned</strong> is added as profit to calculate the <strong>Tournament Grand Total</strong>.
        </p>
      </div>

      {/* Two Prominent Standalone Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Card 1: Total Monthly Fund */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Total Monthly Fund Collected</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 block">
            {formatINR(stats.totalMonthlyContributions)}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Sum of all verified player contributions across all months.
          </p>
        </div>

        {/* Card 2: Total Baddi Chitti Interest Only */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <CircleDollarSign className="w-4 h-4 text-amber-600" />
            <span>Total Baddi Chitti Interest Earned</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black font-mono text-amber-600 block">
            + {formatINR(stats.totalBaddiChittiInterest)}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            10% net interest earnings on emergency & tournament loans.
          </p>
        </div>
      </div>

      {/* Animated Pulsing Grand Total Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden mb-8 bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 border border-emerald-700/50">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-amber-400/20 to-teal-500/20 rounded-3xl blur-xl animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.grandTotal}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {formatINR(stats.grandTotal)}
            </h2>
            <p className="text-xs text-emerald-200 mt-1 font-medium font-mono">
              = {formatINR(stats.totalMonthlyContributions)} (Fund) + {formatINR(stats.totalBaddiChittiInterest)} (Interest)
            </p>
          </div>

          <div className="bg-emerald-950/70 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/50 shrink-0 text-left sm:text-right">
            <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">
              Active Loan Principal Out
            </span>
            <span className="text-xl font-bold font-mono text-white block">
              {formatINR(stats.totalActiveLoansPrincipal)}
            </span>
            <span className="text-[10px] text-emerald-300 mt-0.5 block">
              Disbursed from treasury
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Breakdowns & Graphical Analysis */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
            activeTab === 'graph'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-700" />
          <span>Graphical Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
            activeTab === 'monthly'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span>Monthly Fund Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('baddi')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
            activeTab === 'baddi'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CircleDollarSign className="w-4 h-4 text-amber-600" />
          <span>Baddi Interest Ledger</span>
        </button>
      </div>

      {/* Tab 1: Graphical Analysis View */}
      {activeTab === 'graph' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Month-by-Month Financial Trend</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visual comparison of Fund Collections (green) vs Baddi Chitti Interest Earned (gold).
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                <span>Monthly Fund</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                <span>Baddi Interest</span>
              </span>
            </div>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div className="pt-4 pb-2">
            <div className="h-48 flex items-end gap-2 sm:gap-3 overflow-x-auto pb-4 no-scrollbar">
              {monthlyData.map((d) => {
                const fundHeight = maxCollected > 0 ? (d.totalCollected / maxCollected) * 100 : 0;
                const interestHeight = maxCollected > 0 ? (d.monthInterest / maxCollected) * 100 : 0;
                const isSelected = selectedChartMonth === d.month;

                return (
                  <button
                    key={d.month}
                    onClick={() => setSelectedChartMonth(isSelected ? null : d.month)}
                    className={`flex flex-col items-center flex-1 min-w-[38px] group focus:outline-none transition-all ${
                      isSelected ? 'scale-105' : ''
                    }`}
                  >
                    {/* Bars Container */}
                    <div className="w-full flex items-end justify-center gap-1 h-36 relative">
                      {/* Fund Bar */}
                      <div
                        style={{ height: `${Math.max(fundHeight, 4)}%` }}
                        className={`w-3.5 sm:w-5 rounded-t-md transition-all duration-300 ${
                          d.totalCollected > 0
                            ? 'bg-emerald-600 group-hover:bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />

                      {/* Interest Bar */}
                      <div
                        style={{ height: `${Math.max(interestHeight, 2)}%` }}
                        className={`w-2.5 sm:w-3.5 rounded-t-md transition-all duration-300 ${
                          d.monthInterest > 0
                            ? 'bg-amber-400 group-hover:bg-amber-300'
                            : 'bg-slate-200'
                        }`}
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-[10px] font-mono text-slate-500 mt-2 whitespace-nowrap block">
                      {d.shortMonth}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Month Detail Callout */}
          {selectedChartMonth && (
            (() => {
              const selectedData = monthlyData.find((m) => m.month === selectedChartMonth);
              if (!selectedData) return null;
              return (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-emerald-200/60">
                    <span className="text-sm">{selectedData.month} Analytics</span>
                    <span className="text-emerald-700 font-mono">{selectedData.paidRate}% Collection Rate</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-1 font-mono text-center">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-sans block">Fund Collected</span>
                      <span className="font-bold text-emerald-900 text-sm">{formatINR(selectedData.totalCollected)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-sans block">Interest Earned</span>
                      <span className="font-bold text-amber-700 text-sm">+{formatINR(selectedData.monthInterest)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-sans block">Paid Members</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedData.paidCount} / {players.length}</span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Data Table */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              13-Month Performance Ledger
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase">
                    <th className="py-2">Month</th>
                    <th className="py-2 text-right">Fund Collected</th>
                    <th className="py-2 text-right">Baddi Interest</th>
                    <th className="py-2 text-right">Collection Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {monthlyData.map((d) => (
                    <tr key={d.month} className="hover:bg-slate-50">
                      <td className="py-2.5 font-sans font-semibold text-slate-900">{d.month}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">{formatINR(d.totalCollected)}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-700">+{formatINR(d.monthInterest)}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          d.paidRate >= 70 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {d.paidRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Fund Ledger */}
      {activeTab === 'monthly' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Fund Collections Ledger</h3>
              <p className="text-xs text-slate-500">Totals aggregated across active tournament cycles</p>
            </div>
            <span className="text-sm font-bold font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl">
              {formatINR(stats.totalMonthlyContributions)}
            </span>
          </div>

          <div className="space-y-3">
            {monthlyData.map((mb) => (
              <div
                key={mb.month}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{mb.month}</span>
                    <span className="text-xs text-slate-500">{mb.paidCount} players contributed</span>
                  </div>
                </div>

                <span className="font-black font-mono text-slate-900 text-sm sm:text-base">
                  {formatINR(mb.totalCollected)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Baddi Chitti Interest Ledger */}
      {activeTab === 'baddi' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Baddi Chitti Loan Interest Ledger</h3>
              <p className="text-xs text-slate-500">10% monthly interest earnings on tournament loan disbursements</p>
            </div>
            <span className="text-sm font-bold font-mono text-amber-700 bg-amber-50 px-3 py-1 rounded-xl">
              + {formatINR(stats.totalBaddiChittiInterest)}
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Loan Records & Net Interest Accrued
            </h4>
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      {loan.player_name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      loan.status === 'PAID' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                    Principal Lent: {formatINR(loan.principal)} · Lent: {loan.lending_month}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black font-mono text-emerald-700 block">
                    + {formatINR(loan.interest)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">10% Earned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
