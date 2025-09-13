import React, { useEffect, useRef, RefObject, useState } from 'react';
import type { NormalizedData, NormalizedPrompt, ShotGroup } from '../types';
import ShotCard from './ShotCard';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface PromptViewerProps {
  data: NormalizedData;
  onVisibleShotChange: (shotId: string | null) => void;
  scrollContainerRef: RefObject<HTMLElement>;
  onEditPrompt: (promptData: NormalizedPrompt) => void;
}

const InfoItem: React.FC<{ label: string; value: string | number | string[] }> = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center">
        <dt className="sm:w-1/3 font-semibold text-gray-400">{label}</dt>
        <dd className="mt-1 sm:mt-0 sm:w-2/3 text-gray-200">
            {Array.isArray(value) ? value.join(', ') : value}
        </dd>
    </div>
);

const PromptViewer: React.FC<PromptViewerProps> = ({ data, onVisibleShotChange, scrollContainerRef, onEditPrompt }) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const [isSceneInfoOpen, setIsSceneInfoOpen] = useState(false);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisibleShotChange(entry.target.id);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '-40% 0px -60% 0px', // Trigger when a shot is in the middle 20% of the viewport
        threshold: 0,
      }
    );

    const shotElements = document.querySelectorAll('[data-shot-card]');
    shotElements.forEach((el) => observer.current?.observe(el));

    return () => {
      observer.current?.disconnect();
    };
  }, [data.prompts, onVisibleShotChange, scrollContainerRef]);

  // Group prompts by shot_id to handle multiple plans per shot
  const groupedPrompts = data.prompts.reduce<ShotGroup[]>((acc, prompt) => {
    let group = acc.find(g => g.shot_id === prompt.shot_id);
    if (!group) {
      group = { 
        shot_id: prompt.shot_id, 
        shot_description: prompt.shot_description, 
        prompts: [] 
      };
      acc.push(group);
    }
    group.prompts.push(prompt);
    return acc;
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
        <section className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <button 
              onClick={() => setIsSceneInfoOpen(!isSceneInfoOpen)}
              className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-800/60 transition-colors"
              aria-expanded={isSceneInfoOpen}
            >
              <h2 className="text-2xl font-bold text-teal-400">{data.scene_info.scene_title}</h2>
              <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isSceneInfoOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSceneInfoOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-6 pb-6 pt-2">
                <dl className="space-y-3 text-sm">
                    <InfoItem label="Scene ID" value={data.scene_info.scene_id} />
                    <InfoItem label="Processed Shots" value={data.scene_info.processed_shots} />
                    <InfoItem label="AI Tools Used" value={data.scene_info.selected_ai_tools} />
                    <InfoItem label="Version" value={data.version} />
                    <InfoItem label="Timestamp" value={new Date(data.timestamp).toLocaleString()} />
                </dl>
              </div>
            </div>
        </section>

        <section className="space-y-6">
            {groupedPrompts.map((group) => (
                <ShotCard key={group.shot_id} shotGroup={group} onEditPrompt={onEditPrompt} />
            ))}
        </section>
    </div>
  );
};

export default PromptViewer;