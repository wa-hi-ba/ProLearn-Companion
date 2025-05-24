
import { GoogleGenAI, Chat } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';

class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      console.error("Gemini API Key is not provided. Service will not function.");
      // In a real app, you might throw an error or have a fallback,
      // but here we rely on the environment variable being set.
      // For now, let's create a dummy ai object to prevent crashes if key is missing,
      // though API calls will fail. A better approach is to prevent app initialization.
      this.ai = {} as GoogleGenAI; // This is a hack; ensure API key is present
      if (!apiKey && typeof window !== 'undefined') { // only try to initialize if API_KEY is present
         throw new Error("Gemini API Key is not configured.");
      }
       this.ai = new GoogleGenAI({ apiKey: apiKey! });
    } else {
       this.ai = new GoogleGenAI({ apiKey });
    }
  }

  public initializeChat(modelName: string): Chat {
    if (!this.ai.chats) { // Check if ai was properly initialized
        throw new Error("Gemini AI client not initialized. Check API Key.");
    }
    return this.ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }

  public async streamMessage(
    chat: Chat,
    message: string,
    onChunk: (chunkText: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (!chat || !chat.sendMessageStream) {
        onError("Chat session is not properly initialized.");
        onComplete(); // still call onComplete to finalize loading states etc.
        return;
    }
    try {
      const stream = await chat.sendMessageStream({ message });
      for await (const chunk of stream) {
        if (chunk && typeof chunk.text === 'string') {
            onChunk(chunk.text);
        }
      }
      onComplete();
    } catch (e) {
      console.error("Error streaming message from Gemini:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred with the AI service.";
      onError(errorMessage);
      // Do not call onComplete here if onError is meant to signal failure.
      // Or, ensure onComplete is always called in a finally block if needed.
      // For now, onError handles the end of this attempt.
    }
  }
}

// Initialize the service with the API key from environment variables
// This assumes process.env.API_KEY is set in the build environment or globally
export const geminiService = new GeminiService(process.env.API_KEY);
    