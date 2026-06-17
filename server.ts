import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Multi-turn Chatbot (Zocialyse AI)
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message } = req.body;
      
      const systemInstruction = 
        "You are ZocialAI, an advanced AI analyst and friendly chatbot for Zocialyse. " +
        "Zocialyse is an all-in-one social app (Reels, Streaks, Filters, Live, Birthdays). " +
        "You analyze user social trends and offer insights, or just chat in a friendly, helpful way. " +
        "Keep your answers concise and engaging, natively incorporating social media slang if appropriate.";

      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
        "You are ZocialAI Analyst. You provide an advanced, fun, engaging, and personal data analysis report " +
        "for the user based on their mock Zocialyse profile data. Be upbeat and include some emojis.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
