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
import { Player, MonthlyPayment, Loan, Admin, ClosedMonth, FundRule } from '../types';

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

const SEED_PLAYERS: Player[] = [
  { id: 'p01', kmpl_id: 'KMPL01', name: 'Sudeepa ML', phone: '7760880282', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: true },
  { id: 'p02', kmpl_id: 'KMPL02', name: 'Kiran Kumar K', phone: '9900112233', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p03', kmpl_id: 'KMPL03', name: 'Manjunath H', phone: '9844556677', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p04', kmpl_id: 'KMPL04', name: 'Ravi Gowda', phone: '9448123456', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: true },
  { id: 'p05', kmpl_id: 'KMPL05', name: 'Chetan Kumar', phone: '9880123456', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p06', kmpl_id: 'KMPL06', name: 'Darshan M', phone: '9741234567', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p07', kmpl_id: 'KMPL07', name: 'Naveen Kumar', phone: '9611234567', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p08', kmpl_id: 'KMPL08', name: 'Praveen Gowda', phone: '9480234567', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p09', kmpl_id: 'KMPL09', name: 'Abhishek R', phone: '9986345678', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p10', kmpl_id: 'KMPL10', name: 'Shashank B', phone: '9845345678', type: 'Senior', monthly_amount: 200, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p11', kmpl_id: 'KMPL11', name: 'Varun Gowda', phone: '9731456789', type: 'Junior', monthly_amount: 100, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p12', kmpl_id: 'KMPL12', name: 'Yashwanth M', phone: '9620456789', type: 'Junior', monthly_amount: 100, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p13', kmpl_id: 'KMPL13', name: 'Girish K', phone: '9535567890', type: 'Junior', monthly_amount: 100, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p14', kmpl_id: 'KMPL14', name: 'Chandan S', phone: '9449567890', type: 'Junior', monthly_amount: 100, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p15', kmpl_id: 'KMPL15', name: 'Puneeth Kumar', phone: '9164678901', type: 'Junior', monthly_amount: 100, join_date: '2026-04-01', chitti_taken: false },
  { id: 'p16', kmpl_id: 'KMPL16', name: 'Sharath Gowda', phone: '9008678901', type: 'Junior', monthly_amount: 100, join_date: '2026-04-01', chitti_taken: false },
];

const SEED_PAYMENTS: MonthlyPayment[] = [
  { id: 'pay1', player_id: 'p01', month: 'April 2026', status: 'PAID', payment_method: 'UPI', upi_reference: 'UPI/20260405/9823412', paid_at: '2026-04-05T10:30:00Z', recorded_by: 'Developer Sudeepa ML' },
  { id: 'pay2', player_id: 'p02', month: 'April 2026', status: 'PAID', payment_method: 'UPI', upi_reference: 'UPI/20260405/9823413', paid_at: '2026-04-05T11:00:00Z', recorded_by: 'Kiran Kumar (President)' },
  { id: 'pay3', player_id: 'p03', month: 'April 2026', status: 'PAID', payment_method: 'Cash', paid_at: '2026-04-06T14:10:00Z', recorded_by: 'Manjunath H (Treasurer)' },
  { id: 'pay4', player_id: 'p04', month: 'April 2026', status: 'PAID', payment_method: 'UPI', upi_reference: 'UPI/20260406/4412399', paid_at: '2026-04-06T15:20:00Z', recorded_by: 'Developer Sudeepa ML' },
  { id: 'pay5', player_id: 'p05', month: 'April 2026', status: 'PAID', payment_method: 'UPI', upi_reference: 'UPI/20260407/7718223', paid_at: '2026-04-07T09:45:00Z', recorded_by: 'Kiran Kumar (President)' },
  { id: 'pay6', player_id: 'p06', month: 'April 2026', status: 'PAID', payment_method: 'Cash', paid_at: '2026-04-08T16:00:00Z', recorded_by: 'Manjunath H (Treasurer)' },
  { id: 'pay7', player_id: 'p07', month: 'April 2026', status: 'PAID', payment_method: 'Cash', paid_at: '2026-04-09T18:30:00Z', recorded_by: 'Developer Sudeepa ML' },
  { id: 'pay8', player_id: 'p11', month: 'April 2026', status: 'PAID', payment_method: 'UPI', upi_reference: 'UPI/20260410/1199283', paid_at: '2026-04-10T12:00:00Z', recorded_by: 'Kiran Kumar (President)' },
  { id: 'pay9', player_id: 'p12', month: 'April 2026', status: 'PAID', payment_method: 'UPI', upi_reference: 'UPI/20260411/5522119', paid_at: '2026-04-11T13:30:00Z', recorded_by: 'Manjunath H (Treasurer)' },
  { id: 'pay10', player_id: 'p13', month: 'April 2026', status: 'PAID', payment_method: 'Cash', paid_at: '2026-04-12T17:15:00Z', recorded_by: 'Developer Sudeepa ML' },
  { id: 'pay11', player_id: 'p08', month: 'April 2026', status: 'PENDING' },
  { id: 'pay12', player_id: 'p09', month: 'April 2026', status: 'PENDING' },
  { id: 'pay13', player_id: 'p10', month: 'April 2026', status: 'PENDING' },
  { id: 'pay14', player_id: 'p14', month: 'April 2026', status: 'PENDING' },
  { id: 'pay15', player_id: 'p15', month: 'April 2026', status: 'PENDING' },
  { id: 'pay16', player_id: 'p16', month: 'April 2026', status: 'PENDING' },
];

