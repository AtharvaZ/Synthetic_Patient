import { users, cases, chats, messages, caseCompletions, type User, type Case, type Chat, type Message, type InsertMessage, type CaseCompletion, type InsertCaseCompletion } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;

  // Cases
  getCases(): Promise<Case[]>;
  getCasesByDifficulty(difficulty: string): Promise<Case[]>;
  getCase(id: number): Promise<Case | undefined>;
  createCase(caseData: Omit<Case, "id">): Promise<Case>;

  // Chats
  createChat(userId: number, caseId: number): Promise<Chat>;
  getChat(id: number): Promise<Chat | undefined>;
  getChatMessages(chatId: number): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  deleteLastUserMessage(chatId: number): Promise<void>;

  // Case Completions
  completeCase(data: InsertCaseCompletion): Promise<CaseCompletion>;
  deleteCompletion(id: number): Promise<void>;
  getLastCompletionForChat(chatId: number): Promise<CaseCompletion | undefined>;
  getUserCompletions(userId: number): Promise<CaseCompletion[]>;
  getUserStats(userId: number): Promise<{ streak: number; casesSolved: number; accuracy: number }>;
  getCompletedCaseIds(userId: number): Promise<number[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cases: Map<number, Case>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private completions: Map<number, CaseCompletion>;
  
  private userIdCounter = 1;
  private caseIdCounter = 1;
  private chatIdCounter = 1;
  private messageIdCounter = 1;
  private completionIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.completions = new Map();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: Omit<User, "id">): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCases(): Promise<Case[]> {
    return Array.from(this.cases.values());
  }

  async getCasesByDifficulty(difficulty: string): Promise<Case[]> {
    return Array.from(this.cases.values()).filter(c => c.difficulty === difficulty);
  }

  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async createCase(caseData: Omit<Case, "id">): Promise<Case> {
    const id = this.caseIdCounter++;
    const newCase: Case = { ...caseData, id };
    this.cases.set(id, newCase);
    return newCase;
  }

  async createChat(userId: number, caseId: number): Promise<Chat> {
    const id = this.chatIdCounter++;
    const chat: Chat = { 
      id, 
      userId, 
      caseId, 
      status: "active",
      createdAt: new Date() 
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.chatId === chatId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = { 
      ...message, 
      id,
      createdAt: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async deleteLastUserMessage(chatId: number): Promise<void> {
    const chatMessages = Array.from(this.messages.values())
      .filter(m => m.chatId === chatId && m.sender === "user")
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    if (chatMessages.length > 0) {
      this.messages.delete(chatMessages[0].id);
    }
  }

  async completeCase(data: InsertCaseCompletion): Promise<CaseCompletion> {
    const id = this.completionIdCounter++;
    const completion: CaseCompletion = {
      ...data,
      id,
      completedAt: new Date()
    };
    this.completions.set(id, completion);
    return completion;
  }

  async deleteCompletion(id: number): Promise<void> {
    this.completions.delete(id);
  }

  async getLastCompletionForChat(chatId: number): Promise<CaseCompletion | undefined> {
    const completions = Array.from(this.completions.values())
      .filter(c => c.chatId === chatId)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
    return completions[0];
  }

  async getUserCompletions(userId: number): Promise<CaseCompletion[]> {
    return Array.from(this.completions.values()).filter(c => c.userId === userId);
  }

  async getCompletedCaseIds(userId: number): Promise<number[]> {
    const completions = await this.getUserCompletions(userId);
    return Array.from(new Set(completions.map(c => c.caseId)));
  }

  async getUserStats(userId: number): Promise<{ streak: number; casesSolved: number; accuracy: number }> {
    const completions = await this.getUserCompletions(userId);
    const uniqueCases = new Set(completions.map(c => c.caseId));
    const correctCount = completions.filter(c => c.result === "correct").length;
    const totalAttempts = completions.length;
    
    return {
      streak: Math.min(uniqueCases.size, 7),
      casesSolved: uniqueCases.size,
      accuracy: totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0
    };
  }
}

export const storage = new MemStorage();
