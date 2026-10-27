/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Players Management Screen.
 * Allows adding and editing players with auto-generated KMPL IDs (e.g. KMPL17)
 * and automatic tier pricing: Senior ₹200 / Junior ₹100.
 */

import React, { useState } from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { db, formatINR } from '../lib/database';
import { Player, PlayerType } from '../types';
import { UserPlus, Edit2, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminPlayersPage: React.FC = () => {
  const { players, refetch } = useRealtimeData();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<PlayerType>('Senior');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Compute next auto KMPL ID (e.g. KMPL17)
  const getNextKmplId = (): string => {
    let maxNum = 0;
    players.forEach((p) => {
      const match = p.kmpl_id.match(/KMPL(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `KMPL${String(nextNum).padStart(2, '0')}`;
  };

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setName('');
    setPhone('');
    setType('Senior');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setPhone(player.phone);
    setType(player.type);
    setIsModalOpen(true);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const monthlyAmount = type === 'Senior' ? 200 : 100;

    try {
      if (editingPlayer) {
        await db.updatePlayer(editingPlayer.id, {
          name: name.trim(),
          phone: phone.trim(),
          type,
          monthly_amount: monthlyAmount,
        });
        setStatusMessage({ type: 'success', text: `Updated player ${name.trim()} successfully.` });
      } else {
        const newKmplId = getNextKmplId();
        await db.addPlayer({
          kmpl_id: newKmplId,
          name: name.trim(),
          phone: phone.trim(),
          type,
          monthly_amount: monthlyAmount,
          join_date: new Date().toISOString().split('T')[0],
          chitti_taken: false,
        });
        setStatusMessage({ type: 'success', text: `Added player ${name.trim()} (${newKmplId}).` });
      }

      setIsModalOpen(false);
      setTimeout(() => setStatusMessage(null), 3000);
      refetch();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save player record.',
      });
    }
  };

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kmpl_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.managePlayers}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register tournament players, assign Senior/Junior tiers, and auto-generate KMPL IDs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors min-h-[44px]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Player</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
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

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by player name or ID..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
        />
      </div>

      {/* Players List */}
      <div className="space-y-2.5">
        {filtered.map((player) => (
          <div
            key={player.id}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md shrink-0">
                {player.kmpl_id}
              </span>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 text-sm sm:text-base truncate block">
                  {player.name}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {player.phone} · {player.type} ({formatINR(player.monthly_amount)}/mo)
                </span>
              </div>
            </div>

            <button
              onClick={() => handleOpenEdit(player)}
              className="p-2 rounded-xl text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors shrink-0"
              title="Edit Player"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add / Edit Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {editingPlayer ? 'Edit Player Details' : 'Register New Member'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {editingPlayer
                ? `Updating ${editingPlayer.kmpl_id}`
                : `Next Auto-Assigned ID: ${getNextKmplId()}`}
            </p>

            <form onSubmit={handleSavePlayer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Player Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Gowda"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile..."
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Membership Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('Senior')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex flex-col items-center ${
                      type === 'Senior'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>Senior</span>
                    <span className="text-[10px] opacity-80">₹200 / month</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('Junior')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex flex-col items-center ${
                      type === 'Junior'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>Junior</span>
                    <span className="text-[10px] opacity-80">₹100 / month</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
