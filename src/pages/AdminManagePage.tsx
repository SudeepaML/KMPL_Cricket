/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Manage Officers Screen.
 * Allows adding new tournament officers and deleting officers.
 * STRICT DEVELOPER PROTECTION: Developer Sudeepa ML cannot be deleted by any admin under any circumstances.
 */

import React, { useState } from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { db, DEVELOPER_INFO } from '../lib/database';
import { Admin } from '../types';
import { DeveloperAuthModal } from '../components/DeveloperAuthModal';
import { DeveloperProfileModal } from '../components/DeveloperProfileModal';
import { Shield, UserPlus, Trash2, CheckCircle2, AlertCircle, Phone, Mail, Award, Lock, ExternalLink, Globe } from 'lucide-react';

export const AdminManagePage: React.FC = () => {
  const { admins, refetch } = useRealtimeData();
  const { t } = useLanguage();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  // New admin form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('Tournament Co-Admin');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      await db.addAdmin({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        is_developer: false,
        role_title: roleTitle.trim(),
      });

      setStatusMessage({ type: 'success', text: `Added ${name.trim()} as a tournament officer.` });
      setIsAddModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setTimeout(() => setStatusMessage(null), 3000);
      refetch();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to add administrator.',
      });
    }
  };

  const handleConfirmDelete = async (developerPhone: string) => {
    if (!deleteTarget) return { success: false, error: 'No officer selected.' };

    // Strict developer deletion block
    if (deleteTarget.is_developer) {
      return {
        success: false,
        error: 'The primary Developer Admin (Sudeepa ML) is permanently protected and cannot be deleted.',
      };
    }

    const res = await db.deleteAdminWithDeveloperAuth(deleteTarget.id, developerPhone);
    if (res.success) {
      setStatusMessage({ type: 'success', text: `Officer ${deleteTarget.name} removed successfully.` });
      setTimeout(() => setStatusMessage(null), 3000);
      refetch();
    }
    return res;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Breadcrumb & Navigation */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
        >
          <span>← Back to Admin Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950">
              Admin Portal
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {admins.length} Officers Registered
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.manageAdmins}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered tournament officers with collection, Baddi Chitti, and operational privileges.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors min-h-[44px] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Officer</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
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

      {/* Officers List */}
      <div className="space-y-3">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className={`p-4 sm:p-5 rounded-3xl border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              admin.is_developer
                ? 'bg-gradient-to-r from-amber-50/70 to-emerald-50/50 dark:from-amber-950/30 dark:to-emerald-950/30 border-amber-300 dark:border-amber-700 ring-2 ring-amber-200/60 dark:ring-amber-800/40'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 font-bold ${
                  admin.is_developer
                    ? 'bg-amber-400 text-emerald-950 ring-2 ring-amber-300 shadow-sm'
                    : 'bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                }`}
              >
                {admin.is_developer ? '👑' : <Shield className="w-6 h-6" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                    {admin.name}
                  </h3>
                  {admin.is_developer ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                      <Lock className="w-3 h-3 text-amber-800 dark:text-amber-300" />
                      Protected Primary Developer
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200">
                      {admin.role_title || 'Co-Officer'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{admin.email}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{admin.phone}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {admin.is_developer ? (
                <button
                  onClick={() => setIsDevModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs min-h-[40px] cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Developer Portfolio</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => setDeleteTarget(admin)}
                  className="px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 text-xs font-semibold transition-colors flex items-center gap-1.5 min-h-[40px] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Officer</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Officer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Tournament Officer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authorized officers can log in via Supabase Email OTP to enter tournament data.
            </p>

            <form onSubmit={handleAddOfficer} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name & Designation
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Gowda (Secretary)"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile..."
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address (For Supabase OTP)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@example.com"
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Co-Treasurer"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Save Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Admin Developer Auth Modal */}
      <DeveloperAuthModal
        isOpen={Boolean(deleteTarget)}
        title={`Remove ${deleteTarget?.name}`}
        description="Deleting an officer account requires developer authorization. Enter developer mobile number to confirm."
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Developer Profile Modal */}
      <DeveloperProfileModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />
    </div>
  );
};
