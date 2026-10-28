/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TypeScript definitions for KMPL Cricket application.
 */

export type PlayerType = 'Senior' | 'Junior';

export interface Player {
  id: string;
  kmpl_id: string;
  name: string;
  phone: string;
  type: PlayerType;
  monthly_amount: number; // 200 for Senior, 100 for Junior
  join_date: string;
  chitti_taken: boolean;
  created_at?: string;
}

export type PaymentStatus = 'PAID' | 'PENDING';
export type PaymentMethod = 'Cash' | 'UPI';

export interface MonthlyPayment {
  id: string;
  player_id: string;
  month: string; // e.g., 'April 2026'
  status: PaymentStatus;
  payment_method?: PaymentMethod | null;
  upi_reference?: string | null;
  paid_at?: string | null;
  recorded_by?: string | null; // Tracks which admin entered the data
  created_at?: string;
}

export type LoanStatus = 'ACTIVE' | 'PAID' | 'OVERDUE';

export interface Loan {
  id: string;
  player_id: string;
  player_name: string;
  principal: number;
  interest: number; // 10% of principal
  total_return: number; // principal + interest
  lending_month: string;
  repayment_month?: string | null;
  due_date: string; // YYYY-MM-DD
  status: LoanStatus;
  payment_method?: PaymentMethod | null;
  upi_reference?: string | null;
  paid_at?: string | null;
  recorded_by?: string | null; // Tracks which admin authorized or collected
  created_at?: string;
}

export interface Admin {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_developer: boolean;
  role_title?: string;
  created_at?: string;
}

export interface ClosedMonth {
  month: string;
  closed_by: string;
  closed_at: string;
}

export type RuleCategory = 'contribution' | 'deadline' | 'loan' | 'accounting' | 'general';

export interface FundRule {
  id: string;
  order: number;
  category: RuleCategory;
  title: string;
  title_kn: string;
  description: string;
  description_kn: string;
  is_active: boolean;
  updated_at?: string;
  updated_by?: string;
}

export type Language = 'en' | 'kn';

