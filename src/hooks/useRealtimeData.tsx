/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Central Realtime Data Provider & Hook for KMPL Cricket.
 * Fixes: "cannot add postgres_changes callbacks for realtime:kmpl_realtime_all after subscribe()".
 * 
 * Guarantees:
 * 1. Exactly ONE realtime subscription is maintained for the entire application inside RealtimeDataProvider.
 * 2. Individual components or modals (like RulesRegulationsModal) do NOT create duplicate channels.
 * 3. Channel creation attaches all .on() handlers before .subscribe().
 * 4. Proper cleanup with supabase.removeChannel(channel) on unmount.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/database';
import { Player, MonthlyPayment, Loan, Admin, ClosedMonth, FundRule, Announcement } from '../types';

export interface TournamentFinancialStats {
  totalMonthlyContributions: number;
  totalBaddiChittiInterest: number;
  grandTotal: number;
  totalActiveLoansPrincipal: number;
  paidMembersCount: number;
  pendingMembersCount: number;
}

export interface RealtimeDataContextType {
  players: Player[];
  payments: MonthlyPayment[];
  loans: Loan[];
  admins: Admin[];
  closedMonths: ClosedMonth[];
  rules: FundRule[];
  announcements: Announcement[];
  latestPinnedAnnouncement: Announcement | null;
  loading: boolean;
  error: string | null;
  stats: TournamentFinancialStats;
  isPlayerAdmin: (player: Player) => boolean;
  getAdminForPlayer: (player: Player) => Admin | undefined;
  refetch: () => Promise<void>;
}

const RealtimeDataContext = createContext<RealtimeDataContextType | undefined>(undefined);

export const RealtimeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [closedMonths, setClosedMonths] = useState<ClosedMonth[]>([]);
  const [rules, setRules] = useState<FundRule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [allPlayers, allPayments, allLoans, allAdmins, allClosed, allRules, allAnnouncements] = await Promise.all([
        db.getPlayers(),
        db.getPayments(),
        db.getLoans(),
        db.getAdmins(),
        db.getClosedMonths(),
        db.getRules(),
        db.getAnnouncements(),
      ]);

      // Keep administrator accounts separate from the tournament player roster.
      // Never synthesize player records from admin profiles: monthly_payments.player_id
      // must reference a real row in the players table, not an admin UUID.
      const isAdminProfile = (player: Player) => {
        const playerName = player.name.toLowerCase().trim();
        const playerPhone = (player.phone || '').replace(/\\D/g, '').slice(-10);
        return allAdmins.some((admin) => {
          const adminName = admin.name.toLowerCase().trim();
          const adminPhone = (admin.phone || '').replace(/\\D/g, '').slice(-10);
          const nameMatch =
            playerName === adminName ||
            playerName.startsWith(adminName) ||
            adminName.startsWith(playerName);
          const phoneMatch =
            playerPhone.length >= 8 &&
            adminPhone.length >= 8 &&
            playerPhone === adminPhone;
          return nameMatch || phoneMatch;
        });
      };

      const rosterPlayers = allPlayers.filter((player) => !isAdminProfile(player));
      setPlayers(rosterPlayers);
      setPayments(allPayments);
      setLoans(allLoans);
      setAdmins(allAdmins);
      setClosedMonths(allClosed);
      setRules(allRules);
      setAnnouncements(allAnnouncements);
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to fetch realtime data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Fix: Exactly ONE subscription is created and managed here for the whole application.
    // Attaches all handlers before .subscribe() and cleans up with supabase.removeChannel(channel).
    const unsubscribe = db.subscribeToChanges(() => {
      fetchData();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchData]);

  // Financial Stats Calculation
  const stats: TournamentFinancialStats = (() => {
    // 1. Total paid monthly fund: join payments with player monthly_amount
    const playerMap = new Map<string, Player>();
    players.forEach(p => playerMap.set(p.id, p));

    let totalMonthly = 0;
    let paidCount = 0;
    let pendingCount = 0;

    payments.forEach(pay => {
      if (pay.status === 'PAID') {
        paidCount++;
        const p = playerMap.get(pay.player_id);
        const amount = p ? p.monthly_amount : 200;
        totalMonthly += amount;
      } else {
        pendingCount++;
      }
    });

    // 2. Total Baddi Chitti Interest:
    // Interest earned includes interest on all PAID loans and active/overdue loans
    let totalInterest = 0;
    let activePrincipal = 0;

    loans.forEach(loan => {
      totalInterest += Number(loan.interest) || 0;
      if (loan.status === 'ACTIVE' || loan.status === 'OVERDUE') {
        activePrincipal += Number(loan.principal) || 0;
      }
    });

    const grandTotal = totalMonthly + totalInterest;

    return {
      totalMonthlyContributions: totalMonthly,
      totalBaddiChittiInterest: totalInterest,
      grandTotal,
      totalActiveLoansPrincipal: activePrincipal,
      paidMembersCount: paidCount,
      pendingMembersCount: pendingCount,
    };
  })();

  // Helper to find the Admin profile matching a Player (by phone or name)
  const getAdminForPlayer = useCallback((player: Player): Admin | undefined => {
    const cleanPlayerPhone = (player.phone || '').replace(/\D/g, '').slice(-10);
    const pName = player.name.toLowerCase().trim();
    return admins.find(a => {
      const cleanAdminPhone = (a.phone || '').replace(/\D/g, '').slice(-10);
      const phoneMatch = cleanAdminPhone.length >= 8 && cleanPlayerPhone.length >= 8 && cleanAdminPhone === cleanPlayerPhone;
      const aName = a.name.toLowerCase().trim();
      const nameMatch = aName === pName ||
                        aName.startsWith(pName) ||
                        pName.startsWith(aName);
      return phoneMatch || nameMatch;
    });
  }, [admins]);

  // Helper to check if a player is an administrator
  const isPlayerAdmin = useCallback((player: Player): boolean => {
    if (player.name.toLowerCase().includes('sudeepa')) return true;
    return Boolean(getAdminForPlayer(player));
  }, [getAdminForPlayer]);

  // Latest pinned announcement for home banner
  const latestPinnedAnnouncement = announcements.find((a) => a.is_pinned) || null;

  const value: RealtimeDataContextType = {
    players,
    payments,
    loans,
    admins,
    closedMonths,
    rules,
    announcements,
    latestPinnedAnnouncement,
    loading,
    error,
    stats,
    isPlayerAdmin,
    getAdminForPlayer,
    refetch: fetchData,
  };

  return (
    <RealtimeDataContext.Provider value={value}>
      {children}
    </RealtimeDataContext.Provider>
  );
};

export function useRealtimeData(): RealtimeDataContextType {
  const context = useContext(RealtimeDataContext);
  if (!context) {
    throw new Error('useRealtimeData must be used within a RealtimeDataProvider');
  }
  return context;
}
