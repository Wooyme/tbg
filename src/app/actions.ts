'use server';

import { generateAdventureFromPrompt } from '@/ai/flows/generate-adventure-from-prompt';
import type { MessageRaw } from '@/components/chat/chat-types';
import { ai } from '@/ai/genkit';
import { GameSave } from '@/components/chat/chat-types';


function formatMessageHistory(messages: MessageRaw[]): string {
  return messages
    .map(m => {
      const author = m.author === 'user' ? 'Player' : 'GameMaster';
      const content = m.content;
      return `${author}: ${content}`;
    })
    .join('\n');
}

export async function getAiInitialResponse(
    gameSave: Omit<GameSave, 'name' | 'lastSaved' | 'version'>
): Promise<string> {
    const { playerSettings, backgroundSettings, gameOpeningSettings } = gameSave;

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

    const response = await generateAdventureFromPrompt({ prompt });
    return response.scenario;
}

export async function getAiContinuation(
  gameSave: Omit<GameSave, 'name' | 'lastSaved' | 'version'>,
  userInput: string
): Promise<string> {
  try {
    const adventureLog = formatMessageHistory(gameSave.messages);

    const continuationPrompt = `${gameSave.systemPrompts.mainPrompt}

The player's character is: ${gameSave.playerSettings.name}, ${gameSave.playerSettings.description || 'no description'}.
The story's background is: ${gameSave.backgroundSettings.description || 'no description'}.
The original opening for the game was: ${gameSave.gameOpeningSettings.openingCrawl || 'no description'}.

Story so far:
${adventureLog}

Player's latest action: ${userInput}

What happens next?`;

    const { output } = await ai.generate({
      prompt: continuationPrompt,
    });
    return output?.text ?? 'The world seems to have fallen silent. Try again.';

  } catch (error) {
    console.error('Error handling user message:', error);
    return 'An error occurred while processing your request. The virtual world seems unstable. Please try again.';
  }
}
