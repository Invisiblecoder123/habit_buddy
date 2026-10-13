# Habit Buddy — Gamified Discipline OS ⚔️🔥

A production-grade, hardened Gamified Habit Tracker web application designed with an RPG aesthetic, built with **React (Vite)**, **Tailwind CSS**, **Supabase (PostgreSQL with strict RLS)**, and **Gemini API**. Deployed on **Vercel** (Free Tier) and ready to wrap seamlessly into a native Android APK via **Capacitor**.

---

## 🏆 Key Features

- **🎮 RPG Discipline Progression:**
  - Real-time Discipline Score (XP) and 7 rank tiers (Novice Adept &rarr; Ascended Sovereign).
  - Streak Multipliers (`🔥 X Days`) with grand particle fanfare when achieving 100% daily discipline.
  - RPG Attribute System (Health, Intelligence, Strength, Relations, Mindfulness) where each completed habit levels up attribute stats.
- **✨ AI Motivational Banner (Gemini + Offline Vault):**
  - Daily motivation powered by Gemini API server-side (`/api/quote.js`).
  - **Zero-failure fallback:** Deterministic offline pool of 60 intense stoic/discipline quotes (`dayOfYear % 60`).
  - Text-to-speech audio reader and quote copy actions.
- **🛡️ Hardened Defense-in-Depth:**
  - Row Level Security (RLS) on all PostgreSQL tables.
  - Client-side XSS sanitization via DOMPurify.
  - Whitelisted category hex color validation.
  - `GEMINI_API_KEY` strictly isolated in serverless functions (never exposed to client bundle).
- **📱 Android APK (Capacitor Ready):**
  - Viewport safe-area insets (`env(safe-area-inset-top)` / `bottom`).
  - Tactile mobile checkboxes, Web Audio API sound generator, and haptic vibration feedback.
  - Pre-configured `capacitor.config.json` with dark status bar and splash screen.
- **⚡ Dual Mode (Cloud Sync + Offline Demo):**
  - Works seamlessly offline or as a guest demo out of the box.
  - Connect your Supabase project anytime for real-time cloud sync across devices.

---

## 🚀 Quick Start

### 1. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Database Setup (`schema.sql`)

1. Create a free project at [Supabase](https://supabase.com).
2. Go to **SQL Editor** &rarr; **New Query**.
3. Paste the contents of [`schema.sql`](./schema.sql) and click **Run**.
   - Enables RLS on `profiles`, `categories`, `habits`, and `habit_logs`.
   - Restricts all access strictly to `auth.uid() = user_id`.
   - Configures triggers to automatically create user profiles and starter RPG categories upon sign-up.
4. Copy your **Project URL** and **Anon Key** from **Project Settings > API**.

---

## 🌐 Deploying to Vercel (Free Tier)

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the following **Environment Variables** in Vercel:
   - `GEMINI_API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com).
   - `VITE_SUPABASE_URL`: Your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key.
4. Deploy! Vercel will automatically build the React app and mount `/api/quote.js` as a serverless function.

---

## 📱 Building Native Android APK (Capacitor)

```bash
# 1. Build the production web bundle
npm run build

# 2. Add Android platform
npx cap add android

# 3. Synchronize web assets with native project
npx cap sync

# 4. Open in Android Studio to build APK
npx cap open android
```
In Android Studio:
- Select **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate your release or debug APK.

---

## 📁 Project Architecture

```
habit-buddy/
├── api/
│   └── quote.js                  # Vercel Serverless Function (Gemini API server proxy)
├── capacitor.config.json         # Capacitor config for Android APK
├── public/
│   ├── favicon.svg               # Gamified flame emblem
│   └── manifest.json             # PWA web manifest
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx         # Supabase Sign In / Sign Up dialog
│   │   ├── BannerQuote.jsx       # AI Motivational Banner (Gemini + Fallback)
│   │   ├── CategoryModal.jsx     # Attribute manager with whitelisted color palette
│   │   ├── HabitCard.jsx         # Interactive checklist card with audio/haptics
│   │   ├── HabitModal.jsx        # Habit creator with day scheduler & XSS sanitization
│   │   ├── Header.jsx            # Top bar with sound toggle & cloud sync status
│   │   ├── LevelProgress.jsx     # Discipline XP bar & streak tracker
│   │   ├── StatsOverview.jsx     # RPG attribute tiers & 28-day activity heatmap
│   │   ├── SyncConfigModal.jsx   # Cloud sync credentials & setup guide
│   │   └── WeekStrip.jsx         # Interactive 7-day date selector
│   ├── data/
│   │   ├── defaultData.js        # Starter RPG categories & seed habits
│   │   └── fallbackQuotes.js     # Pool of 60 intense stoic motivational quotes
│   ├── lib/
│   │   ├── audio.js              # Synthesized Web Audio API chimes & haptics
│   │   ├── confetti.js           # Gamified particle celebration engine
│   │   ├── gamification.js       # Rank tiers & streak algorithms
│   │   ├── gemini.js             # Client quote caller with deterministic fallback
│   │   ├── sanitize.js           # DOMPurify XSS filtering & hex color validator
│   │   └── supabase.js           # RLS client & offline-first storage adapter
│   ├── App.jsx                   # Central application state & gamification loop
│   ├── index.css                 # Tailwind CSS & safe-area insets
│   └── main.jsx
├── schema.sql                    # Production PostgreSQL DDL, RLS policies & triggers
├── vercel.json                   # Vercel deployment & security headers configuration
└── .env.example                  # Environment variables template
```
