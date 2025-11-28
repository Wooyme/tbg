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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useGameSaves } from '@/hooks/use-game-saves';
import { useToast } from '@/hooks/use-toast';
import type {
  SystemPrompts,
  PlayerSettings,
  BackgroundSettings,
  GameOpeningSettings,
  RAGConfig,
} from './chat-types';

type LocalState = {
  model: string;
  systemPrompts: SystemPrompts;
  playerSettings: PlayerSettings;
  backgroundSettings: BackgroundSettings;
  gameOpeningSettings: GameOpeningSettings;
  ragConfig: RAGConfig;
};

export function ChatConfigModifyModal({ children }: { children: ReactNode }) {
  const {
    model,
    setModel,
    systemPrompts,
    setSystemPrompts,
    playerSettings,
    setPlayerSettings,
    backgroundSettings,
    setBackgroundSettings,
    gameOpeningSettings,
    setGameOpeningSettings,
    // Assuming ragConfig will be added to useGameSaves
    // ragConfig, 
    // setRagConfig 
  } = useGameSaves();
  const { toast } = useToast();
  
  // A local state to handle form changes without affecting the global state until save.
  const [localState, setLocalState] = useState<LocalState>({
    model,
    systemPrompts,
    playerSettings,
    backgroundSettings,
    gameOpeningSettings,
    ragConfig: { enabled: false }, // Default RAG config
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  // When the dialog opens, sync the local state with the global context.
  useEffect(() => {
    if (dialogOpen) {
      setLocalState({
        model,
        systemPrompts,
        playerSettings,
        backgroundSettings,
        gameOpeningSettings,
        ragConfig: { enabled: false }, // Replace with global ragConfig when available
      });
    }
  }, [dialogOpen, model, systemPrompts, playerSettings, backgroundSettings, gameOpeningSettings]);

  const handleSave = () => {
    setModel(localState.model);
    setSystemPrompts(localState.systemPrompts);
    setPlayerSettings(localState.playerSettings);
    setBackgroundSettings(localState.backgroundSettings);
    setGameOpeningSettings(localState.gameOpeningSettings);
    // setRagConfig(localState.ragConfig);
    
    setDialogOpen(false);
    toast({
      title: 'Configuration Updated',
      description: 'Your game and AI settings have been saved for this session.',
    });
  };

  const handleInputChange = <T extends keyof LocalState, K extends keyof LocalState[T]>(
    field: T,
    subField: K,
    value: LocalState[T][K]
  ) => {
    setLocalState(prevState => ({
      ...prevState,
      [field]: {
        ...prevState[field],
        [subField]: value,
      },
    }));
  };

  const handleRAGToggle = (enabled: boolean) => {
    setLocalState(prevState => ({
      ...prevState,
      ragConfig: {
        ...prevState.ragConfig,
        enabled,
      }
    }));
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl bg-background">
        <DialogHeader>
          <DialogTitle>Game Configuration</DialogTitle>
          <DialogDescription>
            Modify the core settings for the AI Game Master and the game world.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="ai-settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
            <TabsTrigger value="game-settings">Game Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-settings" className="py-4 space-y-4">
             <div className="grid w-full gap-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select value={localState.model} onValueChange={(value) => setLocalState(prev => ({...prev, model: value}))}>
                    <SelectTrigger id="ai-model">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="googleai/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                        <SelectItem value="googleai/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                        <SelectItem value="googleai/gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        <SelectItem value="googleai/gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="main-prompt">System Prompt</Label>
              <Textarea
                id="main-prompt"
                placeholder="Enter the main system prompt..."
                value={localState.systemPrompts.mainPrompt}
                onChange={(e) => handleInputChange('systemPrompts', 'mainPrompt', e.target.value)}
                className="min-h-[120px] text-sm"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="summarization-prompt">Summarization Prompt</Label>
              <Textarea
                id="summarization-prompt"
                placeholder="Enter the summarization prompt..."
                value={localState.systemPrompts.summarizationPrompt || ''}
                onChange={(e) => handleInputChange('systemPrompts', 'summarizationPrompt', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
             <div className="flex items-center space-x-2">
                <Switch 
                  id="rag-enabled" 
                  checked={localState.ragConfig.enabled}
                  onCheckedChange={handleRAGToggle}
                />
                <Label htmlFor="rag-enabled">Enable RAG</Label>
            </div>
          </TabsContent>

          <TabsContent value="game-settings" className="py-4 space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="player-name">Player Name</Label>
              <Input
                id="player-name"
                value={localState.playerSettings.name}
                onChange={(e) => handleInputChange('playerSettings', 'name', e.target.value)}
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="player-description">Player Description</Label>
              <Textarea
                id="player-description"
                placeholder="Describe your character..."
                value={localState.playerSettings.description || ''}
                onChange={(e) => handleInputChange('playerSettings', 'description', e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="background-description">Background Story</Label>
              <Textarea
                id="background-description"
                placeholder="Describe the world and its backstory..."
                value={localState.backgroundSettings.description}
                onChange={(e) => handleInputChange('backgroundSettings', 'description', e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="opening-crawl">Opening Crawl</Label>
              <Textarea
                id="opening-crawl"
                placeholder="The initial scene or event that starts the adventure..."
                value={localState.gameOpeningSettings.openingCrawl}
                onChange={(e) => handleInputChange('gameOpeningSettings', 'openingCrawl', e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>

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
