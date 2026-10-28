import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/database';
import { Admin } from '../types';
import { KmplLogo } from '../components/KmplLogo';
import { UserGuideModal } from '../components/UserGuideModal';
import { RulesRegulationsModal } from '../components/RulesRegulationsModal';
import { DatabaseSettingsModal } from '../components/DatabaseSettingsModal';
import {
  Shield,
  Mail,
  KeyRound,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BookOpen,
  ScrollText,
  Lock,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Database,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const {
    isAdmin,
    sendOtp,
    verifyOtp,
    pendingEmail,
    setPendingEmail,
    currentAdmin,
    adminDisplayName,
    signOut,
    isSupabaseConnected,
  } = useAuth();
  const { t, language } = useLanguage();
  const isKn = language === 'kn';
  const navigate = useNavigate();

  // Admin selection & credentials
  const [adminsList, setAdminsList] = useState<Admin[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);

  // Authentication Status Feedback State
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modals for public guides / rules / db setup
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState(false);

  // Fetch authorized admins list on mount so any newly added admins are immediately available
  useEffect(() => {
    let isMounted = true;
    const fetchAdmins = async () => {
      try {
        const list = await db.getAdmins();
        if (isMounted) {
          setAdminsList(list);
          if (list.length > 0 && !pendingEmail) {
            // Default to primary developer or first officer in list
            const initialAdmin = list.find((a) => a.is_developer) || list[0];
            setSelectedAdminId(initialAdmin.id);
            setSelectedAdmin(initialAdmin);
            setEmail(initialAdmin.email);
          }
        }
      } catch (err) {
        console.warn('Failed to load registered admins for selector:', err);
      }
    };

    fetchAdmins();

    return () => {
      isMounted = false;
    };
  }, [pendingEmail]);

  useEffect(() => {
    if (pendingEmail) {
      setEmail(pendingEmail);
      setStep('otp');
      // Match with known admin
      const match = adminsList.find(
        (a) => a.email.toLowerCase() === pendingEmail.toLowerCase()
      );
      if (match) {
        setSelectedAdminId(match.id);
        setSelectedAdmin(match);
      }
    }
  }, [pendingEmail, adminsList]);

  const handleSelectAdmin = (adminId: string) => {
    setSelectedAdminId(adminId);
    if (authStatus !== 'idle') setAuthStatus('idle');

    if (adminId === 'custom') {
      setSelectedAdmin(null);
      setEmail('');
    } else {
      const match = adminsList.find((a) => a.id === adminId);
      if (match) {
        setSelectedAdmin(match);
        setEmail(match.email);
      }
    }
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (authStatus !== 'idle') setAuthStatus('idle');

    const clean = newEmail.trim().toLowerCase();
    const match = adminsList.find((a) => a.email.toLowerCase() === clean);
    if (match) {
      setSelectedAdmin(match);
      setSelectedAdminId(match.id);
    } else if (selectedAdminId !== 'custom') {
      setSelectedAdminId('custom');
      setSelectedAdmin(null);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthStatus('failed');
      setStatusMessage(
        isKn
          ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಅಧಿಕೃತ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.'
          : 'Please select an officer or enter a valid registered email address.'
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
      setAuthStatus('idle');
      setStatusMessage(null);
    } else {
      setAuthStatus('failed');
      setStatusMessage(
        res.error ||
          (isKn
            ? 'ಇಮೇಲ್‌ಗೆ ಒಟಿಪಿ ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ. ಅಧಿಕೃತ ಇಮೇಲ್ ಮಾತ್ರ ಲಾಗಿನ್ ಆಗಬಹುದು.'
            : 'Failed to send OTP code. Only registered officer emails can log in.')
      );
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = token.trim();

    if (cleanToken.length !== 6) {
      setAuthStatus('failed');
      setStatusMessage(
        isKn
          ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್‌ನಲ್ಲಿರುವ 6-ಅಂಕಿಯ ಒಟಿಪಿ ಕೋಡ್ ನಮೂದಿಸಿ.'
          : 'Please enter the complete 6-digit OTP code sent to your email.'
      );
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
          ? 'ದೃಢೀಕರಣ ಯಶಸ್ವಿಯಾಗಿದೆ! ಅಡ್ಮಿನ್ ಪೋರ್ಟಲ್‌ಗೆ ಕರೆದೊಯ್ಯಲಾಗುತ್ತಿದೆ...'
          : 'Authentication Successful! Opening Admin Portal...'
      );
      setTimeout(() => {
        navigate('/admin');
      }, 600);
    } else {
      setAuthStatus('failed');
      setStatusMessage(
        res.error ||
          (isKn
            ? 'ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ: ತಪ್ಪಾದ ಒಟಿಪಿ ಕೋಡ್. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ.'
            : 'Authentication Failed: Invalid 6-digit OTP code. Please check your email inbox.')
      );
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setAuthStatus('idle');
    setStatusMessage(null);
    const res = await sendOtp(email.trim().toLowerCase());
    setLoading(false);
    if (res.success) {
      setStatusMessage(
        isKn
          ? 'ಹೊಸ ಒಟಿಪಿ ಕೋಡ್ ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.'
          : 'A new 6-digit OTP code has been dispatched to your email.'
      );
    } else {
      setAuthStatus('failed');
      setStatusMessage(res.error || 'Failed to resend code.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10 pb-24">
      {/* 1. PUBLIC TRANSPARENCY NOTICE BANNER FOR PLAYERS */}
      <div className="mb-6 p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 shadow-xs transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-emerald-800 dark:text-emerald-200" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-800 dark:bg-emerald-700 text-white">
                {isKn ? 'ಆಟಗಾರರ ಗಮನಕ್ಕೆ' : 'Notice for Players'}
              </span>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                {isKn ? 'ಆಟಗಾರರಿಗೆ ಯಾವುದೇ ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ!' : 'No Login Required for Players!'}
              </span>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              {isKn
                ? 'ಆಟಗಾರರು, ಗ್ರಾಮಸ್ಥರು ಮತ್ತು ವೀಕ್ಷಕರು ಎಲ್ಲಾ ಲೆಕ್ಕಪತ್ರಗಳು, ಆಟಗಾರರ ಪಟ್ಟಿ, ಮಾಸಿಕ ಫಂಡ್ ಮತ್ತು ಬಡ್ಡಿ ಚಿಟ್ಟಿ ಸಾಲಗಳನ್ನು ಮುಕ್ತವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು. ಅಡ್ಮಿನ್ ಲಾಗಿನ್ ಕೇವಲ ಹಣ ಸಂಗ್ರಹಣೆ ದಾಖಲಿಸುವ ಸಮಿತಿ ಅಧಿಕಾರಿಗಳಿಗೆ ಮಾತ್ರ.'
                : 'Players and village members do not need to log in! All finance records, player profiles, and loan balances are 100% public for transparent viewing. Only authorized officers sign in via Email OTP to record payments.'}
            </p>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <Link
                to="/directory"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>{isKn ? 'ಸಾರ್ವಜನಿಕ ಆಟಗಾರರ ಪಟ್ಟಿ' : 'Go to Public Directory'}</span>
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
              <Lock className="w-3.5 h-3.5" />
              <span>{isKn ? 'ಅಧಿಕೃತ ಸಮಿತಿಗೆ ಮಾತ್ರ' : 'Admin Portal'}</span>
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isKn ? 'ಅಡ್ಮಿನ್ ಇಮೇಲ್ ಒಟಿಪಿ ಲಾಗಿನ್' : 'Admin Email OTP Login'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {isKn
              ? 'ಅಡ್ಮಿನ್ ಹೆಸರು ಮತ್ತು ನೋಂದಾಯಿತ ಇಮೇಲ್ ಆಯ್ಕೆಮಾಡಿ, ಇಮೇಲ್‌ಗೆ ಬರುವ 6-ಅಂಕಿಯ ಒಟಿಪಿ ನಮೂದಿಸಿ ಪೋರ್ಟಲ್‌ಗೆ ಲಾಗಿನ್ ಆಗಿ.'
              : 'Select your Admin Name and Email, then enter the 6-digit OTP sent to your inbox to log in.'}
          </p>

          {/* DATABASE CONNECTION STATUS: Shows ONLY connected or not (no inner technical information) */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Database:</span>
            <span
              className={`font-bold ${
                isSupabaseConnected
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isSupabaseConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
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
                  Active Officer Session
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {adminDisplayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {currentAdmin.email} • {currentAdmin.phone}
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1.5">
                  An active admin session is open on this device.
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t.lockAndExit}</span>
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
                  {isKn ? '❌ ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ (Access Denied)' : '❌ Access Denied'}
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
                  {isKn ? '✅ ದೃಢೀಕರಣ ಯಶಸ್ವಿಯಾಗಿದೆ' : '✅ Authentication Successful'}
                </span>
                <p className="text-xs font-semibold leading-relaxed">
                  {statusMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Select Admin Name & Email, then dispatch OTP */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
            {/* Admin Name Selection Dropdown (includes all current & future registered admins) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>{isKn ? 'ಅಡ್ಮಿನ್ ಹೆಸರು ಆಯ್ಕೆಮಾಡಿ' : '1. Select Admin Name'}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold normal-case">
                  {adminsList.length} {isKn ? 'ನೋಂದಾಯಿತ ಅಧಿಕಾರಿಗಳು' : 'Officers Registered'}
                </span>
              </label>

              <div className="relative">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-3.5 pointer-events-none" />
                <select
                  value={selectedAdminId}
                  onChange={(e) => handleSelectAdmin(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer appearance-none"
                >
                  <option value="" disabled>
                    -- {isKn ? 'ಅಡ್ಮಿನ್ ಹೆಸರು ಆಯ್ಕೆಮಾಡಿ' : 'Choose Admin / Officer'} --
                  </option>
                  {adminsList.map((adm) => (
                    <option key={adm.id} value={adm.id}>
                      {adm.is_developer ? '👑 ' : '🛡️ '}
                      {adm.name} {adm.role_title ? `(${adm.role_title})` : ''}
                    </option>
                  ))}
                  <option value="custom">
                    ✏️ {isKn ? 'ಬೇರೆ ನೋಂದಾಯಿತ ಇಮೇಲ್ ನಮೂದಿಸಿ...' : 'Enter another registered email...'}
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Officer Profile Preview Card if an Admin is selected */}
            {selectedAdmin && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center justify-center font-bold text-base shrink-0">
                    {selectedAdmin.is_developer ? '👑' : <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 dark:text-white truncate">
                      {selectedAdmin.name}
                    </p>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium truncate">
                      {selectedAdmin.role_title || (selectedAdmin.is_developer ? 'Lead Developer' : 'Tournament Officer')}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-emerald-700 text-white shrink-0">
                  Authorized
                </span>
              </div>
            )}

            {/* Email Address Input (linked to selected admin) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>{isKn ? '2. ಅಧಿಕೃತ ಇಮೇಲ್ ವಿಳಾಸ' : '2. Admin Registered Email'}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {isKn ? 'ಒಟಿಪಿ ಸ್ವೀಕರಿಸಲು' : 'Receives OTP'}
                </span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="e.g. mlsudeep63@gmail.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 font-mono font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {isKn
                  ? 'ಮೇಲಿನ ಅಡ್ಮಿನ್ ಇಮೇಲ್‌ಗೆ 6-ಅಂಕಿಯ ಒಟಿಪಿ ಕೋಡ್ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.'
                  : 'A secure 6-digit OTP code will be sent to this registered officer email inbox.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isKn ? 'ಒಟಿಪಿ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Dispatching OTP to Email...'}</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>{isKn ? 'ಇಮೇಲ್‌ಗೆ 6-ಅಂಕಿಯ ಒಟಿಪಿ ಕಳುಹಿಸಿ' : 'Send 6-Digit OTP to Email'}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: Enter 6-Digit OTP Received in Email & Login */
          <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedAdmin ? selectedAdmin.name : 'Authorized Officer'}
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono mt-0.5 font-semibold">
                    {email}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1.5">
                    {isKn
                      ? 'ನಿಮ್ಮ ಇಮೇಲ್ ಇನ್‌ಬಾಕ್ಸ್ ಅಥವಾ ಸ್ಪ್ಯಾಮ್ ಫೋಲ್ಡರ್‌ಗೆ ಕಳುಹಿಸಲಾದ 6-ಅಂಕಿಯ ಒಟಿಪಿ ಕೋಡ್ ನಮೂದಿಸಿ.'
                      : 'Please enter the 6-digit verification code received in your email inbox.'}
                  </p>
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
                  placeholder="------"
                  autoFocus
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-center text-xl tracking-[0.5em] font-mono font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {isKn
                  ? '6-ಅಂಕಿಯ ಒಟಿಪಿ ನಮೂದಿಸಿ ಲಾಗಿನ್ ಬಟನ್ ಒತ್ತಿ.'
                  : 'Enter the 6-digit OTP and click Login to enter portal.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isKn ? 'ಒಟಿಪಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Verifying OTP...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>{isKn ? 'ದೃಢೀಕರಿಸಿ ಮತ್ತು ಪೋರ್ಟಲ್‌ಗೆ ಲಾಗಿನ್ ಆಗಿ' : 'Verify OTP & Login to Portal'}</span>
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setToken('');
                  setAuthStatus('idle');
                  setStatusMessage(null);
                  setPendingEmail(null);
                }}
                className="hover:text-slate-800 dark:hover:text-slate-200 underline py-1 cursor-pointer font-medium"
              >
                ← {isKn ? 'ಅಡ್ಮಿನ್ ಬದಲಾಯಿಸಿ' : 'Change Officer / Email'}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold py-1 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isKn ? 'ಮರುಕಳುಹಿಸಿ' : 'Resend Code'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Security Audit Footer */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            🛡️ <strong>KMPL Security Policy</strong>: To ensure 100% financial transparency and prevent unauthorized changes by players, data entry permissions are strictly granted only after Supabase Email OTP verification.
          </p>

          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-center">
            <button
              type="button"
              onClick={() => setIsDbSettingsOpen(true)}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Configure Supabase Credentials (Admin Setup)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Settings Modal */}
      <DatabaseSettingsModal
        isOpen={isDbSettingsOpen}
        onClose={() => setIsDbSettingsOpen(false)}
      />

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

