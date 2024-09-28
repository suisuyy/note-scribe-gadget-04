import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { NoteEditor } from './NoteEditor';
import NoteControls from './NoteControls';
import { AIFunctions } from './AIFunctions';
import { useNoteManagement } from '../hooks/useNoteManagement';

const supabaseUrl = 'https://vyqkmpjwvoodeeskzvrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cWttcGp3dm9vZGVlc2t6dnJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzA2MDI1MCwiZXhwIjoyMDQyNjM2MjUwfQ.I-vbtdO1vl0RlNW_Ww7n4mo6Pl3NiMfJ0vWvcMdSq50';

const supabase = createClient(supabaseUrl, supabaseKey);

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
    saveNote,
    toggleFullscreen,
    loadNote,
  } = useNoteManagement();

  const [aiActions, setAiActions] = useState(() => {
    const savedActions = localStorage.getItem("aiActions");
    return savedActions
      ? JSON.parse(savedActions)
      : [
          { name: "Ask", prompt: "Please answer the following question:" },
          { name: "Correct", prompt: "Please correct any errors in the following text:" },
          { name: "Translate", prompt: "Please translate the following text to English:" },
        ];
  });

  useEffect(() => {
    localStorage.setItem("aiActions", JSON.stringify(aiActions));
  }, [aiActions]);

  return (
    <div ref={appRef} className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
        style={{ fontSize: `${fontSize}px`, zoom: `${uiScale}%` }}
      >
        <NoteControls
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
          noteId={noteId}
          content={content}
          fileInputRef={fileInputRef}
          handleFileChange={handleChange}
          saveNote={saveNote}
        />
        <NoteEditor
          content={content}
          renderMarkdown={renderMarkdown}
          darkMode={darkMode}
          fontSize={fontSize}
          handleChange={handleChange}
          editorRef={editorRef}
          showLineNumbers={showLineNumbers}
        />
        <AIFunctions
          aiActions={aiActions}
          setAiActions={setAiActions}
          editorRef={editorRef}
        />
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-gray-100 dark:bg-gray-800 text-sm flex justify-between items-center">
          <span>Word count: {wordCount}</span>
          <span>Note ID: {noteId}</span>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          style={{ display: "none" }}
          accept=".txt,.md"
        />
      </div>
    </div>
  );
}