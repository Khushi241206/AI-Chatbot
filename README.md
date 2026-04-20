# 🌸 LilyAI Pro — Powered by Google Gemini (Free)

AI Customer Service Chatbot — Node.js + Express backend, deployable to Render.

---

## 📁 File Structure

```
lilyai-pro/
├── server.js          ← Express backend (Gemini API call lives here)
├── package.json       ← Dependencies
├── .env.example       ← Copy to .env for local dev
├── .gitignore
└── public/
    └── index.html     ← Full frontend (HTML + CSS + JS)
```

---

## 🔑 Where to Put Your API Key

### On Render (production):
1. Open your Render service → click **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Set:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** `AIzaSy...your-actual-key...`
4. Click **Save** — Render auto-restarts the server

### Locally (development):
1. Copy `.env.example` → `.env`
2. Edit `.env`:
   ```
   GEMINI_API_KEY=AIzaSy...your-actual-key...
   ```
3. Run `npm run dev`

> ⚠️ Never commit `.env` to GitHub — it's already in `.gitignore`

---

## 🆓 Get Your Free Gemini API Key

1. Go to → https://aistudio.google.com
2. Sign in with Google
3. Click **"Get API Key"** → **"Create API key"**
4. Copy the key (starts with `AIzaSy...`)

**Free tier limits:** 15 requests/min · 1,500 requests/day · No credit card needed

---

## 🚀 Deploy to Render

1. Push this folder to GitHub
2. Go to render.com → **New → Web Service**
3. Connect your GitHub repo
4. Set these fields:
   | Field | Value |
   |---|---|
   | Build Command | `npm install` |
   | Start Command | `npm start` |
5. Add environment variable `GEMINI_API_KEY` (see above)
6. Click **Deploy** — live in ~2 minutes!

---

## 💻 Run Locally

```bash
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run dev
# Open http://localhost:3000
```

---

## ✨ Features

- Real-time AI chat (Gemini 1.5 Flash — free)
- API key secure on backend only
- Voice TTS (Lily speaks responses)
- Speech-to-text mic input
- Voice call mode (continuous loop)
- Multilingual: English, Hindi, Gujarati
- Chat history sidebar
- Rate limiting + security headers
