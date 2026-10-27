/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Custom hook to subscribe to all KMPL data in real time.
 * Automatically synchronizes players, payments, loans, admins, and closed months.
 */

import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/database';
import { Player, MonthlyPayment, Loan, Admin, ClosedMonth, FundRule } from '../types';

export interface TournamentFinancialStats {
  totalMonthlyContributions: number;
  totalBaddiChittiInterest: number;
  grandTotal: number;
  totalActiveLoansPrincipal: number;
  paidMembersCount: number;
  pendingMembersCount: number;
}

export function useRealtimeData() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [closedMonths, setClosedMonths] = useState<ClosedMonth[]>([]);
  const [rules, setRules] = useState<FundRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [allPlayers, allPayments, allLoans, allAdmins, allClosed, allRules] = await Promise.all([
        db.getPlayers(),
        db.getPayments(),
        db.getLoans(),
        db.getAdmins(),
        db.getClosedMonths(),
        db.getRules(),
      ]);

      setPlayers(allPlayers);
      setPayments(allPayments);
      setLoans(allLoans);
      setAdmins(allAdmins);
      setClosedMonths(allClosed);
      setRules(allRules);
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

    // Subscribe to live Postgres / Local updates
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

  // Helper to check if a player phone or email matches an admin
  const isPlayerAdmin = useCallback((player: Player): boolean => {
    const cleanPlayerPhone = player.phone.replace(/\D/g, '');
    return admins.some(a => {
      const cleanAdminPhone = a.phone.replace(/\D/g, '');
      return cleanAdminPhone.length > 5 && cleanAdminPhone === cleanPlayerPhone;
    });
  }, [admins]);

  return {
    players,
    payments,
    loans,
    admins,
    closedMonths,
    rules,
    loading,
    error,
    stats,
    isPlayerAdmin,
    refetch: fetchData,
  };
}
