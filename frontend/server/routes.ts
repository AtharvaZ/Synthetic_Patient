import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

function extractSymptomsFromDescription(description: string): {
  presenting: string[];
  absent: string[];
  examFindings: string[];
} {
  const text = description.toLowerCase();
  
  const symptomPatterns: Record<string, string[]> = {
    cardiovascular: ["chest pain", "palpitations", "shortness of breath", "radiating pain", "arm pain", "jaw pain", "sweating", "diaphoresis"],
    neurological: ["headache", "weakness", "numbness", "confusion", "aphasia", "hemiparesis", "dizziness", "vision changes", "seizure"],
    respiratory: ["cough", "wheezing", "dyspnea", "sputum", "hemoptysis", "breathing difficulty"],
    gastrointestinal: ["nausea", "vomiting", "abdominal pain", "diarrhea", "constipation", "bloating"],
    infectious: ["fever", "chills", "rash", "fatigue", "malaise", "night sweats"],
    musculoskeletal: ["joint pain", "stiffness", "swelling", "muscle pain", "back pain"],
    dermatological: ["rash", "itching", "skin lesion", "discoloration"],
    general: ["fatigue", "weight loss", "appetite loss", "sleep disturbance"]
  };

  const presenting: string[] = [];
  const examFindings: string[] = [];
  
  for (const [category, symptoms] of Object.entries(symptomPatterns)) {
    for (const symptom of symptoms) {
      if (text.includes(symptom)) {
        presenting.push(symptom);
      }
    }
  }

  const examPatterns = ["blood pressure", "heart rate", "pulse", "temperature", "respiratory rate", "oxygen saturation", "tenderness", "swelling", "bruising", "pallor", "cyanosis", "edema"];
  for (const finding of examPatterns) {
    if (text.includes(finding)) {
      examFindings.push(finding);
    }
  }

  const absent: string[] = [];
  const commonRuleOuts = ["fever", "nausea", "vomiting", "headache", "rash", "cough"];
  for (const symptom of commonRuleOuts) {
    if (!text.includes(symptom) && presenting.length > 0) {
      absent.push(symptom);
      if (absent.length >= 3) break;
    }
  }

  return { presenting: Array.from(new Set(presenting)), absent: Array.from(new Set(absent)), examFindings: Array.from(new Set(examFindings)) };
}

function inferPatientDemographics(description: string): { age: string | null; gender: string | null } {
  const ageMatch = description.match(/(\d+)[\s-]*(year|yr|y\.?o\.?)/i);
  const age = ageMatch ? `${ageMatch[1]} years old` : null;
  
  let gender: string | null = null;
  if (/\b(male|man|boy|gentleman|he|his)\b/i.test(description)) {
    gender = "male";
  } else if (/\b(female|woman|girl|lady|she|her)\b/i.test(description)) {
    gender = "female";
  }
  
  return { age, gender };
}

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
      
      const message = await storage.addMessage({
        chatId,
        sender: input.sender,
        content: input.content
      });

      if (input.sender === "user") {
        const chat = await storage.getChat(chatId);
        if (!chat) {
          return res.status(404).json({ message: "Chat not found" });
        }
        
        const caseData = await storage.getCase(chat.caseId);
        if (!caseData) {
          return res.status(404).json({ message: "Case not found" });
        }
        
        const messages = await storage.getChatMessages(chatId);
        
        const conversationHistory = messages.slice(0, -1).map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content
        }));

        try {
          const extracted = extractSymptomsFromDescription(caseData.description);
          const demographics = inferPatientDemographics(caseData.description);
          
          const aiResponse = await fetch(`${BACKEND_URL}/api/ai/patient-response`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              case: {
                case_id: `case_${caseData.id}`,
                age: demographics.age,
                gender: demographics.gender,
                chief_complaint: caseData.title,
                history: caseData.description,
                duration: null,
                severity: caseData.difficulty,
                triggers: null,
                diagnosis: caseData.expectedDiagnosis,
                description: caseData.description,
                presenting_symptoms: extracted.presenting,
                absent_symptoms: extracted.absent,
                exam_findings: extracted.examFindings
              },
              conversation_history: conversationHistory,
              student_message: input.content
            })
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            await storage.addMessage({
              chatId,
              sender: "ai",
              content: aiData.patient_response
            });
          } else {
            await storage.addMessage({
              chatId,
              sender: "ai",
              content: "I'm not feeling well... could you ask me more specific questions about my symptoms?"
            });
          }
        } catch (aiError) {
          console.error("AI service error:", aiError);
          await storage.addMessage({
            chatId,
            sender: "ai",
            content: "I'm here, doctor. What would you like to know about how I'm feeling?"
          });
        }
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

  // Get feedback for a chat - uses AI when available
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

    try {
      const extracted = extractSymptomsFromDescription(caseData.description);
      
      const aiResponse = await fetch(`${BACKEND_URL}/api/ai/generate-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case: {
            case_id: `case_${caseData.id}`,
            title: caseData.title,
            description: caseData.description,
            specialty: caseData.specialty,
            difficulty: caseData.difficulty,
            expected_diagnosis: caseData.expectedDiagnosis,
            acceptable_diagnoses: caseData.acceptableDiagnoses,
            presenting_symptoms: extracted.presenting,
            absent_symptoms: extracted.absent,
            exam_findings: extracted.examFindings
          },
          conversation: messages.map(m => ({
            sender: m.sender,
            content: m.content,
            timestamp: m.createdAt
          })),
          student_diagnosis: completion.diagnosis,
          diagnosis_result: completion.result,
          time_spent_seconds: null
        })
      });

      if (aiResponse.ok) {
        const aiFeedback = await aiResponse.json();
        return res.json({
          score: aiFeedback.score,
          breakdown: {
            correctDiagnosis: aiFeedback.breakdown.correct_diagnosis,
            keyQuestions: aiFeedback.breakdown.key_questions,
            rightTests: aiFeedback.breakdown.right_tests,
            timeEfficiency: aiFeedback.breakdown.time_efficiency,
            ruledOutDifferentials: aiFeedback.breakdown.ruled_out_differentials
          },
          decisionTree: aiFeedback.decision_tree,
          clues: aiFeedback.clues,
          insight: aiFeedback.insight,
          userDiagnosis: aiFeedback.user_diagnosis,
          correctDiagnosis: aiFeedback.correct_diagnosis,
          result: aiFeedback.result
        });
      }
    } catch (aiError) {
      console.error("AI feedback generation failed, using fallback:", aiError);
    }

    const userMessages = messages.filter(m => m.sender === "user");
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
        correct: null,
        children: []
      };

      const userQuestionNodes = userMessages.slice(0, 3).map((msg, i) => ({
        id: `q${i + 1}`,
        label: msg.content.length > 35 ? msg.content.substring(0, 35) + "..." : msg.content,
        correct: true
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
            correct: isCorrect || isPartial,
            children: []
          }
        ];

        if (acceptableDiags.length > 0 && !isCorrect) {
          current.children.push({
            id: "alt",
            label: acceptableDiags[0].toUpperCase() + " (ruled out)",
            correct: false,
            children: []
          });
        }
      } else {
        root.children = [{
          id: "diag",
          label: (caseData.expectedDiagnosis || "Unknown").toUpperCase(),
          correct: isCorrect || isPartial,
          children: []
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
