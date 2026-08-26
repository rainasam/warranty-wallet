# Warranty Wallet — Product & Technical Spec

## 1. Problem Statement

Consumers buy electronics and appliances (mobile, laptop, TV, washing machine,
headphones, watches, etc.) and routinely lose track of purchase invoices,
warranty end dates, extended warranty terms, AMC contracts, and service
history. This leads to missed warranty claims, lapsed AMC renewals, and no
single place to see "what do I own, and what's its coverage status right now."

**Warranty Wallet** is a web app that lets a user register a product once and
then automatically tracks its full ownership lifecycle — warranty, extended
warranty, AMC, and maintenance — surfacing what needs attention before it's
too late.  

## 2. Goals

- Register a newly purchased product and activate its warranty in one simple flow.
- Maintain the full warranty lifecycle per product (standard + extended), and proactively surface upcoming expiries.
- Track AMC contracts and periodic maintenance schedules, with service history/records, per product.
- Single centralized dashboard showing every product with live warranty/AMC status.
- Reduce missed claims and lapsed renewals via timely automated reminders.
- Sustainable business model via freemium subscription.

## 3. MVP Scope Decisions

| Decision | Choice |
|---|---|
| Platform | Responsive web app (PWA-ready), mobile app is a later phase reusing the same backend |
| Data entry | Manual form only (no OCR/receipt scanning in MVP) |
| Account model | Individual user accounts now; data model designed so household/family sharing can be added later without a rewrite |
| Reminders | Email only in MVP (in-app notification center can follow) |
| Freemium gate | By number of products tracked |
| Auth | Email/password + "Sign in with Google" |
| AMC/maintenance | Recurring interval + service log, with auto-calculated next-due date |
| Documents | File uploads allowed per product (invoice, warranty card, AMC contract, service bills) |
| Design style | Clean & minimal, status-color-coded (green / amber / red) |
| Dashboard | Card grid sorted by urgency, with a list/table view toggle |
| Categories | Preset categories with icons, shared underlying field set |

## 4. Tech Stack (recommended)

- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS
- **Backend:** Next.js server actions / API routes (same codebase as frontend)
- **Database:** PostgreSQL, hosted on Supabase or Neon
- **Auth:** Supabase Auth (email/password + Google OAuth) — issues sessions used by Next.js middleware
- **File storage:** Supabase Storage (invoices, warranty cards, AMC contracts, service bills)
- **Email:** Resend (transactional email for reminders, verification, welcome)
- **Scheduled jobs:** Vercel Cron (or Supabase Edge Function on a schedule) — runs daily to scan for upcoming expiries/renewals and send reminder emails
- **Payments/subscriptions:** Razorpay (India-first) or Stripe, for the paid tier
- **Hosting:** Vercel

This stack is chosen for: fast MVP velocity, generous free tiers, no separate backend to manage, and a straightforward upgrade path to a React Native mobile app later (same Supabase backend/API can be reused).

## 5. Information Architecture / Pages

1. **Landing page** (marketing/public) — value prop, how it works, pricing, sign up / log in CTA
2. **Sign up / Log in** — email+password and "Continue with Google"
3. **Dashboard** (home, authenticated)
   - Summary strip: total products, expiring soon count, AMC due count
   - Card grid of all products, sorted by urgency (expired → expiring soon → healthy), with a list/table view toggle
   - Filter/sort: by category, status, expiry date
   - "+ Add Product" primary CTA
4. **Add Product flow** (single simple flow, activates warranty in the same step)
   - Step 1: Category (preset icons) + basic info (name, brand, model)
   - Step 2: Purchase details (date, retailer, price, invoice upload)
   - Step 3: Warranty details (standard warranty length → auto-computes end date; optional extended warranty add-on with its own end date and document upload)
   - Step 4: Optional — set up AMC/maintenance right away, or skip and add later
   - Confirm & Save → lands on Product Detail page
