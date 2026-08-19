# CPMS

Client & project management portal. Track clients, projects (budget + status), generate invoices, and see revenue — built with Next.js, Tailwind CSS, Firebase Auth (auth only), and NeonDB (Postgres, all data).

## Features

- **Sign-in only auth** — no signup flow. Users are created manually in the Firebase Console; they sign in with the email/password you give them.
- **Clients** — contact records with linked projects and invoices.
- **Projects** — budget, ongoing/completed status, timeline, a members list for tagging teammates invited to the project, and per-project commissions (percent-of-budget or fixed amount payouts to named people).
- **Invoices** — line items, tax %, paid/unpaid status, printable invoice view (browser print → save as PDF).
- **Revenue** — collected vs. outstanding totals, revenue by month, revenue by client.
- **Settings** — display name and default currency (applied across all money amounts in the app).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with:
   - `NEXT_PUBLIC_FIREBASE_*` — your Firebase web app config (Firebase Console → Project Settings → your web app)
   - `DATABASE_URL` — your Neon Postgres connection string
   - `FIREBASE_ADMIN_PROJECT_ID` / `FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY` — from a Firebase service account key (Project Settings → Service accounts → Generate new private key)

3. Set up your backends:
   - **Firebase Authentication** → Sign-in method → enable **Email/Password**, then add your users under Authentication → Users.
   - **Neon** → create a database, then run `lib/schema.sql` against it to create the `clients`, `projects`, `invoices`, and `user_profiles` tables.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and sign in with a user you created in the Console.

## Data model

Firebase Auth handles sign-in only. All app data lives in Neon Postgres, accessed exclusively through Next.js Server Actions (`lib/actions.ts`) — the browser never talks to Postgres directly. Every Server Action verifies the caller's Firebase ID token (`lib/firebase-admin.ts`) before touching the database; there's no per-row ownership, just "must be signed in" — any authenticated user can read/write everything. Client components call a thin wrapper (`lib/data.ts`) that attaches the current user's ID token and forwards to the Server Action. Tables: `clients`, `projects` (includes `members` and `commissions` jsonb), `invoices`, `user_profiles` (display name + currency, keyed by Firebase uid). Schema lives in `lib/schema.sql`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the project
