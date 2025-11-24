import type React from 'react';

export type Message = {
  id: string;
  author: 'user' | 'ai';
  content: React.ReactNode;
  timestamp: string;
};
