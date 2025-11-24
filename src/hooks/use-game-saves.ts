'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  type MessageDisplay,
  type MessageRaw,
  type GameSave,
  type SystemPrompts,
} from '@/components/chat/chat-types';
import { useToast } from './use-toast';

const SAVE_GAME_KEY_PREFIX = 'text-adventure-save-';
const SAVE_INDEX_KEY = 'text-adventure-save-index';
const SAVE_VERSION = '1.0';

// --- Helper Functions for localStorage ---

const getSaveIndex = (): string[] => {
  try {
    const indexJson = localStorage.getItem(SAVE_INDEX_KEY);
    return indexJson ? JSON.parse(indexJson) : [];
  } catch (error) {
    console.error('Error reading save index from localStorage:', error);
    return [];
  }
};

const setSaveIndex = (index: string[]) => {
  try {
    localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.error('Error writing save index to localStorage:', error);
  }
};

const getSaveFromStorage = (name: string): GameSave | null => {
  try {
    const saveJson = localStorage.getItem(`${SAVE_GAME_KEY_PREFIX}${name}`);
    return saveJson ? JSON.parse(saveJson) : null;
  } catch (error) {
    console.error(`Error reading save "${name}" from localStorage:`, error);
    return null;
  }
};

const setSaveToStorage = (save: GameSave) => {
  try {
    localStorage.setItem(`${SAVE_GAME_KEY_PREFIX}${save.name}`, JSON.stringify(save));
    const index = getSaveIndex();
    if (!index.includes(save.name)) {
      setSaveIndex([...index, save.name]);
    }
  } catch (error) {
    console.error(`Error writing save "${save.name}" to localStorage:`, error);
  }
};

const deleteSaveFromStorage = (name: string) => {
  try {
    localStorage.removeItem(`${SAVE_GAME_KEY_PREFIX}${name}`);
    const index = getSaveIndex();
    setSaveIndex(index.filter(n => n !== name));
  } catch (error) {
    console.error(`Error deleting save "${name}" from localStorage:`, error);
  }
};


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

// The provider component is defined and used in src/app/layout.tsx
// to avoid including JSX in a .ts file.
