'use server';

import { generateAdventureFromPrompt } from '@/ai/flows/generate-adventure-from-prompt';
import type { StoryThread } from '@/components/chat/chat-types';
import { ai } from '@/ai/genkit';
import { GameSave } from '@/components/chat/chat-types';
import { formatMessageHistory, formatLorebook } from '@/lib/chat-utils';


export async function getAiInitialResponse(
    gameSave: Omit<GameSave, 'name' | 'lastSaved' | 'version' | 'storyThreads' | 'activeStoryThreadId' | 'lorebook'>
): Promise<string> {
    const { playerSettings, backgroundSettings, gameOpeningSettings, model } = gameSave;

    let prompt = `Create a text adventure game.`;
    if (gameOpeningSettings.openingCrawl) {
        prompt += ` The user wants this kind of story: ${gameOpeningSettings.openingCrawl}.`;
    }
    if (playerSettings.description) {
        prompt += ` The player's character is: ${playerSettings.description}.`;
    }
    if (backgroundSettings.description) {
        prompt += ` The story's background is: ${backgroundSettings.description}.`;
    }

    const { output } = await ai.generate({
        model: model,
        prompt: prompt,
    });
    const scenario = output?.text ?? 'The world is silent. No adventure awaits.';

    return scenario;
}

export async function getAiContinuation(
  gameSave: Omit<GameSave, 'name' | 'lastSaved' | 'version' | 'storyThreads' | 'activeStoryThreadId'> & { activeStoryThread: StoryThread }
): Promise<string> {
  try {
    const adventureLog = await formatMessageHistory(gameSave.activeStoryThread.messages);
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
