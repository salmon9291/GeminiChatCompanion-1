import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse } from "./services/gemini";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const chatRequestSchema = z.object({
  content: z.string().min(1),
  username: z.string().min(1),
});

const apiKeysSchema = z.object({
  geminiApiKey: z.string(),
  openaiApiKey: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get messages for a user
  app.get("/api/messages/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const messages = await storage.getMessages(username);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message and get AI response
  app.post("/api/messages", async (req, res) => {
    try {
      const { content, username } = chatRequestSchema.parse(req.body);

      // Save user message
      const userMessage = await storage.createMessage({
        content,
        sender: "user",
        username,
      });

      // Generate AI response
      const aiResponse = await generateChatResponse(content, username);

      // Save AI message
      const aiMessage = await storage.createMessage({
        content: aiResponse,
        sender: "assistant",
        username,
      });

      res.json({
        userMessage,
        aiMessage,
      });
    } catch (error) {
      console.error("Error processing message:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data" });
      } else {
        res.status(500).json({ error: "Failed to process message" });
      }
    }
  });

  // Clear messages for a user
  app.delete("/api/messages/:username", async (req, res) => {
    try {
      const { username } = req.params;
      await storage.clearMessages(username);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  // Admin routes for API key management
  
  // Get current API keys
  app.get("/api/admin/keys", async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeys();
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  // Update API keys
  app.post("/api/admin/keys", async (req, res) => {
    try {
      const keys = apiKeysSchema.parse(req.body);
      await storage.setApiKeys(keys);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating API keys:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid API key data" });
      } else {
        res.status(500).json({ error: "Failed to update API keys" });
      }
    }
  });

  // Test Gemini connection
  app.post("/api/admin/test/gemini", async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeys();
      if (!apiKeys.geminiApiKey) {
        return res.status(400).json({ error: "Gemini API key not configured" });
      }

      const genAI = new GoogleGenAI({ apiKey: apiKeys.geminiApiKey });
      
      // Simple test prompt
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Test connection",
      });
      
      res.json({ success: true, message: "Gemini connection successful" });
    } catch (error) {
      console.error("Gemini connection test failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Gemini connection failed", details: errorMessage });
    }
  });

  // Test OpenAI connection
  app.post("/api/admin/test/openai", async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeys();
      if (!apiKeys.openaiApiKey) {
        return res.status(400).json({ error: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey: apiKeys.openaiApiKey });
      
      // Simple test request
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: "Test connection" }],
        model: "gpt-3.5-turbo",
        max_tokens: 10,
      });
      
      res.json({ success: true, message: "OpenAI connection successful" });
    } catch (error) {
      console.error("OpenAI connection test failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "OpenAI connection failed", details: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
