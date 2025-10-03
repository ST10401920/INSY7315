import express, { Request, Response } from "express";
import fetch from "node-fetch";

const router = express.Router();

const API_KEY = "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";
const MODEL = "deepseek/deepseek-r1:free";

router.post("/", async (req: Request, res: Response) => {
  try {
    const userMessage = req.body.message;
    console.log("User message:", userMessage);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a helpful property management assistant for Nestify. Keep answers short and clear." },
          { role: "user", content: userMessage }
        ],
      }),
    });

    const data = await response.json();
    console.log("OpenRouter raw response:", JSON.stringify(data, null, 2));

    const botMessage = data.choices?.[0]?.message?.content || "Sorry, I didn’t understand.";
    console.log("Bot reply:", botMessage);

    res.json({ reply: botMessage });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ reply: "Something went wrong." });
  }
});

export default router;
