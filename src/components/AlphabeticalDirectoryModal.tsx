/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Alphabetical Directory Picker Modal.
 * Organizes village players by alphabet (A-Z) with instant filtering.
 */

import React, { useState, useMemo } from 'react';
import { Player } from '../types';
import { X, Search } from 'lucide-react';

interface AlphabeticalDirectoryModalProps {
  isOpen: boolean;
  players: Player[];
  isPlayerAdmin?: (player: Player) => boolean;
  onSelectPlayer: (player: Player) => void;
  onClose: () => void;
}

export const AlphabeticalDirectoryModal: React.FC<AlphabeticalDirectoryModalProps> = ({
  isOpen,
  players,
  isPlayerAdmin,
  onSelectPlayer,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Group players by first letter
  const grouped = useMemo(() => {
    const map: Record<string, Player[]> = {};
    const filtered = players.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.kmpl_id.toLowerCase().includes(query.toLowerCase())
    );

    filtered.forEach(p => {
      const letter = p.name.charAt(0).toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(p);
    });

    // Sort letters and players within each group
    const sortedKeys = Object.keys(map).sort();
    sortedKeys.forEach(k => {
      map[k].sort((a, b) => a.name.localeCompare(b.name));
    });

    return { map, letters: sortedKeys };
  }, [players, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full h-[80vh] flex flex-col p-5 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Alphabetical Player Index</h3>
            <p className="text-xs text-slate-500">Quickly locate members by initial</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="mt-3 relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedLetter(null);
            }}
            placeholder="Type player name or ID..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Letter Scroller */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 shrink-0 border-b border-slate-100 no-scrollbar">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors shrink-0 ${
              selectedLetter === null
                ? 'bg-emerald-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          {grouped.letters.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-md transition-colors shrink-0 ${
                selectedLetter === letter
                  ? 'bg-emerald-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Player List */}
        <div className="mt-3 overflow-y-auto flex-1 space-y-4 pr-1">
          {grouped.letters.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {players.length === 0 ? 'No players yet' : 'No matching members found.'}
            </div>
          ) : (
            grouped.letters
              .filter(l => selectedLetter === null || selectedLetter === l)
              .map(letter => (
                <div key={letter}>
                  <div className="sticky top-0 bg-slate-100/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-bold text-emerald-900 mb-1.5">
                    {letter}
                  </div>
                  <div className="space-y-1">
                    {grouped.map[letter].map(player => {
                      const isAdmin = isPlayerAdmin ? isPlayerAdmin(player) : false;
                      return (
                        <button
                          key={player.id}
                          onClick={() => {
                            onSelectPlayer(player);
                            onClose();
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between group min-h-[44px] ${
                            isAdmin ? 'bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/50' : 'hover:bg-emerald-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono font-semibold text-slate-400 group-hover:text-emerald-700 shrink-0">
                              {player.kmpl_id}
                            </span>
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900 flex items-center gap-1.5 truncate">
                              <span>{player.name}</span>
                              {isAdmin && (
                                <span className="text-[10px] font-bold text-amber-900 bg-amber-200/90 px-1.5 py-0.2 rounded-full border border-amber-300 inline-flex items-center gap-0.5 shrink-0">
                                  👑 Admin
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono shrink-0">
                            {player.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
