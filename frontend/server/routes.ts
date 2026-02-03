import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed Data
  if ((await storage.getCases()).length === 0) {
    console.log("Seeding cases...");
    await storage.createCase({
      title: "Acute Chest Pain",
      description: "A 55-year-old male presents with sudden onset substernal chest pain radiating to the left arm.",
      specialty: "Cardiology",
      difficulty: "Intermediate",
      expectedDiagnosis: "myocardial infarction",
      acceptableDiagnoses: "heart attack,mi,stemi,nstemi,acute coronary syndrome,cardiac,angina",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070",
      status: "available"
    });
    await storage.createCase({
      title: "Pediatric Fever & Rash",
      description: "A 4-year-old female brought in by parents with high grade fever and maculopapular rash.",
      specialty: "Pediatrics",
      difficulty: "Beginner",
      expectedDiagnosis: "measles",
      acceptableDiagnoses: "viral exanthem,rubeola,morbilli,viral rash",
      imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=2070",
      status: "available"
    });
    await storage.createCase({
      title: "Sudden Weakness",
      description: "A 68-year-old female with sudden right-sided hemiparesis and aphasia.",
      specialty: "Neurology",
      difficulty: "Advanced",
      expectedDiagnosis: "stroke",
      acceptableDiagnoses: "cerebrovascular accident,cva,ischemic stroke,brain attack,tia",
      imageUrl: "https://images.unsplash.com/photo-1559757175-7b2713a6b63d?auto=format&fit=crop&q=80&w=2069",
      status: "available"
    });
  }

  // Create a default user for testing
  let defaultUser = await storage.getUserByUsername("medstudent");
  if (!defaultUser) {
    defaultUser = await storage.createUser({
      username: "medstudent",
      name: "Dr. Candidate",
      avatarUrl: "https://github.com/shadcn.png",
      specialty: "General Medicine"
    });
  }

  app.get(api.cases.list.path, async (req, res) => {
    const cases = await storage.getCases();
    res.json(cases);
  });

  app.get(api.cases.get.path, async (req, res) => {
    const caseItem = await storage.getCase(Number(req.params.id));
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json(caseItem);
  });

  app.post(api.chats.create.path, async (req, res) => {
    try {
      const input = api.chats.create.input.parse(req.body);
      const chat = await storage.createChat(defaultUser!.id, input.caseId);
      
      // Add initial AI greeting
      await storage.addMessage({
        chatId: chat.id,
        sender: "ai",
        content: "Hello doctor. I'm feeling not quite right today..."
      });

      res.status(201).json(chat);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
           message: err.errors[0].message,
           field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  app.get(api.chats.get.path, async (req, res) => {
    const chat = await storage.getChat(Number(req.params.id));
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    const messages = await storage.getChatMessages(chat.id);
    res.json({ ...chat, messages });
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const chatId = Number(req.params.id);
      const input = api.messages.create.input.parse(req.body);
      
      // Add user message
      const message = await storage.addMessage({
        chatId,
        sender: input.sender,
        content: input.content
      });

      // Mock AI response if user sent a message
      if (input.sender === "user") {
        setTimeout(async () => {
          await storage.addMessage({
            chatId,
            sender: "ai",
            content: "I see. The pain started about an hour ago, mostly in my chest but moving to my arm."
          });
        }, 1000);
      }

      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
           message: err.errors[0].message,
           field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  // Get cases by difficulty
  app.get(api.cases.byDifficulty.path, async (req, res) => {
    const difficulty = req.params.difficulty as string;
    const casesByDifficulty = await storage.getCasesByDifficulty(difficulty);
    res.json(casesByDifficulty);
  });

  // Delete last user message (for retry)
  app.delete(api.messages.deleteLastUser.path, async (req, res) => {
    const chatId = Number(req.params.id);
    await storage.deleteLastUserMessage(chatId);
    res.json({ success: true });
  });

  // Complete a case with diagnosis result - evaluate server-side
  app.post(api.completions.create.path, async (req, res) => {
    try {
      const input = api.completions.create.input.parse(req.body);
      const caseData = await storage.getCase(input.caseId);
      
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }

      const diagLower = input.diagnosis.toLowerCase().trim();
      const expectedLower = (caseData.expectedDiagnosis || "").toLowerCase();
      const acceptableList = (caseData.acceptableDiagnoses || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
      
      let result: "correct" | "partial" | "wrong" = "wrong";
      
      if (diagLower.includes(expectedLower) || expectedLower.includes(diagLower)) {
        result = "correct";
      } else if (acceptableList.some(a => diagLower.includes(a) || a.includes(diagLower))) {
        result = "partial";
      }

      const completion = await storage.completeCase({
        userId: defaultUser!.id,
        caseId: input.caseId,
        chatId: input.chatId,
        result,
        diagnosis: input.diagnosis,
      });
      
      res.status(201).json({ completion, result });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  // Retry - delete last completion for this chat
  app.delete("/api/completions/retry/:chatId", async (req, res) => {
    const chatId = Number(req.params.chatId);
    const lastCompletion = await storage.getLastCompletionForChat(chatId);
    if (lastCompletion) {
      await storage.deleteCompletion(lastCompletion.id);
    }
    res.json({ success: true });
  });

  // Get user stats
  app.get(api.completions.userStats.path, async (req, res) => {
    const stats = await storage.getUserStats(defaultUser!.id);
    res.json(stats);
  });

  // Get completed case IDs
  app.get(api.completions.completedCases.path, async (req, res) => {
    const completedIds = await storage.getCompletedCaseIds(defaultUser!.id);
    res.json(completedIds);
  });

  // Get feedback for a chat
  app.get("/api/feedback/:chatId", async (req, res) => {
    const chatId = Number(req.params.chatId);
    const chat = await storage.getChat(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messages = await storage.getChatMessages(chatId);
    const caseData = await storage.getCase(chat.caseId);
    const completion = await storage.getLastCompletionForChat(chatId);

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (!completion) {
      return res.status(400).json({ 
        message: "Case not completed", 
        status: "incomplete",
        hint: "Complete the diagnosis first to view feedback"
      });
    }

    const userMessages = messages.filter(m => m.sender === "user");
    const aiMessages = messages.filter(m => m.sender === "ai");
    const messageCount = userMessages.length;
    const allConversation = messages.map(m => m.content.toLowerCase()).join(" ");

    const isCorrect = completion.result === "correct";
    const isPartial = completion.result === "partial";

    const correctDiagnosisPoints = isCorrect ? 40 : isPartial ? 20 : 0;
    const keyQuestionsPoints = Math.min(messageCount * 4, 20);
    const rightTestsPoints = isCorrect ? 20 : isPartial ? 10 : 5;
    const timeEfficiencyPoints = messageCount <= 8 ? 10 : messageCount <= 12 ? 7 : 3;
    const ruledOutPoints = isCorrect ? 10 : isPartial ? 5 : 2;

    const totalScore = correctDiagnosisPoints + keyQuestionsPoints + rightTestsPoints + timeEfficiencyPoints + ruledOutPoints;

    const caseDescription = caseData.description.toLowerCase();
    const acceptableDiags = (caseData.acceptableDiagnoses || "").split(",").map(s => s.trim()).filter(Boolean);
    
    const extractKeyTerms = (text: string): string[] => {
      const medicalTerms = ["pain", "fever", "rash", "weakness", "chest", "arm", "head", "nausea", 
                           "vomiting", "cough", "breathing", "dizziness", "fatigue", "swelling",
                           "radiating", "sudden", "onset", "duration", "history", "medication"];
      return medicalTerms.filter(term => text.includes(term));
    };

    const caseKeyTerms = extractKeyTerms(caseDescription);
    const conversationKeyTerms = extractKeyTerms(allConversation);
    
    const keySymptoms = caseKeyTerms.slice(0, 5).map((term, i) => ({
      id: String(i + 1),
      text: term.charAt(0).toUpperCase() + term.slice(1) + " assessment",
      importance: i < 2 ? "critical" as const : i < 4 ? "helpful" as const : "minor" as const,
      asked: conversationKeyTerms.includes(term)
    }));

    if (keySymptoms.length < 3) {
      keySymptoms.push(
        { id: "s1", text: "Chief complaint details", importance: "critical", asked: messageCount >= 1 },
        { id: "s2", text: "Symptom timeline", importance: "helpful", asked: messageCount >= 2 },
        { id: "s3", text: "Medical history", importance: "minor", asked: messageCount >= 3 }
      );
    }

    const buildDecisionTree = () => {
      const root: any = {
        id: "root",
        label: caseData.title.substring(0, 40),
        type: "symptom",
        asked: true,
        children: []
      };

      const userQuestionNodes = userMessages.slice(0, 3).map((msg, i) => ({
        id: `q${i + 1}`,
        label: msg.content.length > 35 ? msg.content.substring(0, 35) + "..." : msg.content,
        type: "symptom" as const,
        asked: true
      }));

      if (userQuestionNodes.length > 0) {
        let current = root;
        userQuestionNodes.forEach((node, i) => {
          if (i === 0) {
            current.children = [{ ...node, children: [] }];
            current = current.children[0];
          } else {
            current.children = [{ ...node, children: [] }];
            current = current.children[0];
          }
        });

        current.children = [
          {
            id: "diag",
            label: (caseData.expectedDiagnosis || "Unknown").toUpperCase(),
            type: "diagnosis",
            asked: isCorrect || isPartial
          }
        ];

        if (acceptableDiags.length > 0 && !isCorrect) {
          current.children.push({
            id: "alt",
            label: acceptableDiags[0].toUpperCase() + " (ruled out)",
            type: "ruled_out",
            asked: false
          });
        }
      } else {
        root.children = [{
          id: "diag",
          label: (caseData.expectedDiagnosis || "Unknown").toUpperCase(),
          type: "diagnosis",
          asked: isCorrect || isPartial
        }];
      }

      return root;
    };

    const decisionTree = buildDecisionTree();

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (isCorrect) {
      strengths.push(`Correctly identified ${caseData.expectedDiagnosis}`);
    }
    if (messageCount >= 3) {
      strengths.push(`Asked ${messageCount} questions to gather information`);
    }
    if (messageCount <= 8 && isCorrect) {
      strengths.push("Reached diagnosis efficiently");
    }
    if (keySymptoms.filter(c => c.asked).length >= 2) {
      strengths.push("Covered key symptom areas");
    }

    if (!isCorrect) {
      improvements.push(`The correct diagnosis was ${caseData.expectedDiagnosis}`);
    }
    if (messageCount < 3) {
      improvements.push("Ask more questions before diagnosing");
    }
    const missedCritical = keySymptoms.filter(c => !c.asked && c.importance === "critical");
    if (missedCritical.length > 0) {
      improvements.push(`Consider asking about: ${missedCritical.map(c => c.text.toLowerCase()).join(", ")}`);
    }

    const insight = {
      summary: isCorrect 
        ? `Great job! You diagnosed ${caseData.expectedDiagnosis} based on the ${caseData.specialty.toLowerCase()} presentation.`
        : isPartial
        ? `Close! You identified related findings. The specific diagnosis is ${caseData.expectedDiagnosis}.`
        : `This ${caseData.difficulty.toLowerCase()} ${caseData.specialty.toLowerCase()} case presented with ${caseKeyTerms.slice(0, 2).join(" and ")}.`,
      strengths: strengths.length > 0 ? strengths : ["Completed the case attempt"],
      improvements: improvements.length > 0 ? improvements : ["Review case details"],
      tip: `${caseData.specialty} tip: ${caseData.description.substring(0, 100)}...`
    };

    res.json({
      score: totalScore,
      breakdown: {
        correctDiagnosis: correctDiagnosisPoints,
        keyQuestions: keyQuestionsPoints,
        rightTests: rightTestsPoints,
        timeEfficiency: timeEfficiencyPoints,
        ruledOutDifferentials: ruledOutPoints
      },
      decisionTree,
      clues: keySymptoms,
      insight,
      userDiagnosis: completion.diagnosis,
      correctDiagnosis: caseData.expectedDiagnosis || "Unknown",
      result: completion.result
    });
  });

  return httpServer;
}
