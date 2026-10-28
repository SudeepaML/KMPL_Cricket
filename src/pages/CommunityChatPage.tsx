/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Community Chat Page for KMPL Cricket.
 * Connects village players and tournament administrators in a live transparent chat room.
 * 
 * Key Features:
 * - Reads & writes the Supabase table `chat_messages`
 * - Displays the last 100 messages (oldest at top, newest at bottom)
 * - Auto-scrolls to newest message
 * - Supabase Realtime channel handles INSERT and DELETE events (handlers added before subscribe())
 * - Message bubbles: own messages in green on right, others on left
 * - Shows sender name, KMPL ID, timestamp, and 👑 crown for admins
 * - Input with 500-character limit, whitespace trimming, and 2-second cooldown
 * - Sender identity derived from logged-in admin or player (sending blocked if unauthenticated)
 * - Admins can delete any message; players have no deletion permissions
 * - Empty state: "No messages yet. Say hello!"
 * - Full English and Kannada bilingual support
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { db, localStore } from '../lib/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ChatMessage, Player } from '../types';
import { KmplLogo } from '../components/KmplLogo';
import {
  MessageSquare,
  Send,
  Trash2,
  Lock,
  UserCheck,
  Shield,
  Crown,
  Search,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';

export const CommunityChatPage: React.FC = () => {
  const { currentAdmin, isAdmin, currentPlayer, loginAsPlayer, logoutPlayer } = useAuth();
  const { t, language } = useLanguage();
  const isKn = language === 'kn';
  const { players, getAdminForPlayer } = useRealtimeData();

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // 2-second cooldown timer
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const lastSendTimeRef = useRef<number>(0);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Player selector modal state for identifying as a player
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState<boolean>(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');

  // Delete message confirmation
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  /**
   * Auto-scrolls the chat window to the newest message at the bottom.
   */
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  /**
   * Formats ISO timestamp to human-friendly time string (e.g., "10:45 AM" or "Apr 1, 10:45 AM").
   */
  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  /**
   * Resolves the sender's KMPL ID for an admin based on the tournament roster.
   */
  const getAdminKmplId = (): string => {
    if (!currentAdmin) return 'ADMIN';
    const cleanAdminPhone = (currentAdmin.phone || '').replace(/\D/g, '').slice(-10);
    const p = players.find((player) => {
      const cleanP = (player.phone || '').replace(/\D/g, '').slice(-10);
      return (cleanAdminPhone.length >= 8 && cleanP.length >= 8 && cleanP === cleanAdminPhone) ||
        player.name.toLowerCase().trim() === currentAdmin.name.toLowerCase().trim();
    });
    return p ? p.kmpl_id : 'KMPL-ADM';
  };

  /**
   * Determine active sender credentials from logged-in admin or player.
   */
  const activeSender = currentAdmin
    ? {
        name: currentAdmin.name,
        kmpl_id: getAdminKmplId(),
        is_admin: true,
      }
    : currentPlayer
    ? {
        name: currentPlayer.name,
        kmpl_id: currentPlayer.kmpl_id,
        is_admin: false,
      }
    : null;

  /**
   * Initial fetch of last 100 messages and Realtime setup.
   * Creates channel once, adds handlers BEFORE subscribe(), and calls removeChannel on unmount.
   */
  useEffect(() => {
    let isMounted = true;

    // Load initial 100 messages
    const loadInitialMessages = async () => {
      try {
        const fetched = await db.getChatMessages();
        if (isMounted) {
          setMessages(fetched);
          setLoading(false);
          // Scroll immediately after initial render
          setTimeout(() => scrollToBottom(false), 100);
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadInitialMessages();

    // Supabase Realtime Subscription
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('kmpl_chat_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages((prev) => {
              // Idempotency: avoid adding duplicate if already present
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              const next = [...prev, newMsg];
              return next.slice(-100); // Keep last 100
            });
            scrollToBottom(true);
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const deletedId = (payload.old as { id?: string })?.id;
            if (deletedId) {
              setMessages((prev) => prev.filter((m) => m.id !== deletedId));
            }
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.warn('[Supabase Realtime Chat] Subscription notice:', err);
          }
        });

      return () => {
        isMounted = false;
        try {
          supabase.removeChannel(channel);
        } catch (cleanupErr) {
          console.warn('[Supabase Realtime Chat] Error removing channel:', cleanupErr);
        }
      };
    } else {
      // Local fallback realtime listener
      const unsubscribe = localStore.subscribe(async () => {
        if (!isMounted) return;
        const updated = await db.getChatMessages();
        setMessages(updated);
        scrollToBottom(true);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, []);

  /**
   * Countdown timer effect for 2-second cooldown between sends.
   */
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  /**
   * Automatically scroll to bottom whenever messages update.
   */
  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length]);

  /**
   * Handles sending a new message with validation and 2-second cooldown enforcement.
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSender) return;

    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Check 2-second cooldown
    const now = Date.now();
    if (now - lastSendTimeRef.current < 2000) {
      return;
    }

    try {
      setIsSending(true);
      lastSendTimeRef.current = now;
      setCooldownSeconds(2);

      const created = await db.sendChatMessage({
        sender_name: activeSender.name,
        sender_kmpl_id: activeSender.kmpl_id,
        is_admin: activeSender.is_admin,
        message: trimmed,
      });

      setInputText('');

      // Optimistically add message if not already added by realtime listener
      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        const next = [...prev, created];
        return next.slice(-100);
      });
      scrollToBottom(true);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handles deleting a message (strictly visible and allowed only for admins).
   */
  const handleDeleteMessage = async (id: string) => {
    if (!isAdmin) return;
    try {
      setIsDeleting(true);
      await db.deleteChatMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setMessageToDelete(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter players for player identification modal
  const filteredPlayers = players.filter((p) => {
    const q = playerSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.kmpl_id.toLowerCase().includes(q) ||
      (p.phone ? p.phone.includes(q) : false)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-28 flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat Room Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-4 sm:p-5 text-white shadow-md border border-emerald-800/80 dark:border-slate-800 shrink-0 mb-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <KmplLogo size="sm" withGlow withFloat />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                  Live Chat
                </span>
                <span className="text-xs text-emerald-200/90 font-medium">
                  {messages.length} / 100 {isKn ? 'ಸಂದೇಶಗಳು' : 'messages'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {t.chat}
              </h1>
              <p className="text-xs text-emerald-200/80 line-clamp-1">
                {t.chatSubtitle}
              </p>
            </div>
          </div>

          {/* User Status / Identity Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {currentAdmin ? (
              <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-300/40 rounded-xl px-2.5 py-1 text-xs">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <span>👑</span>
                  <span>{currentAdmin.name}</span>
                </span>
                <span className="text-[10px] bg-amber-400 text-emerald-950 font-black px-1.5 py-0.2 rounded">
                  {getAdminKmplId()}
                </span>
              </div>
            ) : currentPlayer ? (
              <div className="flex items-center gap-2 bg-emerald-800/60 border border-emerald-600/50 rounded-xl px-2.5 py-1 text-xs">
                <div className="flex items-center gap-1 text-emerald-200 font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="truncate max-w-[120px]">{currentPlayer.name}</span>
                  <span className="font-mono text-[10px] text-amber-300">({currentPlayer.kmpl_id})</span>
                </div>
                <button
                  onClick={() => setIsPlayerModalOpen(true)}
                  className="text-[10px] text-amber-300 hover:text-white underline underline-offset-2 cursor-pointer"
                >
                  {t.changePlayer}
                </button>
                <button
                  onClick={logoutPlayer}
                  className="text-[10px] text-rose-300 hover:text-white cursor-pointer ml-1"
                  title="Clear Player Identity"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPlayerModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t.identifyAsPlayer}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll View Container */}
      <div className="flex-1 overflow-y-auto p-4 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 shadow-inner">
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
              >
                <div className="w-48 sm:w-64 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          // Empty State per requirement 10
          <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-center p-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-3 shadow-xs">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {t.noMessagesYet}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {isKn
                ? 'ಟೂರ್ನಮೆಂಟ್ ಚರ್ಚೆ ಆರಂಭಿಸಲು ಕೆಳಗಿನ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಸಂದೇಶ ಬರೆದು ಕಳುಹಿಸಿ.'
                : 'Start the conversation! Share match updates, ground schedules, or tournament greetings.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            // Determine if message belongs to current user
            const isOwn = currentAdmin
              ? msg.sender_name === currentAdmin.name && msg.is_admin
              : currentPlayer
              ? msg.sender_kmpl_id === currentPlayer.kmpl_id && !msg.is_admin
              : false;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl shadow-xs transition-all relative ${
                    isOwn
                      ? 'bg-emerald-600 dark:bg-emerald-700 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {/* Header: Sender name, KMPL ID, Admin Crown, and Time */}
                  <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span
                        className={`font-bold truncate ${
                          isOwn ? 'text-emerald-100' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {msg.sender_name}
                      </span>

                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isOwn
                            ? 'bg-emerald-700/80 text-emerald-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {msg.sender_kmpl_id}
                      </span>

                      {/* Admin Crown Symbol per requirement 5 */}
                      {msg.is_admin && (
                        <span
                          className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                            isOwn
                              ? 'bg-amber-400 text-emerald-950 border-amber-300'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                          }`}
                        >
                          <span>👑</span>
                          <span>{t.adminBadge}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-mono ${
                          isOwn ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </span>

                      {/* Admin Delete Action per requirement 8 (Admins see delete button on every message) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setMessageToDelete(msg.id)}
                          className={`p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer ${
                            isOwn ? 'text-emerald-200 hover:text-rose-200' : 'text-slate-400 hover:text-rose-600'
                          }`}
                          title={t.deleteMessage}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content Body */}
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar (Blocked if nobody is logged in) */}
      <div className="mt-3 shrink-0">
        {!activeSender ? (
          // Block sending per requirement 7
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left shadow-xs">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t.loginToChat}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isKn
                    ? 'ಸಂದೇಶ ಕಳುಹಿಸಲು ನಿಮ್ಮ ಆಟಗಾರ ಪ್ರೊಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಅಡ್ಮಿನ್ ಆಗಿ ಲಾಗಿನ್ ಆಗಿ.'
                    : 'Messages display your verified name & KMPL ID for tournament transparency.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlayerModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t.identifyAsPlayer}</span>
              </button>
              <Link
                to="/admin/login"
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t.login}</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-1.5">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={500}
                placeholder={
                  cooldownSeconds > 0
                    ? `${t.waitCooldown} (${cooldownSeconds}s)...`
                    : t.typeMessagePlaceholder
                }
                disabled={cooldownSeconds > 0 || isSending}
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-xs disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || cooldownSeconds > 0 || isSending}
                className={`px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all min-h-[46px] cursor-pointer ${
                  !inputText.trim() || cooldownSeconds > 0 || isSending
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow'
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {cooldownSeconds > 0 ? `${t.waitCooldown} ${cooldownSeconds}s` : t.send}
                </span>
              </button>
            </div>

            {/* Sub-bar: Sender notice & Character count limit */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
              <span className="truncate">
                {isKn ? 'ಕಳುಹಿಸುವವರು: ' : 'Sending as: '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  {activeSender.name} ({activeSender.kmpl_id})
                </strong>
                {activeSender.is_admin && ' 👑'}
              </span>
              <span
                className={`font-mono text-[10px] ${
                  inputText.length >= 480
                    ? 'text-rose-600 font-bold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {inputText.length} / 500
              </span>
            </div>
          </form>
        )}
      </div>

      {/* Player Profile Identification Modal */}
      {isPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.selectYourPlayer}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isKn ? 'ನಿಮ್ಮ ಹೆಸರನ್ನು ಆಯ್ಕೆಮಾಡಿ ಚಾಟ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ' : 'Select your tournament name to chat'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPlayerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter input */}
            <div className="mt-3 relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                placeholder="Search by name, KMPL ID or phone..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Players Roster List */}
            <div className="mt-3 overflow-y-auto flex-1 space-y-1.5 pr-1">
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  {players.length === 0 ? 'No players yet' : 'No matching players found'}
                </div>
              ) : (
                filteredPlayers.map((player) => {
                  const adminInfo = getAdminForPlayer(player);
                  const isPlayerAnAdmin = Boolean(adminInfo);

                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => {
                        loginAsPlayer(player);
                        setIsPlayerModalOpen(false);
                      }}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group min-h-[44px] cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md shrink-0">
                          {player.kmpl_id}
                        </span>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 truncate block">
                            {player.name}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                            {player.phone ? `${player.phone} · ` : ''}{player.type}
                          </span>
                        </div>
                      </div>

                      {isPlayerAnAdmin && (
                        <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 px-1.5 py-0.2 rounded-full shrink-0">
                          👑 Admin
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Admin redirect notice */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Are you a Tournament Officer?{' '}
                <Link
                  to="/admin/login"
                  onClick={() => setIsPlayerModalOpen(false)}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Login</span>
                </Link>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Message Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800 w-fit mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Moderation</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.deleteMessage}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.deleteConfirm}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMessage(messageToDelete)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : t.deleteMessage}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
