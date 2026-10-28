/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Collect Monthly Fund Screen.
 * Open only for current and previous months.
 * Upcoming months are displayed in locked mode with a live running countdown to the 15th.
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db, getErrorMessage, TOURNAMENT_MONTHS, formatINR, isFutureMonth, getMonthDeadlineDate } from '../lib/database';
import { Player, MonthlyPayment } from '../types';
import { CreditCard, CheckCircle2, Clock, Lock, Search, AlertCircle, Loader2, Shield } from 'lucide-react';

export const AdminCollectPage: React.FC = () => {
  const { currentAdmin } = useAuth();
  const { players, payments, closedMonths, isPlayerAdmin, refetch } = useRealtimeData();
  const { t } = useLanguage();

  const [selectedMonth, setSelectedMonth] = useState<string>(TOURNAMENT_MONTHS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [upiModalPlayer, setUpiModalPlayer] = useState<Player | null>(null);
  const [upiRefInput, setUpiRefInput] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Running countdown timer interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isMonthClosed = closedMonths.some((c) => c.month === selectedMonth);
  const isUpcoming = isFutureMonth(selectedMonth);

  // Compute countdown string (Xd Yh Zm Ws)
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

  const currentMonthPayments = new Map<string, MonthlyPayment>();
  payments
    .filter((p) => p.month === selectedMonth)
    .forEach((p) => currentMonthPayments.set(p.player_id, p));

  const filteredPlayers = players.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.kmpl_id.toLowerCase().includes(q) ||
      (p.phone ? p.phone.includes(q) : false)
    );
  });

  const handleMarkPayment = async (
    player: Player,
    status: 'PAID' | 'PENDING',
    method?: 'Cash' | 'UPI',
    ref?: string
  ) => {
    if (isUpcoming) {
      setStatusMessage({
        type: 'error',
        text: `Upcoming month ${selectedMonth} is locked. Collections open when the month starts.`,
      });
      return;
    }

    if (isMonthClosed) {
      setStatusMessage({ type: 'error', text: `${selectedMonth} is closed and locked from modifications.` });
      return;
    }

    setProcessingId(player.id);
    try {
      const officerName = currentAdmin?.name || 'Authorized Officer';
      await db.recordPayment(player.id, selectedMonth, status, method, ref, officerName);
      setStatusMessage({
        type: 'success',
        text: `Recorded payment for ${player.name} (${status === 'PAID' ? method || 'Paid' : 'Pending'}) by ${officerName}`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
      refetch();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: getErrorMessage(err, 'Failed to update payment record.'),
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiModalPlayer) return;
    await handleMarkPayment(upiModalPlayer, 'PAID', 'UPI', upiRefInput.trim());
    setUpiModalPlayer(null);
    setUpiRefInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.collectFund}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Open for current and previous months. Upcoming months are locked with a live ticking countdown.
        </p>
        <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 inline-flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Officer: <strong>{currentAdmin?.name}</strong>. Multi-admin handover active.</span>
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Month:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
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

          {isUpcoming ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold font-mono">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Upcoming Locked · {getCountdown(selectedMonth)}</span>
            </div>
          ) : isMonthClosed ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>{selectedMonth} is Closed (Read-Only)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Open for Collections</span>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Month Locked Alert with Live Countdown */}
      {isUpcoming && (
        <div className="mb-6 p-6 rounded-3xl bg-slate-900 text-white shadow-lg border border-slate-800 text-center animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">
            {selectedMonth} is an Upcoming Month (Locked)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Fund collection is restricted to current and previous months. This month will unlock automatically approaching the 15th collection deadline.
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

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter players in collection list..."
          disabled={isUpcoming}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs disabled:opacity-60"
        />
      </div>

      {/* Players Collection Roster */}
      <div className="space-y-3">
        {filteredPlayers.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-sm">
            {players.length === 0 ? t.noPlayersYet : 'No players match your search filter.'}
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const currentPay = currentMonthPayments.get(player.id);
            const isPaid = currentPay?.status === 'PAID';
            const isAdmin = isPlayerAdmin(player);
            const isProcessing = processingId === player.id;

            return (
            <div
              key={player.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isPaid
                  ? 'bg-white border-emerald-200 shadow-2xs'
                  : 'bg-white border-slate-200 shadow-2xs'
              } ${isUpcoming ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center shrink-0 ${
                    isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isPaid ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <Clock className="w-5 h-5 text-slate-400" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm sm:text-base truncate">
                      {isAdmin && '👑 '}
                      {player.name}
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {player.kmpl_id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">
                    Fee: {formatINR(player.monthly_amount)}{player.phone ? ` · ${player.phone}` : ''}
                    {isPaid && currentPay && (
                      <span className="text-emerald-700 font-semibold block sm:inline sm:ml-2">
                        · {currentPay.payment_method}
                        {currentPay.upi_reference ? ` (${currentPay.upi_reference})` : ''}
                        {currentPay.recorded_by ? ` · By: ${currentPay.recorded_by}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Cash / UPI / Revert */}
              <div className="flex items-center gap-2 shrink-0">
                {isUpcoming ? (
                  <span className="text-xs text-slate-400 font-semibold italic px-3 py-1.5">
                    Locked (Upcoming)
                  </span>
                ) : isPaid ? (
                  <button
                    disabled={isMonthClosed || isProcessing}
                    onClick={() => handleMarkPayment(player, 'PENDING')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold transition-colors disabled:opacity-50 min-h-[40px]"
                  >
                    {isProcessing ? 'Updating...' : 'Mark as Pending'}
                  </button>
                ) : (
                  <>
                    <button
                      disabled={isMonthClosed || isProcessing}
                      onClick={() => handleMarkPayment(player, 'PAID', 'Cash')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors disabled:opacity-50 min-h-[44px] flex items-center gap-1.5"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Pay Cash</span>
                    </button>

                    <button
                      disabled={isMonthClosed || isProcessing}
                      onClick={() => {
                        setUpiModalPlayer(player);
                        setUpiRefInput('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold transition-colors disabled:opacity-50 min-h-[44px] flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay UPI</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* UPI Reference Capture Dialog */}
      {upiModalPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Capture UPI Payment
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Member: <strong className="text-slate-800">{upiModalPlayer.name}</strong> ({formatINR(upiModalPlayer.monthly_amount)})
            </p>

            <form onSubmit={handleConfirmUpi} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  UPI Reference / Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={upiRefInput}
                  onChange={(e) => setUpiRefInput(e.target.value)}
                  placeholder="e.g. UPI/4092182910"
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpiModalPlayer(null)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm"
                >
                  Record UPI Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
