# AIDynamic.pro — CTO MASTER PLAN
**Date:** June 17, 2026 | **Model:** Same as 305business (replicate + adapt)
**Status:** PLANNING → BUILDING

---

## 🎯 Mission

Build a complete authentication + client portal + admin system for AIDynamic.pro AI agency.

**User must log in to:**
- Book consultations (currently open — will add auth gate)
- View project dashboard (new)
- Access client portal (new)

**Jasmel gets email notifications for:**
- New consultation bookings
- New contact form submissions
- New client signups
- Project status updates

---

## 🎨 AIDynamic.pro Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--midnight` | `#0a0e1a` | Background |
| `--deep-blue` | `#0f1729` | Card bg |
| `--electric` | `#3b82f6` | Primary accent |
| `--electric-glow` | `rgba(59,130,246,0.4)` | Glow effects |
| `--cyan` | `#06b6d4` | Secondary accent |
| `--soft-white` | `#f8fafc` | Light text |
| `--text-primary` | `#e2e8f0` | Body text |
| `--text-secondary` | `#94a3b8` | Muted text |
| `--text-muted` | `#64748b` | Subtle text |
| Font Primary | `Inter` | Body |
| Font Display | `Space Grotesk` | Headings |

---

## 🏗️ Architecture (Same Pattern as 305business)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  AIDynamic.pro  │────▶│  Supabase Auth  │────▶│  profiles table │
│  (Vercel)       │     │  (magic links)  │     │  (user data)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Brevo Email    │◄────│  Client Portal  │
│  (notifications)│     │  (dashboard)    │
└─────────────────┘     └─────────────────┘
```

---

## 📋 Deliverables

### Phase 1: Auth System (Same as 305business, adapted theme)
- `login.html` — Magic link login
- `signup.html` — Role selection (Client/Admin) → Profile → Verify
- `profile.html` — Edit profile, security, danger zone
- `forgot-password.html` — Magic link recovery
- `reset-password.html` — Token verification
- `js/auth.js` — AuthManager (adapted colors)
- `js/auth-guard.js` — Route protection
- `js/nav.js` — Auth-aware navigation (adapted to AIDynamic design)

### Phase 2: Client Portal (NEW — Different from 305business)
- `dashboard.html` — Client dashboard
  - Active projects
  - Booking history
  - Consultation notes
  - Invoices (placeholder)
- `js/dashboard.js` — Client data operations

### Phase 3: Admin Dashboard (NEW — Lead Management)
- `admin.html` — Admin review queue
  - Leads table (consultation bookings, contact forms)
  - Client management
  - Project status tracking
  - PIN-protected (same: 3050)

### Phase 4: Email Notifications (NEW — AI Agency Templates)
- `js/email-notify.js` — Brevo integration
  - New consultation booking → Jasmel
  - New contact form → Jasmel
  - New client signup → Jasmel
  - Project status update → Client
  - Consultation reminder → Client

### Phase 5: Integration
- Auth gates on all pages
- Pre-fill client info in consultation forms
- Admin review for new leads
- Mobile responsive throughout

---

## 🏗️ Worker Assignments

| Worker | Task | File(s) | Priority |
|--------|------|---------|----------|
| **Kimi (Main)** | Auth system, nav, integration, plan | `js/auth.js`, `js/nav.js`, `login.html`, `signup.html` | P0 |
| **Worker 2** | Email notifications | `js/email-notify.js` | P1 |
| **Worker 3** | Client dashboard + Admin | `dashboard.html`, `admin.html`, `js/dashboard.js` | P1 |
| **Worker 4** | Consultation auth integration | `index.html` (consultation CTA) | P2 |
| **Worker 7** | Profile settings | `profile.html` | P2 |
| **Worker 8** | Auth guards + Password reset | `js/auth-guard.js`, `forgot-password.html`, `reset-password.html` | P2 |

---

## 🔧 Supabase Config

**Project:** Need to create or use existing
**URL:** TBD (need to check if AIDynamic has a Supabase project)
**Key:** TBD

If no Supabase project exists for AIDynamic, we can:
1. Reuse the same Supabase project (305business) with a different schema
2. Create a new Supabase project

For now, I'll use the same Supabase project but with a different table prefix (`aidynamic_`)

---

## 🚀 Deployment

**Production:** https://aidynamic.pro (Vercel)
**GitHub:** Pablodd1/aidynamic-pro-website

---

## 📋 Success Criteria

- [ ] User can sign up and log in with magic links
- [ ] User must log in to book consultations
- [ ] Client sees their dashboard with projects/bookings
- [ ] Admin (Jasmel) sees lead queue with approve/reject
- [ ] Jasmel gets email on every new lead
- [ ] All pages have auth guards where needed
- [ ] Mobile responsive
- [ ] Deployed to Vercel

---

## 📝 Notes

- Same auth pattern as 305business, but adapted for AIDynamic's dark theme
- Reuse `js/auth.js` and `js/auth-guard.js` from 305business (adapt colors)
- Different dashboard: projects instead of listings
- Different email templates: consultations instead of business listings
- Same Brevo API key
- Same admin PIN: 3050

*Let's build it.*
