/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Member Profile Modal displaying detailed player information,
 * membership tier, monthly fee, and active chitti status.
 * Special developer view for Sudeepa ML displaying his portfolio website.
 */

import React from 'react';
import { Player, Admin } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatINR, DEVELOPER_INFO } from '../lib/database';
import { X, Phone, Calendar, Award, CheckCircle2, AlertCircle, ExternalLink, Globe, Code2, Shield } from 'lucide-react';

interface PlayerProfileModalProps {
  player: Player | null;
  isAdminMember: boolean;
  adminInfo?: Admin;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  isAdminMember,
  adminInfo,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!player) return null;

  const isDeveloper = player.name.toLowerCase().includes('sudeepa') || player.phone.includes('7760880282') || adminInfo?.is_developer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono">
              {player.kmpl_id}
            </span>
            {isDeveloper ? (
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-300">
                👑 Lead Developer & Admin
              </span>
            ) : isAdminMember ? (
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 shadow-2xs">
                <span>👑</span>
                <Shield className="w-3 h-3 text-emerald-800" />
                <span>{adminInfo?.role_title || 'Admin Officer'}</span>
              </span>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Avatar & Name */}
        <div className="mt-4 text-center">
          <div className={`w-16 h-16 mx-auto rounded-2xl font-black text-2xl flex items-center justify-center shadow-md relative ${
            isDeveloper
              ? 'bg-gradient-to-tr from-amber-400 to-amber-600 text-emerald-950 ring-4 ring-amber-100'
              : isAdminMember
              ? 'bg-gradient-to-tr from-amber-400 via-amber-500 to-emerald-600 text-emerald-950 ring-4 ring-amber-100'
              : 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white'
          }`}>
            {isDeveloper ? '👑' : isAdminMember ? '👑' : player.name.charAt(0)}
            {isAdminMember && !isDeveloper && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-900 text-amber-300 rounded-full flex items-center justify-center text-[10px] ring-2 ring-white font-bold" title="Tournament Officer">
                🛡️
              </span>
            )}
          </div>
          <h3 className="mt-3 text-lg font-bold text-slate-900 tracking-tight">
            {isAdminMember && '👑 '}
            {player.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {player.type === 'Senior' ? t.seniorMember : t.juniorMember}
          </p>
        </div>

        {/* Developer Special Section: Portfolio Link */}
        {isDeveloper && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              Official KMPL Creator
            </span>
            <p className="text-xs text-slate-600">
              System architect and lead engineer for KMPL Cricket.
            </p>
            <a
              href={DEVELOPER_INFO.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs transition-colors shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View Developer Portfolio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Details Grid */}
        <div className="mt-4 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number
            </span>
            <a
              href={`tel:${player.phone}`}
              className="font-mono font-medium text-emerald-700 hover:underline"
            >
              {player.phone}
            </a>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              {t.monthlyContribution}
            </span>
            <span className="font-bold text-slate-900 font-mono">
              {formatINR(player.monthly_amount)} / month
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {t.joinDate}
            </span>
            <span className="font-mono text-slate-700">
              {player.join_date || '2026-04-01'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">
              {t.chittiStatus}
            </span>
            <span className={`inline-flex items-center gap-1 font-semibold ${
              player.chitti_taken ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {player.chitti_taken ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  {t.taken}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.notTaken}
                </>
              )}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
