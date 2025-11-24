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

interface GameSavesContextType {
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
}

const GameSavesContext = createContext<GameSavesContextType | undefined>(
  undefined
);

export const GameSavesProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>('new');
  const { toast } = useToast();

  useEffect(() => {
    refreshSaves();
  }, []);

  const refreshSaves = () => {
    try {
      const index = getSaveIndex();
      const loadedSaves = index.map(name => getSaveFromStorage(name)).filter(Boolean) as GameSave[];
      loadedSaves.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime());
      setSaves(loadedSaves);
    } catch (error) {
      console.error("Failed to refresh saves from localStorage", error);
      toast({
        variant: "destructive",
        title: "Error loading saves",
        description: "Could not retrieve save files from your browser's storage."
      })
    }
  };

  const saveGame = useCallback((name: string) => {
    const rawMessages: MessageRaw[] = messages.map(m => ({
        id: m.id,
        author: m.author,
        timestamp: m.timestamp,
        content: typeof m.content === 'string' ? m.content : '[system message]',
    }));

    const newSave: GameSave = {
      version: SAVE_VERSION,
      name,
      lastSaved: new Date().toISOString(),
      messages: rawMessages,
      // Default empty values for other settings
      playerSettings: { name: "Player" },
      backgroundSettings: { genre: "", setting: "", plotHook: "" },
      gameOpeningSettings: { openingCrawl: "" },
      systemPrompts: { mainPrompt: "" },
      ragConfig: { enabled: false },
    };

    setSaveToStorage(newSave);
    setActiveGame(name);
    refreshSaves();
  }, [messages]);

  const loadGame = useCallback((name: string) => {
    const loadedSave = getSaveFromStorage(name);
    if (loadedSave) {
      const displayMessages: MessageDisplay[] = loadedSave.messages.map(m => ({
          ...m,
          // For now, we assume all content is string. 
          // A more robust system might parse different content types.
          content: m.content, 
      }));
      setMessages(displayMessages);
      setActiveGame(name);
    } else {
        toast({
            variant: "destructive",
            title: "Load Failed",
            description: `Could not find or parse the save file named "${name}".`
        })
    }
  }, [toast]);

  const deleteGame = useCallback((name: string) => {
    deleteSaveFromStorage(name);
    refreshSaves();
  }, []);

  const newGame = useCallback(() => {
    setActiveGame('new');
    setMessages([]);
  }, []);

  const value = {
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
};

export const useGameSaves = () => {
  const context = useContext(GameSavesContext);
  if (context === undefined) {
    throw new Error('useGameSaves must be used within a GameSavesProvider');
  }
  return context;
};
