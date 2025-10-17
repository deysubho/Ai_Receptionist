import { db } from "./db";
import {
  type HelpRequest,
  type InsertHelpRequest,
  type UpdateHelpRequest,
  type Customer,
  type InsertCustomer,
  type KnowledgeBaseEntry,
  type InsertKnowledgeBaseEntry,
  type HelpRequestWithCustomer,
} from "@shared/schema";

export interface IStorage {
  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Help Request operations
  getHelpRequest(id: number): Promise<HelpRequest | undefined>;
  getHelpRequestWithCustomer(id: number): Promise<HelpRequestWithCustomer | undefined>;
  getAllHelpRequests(): Promise<HelpRequestWithCustomer[]>;
  createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest>;
  updateHelpRequest(id: number, data: UpdateHelpRequest): Promise<HelpRequest | undefined>;
  updateHelpRequestStatus(id: number, status: string): Promise<void>;

  // Knowledge Base operations
  getAllKnowledgeBase(): Promise<KnowledgeBaseEntry[]>;
  getKnowledgeBaseEntry(id: number): Promise<KnowledgeBaseEntry | undefined>;
  searchKnowledgeBase(query: string): Promise<KnowledgeBaseEntry[]>;
  createKnowledgeBaseEntry(entry: InsertKnowledgeBaseEntry): Promise<KnowledgeBaseEntry>;
  incrementUsageCount(id: number): Promise<void>;
}

export class SQLiteStorage implements IStorage {
  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    const stmt = db.prepare("SELECT * FROM customers WHERE id = ?");
    const row = stmt.get(id) as any;
    if (!row) return undefined;
    return {
      ...row,
      createdAt: row.created_at * 1000,
    };
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const stmt = db.prepare("SELECT * FROM customers WHERE phone = ?");
    const row = stmt.get(phone) as any;
    if (!row) return undefined;
    return {
      ...row,
      createdAt: row.created_at * 1000,
    };
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const stmt = db.prepare(
      "INSERT INTO customers (name, phone) VALUES (?, ?) RETURNING *"
    );
    const row = stmt.get(customer.name, customer.phone) as any;
    return {
      ...row,
      createdAt: row.created_at * 1000,
    };
  }

  // Help Request operations
  async getHelpRequest(id: number): Promise<HelpRequest | undefined> {
    const stmt = db.prepare("SELECT * FROM help_requests WHERE id = ?");
    const row = stmt.get(id) as any;
    if (!row) return undefined;
    return {
      ...row,
      createdAt: row.created_at * 1000,
      resolvedAt: row.resolved_at ? row.resolved_at * 1000 : null,
    };
  }

  async getHelpRequestWithCustomer(id: number): Promise<HelpRequestWithCustomer | undefined> {
    const stmt = db.prepare(`
      SELECT 
        hr.*,
        json_object(
          'id', c.id,
          'name', c.name,
          'phone', c.phone,
          'createdAt', c.created_at * 1000
        ) as customer
      FROM help_requests hr
      JOIN customers c ON hr.customer_id = c.id
      WHERE hr.id = ?
    `);
    const row = stmt.get(id) as any;
    if (!row) return undefined;
    
    return {
      ...row,
      createdAt: row.created_at * 1000,
      resolvedAt: row.resolved_at ? row.resolved_at * 1000 : null,
      customer: JSON.parse(row.customer),
    } as HelpRequestWithCustomer;
  }

  async getAllHelpRequests(): Promise<HelpRequestWithCustomer[]> {
    const stmt = db.prepare(`
      SELECT 
        hr.*,
        json_object(
          'id', c.id,
          'name', c.name,
          'phone', c.phone,
          'createdAt', c.created_at * 1000
        ) as customer
      FROM help_requests hr
      JOIN customers c ON hr.customer_id = c.id
      ORDER BY hr.created_at DESC
    `);
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      ...row,
      createdAt: row.created_at * 1000,
      resolvedAt: row.resolved_at ? row.resolved_at * 1000 : null,
      customer: JSON.parse(row.customer),
    })) as HelpRequestWithCustomer[];
  }

  async createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest> {
    const stmt = db.prepare(`
      INSERT INTO help_requests (customer_id, question, status, answer)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `);
    const row = stmt.get(
      request.customerId,
      request.question,
      request.status || "pending",
      request.answer || null
    ) as any;
    return {
      ...row,
      createdAt: row.created_at * 1000,
      resolvedAt: row.resolved_at ? row.resolved_at * 1000 : null,
    };
  }

  async updateHelpRequest(id: number, data: UpdateHelpRequest): Promise<HelpRequest | undefined> {
    const stmt = db.prepare(`
      UPDATE help_requests
      SET answer = ?, status = 'resolved', resolved_at = unixepoch()
      WHERE id = ?
      RETURNING *
    `);
    const row = stmt.get(data.answer, id) as any;
    if (!row) return undefined;
    return {
      ...row,
      createdAt: row.created_at * 1000,
      resolvedAt: row.resolved_at * 1000,
    };
  }

  async updateHelpRequestStatus(id: number, status: string): Promise<void> {
    const stmt = db.prepare(`
      UPDATE help_requests
      SET status = ?
      WHERE id = ?
    `);
    stmt.run(status, id);
  }

  // Knowledge Base operations
  async getAllKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
    const stmt = db.prepare("SELECT * FROM knowledge_base ORDER BY learned_at DESC");
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      learnedAt: row.learned_at * 1000,
    }));
  }

  async getKnowledgeBaseEntry(id: number): Promise<KnowledgeBaseEntry | undefined> {
    const stmt = db.prepare("SELECT * FROM knowledge_base WHERE id = ?");
    const row = stmt.get(id) as any;
    if (!row) return undefined;
    return {
      ...row,
      learnedAt: row.learned_at * 1000,
    };
  }

  async searchKnowledgeBase(query: string): Promise<KnowledgeBaseEntry[]> {
    const stmt = db.prepare(`
      SELECT * FROM knowledge_base
      WHERE question LIKE ? OR answer LIKE ?
      ORDER BY usage_count DESC, learned_at DESC
      LIMIT 5
    `);
    const searchTerm = `%${query}%`;
    const rows = stmt.all(searchTerm, searchTerm) as any[];
    return rows.map(row => ({
      ...row,
      learnedAt: row.learned_at * 1000,
    }));
  }

  async createKnowledgeBaseEntry(entry: InsertKnowledgeBaseEntry): Promise<KnowledgeBaseEntry> {
    const stmt = db.prepare(`
      INSERT INTO knowledge_base (question, answer, category)
      VALUES (?, ?, ?)
      RETURNING *
    `);
    const row = stmt.get(entry.question, entry.answer, entry.category || null) as any;
    return {
      ...row,
      learnedAt: row.learned_at * 1000,
    };
  }

  async incrementUsageCount(id: number): Promise<void> {
    const stmt = db.prepare(`
      UPDATE knowledge_base
      SET usage_count = usage_count + 1
      WHERE id = ?
    `);
    stmt.run(id);
  }
}

export const storage = new SQLiteStorage();
