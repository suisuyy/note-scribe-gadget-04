import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const supabaseUrl = 'https://vyqkmpjwvoodeeskzvrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cWttcGp3dm9vZGVlc2t6dnJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzA2MDI1MCwiZXhwIjoyMDQyNjM2MjUwfQ.I-vbtdO1vl0RlNW_Ww7n4mo6Pl3NiMfJ0vWvcMdSq50';

const supabase = createClient(supabaseUrl, supabaseKey);

export const useNoteManagement = () => {
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [uiScale, setUiScale] = useState(100);
  const [renderMarkdown, setRenderMarkdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [noteId, setNoteId] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const fileInputRef = useRef(null);
  const appRef = useRef(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
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
        .from('notes')
        .upsert({
          id: noteId,
          content: noteContent,
          last_updated: new Date().toISOString(),
        });

      if (error) throw error;
      console.log('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
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
    toast.success('Share URL copied to clipboard!');
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
        .from('notes')
        .select('content')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setContent(data.content);
        setWordCount(data.content.trim().split(/\s+/).length);
      } else {
        setContent('');
        setWordCount(0);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      setContent('');
      setWordCount(0);
    }
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
      // Insert the AI response after the cursor and select it
      const cursor = editorRef.current.state.selection.main.to;
      const aiResponse = `\n\nAI Response:\n${data}\n\n`;
      const transaction = editorRef.current.state.update({
        changes: { from: cursor, insert: aiResponse },
        selection: { anchor: cursor + 2, head: cursor + aiResponse.length },
      });
      editorRef.current.dispatch(transaction);
    } catch (error) {
      console.error("Error sending AI request:", error);
    }
  };

  const getSelectedText = () => {
    if (editorRef.current) {
      const selection = editorRef.current.state.selection.main;
      return editorRef.current.state.sliceDoc(selection.from, selection.to);
    }
    return "";
  };

  useEffect(() => {
    const initializeNote = async () => {
      const searchParams = new URLSearchParams(location.search);
      let id = searchParams.get('id');
      if (!id) {
        id = localStorage.getItem('noteId') || uuidv4();
        navigate(`?id=${id}`, { replace: true });
      }
      setNoteId(id);
      await loadNote(id);
      localStorage.setItem('noteId', id);
    };

    initializeNote();
  }, [location, navigate]);

  useEffect(() => {
    const autoSave = setTimeout(() => {
      saveNote(content);
    }, 5000);

    return () => clearTimeout(autoSave);
  }, [content, noteId]);

  const copyUrlToClipboard = () => {
    const url = `${window.location.origin}?id=${noteId}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  return {
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
    sendAIRequest,
  };
};