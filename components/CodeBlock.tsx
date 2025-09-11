
import React, { useState } from 'react';

interface CodeBlockProps {
  title: string;
  code: object;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(code, null, 2)).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h4 className="text-sm font-semibold text-teal-400">{title}</h4>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-xs font-medium rounded-md transition-colors text-gray-300 bg-gray-700 hover:bg-gray-600"
        >
          {isCopied ? '복사됨!' : 'JSON 복사'}
        </button>
      </div>
      <pre className="p-4 text-xs text-gray-300 overflow-x-auto">
        <code>{JSON.stringify(code, null, 2)}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;