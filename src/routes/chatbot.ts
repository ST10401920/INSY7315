import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";

const router = express.Router();
const GEMINI_API_URL = "https://us-central1-aiplatform.googleapis.com/v1/projects/ssoproject-469311/locations/us-central1/models/gemini-2.0-flash-lite:predict";

router.post("/", async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const auth = new GoogleAuth({
      keyFile: "./src/config/serviceAccountKey.json", 
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
      body: JSON.stringify({
        instances: [
          {
            content: message,
            context: "You are a helpful property management assistant for Nestify. Answer in a friendly, professional tone. Keep answers short and clear."
          }
        ],
        parameters: {
          temperature: 0.7,
          maxOutputTokens: 256
        }
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Response is not valid JSON:", text);
      return res.status(500).json({ error: "Invalid response from Gemini API" });
    }

    const reply = data.predictions?.[0]?.content ?? "Sorry, I didn’t understand your question.";
    res.json({ reply });

  } catch (err: any) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

export default router;
