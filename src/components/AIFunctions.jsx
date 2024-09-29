import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit2, Plus } from "lucide-react";
import { MenubarItem } from "@/components/ui/menubar"; // Import MenubarItem

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
    sendAIRequest(action.prompt, selectedText);
    closeMenu(); // This will close the menu automatically
  };

  return (
    <>
      {aiActions && aiActions.length > 0 ? (
        aiActions.map((action) => (
          <MenubarItem
            key={action.name}
            onSelect={() => handleAIAction(action)}
            className="flex justify-between items-center"
          >
            <div className="flex-grow cursor-pointer">
              <MessageSquare className="mr-2 h-4 w-4 inline" />
              {action.name}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation(); // Prevents the menu from closing when editing
                handleEditPrompt(action);
              }}
              aria-label={`Edit ${action.name} prompt`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </MenubarItem>
        ))
      ) : (
        <div className="text-sm text-gray-500 mb-2">No AI actions available</div>
      )}
      <div onClick={handleAddPrompt} className="cursor-pointer flex items-center">
        <Plus className="mr-2 h-4 w-4 inline" />
        Add New Prompt
      </div>
    </>
  );
};