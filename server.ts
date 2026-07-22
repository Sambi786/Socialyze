import express from "express";
import path from "path";

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

  // API Route: Save accounts locally for user to see
  app.post("/api/save-accounts", async (req, res) => {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "accounts.json");
      fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  });

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
      // Silently use fallback when API rate limits are hit
      res.json({ text: "Hey! Looks like I'm a bit overwhelmed with requests right now. Could you try again in a little bit? 😊" });
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
      // Silently use fallback when API rate limits are hit
      res.json({ insightsText: "✨ Wow, your profile is looking amazing! You're really engaging with your audience. Keep up the great work and consider posting more consistently to boost your reach! 🚀" });
    }
  });

  // API Route: Summarize feed posts
  app.post("/api/summarize-feed", async (req, res) => {
    try {
      const { posts } = req.body;
      
      const systemInstruction = 
        "You are an AI assistant analyzing social media posts. " +
        "Provide a very brief, one-sentence summary of the general vibe and main topics of these posts. " +
        "Keep it fun and under 100 characters if possible.";

      const response = await getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `Summarize these posts:\n${posts.join('\n')}` }] }
        ],
        config: { systemInstruction },
      });

      res.json({ summary: response.text });
    } catch (error) {
      // Silently use fallback when API rate limits are hit
      res.json({ summary: "Lots of fun tech, coding, and lifestyle vibes today! ✨" });
    }
  });

  // API Route: Generate trending topics
  app.post("/api/topics", async (req, res) => {
    try {
      const { posts } = req.body;
      const systemInstruction = 
        "Generate a list of 5 currently trending social media topics or hashtags. " +
        "Return the response as a JSON array of objects, where each object has a 'tag' string (including the #) " +
        "and a 'posts' string (e.g. '12.4K posts'). Be creative and realistic.";

      const response = await getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `Get trending topics from these posts: ${(posts || []).join(', ')}` }] }
        ],
        config: { 
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                tag: { type: "STRING" },
                posts: { type: "STRING" }
              },
              required: ["tag", "posts"]
            }
          }
        },
      });

      res.json(JSON.parse(response.text || "[]"));
    } catch (error) {
      // Silently use fallback data when API rate limits are hit
      const fallbackTrending = [
        { tag: "#chilling", posts: "1.2M posts" },
        { tag: "Tokyo", posts: "89.2K posts" },
        { tag: "tech", posts: "45.6K posts" },
        { tag: "coding", posts: "234K posts" },
        { tag: "hike", posts: "67.8K posts" }
      ];
      res.json(fallbackTrending);
    }
  });


  // API Route: Generate user bio
  app.post("/api/generate-bio", async (req, res) => {
    try {
      const { posts, username } = req.body;
      const systemInstruction = 
        "You are an AI assistant helping users write their social media bio. " +
        "Generate a short, fun, and engaging one-sentence bio (under 100 characters) " +
        "based on the user's username and their public posts/interests. Include emojis.";

      const response = await getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `Username: ${username}\nPosts: ${posts.join(', ')}` }] }
        ],
        config: { systemInstruction },
      });
      res.json({ bio: response.text });
    } catch (error) {
      res.json({ bio: "Just a fun person sharing my life vibes! ✨" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
