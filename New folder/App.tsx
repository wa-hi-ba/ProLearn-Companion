
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as ChatMessageType } from './types';
import { GEMINI_MODEL_NAME, APP_TITLE }  from './constants';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingSpinner from './components/LoadingSpinner';
import { geminiService } from './services/geminiService';
import type { Chat } from '@google/genai';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!process.env.API_KEY) {
          setError("API Key is missing. Please ensure it's configured in your environment variables.");
          setIsLoading(false);
          console.error("API Key is missing from process.env.API_KEY");
          return;
        }
        const session = geminiService.initializeChat(GEMINI_MODEL_NAME);
        setChatSession(session);
         setMessages([
          {
            id: 'initial-ai-greeting',
            text: `Hello! I'm your ${APP_TITLE}. How can I assist your professional development today?`,
            sender: 'ai',
            timestamp: new Date(),
          }
        ]);
      } catch (e) {
        console.error("Failed to initialize chat session:", e);
        setError("Could not connect to the learning assistant. Please check your configuration and try again.");
      }
    };
    initializeChat();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    const aiMessageId = `ai-${Date.now()}`;
    // Add a placeholder for the AI response
    setMessages(prevMessages => [
      ...prevMessages,
      { id: aiMessageId, text: '', sender: 'ai', timestamp: new Date() }
    ]);

    try {
      await geminiService.streamMessage(
        chatSession,
        inputText,
        (chunkText) => {
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === aiMessageId ? { ...msg, text: msg.text + chunkText } : msg
            )
          );
        },
        () => { // onComplete
          setIsLoading(false);
        },
        (apiError) => { // onError
          console.error("Gemini API Error:", apiError);
          setError(`An error occurred: ${apiError}. Please try again.`);
          setMessages(prevMessages => prevMessages.filter(msg => msg.id !== aiMessageId)); // Remove placeholder on error
          setIsLoading(false);
        }
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Failed to send message:", e);
      setError(`Failed to send message: ${errorMessage}`);
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== aiMessageId)); // Remove placeholder on error
      setIsLoading(false);
    }
  }, [isLoading, chatSession]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 font-sans">
      <Header title={APP_TITLE} />
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length -1]?.sender === 'user' && ( // Show spinner only if last message was user and waiting for AI
           <div className="flex justify-start">
             <div className="bg-slate-700 rounded-lg rounded-bl-none p-3 max-w-xs lg:max-w-md shadow-md animate-pulse">
                <LoadingSpinner size={6} />
             </div>
           </div>
        )}
      </div>
      {error && (
        <div className="p-4 text-center text-red-400 bg-red-900/50">
          <p>Error: {error}</p>
        </div>
      )}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
    