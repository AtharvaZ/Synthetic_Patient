import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
// Users (Mock auth for now)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  specialty: text("specialty"), // e.g., "General Medicine"
});

// Medical Cases
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  specialty: text("specialty").notNull(), // Cardiology, Neurology, Pediatrics
  difficulty: text("difficulty").notNull(), // Beginner, Intermediate, Advanced
  expectedDiagnosis: text("expected_diagnosis").notNull().default(""), // correct diagnosis for evaluation
  acceptableDiagnoses: text("acceptable_diagnoses").default(""), // comma-separated partial matches
  imageUrl: text("image_url"),
  status: text("status").default("available"), // available, in_progress, completed
});

// Chat Sessions
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  caseId: integer("case_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("active"),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  sender: text("sender").notNull(), // "user" or "ai"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Case Completions - tracks which cases a user has completed and their diagnosis result
export const caseCompletions = pgTable("case_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  caseId: integer("case_id").notNull(),
  chatId: integer("chat_id").notNull(),
  result: text("result").notNull(), // "correct", "partial", "wrong"
  diagnosis: text("diagnosis").notNull(), // what the student diagnosed
  completedAt: timestamp("completed_at").defaultNow(),
});

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCaseSchema = createInsertSchema(cases).omit({ id: true });
export const insertChatSchema = createInsertSchema(chats).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertCaseCompletionSchema = createInsertSchema(caseCompletions).omit({ id: true, completedAt: true });

// === EXPLICIT API TYPES ===
export type User = typeof users.$inferSelect;
export type Case = typeof cases.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type CaseCompletion = typeof caseCompletions.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertCaseCompletion = z.infer<typeof insertCaseCompletionSchema>;

// API Response Types
export type CaseResponse = Case;
export type ChatResponse = Chat & { messages?: Message[] };
export type CreateChatRequest = { caseId: number };
export type DiagnosisResult = "correct" | "partial" | "wrong";