const SEED_LOANS: Loan[] = [
  {
    id: 'l01',
    player_id: 'p01',
    player_name: 'Sudeepa ML',
    principal: 10000,
    interest: 1000,
    total_return: 11000,
    lending_month: 'April 2026',
    repayment_month: 'May 2026',
    due_date: '2026-05-15',
    status: 'PAID',
    payment_method: 'UPI',
    upi_reference: 'UPI/20260514/9912001',
    paid_at: '2026-05-14T11:20:00Z',
    recorded_by: 'Kiran Kumar (President)',
  },
  {
    id: 'l02',
    player_id: 'p04',
    player_name: 'Ravi Gowda',
    principal: 5000,
    interest: 500,
    total_return: 5500,
    lending_month: 'April 2026',
    repayment_month: 'May 2026',
    due_date: '2026-05-15',
    status: 'ACTIVE',
    recorded_by: 'Developer Sudeepa ML',
  },
  {
    id: 'l03',
    player_id: 'p06',
    player_name: 'Darshan M',
    principal: 8000,
    interest: 800,
    total_return: 8800,
    lending_month: 'May 2026',
    repayment_month: 'June 2026',
    due_date: '2026-06-15',
    status: 'PAID',
    payment_method: 'Cash',
    paid_at: '2026-06-12T15:40:00Z',
    recorded_by: 'Manjunath H (Treasurer)',
  },
  {
    id: 'l04',
    player_id: 'p07',
    player_name: 'Naveen Kumar',
    principal: 6000,
    interest: 600,
    total_return: 6600,
    lending_month: 'May 2026',
    repayment_month: 'June 2026',
    due_date: '2026-06-15',
    status: 'ACTIVE',
    recorded_by: 'Developer Sudeepa ML',
  },
];

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

// Local Storage In-Memory Reactive Store
class LocalStore {
  players: Player[];
  payments: MonthlyPayment[];
  loans: Loan[];
  admins: Admin[];
  closedMonths: ClosedMonth[];
  rules: FundRule[];
  listeners: (() => void)[] = [];

