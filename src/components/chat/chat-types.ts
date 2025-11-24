import type React from 'react';

export type MessageAuthor = 'user' | 'ai';

// Type for raw message data that is JSON-serializable
export type MessageRaw = {
  id: string;
  author: MessageAuthor;
  content: string; // Plain string content
  timestamp: string;
};

// Type for messages that will be displayed in the UI
export type MessageDisplay = {
  id: string;
  author: MessageAuthor;
  content: React.ReactNode; // Can be a string or a React component
  timestamp: string;
};

// --- Game Save State Types ---

export type PlayerSettings = {
  name: string;
  characterClass?: string;
};

export type BackgroundSettings = {
  genre: string;
  setting: string;
  plotHook: string;
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
  playerSettings: PlayerSettings;
  backgroundSettings: BackgroundSettings;
  gameOpeningSettings: GameOpeningSettings;
  systemPrompts: SystemPrompts;
  ragConfig: RAGConfig;
  messages: MessageRaw[];
};
