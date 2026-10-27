/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Login Page with Supabase Email OTP (signInWithOtp + verifyOtp).
 * Features:
 * - Clear notice that players DO NOT need to log in to view tournament data
 * - Real-time Authentication Status Feedback (Success vs Failed)
 * - Officer modal selector listing all registered tournament admins
 * - "Register New Co-Admin / Backup Officer" affordance so other officers can always enter data
 * - Direct triggers to open User Guide and Rules & Regulations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';
import { Admin } from '../types';
import { KmplLogo } from '../components/KmplLogo';
import { UserGuideModal } from '../components/UserGuideModal';
import { RulesRegulationsModal } from '../components/RulesRegulationsModal';
import {
  Shield,
  Mail,
  KeyRound,
  Loader2,
  Users,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  AlertTriangle,
  XCircle,
  Eye,
  BookOpen,
  ScrollText,
  Sparkles,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { isAdmin, sendOtp, verifyOtp, pendingEmail, currentAdmin, adminDisplayName, signOut } = useAuth();
  const { t, language } = useLanguage();
  const isKn = language === 'kn';
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [adminsList, setAdminsList] = useState<Admin[]>([]);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [isAddOfficerOpen, setIsAddOfficerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);

  // Authentication Status Feedback State
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [otpInfo, setOtpInfo] = useState<string | null>(null);

  // New admin state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Co-Officer / Data Entry Admin');

  const loadAdmins = () => {
    db.getAdmins().then((data) => {
      setAdminsList(data);
    });
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  useEffect(() => {
    if (pendingEmail) {
      setEmail(pendingEmail);
      setStep('otp');
    }
  }, [pendingEmail]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthStatus('failed');
      setStatusMessage(isKn ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.' : 'Please enter a valid registered email address.');
      return;
    }

    // Check if entered email exists in authorized admins table
    const isAuthorized = adminsList.some(
      (a) => a.email.trim().toLowerCase() === cleanEmail
    );

    if (!isAuthorized) {
      setAuthStatus('failed');
      setStatusMessage(
        isKn
          ? `ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ (Authentication Failed): "${cleanEmail}" ಇಮೇಲ್ ಟೂರ್ನಮೆಂಟ್ ಅಡ್ಮಿನ್ ಪಟ್ಟಿಯಲ್ಲಿಲ್ಲ. ಆಟಗಾರರಿಗೆ ಯಾವುದೇ ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ!`
          : `Authentication Failed: "${cleanEmail}" is not registered in the tournament committee admin list. Only authorized officers can log in.`
      );
      return;
    }

    setLoading(true);
    setAuthStatus('idle');
    setStatusMessage(null);

    const res = await sendOtp(cleanEmail);
    setLoading(false);

    if (res.success) {
      setStep('otp');
      setOtpInfo(
        isSupabaseConfigured
          ? `6-digit OTP code sent to ${cleanEmail}. Check your inbox.`
          : `Demo Mode Active: Enter code '123456' to sign in as ${cleanEmail}.`
      );
      setAuthStatus('idle');
    } else {
      setAuthStatus('failed');
      setStatusMessage(res.error || 'Failed to send OTP code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = token.trim();

    if (cleanToken.length !== 6) {
      setAuthStatus('failed');
      setStatusMessage(isKn ? 'ದಯವಿಟ್ಟು 6-ಅಂಕಿಯ ಒಟಿಪಿ ಕೋಡ್ ನಮೂದಿಸಿ.' : 'Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setAuthStatus('idle');
    setStatusMessage(null);

    const res = await verifyOtp(email.trim().toLowerCase(), cleanToken);
    setLoading(false);

    if (res.success) {
      setAuthStatus('success');
      setStatusMessage(
        isKn
          ? 'ದೃಢೀಕರಣ ಯಶಸ್ವಿಯಾಗಿದೆ (Authentication Successful)! ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಕರೆದೊಯ್ಯಲಾಗುತ್ತಿದೆ...'
          : 'Authentication Successful! Redirecting to Admin Dashboard...'
      );
      setTimeout(() => {
        navigate('/admin');
      }, 900);
    } else {
      setAuthStatus('failed');
      setStatusMessage(
        res.error ||
          (isKn
            ? 'ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ (Authentication Failed): ತಪ್ಪಾದ ಒಟಿಪಿ ಕೋಡ್ ನಮೂದಿಸಲಾಗಿದೆ.'
            : 'Authentication Failed: Invalid 6-digit OTP code. Please enter the code sent to your email (or 123456 in demo).')
      );
    }
  };

  const handleSelectAdminQuick = (adm: Admin) => {
    setEmail(adm.email);
    setAuthStatus('idle');
    setStatusMessage(null);
    setIsOfficerModalOpen(false);
  };

  const handleRegisterNewOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) return;

    try {
      await db.addAdmin({
        name: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim().toLowerCase(),
        is_developer: false,
        role_title: newRole,
      });

      setEmail(newEmail.trim().toLowerCase());
      setIsAddOfficerOpen(false);
      setIsOfficerModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      loadAdmins();
      setAuthStatus('idle');
      setStatusMessage('Backup officer added successfully. You can now request an OTP.');
    } catch (err: unknown) {
      setAuthStatus('failed');
      setStatusMessage(err instanceof Error ? err.message : 'Failed to register officer.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10 pb-24">
      {/* 1. PUBLIC TRANSPARENCY NOTICE BANNER FOR PLAYERS */}
      <div className="mb-6 p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 shadow-xs transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
            <Eye className="w-5 h-5 text-emerald-800 dark:text-emerald-200" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-800 dark:bg-emerald-700 text-white">
                {isKn ? 'ಆಟಗಾರರ ಗಮನಕ್ಕೆ' : 'Notice for Players'}
              </span>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                {isKn ? 'ಯಾವುದೇ ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ!' : 'No Login Required for Players!'}
              </span>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              {isKn
                ? 'ಆಟಗಾರರು, ಗ್ರಾಮಸ್ಥರು ಮತ್ತು ವೀಕ್ಷಕರು ಎಲ್ಲಾ ಲೆಕ್ಕಪತ್ರಗಳು, ಆಟಗಾರರ ಪಟ್ಟಿ, ತಿಂಗಳ ಫಂಡ್ ಮತ್ತು ಸಾಲದ ವಿವರಗಳನ್ನು ಮುಕ್ತವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು. ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ಸಾರ್ವಜನಿಕ ವಿವರ ವೀಕ್ಷಿಸಿ.'
                : 'Players and village members do not need to log in or remember passwords. All finance records and player profiles are 100% public and open for transparent viewing.'}
            </p>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <Link
                to="/directory"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>{isKn ? 'ಸಾರ್ವಜನಿಕ ಆಟಗಾರರ ಪಟ್ಟಿಗೆ ಹೋಗಿ' : 'Go to Public Directory'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-200 text-xs font-semibold transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{t.userGuide}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRulesOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-200 text-xs font-semibold transition-colors"
              >
                <ScrollText className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>{t.rulesAndRegulations}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADMIN AUTHENTICATION CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        {/* Header with Official Animated KMPL Logo */}
        <div className="text-center flex flex-col items-center">
          <KmplLogo size="lg" withGlow withFloat className="mb-2" />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>{isKn ? 'ಅಧಿಕೃತ ಸಮಿತಿಗೆ ಮಾತ್ರ' : 'Admin Portal'}</span>
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.login}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {isKn
              ? 'ಹಣ ಸಂಗ್ರಹಣೆ, ಬಡ್ಡಿ ಚಿಟ್ಟಿ ಸಾಲ ನೀಡಿಕೆ ಮತ್ತು ತಿಂಗಳು ಲಾಕ್ ಮಾಡಲು ಅಧಿಕೃತ ಅಧಿಕಾರಿಗಳು ಮಾತ್ರ ರುಜುವಾತು ನಮೂದಿಸಿ ಲಾಗಿನ್ ಆಗಿ.'
              : 'Enter authorized officer email & 6-digit credentials to access data entry, loan disbursement, and audit lock controls.'}
          </p>
        </div>

        {/* ACTIVE SESSION STATUS (IF ALREADY SIGNED IN) */}
        {isAdmin && currentAdmin && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-amber-800 dark:text-amber-200" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-emerald-950">
                  Active Admin Session
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {adminDisplayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {currentAdmin.email}
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1.5">
                  To prevent unauthorized changes by casual viewers or players, click "Lock & Exit" when done.
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                  >
                    Lock & Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUTHENTICATION STATUS FEEDBACK BANNER */}
        {authStatus === 'failed' && (
          <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase text-[11px] tracking-wide text-rose-700 dark:text-rose-400 block mb-0.5">
                  {isKn ? '❌ ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ (Authentication Failed)' : '❌ Authentication Failed'}
                </span>
                <p className="text-xs font-medium leading-relaxed">
                  {statusMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {authStatus === 'success' && (
          <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 text-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase text-[11px] tracking-wide text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  {isKn ? '✅ ದೃಢೀಕರಣ ಯಶಸ್ವಿಯಾಗಿದೆ (Authentication Successful)' : '✅ Authentication Successful'}
                </span>
                <p className="text-xs font-semibold leading-relaxed">
                  {statusMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Officer Quick Picker Button */}
        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => setIsOfficerModalOpen(true)}
            className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.selectAdmin} ({adminsList.length} registered)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={() => setIsAddOfficerOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100/90 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between transition-colors min-h-[40px]"
          >
            <div className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Add Co-Officer / Backup Admin</span>
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">Anytime</span>
          </button>
        </div>

        {/* Step 1: Email Form */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Officer Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authStatus !== 'idle') setAuthStatus('idle');
                  }}
                  placeholder="e.g. sudeepaml63@gmail.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Only emails in the authorized committee list will receive credentials and be granted access.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking Admin Authorization...</span>
                </>
              ) : (
                <span>Send 6-Digit OTP</span>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: 6-Digit OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t.otpSentMessage}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">{email}</p>
                  {otpInfo && <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">{otpInfo}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t.enterOtp}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value.replace(/\D/g, ''));
                    if (authStatus !== 'idle') setAuthStatus('idle');
                  }}
                  placeholder="6-digit code"
                  autoFocus
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-center text-lg tracking-[0.4em] font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>{t.verifyAndLogin}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setToken('');
                setAuthStatus('idle');
                setStatusMessage(null);
              }}
              className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1"
            >
              Change Email Address
            </button>
          </form>
        )}

        {/* Quick Officer Demo/Testing List */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-2">
            Registered Committee Members (Quick Autofill):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {adminsList.slice(0, 4).map((adm) => (
              <button
                key={adm.id}
                type="button"
                onClick={() => handleSelectAdminQuick(adm)}
                className="text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {adm.is_developer ? '👑 ' : ''}{adm.name}
                  </span>
                  {adm.is_developer && (
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1 rounded">Dev</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate block">
                  {adm.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registered Officers Modal */}
      {isOfficerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{t.adminOfficerList}</span>
              </div>
              <button
                onClick={() => setIsOfficerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Select an authorized tournament officer or add a backup admin below.
            </p>

            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {adminsList.map((admin) => (
                <button
                  key={admin.id}
                  onClick={() => handleSelectAdminQuick(admin)}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700 transition-colors flex items-center justify-between group min-h-[50px]"
                >
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-900 dark:group-hover:text-emerald-300">
                        {admin.is_developer ? '👑 ' : ''}{admin.name}
                      </span>
                      {admin.is_developer && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 rounded">
                          Dev
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 font-mono block">
                      {admin.email}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:underline">
                    Pick
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsOfficerModalOpen(false);
                  setIsAddOfficerOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Register New Backup Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Co-Admin Modal */}
      {isAddOfficerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                <UserPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Add Backup Co-Admin</span>
              </div>
              <button
                onClick={() => setIsAddOfficerOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Add another trusted tournament officer so data entry can happen even when you are unavailable.
            </p>

            <form onSubmit={handleRegisterNewOfficer} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. ramesh.kmpl@gmail.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Co-Treasurer"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOfficerOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors min-h-[44px]"
                >
                  Add Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Rules Modal */}
      <RulesRegulationsModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
};
