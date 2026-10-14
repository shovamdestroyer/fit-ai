# FitAI Coach & SATHI AI — Complete Setup & Architecture Guide

FitAI Coach is a modern, responsive, mobile-first AI fitness and wellness application that combines:
- **Live Camera AI Yoga Pose Detection** using MediaPipe Pose Landmarker in `VIDEO` mode with joint-angle trigonometry.
- **SATHI AI Companion** — A futuristic, colorful AI wellness buddy with animated aurora waves, a glowing orb avatar, and deterministic calculation intelligence.
- **Scientific Calorie & Macro Engine** utilizing the clinically validated Mifflin-St Jeor equation.
- **Personalized 7-Day Workout Plans** with exactly 5 structured activities per day.
- **40+ Authentic Yoga Poses Library** (with Sanskrit names, alignment cues, and difficulty ratings).
- **20+ Fitness Exercises Library** (with rep targets, sets, rest, and muscle mapping).
- **Authentic Indian & Global Nutrition Planner** (Roti, Dal, Paneer, Tofu, Dahi, Poha, Idli, etc.).
- **Interactive Daily Hydration Tracker** with animated progress rings and timestamped intake logs.
- **Mandatory Authentication & Supabase PostgreSQL Database** with strict Row-Level Security (RLS).

---

## 1. Project Structure

```text
sarvesh_mini/
├── public/
│   ├── index.html              # Main application SPA (11 screens & mobile layout)
│   ├── css/
│   │   ├── styles.css          # Dark charcoal, emerald & lime-green theme system
│   │   └── sathi.css           # Futuristic midnight purple, aurora & glowing orb styling
│   ├── js/
│   │   ├── app.js              # Router, state machine & screen orchestrator
│   │   ├── auth.js             # Supabase Auth client & persistent session manager
│   │   ├── calories.js         # Deterministic Mifflin-St Jeor BMR, TDEE, & macro engine
│   │   ├── nutrition.js        # 30+ Indian food database, meal plans & food logger
│   │   ├── water.js            # Hydration tracker with animated SVG ring
│   │   ├── workouts.js         # 40 Yoga Poses, 20 Exercises & 7-day plan generator
│   │   ├── pose.js             # MediaPipe Pose live camera landmark & angle analyzer
│   │   ├── chatbot.js          # SATHI frontend controller with voice & quick actions
│   │   └── dashboard.js        # Home dashboard, streak tracker & canvas charts
│   ├── assets/
│   │   └── icons/              # App launcher icons
│   ├── manifest.json           # PWA installation manifest
│   └── service-worker.js       # PWA offline cache & service worker
├── server/
│   ├── server.js               # Express application server
│   ├── routes/
│   │   ├── ai.js               # SATHI chat route (Gemini API + deterministic fallback)
│   │   └── profile.js          # Profile sync, food, water, and workout session logging
│   ├── middleware/
│   │   └── auth.js             # JWT & Bearer authorization verification middleware
│   └── test.js                 # Automated unit and integration test suite
├── database/
│   └── schema.sql              # Supabase PostgreSQL schema with strict RLS policies
├── .env.example                # Environment variable configuration template
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Complete documentation
```

---

## 2. Quick Start & Local Execution

### Prerequisites
- **Node.js**: v18.0.0 or later (v24.19.0 recommended)
- **NPM**: v9.0.0 or later

### Installation & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Run Automated Test Suite**:
   ```bash
   npm test
   ```
   *Verifies Mifflin-St Jeor formulas, 40 yoga poses, 20 fitness exercises, 7-day workout plans (5 activities/day), SATHI deterministic math, and database schemas.*

