import { GoogleGenAI } from "@google/genai";
import { storage } from "../storage";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

export async function generateChatResponse(message: string, username: string): Promise<string> {
  try {
    // Get API keys from storage
    const apiKeys = await storage.getApiKeys();
    
    // Try environment variable first, then storage
    const geminiApiKey = process.env.GEMINI_API_KEY || apiKeys.geminiApiKey;
    
    if (!geminiApiKey) {
      throw new Error("Gemini API key not configured. Please set it in the admin panel.");
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    
    const prompt = `Eres un asistente de IA que SIEMPRE responde en español. Tu nombre es Asistente y te diriges al usuario como "${username}". Siempre menciona su nombre al menos una vez en cada respuesta de manera natural y amigable. Sin importar el idioma en que te escriban, siempre debes responder en español de manera natural y fluida.

Usuario: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Lo siento, no pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate AI response");
  }
}