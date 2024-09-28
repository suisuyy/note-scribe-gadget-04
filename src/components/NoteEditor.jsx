import React from 'react';
import { Editor } from './Editor';

export const NoteEditor = ({ content, renderMarkdown, darkMode, fontSize, showLineNumbers, handleChange, editorRef }) => {
  return (
    <Editor
      content={content}
      renderMarkdown={renderMarkdown}
      darkMode={darkMode}
      fontSize={fontSize}
      showLineNumbers={showLineNumbers}
      handleChange={handleChange}
      editorRef={editorRef}
    />
  );
};