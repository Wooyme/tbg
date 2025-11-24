'use client';

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  type MessageDisplay,
  type MessageRaw,
  type GameSave,
} from '@/components/chat/chat-types';
import { GameSavesContext, GameSavesContextType } from '@/hooks/use-game-saves';
import { useToast } from '@/hooks/use-toast';

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


export function ClientProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  useEffect(() => {
    // Load all save summaries on initial mount
    const saveNames = getSaveIndex();
    const allSaves = saveNames
      .map(name => getSaveFromStorage(name))
      .filter((s): s is GameSave => s !== null);
    setSaves(allSaves);
    setActiveGame('new');
  }, []);

  const saveGame = useCallback((name: string) => {
    if (messages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Empty Game',
        description: 'You can only save an adventure that has started.',
      });
      return;
    }

    // Convert display messages to raw messages for serialization
    const rawMessages: MessageRaw[] = messages.map(m => ({
      ...m,
      content: typeof m.content === 'string' ? m.content : '[complex message]',
    }));

    const newSave: GameSave = {
      version: SAVE_VERSION,
      name,
      lastSaved: new Date().toISOString(),
      messages: rawMessages,
      // The rest of the fields will be populated when those features are built
      playerSettings: { name: 'Player' },
      backgroundSettings: { description: '' },
      gameOpeningSettings: { openingCrawl: '' },
      systemPrompts: { mainPrompt: '' },
      ragConfig: { enabled: false },
    };

    setSaveToStorage(newSave);
    setSaves(prev => {
      const existing = prev.find(s => s.name === name);
      if (existing) {
        return prev.map(s => (s.name === name ? newSave : s));
      }
      return [...prev, newSave];
    });
    setActiveGame(name);
  }, [messages, toast]);

  const loadGame = useCallback((name: string) => {
    const savedGame = getSaveFromStorage(name);
    if (savedGame) {
      // For now, we assume content is always string. This will need to be
      // more robust if we save React nodes in the future.
      const displayMessages: MessageDisplay[] = savedGame.messages.map(m => ({
        ...m,
        content: m.content,
      }));
      setMessages(displayMessages);
      setActiveGame(name);
    } else {
      toast({
        variant: 'destructive',
        title: 'Load Failed',
        description: `Could not find a save file named "${name}".`,
      });
    }
  }, [toast]);

  const deleteGame = useCallback((name: string) => {
    deleteSaveFromStorage(name);
    setSaves(prev => prev.filter(s => s.name !== name));
  }, []);

  const newGame = useCallback(() => {
    setMessages([]); // Will be populated with welcome message by ChatInterface
    setActiveGame('new');
  }, []);

  const value: GameSavesContextType = {
    saves,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    activeGame,
    saveGame,
    loadGame,
    deleteGame,
    newGame,
  };

  return (
    <GameSavesContext.Provider value={value}>
      {children}
    </GameSavesContext.Provider>
  );
}
