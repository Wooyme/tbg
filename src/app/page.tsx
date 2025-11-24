import { ChatInterface } from "@/components/chat/chat-interface";
import { Logo } from "@/components/icons";

export default function Home() {
  return (
    <div className="flex flex-col h-[100dvh] bg-background max-w-2xl mx-auto border-x">
      <header className="flex items-center justify-between p-4 border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground font-headline">
            EchoVerse
          </h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
