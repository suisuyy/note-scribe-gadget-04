import React from 'react';
import { X } from 'lucide-react';

const Notification = ({ id, message, onClose }) => {
  return (
    <div 
      className="flex items-start justify-between bg-blue-500 text-white px-4 py-2 rounded shadow-lg mb-2 max-w-[500px] whitespace-pre-wrap cursor-default"
      onClick={(e) => e.stopPropagation()} // Prevent clicking the notification from doing anything
    >
      <span>{message}</span>
      <button 
        onClick={() => onClose(id)} 
        className="ml-4 flex-shrink-0 focus:outline-none"
        aria-label="Close Notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Notification;