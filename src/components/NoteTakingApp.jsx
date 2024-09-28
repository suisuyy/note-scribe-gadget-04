import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { NoteEditor } from "./NoteEditor";
import { NoteControls } from "./NoteControls";
import { useNoteManagement } from "../hooks/useNoteManagement";

const supabaseUrl = "https://vyqkmpjwvoodeeskzvrk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cWttcGp3dm9vZGVlc2t6dnJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzA2MDI1MCwiZXhwIjoyMDQyNjM2MjUwfQ.I-vbtdO1vl0RlNW_Ww7n4mo6Pl3NiMfJ0vWvcMdSq50";

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
    openFile,
    handleFileChange,
    downloadFile,
    saveNote,
    toggleFullscreen,
    shareNote,
    handleSetNoteId,
    copyUrlToClipboard,
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

  const [isPromptEditOpen, setIsPromptEditOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState({ name: "", prompt: "" });

  const getSelectedText = () => {
    if (editorRef.current) {
      const selection = editorRef.current.state.selection.main;
      return editorRef.current.state.sliceDoc(selection.from, selection.to);
    }
    return "";
  };

  const sendAIRequest = async (prompt) => {
    if (!editorRef.current) {
      console.error("Editor not initialized");
      return;
    }
    const selectedText = getSelectedText();
    const fullPrompt = `${prompt}\n\nSelected text:\n${selectedText}`;
    try {
      const response = await fetch("https://simpleai.devilent2.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ q: fullPrompt }),
      });
      const data = await response.text();
      // Insert the AI response after the cursor
      const cursor = editorRef.current.state.selection.main.to;
      editorRef.current.dispatch({
        changes: { from: cursor, insert: `\n\nAI Response:\n${data}\n\n` },
      });
    } catch (error) {
      console.error("Error sending AI request:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem("aiActions", JSON.stringify(aiActions));
  }, [aiActions]);

  const handleAddPrompt = () => {
    setCurrentPrompt({ name: "", prompt: "" });
    setIsPromptEditOpen(true);
  };

  const handleEditPrompt = (action) => {
    setCurrentPrompt(action);
    setIsPromptEditOpen(true);
  };

  return (
    <div ref={appRef} className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
        style={{ fontSize: `${fontSize}px`, zoom: `${uiScale}%` }}
      >
        <NoteControls
          openFile={openFile}
          downloadFile={downloadFile}
          saveNote={() => saveNote(content)}
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
        <NoteEditor
          content={content}
          renderMarkdown={renderMarkdown}
          darkMode={darkMode}
          fontSize={fontSize}
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
    </div>
  );
}