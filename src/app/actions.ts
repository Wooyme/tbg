'use server';

import { generateAdventureFromPrompt } from '@/ai/flows/generate-adventure-from-prompt';
import type { MessageRaw } from '@/components/chat/chat-types';

function formatMessageHistory(messages: MessageRaw[]): string {
  return messages
    .map(m => {
      const author = m.author === 'user' ? 'Player' : 'GameMaster';
      const content = m.content;
      return `${author}: ${content}`;
    })
    .join('\n');
}

export async function handleUserMessage(
  history: MessageRaw[],
  userInput: string
): Promise<string> {
  try {
    if (userInput.toLowerCase().startsWith('/start')) {
      const prompt = userInput.substring(6).trim();
      if (!prompt) {
        return "You need to describe your adventure! For example: `/start a cyberpunk mystery in Neo-Tokyo`";
      }
      const response = await generateAdventureFromPrompt({ prompt: `Create a text adventure game based on this prompt: ${prompt}` });
      return response.scenario;
    }

    if (history.length < 2) {
        return "Your adventure hasn't started yet. Use the `/start` command to begin. For example: `/start a fantasy quest to find a lost artifact`";
    }

    const adventureLog = formatMessageHistory(history);
    const continuationPrompt = `This is a text adventure game. Continue the story based on the last player action. Be descriptive and engaging. End your response by asking the player what they want to do next.

Story so far:
${adventureLog}

Player's latest action: ${userInput}

What happens next?`;

    const response = await generateAdventureFromPrompt({ prompt: continuationPrompt });
    return response.scenario;

  } catch (error) {
    console.error('Error handling user message:', error);
    return 'An error occurred while processing your request. The virtual world seems unstable. Please try again.';
  }
}
