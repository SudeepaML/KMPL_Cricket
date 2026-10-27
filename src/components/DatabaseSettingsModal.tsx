/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Database Settings Modal to configure or verify Supabase connection.
 */

import React, { useState } from 'react';
import { isSupabaseConfigured, currentSupabaseUrl, updateSupabaseCredentials } from '../lib/supabase';
import { X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(currentSupabaseUrl || '');
  const [key, setKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('kmpl_supabase_key') || '' : ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(url, key);
    setSavedSuccess(true);
  };

  const handleResetToDemo = () => {
    updateSupabaseCredentials('', '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="font-bold text-slate-900 text-lg">Database Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-start gap-2.5">
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {isSupabaseConfigured ? 'Connected to Live Supabase' : 'Interactive Local Simulation Mode'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSupabaseConfigured
                  ? `Active Host: ${currentSupabaseUrl}`
                  : 'Running locally with full offline simulation and reactive storage.'}
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Supabase Public Anon Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          {savedSuccess && (
            <p className="text-xs font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg text-center">
              Settings updated! Reloading application...
            </p>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Save & Connect Supabase</span>
            </button>

            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleResetToDemo}
                className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Interactive Demo Store</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
