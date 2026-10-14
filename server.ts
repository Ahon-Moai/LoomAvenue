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

  // API route for Meta CAPI
  app.post("/api/capi", async (req, res) => {
    try {
      const { eventName, eventData, eventId, url, userAgent, fbp, fbc, email, phone } = req.body;
      const PIXEL_ID = '1769361844418864';
      const ACCESS_TOKEN = 'EAAYNnHh3ICUBRxwXDpH8l158G3ZCSd3rWMcZBbrVvQhTaRIEQOuiZAqcuTHely2YsGWNZAEFZB9CtZB41N0slUSQir8VuSq4DaoG8RUEcZBsEdVbdmdcK3dZA7K2iAl67RB0tWxt33lMVYGnHZCN0pT5AeZC9VJTMUjuruuipXW2MZA2I2Aqv9mePPtv0QqSXHLxMmXZBwZDZD';
      const TEST_EVENT_CODE = 'TEST70193';
      
      const clientIpAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      // Basic hashing for user data (email, phone)
      const crypto = await import('crypto');
      const hash = (str: string) => crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');

      const userData: any = {
        client_ip_address: clientIpAddress,
        client_user_agent: userAgent,
      };

      if (fbp) userData.fbp = fbp;
      if (fbc) userData.fbc = fbc;
      if (email) userData.em = [hash(email)];
      if (phone) userData.ph = [hash(phone)];

      const payload = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_source_url: url,
            event_id: eventId, // Used for deduplication
            user_data: userData,
            custom_data: eventData
          }
        ],
        test_event_code: TEST_EVENT_CODE
      };

      const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log('CAPI Response:', responseData);
      res.json({ success: true, response: responseData });
    } catch (error) {
      console.error('CAPI Error:', error);
      res.status(500).json({ error: 'Failed to send CAPI event' });
    }
  });

  // API route for chatbot
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ 
          text: "Welcome to Loom-Avenue! I'm here to assist you with our premium custom headwear and apparel collections. (Note: To enable live AI responses, please set GEMINI_API_KEY in your environment)." 
        });
      }

      const systemInstruction = `You are a helpful, professional, and friendly AI assistant for a headwear and apparel e-commerce store called 'Loom-Avenue'. 
Your job is to answer user questions about our products, provide suggestions, and help them navigate their shopping experience.
We sell premium custom headwear and worn textile collections. 
Be concise, polite, and use formatting like bolding for product names if needed.
Do not provide information outside of the scope of the store and headwear products.`;

      const contents = messages.map((m: any) => ({
        role: m.role === "model" ? "model" : "user",
        parts: [{ text: typeof m.content === "string" ? m.content : "" }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
        }
      });
      
      res.json({ text: response.text || "I'm here to help you find the right piece for your style." });
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
