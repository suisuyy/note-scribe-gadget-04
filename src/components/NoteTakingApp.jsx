import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { NoteEditor } from './NoteEditor';
import { MenuBar } from './MenuBar';
import { HelpDialog } from './HelpDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabaseUrl, supabaseKey } from '../config/supabase';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function NoteTakingApp() {
  const [content, setContent] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [uiScale, setUiScale] = useState(100);
  const [renderMarkdown, setRenderMarkdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [noteId, setNoteId] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [isPromptEditOpen, setIsPromptEditOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState({ name: "", prompt: "" });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const fileInputRef = useRef(null);
  const appRef = useRef(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleChange = useCallback(
    (value, viewUpdate) => {
      setContent(value);
      setWordCount(value.trim().split(/\s+/).length);
      saveNote(value);
      editorRef.current = viewUpdate.view;

      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), value]);
      setHistoryIndex(prevIndex => prevIndex + 1);
    },
    [noteId, historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const openFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        setContent(text);
        saveNote(text);
      };
      reader.readAsText(file);
    }
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `note-${noteId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const saveNote = async (noteContent) => {
    if (!noteId) return;
    try {
      const { error } = await supabase
        .from("notes")
        .upsert({
          id: noteId,
          content: noteContent,
          last_updated: new Date().toISOString(),
        });

      if (error) throw error;
      console.log("Note saved successfully");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const shareNote = () => {
    const shareUrl = `${window.location.origin}?id=${noteId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share URL copied to clipboard!");
  };

  const handleSetNoteId = async (newId) => {
    setNoteId(newId);
    setIsSettingsOpen(false);
    await loadNote(newId);
    navigate(`?id=${newId}`, { replace: true });
  };

  const loadNote = async (id) => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("content")
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setContent(data.content);
        setWordCount(data.content.trim().split(/\s+/).length);
        setHistory([data.content]);
        setHistoryIndex(0);
      } else {
        setContent("");
        setWordCount(0);
        setHistory([]);
        setHistoryIndex(-1);
      }
    } catch (error) {
      console.error("Error fetching note:", error);
      setContent("");
      setWordCount(0);
      setHistory([]);
      setHistoryIndex(-1);
    }
  };

  const getSelectedText = () => {
    if (editorRef.current) {
      const selection = editorRef.current.state.selection.main;
      if (selection.from !== selection.to) {
        return editorRef.current.state.sliceDoc(selection.from, selection.to);
      } else {
        const content = editorRef.current.state.doc.toString();
        const cursorPos = selection.from;
        
        let startPos = cursorPos;
        let endPos = cursorPos;
        let newlineCount = 0;
        
        while (startPos > 0 && newlineCount < 3) {
          startPos--;
          if (content[startPos] === '\n') newlineCount++;
        }
        
        newlineCount = 0;
        
        while (endPos < content.length && newlineCount < 3) {
          if (content[endPos] === '\n') newlineCount++;
          endPos++;
        }
        
        return content.slice(startPos, endPos).trim();
      }
    }
    return "No text selected";
  };


  const sendAIRequest = async (prompt, selectedText) => {
    if (!editorRef.current) {
      console.error("Editor not initialized");
      return;
    }
    const fullPrompt = selectedText ? `${prompt} ${selectedText}` : prompt;
    try {
      const response = await fetch("https://simpleai.devilent2.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ q: fullPrompt }),
      });
      const data = await response.text();
      const now = new Date();
      const formattedDateTime = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const cursor = editorRef.current.state.selection.main.to;
      const lineEnd = editorRef.current.state.doc.lineAt(cursor).to;
      editorRef.current.dispatch({
        changes: { from: lineEnd, insert: `\nAI Response (${formattedDateTime}):\n${data}\n` },
        selection: { anchor: lineEnd + 1 },
      });

      toast(
        <div>
          <p><strong>Prompt:</strong> {prompt}</p>
          {selectedText && <p><strong>Selected text:</strong> {selectedText}</p>}
          <p><strong>AI response sent</strong></p>
        </div>,
        {
          duration: 5000,
        }
      );
    } catch (error) {
      console.error("Error sending AI request:", error);
      toast.error("Failed to send AI request");
    }
  };

  const [aiActions, setAiActions] = useState(() => {
    const savedActions = localStorage.getItem("aiActions");
    return savedActions
      ? JSON.parse(savedActions)
      : [
          { name: "Ask", prompt: "Be concise:" },
          { name: "Correct", prompt: "correct the text , just only give  me corrected text" },
          { name: "Translate", prompt: "Translate to English Japanese:" },
        ];
  });

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

  const copyUrlToClipboard = () => {
    const url = `${window.location.origin}?id=${noteId}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const handleSavePrompt = () => {
    if (currentPrompt.name && currentPrompt.prompt) {
      const existingIndex = aiActions.findIndex(
        (action) => action.name === currentPrompt.name
      );
      if (existingIndex !== -1) {
        const updatedActions = [...aiActions];
        updatedActions[existingIndex] = currentPrompt;
        setAiActions(updatedActions);
      } else {
        setAiActions([...aiActions, currentPrompt]);
      }
      setIsPromptEditOpen(false);
    } else {
      alert("Please provide both a name and a prompt.");
    }
  };

  useEffect(() => {
    const initializeNote = async () => {
      const searchParams = new URLSearchParams(location.search);
      let id = searchParams.get("id");
      if (!id) {
        id = localStorage.getItem("noteId") || uuidv4();
        navigate(`?id=${id}`, { replace: true });
      }
      setNoteId(id);
      await loadNote(id);
      localStorage.setItem("noteId", id);
    };

    initializeNote();
  }, [location, navigate]);

  useEffect(() => {
    const autoSave = setTimeout(() => {
      saveNote(content);
    }, 5000);

    return () => clearTimeout(autoSave);
  }, [content, noteId]);

  const toggleRenderMarkdown = () => setRenderMarkdown(prev => !prev);
  const toggleShowLineNumbers = () => setShowLineNumbers(prev => !prev);
  const toggleDarkMode = () => setDarkMode(prev => !prev);


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
          saveNote={() => saveNote(content)}
          shareNote={shareNote}
          renderMarkdown={renderMarkdown}
          toggleRenderMarkdown={toggleRenderMarkdown}
          showLineNumbers={showLineNumbers}
          toggleShowLineNumbers={toggleShowLineNumbers}
          uiScale={uiScale}
          setUiScale={setUiScale}
          fontSize={fontSize}
          setFontSize={setFontSize}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
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
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          setIsHelpOpen={setIsHelpOpen}
        />
        
    <NoteEditor
      content={content}
      renderMarkdown={renderMarkdown}
      darkMode={darkMode}
      fontSize={fontSize}
      showLineNumbers={showLineNumbers}
      handleChange={handleChange}
      editorRef={editorRef}
      sendAIRequest={sendAIRequest}
    />
    // ... (keep the rest of the JSX)
  );
}