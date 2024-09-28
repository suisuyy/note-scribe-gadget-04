import React, { useState } from 'react';
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

export const AIFunctions = ({ aiActions, setAiActions, editorRef }) => {
  const [isPromptEditOpen, setIsPromptEditOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState({ name: "", prompt: "" });

  const sendAIRequest = async (prompt) => {
    if (!editorRef.current) {
      console.error("Editor not initialized");
      return;
    }
    const selectedText = getSelectedText();
    const fullPrompt = `${prompt}\n\nSelected text:\n${selectedText}`;
    try {
      const response = await fetch("https://simpleai.devilent2.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ q: fullPrompt }),
      });
      const data = await response.text();
      // Insert the AI response after the cursor
      const cursor = editorRef.current.state.selection.main.to;
      editorRef.current.dispatch({
        changes: { from: cursor, insert: `\n\nAI Response:\n${data}\n\n` },
      });
    } catch (error) {
      console.error("Error sending AI request:", error);
    }
  };

  const getSelectedText = () => {
    if (editorRef.current) {
      const selection = editorRef.current.state.selection.main;
      return editorRef.current.state.sliceDoc(selection.from, selection.to);
    }
    return "";
  };

  const handleEditPrompt = (action) => {
    setCurrentPrompt(action);
    setIsPromptEditOpen(true);
  };

  const handleAddPrompt = () => {
    setCurrentPrompt({ name: "", prompt: "" });
    setIsPromptEditOpen(true);
  };

  const handleSavePrompt = () => {
    if (currentPrompt && currentPrompt.name && currentPrompt.prompt) {
      if (currentPrompt.id) {
        setAiActions(aiActions.map(action => 
          action.id === currentPrompt.id ? currentPrompt : action
        ));
      } else {
        setAiActions([...aiActions, { ...currentPrompt, id: Date.now() }]);
      }
      setIsPromptEditOpen(false);
    } else {
      alert("Please provide both a name and a prompt.");
    }
  };

  return (
    <>
      {aiActions && aiActions.length > 0 ? (
        aiActions.map((action) => (
          <div key={action.id} className="flex justify-between items-center">
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
              {currentPrompt.id ? "Edit AI Prompt" : "Add New AI Prompt"}
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

export default AIFunctions;