import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, UserRound, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { db } from '../lib/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Player } from '../types';
import { useAuth } from '../context/AuthContext';

export const PlayerPortalLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsPlayer } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState<boolean | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const selectedPlayer = useMemo(() => players.find((p) => p.id === playerId) || null, [players, playerId]);

  useEffect(() => {
    let active = true;
    db.getPlayers().then((items) => {
      if (active) setPlayers([...items].sort((a, b) => a.name.localeCompare(b.name)));
    }).catch(() => {
      if (active) setError('Could not load the player list. Please try again.');
    }).finally(() => {
      if (active) setLoadingPlayers(false);
    });
    return () => { active = false; };
  }, []);

  const selectPlayer = async (id: string) => {
    setPlayerId(id);
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsFirstLogin(null);
    if (!id || !isSupabaseConfigured) return;
    const { data, error: rpcError } = await supabase.rpc('player_password_status', { p_player_id: id });
    if (rpcError) {
      setError('Player login setup is not ready yet. Ask the developer to run supabase/player_password_login.sql in Supabase.');
      return;
    }
    if (data?.success) setIsFirstLogin(!data.registered);
    else setError(data?.error || 'Could not check player account.');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!selectedPlayer) return setError('Please select your player name.');
    if (!isSupabaseConfigured) return setError('Player password login requires the connected Supabase database.');
    if (password.length < 4 || password.length > 72) return setError('Use a password between 4 and 72 characters.');
    if (isFirstLogin && password !== confirmPassword) return setError('Passwords do not match.');
    setBusy(true);
    try {
      const { data, error: rpcError } = isFirstLogin
        ? await supabase.rpc('player_register_password', { p_player_id: playerId, p_password: password })
        : await supabase.rpc('player_login', { p_player_id: playerId, p_password: password });
      if (rpcError) throw rpcError;
      if (!data?.success) throw new Error(data?.error || 'Login failed. Please try again.');
      let player = selectedPlayer;
      if (!isFirstLogin && data.player) player = data.player as Player;
      loginAsPlayer(player);
      navigate('/directory', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 sm:p-8">
        <Link to="/chat" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700 mb-6"><ArrowLeft className="w-4 h-4" /> Back to website</Link>
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-4"><UserRound className="w-7 h-7 text-emerald-800 dark:text-emerald-300" /></div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Player Portal Login</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Select your KMPL name to create a password or log in.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Player name
            <select value={playerId} onChange={(e) => void selectPlayer(e.target.value)} disabled={loadingPlayers || busy} required className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm">
              <option value="">{loadingPlayers ? 'Loading players…' : 'Select your name'}</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.kmpl_id})</option>)}
            </select>
          </label>
          {selectedPlayer && isFirstLogin !== null && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-sm text-emerald-900 dark:text-emerald-200">
              {isFirstLogin ? 'First login: create your password below.' : 'Welcome back. Enter your password to continue.'}
            </div>
          )}
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Password
            <div className="relative mt-1.5">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete={isFirstLogin ? 'new-password' : 'current-password'} minLength={4} maxLength={72} required className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 pr-12 text-sm" placeholder="At least 4 characters" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-3 text-slate-400" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </label>
          {selectedPlayer && isFirstLogin && (
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm password
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={4} maxLength={72} required className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm" placeholder="Enter the same password again" />
            </label>
          )}
          {error && <p role="alert" className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
          <button type="submit" disabled={busy || loadingPlayers || !playerId || isFirstLogin === null} className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold py-3.5 flex items-center justify-center gap-2">
            {busy ? 'Please wait…' : isFirstLogin ? <><ShieldCheck className="w-4 h-4" /> Create Password</> : <><LockKeyhole className="w-4 h-4" /> Login to Player Portal</>}
          </button>
        </form>
        <p className="mt-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Passwords are stored as one-way hashes in the database. Keep your password private. If you forget it, ask the KMPL admin to reset your account.</p>
      </div>
    </div>
  );
};
