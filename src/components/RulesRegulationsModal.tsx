/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Rules & Regulations of Fund Modal.
 * Displays the tournament fund rules set dynamically by admins,
 * visible to all players and villagers in bilingual Kannada/English.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { KmplLogo } from './KmplLogo';
import { FundRule, RuleCategory } from '../types';
import {
  X,
  ScrollText,
  CreditCard,
  Clock,
  CircleDollarSign,
  BarChart3,
  ShieldCheck,
  Globe,
  Settings,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface RulesRegulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesRegulationsModal: React.FC<RulesRegulationsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isAdmin } = useAuth();
  const { rules } = useRealtimeData();
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'all'>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isKn = language === 'kn';
  const activeRules = rules.filter(r => r.is_active);
  const filteredRules = selectedCategory === 'all'
    ? activeRules
    : activeRules.filter(r => r.category === selectedCategory);

  const getCategoryIcon = (cat: RuleCategory) => {
    switch (cat) {
      case 'contribution':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-teal-600" />;
      case 'loan':
        return <CircleDollarSign className="w-4 h-4 text-amber-600" />;
      case 'accounting':
        return <BarChart3 className="w-4 h-4 text-indigo-600" />;
      case 'general':
      default:
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
    }
  };

  const getCategoryBadge = (cat: RuleCategory) => {
    switch (cat) {
      case 'contribution':
        return isKn ? 'ದೇಣಿಗೆ ನಿಯಮ' : 'Contribution';
      case 'deadline':
        return isKn ? 'ಗಡುವು ನಿಯಮ' : 'Deadline';
      case 'loan':
        return isKn ? 'ಚಿಟ್ಟಿ ಸಾಲ' : 'Baddi Chitti';
      case 'accounting':
        return isKn ? 'ಲೆಕ್ಕಾಚಾರ' : 'Accounting';
      case 'general':
      default:
        return isKn ? 'ಸಾಮಾನ್ಯ ನಿಯಮ' : 'General';
    }
  };

  const handleShareRules = () => {
    const textToShare = activeRules.map((r, i) => `${i + 1}. ${isKn ? r.title_kn : r.title}\n${isKn ? r.description_kn : r.description}`).join('\n\n');
    const fullText = `*KMPL Cricket - Tournament Fund Rules & Regulations*\n\n${textToShare}\n\nOfficial ledger: https://portfolio-eight-tan-qeciqgq52g.vercel.app/`;

    if (navigator.share) {
      navigator.share({
        title: 'KMPL Cricket Fund Rules',
        text: fullText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <KmplLogo size="sm" withGlow />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                  {isKn ? 'ಅಧಿಕೃತ ನಿಯಮಗಳು' : 'Official Fund Rules'}
                </span>
                <span className="text-xs text-emerald-300 font-medium">
                  {activeRules.length} {isKn ? 'ನಿಯಮಗಳು' : 'Rules'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                {t.rulesTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(isKn ? 'en' : 'kn')}
              className="px-2.5 py-1 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-xs font-semibold text-white border border-emerald-700/60 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{isKn ? 'English' : 'ಕನ್ನಡ'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subtitle Bar & Quick Actions */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="text-slate-600 font-medium">
            {t.rulesSubtitle}
          </p>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin/rules"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold transition-colors shadow-2xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isKn ? 'ನಿಯಮಗಳನ್ನು ಬದಲಾಯಿಸಿ' : 'Edit Rules in Admin'}</span>
              </Link>
            )}

            <button
              onClick={handleShareRules}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{copied ? (isKn ? 'ಪ್ರತಿಮಾಡಲಾಗಿದೆ!' : 'Copied!') : (isKn ? 'ಹಂಚಿಕೊಳ್ಳಿ' : 'Share / Copy')}</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex border-b border-slate-200 bg-white px-3 sm:px-6 py-2 overflow-x-auto no-scrollbar gap-1.5">
          {[
            { id: 'all', label: isKn ? 'ಎಲ್ಲಾ ನಿಯಮಗಳು' : 'All Rules' },
            { id: 'contribution', label: isKn ? 'ದೇಣಿಗೆ' : 'Contributions' },
            { id: 'deadline', label: isKn ? 'ಗಡುವು' : 'Deadlines' },
            { id: 'loan', label: isKn ? 'ಬಡ್ಡಿ ಚಿಟ್ಟಿ' : 'Loans' },
            { id: 'accounting', label: isKn ? 'ಲೆಕ್ಕಾಚಾರ' : 'Accounting' },
            { id: 'general', label: isKn ? 'ಸಾಮಾನ್ಯ' : 'General' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rules List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {filteredRules.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              {isKn ? 'ಯಾವುದೇ ನಿಯಮಗಳು ಲಭ್ಯವಿಲ್ಲ.' : 'No rules found for this category.'}
            </div>
          ) : (
            filteredRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-400 transition-all flex items-start gap-3.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
                  {rule.order || idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {getCategoryIcon(rule.category)}
                      <span>{getCategoryBadge(rule.category)}</span>
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {isKn ? rule.title_kn : rule.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {isKn ? rule.description_kn : rule.description}
                  </p>

                  {/* Secondary Language Subtitle for Complete Clarity */}
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    {isKn ? rule.description : rule.description_kn}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {isKn
                ? 'ಎಲ್ಲಾ ಆಟಗಾರರು ಮತ್ತು ಸದಸ್ಯರು ಈ ನಿಯಮಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಪಾಲಿಸಬೇಕು.'
                : 'All players, borrowers, and officers must adhere to these policies.'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-colors self-end sm:self-auto min-h-[44px]"
          >
            {isKn ? 'ಮುಚ್ಚಿ (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
