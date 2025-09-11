import React, { useState, useMemo } from 'react';
import type { ShotGroup, NormalizedPrompt } from '../types';
import PromptSetViewer from './PromptSetViewer';

interface ShotCardProps {
  shotGroup: ShotGroup;
}

const ShotCard: React.FC<ShotCardProps> = ({ shotGroup }) => {
  // Group prompts by plan (e.g., A, B, C from image_id)
  const plans = useMemo(() => {
    return shotGroup.prompts.reduce<Record<string, NormalizedPrompt[]>>((acc, prompt) => {
      const parts = prompt.image_id.split('-');
      // Assuming format is SHOT-PLAN-INDEX, e.g., S01.01-A-01
      const planKey = parts.length > 1 ? parts[1] : 'A'; 
      if (!acc[planKey]) {
        acc[planKey] = [];
      }
      acc[planKey].push(prompt);
      return acc;
    }, {});
  }, [shotGroup.prompts]);
  
  const planKeys = Object.keys(plans).sort();
  const [activePlan, setActivePlan] = useState<string>(planKeys[0]);

  return (
    <div 
      id={shotGroup.shot_id}
      data-shot-card 
      className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden scroll-mt-20"
    >
      <header className="bg-gray-800/50 p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <h3 className="text-xl font-bold text-white">{shotGroup.shot_id}</h3>
          {shotGroup.shot_description && <p className="text-sm text-gray-400 mt-1">{shotGroup.shot_description}</p>}
        </div>
        
        {/* Plan Tabs */}
        {planKeys.length > 1 && (
          <div className="mt-3 sm:mt-0 flex-shrink-0">
            <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-lg">
              {planKeys.map((planKey) => (
                <button
                  key={planKey}
                  onClick={() => setActivePlan(planKey)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activePlan === planKey
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  Plan {planKey}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="p-4 sm:p-6 space-y-4">
        {plans[activePlan]?.map(promptData => (
          <PromptSetViewer key={promptData.image_id} promptData={promptData} />
        ))}
      </div>
    </div>
  );
};

export default ShotCard;
