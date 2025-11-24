'use client';
import { User, Bot, Pencil, Trash2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageDisplay } from './chat-types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatConfigModifyModal } from './chat-config-modify-modal';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';

interface ChatMessageProps {
  message: MessageDisplay;
  isLoading?: boolean;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
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

export function ChatMessage({ message, isLoading = false, onEdit, onDelete }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(typeof message.content === 'string' ? message.content : '');
  const isAi = message.author === 'ai';
  const canEdit = !isLoading && message.id !== 'init' && typeof message.content === 'string';

  const handleSave = () => {
    if (onEdit) {
      onEdit(message.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(typeof message.content === 'string' ? message.content : '');
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  const AiAvatar = () => (
    <Avatar className="h-8 w-8 border-2 border-primary/50 shrink-0">
      <AvatarFallback className="bg-primary text-primary-foreground">
        <Bot className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className={cn('flex items-start gap-3 group', !isAi && 'flex-row-reverse')}>
      {isAi ? (
        <ChatConfigModifyModal>
            <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <AiAvatar />
            </button>
        </ChatConfigModifyModal>
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
          {isLoading ? (
            <TypingIndicator />
          ) : isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="text-sm bg-background/50"
              />
            </div>
          ) : (
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
        
        {canEdit && (
          <div className="flex items-center gap-1.5 pt-1">
            {isEditing ? (
              <>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={handleSave} aria-label="Save changes">
                  <Save className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={handleCancel} aria-label="Cancel editing">
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)} aria-label="Edit message">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={handleDelete} aria-label="Delete message">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}

        {message.timestamp && !isEditing && <span className="text-xs text-muted-foreground px-1">{message.timestamp}</span>}
      </div>
    </div>
  );
}
