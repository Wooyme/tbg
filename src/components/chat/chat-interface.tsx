'use client';

import { useState, useEffect } from 'react';
import type { MessageDisplay, MessageRaw } from './chat-types';
import { ChatList } from './chat-list';
import { ChatInput } from './chat-input';
import { handleUserMessage } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

const welcomeMessage: Omit<MessageDisplay, 'timestamp' | 'id'> = {
    author: 'ai' as const,
    content: (
      <div className="space-y-2">
        <p className="font-bold text-lg">Welcome to EchoVerse!</p>
        <p>This is an AI-powered text adventure. To begin your journey, use the <code className="bg-muted text-primary-foreground px-1 py-0.5 rounded-sm font-mono text-sm">/start</code> command.</p>
        <p className="mt-2 text-muted-foreground">For example: <code className="bg-muted text-primary-foreground px-1 py-0.5 rounded-sm font-mono text-sm">/start a space opera on a derelict starship</code></p>
      </div>
    ),
};

export function ChatInterface() {
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set initial message on client to avoid hydration mismatch with timestamp
    setMessages([{
        ...welcomeMessage,
        id: 'init',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
  }, []);

  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: MessageDisplay = {
      id: `user-${Date.now()}`,
      author: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Convert MessageDisplay[] to MessageRaw[] for the action
    const historyForAction: MessageRaw[] = newMessages.map(m => ({
        ...m,
        // We can only serialize string content
        content: typeof m.content === 'string' ? m.content : '[system message]',
    }));


    try {
      const aiResponseContent = await handleUserMessage(historyForAction, input);
      const aiMessage: MessageDisplay = {
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
