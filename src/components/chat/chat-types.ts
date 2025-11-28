import type React from 'react';

export type MessageAuthor = 'user' | 'ai';

// Type for raw message data that is JSON-serializable
export type MessageRaw = {
  id: string;
  author: MessageAuthor;
  content: string; // Plain string content
  timestamp: string;
  lore?: LorebookEntry[];
};

// Type for messages that will be displayed in the UI, now same as MessageRaw
export type MessageDisplay = MessageRaw;

export type StoryThread = {
  id: string;
  title: string;
  summary: string;
  messages: MessageRaw[];
};

export type LorebookEntry = {
    id: string;
    keywords: string[];
    details: string;
};

export type Lorebook = LorebookEntry[];


// --- Game Save State Types ---

export type PlayerSettings = {
  name: string;
  description: string;
};

export type BackgroundSettings = {
  description: string;
};

export type GameOpeningSettings = {
  openingCrawl: string;
};

export type SystemPrompts = {
  mainPrompt: string;
  summarizationPrompt?: string;
};

export type RAGConfig = {
  enabled: boolean;
  knowledgeBaseId?: string;
};

export type GameSave = {
  version: string;
  name: string;
  lastSaved: string;
  model: string;
  playerSettings: PlayerSettings;
  backgroundSettings: BackgroundSettings;
  gameOpeningSettings: GameOpeningSettings;
  systemPrompts: SystemPrompts;
  ragConfig: RAGConfig;
  storyThreads: StoryThread[];
  activeStoryThreadId: string;
  lorebook: Lorebook;
};
