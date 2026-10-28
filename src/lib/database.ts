/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified Database Layer for KMPL Cricket.
 * Supports live Supabase (PostgreSQL, Auth, Realtime, RPC)
 * and seamless local reactive simulation fallback when credentials are not yet configured.
 * Multi-admin audit support tracks which admin recorded each payment or loan.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { Player, PlayerType, MonthlyPayment, Loan, Admin, ClosedMonth, FundRule, ChatMessage, Announcement } from '../types';

// Clear any legacy localStorage or sessionStorage caching of players, payments, or loans
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('kmpl_players');
    localStorage.removeItem('kmpl_payments');
    localStorage.removeItem('kmpl_loans');
    sessionStorage.removeItem('kmpl_players');
    sessionStorage.removeItem('kmpl_payments');
    sessionStorage.removeItem('kmpl_loans');
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

// The 13 official months for the KMPL 2026-2027 tournament cycle
export const TOURNAMENT_MONTHS: string[] = [
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
  'January 2027',
  'February 2027',
  'March 2027',
  'April 2027',
];

// Developer Portfolio & Contact Details
export const DEVELOPER_INFO = {
  name: 'Developer Sudeepa ML',
  role: 'Lead Full-Stack Developer & Tournament Architect',
  phone: '7760880282',
  email: 'sudeepaml63@gmail.com',
  portfolioUrl: 'https://portfolio-eight-tan-qeciqgq52g.vercel.app/',
  bio: 'Creator and developer of KMPL Cricket Finance Tracker. Architected the PostgreSQL Supabase database, security-definer audit locks, realtime synchronization, and bilingual Kannada-English interface.',
};

// Month parsing helper: converts "April 2026" to a target deadline Date (15th of the month, 23:59:59)
export const getMonthDeadlineDate = (monthName: string): Date => {
  const parts = monthName.split(' ');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const mIndex = monthNames.indexOf(parts[0]);
  const year = parseInt(parts[1], 10) || 2026;
  return new Date(year, mIndex, 15, 23, 59, 59);
};

// Check if a month is in the future relative to local/system time
export const isFutureMonth = (monthName: string): boolean => {
  const deadline = getMonthDeadlineDate(monthName);
  const now = new Date();
  return deadline.getTime() > now.getTime();
};

// Initial Seed Data (mirrors supabase_schema.sql)
const SEED_ADMINS: Admin[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Developer Sudeepa ML',
    phone: '7760880282',
    email: 'mlsudeep63@gmail.com',
    is_developer: true,
    role_title: 'Lead Developer & Officer',
  },
  {
    id: 'a1111111-1111-1111-1111-111111111112',
    name: 'Developer Sudeepa ML (Alternate)',
    phone: '7760880282',
    email: 'sudeepaml63@gmail.com',
    is_developer: true,
    role_title: 'Lead Developer & Officer',
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Kiran Kumar (President)',
    phone: '9900112233',
    email: 'kirankumar.kmpl@gmail.com',
    is_developer: false,
    role_title: 'Tournament President & Co-Admin',
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    name: 'Manjunath H (Treasurer)',
    phone: '9844556677',
    email: 'manjunath.treasurer@gmail.com',
    is_developer: false,
    role_title: 'Treasurer & Co-Admin',
  },
];

// No hardcoded, sample, mock or seed player, payment or loan data - always read live data from Supabase
const SEED_CLOSED_MONTHS: ClosedMonth[] = [];

