'use client';
import {
  createContext,
  useContext,
} from 'react';
import {
  type MessageDisplay,
  type GameSave,
  type SystemPrompts,
  type PlayerSettings,
  type BackgroundSettings,
  type GameOpeningSettings,
  type Lorebook,
} from '@/components/chat/chat-types';

// --- React Context and Provider ---

export interface GameSavesContextType {
  saves: GameSave[];
  messages: MessageDisplay[];
  setMessages: React.Dispatch<React.SetStateAction<MessageDisplay[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  activeGame: GameSave | null;
  saveGame: (name: string) => void;
  loadGame: (name: string) => void;
  deleteGame: (name: string) => void;
  newGame: () => void;
  
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  
  playerSettings: PlayerSettings;
  setPlayerSettings: React.Dispatch<React.SetStateAction<PlayerSettings>>;
  
  backgroundSettings: BackgroundSettings;
  setBackgroundSettings: React.Dispatch<React.SetStateAction<BackgroundSettings>>;

  gameOpeningSettings: GameOpeningSettings;
  setGameOpeningSettings: React.Dispatch<React.SetStateAction<GameOpeningSettings>>;

  systemPrompts: SystemPrompts;
  setSystemPrompts: React.Dispatch<React.SetStateAction<SystemPrompts>>;

  lorebook: Lorebook;
  setLorebook: React.Dispatch<React.SetStateAction<Lorebook>>;

  editMessage: (id: string, content: string) => void;
  deleteMessage: (id: string) => void;

  updateThreadSummary: (threadId: string, title: string, summary: string) => void;
  createNewThread: () => void;
}

export const GameSavesContext = createContext<GameSavesContextType | undefined>(
  undefined
);

export const useGameSaves = () => {
  const context = useContext(GameSavesContext);
  if (context === undefined) {
    throw new Error('useGameSaves must be used within a GameSavesProvider');
  }
  return context;
};
