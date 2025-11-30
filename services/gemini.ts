import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let aiClient: GoogleGenAI | null = null;

export const getAIClient = (): GoogleGenAI => {
  if (!aiClient) {
    if (!process.env.API_KEY) {
      console.error("API_KEY is missing from environment variables");
      throw new Error("API Key missing");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const createChatSession = (): Chat => {
  const ai = getAIClient();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      tools: [{ googleSearch: {} }] // Enable Researcher tool
    }
  });
};

export const sendMessageStream = async (
  chat: Chat, 
  message: string, 
  attachments: { mimeType: string; data: string }[] = []
) => {
  try {
    const contents = {
      role: 'user',
      parts: [
        { text: message },
        ...attachments.map(att => ({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        }))
      ]
    };
    
    // Using sendMessageStream which accepts 'message' not 'contents' based on the specific SDK wrapper in instructions
    // However, the instructions say: chat.sendMessageStream({ message: "..." })
    // To support images, we construct the message content properly.
    // The SDK instructions for chat say: chat.sendMessageStream({ message: ... }) where message can be string or Part[].
    // Let's adapt to the instruction's specific signature constraints.
    
    const responseStream = await chat.sendMessageStream({ 
        message: contents.parts 
    });
    
    return responseStream;

  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const parseLearningPathJSON = (text: string): any | null => {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse Learning Path JSON", e);
      return null;
    }
  }
  return null;
};
