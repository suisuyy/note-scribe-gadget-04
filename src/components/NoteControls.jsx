import React from 'react';
import { MenuBar } from './MenuBar';

export const NoteControls = ({
  openFile,
  downloadFile,
  saveNote,
  shareNote,
  renderMarkdown,
  setRenderMarkdown,
  showLineNumbers,
  setShowLineNumbers,
  uiScale,
  setUiScale,
  fontSize,
  setFontSize,
  darkMode,
  setDarkMode,
  toggleFullscreen,
  setIsSettingsOpen,
  aiActions,
  sendAIRequest,
  handleEditPrompt,
  handleAddPrompt,
  isPromptEditOpen,
  setIsPromptEditOpen,
  currentPrompt,
  setCurrentPrompt,
  setAiActions
}) => {
  return (
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
      setAiActions={setAiActions}
    />
  );
};