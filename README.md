# 🔥 Kith — Cooperative Life Gamification

> **Cooperation, Not Comparison.** A complete end-to-end cooperative life-gamification web application designed for static deployment to **GitHub Pages**, backed by **Supabase** for persistent authentication, PostgreSQL database with Row-Level Security (RLS), and Realtime syncing.

---

## 🌟 1. Product Philosophy & Core Gameplay Loop

- **Cooperation, Not Comparison (PvE Union):** Zero toxic leaderboards, zero PvP, and zero surveillance verification. When one companion advances their personal habits, the whole Caravan moves forward. When one companion struggles, the fellowship shares the burden.
- **The Campfire Engine:** Every Caravan shares a collective **Campfire Light** (0% to 100%). Completing daily rituals supplies firewood (+15% per quest) and advances the expedition along milestone trails. Companions can **"Kindle"** each other with heartfelt encouragements to boost the hearth (+10%).
- **Grace Mode ("Rest at the Hearth"):** Facing illness, exams, travel, or emergencies? Toggle Grace Mode. While resting peacefully by the hearth stones, your inactivity never penalizes the Caravan's collective expedition or campfire decay.
- **BYOK AI Option (Bring Your Own Key):** Kith operates completely standalone with deterministic game mechanics and procedural lore generators. Companions can optionally paste their personal API key (Google Gemini free-tier, OpenAI, or Anthropic Claude) in Settings to unlock:
  - **The AI Chronicler:** Synthesizes completed habits and kindling notes into rich, evocative adventure chapters.
  - **The AI Quest Alchemist:** Deconstructs high-level aspirations into balanced daily quests across the four sacred pillars (*Intellect, Vitality, Clarity, Craft*).
- **Procedural Audio Ambience:** Real-time synthesized crackling fireplace and harmonic harp/bell chimes using the browser's native **Web Audio API** (zero external sound downloads or network dependencies).

---

## 🏗️ 2. Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite 6, TypeScript |
| **Styling & Theme** | Tailwind CSS (custom cozy hearth dark-mode palette) |
| **Icons & Effects** | Lucide React, Canvas-Confetti, HTML5 Canvas Particle Engine |
| **Audio Engine** | Procedural Web Audio API (ambient crackling fire & harmonic chimes) |
| **Backend & DB** | Supabase (@supabase/supabase-js) PostgreSQL, RLS, Auth, Realtime |
| **Offline / Demo Mode**| Built-in reactive Sandbox Store for immediate zero-setup evaluation |
| **Deployment** | GitHub Actions CI/CD (`.github/workflows/deploy.yml`) to GitHub Pages |

---

## 🚀 3. Quick Start (Local Development)

```bash
# 1. Clone or navigate to kith directory
cd kith

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for static production
npm run build

# 5. Preview production build
npm run preview
```

> **Note on Zero-Setup Sandbox Mode:**  
> When launched without Supabase credentials, Kith immediately loads into **Local Sandbox Mode** pre-populated with sample companions (*Lyra the Wayfarer, Bram the Warden, Aurelia the Sage, Kael the Artisan*), active quests, and expedition logs. You can test all features—including completing quests, kindling companions, Grace Mode, audio ambience, and the Quest Alchemist—right out of the box!

---

## 🗄️ 4. Supabase Setup & Database Migration

To connect Kith to your own Supabase project:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase Dashboard.
3. Open `schema.sql` from this repository, paste the entire SQL code, and click **Run**.
   - Creates the 4 core tables: `profiles`, `caravans`, `quests`, `caravan_logs`.
   - Sets up Row-Level Security (RLS) policies.
   - Configures the `on_auth_user_created` trigger for automatic user profile generation.
   - Adds tables to `supabase_realtime` for live synchronization.
4. Go to **Project Settings -> API** and copy:
   - **Project URL**
   - **anon public Key**
5. Connect in either of two ways:
   - **In-App (No rebuild needed):** Click the ⚙️ **Settings** button in Kith, go to **Supabase DB**, paste your URL and Anon Key, and click **Connect Supabase Backend**.
   - **Environment Variables:** Create a `.env` file in the project root:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

---

## 🚢 5. GitHub Pages Deployment (Static CI/CD)

The repository includes a ready-to-deploy GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Automated Setup:
1. Push this repository to GitHub on branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Kith life-gamification app"
   git remote add origin https://github.com/<your-username>/kith.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings -> Pages**.
   - Under **Build and deployment -> Source**, select **GitHub Actions**.
3. (Optional) Under **Settings -> Secrets and variables -> Actions**, add your secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. The workflow will automatically build the static assets into `dist/` and publish your site at:
   `https://<your-username>.github.io/kith/`

---

## 🔮 6. Sacred Pillars & Archetypes

### The Four Sacred Pillars
- 📘 **Intellect:** Deep work, study, reading, critical analysis.
- 🌿 **Vitality:** Physical movement, outdoor energy, sleep, nourishment.
- ✨ **Clarity:** Mindfulness, meditation, journaling, emotional balance.
- 🔨 **Craft:** Hands-on making, creative coding, writing, purposeful building.

### The Four Archetypes
- 🧭 **Wayfarer (Scout):** Traverses uncharted territory; grants +25% exploration distance on completed rituals.
- 🛡️ **Warden (Guardian):** Tends the sacred hearthstones; cuts nightly campfire decay in half for the entire party.
- 📖 **Sage (Scholar):** Seeker of deep wisdom; grants bonus XP on Intellect and Clarity rituals.
- ⚒️ **Artisan (Builder):** Master builder; infuses extra campfire firewood (+5%) into all Craft rituals.
