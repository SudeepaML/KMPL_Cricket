/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AuthContext manages administrator authentication state.
 * Implements Supabase Email OTP (signInWithOtp + verifyOtp),
 * restricts access strictly to emails present in the `admins` table,
 * and maintains reactive session status.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../lib/database';
import { Admin } from '../types';

interface AuthContextType {
  isAdmin: boolean;
  currentAdmin: Admin | null;
  adminDisplayName: string;
  isDeveloper: boolean;
  loading: boolean;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
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
        } else {
          // Simulation session stored in localStorage
          const savedAdmin = localStorage.getItem('kmpl_simulated_admin');
          if (savedAdmin && mounted) {
            try {
              setCurrentAdmin(JSON.parse(savedAdmin));
            } catch {
              localStorage.removeItem('kmpl_simulated_admin');
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

  const sendOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    const admins = await db.getAdmins();
    const isRegistered = admins.some((a) => a.email.toLowerCase() === cleanEmail);
    if (!isRegistered) {
      return {
        success: false,
        error: `Access denied. Email '${cleanEmail}' is not registered as an authorized tournament officer.`,
      };
    }

    setPendingEmail(cleanEmail);

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

    localStorage.setItem('kmpl_sim_otp', '123456');
    return { success: true };
  };

  const verifyOtp = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    const admins = await db.getAdmins();
    const matchingAdmin = admins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!matchingAdmin) {
      return {
        success: false,
        error: 'Unauthorized administrator record.',
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
      return { success: false, error: 'Verification failed. Please check the code.' };
    }

    if (cleanToken.length === 6) {
      setCurrentAdmin(matchingAdmin);
      localStorage.setItem('kmpl_simulated_admin', JSON.stringify(matchingAdmin));
      setPendingEmail(null);
      return { success: true };
    }

    return { success: false, error: 'Invalid 6-digit verification code.' };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('kmpl_simulated_admin');
    localStorage.removeItem('kmpl_sim_otp');
    setCurrentAdmin(null);
    setPendingEmail(null);
  };

  const adminDisplayName = currentAdmin ? `👑 Admin — ${currentAdmin.name}` : '';

  const value = {
    isAdmin: Boolean(currentAdmin),
    currentAdmin,
    adminDisplayName,
    isDeveloper: Boolean(currentAdmin?.is_developer),
    loading,
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
