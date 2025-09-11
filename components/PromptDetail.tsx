
import React, { useState } from 'react';

interface PromptDetailProps {
  title: string;
  content: string;
}

const PromptDetail: React.FC<PromptDetailProps> = ({ title, content }) => {
  const [isCopied, setIsCopied] = useState(false);

  // The titles are formatted in ShotCard.tsx.
  // This ensures the button only shows for specific, copyable text fields.
  const showCopyButton = title === 'Prompt (English)' || title === 'Kling Structured Prompt';

  const handleCopy = () => {
    if (!navigator.clipboard) return; // Safeguard for older browsers
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error("Failed to copy text: ", err)
    });
  };

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-teal-400">{title}</h4>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs font-medium rounded-md transition-colors text-gray-300 bg-gray-700 hover:bg-gray-600 flex-shrink-0 ml-4"
            aria-label={`Copy ${title}`}
          >
            {isCopied ? '복사됨!' : '복사'}
          </button>
        )}
      </div>
      <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm">{content}</p>
    </div>
  );
};

export default PromptDetail;