/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Developer Authorization Modal.
 * Prompts for the developer phone number to execute security-definer RPC operations:
 * - close_month(month, phone)
 * - delete_admin(admin_id, phone)
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, ShieldAlert, Phone, Loader2 } from 'lucide-react';

interface DeveloperAuthModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: (phone: string) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export const DeveloperAuthModal: React.FC<DeveloperAuthModalProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onClose,
}) => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await onConfirm(phone.trim());
      if (!res.success) {
        setErrorMessage(res.error || 'Authorization failed.');
      } else {
        setPhone('');
        onClose();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Execution error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Developer Protection</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.developerPhonePrompt}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone..."
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Validated securely via server-side PostgreSQL RPC function.
            </p>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>{t.verify}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
