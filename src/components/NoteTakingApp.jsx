import React from 'react';
import { useNoteManagement } from '../hooks/useNoteManagement';
import { MenuBar } from './MenuBar';
import { NoteEditor } from './NoteEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NoteTakingApp() {
  const {
    content,
    fontSize,
    uiScale,
    renderMarkdown,
    darkMode,
    wordCount,
    noteId,
    isSettingsOpen,
    showLineNumbers,
    fileInputRef,
    appRef,
    editorRef,
    setFontSize,
    setUiScale,
    setRenderMarkdown,
    setDarkMode,
    setIsSettingsOpen,
    setShowLineNumbers,
    handleChange,
    openFile,
    handleFileChange,
    downloadFile,
    saveNote,
    toggleFullscreen,
    shareNote,
    handleSetNoteId,
    copyUrlToClipboard,
    sendAIRequest,
    aiActions,
    handleEditPrompt,
    handleAddPrompt,
    isPromptEditOpen,
    setIsPromptEditOpen,
    currentPrompt,
    setCurrentPrompt,
    undo,
    redo,
  } = useNoteManagement();

  return (
    <div ref={appRef} className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
        style={{ fontSize: `${fontSize}px`, zoom: `${uiScale}%` }}
      >
        <MenuBar
          openFile={openFile}
          downloadFile={downloadFile}
          saveNote={saveNote}
          shareNote={shareNote}
          renderMarkdown={renderMarkdown}
          setRenderMarkdown={setRenderMarkdown}
          showLineNumbers={showLineNumbers}
          setShowLineNumbers={setShowLineNumbers}
          uiScale={uiScale}
          setUiScale={setUiScale}
          fontSize={fontSize}
          setFontSize={setFontSize}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          toggleFullscreen={toggleFullscreen}
          setIsSettingsOpen={setIsSettingsOpen}
          aiActions={aiActions}
          sendAIRequest={sendAIRequest}
          handleEditPrompt={handleEditPrompt}
          handleAddPrompt={handleAddPrompt}
          isPromptEditOpen={isPromptEditOpen}
          setIsPromptEditOpen={setIsPromptEditOpen}
          currentPrompt={currentPrompt}
          setCurrentPrompt={setCurrentPrompt}
          undo={undo}
          redo={redo}
        />
        <NoteEditor
          content={content}
          renderMarkdown={renderMarkdown}
          darkMode={darkMode}
          fontSize={fontSize}
          showLineNumbers={showLineNumbers}
          handleChange={handleChange}
          editorRef={editorRef}
        />
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-gray-100 dark:bg-gray-800 text-sm flex justify-between items-center">
          <span>Word count: {wordCount}</span>
          <span>Note ID: {noteId}</span>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept=".txt,.md"
        />
      </div>
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Note ID</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter note ID"
              value={noteId}
              onChange={(e) => handleSetNoteId(e.target.value)}
            />
            <Button onClick={copyUrlToClipboard}>Copy URL</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}