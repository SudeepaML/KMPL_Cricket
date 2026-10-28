/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mobile grouped navigation with thumb-friendly portal menus.
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, CircleDollarSign, BarChart3, MessageSquare, Shield, Megaphone, ChevronUp, ScrollText } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<'community' | 'player' | 'admin' | null>(null);

  const groups = [
    { id: 'community' as const, label: 'Community', icon: MessageSquare, active: ['/chat', '/announcements'].includes(location.pathname) },
    { id: 'player' as const, label: 'Player Portal', icon: Users, active: ['/directory', '/fund', '/baddi', '/report'].includes(location.pathname) || location.pathname.startsWith('/fund/') },
    { id: 'admin' as const, label: 'Admin Portal', icon: Shield, active: location.pathname.startsWith('/admin') },
  ];

  const links = {
    community: [
      { to: '/chat', label: t.chat, icon: MessageSquare },
      { to: '/announcements', label: t.announcements, icon: Megaphone },
    ],
    player: [
      { to: '/directory', label: t.directory, icon: Users },
      { to: '/fund', label: t.monthlyFund, icon: Calendar },
      { to: '/baddi', label: t.baddiChitti, icon: CircleDollarSign },
      { to: '/report', label: t.cumulativeReport, icon: BarChart3 },
    ],
    admin: isAdmin
      ? [
          { to: '/admin', label: 'Dashboard', icon: Shield },
          { to: '/admin/collect', label: 'Monthly Fund', icon: Calendar },
          { to: '/admin/baddi', label: 'Baddi Chitti', icon: CircleDollarSign },
          { to: '/admin/players', label: 'Manage Players', icon: Users },
          { to: '/admin/admins', label: 'Manage Admins', icon: Shield },
          { to: '/admin/rules', label: 'Tournament Rules', icon: ScrollText },
        ]
      : [{ to: '/admin/login', label: t.adminPanel, icon: Shield }],
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg safe-bottom">
      {openMenu && (
        <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 max-w-xl mx-auto p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {groups.find((group) => group.id === openMenu)?.label}
            </span>
            <button type="button" onClick={() => setOpenMenu(null)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close menu">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {links[openMenu].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} onClick={() => setOpenMenu(null)} className="flex items-center gap-2 min-h-12 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 text-xs font-bold">
                  <Icon className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <nav className="grid grid-cols-3 items-center h-16 max-w-xl mx-auto px-2">
        {groups.map((group) => {
          const Icon = group.icon;
          const expanded = openMenu === group.id;
          return (
            <button key={group.id} type="button" onClick={() => { if (group.id === 'admin') { setOpenMenu(null); navigate('/admin/login'); } else { setOpenMenu(expanded ? null : group.id); } }} aria-expanded={expanded} className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-colors ${group.active || expanded ? 'text-emerald-700 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
              <span className={`p-1 rounded-lg ${group.active || expanded ? 'bg-emerald-100 dark:bg-amber-400/15' : ''}`}>
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-[11px] leading-tight mt-0.5">{group.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