export const SEED_RULES: FundRule[] = [
  {
    id: 'rule-01',
    order: 1,
    category: 'contribution',
    title: 'Monthly Contribution Tiers',
    title_kn: 'ಮಾಸಿಕ ದೇಣಿಗೆ ವರ್ಗಗಳು',
    description: 'Senior members contribute ₹200/month. Junior members contribute ₹100/month across all 13 tournament months (April 2026 to April 2027).',
    description_kn: 'ಹಿರಿಯ ಆಟಗಾರರು ಪ್ರತಿ ತಿಂಗಳು ₹200 ಹಾಗೂ ಕಿರಿಯ ಆಟಗಾರರು ಪ್ರತಿ ತಿಂಗಳು ₹100 ರಂತೆ ಒಟ್ಟು 13 ತಿಂಗಳು (ಏಪ್ರಿಲ್ 2026 ರಿಂದ ಏಪ್ರಿಲ್ 2027) ಪಾವತಿಸಬೇಕು.',
    is_active: true,
  },
  {
    id: 'rule-02',
    order: 2,
    category: 'deadline',
    title: 'Strict Payment Deadline on 15th',
    title_kn: 'ಪ್ರತಿ ತಿಂಗಳ 15 ನೇ ತಾರೀಖು ಅಂತಿಮ ಗಡುವು',
    description: 'All monthly contributions must be paid on or before the 15th of each month. Future months remain locked with a live countdown clock until their cycle starts.',
    description_kn: 'ಪ್ರತಿ ತಿಂಗಳ 15 ನೇ ತಾರೀಖಿನೊಳಗೆ ಮಾಸಿಕ ಹಣ ಪಾವತಿಸುವುದು ಕಡ್ಡಾಯ. ಮುಂದಿನ ತಿಂಗಳುಗಳು ಅವುಗಳ ದಿನಾಂಕ ಬರುವವರೆಗೆ ಲೈವ್ ಕೌಂಟ್‌ಡೌನ್‌ನೊಂದಿಗೆ ಲಾಕ್ ಆಗಿರುತ್ತವೆ.',
    is_active: true,
  },
  {
    id: 'rule-03',
    order: 3,
    category: 'loan',
    title: 'Baddi Chitti 10% Flat Monthly Interest',
    title_kn: 'ಬಡ್ಡಿ ಚಿಟ್ಟಿ 10% ಮಾಸಿಕ ಬಡ್ಡಿ',
    description: 'Baddi Chitti loans carry a flat 10% monthly interest. Borrowing opens in April 2026; borrower repayments commence from May 2026 onward.',
    description_kn: 'ಬಡ್ಡಿ ಚಿಟ್ಟಿ ಸಾಲಕ್ಕೆ ಪ್ರತಿ ತಿಂಗಳು 10% ನಿಗದಿತ ಬಡ್ಡಿ ಇರುತ್ತದೆ. ಏಪ್ರಿಲ್ 2026 ರಿಂದ ಸಾಲ ನೀಡಿಕೆ ಆರಂಭವಾಗಲಿದ್ದು, ಮೇ 2026 ರಿಂದ ಮರುಪಾವತಿ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.',
    is_active: true,
  },
  {
    id: 'rule-04',
    order: 4,
    category: 'loan',
    title: 'Single Active Loan Per Member',
    title_kn: 'ಒಬ್ಬರಿಗೆ ಒಂದೇ ಸಾಲದ ನಿಯಮ',
    description: 'A member may only take one active loan at a time. The borrower must fully settle principal and 10% interest before taking a subsequent chitti.',
    description_kn: 'ಒಬ್ಬ ಸದಸ್ಯರಿಗೆ ಒಂದೇ ಸಮಯದಲ್ಲಿ ಒಂದು ಸಾಲಕ್ಕೆ ಮಾತ್ರ ಅವಕಾಶ. ಹಿಂದಿನ ಸಾಲ ಮತ್ತು ಬಡ್ಡಿಯನ್ನು ಪೂರ್ಣವಾಗಿ ತೀರಿಸಿದ ನಂತರವೇ ಹೊಸ ಸಾಲ ಪಡೆಯಬಹುದು.',
    is_active: true,
  },
  {
    id: 'rule-05',
    order: 5,
    category: 'accounting',
    title: 'Grand Total Accounting Formula',
    title_kn: 'ಒಟ್ಟು ನಿಧಿ ಲೆಕ್ಕಾಚಾರದ ಸೂತ್ರ',
    description: 'Loan principal is disbursed directly out of the collected monthly fund. Therefore, Tournament Grand Total = Total Monthly Contributions + Baddi Chitti 10% Interest Earned.',
    description_kn: 'ಸಾಲದ ಮೂಲ ಮೊತ್ತವನ್ನು ಸಂಗ್ರಹಿಸಿದ ಮಾಸಿಕ ಫಂಡ್‌ನಿಂದಲೇ ನೀಡಲಾಗುತ್ತದೆ. ಆದ್ದರಿಂದ ಟೂರ್ನಮೆಂಟ್ ಒಟ್ಟು ಹಣ = ಒಟ್ಟು ಮಾಸಿಕ ದೇಣಿಗೆ + ಬಂದಿರುವ 10% ಬಡ್ಡಿ ಮೊತ್ತ ಮಾತ್ರ.',
    is_active: true,
  },
  {
    id: 'rule-06',
    order: 6,
    category: 'general',
    title: '100% Public Transparency — No Player Login Needed',
    title_kn: 'ಸಂಪೂರ್ಣ ಗ್ರಾಮ ಪಾರದರ್ಶಕತೆ — ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ',
    description: 'No password or login is required for players or villagers! Anyone can freely view player profiles, monthly payment lists, countdown clocks, and loan records anytime.',
    description_kn: 'ಆಟಗಾರರಿಗೆ ಮತ್ತು ಊರಿನ ಗ್ರಾಮಸ್ಥರಿಗೆ ಯಾವುದೇ ಲಾಗಿನ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ! ಯಾರು ಬೇಕಾದರೂ ಎಲ್ಲಾ ಸದಸ್ಯರ ಪಟ್ಟಿ, ಪಾವತಿ ಸ್ಥಿತಿ ಮತ್ತು ಸಾಲದ ವಿವರಗಳನ್ನು ಮುಕ್ತವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು.',
    is_active: true,
  },
  {
    id: 'rule-07',
    order: 7,
    category: 'general',
    title: 'Month Closure & Admin Phone Audit Lock',
    title_kn: 'ತಿಂಗಳು ಮುಕ್ತಾಯ ಮತ್ತು ಆಡಿಟ್ ಲಾಕ್',
    description: 'Completed months are locked for audit. Only authorized committee members can record collections, issue loans, or close months using phone verification.',
    description_kn: 'ಮುಕ್ತಾಯವಾದ ತಿಂಗಳುಗಳನ್ನು ಆಡಿಟ್‌ಗಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ. ನೋಂದಾಯಿತ ಆಡಳಿತ ಅಧಿಕಾರಿಗಳು ಮಾತ್ರ ಮೊಬೈಲ್ ದೃಢೀಕರಣದೊಂದಿಗೆ ತಿಂಗಳು ಲಾಕ್ ಮಾಡಬಹುದು ಮತ್ತು ತಿದ್ದುಪಡಿ ಮಾಡಬಹುದು.',
    is_active: true,
  },
];

