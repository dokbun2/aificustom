import React from 'react';
import type { UnifiedSceneInfo, NormalizedPrompt } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface SidebarProps {
    sceneInfo: UnifiedSceneInfo;
    prompts: NormalizedPrompt[];
    activeShotId: string | null;
    onShotClick: (shotId: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sceneInfo, prompts, activeShotId, onShotClick, isOpen, onClose }) => {
    
    // Create a unique list of shots based on shot_id to prevent duplicates in navigation
    const uniqueShots = prompts.reduce<NormalizedPrompt[]>((acc, current) => {
        if (!acc.some(item => item.shot_id === current.shot_id)) {
            acc.push(current);
        }
        return acc;
    }, []);
    
    return (
        <aside 
            className={`absolute inset-y-0 left-0 z-40 w-[300px] transform transition-transform duration-300 ease-in-out bg-gray-900 border-r border-gray-800 p-6 flex flex-col
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:relative lg:translate-x-0 lg:flex-shrink-0`}
            aria-label="Sidebar"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Scene</h2>
                    <p className="text-lg font-bold text-teal-400 truncate" title={sceneInfo.scene_id}>{sceneInfo.scene_id}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">
                    <XCircleIcon />
                </button>
            </div>
            
            <p className="text-sm text-gray-300 mb-6">{sceneInfo.scene_title}</p>
            
            <nav className="flex-grow overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-gray-900 py-1">Shots</h3>
                <ul className="space-y-1">
                    {uniqueShots.map(prompt => (
                        <li key={prompt.shot_id}>
                            <a
                                href={`#${prompt.shot_id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onShotClick(prompt.shot_id);
                                }}
                                className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                                    activeShotId === prompt.shot_id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                }`}
                            >
                                <span className="font-bold">{prompt.shot_id}</span>
                                <span className="block text-xs text-gray-400 truncate">{prompt.image_title || prompt.image_id}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
