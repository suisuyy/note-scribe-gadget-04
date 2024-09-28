import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const HelpDialog = ({ isOpen, setIsOpen }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How to Use the App</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <h3 className="font-bold mt-4">Basic Usage:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Type or paste your text in the main editor area.</li>
            <li>Use the toolbar options to customize your view and edit settings.</li>
            <li>Your notes are automatically saved as you type.</li>
          </ul>

          <h3 className="font-bold mt-4">Using AI Functions:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Click on the "AI" menu in the toolbar.</li>
            <li>Select an AI action (e.g., Ask, Correct, Translate).</li>
            <li>The AI will process your request based on the selected text or current context.</li>
          </ul>

          <h3 className="font-bold mt-4">Selecting Text for AI:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Highlight the specific text you want the AI to work with.</li>
            <li>If no text is selected, the AI will use the surrounding context (2 lines before and after the cursor).</li>
            <li>After selecting text, choose an AI action from the "AI" menu.</li>
          </ul>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};