export const SEED_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-01',
    sender_name: 'Developer Sudeepa ML',
    sender_kmpl_id: 'KMPL01',
    is_admin: true,
    message: 'Welcome everyone to KMPL Season 01 Community Chat! Let us maintain sportsmanship and transparent cricket finance.',
    created_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'msg-02',
    sender_name: 'Kiran Kumar (President)',
    sender_kmpl_id: 'KMPL02',
    is_admin: true,
    message: 'Reminder to all members: Monthly contribution deadline is on the 15th of each month.',
    created_at: '2026-04-01T10:15:00Z',
  },
  {
    id: 'msg-03',
    sender_name: 'Ravi Gowda',
    sender_kmpl_id: 'KMPL04',
    is_admin: false,
    message: 'Great initiative! Practice matches start this weekend at Kagalagere ground.',
    created_at: '2026-04-01T11:30:00Z',
  },
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    title: 'KMPL Season 01 Official Tournament Kickoff',
    body: 'Welcome all Kagalagere Megala Hatti members! Season 01 monthly collections start April 2026. Every player must contribute on or before the 15th of each month.',
    posted_by: 'Developer Sudeepa ML',
    is_pinned: true,
    created_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'ann-02',
    title: 'Uniform & Kit Distribution Schedule',
    body: 'Team jersey and match ball distribution will take place at the village ground on the upcoming Sunday. All senior and junior players are requested to attend.',
    posted_by: 'Kiran Kumar (President)',
    is_pinned: false,
    created_at: '2026-04-05T14:30:00Z',
  },
];

// Local Storage In-Memory Reactive Store (Admins, Rules, Chat, Announcements only)
// Local Storage In-Memory Reactive Store (Admins, Rules, Chat, Announcements, Players fallback)
class LocalStore {
  players: Player[];
  payments: MonthlyPayment[] = [];
  loans: Loan[] = [];
  admins: Admin[];
  closedMonths: ClosedMonth[];
  rules: FundRule[];
  chatMessages: ChatMessage[];
  announcements: Announcement[];
  listeners: (() => void)[] = [];

