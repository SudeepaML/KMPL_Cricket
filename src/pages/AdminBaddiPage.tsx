/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Baddi Chitti Management Screen.
 * Open only for current and previous months.
 * Upcoming months are displayed in locked mode with a live running countdown to the 15th.
 * April 2026 = Borrow only; May 2026 onward = Borrow and Repay with 10% monthly interest.
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db, TOURNAMENT_MONTHS, formatINR, isFutureMonth, getMonthDeadlineDate } from '../lib/database';
import { Loan, Player } from '../types';
import { CircleDollarSign, Plus, CheckCircle2, Clock, AlertTriangle, CreditCard, Loader2, Lock, Shield, AlertCircle } from 'lucide-react';

export const AdminBaddiPage: React.FC = () => {
  const { currentAdmin } = useAuth();
  const { players, loans, refetch } = useRealtimeData();
  const { t } = useLanguage();

  const [selectedMonth, setSelectedMonth] = useState<string>(TOURNAMENT_MONTHS[0]); // April 2026 default
  const [activeTab, setActiveTab] = useState<'borrow' | 'repay'>('borrow');

  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState<number>(5000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [repayLoanTarget, setRepayLoanTarget] = useState<Loan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [upiRef, setUpiRef] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Running countdown timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isApril2026 = selectedMonth === 'April 2026';
  const isUpcoming = isFutureMonth(selectedMonth);

  const getCountdown = (month: string) => {
    const deadline = getMonthDeadlineDate(month).getTime();
    const diff = deadline - currentTime;
    if (diff <= 0) return '0d 0h 0m 0s';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const calculatedInterest = Math.round(principalAmount * 0.10);
  const calculatedTotalReturn = principalAmount + calculatedInterest;

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');

  const handleIssueLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpcoming) {
      setStatusMessage({ type: 'error', text: `${selectedMonth} is an upcoming month and is currently locked.` });
      return;
    }

    if (!selectedPlayerId) {
      setStatusMessage({ type: 'error', text: 'Please select a player to issue the loan.' });
      return;
    }
    if (principalAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Principal amount must be greater than zero.' });
      return;
    }

    const player = players.find((p) => p.id === selectedPlayerId);
    if (!player) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const officerName = currentAdmin?.name || 'Authorized Officer';
      await db.issueLoan(player.id, player.name, principalAmount, selectedMonth, officerName);
      setStatusMessage({
        type: 'success',
        text: `Issued Baddi Chitti loan of ${formatINR(principalAmount)} (+10% interest) to ${player.name} by ${officerName}.`,
      });
      setSelectedPlayerId('');
      setPrincipalAmount(5000);
      refetch();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to issue loan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayLoanTarget) return;

    setIsSubmitting(true);
    try {
      const officerName = currentAdmin?.name || 'Authorized Officer';
      await db.repayLoan(repayLoanTarget.id, paymentMethod, upiRef.trim() || undefined, officerName);
      setStatusMessage({
        type: 'success',
        text: `Loan repayment recorded for ${repayLoanTarget.player_name} (${formatINR(repayLoanTarget.total_return)}) by ${officerName}.`,
      });
      setRepayLoanTarget(null);
      setUpiRef('');
      refetch();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to record repayment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Admin Baddi Chitti Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Open for current and previous months. Upcoming months are locked with a live ticking countdown.
        </p>
        <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 inline-flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Officer: <strong>{currentAdmin?.name}</strong>. Multi-admin handover active.</span>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Operating Month:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                if (e.target.value === 'April 2026') {
                  setActiveTab('borrow');
                }
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {TOURNAMENT_MONTHS.map((m) => {
                const isFuture = isFutureMonth(m);
                return (
                  <option key={m} value={m}>
                    {m} {isFuture ? '🔒 (Upcoming Locked)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-xs font-medium">
            {isUpcoming ? (
              <span className="text-amber-900 font-bold bg-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-mono">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Upcoming Locked · {getCountdown(selectedMonth)}</span>
              </span>
            ) : isApril2026 ? (
              <span className="text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                April 2026 = Borrowing Only
              </span>
            ) : (
              <span className="text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                May 2026+ = Borrow & Repay Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Month Locked Card with Ticking Countdown */}
      {isUpcoming && (
        <div className="mb-6 p-6 rounded-3xl bg-slate-900 text-white shadow-lg border border-slate-800 text-center animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">
            {selectedMonth} Baddi Chitti is Locked (Upcoming)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Disbursement and collection of Baddi Chitti loans is restricted to current and previous months.
          </p>

          <div className="mt-4 p-3 rounded-2xl bg-slate-800/80 inline-block">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold block mb-1">
              Time Remaining Until 15th Deadline
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tabular-nums">
              {getCountdown(selectedMonth)}
            </span>
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs: Borrow vs Repay */}
      <div className={`flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl mb-6 ${isUpcoming ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          onClick={() => setActiveTab('borrow')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
            activeTab === 'borrow'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plus className="w-4 h-4 text-emerald-700" />
          <span>{t.borrowChitti}</span>
        </button>

        <button
          disabled={isApril2026}
          onClick={() => setActiveTab('repay')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
            isApril2026
              ? 'opacity-40 cursor-not-allowed text-slate-400'
              : activeTab === 'repay'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CircleDollarSign className="w-4 h-4 text-amber-600" />
          <span>{t.repayChitti} {isApril2026 ? '(Starts May)' : ''}</span>
        </button>
      </div>

      {/* Tab 1: Issue Loan Form */}
      {activeTab === 'borrow' && !isUpcoming && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Issue New Baddi Chitti Loan for {selectedMonth}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            10% interest rate applied automatically. Repayment is due on the 15th of the following month.
          </p>

          <form onSubmit={handleIssueLoan} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Borrower (Player)
              </label>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">
                  {players.length === 0 ? 'No players yet — add members first' : 'Choose a member...'}
                </option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.kmpl_id}){p.phone ? ` — ${p.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Principal Amount (₹)
              </label>
              <input
                type="number"
                step="500"
                min="500"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Live Calculation Preview Card */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Principal:</span>
                <span className="font-bold font-mono">{formatINR(principalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>10% Tournament Interest:</span>
                <span className="font-bold font-mono text-emerald-800">+ {formatINR(calculatedInterest)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-900 font-bold pt-2 border-t border-amber-200">
                <span>Total Due on Repayment:</span>
                <span className="text-base font-black font-mono text-amber-900">{formatINR(calculatedTotalReturn)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Loan...</span>
                </>
              ) : (
                <span>Confirm & Issue Loan</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Repay Loan List */}
      {activeTab === 'repay' && !isApril2026 && !isUpcoming && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Loans Awaiting Repayment
            </h2>
            <p className="text-xs text-slate-500">
              Select an outstanding loan to record repayment settlement.
            </p>
          </div>

          {activeLoans.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No active or overdue loans pending repayment.
            </p>
          ) : (
            <div className="space-y-3">
              {activeLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {loan.player_name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        loan.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono block mt-0.5">
                      Lent: {loan.lending_month} · Due: {loan.due_date}
                      {loan.recorded_by ? ` · Officer: ${loan.recorded_by}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Due</span>
                      <span className="text-base font-black font-mono text-slate-900 block">
                        {formatINR(loan.total_return)}
                      </span>
                    </div>

                    <button
                      onClick={() => setRepayLoanTarget(loan)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors min-h-[40px]"
                    >
                      Record Repayment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Repayment Modal */}
      {repayLoanTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Record Loan Repayment
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Member: <strong className="text-slate-800">{repayLoanTarget.player_name}</strong>
            </p>

            <div className="mt-3 p-3 rounded-xl bg-slate-50 font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span>Principal:</span>
                <span>{formatINR(repayLoanTarget.principal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>10% Interest:</span>
                <span>+ {formatINR(repayLoanTarget.interest)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Return:</span>
                <span>{formatINR(repayLoanTarget.total_return)}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmRepayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      paymentMethod === 'Cash'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    UPI
                  </button>
                </div>
              </div>

              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    UPI Reference No (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="e.g. UPI/20260515/8812"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRepayLoanTarget(null)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold"
                >
                  Confirm Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
