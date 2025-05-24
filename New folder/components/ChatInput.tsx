
import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from './Icons'; // Assuming Icons.tsx exists

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height after sending
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);


  return (
    <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-slate-800/70 backdrop-blur-md border-t border-slate-700 flex items-end space-x-2 sticky bottom-0">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-slate-400 min-h-[48px] max-h-40 overflow-y-auto"
        rows={1}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 h-[48px] w-[48px] flex items-center justify-center"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <PaperAirplaneIcon className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default ChatInput;
    