  constructor() {
    this.players = this.load('kmpl_players', SEED_PLAYERS);
    this.payments = this.load('kmpl_payments', SEED_PAYMENTS);
    this.loans = this.load('kmpl_loans', SEED_LOANS);
    this.admins = this.load('kmpl_admins', SEED_ADMINS);
    this.closedMonths = this.load('kmpl_closed_months', SEED_CLOSED_MONTHS);
    this.rules = this.load('kmpl_rules', SEED_RULES);
    this.autoFlagOverdue();
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
    localStorage.setItem('kmpl_players', JSON.stringify(this.players));
    localStorage.setItem('kmpl_payments', JSON.stringify(this.payments));
    localStorage.setItem('kmpl_loans', JSON.stringify(this.loans));
    localStorage.setItem('kmpl_admins', JSON.stringify(this.admins));
    localStorage.setItem('kmpl_closed_months', JSON.stringify(this.closedMonths));
    localStorage.setItem('kmpl_rules', JSON.stringify(this.rules));
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

  autoFlagOverdue() {
    const today = new Date().toISOString().split('T')[0];
    let changed = false;
    this.loans.forEach(loan => {
      if (loan.status === 'ACTIVE' && loan.due_date < today) {
        loan.status = 'OVERDUE';
        changed = true;
      }
    });
    if (changed) this.save();
  }
}

export const localStore = new LocalStore();

export const db = {
  // --- PLAYERS ---
  async getPlayers(): Promise<Player[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('players').select('*').order('kmpl_id');
        if (!error && data && data.length > 0) return data as Player[];
      } catch (err) {
        console.warn('Supabase players fallback to localStore:', err);
      }
    }
    return [...localStore.players].sort((a, b) => a.kmpl_id.localeCompare(b.kmpl_id));
  },

  async addPlayer(player: Omit<Player, 'id' | 'created_at'>): Promise<Player> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('players').insert([player]).select().single();
        if (!error && data) return data as Player;
      } catch (err) {
        console.warn('Supabase insert player fallback to localStore:', err);
      }
    }
    const newPlayer: Player = {
      ...player,
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    localStore.players.push(newPlayer);
    localStore.save();
    return newPlayer;
  },

  async updatePlayer(id: string, updates: Partial<Player>): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('players').update(updates).eq('id', id);
        if (!error) return;
      } catch (err) {
        console.warn('Supabase update player fallback to localStore:', err);
      }
    }
    const idx = localStore.players.findIndex(p => p.id === id);
    if (idx !== -1) {
      localStore.players[idx] = { ...localStore.players[idx], ...updates };
      localStore.save();
    }
  },

  async deletePlayer(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('players').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete player notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase delete player fallback to localStore:', err);
      }
    }
    localStore.players = localStore.players.filter(p => p.id !== id);
    localStore.payments = localStore.payments.filter(p => p.player_id !== id);
    localStore.loans = localStore.loans.filter(l => l.player_id !== id);
    localStore.save();
  },

  // --- MONTHLY PAYMENTS ---
  async getPayments(month?: string): Promise<MonthlyPayment[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('monthly_payments').select('*');
        if (month) query = query.eq('month', month);
        const { data, error } = await query;
        if (!error && data) return data as MonthlyPayment[];
      } catch (err) {
        console.warn('Supabase payments fallback to localStore:', err);
      }
    }
    if (month) {
      return localStore.payments.filter(p => p.month === month);
    }
    return [...localStore.payments];
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

    const existingIdx = localStore.payments.findIndex(
      p => p.player_id === playerId && p.month === month
    );
    if (existingIdx !== -1) {
      localStore.payments[existingIdx] = {
        ...localStore.payments[existingIdx],
        ...payload,
      };
      localStore.save();
      return localStore.payments[existingIdx];
    } else {
      const newPay: MonthlyPayment = {
        id: 'pay_' + Math.random().toString(36).substring(2, 9),
        ...payload,
      };
      localStore.payments.push(newPay);
      localStore.save();
      return newPay;
    }
  },

  // --- BADDI CHITTI (LOANS) ---
  async getLoans(): Promise<Loan[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('loans').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as Loan[];
      } catch (err) {
        console.warn('Supabase loans fallback to localStore:', err);
      }
    }
    localStore.autoFlagOverdue();
    return [...localStore.loans];
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

    const newLoan: Loan = {
      id: 'loan_' + Math.random().toString(36).substring(2, 9),
      ...newLoanData,
      created_at: new Date().toISOString(),
    };
    localStore.loans.unshift(newLoan);
    const pIdx = localStore.players.findIndex(p => p.id === playerId);
    if (pIdx !== -1) {
      localStore.players[pIdx].chitti_taken = true;
    }
    localStore.save();
    return newLoan;
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

    const idx = localStore.loans.findIndex(l => l.id === loanId);
    if (idx !== -1) {
      localStore.loans[idx] = { ...localStore.loans[idx], ...updatePayload };
      const playerId = localStore.loans[idx].player_id;
      const remainingActive = localStore.loans.filter(
        l => l.player_id === playerId && (l.status === 'ACTIVE' || l.status === 'OVERDUE')
      );
      if (remainingActive.length === 0) {
        const pIdx = localStore.players.findIndex(p => p.id === playerId);
        if (pIdx !== -1) localStore.players[pIdx].chitti_taken = false;
      }
      localStore.save();
    }
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

  // Any authorized admin can enter their registered mobile number to close/lock the month
  async closeMonthWithAdminAuth(month: string, phone: string): Promise<{ success: boolean; error?: string }> {
    const cleanInput = phone.replace(/\D/g, '');

    // Check if phone matches any registered admin
    const admins = await this.getAdmins();
    const authorizedAdmin = admins.find(a => a.phone.replace(/\D/g, '') === cleanInput);

    if (!authorizedAdmin) {
      return {
        success: false,
        error: 'Phone number does not match any registered tournament officer.',
      };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('close_month', {
          target_month: month,
          phone_input: phone,
        });
        if (!error && data) return data as { success: boolean; error?: string };
      } catch (err) {
        console.warn('Supabase rpc close_month fallback to localStore:', err);
      }
    }

    if (!localStore.closedMonths.some(c => c.month === month)) {
      localStore.closedMonths.push({
        month,
        closed_by: `${authorizedAdmin.name} (${authorizedAdmin.phone})`,
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

  async addAdmin(admin: Omit<Admin, 'id' | 'created_at'>): Promise<Admin> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('admins').insert([admin]).select().single();
      if (error) throw error;
      return data as Admin;
    }
    const newAdmin: Admin = {
      ...admin,
      id: 'a_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    localStore.admins.push(newAdmin);
    localStore.save();
    return newAdmin;
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
