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
  // remove closeMenu
  getSelectedText, 
  addNotification 
}) => {

  const handleAIAction = (action) => {
    const selectedText = getSelectedText();
    sendAIRequest(action.prompt, selectedText);
    // Remove closeMenu call
    // closeMenu();
  };

  return (
    <>
      {aiActions && aiActions.length > 0 ? (
        aiActions.map((action) => (
          <MenubarItem key={action.name} onSelect={() => handleAIAction(action)}>
            <div className="flex justify-between items-center">
              <div className="flex-grow">
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
          </MenubarItem>
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