5. **Product Detail page**
   - Header: product name/category/icon, current status badge (Active / Expiring Soon / Expired)
   - Warranty section: standard + extended warranty timeline, dates, documents
   - AMC section: contract provider, start/end, cost, maintenance interval, documents
   - Service history: chronological log of service records (date, technician/provider, notes, cost, attached bill), "+ Log Service" action which also recalculates next-due date
   - Edit / delete product
6. **AMC Schedule page** — a dedicated cross-product view listing every AMC contract's renewal date and every product's next maintenance/service-due date together in one sorted (soonest-first) list, so the user doesn't have to open each product individually to see what's coming up. Each row links through to its Product Detail page.
7. **Notifications / Reminders view** — log of reminders sent (email log), upcoming reminders
8. **Account / Profile settings** — name, email (read-only), change password, email/notification preferences, current plan display with usage (e.g. "3/5 products used") and upgrade CTA, delete account
9. **Pricing / Upgrade page** — free vs paid comparison, upgrade CTA (payment flow)
10. **FAQ page** — static help content answering common questions (how warranty tracking works, AMC vs warranty, freemium limits, etc.)
11. **Feedback page** — simple in-app form (message + optional rating) that saves submissions to the database for review; no email setup required
12. **Privacy Policy page** — standard draft covering what data is collected (account info, product/purchase details, uploaded documents) and how it's used; explicitly a starting draft, not a substitute for legal review before a real public launch
13. **Terms & Conditions page** — standard draft covering account terms, freemium/subscription terms, acceptable use; same legal-review caveat as the Privacy Policy

## 6. Core Data Model (conceptual)

- **User**: id, email, name, auth provider, plan (free/paid), created_at
- **Product**: id, user_id, category, name, brand, model, purchase_date, retailer, price, notes, invoice_file, created_at
- **WarrantyPeriod**: id, product_id, type (standard | extended), start_date, end_date, provider, document_file
- **AMCContract**: id, product_id, provider, start_date, end_date, cost, maintenance_interval_months, document_file
- **ServiceRecord**: id, amc_contract_id (nullable, can also log against a product directly), service_date, technician/provider, notes, cost, document_file, next_due_date (auto-calculated from interval)
- **ReminderLog**: id, user_id, related_entity (warranty/amc/service), fire_date, channel (email), sent_at, status
- **Feedback**: id, user_id (nullable, in case feedback is ever allowed pre-login), message, rating (nullable), created_at

Status for any product (used for dashboard badges) is derived, not stored: computed from the nearest of {warranty end date, extended warranty end date, AMC end date, next maintenance due date}.

- **Active** — furthest trigger is >30 days away
- **Expiring Soon** — within 30 days
- **Expired / Overdue** — date has passed

## 7. Reminder Logic (MVP)

Daily scheduled job scans all users' active warranty/AMC/maintenance dates and sends one consolidated email per user (not one email per item) when any item crosses these thresholds before its end/due date:

- 30 days before
- 7 days before
- 1 day before
- On the day / on overdue (for AMC & maintenance)

Each ReminderLog entry prevents duplicate sends for the same threshold.

## 8. Freemium Model (MVP)

| | Free | Paid |
|---|---|---|
| Products tracked | Up to 5 | Unlimited |
| Standard warranty tracking | ✅ | ✅ |
| Extended warranty tracking | ✅ | ✅ |
| AMC & maintenance tracking | ✅ | ✅ |
| Document uploads | ✅ (limited storage) | ✅ (higher storage) |
| Email reminders | ✅ | ✅ |
| Price | ₹0 | TBD (e.g. ₹99/mo or ₹799/yr) — pricing to be finalized later |

Product model includes a `plan` field on User and a product-count check on the "Add Product" flow that blocks/soft-prompts an upgrade once the free user hits the limit.

## 9. Product Categories (preset, MVP)