  constructor() {
    this.players = this.load('kmpl_local_players', []);
    this.payments = [];
    this.loans = [];
    this.admins = this.load('kmpl_admins', SEED_ADMINS);
    this.closedMonths = this.load('kmpl_closed_months', SEED_CLOSED_MONTHS);
    this.rules = this.load('kmpl_rules', SEED_RULES);
    this.chatMessages = this.load('kmpl_chat_messages', SEED_CHAT_MESSAGES);
    this.announcements = this.load('kmpl_announcements', SEED_ANNOUNCEMENTS);
  }

  load<T>(key: string, defaultVal: T): T {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultVal;
      } catch {
        return defaultVal;
      }
    }
    return defaultVal;
  }

  save() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('kmpl_local_players', JSON.stringify(this.players));
    localStorage.setItem('kmpl_admins', JSON.stringify(this.admins));
    localStorage.setItem('kmpl_closed_months', JSON.stringify(this.closedMonths));
    localStorage.setItem('kmpl_rules', JSON.stringify(this.rules));
    localStorage.setItem('kmpl_chat_messages', JSON.stringify(this.chatMessages));
    localStorage.setItem('kmpl_announcements', JSON.stringify(this.announcements));
    this.notify();
  }

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(l => l());
  }
}

export const localStore = new LocalStore();

/**
 * Extracts a readable message from any thrown value.
 * Supabase errors are plain objects (not `Error` instances), so
 * `err instanceof Error` fails and the real cause gets hidden.
 */
export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object') {
    const e = err as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [e.message, e.details, e.hint].filter(Boolean);
    if (parts.length) return `${parts.join(' | ')}${e.code ? ` (code ${e.code})` : ''}`;
  }
  return fallback;
};

