/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AuthContext manages administrator authentication state.
 * Implements strict Email + OTP authentication via Supabase Auth (signInWithOtp + verifyOtp),
 * restricts access strictly to authorized tournament officers present in the `admins` table,
 * and maintains reactive session status to protect financial data from unauthorized player edits.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../lib/database';
import { Admin, Player } from '../types';

interface AuthContextType {
  isAdmin: boolean;
  currentAdmin: Admin | null;
  adminDisplayName: string;
  isDeveloper: boolean;
  currentPlayer: Player | null;
  loginAsPlayer: (player: Player) => void;
  logoutPlayer: () => void;
  loading: boolean;
  isSupabaseConnected: boolean;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('kmpl_current_player');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const loginAsPlayer = (player: Player) => {
    setCurrentPlayer(player);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kmpl_current_player', JSON.stringify(player));
    }
  };

  const logoutPlayer = () => {
    setCurrentPlayer(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('kmpl_current_player');
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Clear any legacy persistent admin bypass
          localStorage.removeItem('kmpl_simulated_admin');
        }

        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            const admins = await db.getAdmins();
            const matchingAdmin = admins.find(
              (a) => a.email.toLowerCase() === session.user.email?.toLowerCase()
            );
            if (matchingAdmin && mounted) {
              setCurrentAdmin(matchingAdmin);
            } else if (mounted) {
              await supabase.auth.signOut();
              setCurrentAdmin(null);
            }
          }

          // Validate that saved player identity exists in live Supabase players table
          const livePlayers = await db.getPlayers();
          if (currentPlayer && !livePlayers.some(p => p.id === currentPlayer.id)) {
            setCurrentPlayer(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('kmpl_current_player');
            }
          }
        } else {
          // Check session-scoped storage if using local dev fallback
          const savedAdmin = typeof window !== 'undefined' ? sessionStorage.getItem('kmpl_admin_session') : null;
          if (savedAdmin && mounted) {
            try {
              setCurrentAdmin(JSON.parse(savedAdmin));
            } catch {
              sessionStorage.removeItem('kmpl_admin_session');
            }
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user?.email) {
          const admins = await db.getAdmins();
          const match = admins.find(
            (a) => a.email.toLowerCase() === session.user.email?.toLowerCase()
          );
          if (match && mounted) {
            setCurrentAdmin(match);
          } else if (mounted) {
            setCurrentAdmin(null);
          }
        } else if (mounted) {
          setCurrentAdmin(null);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Request Email OTP via Supabase Auth.
   * Strictly validates that the email belongs to an authorized committee officer.
   */
  const sendOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid officer email address.',
      };
    }

    // 1. Verify email belongs to an authorized tournament officer
    const admins = await db.getAdmins();
    const matchingAdmin = admins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!matchingAdmin) {
      return {
        success: false,
        error: `Access Denied: "${cleanEmail}" is not registered in the tournament committee admin list. Players do not need to log in!`,
      };
    }

    setPendingEmail(cleanEmail);

    // 2. Dispatch OTP via Supabase Auth
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    }

    // 3. Fallback when Supabase is not connected in env
    const devOtp = '776088';
    sessionStorage.setItem('kmpl_sim_otp_' + cleanEmail, devOtp);
    console.info(`[Supabase Auth Notice] Supabase URL is not yet connected. For development testing, enter OTP '${devOtp}' or configure your Supabase Project URL in Database Settings.`);

    return {
      success: true,
    };
  };

  /**
   * Verify the 6-digit OTP code sent to the officer's email via Supabase Auth.
   */
  const verifyOtp = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    if (cleanToken.length !== 6) {
      return { success: false, error: 'Please enter the complete 6-digit verification code.' };
    }

    const admins = await db.getAdmins();
    const matchingAdmin = admins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!matchingAdmin) {
      return {
        success: false,
        error: 'Access Denied: Unauthorized administrator email record.',
      };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        setCurrentAdmin(matchingAdmin);
        setPendingEmail(null);
        return { success: true };
      }

      return { success: false, error: 'Verification failed. Please check the OTP sent to your email.' };
    }

    // Dev fallback verification when Supabase URL is not yet configured
    const storedOtp = sessionStorage.getItem('kmpl_sim_otp_' + cleanEmail);
    if (storedOtp && cleanToken === storedOtp) {
      setCurrentAdmin(matchingAdmin);
      sessionStorage.setItem('kmpl_admin_session', JSON.stringify(matchingAdmin));
      sessionStorage.removeItem('kmpl_sim_otp_' + cleanEmail);
      setPendingEmail(null);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid 6-digit OTP code. Please enter the code sent to your email (or 776088 in local dev).',
    };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('kmpl_admin_session');
      localStorage.removeItem('kmpl_simulated_admin');
    }
    setCurrentAdmin(null);
    setPendingEmail(null);
  };

  const adminDisplayName = currentAdmin ? `👑 Admin — ${currentAdmin.name}` : '';

  const value = {
    isAdmin: Boolean(currentAdmin),
    currentAdmin,
    adminDisplayName,
    isDeveloper: Boolean(currentAdmin?.is_developer),
    currentPlayer,
    loginAsPlayer,
    logoutPlayer,
    loading,
    isSupabaseConnected: isSupabaseConfigured,
    sendOtp,
    verifyOtp,
    signOut,
    pendingEmail,
    setPendingEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
