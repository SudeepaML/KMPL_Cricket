/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Database Settings Modal to configure or verify Supabase connection.
 * Includes step-by-step instructions to create your Supabase project,
 * execute the tournament schema, and enable Email OTP authentication.
 */

import React, { useState } from 'react';
import { isSupabaseConfigured, currentSupabaseUrl, updateSupabaseCredentials } from '../lib/supabase';
import { X, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ExternalLink, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showGuide, setShowGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(url, key);
    setSavedSuccess(true);
  };

  const handleResetToDemo = () => {
    updateSupabaseCredentials('', '');
  };

  const handleCopySqlInstruction = () => {
    navigator.clipboard.writeText(`-- KMPL CRICKET TOURNAMENT SUPABASE SCHEMA
create extension if not exists "uuid-ossp";

-- Table: admins
create table if not exists public.admins (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text not null,
    email text unique not null,
    is_developer boolean default false,
    role_title text default 'Tournament Officer',
    created_at timestamptz default now()
);

alter table public.admins enable row level security;
create policy "Public can view admins" on public.admins for select using (true);
create policy "Admins can manage admins" on public.admins for all using (true);

-- Seed Admins
insert into public.admins (name, phone, email, is_developer, role_title)
values 
    ('Developer Sudeepa ML', '7760880282', 'mlsudeep63@gmail.com', true, 'Lead Developer & Officer'),
    ('Developer Sudeepa ML (Alternate)', '7760880282', 'sudeepaml63@gmail.com', true, 'Lead Developer & Officer'),
    ('Kiran Kumar (President)', '9900112233', 'kirankumar.kmpl@gmail.com', false, 'President & Co-Admin'),
    ('Manjunath H (Treasurer)', '9844556677', 'manjunath.treasurer@gmail.com', false, 'Treasurer & Co-Admin')
on conflict (email) do update 
set name = excluded.name, phone = excluded.phone, is_developer = excluded.is_developer, role_title = excluded.role_title;
`);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">Supabase Database Setup</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2.5">
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {isSupabaseConfigured ? 'Connected to Live Supabase' : 'Supabase Not Connected Yet'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono break-all">
                {isSupabaseConfigured
                  ? `Active Host: ${currentSupabaseUrl}`
                  : 'Connect your Supabase project to enable real email OTP dispatch and persistent cloud database.'}
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Supabase Setup Guide Toggle */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>How to connect your Supabase project in 3 steps</span>
            </div>
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showGuide && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-3">
              <div>
                <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">
                  Step 1: Create a Supabase Project
                </strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 font-bold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a> and create a new project.
                </p>
              </div>

              <div>
                <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">
                  Step 2: Run SQL Schema
                </strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-1.5">
                  In your Supabase Dashboard, go to <strong>SQL Editor</strong> &gt; <strong>New Query</strong>, paste the contents of <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">supabase_schema.sql</code> (included in this repository), and click <strong>Run</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleCopySqlInstruction}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Schema info copied!' : 'Copy schema instructions'}</span>
                </button>
              </div>

              <div>
                <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">
                  Step 3: Enable Email OTP Auth & Copy API Keys
                </strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  1. Under <strong>Authentication &gt; Providers &gt; Email</strong>, ensure Email provider is <strong>Enabled</strong>.<br />
                  2. Under <strong>Project Settings &gt; API</strong>, copy your <strong>Project URL</strong> and <strong>anon public key</strong>, then paste them below!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Supabase Project URL *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Supabase Public Anon Key *
            </label>
            <input
              type="password"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white outline-none font-mono"
            />
          </div>

          {savedSuccess && (
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-center animate-in fade-in">
              Credentials saved successfully! Reloading connection...
            </p>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Save & Connect Supabase</span>
            </button>

            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleResetToDemo}
                className="w-full h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Credentials</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
