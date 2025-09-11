
import React, { useState } from 'react';
import type { VideoPrompt, Prompts } from '../types';
import PromptDetail from './PromptDetail';
import CodeBlock from './CodeBlock';

interface PromptSetViewerProps {
  promptData: VideoPrompt;
}

const PromptSetViewer: React.FC<PromptSetViewerProps> = ({ promptData }) => {
  const tabs = Object.keys(promptData.prompts);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const activePromptSet = promptData.prompts[activeTab as keyof Prompts];

  const formatTitle = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/ en$/, ' (English)')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-gray-800/80 border border-gray-700/80 rounded-lg shadow-md overflow-hidden">
      <header className="bg-gray-700/30 p-3 flex flex-col sm:flex-row justify-between sm:items-center">
        <p className="text-sm font-semibold text-gray-300">{promptData.image_id}</p>
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
      </header>

      <div className="p-4 space-y-4">
        {activePromptSet && Object.entries(activePromptSet)
          .filter(([key]) => key !== 'settings' && key !== 'prompt_object_v6')
          .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              return <CodeBlock key={key} title={formatTitle(key)} code={value} />;
            }
            if (typeof value === 'string') {
              return <PromptDetail key={key} title={formatTitle(key)} content={value} />;
            }
            return null;
        })}
      </div>
    </div>
  );
};

export default PromptSetViewer;
