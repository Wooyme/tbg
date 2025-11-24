// Summarizes the recent events in the player's adventure log.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAdventureLogInputSchema = z.object({
  adventureLog: z
    .string()
    .describe(
      'The recent history of the adventure, which the AI will summarize.'
    ),
});
export type SummarizeAdventureLogInput = z.infer<
  typeof SummarizeAdventureLogInputSchema
>;

const SummarizeAdventureLogOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the recent adventure log events.'),
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
  prompt: `Summarize the following adventure log:

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
