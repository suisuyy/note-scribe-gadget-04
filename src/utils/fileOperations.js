export const downloadFile = (content, noteId) => {
  const element = document.createElement("a");
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = `note-${noteId}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const openFile = (fileInputRef) => {
  fileInputRef.current?.click();
};

export const shareNote = (noteId) => {
  const shareUrl = `${window.location.origin}?id=${noteId}`;
  navigator.clipboard.writeText(shareUrl);
  console.log('Share URL copied to clipboard!');
};