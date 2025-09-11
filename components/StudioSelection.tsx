import React from 'react';
import { ImageIcon } from './icons/ImageIcon';
import { VideoIcon } from './icons/VideoIcon';

interface StudioSelectionProps {
  onSelectStudio: (mode: 'image' | 'video') => void;
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
    className={`w-full max-w-sm p-8 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:bg-gray-800/80 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-teal-500 ${className}`}
  >
    {icon}
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </button>
);


const StudioSelection: React.FC<StudioSelectionProps> = ({ onSelectStudio }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-2">환영합니다</h2>
        <p className="text-gray-400 text-lg mb-12">작업을 시작할 스튜디오를 선택하세요.</p>
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center max-w-4xl">
            <StudioCard
                icon={<ImageIcon />}
                title="이미지 스튜디오"
                description="이미지 프롬프트 JSON 파일을 업로드하고 시각화합니다."
                onClick={() => onSelectStudio('image')}
            />
            <StudioCard
                icon={<VideoIcon />}
                title="영상 스튜디오"
                description="영상 프롬프트 JSON 파일을 업로드하고 분석합니다."
                onClick={() => onSelectStudio('video')}
            />
        </div>
    </div>
  );
};

export default StudioSelection;