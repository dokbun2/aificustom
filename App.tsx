
import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import type { AnyRootJsonData, NormalizedData, NormalizedPrompt, VideoRootJsonData, ImageRootJsonData } from './types';
import PromptViewer from './components/PromptViewer';
import Sidebar from './components/Sidebar';
import { UploadIcon } from './components/icons/UploadIcon';
import { FileJsonIcon } from './components/icons/FileJsonIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { MenuIcon } from './components/icons/MenuIcon';
import { HomeIcon } from './components/icons/HomeIcon';
import StudioSelection from './components/StudioSelection';

const UploadPlaceholder: React.FC<{ studioMode: 'image' | 'video' }> = ({ studioMode }) => {
  const isImageMode = studioMode === 'image';
  const studioName = isImageMode ? '이미지 스튜디오' : '영상 스튜디오';
  const uploadMessage = isImageMode ? '이미지 프롬프트 JSON 파일을 업로드해주세요.' : '영상 프롬프트 JSON 파일을 업로드해주세요.';

  return (
    <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center animate-fade-in">
      <label htmlFor="file-upload" className="block max-w-md p-8 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer transition-all duration-300 hover:border-teal-500 hover:bg-gray-900/50 hover:shadow-lg">
        <h2 className="text-xl font-bold text-gray-300 mb-2">{studioName}</h2>
        <p>{uploadMessage}</p>
        <p className="mt-2 text-sm">
            {`이곳을 클릭하거나 헤더의 `}
            <span className="font-semibold text-blue-400">JSON업로드</span>
            {` 버튼을 사용하세요.`}
        </p>
      </label>
    </div>
  );
};


const App: React.FC = () => {
  const [studioMode, setStudioMode] = useState<'image' | 'video' | null>(null);
  const [normalizedData, setNormalizedData] = useState<NormalizedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeShotId, setActiveShotId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement | null>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (!studioMode) {
      setError("Please select a studio (Image or Video) before uploading a file.");
      event.target.value = ''; // Reset file input
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous data for new upload, but keep studio mode
    setNormalizedData(null);
    setError(null);
    setFileName(file.name);
    setActiveShotId(null);
    setIsSidebarOpen(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File is not a valid text file.');
        }
        const parsedData: AnyRootJsonData = JSON.parse(text);

        let dataToSet: NormalizedData | null = null;
        
        const isVideoFile = 'video_prompts' in parsedData && Array.isArray(parsedData.video_prompts);
        const isImageFile = 'shots' in parsedData && Array.isArray(parsedData.shots);

        if (studioMode === 'video' && isVideoFile) {
            const videoData = parsedData as VideoRootJsonData;
            dataToSet = {
                scene_info: videoData.scene_info,
                prompts: videoData.video_prompts,
                version: videoData.version,
                timestamp: videoData.timestamp,
            };
        } else if (studioMode === 'image' && isImageFile) {
            const imageData = parsedData as ImageRootJsonData;
            const normalizedPrompts: NormalizedPrompt[] = imageData.shots.flatMap(shot =>
                shot.images.map(image => ({
                    shot_id: shot.shot_id,
                    image_id: image.image_id,
                    prompts: image.prompts,
                    shot_description: shot.shot_description,
                    image_title: image.image_title,
                    image_description: image.image_description,
                    csv_data: image.csv_data,
                }))
            );
            dataToSet = {
                scene_info: {
                    scene_id: imageData.scene_info.scene_id,
                    scene_title: imageData.shots[0]?.shot_description || imageData.scene_info.scene_id,
                    processed_shots: imageData.scene_info.shot_count,
                    processed_images: imageData.scene_info.total_images,
                    selected_ai_tools: imageData.generation_settings.selected_ai_tools,
                },
                prompts: normalizedPrompts,
                version: imageData.version,
                timestamp: imageData.timestamp,
            };
        } else {
            throw new Error(`Invalid JSON structure. The uploaded file is not a valid ${studioMode} prompt file.`);
        }

        setNormalizedData(dataToSet);
        if (dataToSet && dataToSet.prompts.length > 0) {
            setActiveShotId(dataToSet.prompts[0].shot_id);
        }

      } catch (err) {
        let message = 'An unknown error occurred.';
        if (err instanceof Error) {
            message = `Failed to parse JSON file: ${err.message}`;
        }
        setError(message);
        setFileName(null);
      }
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
        setFileName(null);
    }
    reader.readAsText(file);
    
    event.target.value = '';
  }, [studioMode]);

  const clearData = () => {
    setNormalizedData(null);
    setError(null);
    setFileName(null);
    setActiveShotId(null);
    setIsSidebarOpen(false);
    setStudioMode(null); // Reset to studio selection
  };

  const handleShotClick = (shotId: string) => {
    setActiveShotId(shotId);
    const element = document.getElementById(shotId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsSidebarOpen(false); // Close sidebar on selection
  };
  
  // Close sidebar on escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="z-30 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
              {studioMode && (
                  <button onClick={clearData} className="text-gray-300 hover:text-white transition-colors" aria-label="Home">
                      <HomeIcon />
                  </button>
              )}
              {normalizedData && (
                  <button onClick={() => setIsSidebarOpen(true)} className="text-gray-300 hover:text-white lg:hidden">
                      <MenuIcon />
                  </button>
              )}
              <h1 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 whitespace-nowrap">
                  AIFI 커스텀영상만들기
              </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
               {fileName && !error && (
                  <div className="hidden sm:flex items-center gap-2 overflow-hidden bg-gray-700/50 p-2 rounded-lg">
                    <FileJsonIcon />
                    <span className="font-medium text-gray-200 truncate text-sm max-w-[120px]">{fileName}</span>
                    <button onClick={clearData} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                      <XCircleIcon />
                    </button>
                  </div>
                )}
               <label htmlFor="file-upload" className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm">
                  <UploadIcon />
                  <span>JSON업로드</span>
               </label>
               <input id="file-upload" type="file" className="hidden" accept=".json" onChange={handleFileChange} />
          </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {normalizedData && studioMode && (
          <>
              <Sidebar 
                  sceneInfo={normalizedData.scene_info}
                  prompts={normalizedData.prompts}
                  activeShotId={activeShotId}
                  onShotClick={handleShotClick}
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
              />
              {isSidebarOpen && (
                  <div 
                      onClick={() => setIsSidebarOpen(false)} 
                      className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                      aria-hidden="true"
                  ></div>
              )}
          </>
        )}

        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {fileName && !error && (
                <div className="sm:hidden mb-4 flex items-center gap-3 overflow-hidden bg-gray-700/50 p-3 rounded-lg w-full justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                    <FileJsonIcon />
                    <span className="font-medium text-gray-200 truncate text-sm">{fileName}</span>
                    </div>
                    <button onClick={clearData} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                    <XCircleIcon />
                    </button>
                </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative animate-fade-in" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {!studioMode && !error && (
                <StudioSelection onSelectStudio={setStudioMode} />
            )}
            
            {studioMode && !normalizedData && !error && (
                <UploadPlaceholder studioMode={studioMode} />
            )}

            {normalizedData && <PromptViewer data={normalizedData} onVisibleShotChange={setActiveShotId} scrollContainerRef={mainContentRef} />}
        </main>
      </div>
    </div>
  );
};

export default App;
