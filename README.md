# KMPL Cricket (Kagalagere Megala Hatti Premier League)
## Transparent Village Cricket Tournament Finance & Baddi Chitti Tracker

A complete, responsive, mobile-first web application designed for absolute financial clarity and community trust in village cricket tournament funds.

---

### Key Features

1. **Player Portal (Open & Read-Only)**:
   - Search players by Name, KMPL ID (`KMPL01`), or Phone number (with fuzzy match).
   - Alphabetical modal picker to quickly find any member.
   - Member Profile dialog displaying membership tier (Senior ₹200 vs. Junior ₹100), monthly fee, join date, and loan status.
   - 👑 Crown prefix for registered administrators in all rosters.

2. **13-Month Tournament Fund (April 2026 – April 2027)**:
   - 13 distinct visual month cards.
   - Past/current months unlock to show Paid Players (ordered by `paid_at` ascending) and Pending Players.
   - Future months are locked with a live, real-time countdown timer (`Xd Yh Zm Ws`) ticking down to the 15th collection deadline.

3. **Baddi Chitty (Loan) Ledger**:
   - Transparent list of Active and Overdue tournament loans.
   - 10% monthly interest calculation (e.g. ₹10,000 principal + ₹1,000 interest = ₹11,000 total return).
   - One-tap Web Share API with instant WhatsApp (`wa.me`) loan breakdown link fallback.

4. **Grand Total Cumulative Report**:
   - Pulsing gradient grand total banner summing all member contributions + all earned interest.
   - Segmented toggle to inspect Monthly Contributions vs. Baddi Chitti Interest breakdown.

5. **OTP-Secured Admin Panel**:
   - Supabase Auth Email OTP (`signInWithOtp` and `verifyOtp` with 6-digit code).
   - Officer selector modal listing registered administrators. Seeded with Developer Sudeepa ML (`sudeepaml63@gmail.com`).
   - Collect Fund tool (Cash / UPI with reference number).
   - Close Month security-definer RPC lock gated by Developer Phone Number.
   - Baddi Chitti loan issuance and repayment recorder.
   - Admin roster management with protected developer-phone deletion.
   - Add/Edit player roster with auto-generated KMPL IDs.

6. **Bilingual Localization (English & Kannada)**:
   - Instant header toggle between English and ಕನ್ನಡ without page reload.
   - Persisted across visits in `localStorage`.

---

### Supabase Backend Setup Guide

Follow these simple steps to connect this application to your Supabase project:

#### Step 1: Run the Database Schema
1. Open your project on [database.new](https://database.new) or [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** in the left sidebar.
3. Open the file `supabase_schema.sql` from this repository.
4. Copy and paste the entire SQL content into the SQL Editor and click **Run**.
5. This creates all tables (`players`, `monthly_payments`, `loans`, `admins`, `closed_months`), enables Row Level Security (RLS), adds the `verify_developer`, `close_month`, and `delete_admin` RPC functions, activates Realtime replication, and seeds initial rosters and developer admin Sudeepa ML.

#### Step 2: Configure Supabase Auth Email OTP
1. In your Supabase Dashboard, go to **Authentication** -> **Providers** -> **Email**.
2. Make sure **Enable Email Provider** is checked.
3. Under **Confirm email**, ensure OTP verification is enabled (default in Supabase).
4. Save changes.

#### Step 3: Set Environment Variables
1. In your Supabase Dashboard, go to **Project Settings** -> **API**.
2. Copy your **Project URL** and **anon public** API key.
3. In this application's root directory, set:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. *Tip*: You can also input or change your Supabase credentials directly inside the app using the Database Settings icon in the header!

#### Step 4: Developer Admin Access
- The primary Developer Admin is **Developer Sudeepa ML** (`sudeepaml63@gmail.com`).
- Developer Authorization Phone Number: `7760880282` (validated securely inside PostgreSQL security-definer RPC functions).