📱 Mobile · 💻 Laptop · 📺 TV · 🧺 Washing Machine · ❄️ Refrigerator/AC · 🎧 Audio (headphones/speakers) · ⌚ Watch/Wearable · 🍳 Kitchen Appliance · 📦 Other

All categories share the same underlying fields (brand, model, purchase date, retailer, price, warranty, AMC) — category only changes the icon/label shown, keeping the form simple to build while still feeling tailored.

## 10. Design Direction

Clean & minimal aesthetic (Notion/Linear-like): white/near-white background,
dark slate text, a single accent color for CTAs, card-based layout, generous
whitespace. Status is communicated primarily through color-coded badges:
green = active/healthy, amber = expiring soon, red = expired/overdue. Sidebar
navigation on desktop, bottom/hamburger nav on mobile web.

## 11. Out of Scope for MVP (future phases)

- Receipt/invoice OCR auto-fill
- Native mobile app (iOS/Android)
- Household/multi-user sharing on one account
- Push notifications / SMS / WhatsApp reminders
- In-app notification center
- Marketplace/integration with retailers or manufacturers for auto warranty registration

## 12. Build Plan (how we'll actually build this, in order)

Building in vertical phases — each phase ends with something real you can click through, not just scaffolding.

**Phase 0 — Project setup ✅ done**
- Scaffold Next.js + TypeScript + Tailwind project, push to a GitHub repo
- Create Supabase project, run initial schema migration (`users`, `products`, `warranty_periods`, `amc_contracts`, `service_records`, `reminder_log`) with RLS enabled
- Wire up Supabase Auth (email/password) and confirm sign up/log in works end-to-end locally

**Phase 1 — Core product + warranty tracking ✅ done**
- Add Product flow: category picker, purchase details, warranty details, save
- Product Detail page: view warranty status, delete
- Dashboard: card grid of products with computed status badges (Active/Expiring Soon/Expired), sorted by urgency
- Custom shield logo, teal/blue brand palette, Lucide category icons

**Phase 2 — Extended warranty, AMC & maintenance ✅ done**
- Extend Add Product flow with extended warranty section
- AMC contract creation (provider, dates, cost, maintenance interval)
- Service record logging + auto-calculated next-due date
- Dashboard/status logic updated to factor in AMC end dates

**Phase 3 — Documents (next up)**
- File upload wired to Supabase Storage for invoices, warranty cards, AMC contracts, service bills
- Attach/view/download documents from Product Detail page

**Phase 4 — AMC Schedule, FAQ, Feedback & legal pages**
- AMC Schedule page: cross-product list of AMC renewals + next service-due dates, sorted soonest-first
- FAQ page (static content)
- Feedback page: simple form saved to a new `feedback` table
- Privacy Policy and Terms & Conditions pages (draft placeholder text, flagged for legal review before public launch)

**Phase 5 — Reminders**
- Resend integration for transactional email
- Daily scheduled job (Vercel Cron) scanning for 30/7/1-day and overdue thresholds
- Reminder log to prevent duplicate sends; a simple "Notifications" view of what's been sent

**Phase 6 — Freemium & full profile administration**
- Free tier product-count limit (5) enforced on Add Product
- Profile/account settings page: name, change password, email/notification preferences, plan usage display, delete account
- Pricing/upgrade page (payment integration can follow once pricing is finalized — see Open Items)

**Phase 7 — Google sign-in**
- Google Cloud Console OAuth setup, enable provider in Supabase, add "Continue with Google" to login/signup

**Phase 8 — Deploy & polish**
- Deploy to Vercel on the default URL, connect production Supabase project
- End-to-end smoke test (sign up → add product → get a reminder email)
- Visual polish pass against the design direction in §10, responsive check on mobile web
- Ready for real testers; custom domain and payments can be layered in after

We'll build and check in phase by phase rather than all at once, so you can see and use each piece before we move to the next.

## 13. Database

**Choice: Supabase (managed Postgres)** — confirmed.

