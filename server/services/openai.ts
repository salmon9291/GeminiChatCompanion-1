import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

export async function generateChatResponse(message: string, username: string): Promise<string> {
  try {
    // Get API keys from storage
    const apiKeys = await storage.getApiKeys();
    
    // Try environment variables first, then storage
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_1 || process.env.OPENAI_API_KEY_2 || apiKeys.openaiApiKey;
    
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured. Please set it in the admin panel.");
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant. Keep your responses conversational and concise. The user's name is ${username}.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}
