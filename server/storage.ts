import {
  type ChatMessage,
  type InsertChatMessage,
  type QuizResult,
  type InsertQuizResult,
  chatMessages,
  quizResults,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  createChatMessage(msg: InsertChatMessage): ChatMessage;
  getChatHistory(limit?: number): ChatMessage[];
  saveQuizResult(result: InsertQuizResult): QuizResult;
  getQuizResults(): QuizResult[];
}

export class DatabaseStorage implements IStorage {
  createChatMessage(msg: InsertChatMessage): ChatMessage {
    return db.insert(chatMessages).values(msg).returning().get();
  }

  getChatHistory(limit: number = 50): ChatMessage[] {
    return db.select().from(chatMessages).orderBy(desc(chatMessages.id)).limit(limit).all().reverse();
  }

  saveQuizResult(result: InsertQuizResult): QuizResult {
    return db.insert(quizResults).values(result).returning().get();
  }

  getQuizResults(): QuizResult[] {
    return db.select().from(quizResults).orderBy(desc(quizResults.id)).all();
  }
}

export const storage = new DatabaseStorage();
