/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Top Bar Header component.
 * Features:
 * - Animated official KMPL logo
 * - 3-zone Top Bar Contract
 * - Developer Profile trigger linking to portfolio website
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { KmplLogo } from './KmplLogo';
import { DeveloperProfileModal } from './DeveloperProfileModal';
import { RulesRegulationsModal } from './RulesRegulationsModal';
import { UserGuideModal } from './UserGuideModal';
import { Database, Globe, Shield, User, Code2, BookOpen, ScrollText, Sun, Moon, Lock, Megaphone } from 'lucide-react';

interface HeaderProps {
  onOpenDbSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDbSettings }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isAdmin, adminDisplayName, signOut, isDeveloper } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-emerald-950/95 dark:bg-slate-900/95 text-white border-b border-emerald-800/80 dark:border-slate-800 shadow-md backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Zone 1: Brand Wordmark with Rich Animated Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 focus:outline-none group">
            <KmplLogo size="sm" withGlow withFloat />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-white whitespace-nowrap leading-none group-hover:text-amber-300 transition-colors">
                {t.appTitle}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-200/90 dark:text-emerald-400/90 whitespace-nowrap font-medium mt-0.5">
                {t.appSubtitle}
              </span>
            </div>
          </Link>

          {/* Zone 2: Desktop grouped portal menus */}
          <nav className="hidden lg:flex items-center gap-2 text-sm font-medium text-emerald-100">
            <div className="relative group">
              <button type="button" className="px-3 py-2 rounded-lg hover:bg-emerald-800/80 dark:hover:bg-slate-800 font-bold">Community ▾</button>
              <div className="hidden group-hover:block group-focus-within:block absolute left-0 top-full pt-2 w-52 z-50">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xl">
                  <Link to="/chat" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Community Chat</Link>
                  <Link to="/announcements" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{t.announcements}</Link>
                </div>
              </div>
            </div>
            <div className="relative group">
              <button type="button" className="px-3 py-2 rounded-lg hover:bg-emerald-800/80 dark:hover:bg-slate-800 font-bold">Player Portal ▾</button>
              <div className="hidden group-hover:block group-focus-within:block absolute left-0 top-full pt-2 w-56 z-50">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xl">
                  <Link to="/directory" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{t.directory}</Link>
                  <Link to="/fund" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{t.monthlyFund}</Link>
                  <Link to="/baddi" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{t.baddiChitti}</Link>
                  <Link to="/report" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{t.cumulativeReport}</Link>
                </div>
              </div>
            </div>
            <div className="relative group">
              <button type="button" className="px-3 py-2 rounded-lg hover:bg-emerald-800/80 dark:hover:bg-slate-800 font-bold">Admin Portal ▾</button>
              <div className="hidden group-hover:block group-focus-within:block absolute right-0 top-full pt-2 w-60 z-50">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xl">
                  {isAdmin ? (
                    <>
                      <Link to="/admin" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Admin Dashboard</Link>
                      <Link to="/admin/collect" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Monthly Fund</Link>
                      <Link to="/admin/baddi" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Baddi Chitti</Link>
                      <Link to="/admin/players" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Manage Players</Link>
                      <Link to="/admin/admins" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Manage Admins</Link>
                      <Link to="/admin/rules" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Tournament Rules</Link>
                    </>
                  ) : (
                    <Link to="/admin/login" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Admin Portal Login</Link>
                  )}
                </div>
              </div>
            </div>
          </nav>
          {/* Zone 3: Actions (Announcements beside Rules, Guide, Developer Profile, DB Settings, Theme, Language, Admin) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Compact mobile information menu; individual controls remain available on desktop. */}
            <div className="relative lg:hidden">
              <button type="button" onClick={() => setIsInfoMenuOpen((open) => !open)} aria-expanded={isInfoMenuOpen} className="p-2 rounded-lg bg-teal-800/80 text-white border border-teal-700/60 text-xs font-bold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Info</span>
              </button>
              {isInfoMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xl z-50">
                  <Link to="/announcements" onClick={() => setIsInfoMenuOpen(false)} className="block p-3 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">{t.announcements}</Link>
                  <button type="button" onClick={() => { setIsRulesModalOpen(true); setIsInfoMenuOpen(false); }} className="block w-full text-left p-3 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">{t.rulesAndRegulations}</button>
                  <button type="button" onClick={() => { setIsGuideModalOpen(true); setIsInfoMenuOpen(false); }} className="block w-full text-left p-3 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">{t.userGuide}</button>
                </div>
              )}
            </div>
            {/* Announcements Button (Universal - beside rules & regulations) */}
            <Link
              to="/announcements"
              className={`hidden lg:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition-colors border items-center gap-1.5 ${
                location.pathname === '/announcements'
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white border-amber-400/40'
              }`}
              title={t.announcements}
              aria-label={t.announcements}
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">{t.announcements}</span>
              <span className="hidden sm:inline md:hidden">Notice</span>
            </Link>

            {/* Rules & Regulations Button (Universal) */}
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="hidden lg:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-teal-800/80 dark:bg-teal-900/80 hover:bg-teal-700/90 text-teal-200 hover:text-white text-xs font-bold transition-colors border border-teal-700/60 dark:border-teal-800 flex items-center gap-1.5"
              title={t.rulesAndRegulations}
              aria-label={t.rulesAndRegulations}
            >
              <ScrollText className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">{t.rulesAndRegulations}</span>
              <span className="hidden sm:inline md:hidden">Rules</span>
            </button>

            {/* User Guide Button (Universal) */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hidden lg:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-800/80 dark:bg-slate-800/90 hover:bg-emerald-700/90 text-emerald-200 hover:text-white text-xs font-bold transition-colors border border-emerald-700/60 dark:border-slate-700 flex items-center gap-1.5"
              title={t.userGuide}
              aria-label={t.userGuide}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">{t.userGuide}</span>
              <span className="hidden sm:inline md:hidden">Guide</span>
            </button>

            {/* Developer Portfolio Button */}
            <button
              onClick={() => setIsDevModalOpen(true)}
              className="order-last lg:order-none p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold transition-colors border border-amber-300/40 flex items-center gap-1 cursor-pointer"
              title="Developer Sudeepa ML Profile & Portfolio"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">Developer</span>
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="order-2 lg:order-none p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-800/80 dark:bg-slate-800 hover:bg-emerald-700 dark:hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all border border-emerald-700/60 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle Dark and Light Mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                  <span className="hidden xl:inline text-amber-200">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-200" />
                  <span className="hidden xl:inline text-amber-100">Dark</span>
                </>
              )}
            </button>

            {/* Bilingual Toggle (EN / ಕನ್ನಡ) */}
            <button
              onClick={toggleLanguage}
              className="order-3 lg:order-none flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-emerald-800/90 dark:bg-slate-800 hover:bg-emerald-700 dark:hover:bg-slate-700 text-xs sm:text-xs font-bold text-white transition-colors border border-emerald-700/60 dark:border-slate-700"
              title="Toggle Language"
              aria-label="Toggle between English and Kannada"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
            </button>

            {/* Admin User / Login Action */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                {/* Supabase Database Settings - strictly inside admin portal session */}
                <button
                  onClick={onOpenDbSettings}
                  title={isSupabaseConfigured ? 'Supabase Connected' : 'Demo Mode (Click to setup Supabase)'}
                  className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    isSupabaseConfigured
                      ? 'bg-emerald-800/90 text-emerald-200 hover:bg-emerald-700 border border-emerald-600/50'
                      : 'bg-amber-400 text-emerald-950 hover:bg-amber-300 border border-amber-300'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {isSupabaseConfigured ? 'Supabase' : 'Setup DB'}
                  </span>
                </button>

                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-xs font-bold transition-all border border-emerald-700/60"
                  title="Open Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate max-w-[120px]">{adminDisplayName}</span>
                </Link>
                <Link
                  to="/admin/login"
                  className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold transition-all shadow-sm"
                  title="Admin Login Screen"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.login}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-xs font-bold text-rose-200 hover:text-white border border-rose-800/60 transition-colors"
                  title="Lock Admin and Sign Out to protect changes"
                >
                  <Lock className="w-3 h-3 text-rose-300" />
                  <span>{t.logout}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs sm:text-xs font-bold transition-all shadow-sm"
                title="Admin Login - Credentials Required"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t.login}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Developer Profile Modal */}
      <DeveloperProfileModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />

      {/* Rules & Regulations Modal */}
      <RulesRegulationsModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </>
  );
};
