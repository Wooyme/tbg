import type React from 'react';

export type MessageAuthor = 'user' | 'ai';

// Type for raw message data that is JSON-serializable
export type MessageRaw = {
  id: string;
  author: MessageAuthor;
  content: string; // Plain string content
  timestamp: string;
};

// Type for messages that will be displayed in the UI
export type MessageDisplay = {
  id: string;
  author: MessageAuthor;
  content: React.ReactNode; // Can be a string or a React component
  timestamp: string;
};
