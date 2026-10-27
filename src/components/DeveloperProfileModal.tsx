/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Developer Profile Modal for Sudeepa ML.
 * Displays developer background, system architecture credentials,
 * and prominent link to portfolio website: https://portfolio-eight-tan-qeciqgq52g.vercel.app/
 */

import React from 'react';
import { DEVELOPER_INFO } from '../lib/database';
import { KmplLogo } from './KmplLogo';
import { X, ExternalLink, Phone, Mail, Award, Code2, Globe, ShieldCheck } from 'lucide-react';

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperProfileModal: React.FC<DeveloperProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative overflow-hidden">
        {/* Top gold badge header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300/80">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>KMPL Lead Developer & System Creator</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Developer Avatar & Name */}
        <div className="mt-5 text-center flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-600 to-teal-800 p-1 shadow-lg ring-4 ring-amber-100">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-2xl">
                👑
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white">
              <Code2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="mt-3 text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Sudeepa ML</span>
            <span className="text-amber-500 text-sm">✓</span>
          </h2>
          <p className="text-xs text-emerald-800 font-bold mt-0.5">
            Full-Stack Software Engineer & KMPL Architect
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            Kagalagere Megala Hatti, Karnataka
          </p>
        </div>

        {/* Bio summary */}
        <p className="mt-4 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed text-center">
          {DEVELOPER_INFO.bio}
        </p>

        {/* Contact info strip */}
        <div className="mt-4 space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-sans">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Direct Phone:
            </span>
            <a
              href={`tel:${DEVELOPER_INFO.phone}`}
              className="text-emerald-700 font-bold hover:underline"
            >
              +91 {DEVELOPER_INFO.phone}
            </a>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-sans">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address:
            </span>
            <a
              href={`mailto:${DEVELOPER_INFO.email}`}
              className="text-emerald-700 font-bold hover:underline"
            >
              {DEVELOPER_INFO.email}
            </a>
          </div>
        </div>

        {/* Prominent Portfolio Button */}
        <div className="mt-5 space-y-2">
          <a
            href={DEVELOPER_INFO.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <Globe className="w-4 h-4" />
            <span>Visit Developer Portfolio Website</span>
            <ExternalLink className="w-4 h-4 ml-0.5" />
          </a>

          <p className="text-[10px] text-center text-slate-400 font-mono">
            {DEVELOPER_INFO.portfolioUrl}
          </p>
        </div>
      </div>
    </div>
  );
};
