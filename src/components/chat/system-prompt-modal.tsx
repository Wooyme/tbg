
'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGameSaves } from '@/hooks/use-game-saves';
import { useToast } from '@/hooks/use-toast';
import type { SystemPrompts } from './chat-types';

export function SystemPromptModal({ children }: { children: ReactNode }) {
  const { systemPrompts, setSystemPrompts } = useGameSaves();
  const { toast } = useToast();
  const [localPrompts, setLocalPrompts] = useState<SystemPrompts>(systemPrompts);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (dialogOpen) {
      setLocalPrompts(systemPrompts);
    }
  }, [dialogOpen, systemPrompts]);

  const handleSave = () => {
    setSystemPrompts(localPrompts);
    setDialogOpen(false);
    toast({
      title: 'System Prompts Updated',
      description: 'The AI behavior has been updated for this session.',
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-xl bg-background">
        <DialogHeader>
          <DialogTitle>Adjust System Prompts</DialogTitle>
          <DialogDescription>
            Modify the core instructions that guide the AI Game Master. Changes
            will affect the current game session and will be saved with the game.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="main-prompt">Main Game Prompt</Label>
            <Textarea
              id="main-prompt"
              placeholder="Enter the main system prompt..."
              value={localPrompts.mainPrompt}
              onChange={(e) =>
                setLocalPrompts((p) => ({ ...p, mainPrompt: e.target.value }))
              }
              className="min-h-[150px] text-sm"
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="summarization-prompt">Summarization Prompt</Label>
            <Textarea
              id="summarization-prompt"
              placeholder="Enter the summarization prompt..."
              value={localPrompts.summarizationPrompt || ''}
              onChange={(e) =>
                setLocalPrompts((p) => ({
                  ...p,
                  summarizationPrompt: e.target.value,
                }))
              }
              className="min-h-[80px] text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
