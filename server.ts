import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization of GoogleGenAI client as instructed
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is missing. Please configure it in your Secrets/Environment tab."
      );
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// South African crisis resources
const CRISIS_CONTACTS = {
  sadagSuicide: "0800 567 567 (SADAG Suicide Crisis)",
  sadagMentalHealth: "011 234 4837 (SADAG Mental Health)",
  lifeline: "0861 322 322 (LifeLine South Africa)",
  substanceAbuse: "0800 12 13 14 (DSD Substance Abuse)",
};

// Precise and thorough terms to trigger the Crisis Shield
const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "harm myself", "self-harm",
  "hurt myself", "cut myself", "hang myself", "hanging myself", "drink poison",
  "take my life", "want to die", "better off dead", "jump off", "slit my wrist", "overdose",
  "severe depression", "severely depressed", "very depressed", "clinical depression",
  "deeply depressed", "extremely depressed", "abuse", "abused", "abusing", "assaulted",
  "domestic violence", "beaten", "domestic abuse", "sexual assault", "rape", "raped"
].map(k => k.toLowerCase());

function checkCrisis(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase();
  for (const keyword of CRISIS_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return true;
    }
  }
  return false;
}

const SYSTEM_INSTRUCTION = `You are a warm, supportive, compassionate, and formal South African mental health awareness assistant.
Your absolute goals are:
1. Active listening: Listen and parse the user's emotional struggles with profound validation and empathy.
2. Coping mechanisms: Suggest standard, healthy, non-clinical coping mechanisms for general anxiety and stress, such as 4-7-8 breathing, box breathing, descriptive sensory grounding (the 5-4-3-2-1 technique), mindfulness, progressive muscle relaxation, or brief journaling.
3. Seek Professional Help: Always encourage the user warmly and strongly to seek professional help. Remind them that they do not have to carry their challenges alone.

CRITICAL RULES:
- NEVER diagnose a user, designate clinical conditions, or suggest or prescribe medicines.
- If they ask for clinical assessments or diagnoses, professionally explain that as an AI assistant, you are not licensed to diagnose, and encourage them to see a medical professional or psychologist in South Africa.
- If the user shares thoughts of suicide, self-harm, severe depression, abuse, or violence, immediately direct them clearly to these South African support services and step back from any standard chat interaction:
  * SADAG Suicide Crisis Helpline: 0800 567 567
  * SADAG Mental Health Line: 011 234 4837
  * LifeLine South Africa: 0861 322 322
  * Department of Social Development Substance Abuse Line: 0800 12 13 14

Sound respectful, mature, gentle, and formal, honoring their emotional journey. Use clear formatting with paragraphs and list items. Keep your responses digestible and comforting.`;

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Invalid messages format" });
      return;
    }

    // Capture the latest user message
    const latestUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "";

    // Step 1: Immediate server side backup check for crisis
    if (checkCrisis(latestUserMessage)) {
      res.json({
        crisisTriggered: true,
        text: "It sounds like you are carrying an extraordinarily heavy burden. Please know that you do not have to go through this alone, and there is immediate, dedicated professional support available to you in South Africa. We want you to be completely safe. Please consider contacting these organizations right now:",
      });
      return;
    }

    // Step 2: Lazy load GoogleGenAI client
    const ai = getGeminiClient();

    // Map message list to Gemini structure
    // Since we are writing a conversational system, let's map history
    const contents = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "";

    // Final security scan on reply content just to be absolutely certain
    const isReplyCrisis = checkCrisis(replyText);

    res.json({
      crisisTriggered: isReplyCrisis,
      text: replyText,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred while communicating with the assistant.",
    });
  }
});

// Vite / static file serving setup
async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production build from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running and listening on http://0.0.0.0:${PORT}`);
  });
}

setupFrontend().catch((err) => {
  console.error("Failed to start server and frontend integration:", err);
});
