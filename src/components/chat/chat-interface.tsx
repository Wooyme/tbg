'use client';

import { useState, useEffect } from 'react';
import type { Message } from './chat-types';
import { ChatList } from './chat-list';
import { ChatInput } from './chat-input';
import { handleUserMessage } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

const welcomeMessage = {
    id: 'init',
    author: 'ai' as const,
    content: (
      <div className="space-y-2">
        <p className="font-bold text-lg">Welcome to EchoVerse!</p>
        <p>This is an AI-powered text adventure. To begin your journey, use the <code className="bg-muted text-primary-foreground px-1 py-0.5 rounded-sm font-mono text-sm">/start</code> command.</p>
        <p className="mt-2 text-muted-foreground">For example: <code className="bg-muted text-primary-foreground px-1 py-0.5 rounded-sm font-mono text-sm">/start a space opera on a derelict starship</code></p>
      </div>
    ),
    timestamp: '',
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set initial message on client to avoid hydration mismatch with timestamp
    setMessages([{
        ...welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
  }, []);

  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      author: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const aiResponseContent = await handleUserMessage(newMessages, input);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        author: 'ai',
        content: aiResponseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with the AI. Please try again.",
        });
        setMessages(prev => prev.slice(0, prev.length -1)); // Remove the user message if AI fails
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatList messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}
