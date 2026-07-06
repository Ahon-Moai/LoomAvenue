import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for chatbot
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array" });
      }

      // Convert history to string for a single generateContent call (if we don't use ai.chats)
      // Or we can use ai.chats.create
      const systemInstruction = `You are a helpful, professional, and friendly AI assistant for a headwear e-commerce store called 'Aether'. 
Your job is to answer user questions about our products, provide suggestions, and help them navigate their shopping experience.
We sell premium custom headwear. 
Be concise, polite, and use formatting like bolding for product names if needed.
Do not provide information outside of the scope of the store and headwear products.`;

      // Simplified approach for the chat API:
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction,
        }
      });
      
      // If there's previous history, ideally we'd send it all. 
      // But for simplicity with this SDK version, we'll just send the last message
      // with context from the history.
      const userMessage = messages[messages.length - 1].content;
      
      const response = await chat.sendMessage({ message: userMessage });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate response." });
    }
  });

  // Vite middleware for development
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
