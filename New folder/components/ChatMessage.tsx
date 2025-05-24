
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { UserCircleIcon, SparklesIcon } from './Icons'; // Assuming Icons.tsx exists

// A simple markdown-to-HTML parser (very basic for bold and lists)
const parseMarkdown = (text: string): React.ReactNode => {
  // Replace **text** with <strong>text</strong>
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Replace * item or - item with <li>item</li>
  html = html.replace(/^(\s*[\*\-]\s+)(.*)$/gm, (match, p1, p2) => `<li>${p2.trim()}</li>`);
  // Wrap consecutive <li> items in <ul>
  html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => `<ul class="list-disc list-inside pl-4 my-1">${match}</ul>`);

  // Split by newlines and wrap each line in a div to preserve line breaks
  // This also helps in rendering the HTML string correctly
  return html.split('\n').map((line, index) => (
    <div key={index} dangerouslySetInnerHTML={{ __html: line || '<br/>' }} />
  ));
};


const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-end space-x-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white">
          <SparklesIcon className="w-5 h-5" />
        </div>
      )}
      <div
        className={`
          p-3 rounded-2xl shadow-md max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl break-words
          ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none'}
        `}
      >
        {message.sender === 'ai' ? parseMarkdown(message.text) : message.text}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-300">
          <UserCircleIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
    