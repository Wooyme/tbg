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
} from '@/components/chat/chat-types';

// --- React Context and Provider ---

export interface GameSavesContextType {
  saves: GameSave[];
  messages: MessageDisplay[];
  setMessages: React.Dispatch<React.SetStateAction<MessageDisplay[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  activeGame: string | null;
  saveGame: (name: string) => void;
  loadGame: (name: string) => void;
  deleteGame: (name: string) => void;
  newGame: () => void;
  
  playerSettings: PlayerSettings;
  setPlayerSettings: React.Dispatch<React.SetStateAction<PlayerSettings>>;
  
  backgroundSettings: BackgroundSettings;
  setBackgroundSettings: React.Dispatch<React.SetStateAction<BackgroundSettings>>;

  gameOpeningSettings: GameOpeningSettings;
  setGameOpeningSettings: React.Dispatch<React.SetStateAction<GameOpeningSettings>>;

  systemPrompts: SystemPrompts;
  setSystemPrompts: React.Dispatch<React.SetStateAction<SystemPrompts>>;

  editMessage: (id: string, content: string) => void;
  deleteMessage: (id: string) => void;
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
