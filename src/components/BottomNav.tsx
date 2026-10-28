/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mobile Bottom Navigation Bar.
 * Strictly enforces 44px+ touch targets and ergonomic thumb-zone positioning.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, CircleDollarSign, BarChart3, MessageSquare, Lock, Megaphone } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/chat', label: t.chat, icon: MessageSquare },
    { to: '/announcements', label: t.announcements, icon: Megaphone },
    { to: '/directory', label: t.directory, icon: Users },
    { to: '/fund', label: t.monthlyFund, icon: Calendar },
    { to: '/baddi', label: t.baddiChitti, icon: CircleDollarSign },
    { to: '/report', label: t.cumulativeReport, icon: BarChart3 },
    { to: '/admin/login', label: t.login, icon: Lock },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg safe-bottom transition-colors duration-200">
      <nav className="grid grid-cols-7 items-center h-16 max-w-xl mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center min-h-[48px] py-1 transition-all
                ${
                  isActive
                    ? 'text-emerald-700 dark:text-amber-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-100/70 dark:bg-amber-400/15 text-emerald-800 dark:text-amber-400'
                        : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-[64px]">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
