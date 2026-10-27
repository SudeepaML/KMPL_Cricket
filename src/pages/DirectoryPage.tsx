/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Player Directory Screen (Player Portal View 1).
 * Features:
 * - Numbered list (1., 2., 3...)
 * - Official animated KMPL Season 01 tournament logo
 * - Dedicated Developer Profile popup for Sudeepa ML with portfolio link
 * - Total member count badge
 * - Crown for admins
 * - Search by Name, KMPL ID or mobile number (fuzzy match)
 * - Alphabetical list modal picker trigger
 * - Profile dialog on tap
 */

import React, { useState, useMemo } from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { Player } from '../types';
import { PlayerProfileModal } from '../components/PlayerProfileModal';
import { DeveloperProfileModal } from '../components/DeveloperProfileModal';
import { AlphabeticalDirectoryModal } from '../components/AlphabeticalDirectoryModal';
import { RulesRegulationsModal } from '../components/RulesRegulationsModal';
import { UserGuideModal } from '../components/UserGuideModal';
import { KmplLogo } from '../components/KmplLogo';
import { formatINR } from '../lib/database';
import { Search, ListFilter, Users, Phone, ChevronRight, Award, Shield, Code2, ExternalLink, ScrollText, BookOpen, Sparkles } from 'lucide-react';

export const DirectoryPage: React.FC = () => {
  const { players, admins, loading, isPlayerAdmin } = useRealtimeData();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isAlphabeticalOpen, setIsAlphabeticalOpen] = useState(false);
  const [isDevProfileOpen, setIsDevProfileOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Filter players based on name, KMPL ID, or phone
  const filteredPlayers = useMemo(() => {
    if (!searchTerm.trim()) return players;
    const q = searchTerm.toLowerCase().trim();
    return players.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchId = p.kmpl_id.toLowerCase().includes(q);
      const matchPhone = p.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
      return matchName || matchId || matchPhone;
    });
  }, [players, searchTerm]);

  const handlePlayerClick = (player: Player) => {
    if (player.phone.includes('7760880282') || player.name.toLowerCase().includes('sudeepa')) {
      setIsDevProfileOpen(true);
    } else {
      setSelectedPlayer(player);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Tournament Hero Card with Official Animated Logo */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-5 sm:p-6 text-white shadow-lg mb-6 border border-emerald-800/80 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <KmplLogo size="md" withGlow withFloat className="shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950">
                Season 01 Official Portal
              </span>
              <button
                onClick={() => setIsDevProfileOpen(true)}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
              >
                <Code2 className="w-3 h-3 text-amber-300" />
                <span>Developer Sudeepa ML</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.appTitle}
            </h1>
            <p className="text-xs text-emerald-200/90 dark:text-emerald-300/90 mt-0.5 max-w-xl">
              Kagalagere Megala Hatti Premier League transparent village cricket finance tracker, member contributions, and Baddi Chitti ledgers.
            </p>
          </div>
        </div>
      </div>

      {/* Directory Sub-Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.directory}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <Users className="w-3.5 h-3.5" />
              <span>{players.length} {t.totalMembers}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tap on any player to inspect tier, monthly contribution, or developer portfolio.
          </p>
        </div>

        {/* Action Buttons: A-Z Index Picker, Rules, Guide */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRulesOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs sm:text-sm font-bold transition-colors shadow-2xs min-h-[44px]"
          >
            <ScrollText className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>{t.rulesAndRegulations}</span>
          </button>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs sm:text-sm font-bold transition-colors shadow-2xs min-h-[44px]"
          >
            <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{t.userGuide}</span>
          </button>

          <button
            onClick={() => setIsAlphabeticalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors shadow-xs shrink-0 min-h-[44px]"
          >
            <ListFilter className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>A-Z Index</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-xs outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Players List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No members match your search</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try searching by first name, KMPL ID or mobile digits.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPlayers.map((player, index) => {
            const isAdmin = isPlayerAdmin(player);
            const isDeveloper = player.phone.includes('7760880282') || player.name.toLowerCase().includes('sudeepa');

            return (
              <button
                key={player.id}
                onClick={() => handlePlayerClick(player)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group min-h-[64px] ${
                  isDeveloper
                    ? 'bg-gradient-to-r from-amber-50/60 dark:from-amber-950/30 to-emerald-50/40 dark:to-emerald-950/20 border-amber-300/80 dark:border-amber-700/80 hover:border-amber-400 shadow-xs'
                    : 'bg-white dark:bg-slate-900 hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Number & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-7 text-xs font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0 text-right">
                    {index + 1}.
                  </span>

                  <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center shrink-0 shadow-2xs ${
                    isDeveloper
                      ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-emerald-950 font-black ring-2 ring-amber-300'
                      : isAdmin
                      ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-emerald-950 font-black'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300'
                  }`}>
                    {isDeveloper ? '👑' : player.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-900 dark:group-hover:text-emerald-400 truncate">
                        {player.name}
                      </span>
                      {isDeveloper ? (
                        <span className="text-xs font-black text-amber-900 dark:text-amber-200 bg-amber-200/90 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-md shrink-0 inline-flex items-center gap-0.5 border border-amber-300 dark:border-amber-700">
                          👑 Lead Developer
                        </span>
                      ) : isAdmin ? (
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-md shrink-0 inline-flex items-center gap-0.5">
                          👑 Admin
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{player.kmpl_id}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span className="font-mono">{player.phone}</span>
                      </span>
                      <span>·</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {player.type === 'Senior' ? 'Senior ₹200' : 'Junior ₹100'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount & Chevron */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    {isDeveloper ? (
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <span>Portfolio</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    ) : (
                      <>
                        <span className="block font-bold text-slate-900 dark:text-white font-mono text-sm">
                          {formatINR(player.monthly_amount)}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                          / month
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <PlayerProfileModal
        player={selectedPlayer}
        isAdminMember={selectedPlayer ? isPlayerAdmin(selectedPlayer) : false}
        onClose={() => setSelectedPlayer(null)}
      />

      <DeveloperProfileModal
        isOpen={isDevProfileOpen}
        onClose={() => setIsDevProfileOpen(false)}
      />

      <AlphabeticalDirectoryModal
        isOpen={isAlphabeticalOpen}
        players={players}
        onSelectPlayer={(p) => handlePlayerClick(p)}
        onClose={() => setIsAlphabeticalOpen(false)}
      />

      {/* Rules & Regulations Modal */}
      <RulesRegulationsModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
