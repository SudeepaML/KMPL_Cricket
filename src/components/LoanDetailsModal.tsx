/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Baddi Chitti Loan Details Modal with Web Share API and WhatsApp link fallback (wa.me).
 */

import React, { useState } from 'react';
import { Loan } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatINR } from '../lib/database';
import { X, Share2, AlertTriangle, Clock, Calendar, Check, MessageSquare } from 'lucide-react';

interface LoanDetailsModalProps {
  loan: Loan | null;
  onClose: () => void;
}

export const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({ loan, onClose }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!loan) return null;

  const isOverdue = loan.status === 'OVERDUE';

  const shareText = `🏏 *KMPL Cricket — Baddi Chitti Loan Summary*
---------------------------------------
👤 *Member:* ${loan.player_name}
💰 *Principal Amount:* ${formatINR(loan.principal)}
📈 *10% Interest:* ${formatINR(loan.interest)}
🎯 *Total Return Due:* ${formatINR(loan.total_return)}
📅 *Lending Month:* ${loan.lending_month}
⏰ *Repayment Due Date:* ${loan.due_date} (15th)
📌 *Status:* ${loan.status}
---------------------------------------
_Kagalagere Megala Hatti Premier League Finance Tracker_`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `KMPL Baddi Chitti — ${loan.player_name}`,
          text: shareText,
        });
        return;
      } catch (err) {
        console.log('Web share dismissed or failed, falling back to WhatsApp/Clipboard', err);
      }
    }

    // WhatsApp fallback
    const encoded = encodeURIComponent(shareText);
    const waUrl = `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
            isOverdue
              ? 'bg-rose-100 text-rose-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {loan.status}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Name and Header */}
        <div className="mt-4 text-center">
          <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
            {t.baddiChitti} Ledger
          </span>
          <h3 className="mt-1 text-xl font-bold text-slate-900 tracking-tight">
            {loan.player_name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Issued in {loan.lending_month}
          </p>
        </div>

        {/* Loan Financial Breakdown */}
        <div className="mt-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">{t.principal}</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {formatINR(loan.principal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">{t.interest}</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">
              + {formatINR(loan.interest)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2.5 border-t border-slate-200">
            <span className="text-slate-900 font-bold">{t.totalReturn}</span>
            <span className="font-black text-amber-600 font-mono text-base">
              {formatINR(loan.total_return)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {t.repaymentDue}
              </span>
              <span className="font-mono font-medium text-slate-800">
                {loan.due_date}
              </span>
            </div>

            {loan.payment_method && (
              <div className="flex items-center justify-between text-slate-500">
                <span>Payment Method</span>
                <span className="font-semibold text-slate-800">
                  {loan.payment_method} {loan.upi_reference ? `(${loan.upi_reference})` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Web Share + WhatsApp Fallback */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleShare}
            className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.shareLoan}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/80"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={handleCopy}
              className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