export const db = {
  // --- PLAYERS ---
  /**
   * Fetches the live player roster from Supabase.
   * Merges with any locally created players when offline or in dev.
   */
  async getPlayers(): Promise<Player[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('players').select('*').order('kmpl_id');
        if (!error && data) {
          // Only return real DB players; local-only "ghost" players have fake IDs
          // that break payments and loans (player_id must be a real UUID)
          return data as Player[];
        }
        if (error) {
          console.error('Error fetching players from Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase getPlayers exception:', err);
      }
    }
    return [...localStore.players];
  },

  async addPlayer(player: Omit<Player, 'id' | 'created_at'>): Promise<Player> {
    const payload = {
      kmpl_id: player.kmpl_id,
      name: player.name,
      // phone is NOT NULL in the schema, so never omit it
      phone: player.phone && player.phone.trim().length > 0 ? player.phone.trim() : '-',
      type: player.type,
      monthly_amount: player.monthly_amount,
      join_date: player.join_date || new Date().toISOString().split('T')[0],
      chitti_taken: Boolean(player.chitti_taken),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('players').insert([payload]).select().single();
      // Surface the real error instead of silently saving a fake local player
      if (error) throw error;
      return data as Player;
    }

    throw new Error('Supabase is not configured to add players.');
  },

  async updatePlayer(id: string, updates: Partial<Player>): Promise<void> {
    const payload: Record<string, unknown> = { ...updates };
    if (!payload.phone) {
      delete payload.phone;
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('players').update(payload).eq('id', id);
        if (!error) return;
        if (error && error.message.includes('phone')) {
          delete payload.phone;
          const retry = await supabase.from('players').update(payload).eq('id', id);
          if (!retry.error) return;
        }
      } catch (err) {
        console.warn('Supabase updatePlayer fallback:', err);
      }
    }

    const idx = localStore.players.findIndex((p) => p.id === id);
    if (idx >= 0) {
      localStore.players[idx] = { ...localStore.players[idx], ...updates };
      localStore.save();
    }
  },

  async deletePlayer(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('players').delete().eq('id', id);
        if (!error) return;
      } catch (err) {
        console.warn('Supabase deletePlayer fallback:', err);
      }
    }

    localStore.players = localStore.players.filter((p) => p.id !== id);
    localStore.save();
  },

  // --- MONTHLY PAYMENTS ---
  /**
   * Fetches payments live from Supabase.
   * Never falls back to sample or mock data; returns [] when empty or on error.
   */
  async getPayments(month?: string): Promise<MonthlyPayment[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('monthly_payments').select('*');
        if (month) query = query.eq('month', month);
        const { data, error } = await query;
        if (error) {
          console.error('Error fetching payments from Supabase:', error.message);
          return [];
        }
        return (data as MonthlyPayment[]) || [];
      } catch (err) {
        console.error('Supabase getPayments exception:', err);
        return [];
      }
    }
    return [];
  },

  async recordPayment(
    playerId: string,
    month: string,
    status: 'PAID' | 'PENDING',
    paymentMethod?: 'Cash' | 'UPI',
    upiReference?: string,
    recordedBy?: string
  ): Promise<MonthlyPayment> {
    // Check if month is upcoming
    if (isFutureMonth(month)) {
      throw new Error(`Month ${month} is upcoming and locked. Collections open when the month starts.`);
    }

    const isClosed = await this.isMonthClosed(month);
    if (isClosed) {
      throw new Error(`Month ${month} is closed and cannot be modified.`);
    }

    const payload = {
      player_id: playerId,
      month,
      status,
      payment_method: status === 'PAID' ? paymentMethod || 'Cash' : null,
      upi_reference: status === 'PAID' && paymentMethod === 'UPI' ? upiReference : null,
      paid_at: status === 'PAID' ? new Date().toISOString() : null,
      recorded_by: status === 'PAID' ? recordedBy || 'Authorized Officer' : null,
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('monthly_payments')
        .upsert([payload], { onConflict: 'player_id,month' })
        .select()
        .single();
      if (error) throw error;
      return data as MonthlyPayment;
    }

    throw new Error('Supabase is not configured to record payments.');
  },

  // --- BADDI CHITTI (LOANS) ---
  /**
   * Fetches loans live from Supabase.
   * Never falls back to sample or mock data; returns [] when empty or on error.
   */
  async getLoans(): Promise<Loan[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('loans').select('*').order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching loans from Supabase:', error.message);
          return [];
        }
        return (data as Loan[]) || [];
      } catch (err) {
        console.error('Supabase getLoans exception:', err);
        return [];
      }
    }
    return [];
  },

  async issueLoan(
    playerId: string,
    playerName: string,
    principal: number,
    lendingMonth: string,
    recordedBy?: string
  ): Promise<Loan> {
    if (isFutureMonth(lendingMonth)) {
      throw new Error(`Month ${lendingMonth} is upcoming and locked. Loans cannot be issued for future months.`);
    }

    const interest = Math.round(principal * 0.10);
    const totalReturn = principal + interest;

    const parts = lendingMonth.split(' ');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    let mIdx = monthNames.indexOf(parts[0]);
    let yr = parseInt(parts[1], 10);
    mIdx += 1;
    if (mIdx > 11) {
      mIdx = 0;
      yr += 1;
    }
    const repaymentMonth = `${monthNames[mIdx]} ${yr}`;
    const dueDate = `${yr}-${String(mIdx + 1).padStart(2, '0')}-15`;

    const newLoanData = {
      player_id: playerId,
      player_name: playerName,
      principal,
      interest,
      total_return: totalReturn,
      lending_month: lendingMonth,
      repayment_month: repaymentMonth,
      due_date: dueDate,
      status: 'ACTIVE' as const,
      recorded_by: recordedBy || 'Authorized Officer',
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('loans').insert([newLoanData]).select().single();
      if (error) throw error;
      await supabase.from('players').update({ chitti_taken: true }).eq('id', playerId);
      return data as Loan;
    }

    throw new Error('Supabase is not configured to issue loans.');
  },

  async repayLoan(
    loanId: string,
    paymentMethod: 'Cash' | 'UPI',
    upiReference?: string,
    recordedBy?: string
  ): Promise<void> {
    const updatePayload = {
      status: 'PAID' as const,
      payment_method: paymentMethod,
      upi_reference: paymentMethod === 'UPI' ? upiReference : null,
      paid_at: new Date().toISOString(),
      recorded_by: recordedBy || 'Authorized Officer',
    };

    if (isSupabaseConfigured) {
      const { data: loan, error } = await supabase
        .from('loans')
        .update(updatePayload)
        .eq('id', loanId)
        .select()
        .single();
      if (error) throw error;

      if (loan?.player_id) {
        const { data: activeLoans } = await supabase
          .from('loans')
          .select('id')
          .eq('player_id', loan.player_id)
          .in('status', ['ACTIVE', 'OVERDUE']);
        if (!activeLoans || activeLoans.length === 0) {
          await supabase.from('players').update({ chitti_taken: false }).eq('id', loan.player_id);
        }
      }
      return;
    }

    throw new Error('Supabase is not configured to repay loans.');
  },

  // --- CLOSED MONTHS ---
  async getClosedMonths(): Promise<ClosedMonth[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('closed_months').select('*');
        if (!error && data) return data as ClosedMonth[];
      } catch (err) {
        console.warn('Supabase closed_months fallback to localStore:', err);
      }
    }
    return [...localStore.closedMonths];
  },

  async isMonthClosed(month: string): Promise<boolean> {
    const closedList = await this.getClosedMonths();
    return closedList.some(c => c.month === month);
  },

  // Any authorized admin can enter their registered mobile number or email to close/lock the month
  async closeMonthWithAdminAuth(month: string, phoneOrEmail: string): Promise<{ success: boolean; error?: string }> {
    const cleanInput = phoneOrEmail.replace(/\D/g, '');
    const cleanEmail = phoneOrEmail.trim().toLowerCase();

    // Check if input matches any registered admin phone or email
    const admins = await this.getAdmins();
    const authorizedAdmin = admins.find(a => {
      const aPhoneClean = (a.phone || '').replace(/\D/g, '');
      const phoneMatch = cleanInput.length >= 8 && aPhoneClean === cleanInput;
      const emailMatch = a.email.toLowerCase() === cleanEmail;
      return phoneMatch || emailMatch;
    });

    if (!authorizedAdmin) {
      return {
        success: false,
        error: 'Input does not match any registered tournament officer credentials.',
      };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('close_month', {
          target_month: month,
          phone_input: authorizedAdmin.phone || authorizedAdmin.email,
        });
        if (!error && data) return data as { success: boolean; error?: string };
      } catch (err) {
        console.warn('Supabase rpc close_month fallback to localStore:', err);
      }
    }

    if (!localStore.closedMonths.some(c => c.month === month)) {
      localStore.closedMonths.push({
        month,
        closed_by: `${authorizedAdmin.name} (${authorizedAdmin.email})`,
        closed_at: new Date().toISOString(),
      });
      localStore.save();
    }
    return { success: true };
  },

  // --- ADMINS / MULTI-OFFICER SYSTEM ---
  async getAdmins(): Promise<Admin[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('admins').select('*').order('created_at');
        if (!error && data && data.length > 0) return data as Admin[];
      } catch (err) {
        console.warn('Supabase admins fallback to localStore:', err);
      }
    }
    return [...localStore.admins];
  },

  async addAdmin(admin: Omit<Admin, 'id' | 'created_at'>, playerType: PlayerType = 'Senior'): Promise<Admin> {
    let createdAdmin: Admin;
    const adminData = {
      name: admin.name.trim(),
      email: admin.email.trim().toLowerCase(),
      phone: admin.phone?.trim() || '',
      is_developer: Boolean(admin.is_developer),
      role_title: admin.role_title?.trim() || 'Tournament Officer',
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('admins').insert([adminData]).select().single();
        if (!error && data) {
          createdAdmin = data as Admin;
        } else {
          throw error;
        }
      } catch (err) {
        console.warn('Supabase addAdmin error, falling back to localStore:', err);
        createdAdmin = {
          ...adminData,
          id: 'a_' + Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString(),
        };
        localStore.admins.push(createdAdmin);
        localStore.save();
      }
    } else {
      createdAdmin = {
        ...adminData,
        id: 'a_' + Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString(),
      };
      localStore.admins.push(createdAdmin);
      localStore.save();
    }

    // Every administrator is also an active player in the tournament ("also me also player").
    // Automatically ensure this new officer appears in the player directory with the Admin symbol!
    try {
      const currentPlayers = await this.getPlayers();
      const cleanAdminPhone = (admin.phone || '').replace(/\D/g, '').slice(-10);
      const aName = admin.name.toLowerCase().trim();

      const existingPlayer = currentPlayers.find((p) => {
        const cleanPlayerPhone = (p.phone || '').replace(/\D/g, '').slice(-10);
        const phoneMatch = cleanAdminPhone.length >= 8 && cleanPlayerPhone.length >= 8 && cleanPlayerPhone === cleanAdminPhone;
        const pName = p.name.toLowerCase().trim();
        const nameMatch = pName === aName || aName.startsWith(pName) || pName.startsWith(aName);
        return phoneMatch || nameMatch;
      });

      if (!existingPlayer) {
        let maxNum = 0;
        currentPlayers.forEach((p) => {
          const match = p.kmpl_id.match(/KMPL(\d+)/i);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
        const nextKmplId = `KMPL${String(maxNum + 1).padStart(2, '0')}`;
        await this.addPlayer({
          kmpl_id: nextKmplId,
          name: admin.name,
          phone: admin.phone || '',
          type: playerType,
          monthly_amount: playerType === 'Junior' ? 100 : 200,
          join_date: '2026-04-01',
          chitti_taken: false,
        });
      }
    } catch (syncErr) {
      console.warn('Auto-sync admin to players directory error:', syncErr);
    }

    return createdAdmin;
  },

  async deleteAdminWithDeveloperAuth(adminId: string, phone: string): Promise<{ success: boolean; error?: string }> {
    const target = localStore.admins.find(a => a.id === adminId);
    if (target?.is_developer) {
      return { success: false, error: 'The primary Developer Admin cannot be deleted under any circumstances.' };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('delete_admin', {
        target_admin_id: adminId,
        phone_input: phone,
      });
      if (error) return { success: false, error: error.message };
      return data as { success: boolean; error?: string };
    }

    const cleanInput = phone.replace(/\D/g, '');
    const isDevPhone = cleanInput === '7760880282';
    if (!isDevPhone) {
      return { success: false, error: 'Invalid developer authorization phone number.' };
    }

    localStore.admins = localStore.admins.filter(a => a.id !== adminId);
    localStore.save();
    return { success: true };
  },

  // --- FUND RULES & REGULATIONS (ADMIN CAN SET RULES SHOWN TO ALL PLAYERS) ---
  async getRules(): Promise<FundRule[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('tournament_rules').select('*').order('order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as FundRule[];
      }
    }
    return [...localStore.rules].sort((a, b) => a.order - b.order);
  },

  async updateRules(newRules: FundRule[], adminName?: string): Promise<{ success: boolean; error?: string }> {
    const timestamp = new Date().toISOString();
    const updated = newRules.map((r, idx) => ({
      ...r,
      order: idx + 1,
      updated_at: timestamp,
      updated_by: adminName || r.updated_by || 'Admin Committee',
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tournament_rules').upsert(updated);
      if (error) {
        // Fallback to local storage if table is not yet migrated
        console.warn('Supabase tournament_rules upsert error, falling back to local store:', error.message);
      }
    }

    localStore.rules = updated;
    localStore.save();
    return { success: true };
  },

  async saveRule(rule: FundRule, adminName?: string): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getRules();
    const index = existing.findIndex(r => r.id === rule.id);
    const timestamp = new Date().toISOString();
    const enriched: FundRule = {
      ...rule,
      updated_at: timestamp,
      updated_by: adminName || 'Admin Committee',
    };

    let updatedList: FundRule[];
    if (index >= 0) {
      updatedList = [...existing];
      updatedList[index] = enriched;
    } else {
      enriched.order = existing.length + 1;
      updatedList = [...existing, enriched];
    }

    return this.updateRules(updatedList, adminName);
  },

  async deleteRule(ruleId: string): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getRules();
    const filtered = existing.filter(r => r.id !== ruleId);
    return this.updateRules(filtered);
  },

  async resetRulesToDefault(): Promise<{ success: boolean; error?: string }> {
    localStore.rules = [...SEED_RULES];
    localStore.save();
    return { success: true };
  },

  // --- COMMUNITY CHAT ---
  /**
   * Fetch the last 100 chat messages, oldest at the top.
   */
  async getChatMessages(): Promise<ChatMessage[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (!error && data) {
          // Reverse so oldest is at the top, newest at the bottom
          return (data as ChatMessage[]).reverse();
        }
      } catch (err) {
        console.warn('Supabase chat_messages fallback to localStore:', err);
      }
    }
    return [...localStore.chatMessages].slice(-100);
  },

  /**
   * Send a new chat message to the community chat table.
   */
  async sendChatMessage(msg: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
    const payload = {
      sender_name: msg.sender_name.trim(),
      sender_kmpl_id: msg.sender_kmpl_id.trim(),
      is_admin: Boolean(msg.is_admin),
      message: msg.message.trim(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert([payload])
          .select()
          .single();
        if (!error && data) {
          return data as ChatMessage;
        }
      } catch (err) {
        console.warn('Supabase insert chat_message fallback to localStore:', err);
      }
    }

    const newMsg: ChatMessage = {
      ...payload,
      id: 'chat_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    localStore.chatMessages.push(newMsg);
    if (localStore.chatMessages.length > 200) {
      localStore.chatMessages = localStore.chatMessages.slice(-100);
    }
    localStore.save();
    return newMsg;
  },

  /**
   * Delete a chat message (Admins only).
   */
  async deleteChatMessage(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('chat_messages').delete().eq('id', id);
        if (!error) return;
      } catch (err) {
        console.warn('Supabase delete chat_message fallback to localStore:', err);
      }
    }

    localStore.chatMessages = localStore.chatMessages.filter(m => m.id !== id);
    localStore.save();
  },

  // --- ANNOUNCEMENTS ---
  /**
   * Fetch all announcements, sorted with pinned first, then newest first.
   */
  async getAnnouncements(): Promise<Announcement[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as Announcement[];
        }
      } catch (err) {
        console.warn('Supabase getAnnouncements fallback to localStore:', err);
      }
    }

    return [...localStore.announcements].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  },

  /**
   * Create a new announcement (Admins only).
   */
  async createAnnouncement(payload: {
    title: string;
    body: string;
    posted_by: string;
    is_pinned?: boolean;
  }): Promise<Announcement> {
    const isPinned = !!payload.is_pinned;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .insert([
            {
              title: payload.title.trim(),
              body: payload.body.trim(),
              posted_by: payload.posted_by.trim(),
              is_pinned: isPinned,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return data as Announcement;
        }
      } catch (err) {
        console.warn('Supabase createAnnouncement fallback to localStore:', err);
      }
    }

    const newAnn: Announcement = {
      id: 'ann_' + Math.random().toString(36).substring(2, 9),
      title: payload.title.trim(),
      body: payload.body.trim(),
      posted_by: payload.posted_by.trim(),
      is_pinned: isPinned,
      created_at: new Date().toISOString(),
    };

    localStore.announcements.unshift(newAnn);
    localStore.announcements.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    localStore.save();
    return newAnn;
  },

  /**
   * Toggle pin status of an announcement (Admins only).
   */
  async togglePinAnnouncement(id: string, is_pinned: boolean): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('announcements')
          .update({ is_pinned })
          .eq('id', id);
        if (!error) return;
      } catch (err) {
        console.warn('Supabase togglePinAnnouncement fallback to localStore:', err);
      }
    }

    const ann = localStore.announcements.find((a) => a.id === id);
    if (ann) {
      ann.is_pinned = is_pinned;
      localStore.announcements.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      localStore.save();
    }
  },

  /**
   * Delete an announcement (Admins only).
   */
  async deleteAnnouncement(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id);
        if (!error) return;
      } catch (err) {
        console.warn('Supabase deleteAnnouncement fallback to localStore:', err);
      }
    }

    localStore.announcements = localStore.announcements.filter((a) => a.id !== id);
    localStore.save();
  },

  /**
   * Realtime Update Subscription.
   * Fixes Supabase Realtime error: "cannot add postgres_changes callbacks for realtime:kmpl_realtime_all after subscribe()".
   * 1. Uses a unique channel name per mount (kmpl_realtime_${Date.now()}_...).
   * 2. Chains .on('postgres_changes', ...) BEFORE calling .subscribe().
   * 3. Cleans up via supabase.removeChannel(channel) on unmount.
   */
  subscribeToChanges(onUpdate: () => void): () => void {
    if (isSupabaseConfigured) {
      // 1 & 2: Generate unique channel name per mount to prevent callback collisions
      const channelName = `kmpl_realtime_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // 1: Attach all .on('postgres_changes', ...) handlers in a single chain BEFORE .subscribe()
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            onUpdate();
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.warn(`[Supabase Realtime] Channel ${channelName} subscription error:`, err);
          }
        });

      // 3: In cleanup, remove the channel from Supabase client
      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (cleanupErr) {
          console.warn(`[Supabase Realtime] Error removing channel ${channelName}:`, cleanupErr);
        }
      };
    }
    return localStore.subscribe(onUpdate);
  },
};

export const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};
