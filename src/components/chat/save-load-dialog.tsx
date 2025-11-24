"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameSaves } from "@/hooks/use-game-saves";
import { Save, Trash2, Upload, FilePlus, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SaveLoadDialog() {
  const { saves, saveGame, loadGame, deleteGame, newGame } = useGameSaves();
  const [saveName, setSaveName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
  const [alertDetails, setAlertDetails] = useState({ title: "", description: "" });
  const { toast } = useToast();

  const handleSave = () => {
    if (!saveName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Please enter a name for your save file.",
      });
      return;
    }
    saveGame(saveName);
    setSaveName("");
    toast({
      title: "Game Saved",
      description: `Your progress has been saved as "${saveName}".`,
    });
  };

  const handleLoad = (name: string) => {
    loadGame(name);
    setDialogOpen(false);
    toast({
      title: "Game Loaded",
      description: `Your game "${name}" has been loaded.`,
    });
  };

  const handleDelete = (name: string) => {
    setAlertDetails({
        title: "Are you sure?",
        description: `This will permanently delete the save file "${name}". This action cannot be undone.`
    });
    setActionToConfirm(() => () => {
        deleteGame(name)
        toast({
            title: "Save Deleted",
            description: `The save file "${name}" has been deleted.`,
        });
    });
    setAlertOpen(true);
  };
  
  const handleNewGame = () => {
    setAlertDetails({
        title: "Start a new game?",
        description: "This will erase your current unsaved progress. Are you sure you want to start a new adventure?"
    });
    setActionToConfirm(() => () => {
        newGame();
        setDialogOpen(false);
        toast({
            title: "New Game Started",
            description: "A new adventure awaits!",
        });
    });
    setAlertOpen(true);
  };


  return (
    <>
      <Button onClick={handleNewGame} variant="outline">
        <FilePlus className="mr-2" /> New Game
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <FolderOpen className="mr-2" /> Manage Saves
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg bg-background">
          <DialogHeader>
            <DialogTitle>Save & Load Game</DialogTitle>
            <DialogDescription>
              Manage your saved adventures. You can save your current progress or load a previous one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                id="name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter save name..."
                className="col-span-3"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <Button onClick={handleSave} aria-label="Save current game">
                <Save className="h-5 w-5" />
              </Button>
            </div>
            
            <h3 className="text-lg font-semibold mt-4">Saved Games</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-2 bg-secondary/50">
              {saves.length > 0 ? (
                <div className="space-y-2">
                  {saves.map((save) => (
                    <div key={save.name} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                      <div>
                        <p className="font-semibold">{save.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last saved: {new Date(save.lastSaved).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoad(save.name)}
                        >
                          <Upload className="mr-1 h-4 w-4" /> Load
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(save.name)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No saved games yet.
                </div>
              )}
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDetails.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDetails.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (actionToConfirm) {
                actionToConfirm();
              }
              setAlertOpen(false);
            }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
