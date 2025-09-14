import React from 'react';
import { Menu, Home, FileJson, XCircle, Download, Film, Cable } from 'lucide-react';
import { ApiIcon } from '../icons/ApiIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface AppHeaderProps {
  studioMode: 'image' | 'video' | 'story' | 'audio' | null;
  fileName: string | null;
  error: string | null;
  apiKey: string | null;
  selectedModel: string | null;
  normalizedData: any;
  generatedAudioJson: any;
  onMenuClick: () => void;
  onGoHome: () => void;
  onUploadClick: () => void;
  onClearProject: () => void;
  onApiConfigClick: () => void;
  onGenerateVideoPrompts: () => void;
  onGenerateAudioPrompts: () => void;
  onDownloadJson: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  studioMode,
  fileName,
  error,
  apiKey,
  selectedModel,
  normalizedData,
  generatedAudioJson,
  onMenuClick,
  onGoHome,
  onUploadClick,
  onClearProject,
  onApiConfigClick,
  onGenerateVideoPrompts,
  onGenerateAudioPrompts,
  onDownloadJson,
}) => {
  const isFileUploaded = fileName && !error && (normalizedData || generatedAudioJson);
  const canGenerateVideo = studioMode === 'image' && apiKey && selectedModel;
  const canGenerateAudio = (studioMode === 'image' || studioMode === 'video') && apiKey && selectedModel;

  return (
    <header className="z-30 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="text-gray-400 hover:text-teal-400 transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={onGoHome}
          className="text-gray-400 hover:text-teal-400 transition-colors focus:outline-none"
          aria-label="Go home"
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="h-6 w-px bg-gray-700" />

        <h1 className="text-lg sm:text-xl font-bold text-white">
          <span className="text-teal-400">AIFI</span>
          <span className="text-gray-300">CUT</span>
          {studioMode && (
            <span className="ml-2 text-sm sm:text-base text-gray-400">
              - {studioMode === 'image' ? '이미지' : studioMode === 'video' ? '영상' : studioMode === 'audio' ? '오디오' : '스토리'} 스튜디오
            </span>
          )}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {studioMode && (
          <>
            <button
              onClick={onUploadClick}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              <FileJson className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">JSON업로드</span>
              <span className="sm:hidden">업로드</span>
            </button>

            {isFileUploaded && (
              <>
                <button
                  onClick={onClearProject}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">파일 초기화</span>
                  <span className="sm:hidden">초기화</span>
                </button>

                {studioMode === 'audio' && generatedAudioJson && (
                  <button
                    onClick={onDownloadJson}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">JSON 다운로드</span>
                    <span className="sm:hidden">다운로드</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={onApiConfigClick}
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                apiKey && selectedModel
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <ApiIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                {apiKey && selectedModel ? 'API 연결됨' : 'API 설정'}
              </span>
              <span className="sm:hidden">API</span>
            </button>

            {canGenerateVideo && (
              <button
                onClick={onGenerateVideoPrompts}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">영상 프롬프트 생성</span>
                <span className="sm:hidden">영상생성</span>
              </button>
            )}

            {canGenerateAudio && (
              <button
                onClick={onGenerateAudioPrompts}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Cable className="w-4 h-4 sm:w-5 sm:h-5" />
                <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">오디오 프롬프트 생성</span>
                <span className="sm:hidden">오디오생성</span>
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
};