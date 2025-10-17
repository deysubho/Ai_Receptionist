import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHelpRequestSchema, insertCustomerSchema, updateHelpRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all help requests with customer info
  app.get("/api/requests", async (req, res) => {
    try {
      const requests = await storage.getAllHelpRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching help requests:", error);
      res.status(500).json({ error: "Failed to fetch help requests" });
    }
  });

  // Get specific help request
  app.get("/api/requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getHelpRequestWithCustomer(id);
      
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching help request:", error);
      res.status(500).json({ error: "Failed to fetch help request" });
    }
  });

  // Create new help request (called by AI agent)
  app.post("/api/requests", async (req, res) => {
    try {
      const data = insertHelpRequestSchema.parse(req.body);
      const request = await storage.createHelpRequest(data);
      
      console.log(`📞 NEW ESCALATION: Customer ${data.customerId} asked: "${data.question}"`);
      console.log(`🔔 SUPERVISOR NOTIFICATION: New help request #${request.id} needs your attention`);
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating help request:", error);
      res.status(400).json({ error: "Failed to create help request" });
    }
  });

  // Submit answer to help request (supervisor action)
  app.patch("/api/requests/:id/answer", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = updateHelpRequestSchema.parse(req.body);
      
      // Update request status to processing
      await storage.updateHelpRequestStatus(id, "processing");
      
      // Get request with customer info
      const requestBefore = await storage.getHelpRequestWithCustomer(id);
      if (!requestBefore) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      // Update request with answer
      const updatedRequest = await storage.updateHelpRequest(id, data);
      if (!updatedRequest) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      // Simulate immediate callback to customer
      console.log("\n" + "=".repeat(80));
      console.log("📱 IMMEDIATE CALLBACK TO CUSTOMER");
      console.log("=".repeat(80));
      console.log(`Customer: ${requestBefore.customer.name} (${requestBefore.customer.phone})`);
      console.log(`AI Agent: "Sorry for the delay. ${data.answer}"`);
      console.log("=".repeat(80) + "\n");
      
      // Add to knowledge base
      const kbEntry = await storage.createKnowledgeBaseEntry({
        question: requestBefore.question,
        answer: data.answer,
        category: "supervisor-taught",
      });
      
      console.log(`📚 KNOWLEDGE BASE UPDATED: Entry #${kbEntry.id} added`);
      console.log(`   Question: "${requestBefore.question}"`);
      console.log(`   Answer: "${data.answer}"\n`);
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating help request:", error);
      res.status(400).json({ error: "Failed to update help request" });
    }
  });

  // Get all knowledge base entries
  app.get("/api/knowledge", async (req, res) => {
    try {
      const entries = await storage.getAllKnowledgeBase();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  // Search knowledge base
  app.get("/api/knowledge/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      
      const results = await storage.searchKnowledgeBase(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching knowledge base:", error);
      res.status(500).json({ error: "Failed to search knowledge base" });
    }
  });

  // Create customer (called by AI agent)
  app.post("/api/customers", async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      
      // Check if customer already exists
      const existing = await storage.getCustomerByPhone(data.phone);
      if (existing) {
        return res.json(existing);
      }
      
      const customer = await storage.createCustomer(data);
      console.log(`👤 NEW CUSTOMER: ${customer.name} (${customer.phone})`);
      
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ error: "Failed to create customer" });
    }
  });

  // Get customer by phone (for AI agent lookup)
  app.get("/api/customers/phone/:phone", async (req, res) => {
    try {
      const phone = req.params.phone;
      const customer = await storage.getCustomerByPhone(phone);
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
