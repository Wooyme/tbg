import { config } from 'dotenv';
config();

import '@/ai/flows/generate-adventure-from-prompt.ts';
import '@/ai/flows/summarize-adventure-log.ts';
import '@/ai/flows/generate-lorebook-from-history.ts';
