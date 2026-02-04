import type { Express } from "express";
import { createServer, type Server } from "http";
import { api } from "@shared/routes";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

async function backendFetch(path: string, options: RequestInit = {}) {
  const url = `${BACKEND_URL}${path}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (!response.ok) {
      console.error(`Backend fetch failed: ${url} - ${response.status} ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.error(`Backend fetch error for ${url}:`, error);
    throw error;
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
  // Log backend URL on startup
  console.log(`[Backend] Connecting to: ${BACKEND_URL}`);
  
  app.get(api.cases.list.path, async (req, res) => {
    try {
      const resp = await backendFetch("/api/cases");
      const cases = await resp.json();
      res.json(cases.map((c: any) => ({
        id: c.id,
        title: c.title,
        chiefComplaint: c.title, // title contains the chief complaint from backend
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
        chiefComplaint: c.title, // title contains the chief complaint from backend
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
        chiefComplaint: c.title, // title contains the chief complaint from backend
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

  app.get(api.cases.similar.path, async (req, res) => {
    try {
      const resp = await backendFetch(`/api/cases/${req.params.id}/similar`);
      if (!resp.ok) return res.status(resp.status).json({ message: "Failed to fetch similar cases" });
      const cases = await resp.json();
      res.json(cases.map((c: any) => ({
        id: c.id,
        title: c.title,
        chiefComplaint: c.title,
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
      res.status(500).json({ message: "Failed to fetch similar cases" });
    }
  });

  app.post("/api/patient-message", async (req, res) => {
    try {
      const resp = await backendFetch("/api/patient-message", {
        method: "POST",
        body: JSON.stringify(req.body),
      });
      if (!resp.ok) {
        const err = await resp.json();
        return res.status(resp.status).json(err);
      }
      res.json(await resp.json());
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to get patient response" });
    }
  });

  app.post("/api/submit-diagnosis", async (req, res) => {
    try {
      const resp = await backendFetch("/api/submit-diagnosis", {
        method: "POST",
        body: JSON.stringify(req.body),
      });
      if (!resp.ok) {
        const err = await resp.json();
        return res.status(resp.status).json(err);
      }
      res.json(await resp.json());
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to submit diagnosis" });
    }
  });

  app.post("/api/hint", async (req, res) => {
    try {
      const resp = await backendFetch("/api/hint", {
        method: "POST",
        body: JSON.stringify(req.body),
      });
      if (!resp.ok) {
        const err = await resp.json();
        return res.status(resp.status).json(err);
      }
      res.json(await resp.json());
    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ message: "Failed to get hint" });
    }
  });

  return httpServer;
}
