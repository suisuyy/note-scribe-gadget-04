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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>How to Use the App</DialogTitle>
        </DialogHeader>
        <DialogDescription className="max-h-[70vh] overflow-y-auto pr-4">
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

          <h3 className="font-bold mt-4">Sharing Notes:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Click on the "File" menu in the toolbar.</li>
            <li>Select the "Share" option.</li>
            <li>A shareable URL will be copied to your clipboard.</li>
            <li>You can also click on the URL displayed at the bottom of the screen to copy it.</li>
          </ul>

          <h3 className="font-bold mt-4">Rendering Markdown:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Click on the "View" menu in the toolbar.</li>
            <li>Toggle the "Render Markdown" switch to on.</li>
            <li>Your note will now be displayed as rendered markdown.</li>
            <li>Toggle the switch off to return to the plain text editor view.</li>
          </ul>

          <h3 className="font-bold mt-4">Using HTML in Markdown:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>You can use HTML tags like &lt;audio&gt; and &lt;iframe&gt; in your markdown.</li>
            <li>These tags will be rendered properly when "Render Markdown" is enabled.</li>
            <li>Example: &lt;audio controls src="path/to/audio.mp3"&gt;&lt;/audio&gt;</li>
            <li>Example: &lt;iframe src="https://www.youtube.com/embed/VIDEO_ID"&gt;&lt;/iframe&gt;</li>
          </ul>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};