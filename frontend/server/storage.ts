import { users, cases, chats, messages, type User, type Case, type Chat, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;

  // Cases
  getCases(): Promise<Case[]>;
  getCase(id: number): Promise<Case | undefined>;
  createCase(caseData: Omit<Case, "id">): Promise<Case>;

  // Chats
  createChat(userId: number, caseId: number): Promise<Chat>;
  getChat(id: number): Promise<Chat | undefined>;
  getChatMessages(chatId: number): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cases: Map<number, Case>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  
  private userIdCounter = 1;
  private caseIdCounter = 1;
  private chatIdCounter = 1;
  private messageIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.chats = new Map();
    this.messages = new Map();
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
}

export const storage = new MemStorage();
