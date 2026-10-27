/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Locked Month Modal shown when tapping on a future locked month card.
 * Explains tournament collection timeline and displays live countdown to the 15th deadline.
 */

import React, { useState, useEffect } from 'react';
import { getMonthDeadlineDate } from '../lib/database';
import { useLanguage } from '../context/LanguageContext';
import { X, Lock, Clock, Calendar } from 'lucide-react';

interface LockedMonthModalProps {
  month: string | null;
  onClose: () => void;
}

export const LockedMonthModal: React.FC<LockedMonthModalProps> = ({ month, onClose }) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!month) return;

    const deadline = getMonthDeadlineDate(month);

    const updateTimer = () => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [month]);

  if (!month) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Lock className="w-3.5 h-3.5" />
            <span>{t.lockedMonth}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="mt-3 text-xl font-bold text-slate-900 tracking-tight">
            {month}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Collections for this month will commence approaching the 15th collection deadline.
          </p>
        </div>

        {/* Live Countdown Box */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white text-center shadow-md">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-medium mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.countdownToDeadline}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono">
            <div className="bg-slate-800/80 p-2 rounded-xl">
              <span className="text-xl font-black tabular-nums">{timeLeft.days}</span>
              <span className="block text-[10px] text-slate-400 uppercase">Days</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-xl">
              <span className="text-xl font-black tabular-nums">{timeLeft.hours}</span>
              <span className="block text-[10px] text-slate-400 uppercase">Hours</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-xl">
              <span className="text-xl font-black tabular-nums">{timeLeft.minutes}</span>
              <span className="block text-[10px] text-slate-400 uppercase">Mins</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-xl">
              <span className="text-xl font-black tabular-nums text-amber-400">{timeLeft.seconds}</span>
              <span className="block text-[10px] text-slate-400 uppercase">Secs</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-center text-slate-400">
          {t.deadlineNotice}
        </p>

        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
