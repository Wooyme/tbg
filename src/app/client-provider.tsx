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
  type SystemPrompts,
  type PlayerSettings,
  type BackgroundSettings,
  type GameOpeningSettings,
  type StoryThread,
  type Lorebook,
  type LorebookEntry,
} from '@/components/chat/chat-types';
import { GameSavesContext, GameSavesContextType } from '@/hooks/use-game-saves';
import { useToast } from '@/hooks/use-toast';

const SAVE_GAME_KEY_PREFIX = 'text-adventure-save-';
const SAVE_INDEX_KEY = 'text-adventure-save-index';
const SAVE_VERSION = '1.3'; // Bump version for lorebook

const DEFAULT_MODEL = 'googleai/gemini-2.5-flash';

const DEFAULT_SYSTEM_PROMPTS: SystemPrompts = {
    mainPrompt: "This is a text adventure game. Continue the story based on the last player action. Be descriptive and engaging. End your response by asking the player what they want to do next.",
    summarizationPrompt: "Summarize the following adventure log concisely, creating a short title for it as well."
}

const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
    name: 'Player',
    description: '',
};

const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
    description: '',
};

const DEFAULT_GAME_OPENING_SETTINGS: GameOpeningSettings = {
    openingCrawl: '',
};

const DEFAULT_LOREBOOK: Lorebook = [];

