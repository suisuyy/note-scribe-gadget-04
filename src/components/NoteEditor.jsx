import React, { useEffect } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { lineNumbers } from "@codemirror/view"; // Ensure lineNumbers is imported
import { StreamLanguage } from "@codemirror/language";
import ReactMarkdown from "react-markdown";

const formatDateTime = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const NoteEditor = ({ content, renderMarkdown, darkMode, fontSize, showLineNumbers, handleChange, editorRef }) => {
  const aiResponseExtension = StreamLanguage.define({
    token(stream) {
      if (stream.match(/AI Response \(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}\):/, false)) {
        stream.skipToEnd();
        return "ai-response";
      }
      stream.next();
      return null;
    }
  });

  const getEditorExtensions = () => {
    const extensions = [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
      aiResponseExtension,
      EditorView.theme({
        ".cm-line.cm-ai-response": { // Updated selector for specificity
          backgroundColor: "#e6f3ff",
        },
      }),
    ];

    if (showLineNumbers) {
      extensions.push(lineNumbers()); // Conditionally add lineNumbers
    }

    return extensions;
  };

  useEffect(() => {
    if (editorRef.current && EditorView.reconfigure) {
      const view = editorRef.current;
      view.dispatch({
        effects: EditorView.reconfigure.of(getEditorExtensions())
      });
    }
  }, [showLineNumbers]);

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

  return (
    <div className="h-full w-full">
      {renderMarkdown ? (
        <div className="prose max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="h-full w-full p-0">
          <CodeMirror
            value={content}
            height="100%"
            extensions={getEditorExtensions()}
            onChange={handleChange}
            theme={darkMode ? "dark" : "light"}
            onCreateEditor={(view) => {
              editorRef.current = view;
            }}
            style={{ fontSize: `${fontSize}px`, padding: 0 }}
          />
        </div>
      )}
    </div>
  );
};