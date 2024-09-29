import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const Notification = ({ id, message, onClose, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    onClick(id);
  };

  return (
    <div 
      className={`flex flex-col bg-blue-500 text-white px-4 py-2 rounded shadow-lg mb-2 max-w-[500px] transition-all duration-300 ease-in-out ${isExpanded ? 'h-[500px]' : 'h-[100px]'}`}
      onClick={toggleExpand}
    >
      <div className="flex items-start justify-between">
        <div className="flex-grow overflow-hidden">
          <div className={`whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-4'}`}>
            {message}
          </div>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose(id);
          }} 
          className="ml-4 flex-shrink-0 focus:outline-none"
          aria-label="Close Notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex justify-center mt-2">
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </div>
  );
};

export default Notification;