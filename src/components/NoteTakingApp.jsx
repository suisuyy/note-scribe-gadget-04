import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { lineNumbers } from "@codemirror/view";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Save,
  Eye,
  ZoomIn,
  Type,
  Moon,
  Sun,
  Maximize,
  MessageSquare,
  Share2,
  Settings,
  Edit2,
  Plus,
  List,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

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
  const [currentUrl, setCurrentUrl] = useState("");
  const [noteId, setNoteId] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPromptEditOpen, setIsPromptEditOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState({ name: "", prompt: "" });
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const fileInputRef = useRef(null);
  const appRef = useRef(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const editorExtensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    showLineNumbers && lineNumbers(),
  ].filter(Boolean);

  const handleChange = useCallback(
    (value, viewUpdate) => {
      setContent(value);
      setWordCount(value.trim().split(/\s+/).length);
      saveNote(value);
      editorRef.current = viewUpdate.view;
    },
    [noteId]
  );

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
    alert("Share URL copied to clipboard!");
  };

  const handleSetNoteId = async (newId) => {
    setNoteId(newId);
    setIsSettingsOpen(false);
    await loadNote(newId);
    localStorage.setItem("noteId", newId);
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
      } else {
        setContent("");
        setWordCount(0);
      }
    } catch (error) {
      console.error("Error fetching note:", error);
      setContent("");
      setWordCount(0);
    }
  };

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

  const handleAddPrompt = () => {
    setCurrentPrompt({ name: "", prompt: "" });
    setIsPromptEditOpen(true);
  };

  const handleEditPrompt = (action) => {
    setCurrentPrompt(action);
    setIsPromptEditOpen(true);
  };

  const handleSavePrompt = () => {
    if (currentPrompt.name && currentPrompt.prompt) {
      const existingIndex = aiActions.findIndex(
        (action) => action.name === currentPrompt.name
      );
      if (existingIndex !== -1) {
        // Update existing prompt
        const updatedActions = [...aiActions];
        updatedActions[existingIndex] = currentPrompt;
        setAiActions(updatedActions);
      } else {
        // Add new prompt
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
      }
      setNoteId(id);
      await loadNote(id);
      setCurrentUrl(`${window.location.origin}?id=${id}`);
      localStorage.setItem("noteId", id);
    };

    initializeNote();
  }, [location]);

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
        <Menubar className="px-2 border-b border-border">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={openFile}>
                <FileText className="mr-2 h-4 w-4" />
                Open
              </MenubarItem>
              <MenubarItem onClick={downloadFile}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </MenubarItem>
              <MenubarItem onClick={() => saveNote(content)}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </MenubarItem>
              <MenubarItem onClick={shareNote}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <div className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  <Label htmlFor="markdown-switch" className="mr-2">
                    Render Markdown
                  </Label>
                  <Switch
                    id="markdown-switch"
                    checked={renderMarkdown}
                    onCheckedChange={setRenderMarkdown}
                  />
                </div>
              </MenubarItem>
              <MenubarItem>
                <div className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  <Label htmlFor="line-numbers-switch" className="mr-2">
                    Show Line Numbers
                  </Label>
                  <Switch
                    id="line-numbers-switch"
                    checked={showLineNumbers}
                    onCheckedChange={setShowLineNumbers}
                  />
                </div>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                <div className="flex items-center">
                  <ZoomIn className="mr-2 h-4 w-4" />
                  <Label htmlFor="ui-scale" className="mr-2">
                    UI Scale
                  </Label>
                  <Slider
                    id="ui-scale"
                    min={50}
                    max={200}
                    step={10}
                    value={[uiScale]}
                    onValueChange={(value) => setUiScale(value[0])}
                    className="w-32"
                  />
                </div>
              </MenubarItem>
              <MenubarItem>
                <div className="flex items-center">
                  <Type className="mr-2 h-4 w-4" />
                  <Label htmlFor="font-size" className="mr-2">
                    Font Size
                  </Label>
                  <Slider
                    id="font-size"
                    min={8}
                    max={24}
                    step={1}
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    className="w-32"
                  />
                </div>
              </MenubarItem>
              <MenubarItem>
                <div className="flex items-center">
                  {darkMode ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )}
                  <Label htmlFor="dark-mode-switch" className="mr-2">
                    Dark Mode
                  </Label>
                  <Switch
                    id="dark-mode-switch"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </MenubarItem>
              <MenubarItem onClick={toggleFullscreen}>
                <Maximize className="mr-2 h-4 w-4" />
                Fullscreen
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>AI</MenubarTrigger>
            <MenubarContent>
              {aiActions.map((action) => (
                <MenubarItem
                  key={action.name}
                  className="flex justify-between items-center"
                >
                  <div
                    onClick={() => sendAIRequest(action.prompt)}
                    className="flex-grow cursor-pointer"
                  >
                    <MessageSquare className="mr-2 h-4 w-4 inline" />
                    {action.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPrompt(action);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit {action.name} prompt</span>
                  </Button>
                </MenubarItem>
              ))}
              <MenubarSeparator />
              <MenubarItem onClick={handleAddPrompt}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Prompt
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Settings</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Set Note ID
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <div className="p-4">
          {renderMarkdown ? (
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <CodeMirror
              value={content}
              height="calc(100vh - 120px)"
              extensions={editorExtensions}
              onChange={handleChange}
              theme={darkMode ? "dark" : "light"}
              onCreateEditor={(view) => {
                editorRef.current = view;
              }}
            />
          )}
        </div>
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