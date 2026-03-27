import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { insertChatMessageSchema, insertQuizResultSchema } from "@shared/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const TUTOR_SYSTEM = `Sei un senior DevOps engineer di Accenture specializzato in Kubernetes, CI/CD, Docker, Helm e Git. 
Rispondi in italiano con terminologia tecnica in inglese (kubectl, docker, git, etc). 
Sei preciso, pratico e dai esempi concreti con comandi reali. 
Quando mostri comandi, usa blocchi di codice markdown.
Repository di riferimento: studio-consip su GitHub.`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // AI Tutor Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, topic, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "message is required" });
      }

      // Save user message
      storage.createChatMessage({ role: "user", content: message, topic: topic || null });

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: TUTOR_SYSTEM,
      });

      // Build chat history
      const chatHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
      if (history && Array.isArray(history)) {
        for (const h of history.slice(-10)) {
          chatHistory.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        }
      }

      const chat = model.startChat({ history: chatHistory });
      const userMessage = topic ? `[Argomento: ${topic}] ${message}` : message;
      const result = await chat.sendMessage(userMessage);
      const assistantContent = result.response.text();

      // Save assistant message
      storage.createChatMessage({ role: "assistant", content: assistantContent, topic: topic || null });

      res.json({ response: assistantContent });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "AI chat error" });
    }
  });

  // Quiz Generate
  app.post("/api/quiz/generate", async (req, res) => {
    try {
      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "topic is required" });
      }

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: `Sei un esperto DevOps che crea quiz tecnici. Rispondi SOLO con un array JSON valido, senza testo aggiuntivo. Nessun markdown, nessun backtick, solo JSON puro.`,
      });

      const prompt = `Genera 5 domande quiz a risposta multipla sull'argomento "${topic}" per DevOps engineers.
Ogni domanda deve avere 4 opzioni (A, B, C, D), la risposta corretta e una breve spiegazione in italiano.
I termini tecnici (comandi, nomi di tool, etc.) devono rimanere in inglese.

Rispondi con questo formato JSON esatto (array di 5 oggetti):
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"..."}]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let questions;
      try {
        questions = JSON.parse(text);
      } catch {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          questions = JSON.parse(match[0]);
        } else {
          throw new Error("Could not parse quiz questions");
        }
      }

      res.json({ questions });
    } catch (error: any) {
      console.error("Quiz error:", error);
      res.status(500).json({ error: error.message || "Quiz generation error" });
    }
  });

  // Code Review
  app.post("/api/review", async (req, res) => {
    try {
      const { code, type } = req.body;
      if (!code) {
        return res.status(400).json({ error: "code is required" });
      }

      const typeLabel = type === "yaml" ? "YAML Kubernetes" :
        type === "dockerfile" ? "Dockerfile" :
        type === "jenkinsfile" ? "Jenkinsfile" : "codice";

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: `Sei un senior DevOps engineer che fa code review. Rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo, senza markdown, senza backtick.`,
      });

      const prompt = `Analizza questo ${typeLabel} e fornisci una review strutturata.

\`\`\`
${code}
\`\`\`

Rispondi con questo formato JSON esatto:
{
  "assessment": "ottimo" | "attenzione" | "critico",
  "summary": "breve riepilogo in italiano",
  "issues": [{"severity": "ok" | "warning" | "error", "message": "descrizione in italiano"}],
  "suggestions": ["suggerimento 1 in italiano", "suggerimento 2"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let review;
      try {
        review = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          review = JSON.parse(match[0]);
        } else {
          throw new Error("Could not parse review");
        }
      }

      res.json({ review });
    } catch (error: any) {
      console.error("Review error:", error);
      res.status(500).json({ error: error.message || "Code review error" });
    }
  });

  // Save quiz result
  app.post("/api/quiz/save", async (req, res) => {
    try {
      const parsed = insertQuizResultSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid quiz result data" });
      }
      const result = storage.saveQuizResult(parsed.data);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get chat history
  app.get("/api/chat/history", async (_req, res) => {
    try {
      const messages = storage.getChatHistory(50);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get quiz results
  app.get("/api/quiz/results", async (_req, res) => {
    try {
      const results = storage.getQuizResults();
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
