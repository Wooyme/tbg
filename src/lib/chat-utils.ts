import type { MessageRaw, LorebookEntry } from '@/components/chat/chat-types';

export function formatMessage(message: MessageRaw): string {
    const author = message.author === 'user' ? 'Player' : 'GameMaster';
    let formattedContent = `${author}: ${message.content}`;

    if (message.lore && message.lore.length > 0) {
        const loreDetails = message.lore
            .map(entry => `- ${entry.keywords.join(', ')}: ${entry.details}`)
            .join('\n');
        // Indent for readability in the prompt
        const indentedLore = loreDetails.split('\n').map(line => `    ${line}`).join('\n');
        formattedContent += `\n[The player recalled the following lore]:\n${indentedLore}`;
    }

    return formattedContent;
}


export function formatMessageHistory(messages: MessageRaw[]): string {
  return messages.map(formatMessage).join('\n');
}

export function formatLorebook(lorebook: LorebookEntry[]): string {
    if (!lorebook || lorebook.length === 0) {
        return "No lorebook entries yet.";
    }
    return lorebook.map(entry => {
        return `Keywords: ${entry.keywords.join(", ")}\nDetails: ${entry.details}`;
    }).join("\n\n");
}
