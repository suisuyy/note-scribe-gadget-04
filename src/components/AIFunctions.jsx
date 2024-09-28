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
import { toast } from "sonner";

export const AIFunctions = ({ aiActions, sendAIRequest, handleEditPrompt, handleAddPrompt, isPromptEditOpen, setIsPromptEditOpen, currentPrompt, setCurrentPrompt, closeMenu }) => {
  const handleSavePrompt = () => {
    if (currentPrompt && currentPrompt.name && currentPrompt.prompt) {
      // Implement the logic to save the prompt
      setIsPromptEditOpen(false);
    } else {
      alert("Please provide both a name and a prompt.");
    }
  };

  const handleAIAction = (prompt) => {
    const selectedText = getSelectedText();
    const fullPrompt = `${prompt}\n\nSelected text:\n${selectedText}`;
    sendAIRequest(fullPrompt);
    closeMenu();
    
    // Show notification
    toast(fullPrompt, {
      duration: 5000,
      description: "AI request sent",
    });
  };

  const getSelectedText = () => {
    // Implement the logic to get selected text from the editor
    // This is a placeholder and should be replaced with actual implementation
    return window.getSelection().toString() || "No text selected";
  };

  return (
    <>
      {aiActions && aiActions.length > 0 ? (
        aiActions.map((action) => (
          <div key={action.name} className="flex justify-between items-center">
            <div
              onClick={() => handleAIAction(action.prompt)}
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
        ))
      ) : (
        <div className="text-sm text-gray-500 mb-2">No AI actions available</div>
      )}
      <div onClick={handleAddPrompt} className="cursor-pointer">
        <Plus className="mr-2 h-4 w-4 inline" />
        Add New Prompt
      </div>
      <Dialog open={isPromptEditOpen} onOpenChange={setIsPromptEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPrompt && currentPrompt.name ? "Edit AI Prompt" : "Add New AI Prompt"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt-name">Name</Label>
              <Input
                id="prompt-name"
                value={currentPrompt?.name || ''}
                onChange={(e) =>
                  setCurrentPrompt({ ...currentPrompt, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="prompt-content">Prompt</Label>
              <Input
                id="prompt-content"
                value={currentPrompt?.prompt || ''}
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