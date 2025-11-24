'use server';

/**
 * @fileOverview Summarizes an adventure log and generates a title for it.
 *
 * - summarizeAdventureLog - A function that handles the summarization.
 * - SummarizeAdventureLogInput - The input type for the function.
 * - SummarizeAdventureLogOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAdventureLogInputSchema = z.object({
  adventureLog: z
    .string()
    .describe(
      'The history of the adventure, which the AI will summarize.'
    ),
});
export type SummarizeAdventureLogInput = z.infer<
  typeof SummarizeAdventureLogInputSchema
>;

const SummarizeAdventureLogOutputSchema = z.object({
  title: z
    .string()
    .describe('A short, catchy title for the adventure log.'),
  summary: z
    .string()
    .describe('A concise summary of the adventure log events.'),
});
export type SummarizeAdventureLogOutput = z.infer<
  typeof SummarizeAdventureLogOutputSchema
>;

export async function summarizeAdventureLog(
  input: SummarizeAdventureLogInput
): Promise<SummarizeAdventureLogOutput> {
  return summarizeAdventureLogFlow(input);
}

const summarizeAdventureLogPrompt = ai.definePrompt({
  name: 'summarizeAdventureLogPrompt',
  input: {schema: SummarizeAdventureLogInputSchema},
  output: {schema: SummarizeAdventureLogOutputSchema},
  prompt: `You are a story editor. Your job is to read a text adventure game's event log and create a short, catchy title and a concise summary.

Adventure Log:
{{{adventureLog}}}`,
});

const summarizeAdventureLogFlow = ai.defineFlow(
  {
    name: 'summarizeAdventureLogFlow',
    inputSchema: SummarizeAdventureLogInputSchema,
    outputSchema: SummarizeAdventureLogOutputSchema,
  },
  async input => {
    const {output} = await summarizeAdventureLogPrompt(input);
    return output!;
  }
);
