/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Dashboard Screen.
 * Features:
 * - Official animated KMPL Season 01 logo banner
 * - Multi-Admin Co-Officer availability system
 * - Close month audit lock authorized by any registered admin's phone number
 * - Navigation to Collect, Close Month, Baddi Chitti, Players, and Officers
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { db, formatINR, TOURNAMENT_MONTHS, DEVELOPER_INFO } from '../lib/database';
import { DeveloperAuthModal } from '../components/DeveloperAuthModal';
import { DeveloperProfileModal } from '../components/DeveloperProfileModal';
import { KmplLogo } from '../components/KmplLogo';
import {
  CreditCard,
  Lock,
  CircleDollarSign,
  UserPlus,
  Users,
  Shield,
  Eye,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ScrollText,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { currentAdmin, adminDisplayName, isDeveloper, signOut } = useAuth();
  const { t } = useLanguage();
  const { players, admins, stats, closedMonths, refetch } = useRealtimeData();

  const [closeMonthTarget, setCloseMonthTarget] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isAddOfficerOpen, setIsAddOfficerOpen] = useState(false);
  const [isDevProfileOpen, setIsDevProfileOpen] = useState(false);

  // New admin form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Co-Officer / Data Entry Admin');

  // Any registered admin can enter their phone to close/lock a month
  const handleConfirmCloseMonth = async (phone: string) => {
    if (!closeMonthTarget) return { success: false, error: 'No month selected.' };
    const res = await db.closeMonthWithAdminAuth(closeMonthTarget, phone);
    if (res.success) {
      setSuccessMsg(`Successfully closed and locked ${closeMonthTarget}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      refetch();
    }
    return res;
  };

  const handleQuickAddOfficer = async (e: React.FormEvent) => {
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

      setSuccessMsg(`Added ${newName.trim()} as an active tournament co-admin!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsAddOfficerOpen(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      refetch();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add officer');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
      {/* Officer Welcome Banner with Rich Animated Logo */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 border border-emerald-800/80 dark:border-slate-800 relative overflow-hidden transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <KmplLogo size="md" withGlow withFloat />
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-emerald-950">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isDeveloper ? 'Developer Super Admin' : 'Tournament Officer'}</span>
                </span>
                <button
                  onClick={() => setIsDevProfileOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white underline underline-offset-2"
                >
                  <span>Developer Portfolio Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  title="Lock Admin and require credentials to re-enter"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lock & Sign Out</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {adminDisplayName}
              </h1>
              <p className="text-xs text-emerald-200 mt-0.5 font-mono">
                {currentAdmin?.email} · {currentAdmin?.phone}
              </p>
            </div>
          </div>

          <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 dark:border-white/5 text-left md:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">
              Audited Treasury Total
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 block">
              {formatINR(stats.grandTotal)}
            </span>
            <span className="text-[11px] text-emerald-200 block mt-0.5">
              {players.length} members · {admins.length} authorized officers
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Admin Handover & Co-Officer Availability Banner */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-4 sm:p-5 mb-8 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Multi-Admin Availability & Data Entry Handover
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl">
                If an officer is unavailable, any registered co-admin can enter payments and manage loans. You can add more backup officers anytime so data entry is never delayed.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddOfficerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Backup Co-Admin</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Primary Admin Actions Grid */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Financial & Operational Tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action 1: Collect Monthly Fund */}
          <Link
            to="/admin/collect"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-900 dark:group-hover:text-emerald-400">
                {t.collectFund}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Record player fees via Cash or UPI with transaction references.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-3 block">
              Open collection ledger →
            </span>
          </Link>

          {/* Action 2: Baddi Chitti Management */}
          <Link
            to="/admin/baddi"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-amber-900 dark:group-hover:text-amber-400">
                Baddi Chitti (Issue & Repay)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Issue loans (10% interest) or record borrower repayments.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-3 block">
              Manage loan portfolio →
            </span>
          </Link>

          {/* Action 3: Add/Edit Players */}
          <Link
            to="/admin/players"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-900 dark:group-hover:text-blue-400">
                {t.managePlayers}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Register new village players with automatic KMPL ID assignment.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-3 block">
              Manage {players.length} players →
            </span>
          </Link>

          {/* Action 4: Manage Officers */}
          <Link
            to="/admin/admins"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-purple-900 dark:group-hover:text-purple-400">
                {t.manageAdmins}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Add tournament officers or remove officers with phone audit.
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 mt-3 block">
              Manage admin roster ({admins.length} officers) →
            </span>
          </Link>

          {/* Action 5: Close Month (Authorized by Any Registered Admin) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t.closeMonthAction} (Audit Lock)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lock completed month. Any registered admin can authorize using their registered phone number.
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) setCloseMonthTarget(e.target.value);
                }}
                defaultValue=""
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2 py-1.5 outline-none font-medium flex-1"
              >
                <option value="" disabled>Select Month to Lock...</option>
                {TOURNAMENT_MONTHS.map((m) => {
                  const isClosed = closedMonths.some((c) => c.month === m);
                  return (
                    <option key={m} value={m} disabled={isClosed}>
                      {m} {isClosed ? '(Already Closed)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Action 6: Fund Rules & Regulations */}
          <Link
            to="/admin/rules"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ScrollText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-teal-900 dark:group-hover:text-teal-400">
                {t.manageRules}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set and update tournament policies, contribution tiers, and loan regulations shown to all players.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-3 block">
              Configure fund policies →
            </span>
          </Link>
        </div>
      </div>

      {/* Authorized Officers Quick Reference List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs mb-8 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Authorized Tournament Co-Officers ({admins.length})
            </h3>
          </div>
          <button
            onClick={() => setIsAddOfficerOpen(true)}
            className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
          >
            + Add Another Officer
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {admins.map((adm) => (
            <div
              key={adm.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {adm.is_developer ? '👑 ' : ''}{adm.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                  {adm.phone}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono block truncate">
                  {adm.email}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                adm.is_developer ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300'
              }`}>
                {adm.is_developer ? 'Developer' : 'Co-Admin'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Player Portal Views Direct Access */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-emerald-700" />
          <span>Quick Access to Player Transparency Views</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/directory"
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 transition-colors text-center"
          >
            <Users className="w-5 h-5 text-slate-700 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-800 block">Directory</span>
          </Link>
          <Link
            to="/fund"
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 transition-colors text-center"
          >
            <Calendar className="w-5 h-5 text-slate-700 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-800 block">Monthly Fund</span>
          </Link>
          <Link
            to="/baddi"
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 transition-colors text-center"
          >
            <CircleDollarSign className="w-5 h-5 text-slate-700 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-800 block">Baddi Chitti</span>
          </Link>
          <Link
            to="/report"
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 transition-colors text-center"
          >
            <Sparkles className="w-5 h-5 text-slate-700 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-800 block">Grand Total</span>
          </Link>
        </div>
      </div>

      {/* Developer Auth Modal for Closing Month */}
      <DeveloperAuthModal
        isOpen={Boolean(closeMonthTarget)}
        title={`Lock & Close ${closeMonthTarget}`}
        description="Enter the registered phone number of any authorized tournament admin to permanently close and lock this month."
        onConfirm={handleConfirmCloseMonth}
        onClose={() => setCloseMonthTarget(null)}
      />

      {/* Developer Profile Modal */}
      <DeveloperProfileModal
        isOpen={isDevProfileOpen}
        onClose={() => setIsDevProfileOpen(false)}
      />

      {/* Add Backup Officer Modal */}
      {isAddOfficerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Add Backup Officer / Co-Admin
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Authorizes another committee member to enter data and collect funds in case an officer is away.
            </p>

            <form onSubmit={handleQuickAddOfficer} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name & Designation
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Anand Kumar (Co-Admin)"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="10-digit mobile..."
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (For Supabase OTP)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="officer@gmail.com"
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOfficerOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm"
                >
                  Save Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
