import React from 'react';
import { MenuBar } from './MenuBar';

export const NoteControls = ({
  openFile,
  downloadFile,
  saveNote,
  shareNote,
  renderMarkdown,
  setRenderMarkdown,
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
}) => {
  return (
    <MenuBar
      openFile={openFile}
      downloadFile={downloadFile}
      saveNote={saveNote}
      shareNote={shareNote}
      renderMarkdown={renderMarkdown}
      setRenderMarkdown={setRenderMarkdown}
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
    />
  );
};