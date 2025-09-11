import React, { useState } from 'react';
import type { NormalizedPrompt, Prompts, ImagePrompts } from '../types';
import PromptDetail from './PromptDetail';
import CodeBlock from './CodeBlock';

interface PromptSetViewerProps {
  promptData: NormalizedPrompt;
}

const PromptSetViewer: React.FC<PromptSetViewerProps> = ({ promptData }) => {
  const tabs = Object.keys(promptData.prompts).filter(key => {
    const value = promptData.prompts[key as keyof (Prompts | ImagePrompts)];
    // Filter out keys that point to empty strings, which is common for translated fields in image prompts
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    // For video prompts, the value is an object, so always include the tab
    return true;
  });
  
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  const activePromptSet = activeTab ? promptData.prompts[activeTab as keyof (Prompts | ImagePrompts)] : null;

  const formatTitle = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/ en$/, ' (English)')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const isImagePromptData = typeof activePromptSet === 'string';

  return (
    <div className="bg-gray-800/80 border border-gray-700/80 rounded-lg shadow-md overflow-hidden">
      <header className="bg-gray-700/30 p-3 flex flex-col sm:flex-row justify-between sm:items-center">
        <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-300 truncate">{promptData.image_id}</p>
            {promptData.image_title && <p className="text-xs text-gray-400 truncate" title={promptData.image_description}>{promptData.image_title}</p>}
        </div>
        {tabs.length > 0 && (
            <div className="mt-3 sm:mt-0 flex-shrink-0">
                <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-lg">
                    {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                        activeTab === tab
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-gray-300 hover:bg-gray-600/50'
                        }`}
                    >
                        {tab.toUpperCase()}
                    </button>
                    ))}
                </div>
            </div>
        )}
      </header>

      <div className="p-4 space-y-4">
        {activePromptSet && isImagePromptData && (
            <PromptDetail title={formatTitle(activeTab)} content={activePromptSet as string} />
        )}

        {activePromptSet && !isImagePromptData && typeof activePromptSet === 'object' && Object.entries(activePromptSet)
          .filter(([key]) => key !== 'settings')
          .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              const title = key === 'prompt_object_v6' ? 'Universal' : formatTitle(key);
              return <CodeBlock key={key} title={title} code={value} />;
            }
            if (typeof value === 'string' && value.trim() !== '') {
              return <PromptDetail key={key} title={formatTitle(key)} content={value} />;
            }
            return null;
        })}
      </div>
    </div>
  );
};

export default PromptSetViewer;