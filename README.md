# 🧠 Sayaa — The Intelligent Safety System
> **"An intelligent safety system that predicts, detects, and responds automatically."**

Sayaa is not just an emergency button; it is a proactive safety ecosystem that leverages real-time data, on-device intelligence, and automated response systems to act instantly in unsafe situations.

---

## 🎯 Our Philosophy
We believe safety shouldn't depend on a user's ability to reach their phone. Most safety apps fail when the user is incapacitated or intimidated. 

**Sayaa solves this by shifting from "Reactive" to "Proactive":**
> *“We detect risk → we decide → we act automatically → we inform community → system improves”*

---

## 🔄 The Complete Flow (Journey to Protection)
1.  **Preparation**: User starts a journey; the app predicts risk and suggests the safest route.
2.  **Monitoring**: AI behavior detection monitors movement patterns (GPS, speed, direction) continuously.
3.  **Detection**: The system detects suspicious activity (long stop, wrong direction, or unusual movement).
4.  **Verification**: The app initiates a "Safe Check-in." If the user doesn't respond...
5.  **Escalation**: **Auto SOS** triggers immediately.
6.  **Response**: Recording starts, trusted contacts are called, and the nearby "Digital Witness" community is notified.
7.  **Closure**: The incident is reported anonymously, helping the system learn and improve the heatmap for everyone.

---

## 🛠️ System Architecture (Feature-Driven)

### 📱 1. Input Layer (The Data Foundation)
*   **Live GPS Tracking**: Continuous location monitoring.
*   **Contextual Awareness**: Analyzing time (day/night risk) and environment.
*   **Kinetic Data**: Movement speed, direction, and sudden stops.
*   **Interaction Feedback**: Active user response monitoring.

### 🧠 2. Intelligence Layer (The Core Brain)
*   **Risk Prediction Engine**: Predictive safety heatmap based on area and time-based risk analysis.
*   **AI Behavior Detection**: Detects anomalies like "Long stops in unusual places" or "Off-route movement."
*   **Safe Journey Engine**: Dynamic routing based on safety scores, not just distance.

### ⚙️ 3. Decision Engine (Automatic Actions)
*   🟢 **Normal**: Silent background monitoring and route tracking.
*   🟡 **Suspicious**: "Are you safe?" prompts and risk warnings.
*   🔴 **Dangerous**: Immediate, autonomous trigger of the SOS escalation flow.

### 🚨 4. Action Layer (The Protection Shield)
*   **Auto SOS Escalation**: Automatic calls/SMS to trusted contacts and emergency services (112).
*   **Evidence Collection**: Automatic audio/video recording synced to secure cloud storage.
*   **Deterrence Mode**: Loud alert sounds, flash warnings, and visible recording indicators to discourage attackers.
*   **Hidden Mode**: Disguised UI (calculator-like) for silent background protection in high-stakes moments.

### 🌍 5. Community & Ecosystem
*   **Digital Witness Network**: Notifying nearby users to provide immediate physical support.
*   **Smart Reporting**: 10-second anonymous reporting to build a collective safety database.
*   **NGO/Admin Dashboard**: Visualizing unsafe zones for patrolling and awareness campaigns.

---

## 💻 Tech Stack
*   **Frontend**: React 19 + Vite 8 + TypeScript 6
*   **Mobile**: Capacitor 8 (Cross-platform Android/iOS)
*   **Styling**: Tailwind CSS 4
*   **Maps & AR**: MapLibre GL + MapTiler Cloud + OSM
*   **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
*   **Evidence**: Supabase Storage + MediaRecorder API

---

## 🚀 Technical Setup

### 1. Prerequisites
*   A **Supabase** project (enable Anonymous Sign-ins).
*   A **MapTiler** Cloud API key.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/saaya.git
cd saaya

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_MAPTILER_KEY
```

### 3. Database Initialization
Run the contents of `supabase/schema.sql` in your Supabase SQL Editor to set up the tables for incidents, SOS events, and user presence.

### 4. Run Development Server
```bash
npm run dev
```

### 5. Native Mobile Build
```bash
npm run cap:sync
npm run android # or npm run ios
```

---

## 📈 Summary Architecture
> **“Sayaa uses real-time data, on-device intelligence, and automated response systems to act instantly in unsafe situations.”**
