import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { NoteEditor } from './NoteEditor';
import { NoteControls } from './NoteControls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const supabaseUrl = "https://vyqkmpjwvoodeeskzvrk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cWttcGp3dm9vZGVlc2t6dnJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzA2MDI1MCwiZXhwIjoyMDQyNjM2MjUwfQ.I-vbtdO1vl0RlNW_Ww7n4mo6Pl3NiMfJ0vWvcMdSq50";

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
        
        // Find the start position (3 newlines before cursor)
        while (startPos > 0 && newlineCount < 3) {
          startPos--;
          if (content[startPos] === '\n') newlineCount++;
        }
        
        // Reset newline count for end position
        newlineCount = 0;
        
        // Find the end position (3 newlines after cursor)
        while (endPos < content.length && newlineCount < 3) {
          if (content[endPos] === '\n') newlineCount++;
          endPos++;
        }
        
        return content.slice(startPos, endPos).trim();
      }
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
    } catch (error) {
      console.error("Error sending AI request:", error);
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
          handleUndo={handleUndo}
          handleRedo={handleRedo}
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
          <button
            onClick={copyUrlToClipboard}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {`${window.location.origin}?id=${noteId}`}
          </button>
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
              onChange={(e) => setNoteId(e.target.value)}
            />
            <Button onClick={() => handleSetNoteId(noteId)}>Set ID</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isPromptEditOpen} onOpenChange={setIsPromptEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPrompt.name ? "Edit AI Prompt" : "Add New AI Prompt"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt-name">Name</Label>
              <Input
                id="prompt-name"
                value={currentPrompt.name}
                onChange={(e) =>
                  setCurrentPrompt({ ...currentPrompt, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="prompt-content">Prompt</Label>
              <Input
                id="prompt-content"
                value={currentPrompt.prompt}
                onChange={(e) =>
                  setCurrentPrompt({ ...currentPrompt, prompt: e.target.value })
                }
              />
            </div>
            <Button onClick={handleSavePrompt}>Save Prompt</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}