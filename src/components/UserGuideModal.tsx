/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * User Guide Modal Component for KMPL Cricket.
 * Comprehensive, bilingual guide explaining:
 * 1. Open Public Transparency (No Player Login Required!)
 * 2. Monthly Fund (13 Months April 2026 - April 2027, 15th deadline, countdowns)
 * 3. Baddi Chitti (10% flat interest, repayment rules, WhatsApp loan share)
 * 4. Cumulative Report & Grand Total Formula (Monthly Fund + Baddi Interest Only)
 * 5. Admin Panel Authentication & Verification Status Guide
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { KmplLogo } from './KmplLogo';
import {
  X,
  BookOpen,
  Users,
  Calendar,
  CircleDollarSign,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  Lock,
  Globe,
  HelpCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'transparency' | 'fund' | 'baddi' | 'report' | 'admin'>('transparency');

  if (!isOpen) return null;

  const isKn = language === 'kn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <KmplLogo size="sm" withGlow />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                  {isKn ? 'ಸಹಾಯ & ಮಾಹಿತಿ' : 'Help & Manual'}
                </span>
                <span className="text-xs text-emerald-300 font-medium hidden sm:inline">
                  KMPL Season 01
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                {isKn ? 'ಕೆಎಂಪಿಎಲ್ ಕ್ರಿಕೆಟ್ ಬಳಕೆದಾರರ ಕೈಪಿಡಿ' : 'KMPL Cricket User Guide'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language switch inside guide */}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/90 overflow-x-auto no-scrollbar px-2 sm:px-4 shrink-0">
          <button
            onClick={() => setActiveTab('transparency')}
            className={`flex items-center gap-2 px-3 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'transparency'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{isKn ? '1. ಮುಕ್ತ ಪಾರದರ್ಶಕತೆ (No Login)' : '1. Public Transparency (No Login)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('fund')}
            className={`flex items-center gap-2 px-3 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'fund'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>{isKn ? '2. ಮಾಸಿಕ ಫಂಡ್ (13 ತಿಂಗಳು)' : '2. Monthly Fund (13 Mo)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('baddi')}
            className={`flex items-center gap-2 px-3 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'baddi'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CircleDollarSign className="w-4 h-4 text-amber-600" />
            <span>{isKn ? '3. ಬಡ್ಡಿ ಚಿಟ್ಟಿ (10%)' : '3. Baddi Chitti (10%)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'report'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>{isKn ? '4. ಒಟ್ಟು ಲೆಕ್ಕ ಸೂತ್ರ' : '4. Grand Total Formula'}</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'admin'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>{isKn ? '5. ಅಡ್ಮಿನ್ ಲಾಗಿನ್ & ದೃಢೀಕರಣ' : '5. Admin Login & Auth'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed">
          {/* TAB 1: Public Transparency */}
          {activeTab === 'transparency' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Highlight callout box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200/80 text-emerald-950 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-200 text-emerald-900 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-900">
                    {isKn
                      ? 'ಆಟಗಾರರು ಮತ್ತು ಊರಿನವರಿಗೆ ಯಾವುದೇ ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ!'
                      : 'Important: No Login or Password Needed for Players or Villagers!'}
                  </h4>
                  <p className="text-xs text-emerald-800/90 mt-1">
                    {isKn
                      ? 'ಕೆಎಂಪಿಎಲ್ ಕ್ರಿಕೆಟ್ ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕ ಸಾರ್ವಜನಿಕ ವೆಬ್‌ಸೈಟ್ ಆಗಿದೆ. ಯಾವುದೇ ಆಟಗಾರ ಅಥವಾ ಗ್ರಾಮಸ್ಥರು ಲಾಗಿನ್ ಮಾಡದೆಯೇ ಎಲ್ಲಾ ಲೆಕ್ಕಪತ್ರಗಳು, ಆಟಗಾರರ ವಿವರ, ಮಾಸಿಕ ಪಾವತಿ ಸ್ಥಿತಿ ಮತ್ತು ಸಾಲದ ಮಾಹಿತಿಯನ್ನು ನೇರವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು.'
                      : 'KMPL Cricket is designed for 100% village transparency. Players, family members, and fans can view all finances, member details, monthly payment receipts, and loan records directly without creating an account or entering passwords.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">1</span>
                    {isKn ? 'ಆಟಗಾರರ ವಿವರ ಹುಡುಕಾಟ' : 'Search Players Easily'}
                  </h5>
                  <p className="text-xs text-slate-600">
                    {isKn
                      ? 'ಆಟಗಾರರ ಪಟ್ಟಿಯಲ್ಲಿ ಹೆಸರು, ಕೆಎಂಪಿಎಲ್ ಐಡಿ (ಉದಾ: KMPL01) ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮೂಲಕ ತಕ್ಷಣ ಹುಡುಕಿ. "A-Z ಪಟ್ಟಿ" ಬಟನ್ ಒತ್ತಿ ಅಕ್ಷರಾನುಕ್ರಮದಲ್ಲಿ ಆಟಗಾರರನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು.'
                      : 'Search by Player Name, KMPL ID (e.g. KMPL01), or mobile number. Use the "A-Z Directory" button to browse members alphabetically.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">2</span>
                    {isKn ? 'ಸದಸ್ಯರ ಪ್ರೊಫೈಲ್ ಕಾರ್ಡ್' : 'Member Profile Card'}
                  </h5>
                  <p className="text-xs text-slate-600">
                    {isKn
                      ? 'ಯಾವುದೇ ಆಟಗಾರನ ಹೆಸರನ್ನು ಸ್ಪರ್ಶಿಸಿದರೆ ಅವರ ಸದಸ್ಯತ್ವ ವರ್ಗ (ಹಿರಿಯರು ₹200 / ಕಿರಿಯರು ₹100), ಸೇರಿದ ದಿನಾಂಕ ಮತ್ತು ಚಾಲ್ತಿ ಚಿಟ್ಟಿ ಸಾಲದ ಸ್ಥಿತಿ ಕಾಣಿಸುತ್ತದೆ.'
                      : 'Tap any player card to inspect their membership tier (Senior ₹200/mo or Junior ₹100/mo), joined date, and whether they have taken a Baddi Chitti.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Monthly Fund */}
          {activeTab === 'fund' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-teal-900">
                    {isKn ? '13 ತಿಂಗಳ ಮಾಸಿಕ ಫಂಡ್ ವೇಳಾಪಟ್ಟಿ' : '13-Month Tournament Cycle'}
                  </h4>
                  <p className="text-xs text-teal-800/90 mt-1">
                    {isKn
                      ? 'ಟೂರ್ನಮೆಂಟ್ ಅವಧಿಯು ಏಪ್ರಿಲ್ 2026 ರಿಂದ ಏಪ್ರಿಲ್ 2027 ರವರೆಗೆ ಒಟ್ಟು 13 ತಿಂಗಳು ನಡೆಯುತ್ತದೆ. ಪ್ರತಿ ತಿಂಗಳ 15 ನೇ ತಾರೀಖು ಹಣ ಪಾವತಿಯ ಕೊನೆಯ ದಿನಾಂಕವಾಗಿದೆ.'
                      : 'The tournament cycle runs for 13 full months from April 2026 through April 2027. The 15th of each month is the strict payment deadline.'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    {isKn ? 'ಮುಂದಿನ ತಿಂಗಳುಗಳ ಲೈವ್ ಕೌಂಟ್‌ಡೌನ್ (Locked Months)' : 'Upcoming Months Live Countdown'}
                  </h5>
                  <p className="text-xs text-slate-600">
                    {isKn
                      ? 'ಪ್ರಸ್ತುತ ಮತ್ತು ಹಿಂದಿನ ತಿಂಗಳುಗಳು ಮಾತ್ರ ಹಣ ಸಂಗ್ರಹಕ್ಕೆ ಮುಕ್ತವಾಗಿರುತ್ತವೆ. ಮುಂಬರುವ ಭವಿಷ್ಯದ ತಿಂಗಳುಗಳು ಲಾಕ್ ಆಗಿರುತ್ತವೆ ಮತ್ತು ಆಯಾ ತಿಂಗಳ 15 ನೇ ತಾರೀಖಿಗೆ ಉಳಿದಿರುವ ಸಮಯವನ್ನು (ದಿನ, ಗಂಟೆ, ನಿಮಿಷ, ಸೆಕೆಂಡು) ಲೈವ್ ಆಗಿ ತೋರಿಸುತ್ತವೆ.'
                      : 'Only the current month and past months are open for viewing collection records. Future upcoming months are locked with a real-time countdown ticking down to the 15th.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {isKn ? 'ಪಾವತಿಸಿದವರು ಮತ್ತು ಬಾಕಿ ಉಳಿದವರ ಪಟ್ಟಿ' : 'Paid vs Pending Breakdown'}
                  </h5>
                  <p className="text-xs text-slate-600">
                    {isKn
                      ? 'ಯಾವುದೇ ಮುಕ್ತ ತಿಂಗಳ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿದಾಗ ಹಣ ಪಾವತಿಸಿದ ಸದಸ್ಯರ ಪಟ್ಟಿ (ಪಾವತಿ ಸಮಯ, ನಗದು/ಯುಪಿಐ ರೆಫರೆನ್ಸ್) ಮತ್ತು ಇನ್ನೂ ಹಣ ಪಾವತಿಸದ ಬಾಕಿ ಆಟಗಾರರ ಪಟ್ಟಿ ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣುತ್ತದೆ.'
                      : 'Tap any active month to view "Paid Players" (sorted chronologically with Cash/UPI mode and timestamps) and "Pending Players" who have yet to clear their monthly fee.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Baddi Chitti */}
          {activeTab === 'baddi' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                <CircleDollarSign className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">
                    {isKn ? 'ಬಡ್ಡಿ ಚಿಟ್ಟಿ ಸಾಲದ ಕಾರ್ಯವಿಧಾನ' : 'How Baddi Chitti Works'}
                  </h4>
                  <p className="text-xs text-amber-800/90 mt-1">
                    {isKn
                      ? 'ಗ್ರಾಮದ ಆಟಗಾರರಿಗೆ ಆರ್ಥಿಕ ನೆರವು ನೀಡಲು ಮತ್ತು ಟೂರ್ನಮೆಂಟ್‌ಗೆ ಲಾಭ ಗಳಿಸಲು 10% ನಿಗದಿತ ಮಾಸಿಕ ಬಡ್ಡಿ ಸಾಲದ ವ್ಯವಸ್ಥೆ ಮಾಡಲಾಗಿದೆ.'
                      : 'A transparent 10% monthly interest loan scheme designed to support village players while generating tournament interest revenue.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">ಏಪ್ರಿಲ್ 2026</span>
                  <h5 className="font-bold text-slate-900 text-xs mt-0.5">
                    {isKn ? 'ಮೊದಲ ತಿಂಗಳು: ಸಾಲ ನೀಡಿಕೆ ಮಾತ್ರ' : 'Month 1: Borrowing Only'}
                  </h5>
                  <p className="text-xs text-slate-600 mt-1">
                    {isKn
                      ? 'ಏಪ್ರಿಲ್ 2026 ರಲ್ಲಿ ಸದಸ್ಯರು ಸಾಲ ಪಡೆಯಬಹುದು. ಇದರ ಮರುಪಾವತಿ ಮೇ 2026 ರ 15 ನೇ ತಾರೀಖಿನಂದು ಆರಂಭವಾಗುತ್ತದೆ.'
                      : 'In April 2026, members can borrow loans. Repayment begins from the next month (May 15th, 2026).'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">ಮೇ 2026 ರಿಂದ ಮುಂದಕ್ಕೆ</span>
                  <h5 className="font-bold text-slate-900 text-xs mt-0.5">
                    {isKn ? 'ನೀಡಿಕೆ ಮತ್ತು ಮರುಪಾವತಿ' : 'Borrowing & Repayments'}
                  </h5>
                  <p className="text-xs text-slate-600 mt-1">
                    {isKn
                      ? 'ಹಳೆಯ ಸಾಲಗಳನ್ನು 10% ಬಡ್ಡಿಯೊಂದಿಗೆ ಮರುಪಾವತಿ ಮಾಡುವುದು ಮತ್ತು ಹೊಸ ಸಾಲಗಳನ್ನು ನೀಡುವುದು ಎರಡೂ ಚಾಲ್ತಿಯಲ್ಲಿರುತ್ತದೆ.'
                      : 'Borrowers return principal + 10% interest, while new loans continue to be disbursed.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-semibold text-slate-800">
                    {isKn ? 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಸಾಲದ ವಿವರ ಹಂಚಿಕೊಳ್ಳುವಿಕೆ' : '1-Tap WhatsApp Loan Share'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">wa.me direct</span>
              </div>
            </div>
          )}

          {/* TAB 4: Grand Total Formula */}
          {activeTab === 'report' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950">
                <h4 className="font-black text-sm text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-700" />
                  {isKn ? 'ಟೂರ್ನಮೆಂಟ್ ಒಟ್ಟು ಹಣದ ಲೆಕ್ಕಾಚಾರದ ಸೂತ್ರ' : 'Tournament Grand Total Calculation Logic'}
                </h4>
                <p className="text-xs text-indigo-900/90 mt-1.5 leading-relaxed">
                  {isKn
                    ? 'ಚಿಟ್ಟಿ ಸಾಲದ ಮೂಲ ಹಣವನ್ನು (Principal) ಮಾಸಿಕ ದೇಣಿಗೆಯಿಂದಲೇ ನೀಡಲಾಗುವುದರಿಂದ, ಮೂಲ ಹಣವನ್ನು ಮತ್ತೆ ಎಣಿಸಿದರೆ ಡಬಲ್ ಎಣಿಕೆಯಾಗುತ್ತದೆ. ಆದ್ದರಿಂದ ಒಟ್ಟು ಮೊತ್ತದಲ್ಲಿ ಬಡ್ಡಿ ಹಣವನ್ನು ಮಾತ್ರ ಸೇರಿಸಲಾಗುತ್ತದೆ:'
                    : 'Because loan principal is disbursed directly out of the collected monthly fund pool, counting principal again would result in double-counting. Therefore, only the 10% interest profit is added to the tournament treasury:'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 text-white font-mono text-center space-y-2 border border-slate-800">
                <span className="text-xs text-amber-400 font-bold tracking-wider uppercase block">
                  {isKn ? 'ಅಧಿಕೃತ ಲೆಕ್ಕಾಚಾರ ಸೂತ್ರ' : 'Official Treasury Formula'}
                </span>
                <div className="text-base sm:text-lg font-black text-emerald-400 py-1">
                  {isKn
                    ? 'ಒಟ್ಟು ಹಣ = ಒಟ್ಟು ಮಾಸಿಕ ದೇಣಿಗೆ + ಬಡ್ಡಿ ಚಿಟ್ಟಿ ಬಡ್ಡಿ ಮಾತ್ರ'
                    : 'Grand Total = All Monthly Contributions + Baddi Chitti Interest Only'}
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  {isKn
                    ? '(ಮೂಲ ಸಾಲದ ಹಣ ಮಾಸಿಕ ಫಂಡ್‌ನಲ್ಲಿ ಈಗಾಗಲೇ ಇರುತ್ತದೆ)'
                    : '(Principal is already included inside the Monthly Fund balance)'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <h5 className="font-bold text-slate-900 text-xs mb-1">
                  {isKn ? 'ಮಾಸಿಕ ಚಿತ್ರಾತ್ಮಕ ಗ್ರಾಫ್ (Graphical Dual-Bar Analysis)' : 'Monthly Graphical Dual-Bar Analysis'}
                </h5>
                <p className="text-xs text-slate-600">
                  {isKn
                    ? 'ವರದಿ ಪುಟದ ಕೆಳಭಾಗದಲ್ಲಿ ಪ್ರತಿ ತಿಂಗಳ ಮಾಸಿಕ ಫಂಡ್ ಮತ್ತು ಗಳಿಸಿದ ಬಡ್ಡಿ ಹಣವನ್ನು ತೌಲನಿಕ ಬಾರ್ ಚಾರ್ಟ್ ಮೂಲಕ ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸಲಾಗುತ್ತದೆ.'
                    : 'Below the cumulative summary cards, an interactive dual-bar visual comparison illustrates monthly fee collections vs interest earned month-by-month.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: Admin Login & Authentication */}
          {activeTab === 'admin' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-purple-900">
                    {isKn ? 'ಅಡ್ಮಿನ್ ವಿಭಾಗ: ಅಧಿಕೃತ ಸಮಿತಿಯವರಿಗೆ ಮಾತ್ರ' : 'Admin Panel: Authorized Officers Only'}
                  </h4>
                  <p className="text-xs text-purple-800/90 mt-1">
                    {isKn
                      ? 'ಟೂರ್ನಮೆಂಟ್‌ನ ಆಡಳಿತ ಸಮಿತಿ ಸದಸ್ಯರು ಮಾತ್ರ ಲಾಗಿನ್ ಆಗಿ ಹಣ ಸಂಗ್ರಹ, ಸಾಲ ಮಂಜೂರಾತಿ ಮತ್ತು ತಿಂಗಳು ಲಾಕ್ ಮಾಡುವ ಕಾರ್ಯಗಳನ್ನು ಮಾಡಬಹುದು.'
                      : 'Restricted to verified tournament committee officers for data entry, loan issuance, payment reconciliation, and month audit locking.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-bold">1</span>
                    {isKn ? 'ಲಾಗಿನ್ ವಿಧಾನ (Email OTP)' : 'Login Procedure (Email OTP)'}
                  </h5>
                  <p className="text-xs text-slate-600">
                    {isKn
                      ? 'ನೋಂದಾಯಿತ ಅಧಿಕಾರಿಯ ಇಮೇಲ್ ನಮೂದಿಸಿ "ಒಟಿಪಿ ಕಳುಹಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ. ಇಮೇಲ್‌ಗೆ ಬರುವ 6-ಅಂಕಿಯ ಕೋಡ್ ನಮೂದಿಸಿ ಲಾಗಿನ್ ಆಗಿ. (ಡೆಮೊ ಮೋಡ್‌ನಲ್ಲಿ "123456" ಕೋಡ್ ಬಳಸಬಹುದು).'
                      : 'Enter a registered officer email and click "Send 6-Digit OTP". Enter the 6-digit code received in your inbox. In Demo Mode, use code "123456".'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    {isKn ? 'ದೃಢೀಕರಣ ಯಶಸ್ಸು / ವಿಫಲತೆಯ ಸಂದೇಶಗಳು' : 'Authentication Feedback Status'}
                  </h5>
                  <p className="text-xs text-slate-600">
                    {isKn
                      ? 'ಇಮೇಲ್ ಪಟ್ಟಿಯಲ್ಲಿಲ್ಲದಿದ್ದರೆ "ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ (Authentication Failed)" ಎಂಬ ಸ್ಪಷ್ಟ ಎಚ್ಚರಿಕೆ ಬರುತ್ತದೆ. ಯಶಸ್ವಿಯಾದರೆ "👑 Authentication Successful" ಎಂದು ತೋರಿಸಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಕರೆದೊಯ್ಯುತ್ತದೆ.'
                      : 'If an unregistered email is entered, the system alerts "Authentication Failed: Email not authorized". Upon entering valid credentials, a green success banner confirms access and opens the dashboard.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-emerald-600" />
                    {isKn ? 'ಸಹಾಯಕ ಅಧಿಕಾರಿಗಳು (Backup Co-Admins)' : 'Backup Co-Admins Availability'}
                  </h5>
                  <p className="text-xs text-slate-600">
                    {isKn
                      ? 'ಒಬ್ಬ ಅಧಿಕಾರಿ ಊರಿನಲ್ಲಿ ಇಲ್ಲದಿದ್ದಾಗ ಅಥವಾ ಲಭ್ಯವಿಲ್ಲದಿದ್ದಾಗ ಇನ್ನೊಬ್ಬ ಅಧಿಕಾರಿ ಸುಲಭವಾಗಿ ಡೇಟಾ ಎಂಟ್ರಿ ಮಾಡಲು ಹೆಚ್ಚಿನ ಸಹಾಯಕ ಅಡ್ಮಿನ್‌ಗಳನ್ನು ಸೇರಿಸುವ ವ್ಯವಸ್ಥೆ ಇದೆ.'
                      : 'To prevent delays when an officer travels or is busy, backup co-admins can be registered anytime so data entry always continues smoothly.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">KMPL Cricket · Transparent Tournament Ledger</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-colors self-end sm:self-auto min-h-[44px]"
          >
            {isKn ? 'ಮುಚ್ಚಿ (Close Guide)' : 'Got it, Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
