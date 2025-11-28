'use server';

/**
 * @fileOverview Extracts entities from an adventure log to build a lorebook.
 *
 * - generateLorebookFromHistory - A function that handles the lorebook generation.
 * - GenerateLorebookFromHistoryInput - The input type for the function.
 * - GenerateLorebookFromHistoryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLorebookFromHistoryInputSchema = z.object({
  adventureLog: z
    .string()
    .describe(
      'The history of the adventure, which the AI will analyze to extract lore.'
    ),
});
export type GenerateLorebookFromHistoryInput = z.infer<
  typeof GenerateLorebookFromHistoryInputSchema
>;

const LorebookEntrySchema = z.object({
    keywords: z.array(z.string()).describe('A list of keywords or names for this lore entry (e.g., ["Gandalf", "Mithrandir"]). The first keyword should be the most common name.'),
    details: z.string().describe('A detailed description of the person, place, or thing.'),
});

const GenerateLorebookFromHistoryOutputSchema = z.object({
  lorebook: z.array(LorebookEntrySchema).describe('An array of generated lorebook entries.'),
});

export type GenerateLorebookFromHistoryOutput = z.infer<
  typeof GenerateLorebookFromHistoryOutputSchema
>;

export async function generateLorebookFromHistory(
  input: GenerateLorebookFromHistoryInput
): Promise<GenerateLorebookFromHistoryOutput> {
  return generateLorebookFromHistoryFlow(input);
}

const generateLorebookFromHistoryPrompt = ai.definePrompt({
  name: 'generateLorebookFromHistoryPrompt',
  input: {schema: GenerateLorebookFromHistoryInputSchema},
  output: {schema: GenerateLorebookFromHistoryOutputSchema},
  prompt: `You are a world-building assistant for a text adventure game. Your task is to read an adventure log and extract key entities to create a structured lorebook.

Identify important characters, locations, items, and concepts. For each entity, create a lorebook entry.

- **keywords**: Provide a list of names or keywords associated with the entity. The first keyword should be its most common name.
- **details**: Write a concise but informative description based on the information in the log.

Do not include the player character. Focus only on non-player characters, places, and things.

Adventure Log:
{{{adventureLog}}}`,
});

const generateLorebookFromHistoryFlow = ai.defineFlow(
  {
    name: 'generateLorebookFromHistoryFlow',
    inputSchema: GenerateLorebookFromHistoryInputSchema,
    outputSchema: GenerateLorebookFromHistoryOutputSchema,
  },
  async input => {
    const {output} = await generateLorebookFromHistoryPrompt(input);
    return output!;
  }
);
