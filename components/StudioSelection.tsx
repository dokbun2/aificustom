import React from 'react';
import { ImageIcon } from './icons/ImageIcon';
import { VideoIcon } from './icons/VideoIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MusicNoteIcon } from './icons/MusicNoteIcon';

interface StudioSelectionProps {
  onSelectStudio: (mode: 'image' | 'video' | 'story' | 'audio') => void;
}

const StudioCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}> = ({ icon, title, description, onClick, className }) => (
  <button
    onClick={onClick}
    className={`w-full h-80 p-6 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:bg-gray-800/80 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-teal-500 flex flex-col items-center justify-start ${className}`}
  >
    <div className="flex-grow flex flex-col justify-center items-center">
      {icon}
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    </div>
    <p className="text-gray-400 text-sm flex-shrink-0 mt-4">{description}</p>
  </button>
);


const StudioSelection: React.FC<StudioSelectionProps> = ({ onSelectStudio }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-2">환영합니다</h2>
        <p className="text-gray-400 text-lg mb-12">작업을 시작할 스튜디오를 선택하세요.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
            <StudioCard
                icon={<SparklesIcon />}
                title="AI 스토리 생성"
                description="아이디어를 입력하여 이미지와 오디오 프롬프트를 생성합니다."
                onClick={() => onSelectStudio('story')}
            />
            <StudioCard
                icon={<ImageIcon />}
                title="이미지 스튜디오"
                description="이미지 프롬프트 JSON 파일을 시각화하고 수정합니다."
                onClick={() => onSelectStudio('image')}
            />
            <StudioCard
                icon={<VideoIcon />}
                title="영상 스튜디오"
                description="영상 프롬프트 JSON 파일을 분석하고 관리합니다."
                onClick={() => onSelectStudio('video')}
            />
             <StudioCard
                icon={<MusicNoteIcon />}
                title="오디오 스튜디오"
                description="생성된 음악 프롬프트와 가사를 확인합니다."
                onClick={() => onSelectStudio('audio')}
            />
        </div>
    </div>
  );
};

export default StudioSelection;