# KMPL Cricket — Village Tournament Finance Tracker

Complete, responsive, mobile-first financial management and transparency portal for the Kagalagere Megala Hatti Premier League (KMPL), featuring public player audits, month-by-month fund collections with live countdowns, interest-bearing chitti loan ledgers with WhatsApp sharing, and an OTP-secured Admin Panel backed by Supabase with security-definer RPC validations.

### User Review & Critical Decisions

> [!IMPORTANT]
> The implementation provides a production-ready Supabase backend alongside an instant, resilient simulated database mode. If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are unset, the app runs immediately with pre-seeded village rosters, letting you test every feature (OTP, collections, loan issuance, Kannada toggle) without broken states. As soon as environment variables are connected, it automatically switches to live PostgreSQL and Realtime channels.

- **Confirmed Decision 1 (Connectivity Strategy)**: Resilient simulation mode with auto-switch to live Supabase once environment variables are set; includes an in-app Database Settings modal to verify connection status or test with live credentials.
- **Confirmed Decision 2 (Pre-seeded Data)**: Pre-populates realistic village players (Senior ₹200 and Junior ₹100 tiers) and payment records so the 13-month cycle and Baddi Chitti ledgers are immediately testable.
- **Confirmed Decision 3 (Localization)**: English by default with instantaneous Kannada toggle persisted in `localStorage` across 22+ key terminology strings.

---

### 1. Overview & Core Concept

- **What It Does**: Provides absolute transparency for KMPL cricket tournament funds. Players can check their payment status, inspect directory rosters, monitor locked future months, review Baddi Chitti loans, and examine cumulative treasury balances. Designated administrators authenticate via Supabase Email OTP to mark payments (Cash or UPI), issue loans, record repayments with interest, close locked months, and manage officer rosters with developer-level phone number verification.
- **Target Audience / Persona**:
  - *Village Players & Youth*: Transparently audit tournament contributions, verify who paid on time, and share loan summaries.
  - *Tournament Officers & Developer Admin (Sudeepa ML)*: Maintain orderly records, prevent collection discrepancies, and lock months securely.
- **Key Value**: Eliminates physical ledger confusion, builds village community trust with open records, and prevents unauthorized budget modifications through PostgreSQL Row Level Security (RLS) and security-definer RPC safeguards.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  - *Player Directory & Profile*: Instant search and fuzzy filter by Name, KMPL ID (e.g. `KMPL01`), or mobile number. Quick modal to pick from an alphabetical directory. Tapping a member reveals a card modal with tier, monthly amount, join date, and active chitti status.
  - *Monthly Fund Cards (April 2026 – April 2027)*: 13 cards rendered in sequence. Past/current unlocked months display paid vs. pending player rosters with sort order by `paid_at`. Future months are locked, showing a real-time countdown timer (`Xd Yh Zm Ws`) ticking down to the 15th collection deadline.
  - *Baddi Chitty Ledger*: View active and overdue loans. Displays principal, calculated 10% interest, total return due, lending date, and due date. Includes a one-tap Web Share button with WhatsApp (`wa.me`) message formatting.
  - *Cumulative Report*: Pulsing gradient card showing Tournament Grand Total (paid contributions + earned loan interest), with interactive segmented toggles to view monthly fund breakdown vs. Baddi Chitti interest breakdown.
  - *Admin OTP Login*: Email OTP flow via Supabase Auth (`signInWithOtp` and `verifyOtp`), complemented by an admin roster modal to pick registered tournament officers.
  - *Admin Dashboard & Controls*: Collect fund modal with Cash/UPI selectors and UPI reference capture; Month Lockout gated by developer phone verification RPC; loan creation and repayment workflows; and admin roster management.

- **Visual Identity & Theme**:
  - *Aesthetic*: Cricket-inspired athletic emerald green (`#047857`, `#064e3b`) paired with warm trophy gold (`#f59e0b`, `#d97706`) and clean stadium slate neutrals.
  - *Typography*: Athletic, bold sans headings (`Outfit` / `Plus Jakarta Sans`) paired with tabular numerals (`font-mono tabular-nums`) for currency and countdowns.
  - *Ergonomics & Layout*: Strictly follows mobile thumb-zone rules with a 44px+ minimum tap target, compact top app bar with one-tap language switch, and an ergonomic bottom tab bar on mobile that expands seamlessly into a responsive multi-column layout on desktop.

- **Interactive Feedback & Motion**:
  - Ticking live countdowns on future months with zero-latency updates.
  - Subtle spring modal transitions, tactile button active states (`active:scale-[0.98]`), and toast notifications for payment confirmations and share triggers.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Mode Database Architecture (Supabase + Resilient Local Store)**
  - *Chosen Approach*: Implement a unified repository layer (`/src/lib/database.ts`) that reads from `@supabase/supabase-js` when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided, with real-time channel subscriptions. When keys are absent, it operates in an interactive local mode with pre-seeded data and complete state mutations.
  - *Why*: Ensures the application compiles and is instantly previewable in the sandbox without hanging on unconfigured remote credentials, while maintaining 100% Supabase fidelity.