const createNewGameSave = (name: string): GameSave => {
  const initialThread: StoryThread = {
    id: `thread-${Date.now()}`,
    title: 'Main Story',
    summary: 'The adventure begins...',
    messages: [],
  };
  return {
    version: SAVE_VERSION,
    name,
    lastSaved: new Date().toISOString(),
    model: DEFAULT_MODEL,
    playerSettings: DEFAULT_PLAYER_SETTINGS,
    backgroundSettings: DEFAULT_BACKGROUND_SETTINGS,
    gameOpeningSettings: DEFAULT_GAME_OPENING_SETTINGS,
    systemPrompts: DEFAULT_SYSTEM_PROMPTS,
    ragConfig: { enabled: false },
    storyThreads: [initialThread],
    activeStoryThreadId: initialThread.id,
    lorebook: DEFAULT_LOREBOOK,
  };
};


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
    if (!saveJson) return null;
    const save = JSON.parse(saveJson);
    
    // Migration for old save formats
    if (!save.version || save.version < SAVE_VERSION) {
        const migratedSave = {
            ...createNewGameSave(save.name),
            ...save,
            version: SAVE_VERSION,
            model: save.model || DEFAULT_MODEL,
            lorebook: save.lorebook || DEFAULT_LOREBOOK,
        };

        if (!migratedSave.storyThreads) {
            const newThreadId = `thread-${Date.now()}`;
            migratedSave.storyThreads = [{
                id: newThreadId,
                title: 'Imported Story',
                summary: 'An old adventure continued.',
                messages: save.messages || [],
            }];
            migratedSave.activeStoryThreadId = newThreadId;
            delete (migratedSave as any).messages; // clean up old property
        }
        
        setSaveToStorage(migratedSave);
        return migratedSave;
    }
    
    return save;
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
  const [activeGame, setActiveGame] = useState<GameSave | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Derived state from activeGame
  const messages = activeGame?.storyThreads.find(t => t.id === activeGame.activeStoryThreadId)?.messages || [];
  
  const setMessages = (updater: React.SetStateAction<MessageDisplay[]>) => {
    setActiveGame(prev => {
        if (!prev) return null;
        const currentMessages = prev.storyThreads.find(t => t.id === prev.activeStoryThreadId)?.messages || [];
        const newMessages = typeof updater === 'function' ? updater(currentMessages) : updater;
        
        const newStoryThreads = prev.storyThreads.map(thread => {
            if (thread.id === prev.activeStoryThreadId) {
                return { ...thread, messages: newMessages };
            }
            return thread;
        });
        return { ...prev, storyThreads: newStoryThreads };
    });
  };
  

  useEffect(() => {
    // Load all save summaries on initial mount
    const saveNames = getSaveIndex();
    const allSaves = saveNames
      .map(name => getSaveFromStorage(name))
      .filter((s): s is GameSave => s !== null);
    setSaves(allSaves);
    
    // Start with a new, unsaved game state
    setActiveGame(createNewGameSave('new'));
  }, []);

  const newGame = useCallback(() => {
    setActiveGame(createNewGameSave('new'));
  }, []);

  const saveGame = useCallback((name: string) => {
    if (!activeGame) return;

    const activeThread = activeGame.storyThreads.find(t => t.id === activeGame.activeStoryThreadId);
    if (!activeThread || activeThread.messages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Empty Game',
        description: 'You can only save an adventure that has started.',
      });
      return;
    }

    const newSave: GameSave = {
      ...activeGame,
      name,
      lastSaved: new Date().toISOString(),
    };

    setSaveToStorage(newSave);
    setActiveGame(newSave); // Update active game to reflect new name
    setSaves(prev => {
      const existing = prev.find(s => s.name === name);
      if (existing) {
        return prev.map(s => (s.name === name ? newSave : s));
      }
      return [...prev, newSave];
    });
  }, [activeGame, toast]);

  const loadGame = useCallback((name: string) => {
    const savedGame = getSaveFromStorage(name);
    if (savedGame) {
      setActiveGame(savedGame);
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
    if (activeGame?.name === name) {
        newGame(); // If deleting active game, start a new one
    }
  }, [activeGame?.name, newGame]);

  const editMessage = useCallback((id: string, newContent: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, content: newContent } : m))
    );
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  // Functions to update settings directly on the active game state
  const setModel = (updater: React.SetStateAction<string>) => {
    setActiveGame(prev => {
      if (!prev) return null;
      const newModel = typeof updater === 'function' ? updater(prev.model) : updater;
      return {...prev, model: newModel};
    });
  };

  const setPlayerSettings = (updater: React.SetStateAction<PlayerSettings>) => {
    setActiveGame(prev => {
      if (!prev) return null;
      const newSettings = typeof updater === 'function' ? updater(prev.playerSettings) : updater;
      return {...prev, playerSettings: newSettings};
    });
  };
  const setBackgroundSettings = (updater: React.SetStateAction<BackgroundSettings>) => {
     setActiveGame(prev => {
      if (!prev) return null;
      const newSettings = typeof updater === 'function' ? updater(prev.backgroundSettings) : updater;
      return {...prev, backgroundSettings: newSettings};
    });
  };
  const setGameOpeningSettings = (updater: React.SetStateAction<GameOpeningSettings>) => {
     setActiveGame(prev => {
      if (!prev) return null;
      const newSettings = typeof updater === 'function' ? updater(prev.gameOpeningSettings) : updater;
      return {...prev, gameOpeningSettings: newSettings};
    });
  };
  const setSystemPrompts = (updater: React.SetStateAction<SystemPrompts>) => {
     setActiveGame(prev => {
      if (!prev) return null;
      const newSettings = typeof updater === 'function' ? updater(prev.systemPrompts) : updater;
      return {...prev, systemPrompts: newSettings};
    });
  };

  const setLorebook = (updater: React.SetStateAction<Lorebook>) => {
    setActiveGame(prev => {
      if (!prev) return null;
      const newLorebook = typeof updater === 'function' ? updater(prev.lorebook) : updater;
      return { ...prev, lorebook: newLorebook };
    });
  };

  const updateThreadSummary = (threadId: string, title: string, summary: string) => {
    setActiveGame(prev => {
        if (!prev) return null;
        const newStoryThreads = prev.storyThreads.map(thread => {
            if (thread.id === threadId) {
                return { ...thread, title, summary };
            }
            return thread;
        });
        return { ...prev, storyThreads: newStoryThreads };
    });
  };

  const createNewThread = () => {
    setActiveGame(prev => {
        if (!prev) return null;
        const newThread: StoryThread = {
            id: `thread-${Date.now()}`,
            title: 'New Story Branch',
            summary: 'The adventure continues...',
            messages: [],
        };
        return {
            ...prev,
            storyThreads: [...prev.storyThreads, newThread],
            activeStoryThreadId: newThread.id,
        };
    });
  };


  const value: GameSavesContextType = {
    saves,
    messages: messages,
    setMessages,
    isLoading,
    setIsLoading,
    activeGame: activeGame,
    saveGame,
    loadGame,
    deleteGame,
    newGame,
    model: activeGame?.model || DEFAULT_MODEL,
    setModel,
    playerSettings: activeGame?.playerSettings || DEFAULT_PLAYER_SETTINGS,
    setPlayerSettings,
    backgroundSettings: activeGame?.backgroundSettings || DEFAULT_BACKGROUND_SETTINGS,
    setBackgroundSettings,
    gameOpeningSettings: activeGame?.gameOpeningSettings || DEFAULT_GAME_OPENING_SETTINGS,
    setGameOpeningSettings,
    systemPrompts: activeGame?.systemPrompts || DEFAULT_SYSTEM_PROMPTS,
    setSystemPrompts,
    lorebook: activeGame?.lorebook || DEFAULT_LOREBOOK,
    setLorebook,
    editMessage,
    deleteMessage,
    updateThreadSummary,
    createNewThread,
  };

  return (
    <GameSavesContext.Provider value={value}>
      {children}
    </GameSavesContext.Provider>
  );
}

    