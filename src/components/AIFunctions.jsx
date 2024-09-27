import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, MessageSquare, Plus } from "lucide-react";

export const AIFunctions = ({ aiActions = [], sendAIRequest, handleEditPrompt, handleAddPrompt, isPromptEditOpen, setIsPromptEditOpen, currentPrompt, setCurrentPrompt }) => {
  const handleSavePrompt = () => {
    if (currentPrompt.name && currentPrompt.prompt) {
      const existingIndex = aiActions.findIndex(
        (action) => action.name === currentPrompt.name
      );
      if (existingIndex !== -1) {
        // Update existing prompt
        const updatedActions = [...aiActions];
        updatedActions[existingIndex] = currentPrompt;
        setAiActions(updatedActions);
      } else {
        // Add new prompt
        setAiActions([...aiActions, currentPrompt]);
      }
      setIsPromptEditOpen(false);
    } else {
      alert("Please provide both a name and a prompt.");
    }
  };

  return (
    <>
      {Array.isArray(aiActions) && aiActions.map((action) => (
        <div key={action.name} className="flex justify-between items-center">
          <div
            onClick={() => sendAIRequest(action.prompt)}
            className="flex-grow cursor-pointer"
          >
            <MessageSquare className="mr-2 h-4 w-4 inline" />
            {action.name}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditPrompt(action);
            }}
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Edit {action.name} prompt</span>
          </Button>
        </div>
      ))}
      <div onClick={handleAddPrompt}>
        <Plus className="mr-2 h-4 w-4" />
        Add New Prompt
      </div>
      <Dialog open={isPromptEditOpen} onOpenChange={setIsPromptEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPrompt.name ? "Edit AI Prompt" : "Add New AI Prompt"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt-name">Name</Label>
              <Input
                id="prompt-name"
                value={currentPrompt.name}
                onChange={(e) =>
                  setCurrentPrompt({ ...currentPrompt, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="prompt-content">Prompt</Label>
              <Input
                id="prompt-content"
                value={currentPrompt.prompt}
                onChange={(e) =>
                  setCurrentPrompt({ ...currentPrompt, prompt: e.target.value })
                }
              />
            </div>
            <Button onClick={handleSavePrompt}>Save Prompt</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};