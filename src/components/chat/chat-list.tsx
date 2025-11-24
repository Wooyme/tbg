'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from './chat-types';
import { ChatMessage } from './chat-message';

interface ChatListProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatList({ messages, isLoading }: ChatListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 space-y-6">
            {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <ChatMessage key="loading" message={{id: 'loading', author: 'ai', content: '...', timestamp: ''}} isLoading={true} />}
        </div>
    </ScrollArea>
  );
}
