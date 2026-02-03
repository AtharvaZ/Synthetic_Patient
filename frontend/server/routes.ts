import type { Express } from "express";
import { createServer, type Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function backendFetch(path: string, options: RequestInit = {}) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
  app.get(api.cases.list.path, async (req, res) => {
    try {
      const resp = await backendFetch("/api/cases");
      const cases = await resp.json();
      res.json(cases.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        specialty: c.specialty,
        difficulty: c.difficulty,
        expectedDiagnosis: c.expected_diagnosis,
        acceptableDiagnoses: c.acceptable_diagnoses || "",
        imageUrl: c.image_url,
        status: c.status || "available"
      })));
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get(api.cases.get.path, async (req, res) => {
    try {
      const resp = await backendFetch(`/api/cases/${req.params.id}`);
      if (!resp.ok) return res.status(resp.status).json({ message: "Case not found" });
      const c = await resp.json();
      res.json({
        id: c.id,
        title: c.title,
        description: c.description,
        specialty: c.specialty,
        difficulty: c.difficulty,
        expectedDiagnosis: c.expected_diagnosis,
        acceptableDiagnoses: c.acceptable_diagnoses || "",
        imageUrl: c.image_url,
        status: c.status || "available"
      });
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  app.get(api.cases.byDifficulty.path, async (req, res) => {
    try {
      const resp = await backendFetch(`/api/cases/difficulty/${req.params.difficulty}`);
      const cases = await resp.json();
      res.json(cases.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        specialty: c.specialty,
        difficulty: c.difficulty,
        expectedDiagnosis: c.expected_diagnosis,
        acceptableDiagnoses: c.acceptable_diagnoses || "",
        imageUrl: c.image_url,
        status: c.status || "available"
      })));
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.post(api.chats.create.path, async (req, res) => {
    try {
      const input = api.chats.create.input.parse(req.body);
      const resp = await backendFetch("/api/chats", {
        method: "POST",
        body: JSON.stringify({ case_id: input.caseId }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        return res.status(resp.status).json(err);
      }
      const chat = await resp.json();
      res.status(201).json({ id: chat.id, caseId: chat.case_id, userId: chat.user_id, createdAt: chat.created_at });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      console.error("Error:", err);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.get(api.chats.get.path, async (req, res) => {
    try {
      const resp = await backendFetch(`/api/chats/${req.params.id}`);
      if (!resp.ok) return res.status(resp.status).json({ message: "Chat not found" });
      const chat = await resp.json();
      res.json({
        id: chat.id,
        caseId: chat.case_id,
        userId: chat.user_id,
        createdAt: chat.created_at,
        messages: chat.messages.map((m: any) => ({
          id: m.id,
          chatId: m.chat_id,
          sender: m.sender,
          content: m.content,
          createdAt: m.created_at
        }))
      });
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const resp = await backendFetch(`/api/chats/${req.params.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: input.content, sender: input.sender }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        return res.status(resp.status).json(err);
      }
      const msg = await resp.json();
      res.status(201).json({ id: msg.id, chatId: msg.chat_id, sender: msg.sender, content: msg.content, createdAt: msg.created_at });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      console.error("Error:", err);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.delete(api.messages.deleteLastUser.path, async (req, res) => {
    try {
      const resp = await backendFetch(`/api/chats/${req.params.id}/messages/last-user`, { method: "DELETE" });
      res.json({ success: true });
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  app.post(api.completions.create.path, async (req, res) => {
    try {
      const input = api.completions.create.input.parse(req.body);
      const resp = await backendFetch("/api/completions", {
        method: "POST",
        body: JSON.stringify({ case_id: input.caseId, chat_id: input.chatId, diagnosis: input.diagnosis }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        return res.status(resp.status).json(err);
      }
      const data = await resp.json();
      res.status(201).json({
        completion: {
          id: data.completion.id,
          userId: data.completion.user_id,
          caseId: data.completion.case_id,
          chatId: data.completion.chat_id,
          diagnosis: data.completion.diagnosis,
          result: data.completion.result,
          createdAt: data.completion.created_at
        },
        result: data.result
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      console.error("Error:", err);
      res.status(500).json({ message: "Failed to submit diagnosis" });
    }
  });

  app.delete("/api/completions/retry/:chatId", async (req, res) => {
    try {
      await backendFetch(`/api/completions/retry/${req.params.chatId}`, { method: "DELETE" });
      res.json({ success: true });
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to retry" });
    }
  });

  app.get(api.completions.userStats.path, async (req, res) => {
    try {
      const resp = await backendFetch("/api/user/stats");
      const stats = await resp.json();
      res.json({ streak: stats.streak, casesSolved: stats.cases_solved, accuracy: stats.accuracy });
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get(api.completions.completedCases.path, async (req, res) => {
    try {
      const resp = await backendFetch("/api/user/completed-cases");
      const ids = await resp.json();
      res.json(ids);
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to fetch completed cases" });
    }
  });

  app.get("/api/feedback/:chatId", async (req, res) => {
    try {
      const resp = await backendFetch(`/api/feedback/${req.params.chatId}`);
      if (!resp.ok) {
        const err = await resp.json();
        return res.status(resp.status).json(err);
      }
      res.json(await resp.json());
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  return httpServer;
}
