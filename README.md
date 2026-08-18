# CPMS

Client & project management portal. Track clients, projects (budget + status), generate invoices, and see revenue — built with Next.js, Tailwind CSS, Firebase Auth, and Firestore.

## Features

- **Sign-in only auth** — no signup flow. Users are created manually in the Firebase Console; they sign in with the email/password you give them.
- **Clients** — contact records with linked projects and invoices.
- **Projects** — budget, ongoing/completed status, timeline, and a members list for tagging teammates invited to the project.
- **Invoices** — line items, tax %, paid/unpaid status, printable invoice view (browser print → save as PDF).
- **Revenue** — collected vs. outstanding totals, revenue by month, revenue by client.
- **Settings** — display name and default currency (applied across all money amounts in the app).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in your Firebase project's web config (Firebase Console → Project Settings → your web app):

   ```bash
   cp .env.local.example .env.local
   ```

3. In the Firebase Console for your project:
   - **Authentication** → Sign-in method → enable **Email/Password**, then add your users under Authentication → Users.
   - **Firestore Database** → create a database, then deploy the security rules in `firestore.rules` (paste into the rules editor, or `firebase deploy --only firestore:rules` if the CLI is linked).

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and sign in with a user you created in the Console.

## Data model

All data lives directly in Firestore (no backend API routes) — the client SDK reads/writes `clients`, `projects`, `invoices`, and `users` (profile: display name + currency). Access is gated by `request.auth != null` in `firestore.rules`: any signed-in user can read/write everything. Project "members" are a reference tag only, not an access restriction.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the project