- **Decision 2: Strict Security-Definer RPC Functions for Protected Actions**
  - *Chosen Approach*: Put developer phone validation (`7760880282`) inside server-side PostgreSQL RPC functions (`verify_developer`, `close_month`, `delete_admin`). The phone number is never exposed as hardcoded client-side verification logic in production SQL.
  - *Why*: Guarantees that even if client-side code is inspected, sensitive actions (locking historical tournament records or deleting admin accounts) cannot be bypassed.
- **Decision 3: Zero-Pill Tabular UI Discipline**
  - *Chosen Approach*: Replace generic candy pill badges with clean typography, tabular numbers (`₹200`, `₹100`), unboxed status indicators, and high-contrast status icons.
  - *Why*: Aligns with domain guidelines and prevents cluttered mobile screens during outdoor village daylight usage.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              KMPL Cricket                              │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: Wordmark "KMPL Cricket" | Language Toggle (EN / ಕನ್ನಡ)       │
├────────────────────────────────────────────────────────────────────────┤
│                       React Router 6 View Routing                      │
│                                                                        │
│   ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────────┐  │
│   │ Player Portal   │  │ Monthly Fund    │  │ Baddi Chitty Ledger   │  │
│   │ /directory      │  │ /fund (13 mos)  │  │ /loans (active/share) │  │
│   └────────┬────────┘  └────────┬────────┘  └───────────┬───────────┘  │
│            │                    │                       │              │
│   ┌────────┴────────┐  ┌────────┴────────┐  ┌───────────┴───────────┐  │
│   │ Cumulative Rep. │  │ Admin OTP Login │  │ Admin Control Center  │  │
│   │ /report (Total) │  │ /admin/login    │  │ /admin/dashboard      │  │
│   └─────────────────┘  └─────────────────┘  └───────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│                     State & Service Architecture                       │
│                                                                        │
│   ┌───────────────────────────┐     ┌──────────────────────────────┐   │
│   │    LanguageContext (i18n) │     │      AuthContext (Supabase)  │   │
│   │   22+ EN / KN dictionary  │     │   OTP Verify & Admin Guard   │   │
│   └─────────────┬─────────────┘     └──────────────┬───────────────┘   │
│                 │                                  │                   │
│                 ▼                                  ▼                   │
│       ┌──────────────────────────────────────────────────────┐         │
│       │             Database Client Interface                │         │
│       │             (src/lib/database.ts)                    │         │
│       └───────────┬──────────────────────────────┬───────────┘         │
│                   │                              │                     │
│         (If keys present)              (Fallback / Offline)            │
│                   ▼                              ▼                     │
│       ┌────────────────────────┐     ┌───────────────────────┐         │
│       │ @supabase/supabase-js  │     │ Local Reactive Store  │         │
│       │ Postgres RLS + Realtime│     │ Pre-seeded Demo Data  │         │
│       └────────────────────────┘     └───────────────────────┘         │
└────────────────────────────────────────────────────────────────────────┘
```

- **Database Tables & SQL Artifact (`/supabase_schema.sql`)**:
  - `players`: `id` (UUID), `kmpl_id` (`KMPL01`...), `name`, `phone`, `type` (`Senior` ₹200 | `Junior` ₹100), `monthly_amount`, `join_date`, `chitti_taken` (bool), `created_at`.
  - `monthly_payments`: `id`, `player_id` (FK), `month` (e.g. `'April 2026'`), `status` (`'PAID'`|`'PENDING'`), `payment_method` (`'Cash'`|`'UPI'`), `upi_reference`, `paid_at`.
  - `loans`: `id`, `player_id` (FK), `player_name`, `principal`, `interest` (10%), `total_return`, `lending_month`, `repayment_month`, `due_date`, `status` (`'ACTIVE'`|`'PAID'`|`'OVERDUE'`), `payment_method`, `upi_reference`, `paid_at`.
  - `admins`: `id`, `name`, `phone`, `email` (unique), `is_developer` (bool).
  - `closed_months`: `month` (PK), `closed_by`, `closed_at`.
  - `RPC Functions`: `verify_developer(phone text)`, `close_month(month text, phone text)`, `delete_admin(admin_id uuid, phone text)`.
  - Realtime publication on all tables.
- **Full Implementation Scope**:
  - Package installation: `install_applet_package` for `@supabase/supabase-js` and `react-router-dom`.
  - Code modularity: `/src/lib/supabase.ts`, `/src/lib/database.ts`, `/src/i18n/translations.ts`, `/src/context/AuthContext.tsx`, `/src/context/LanguageContext.tsx`, `/src/hooks/useRealtimeData.ts`, component modals, and `/supabase_schema.sql` with complete instructions in `/README.md`.
