# ✈️ SkyBook — Flight Management Platform

A modern, full-stack flight booking platform built with **Next.js 14**, **Supabase**, and **TypeScript**. Features real-time seat selection, secure booking, and full PWA support for offline-capable experience.

**Live Demo:** [https://sky-book-delta.vercel.app](https://sky-book-delta.vercel.app)

---

## 🚀 Features

- **Flight Search** — Search flights by origin, destination, and date across multiple Indian routes
- **Real-time Seat Map** — Interactive visual seat selection with live availability updates via Supabase Realtime
- **Secure Booking** — End-to-end booking flow with Zod validation, PNR generation, and atomic seat reservation (Postgres RPC)
- **Booking Management** — View bookings, cancel, or reschedule with one click
- **Authentication** — Supabase Auth with email/password signup and login
- **PWA Support** — Installable, offline-capable progressive web app (see below)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **Real-time** | Supabase Realtime (Postgres Changes) |
| **State** | Zustand (with persist middleware) |
| **Validation** | Zod |
| **Styling** | Tailwind CSS |
| **PWA** | @ducanh2912/next-pwa |
| **Deployment** | Vercel |

---

## 📲 PWA (Progressive Web App) — Task 05

SkyBook is a fully installable and offline-capable Progressive Web App.

### Features Implemented

| Feature | Details |
|---------|---------|
| **Manifest** | Valid `manifest.json` with app name, icons (192×192 & 512×512), theme colour `#0a0e1a`, `display: standalone` |
| **Service Worker** | Auto-generated via `@ducanh2912/next-pwa` with Workbox runtime caching |
| **Cache: Static Assets** | `CacheFirst` strategy for `/_next/static/`, icons, favicon, Google Fonts |
| **Cache: Flight Data** | `StaleWhileRevalidate` strategy for flight search results and Supabase API calls |
| **Offline Fallback** | Custom `/offline` page shown when connectivity is lost |
| **Offline My Bookings** | My Bookings page reads from `localStorage` cache when offline, showing last-cached data with a visual "offline" indicator |
| **Install Prompt** | Slide-up banner for first-time mobile visitors with 7-day dismissal cooldown |

### Lighthouse PWA Audit

> **Note:** Run a Lighthouse audit on the production deployment at [https://sky-book-delta.vercel.app](https://sky-book-delta.vercel.app) using Chrome DevTools → Lighthouse → PWA category.

<!-- Add your Lighthouse PWA screenshot below -->
<!-- ![Lighthouse PWA Score](./docs/lighthouse-pwa.png) -->

---

## 🗄️ Database Schema

The database uses 5 tables managed through sequential migrations:

- **flights** — Flight schedule with routes, times, pricing
- **seats** — Seat inventory with class, pricing, availability (real-time)
- **bookings** — User bookings with PNR codes and status tracking
- **passengers** — Passenger details linked to bookings
- **reschedules** — Reschedule audit trail

All data access is secured with **Row-Level Security (RLS)** policies.

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Source-Asia
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project URL, anon key, and service role key.

4. **Run database migrations:**
   Execute migrations `001` through `005` in order via the Supabase SQL Editor.

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 📦 Production Build

```bash
npm run build    # Generates optimized build + service worker
npm run start    # Runs production server locally
```

---

## 🌐 Deployment

Deployed on **Vercel** with automatic CI/CD on push. Environment variables configured in Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
