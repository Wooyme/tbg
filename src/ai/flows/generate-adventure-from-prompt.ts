'use server';

/**
 * @fileOverview Generates a text adventure game scenario from a user prompt.
 *
 * - generateAdventureFromPrompt - A function that generates a text adventure scenario.
 * - GenerateAdventureFromPromptInput - The input type for the generateAdventureFromPrompt function.
 * - GenerateAdventureFromPromptOutput - The return type for the generateAdventureFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdventureFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A text prompt describing the kind of story the user wants to play.'
    ),
});
export type GenerateAdventureFromPromptInput = z.infer<
  typeof GenerateAdventureFromPromptInputSchema
>;

const GenerateAdventureFromPromptOutputSchema = z.object({
  scenario: z
    .string()
    .describe(
      'A detailed text adventure game scenario, including initial settings, characters, and plot hooks.'
    ),
});
export type GenerateAdventureFromPromptOutput = z.infer<
  typeof GenerateAdventureFromPromptOutputSchema
>;

export async function generateAdventureFromPrompt(
  input: GenerateAdventureFromPromptInput
): Promise<GenerateAdventureFromPromptOutput> {
  return generateAdventureFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdventureFromPromptPrompt',
  input: {schema: GenerateAdventureFromPromptInputSchema},
  output: {schema: GenerateAdventureFromPromptOutputSchema},
  prompt: `You are a text adventure game generator. The user will provide you with a prompt describing the kind of story they want to play.  Your job is to generate a detailed game scenario, including initial settings, characters, and plot hooks, that will be used as the foundation for the game.

User Prompt: {{{prompt}}}

Scenario: `,
});

const generateAdventureFromPromptFlow = ai.defineFlow(
  {
    name: 'generateAdventureFromPromptFlow',
    inputSchema: GenerateAdventureFromPromptInputSchema,
    outputSchema: GenerateAdventureFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
