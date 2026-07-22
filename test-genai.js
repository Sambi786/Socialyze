import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const systemInstruction = 
      "Generate a list of 5 currently trending social media topics or hashtags. " +
      "Return the response as a JSON array of objects, where each object has a 'tag' string (including the #) " +
      "and a 'posts' string (e.g. '12.4K posts'). Be creative and realistic.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: "Get trending topics" }] }
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
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
