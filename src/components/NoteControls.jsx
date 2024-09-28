import React from 'react';
import { MenuBar } from './MenuBar';
import { downloadFile, openFile, shareNote } from '../utils/fileOperations';

export const NoteControls = ({
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
  noteId,
  content,
  fileInputRef,
  handleFileChange,
  saveNote,
}) => {
  const handleSetNoteId = async (newId) => {
    // Implement the logic to set the new note ID and load the note
    // This might involve updating the URL and calling a loadNote function
    console.log('Setting new note ID:', newId);
  };

  return (
    <MenuBar
      openFile={() => openFile(fileInputRef)}
      downloadFile={() => downloadFile(content, noteId)}
      saveNote={saveNote}
      shareNote={() => shareNote(noteId)}
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
      handleSetNoteId={handleSetNoteId}
    />
  );
};

export default NoteControls;