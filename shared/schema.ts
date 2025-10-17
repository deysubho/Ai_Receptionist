import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Help Request table - tracks customer escalations
export const helpRequests = sqliteTable("help_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull(),
  question: text("question").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, resolved, timeout
  answer: text("answer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

// Customer table - stores caller information
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Knowledge Base table - stores learned Q&A pairs
export const knowledgeBase = sqliteTable("knowledge_base", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
  learnedAt: integer("learned_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  usageCount: integer("usage_count").notNull().default(0),
});

// Insert schemas
export const insertHelpRequestSchema = createInsertSchema(helpRequests).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  learnedAt: true,
  usageCount: true,
});

// Update schema for help requests
export const updateHelpRequestSchema = z.object({
  answer: z.string().min(1),
  status: z.enum(["pending", "processing", "resolved", "timeout"]).optional(),
});

// Types
export type HelpRequest = typeof helpRequests.$inferSelect;
export type InsertHelpRequest = z.infer<typeof insertHelpRequestSchema>;
export type UpdateHelpRequest = z.infer<typeof updateHelpRequestSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type KnowledgeBaseEntry = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBaseEntry = z.infer<typeof insertKnowledgeBaseSchema>;

// Extended type for help requests with customer info
export type HelpRequestWithCustomer = HelpRequest & {
  customer: Customer;
};