Reasons this fits Warranty Wallet specifically:
- Relational data (User → Products → Warranty/Extended Warranty → AMC → Service Records) maps cleanly to Postgres tables with foreign keys.
- Supabase bundles Auth (email/password + Google OAuth) and Storage (file uploads for invoices/warranty cards/AMC contracts/service bills) with the DB, so there's one dashboard and one set of credentials instead of three separate services to wire together.
- Row Level Security (RLS) policies enforce "a user can only read/write their own products" directly at the database layer — important since this is personal financial/ownership data.
- Free tier (500MB DB, 1GB file storage, 50k monthly active users) comfortably covers MVP → early growth; upgrade to Pro (~$25/mo) only when actually needed.

Table structure follows the conceptual data model in §6: `users`, `products`, `warranty_periods`, `amc_contracts`, `service_records`, `reminder_log`, each with `user_id`/`product_id` foreign keys and RLS scoped to `auth.uid()`.

## 14. Deployment Plan

| | Decision |
|---|---|
| Hosting | Vercel (frontend + serverless API routes) |
| Database/Auth/Storage | Supabase project (production) |
| Domain | None yet — launch on the default `*.vercel.app` URL; add a custom domain later without any re-architecture |
| Scale posture | Start entirely on free tiers (Vercel, Supabase, Resend); monitor usage and upgrade individual services only when limits are actually approached |
| Environments | Single production environment for MVP; add a separate Supabase project + Vercel preview deployments for staging once the app has real users |

**Account setup (you have neither Vercel nor Supabase yet) — steps when we reach deployment:**
1. Create a free Vercel account at vercel.com (sign up with GitHub — makes deploys automatic on every push).
2. Create a free Supabase account at supabase.com, create a new project (choose a region close to your users, e.g. Mumbai/ap-south-1 for India).
3. In Supabase: run the schema migration (tables from §6/§13), enable Google as an Auth provider, create a Storage bucket for documents.
4. In Vercel: import the GitHub repo, add Supabase environment variables (project URL + anon/service keys) and Resend API key, deploy.
5. Verify the deployed `*.vercel.app` URL works end-to-end (sign up, add a product, receive a test reminder email) before treating it as "publicly launched."
6. When ready for a custom domain: register one (I can suggest name ideas then) and attach it in Vercel's Domains settings — no code changes needed.

I'll walk you through each of these steps live when we get to that part of the build, rather than doing it all now.

## 15. Open Items to Confirm Before/During Build

- Final subscription pricing (₹ amount, monthly vs annual)
- Payment provider: Razorpay vs Stripe (Razorpay recommended if targeting India primarily)
- App logo / brand accent color
- Exact free-tier storage limit for documents
- Custom domain name (once you're ready to move off the default Vercel URL)

## 16. Known Limitation: Email Confirmation Currently Disabled

Supabase's "Confirm email" setting is turned **off** in production (Authentication → Sign In / Providers), so new signups activate immediately without clicking a confirmation link. This is a deliberate, temporary workaround — not an oversight.

**Why:** Supabase's free-tier default email sender doesn't allow customizing the confirmation email template (gated behind "Set up custom SMTP to edit templates"). The default template's link doesn't hand off `token_hash`/`type` the way the app's `/auth/confirm` route (`src/app/auth/confirm/route.ts`) expects, so every real confirmation click — tested with both a corporate Workspace email and a plain Gmail address — landed on a "Could not verify email" error, permanently blocking signup completion.

**Real fix requires:**
1. Purchasing and verifying a real custom domain (deferred per §14 Deployment Plan — currently launching on the free `*.vercel.app` URL)
2. Verifying that domain in Resend (currently sandbox mode — can only email the account owner)
3. Configuring Supabase custom SMTP with Resend, using a template link of `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
4. Re-enabling "Confirm email"

Until all four are done, do not re-enable "Confirm email" — it will block all signups again.
