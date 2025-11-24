import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageDisplay } from './chat-types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SystemPromptModal } from './system-prompt-modal';
import { Button } from '../ui/button';

interface ChatMessageProps {
  message: MessageDisplay;
  isLoading?: boolean;
}

function TypingIndicator() {
    return (
        <div className="flex items-center space-x-1 p-2">
            <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 bg-current rounded-full animate-bounce"></span>
        </div>
    );
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isAi = message.author === 'ai';

  const AiAvatar = () => (
    <Avatar className="h-8 w-8 border-2 border-primary/50 shrink-0">
      <AvatarFallback className="bg-primary text-primary-foreground">
        <Bot className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className={cn('flex items-start gap-3', !isAi && 'flex-row-reverse')}>
      {isAi ? (
        <SystemPromptModal>
            <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <AiAvatar />
            </button>
        </SystemPromptModal>
      ) : (
        <Avatar className="h-8 w-8 border-2 border-primary/50 shrink-0">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
                <User className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col max-w-[85%] sm:max-w-[80%] space-y-1',
          isAi ? 'items-start' : 'items-end'
        )}
      >
        <div
          className={cn(
            'p-3 rounded-lg leading-relaxed shadow-md',
            isAi ? 'bg-secondary rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'
          )}
        >
          {isLoading ? <TypingIndicator /> : (
            <div className="space-y-2 text-sm break-words">
            {typeof message.content === 'string' ? (
                message.content.split('\n').map((line, index) => (
                    <p key={index}>{line || '\u00A0'}</p>
                ))
            ) : (
                message.content
            )}
            </div>
          )}
        </div>
        {message.timestamp && <span className="text-xs text-muted-foreground px-1">{message.timestamp}</span>}
      </div>
    </div>
  );
}
