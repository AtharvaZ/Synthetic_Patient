import type { Express } from "express";
import { createServer, type Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function proxyToBackend(path: string, options: RequestInit = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return response;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.cases.list.path, async (req, res) => {
    try {
      const response = await proxyToBackend("/api/cases");
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch cases" });
      }
      const cases = await response.json();
      const transformed = cases.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        specialty: c.specialty,
        difficulty: c.difficulty,
        expectedDiagnosis: c.expected_diagnosis,
        acceptableDiagnoses: c.acceptable_diagnoses || "",
        imageUrl: c.image_url,
        status: c.status || "available"
      }));
      res.json(transformed);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get(api.cases.get.path, async (req, res) => {
    try {
      const response = await proxyToBackend(`/api/cases/${req.params.id}`);
      if (!response.ok) {
        return res.status(response.status).json({ message: "Case not found" });
      }
      const c = await response.json();
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
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  app.get(api.cases.byDifficulty.path, async (req, res) => {
    try {
      const response = await proxyToBackend(`/api/cases/difficulty/${req.params.difficulty}`);
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch cases" });
      }
      const cases = await response.json();
      const transformed = cases.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        specialty: c.specialty,
        difficulty: c.difficulty,
        expectedDiagnosis: c.expected_diagnosis,
        acceptableDiagnoses: c.acceptable_diagnoses || "",
        imageUrl: c.image_url,
        status: c.status || "available"
      }));
      res.json(transformed);
    } catch (error) {
      console.error("Error fetching cases by difficulty:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.post(api.chats.create.path, async (req, res) => {
    try {
      const input = api.chats.create.input.parse(req.body);
      const response = await proxyToBackend("/api/chats", {
        method: "POST",
        body: JSON.stringify({ case_id: input.caseId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
      
      const chat = await response.json();
      res.status(201).json({
        id: chat.id,
        caseId: chat.case_id,
        userId: chat.user_id,
        createdAt: chat.created_at
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      console.error("Error creating chat:", err);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.get(api.chats.get.path, async (req, res) => {
    try {
      const response = await proxyToBackend(`/api/chats/${req.params.id}`);
      if (!response.ok) {
        return res.status(response.status).json({ message: "Chat not found" });
      }
      
      const chat = await response.json();
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
    } catch (error) {
      console.error("Error fetching chat:", error);
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const chatId = req.params.id;
      const input = api.messages.create.input.parse(req.body);
      
      const response = await proxyToBackend(`/api/chats/${chatId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: input.content,
          sender: input.sender
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
      
      const message = await response.json();
      res.status(201).json({
        id: message.id,
        chatId: message.chat_id,
        sender: message.sender,
        content: message.content,
        createdAt: message.created_at
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      console.error("Error creating message:", err);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.delete(api.messages.deleteLastUser.path, async (req, res) => {
    try {
      const response = await proxyToBackend(`/api/chats/${req.params.id}/messages/last`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to delete message" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  app.post(api.completions.create.path, async (req, res) => {
    try {
      const input = api.completions.create.input.parse(req.body);
      
      const response = await proxyToBackend("/api/completions", {
        method: "POST",
        body: JSON.stringify({
          case_id: input.caseId,
          chat_id: input.chatId,
          diagnosis: input.diagnosis
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
      
      const data = await response.json();
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
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      console.error("Error creating completion:", err);
      res.status(500).json({ message: "Failed to submit diagnosis" });
    }
  });

  app.delete("/api/completions/retry/:chatId", async (req, res) => {
    try {
      const response = await proxyToBackend(`/api/completions/retry/${req.params.chatId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to retry" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error retrying completion:", error);
      res.status(500).json({ message: "Failed to retry" });
    }
  });

  app.get(api.completions.userStats.path, async (req, res) => {
    try {
      const response = await proxyToBackend("/api/user/stats");
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch stats" });
      }
      
      const stats = await response.json();
      res.json({
        streak: stats.streak,
        casesSolved: stats.cases_solved,
        accuracy: stats.accuracy
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get(api.completions.completedCases.path, async (req, res) => {
    try {
      const response = await proxyToBackend("/api/completions/completed");
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch completed cases" });
      }
      
      const completedIds = await response.json();
      res.json(completedIds);
    } catch (error) {
      console.error("Error fetching completed cases:", error);
      res.status(500).json({ message: "Failed to fetch completed cases" });
    }
  });

  app.get("/api/feedback/:chatId", async (req, res) => {
    try {
      const response = await proxyToBackend(`/api/feedback/${req.params.chatId}`);
      
      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
      
      const feedback = await response.json();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  return httpServer;
}
