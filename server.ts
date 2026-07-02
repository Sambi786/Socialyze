import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Multi-turn Chatbot (Socialyze AI)
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message } = req.body;
      
      const systemInstruction = 
        "You are SocialAI, an advanced AI analyst and friendly chatbot for Socialyze. " +
        "Socialyze is an all-in-one social app (Reels, Streaks, Filters, Live, Birthdays). " +
        "You analyze user social trends and offer insights, or just chat in a friendly, helpful way. " +
        "Keep your answers concise and engaging, natively incorporating social media slang if appropriate.";

      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const response = await getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...formattedHistory,
          { role: "user", parts: [{ text: message }] }
        ],
        config: { systemInstruction },
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate AI response." });
    }
  });

  // API Route: Advanced AI insights analysis
  app.post("/api/insights", async (req, res) => {
    try {
      const { profileData } = req.body;
      
      const systemInstruction = 
        "You are SocialAI Analyst. You provide an advanced, fun, engaging, and personal data analysis report " +
        "for the user based on their mock Socialyze profile data. Be upbeat and include some emojis.";

      const response = await getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `Analyze this profile data: ${JSON.stringify(profileData)}` }] }
        ],
        config: { systemInstruction },
      });

      res.json({ insightsText: response.text });
    } catch (error) {
      console.error("AI Insights Error:", error);
      res.status(500).json({ error: "Failed to fetch insights." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
