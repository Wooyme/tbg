'use server';

import { generateAdventureFromPrompt } from '@/ai/flows/generate-adventure-from-prompt';
import type { StoryThread } from '@/components/chat/chat-types';
import { ai } from '@/ai/genkit';
import { GameSave } from '@/components/chat/chat-types';
import { formatMessageHistory, formatLorebook } from '@/lib/chat-utils';


export async function getAiInitialResponse(
    gameSave: Omit<GameSave, 'name' | 'lastSaved' | 'version' | 'storyThreads' | 'activeStoryThreadId' | 'lorebook'>
): Promise<string> {
    const { playerSettings, backgroundSettings, gameOpeningSettings, systemPrompts } = gameSave;

    const { scenario } = await generateAdventureFromPrompt({
        prompt: gameOpeningSettings.openingCrawl,
        player: playerSettings.description,
        background: backgroundSettings.description,
        systemPrompt: systemPrompts.mainPrompt,
    });
    
    return scenario;
}

export async function getAiContinuation(
  gameSave: Omit<GameSave, 'name' | 'lastSaved' | 'version' | 'storyThreads' | 'activeStoryThreadId'> & { activeStoryThread: StoryThread }
): Promise<string> {
  try {
    const adventureLog = formatMessageHistory(gameSave.activeStoryThread.messages);
    const lorebookContent = formatLorebook(gameSave.lorebook);

    const continuationPrompt = `${gameSave.systemPrompts.mainPrompt}

The player's character is: ${gameSave.playerSettings.name}, ${gameSave.playerSettings.description || 'no description'}.
The story's background is: ${gameSave.backgroundSettings.description || 'no description'}.
The original opening for the game was: ${gameSave.gameOpeningSettings.openingCrawl || 'no description'}.

Consider the following lore to maintain consistency:
--- LOREBOOK ---
${lorebookContent}
--- END LOREBOOK ---

Story so far:
${adventureLog}

What happens next?`;

    const { output } = await ai.generate({
      model: gameSave.model,
      prompt: continuationPrompt,
    });
    return output?.text ?? 'The world seems to have fallen silent. Try again.';

  } catch (error) {
    console.error('Error handling user message:', error);
    return 'An error occurred while processing your request. The virtual world seems to be unstable. Please try again.';
  }
}
