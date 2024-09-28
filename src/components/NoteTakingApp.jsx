import React from 'react';
import { NoteEditor } from './NoteEditor';
import { NoteControls } from './NoteControls';
import { useNoteManagement } from '../hooks/useNoteManagement';
import { toast } from 'sonner';

export default function NoteTakingApp() {
  const {
    content,
    fontSize,
    uiScale,
    renderMarkdown,
    darkMode,
    wordCount,
    isFullscreen,
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
  } = useNoteManagement();

  return (
    <div ref={appRef} className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div
        className={`min-h-screen ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
        }`}
        style={{ zoom: `${uiScale}%` }}
      >
        <NoteControls
          openFile={openFile}
          downloadFile={downloadFile}
          saveNote={() => saveNote(content)}
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
          <span
            className="cursor-pointer hover:underline"
            onClick={copyUrlToClipboard}
          >
            {`${window.location.origin}?id=${noteId}`}
          </span>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".txt,.md"
        />
      </div>
    </div>
  );
}