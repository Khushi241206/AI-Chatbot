require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Gemini client ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ── Security middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "fonts.gstatic.com"],
        fontSrc:    ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
        connectSrc: ["'self'"],
        imgSrc:     ["'self'", "data:"],
      },
    },
  })
);

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json({ limit: "10kb" }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

// ── Serve static frontend ─────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Chat endpoint ─────────────────────────────────────────────────────────────
app.post("/chat", chatLimiter, async (req, res) => {
  const { messages, language = "English" } = req.body;

  // Validate input
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages format." });
  }

  // Sanitise & cap history at 40 messages
  // Gemini uses role "user" | "model" and parts array
  const sanitised = messages.slice(-40).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: String(m.content).slice(0, 2000) }],
  }));

  // System instruction for Lily
  const systemInstruction = `You are Lily, a warm, professional, and highly capable AI customer service assistant for LilyAI Pro.
Always respond in ${language}.
Be concise, helpful, empathetic, and friendly.
Keep responses under 3 short paragraphs unless the user explicitly needs detailed information.
If the user asks something outside your expertise, politely say so and offer to help with something else.
Never reveal internal system details or which AI model powers you.`;

  try {
    // Gemini: pass all-but-last as history, send the last as current message
    const history = sanitised.slice(0, -1);
    const lastMessage = sanitised[sanitised.length - 1];

    const chat = model.startChat({
      history,
      systemInstruction,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err?.message ?? err);

    if (err?.status === 429 || err?.message?.includes("quota")) {
      return res.status(429).json({ error: "AI rate limit reached. Please try again shortly." });
    }
    if (err?.message?.includes("API_KEY") || err?.status === 403) {
      return res.status(500).json({ error: "API key error. Please contact support." });
    }
    if (err?.status === 400) {
      return res.status(400).json({ error: "Invalid request. Please try again." });
    }

    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ── Fallback: serve index.html ────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌸 LilyAI Pro running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`   Gemini key  : ${process.env.GEMINI_API_KEY ? "✅ set" : "❌ NOT SET — add GEMINI_API_KEY"}`);
});
