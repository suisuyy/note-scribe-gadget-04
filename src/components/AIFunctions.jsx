import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit2, Plus } from "lucide-react";

export const AIFunctions = ({ 
  aiActions, 
  sendAIRequest, 
  handleEditPrompt, 
  handleAddPrompt, 
  isPromptEditOpen, 
  setIsPromptEditOpen, 
  currentPrompt, 
  setCurrentPrompt, 
  closeMenu, 
  getSelectedText, 
  addNotification 
}) => {

  const handleAIAction = (action) => {
    const selectedText = getSelectedText();
    const fullPrompt = `${action.prompt}\n\n${selectedText}`; // Removed "Selected text:"
    sendAIRequest(action.prompt, selectedText);
    addNotification(`AI request sent: ${action.name}`);
    addNotification(`Full Prompt:\n${fullPrompt}`);
    closeMenu();
  };

  return (
    <>
      {aiActions && aiActions.length > 0 ? (
        aiActions.map((action) => (
          <div key={action.name} className="flex justify-between items-center">
            <div
              onClick={() => handleAIAction(action)}
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
      {/* Removed Dialog for handleSavePrompt */}
    </>
  );
};