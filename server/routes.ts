import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from "@anthropic-ai/sdk";
import { insertChatMessageSchema, insertQuizResultSchema } from "@shared/schema";

const anthropic = new Anthropic();

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

      const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
      if (history && Array.isArray(history)) {
        for (const h of history.slice(-10)) {
          messages.push({ role: h.role, content: h.content });
        }
      }
      messages.push({ role: "user", content: topic ? `[Argomento: ${topic}] ${message}` : message });

      const response = await anthropic.messages.create({
        model: "gemini_3_flash",
        max_tokens: 2048,
        system: TUTOR_SYSTEM,
        messages,
      });

      const assistantContent = response.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");

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

      const response = await anthropic.messages.create({
        model: "gemini_3_flash",
        max_tokens: 2048,
        system: `Sei un esperto DevOps che crea quiz tecnici. Rispondi SOLO con un array JSON valido, senza testo aggiuntivo. Nessun markdown, nessun backtick, solo JSON puro.`,
        messages: [
          {
            role: "user",
            content: `Genera 5 domande quiz a risposta multipla sull'argomento "${topic}" per DevOps engineers.
Ogni domanda deve avere 4 opzioni (A, B, C, D), la risposta corretta e una breve spiegazione in italiano.
I termini tecnici (comandi, nomi di tool, etc.) devono rimanere in inglese.

Rispondi con questo formato JSON esatto (array di 5 oggetti):
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"..."}]`
          }
        ],
      });

      const text = response.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");

      // Try to extract JSON from response
      let questions;
      try {
        // Try direct parse first
        questions = JSON.parse(text);
      } catch {
        // Try to find JSON array in text
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

      const response = await anthropic.messages.create({
        model: "gemini_3_flash",
        max_tokens: 2048,
        system: `Sei un senior DevOps engineer che fa code review. Rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo, senza markdown, senza backtick.`,
        messages: [
          {
            role: "user",
            content: `Analizza questo ${typeLabel} e fornisci una review strutturata.

\`\`\`
${code}
\`\`\`

Rispondi con questo formato JSON esatto:
{
  "assessment": "ottimo" | "attenzione" | "critico",
  "summary": "breve riepilogo in italiano",
  "issues": [{"severity": "ok" | "warning" | "error", "message": "descrizione in italiano"}],
  "suggestions": ["suggerimento 1 in italiano", "suggerimento 2"]
}`
          }
        ],
      });

      const text = response.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");

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
