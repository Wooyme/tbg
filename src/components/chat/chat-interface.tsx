'use client';

import { useState, useEffect } from 'react';
import type { MessageDisplay, MessageRaw } from './chat-types';
import { ChatList } from './chat-list';
import { ChatInput } from './chat-input';
import { getAiInitialResponse, getAiContinuation } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { useGameSaves } from '@/hooks/use-game-saves';

const welcomeMessage: Omit<MessageDisplay, 'timestamp' | 'id'> = {
  author: 'ai' as const,
  content: (
    <div className="space-y-2">
      <p className="font-bold text-lg">Welcome to EchoVerse!</p>
      <p>
        This is an AI-powered text adventure. To begin your journey, use the{' '}
        <code className="bg-muted text-primary-foreground px-1 py-0.5 rounded-sm font-mono text-sm">
          /start
        </code>{' '}
        command.
      </p>
      <p className="mt-2 text-muted-foreground">
        For example:{' '}
        <code className="bg-muted text-primary-foreground px-1 py-0.5 rounded-sm font-mono text-sm">
          /start a space opera on a derelict starship
        </code>
      </p>
    </div>
  ),
};

const getInitialMessage = (): MessageDisplay => ({
  ...welcomeMessage,
  id: 'init',
  timestamp: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
});


export function ChatInterface() {
  const { 
    messages, 
    setMessages, 
    isLoading, 
    setIsLoading,
    activeGame,
    editMessage,
    deleteMessage,
    playerSettings,
    setPlayerSettings,
    backgroundSettings,
    setBackgroundSettings,
    gameOpeningSettings,
    setGameOpeningSettings,
    systemPrompts,
  } = useGameSaves();
  const { toast } = useToast();

  useEffect(() => {
    if (activeGame === 'new' && messages.length === 0) {
        setMessages([getInitialMessage()]);
    }
  }, [activeGame, setMessages, messages.length]);
  
  const addSystemMessage = (content: string) => {
    const sysMessage: MessageDisplay = {
      id: `sys-${Date.now()}`,
      author: 'ai',
      content: <div className="text-accent italic">{content}</div>,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, sysMessage]);
  }

  const handleCommand = async (input: string) => {
    const [command, ...args] = input.trim().split(' ');
    const restOfInput = args.join(' ');
    
    if (command.toLowerCase() === '/start') {
        if (!restOfInput) {
            addSystemMessage("You need to describe your adventure! For example: `/start a cyberpunk mystery in Neo-Tokyo`");
            return;
        }
        setIsLoading(true);
        const currentOpeningSettings = { openingCrawl: restOfInput };
        setGameOpeningSettings(currentOpeningSettings);
        addSystemMessage(`Starting new adventure: ${restOfInput}`);
        
        const gameSaveForAction = {
            messages: [], // Start with no history
            playerSettings,
            backgroundSettings,
            gameOpeningSettings: currentOpeningSettings,
            systemPrompts,
            ragConfig: { enabled: false }
        };

        try {
          const aiResponseContent = await getAiInitialResponse(gameSaveForAction);
           const aiMessage: MessageDisplay = {
            id: `ai-${Date.now()}`,
            author: 'ai',
            content: aiResponseContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          // Clear initial/system messages and add the first AI response
          setMessages([aiMessage]); 
        } catch (error) {
           console.error(error);
           addSystemMessage("There was an error starting the adventure. Please try again.");
        } finally {
            setIsLoading(false);
        }
    } else if (command.toLowerCase() === '/player_config') {
        setPlayerSettings(prev => ({...prev, description: restOfInput}));
        addSystemMessage(`Player settings updated: ${restOfInput}`);
    } else if (command.toLowerCase() === '/background_config') {
        setBackgroundSettings({ description: restOfInput });
        addSystemMessage(`Background settings updated: ${restOfInput}`);
    } else {
      // Not a valid command, treat as regular message
      await sendRegularMessage(input);
    }
  }


  const sendRegularMessage = async (input: string) => {
      if (messages.length < 1 || messages[0].id === 'init') {
        addSystemMessage("Your adventure hasn't started yet. Use the `/start` command to begin.");
        return;
      }
      
      const userMessage: MessageDisplay = {
        id: `user-${Date.now()}`,
        author: 'user',
        content: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
  
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);
  
      const historyForAction: MessageRaw[] = newMessages.map(m => ({
          ...m,
          content: typeof m.content === 'string' ? m.content : '[system message]',
      }));

      const gameSaveForAction = {
        messages: historyForAction,
        playerSettings,
        backgroundSettings,
        gameOpeningSettings,
        systemPrompts,
        ragConfig: { enabled: false }
      };
  
      try {
        const aiResponseContent = await getAiContinuation(gameSaveForAction, input);
        const aiMessage: MessageDisplay = {
          id: `ai-${Date.now()}`,
          author: 'ai',
          content: aiResponseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with the AI. Please try again.",
          });
          setMessages(prev => prev.slice(0, prev.length -1)); 
      } finally {
          setIsLoading(false);
      }
  };

  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    if (input.startsWith('/')) {
      handleCommand(input);
    } else {
      await sendRegularMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatList messages={messages} isLoading={isLoading} onEditMessage={editMessage} onDeleteMessage={deleteMessage} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}
