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
import Notification from './Notification';
import { supabaseUrl, supabaseKey } from '../supabaseConfig'; // Import the configuration
import { HelpDialog } from './HelpDialog';
import { debounce } from 'lodash'; // Add this import

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
  const [notifications, setNotifications] = useState([]);

  const [aiActions, setAiActions] = useState(() => {
    const savedActions = localStorage.getItem("aiActions");
    return savedActions
      ? JSON.parse(savedActions)
      : [
          { name: "Ask", prompt: "response me in concise and cool way now:" },
          { name: "Correct", prompt: "correct the text , just only give me corrected text" },
          { name: "Translate", prompt: "translate text to English and Japanese:" },
        ];
  });

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(true);

  useEffect(() => {
    localStorage.setItem("aiActions", JSON.stringify(aiActions));
  }, [aiActions]);


  const addNotification = (message) => {
    const id = uuidv4();
    const timeoutId = setTimeout(() => removeNotification(id), 5000); // Increased delay to 5 seconds
    setNotifications((prev) => [...prev, { id, message, timeoutId }]);
  };


  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };


  const handleNotificationClick = (id) => {
    setNotifications((prev) => {
      const updatedNotifications = prev.map((notif) => {
        if (notif.id === id) {
          clearTimeout(notif.timeoutId); // Clear the timeout
          return { ...notif, timeoutId: null }; // Set timeoutId to null to indicate it shouldn't auto-remove
        }
        return notif;
      });
      return updatedNotifications;
    });
  };


  const getSelectedText = () => {
    if (editorRef.current) {
      const { state } = editorRef.current;
      const selection = state.selection.main;
      if (selection.from !== selection.to) {
        return state.sliceDoc(selection.from, selection.to);
      } else {
        const content = state.doc.toString();
        const cursorPos = selection.from;
        
        // Find the start of the block (three consecutive newlines before the cursor)
        const beforeCursor = content.substring(0, cursorPos);
        const startBlock = beforeCursor.lastIndexOf('\n\n\n');
        
        const startPos = startBlock !== -1 ? startBlock + 3 : 0;
        
        // Find the end of the block (three consecutive newlines after the cursor)
        const afterCursor = content.substring(cursorPos);
        const endBlock = afterCursor.indexOf('\n\n\n');
        const endPos = endBlock !== -1 ? cursorPos + endBlock : content.length;
        
        return content.substring(startPos, endPos).trim();
      }
    }
    return "";
  };


  const sendAIRequest = async (prompt, selectedText) => {
    const fullPrompt = `${prompt}\n\n${selectedText}`;
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
        changes: { from: lineEnd, insert: `\n### AI Response (${formattedDateTime}):\n${data}\n` }, // Added ###
        selection: { anchor: lineEnd + 1 },
      });
      addNotification(`AI request sent for the current block.\n\nFull Prompt:\n${fullPrompt}`);
    } catch (error) {
      console.error("Error sending AI request:", error);
    }
  };


  const handleSavePrompt = () => {
    if (currentPrompt.name && currentPrompt.prompt) {
      const existingIndex = aiActions.findIndex(action => action.name === currentPrompt.name);
      if (existingIndex !== -1) {
        // Update existing prompt
        const updatedActions = [...aiActions];
        updatedActions[existingIndex] = currentPrompt;
        setAiActions(updatedActions);
        addNotification(`Prompt updated: ${currentPrompt.name}`);
      } else {
        // Add new prompt
        setAiActions([...aiActions, currentPrompt]);
        addNotification(`New prompt added: ${currentPrompt.name}`);
      }
      setIsPromptEditOpen(false);
    } else {
      alert("Please provide both a name and a prompt.");
    }
  };


  const handleKeyDown = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (editorRef.current) {
          editorRef.current.focus();
          const currentBlock = getSelectedText();
          if (currentBlock) {
            const askPrompt = aiActions.find(action => action.name === "Ask")?.prompt || "Be concise:";
            sendAIRequest(askPrompt, currentBlock);
          }
        }
      }
    },
    [editorRef, sendAIRequest, getSelectedText, aiActions]
  );


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);


  const saveNote = useCallback(
    debounce(async (noteContent) => {
      if (!noteId) return;
      setIsSynced(false);
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
        setIsSynced(true);
        // Hide the "Synced" notice after 3 seconds
        setTimeout(() => setIsSynced(false), 3000);
      } catch (error) {
        console.error("Error saving note:", error);
        setIsSynced(false);
      }
    }, 5000),
    [noteId]
  );


  const handleChange = useCallback(
    (value, viewUpdate) => {
      setContent(value);
      setWordCount(value.trim().split(/\s+/).length);
      saveNote(value);
      editorRef.current = viewUpdate.view;

      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), value]);
      setHistoryIndex(prevIndex => prevIndex + 1);
    },
    [noteId, historyIndex, saveNote]
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


  return (
    <div ref={appRef} className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div
        className={`fixed top-0 left-0 w-screen h-screen flex flex-col ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
        style={{ fontSize: `${fontSize}px`, zoom: `${uiScale}%` }}
      >
        {/* TopBar */}
        <div className="flex-shrink-0 relative">
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
            getSelectedText={getSelectedText}
            addNotification={addNotification}
            setIsHelpOpen={setIsHelpOpen}
          />
          {isSynced && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
              Synced
            </div>
          )}
        </div>
        
        {/* Editor Container */}
        <div className="flex-grow overflow-auto">
          <NoteEditor
            content={content}
            renderMarkdown={renderMarkdown}
            darkMode={darkMode}
            fontSize={fontSize}
            showLineNumbers={showLineNumbers}
            handleChange={handleChange}
            editorRef={editorRef}
          />
        </div>
        
        {/* BottomBar */}
        <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 text-sm flex justify-between items-center">
          <span>Word count: {wordCount}</span>
          <button
            onClick={copyUrlToClipboard}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {`${window.location.origin}?id=${noteId}`}
          </button>
        </div>

        {/* Notification container */}
        <div className="absolute bottom-16 right-4 z-50 space-y-2 max-w-[500px]">
          {notifications.map((notif) => (
            <Notification
              key={notif.id}
              id={notif.id}
              message={notif.message}
              onClose={removeNotification}
              onClick={() => handleNotificationClick(notif.id)}
            />
          ))}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".txt,.md"
      />
      
      {/* Dialogs */}
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
      <HelpDialog isOpen={isHelpOpen} setIsOpen={setIsHelpOpen} />
    </div>
  );
}