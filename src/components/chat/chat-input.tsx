'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInputProps {
  onSendMessage: (input: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${Math.min(scrollHeight, 128)}px`; // Max height approx 5 rows
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };

  const handleCommandSelect = (command: string) => {
    setInput(prev => `${command} ${prev}`.trim());
    textareaRef.current?.focus();
  };


  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
      <div className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Type your message or use / to see commands..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          className="pr-12 resize-none overflow-y-auto"
        />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 shrink-0"
                    aria-label="Insert command"
                    disabled={isLoading}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleCommandSelect('/start')}>
                    /start
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleCommandSelect('/player_config')}>
                    /player_config
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleCommandSelect('/background_config')}>
                    /background_config
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={() => handleCommandSelect('/threads')}>
                    /threads
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={() => handleCommandSelect('/end')}>
                    /end
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </form>
  );
}