4. **Start the Application Server**:
   ```bash
   npm start
   ```
   Or for live reloading during development:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Visit [http://localhost:3000](http://localhost:3000) on your desktop or mobile device.

---

## 3. Obtaining API Credentials

### A. Google Gemini API (For SATHI AI Chatbot)
1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API key** and create a new key.
4. Add the key to your `.env` file:
   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_key...
   ```
*Note: If no Gemini API key is configured, FitAI Coach automatically runs on its built-in deterministic nutrition and fitness knowledge engine, so the app remains fully functional without any external service dependency.*

### B. Supabase (Authentication & PostgreSQL Database)
1. Go to [Supabase](https://supabase.com/) and create a free project.
2. Under **Project Settings -> API**, copy your **Project URL** and **anon public key**.
3. Under **SQL Editor**, open [`database/schema.sql`](database/schema.sql) and run the script.
   - This creates tables for `profiles`, `workout_plans`, `workout_sessions`, `pose_assessments`, `food_logs`, `nutrition_targets`, `water_logs`, `weight_history`, and `chat_history`.
   - It also enables Row Level Security (RLS) policies ensuring users can only read and write their own data.
4. Configure `.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJh...your_anon_key...
   ```
5. FitAI Coach also includes an instant **Guest Demo Mode** allowing offline evaluation and immediate testing without requiring immediate Supabase project creation.

---

## 4. HTTPS Deployment & Camera Permissions

Browser security standards require a **Secure Context (HTTPS or localhost)** to access `navigator.mediaDevices.getUserMedia` for the live AI camera:

### Local Network Testing on Mobile (Android / iPhone)
When testing on a phone over local Wi-Fi:
- Use an HTTPS tunnel such as Cloudflare Tunnels, ngrok, or local SSL:
  ```bash
  npx localtunnel --port 3000
  ```
- Or generate a local self-signed certificate with `mkcert` and configure Express HTTPS.

### Production Deployment

#### Option 1: Render / Railway (Recommended)
1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server/server.js`
5. Add your environment variables (`PORT=3000`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
6. Render and Railway automatically provision free, managed HTTPS certificates for camera access.

#### Option 2: Vercel / Netlify + Node Backend
- Deploy the frontend assets in `/public` to Vercel/Netlify.
- Deploy the `/server` folder as Serverless Functions or on an Express host.

---

## 5. Verification & Acceptance Testing Checklist

| Module | Verification Step | Status |
| :--- | :--- | :--- |
| **Authentication** | Test Signup, Login, Password Reset, and Guest Demo Mode. Verify logged-out users cannot access private routes. | ✅ Verified |
| **Onboarding** | Enter age, height, weight, sex, goal, dietary preference. Verify profile is stored and auto-populates BMR/TDEE. | ✅ Verified |
| **Calorie Engine** | Test 70kg, 175cm, 26yo Male -> BMR = 1669 kcal, TDEE (1.55x) = 2587 kcal. Deficit: ~2137 kcal. | ✅ 100% Tested |
| **7-Day Plan** | Open each day (Day 1..7). Verify each day has **exactly 5 main activities** with warm-up/cooldown guidance. | ✅ 100% Tested |
| **Pose Library** | Verify all 40 yoga poses are present with Sanskrit names, category filters, and safety instructions. | ✅ 40 Poses Tested |
| **Live AI Camera** | Start pose session. Grant camera permission. Verify skeleton overlay renders and angle HUD updates. | ✅ MediaPipe Integrated |
| **SATHI Chatbot** | Ask: *"My maintenance is 2,400 calories. What is a 300-calorie deficit?"* Verify exact 2,100 kcal answer. | ✅ Verified |
| **Indian Nutrition** | Ask: *"How many calories are in two rotis and a bowl of dal?"* Verify ~320 kcal, ~14g protein breakdown. | ✅ Verified |
| **Water Tracker** | Click +150ml, +250ml, +500ml, custom amount. Verify animated SVG ring updates and logs history. | ✅ Verified |
| **Mobile PWA** | Verify responsive bottom navigation, dark mode contrast, viewport scaling, and manifest installation. | ✅ PWA Ready |
