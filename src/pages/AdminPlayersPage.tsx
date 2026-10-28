/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Players Management Screen.
 * Allows adding, editing, and deleting tournament players with auto-generated KMPL IDs
 * and automatic tier pricing: Senior ₹200 / Junior ₹100.
 * Features a high-visibility headline and secure delete confirmation dialog for administrators.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useLanguage } from '../context/LanguageContext';
import { db, formatINR } from '../lib/database';
import { Player, PlayerType } from '../types';
import {
  UserPlus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Users,
  X,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

export const AdminPlayersPage: React.FC = () => {
  const { players, isPlayerAdmin, refetch } = useRealtimeData();
  const { t, language } = useLanguage();
  const isKn = language === 'kn';

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setStatusMessage({
          type: 'success',
          text: isKn
            ? `ಆಟಗಾರ "${name.trim()}" ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.`
            : `Updated player "${name.trim()}" successfully.`,
        });
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
        setStatusMessage({
          type: 'success',
          text: isKn
            ? `ಹೊಸ ಆಟಗಾರ "${name.trim()}" (${newKmplId}) ನೋಂದಾಯಿಸಲಾಗಿದೆ.`
            : `Added new player "${name.trim()}" (${newKmplId}).`,
        });
      }

      setIsModalOpen(false);
      setTimeout(() => setStatusMessage(null), 3500);
      refetch();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save player record.',
      });
    }
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    setIsDeleting(true);
    try {
      await db.deletePlayer(playerToDelete.id);
      setStatusMessage({
        type: 'success',
        text: isKn
          ? `ಆಟಗಾರ "${playerToDelete.name}" (${playerToDelete.kmpl_id}) ಅವರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.`
          : `Successfully deleted player "${playerToDelete.name}" (${playerToDelete.kmpl_id}).`,
      });
      setPlayerToDelete(null);
      if (isModalOpen && editingPlayer?.id === playerToDelete.id) {
        setIsModalOpen(false);
      }
      setTimeout(() => setStatusMessage(null), 3500);
      refetch();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete player.',
      });
    } finally {
      setIsDeleting(false);
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
      {/* Back to Admin Breadcrumb */}
      <div className="mb-3">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isKn ? 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ' : 'Back to Admin Dashboard'}</span>
        </Link>
      </div>

      {/* Prominent High-Visibility Headline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-600/40 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
              Admin Portal
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
              Total: {players.length} Players
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{isKn ? 'ಆಟಗಾರರ ನಿರ್ವಹಣೆ' : 'Manage Players'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
            {isKn
              ? 'ಹೊಸ ಸದಸ್ಯರನ್ನು ನೋಂದಾಯಿಸಿ, ಹಿರಿಯ/ಕಿರಿಯ ವರ್ಗ ಬದಲಾಯಿಸಿ, ಅಥವಾ ಅನಗತ್ಯ ಆಟಗಾರರನ್ನು ಅಳಿಸಿ.'
              : 'Register new players, assign Senior/Junior tiers, update details, or remove players from the tournament.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors min-h-[44px] shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>{isKn ? '+ ಹೊಸ ಆಟಗಾರ ನೋಂದಣಿ' : 'Add New Player'}</span>
        </button>
      </div>

      {/* Status Alert Message */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isKn ? 'ಹೆಸರು, KMPL ID ಅಥವಾ ಮೊಬೈಲ್ ಮೂಲಕ ಹುಡುಕಿ...' : 'Search by player name, KMPL ID, or phone...'}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
        />
      </div>

      {/* Players List with Edit AND Delete Actions */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            {isKn ? 'ಯಾವುದೇ ಆಟಗಾರರು ಕಂಡುಬಂದಿಲ್ಲ.' : 'No players found matching your search.'}
          </div>
        ) : (
          filtered.map((player) => (
            <div
              key={player.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 shadow-2xs flex items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-xl shrink-0">
                  {player.kmpl_id}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate block">
                      {player.name}
                    </span>
                    {isPlayerAdmin(player) && (
                      <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 px-1.5 py-0.2 rounded-md inline-flex items-center gap-0.5 shrink-0">
                        👑 Admin
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {player.phone} · <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{player.type}</strong> ({formatINR(player.monthly_amount)}/mo)
                  </span>
                </div>
              </div>

              {/* Action Buttons: Edit AND Delete */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(player)}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-transparent hover:border-emerald-200 dark:hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                  title="Edit Player Details"
                >
                  <Edit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{isKn ? 'ತಿದ್ದುಪಡಿ' : 'Edit'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlayerToDelete(player)}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 hover:border-transparent transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                  title="Delete Player"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{isKn ? 'ಅಳಿಸಿ' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-rose-300 dark:border-rose-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                <ShieldAlert className="w-4 h-4" />
                <span>{isKn ? 'ಆಟಗಾರನನ್ನು ಅಳಿಸುವುದು' : 'Admin Delete Action'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPlayerToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isKn ? 'ಈ ಆಟಗಾರನನ್ನು ಖಚಿತವಾಗಿ ಅಳಿಸಬೇಕೆ?' : 'Delete This Player?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKn
                  ? 'ಈ ಆಟಗಾರನ ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಮತ್ತು ಲೆಕ್ಕಪತ್ರಗಳನ್ನು ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.'
                  : 'This will permanently remove the player from the tournament database.'}
              </p>

              {/* Player Summary Card */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {playerToDelete.name}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {playerToDelete.kmpl_id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                  {playerToDelete.phone} • {playerToDelete.type} tier ({formatINR(playerToDelete.monthly_amount)}/mo)
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlayerToDelete(null)}
                disabled={isDeleting}
                className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeletePlayer}
                disabled={isDeleting}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isKn ? 'ಅಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{isKn ? 'ಖಚಿತವಾಗಿ ಅಳಿಸಿ' : 'Confirm Delete'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingPlayer
                  ? (isKn ? 'ಆಟಗಾರರ ವಿವರ ತಿದ್ದುಪಡಿ' : 'Edit Player Details')
                  : (isKn ? 'ಹೊಸ ಆಟಗಾರ ನೋಂದಣಿ' : 'Register New Member')}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {editingPlayer
                ? `Updating ID: ${editingPlayer.kmpl_id}`
                : `Next Auto-Assigned ID: ${getNextKmplId()}`}
            </p>

            <form onSubmit={handleSavePlayer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isKn ? 'ಆಟಗಾರನ ಪೂರ್ಣ ಹೆಸರು' : 'Player Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Gowda"
                  required
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isKn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Mobile Number'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile..."
                  required
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isKn ? 'ಮಾಸಿಕ ವರ್ಗ (Tier)' : 'Membership Tier'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('Senior')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex flex-col items-center cursor-pointer ${
                      type === 'Senior'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{isKn ? 'ಹಿರಿಯ (Senior)' : 'Senior'}</span>
                    <span className="text-[10px] opacity-80">₹200 / month</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('Junior')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex flex-col items-center cursor-pointer ${
                      type === 'Junior'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{isKn ? 'ಕಿರಿಯ (Junior)' : 'Junior'}</span>
                    <span className="text-[10px] opacity-80">₹100 / month</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {editingPlayer ? (isKn ? 'ನವೀಕರಿಸಿ' : 'Save Changes') : (isKn ? 'ನೋಂದಾಯಿಸಿ' : 'Save Member')}
                </button>
              </div>

              {/* If editing, also offer delete button */}
              {editingPlayer && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => setPlayerToDelete(editingPlayer)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer py-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isKn ? 'ಈ ಆಟಗಾರನನ್ನು ಅಳಿಸಿ' : 'Delete this player from records'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
