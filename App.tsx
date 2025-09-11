import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import type { RootJsonData } from './types';
import PromptViewer from './components/PromptViewer';
import Sidebar from './components/Sidebar';
import { UploadIcon } from './components/icons/UploadIcon';
import { FileJsonIcon } from './components/icons/FileJsonIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { MenuIcon } from './components/icons/MenuIcon';

const App: React.FC = () => {
  const [jsonData, setJsonData] = useState<RootJsonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeShotId, setActiveShotId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement | null>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearData();
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File is not a valid text file.');
        }
        const parsedData: RootJsonData = JSON.parse(text);
        if (!parsedData.video_prompts || !Array.isArray(parsedData.video_prompts)) {
            throw new Error('Invalid JSON structure: "video_prompts" array is missing.');
        }
        setJsonData(parsedData);
        if (parsedData.video_prompts.length > 0) {
            setActiveShotId(parsedData.video_prompts[0].shot_id);
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
  }, []);

  const clearData = () => {
    setJsonData(null);
    setError(null);
    setFileName(null);
    setActiveShotId(null);
    setIsSidebarOpen(false);
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
              {jsonData && (
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
        {jsonData && (
          <>
              <Sidebar 
                  sceneInfo={jsonData.scene_info}
                  videoPrompts={jsonData.video_prompts}
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

            {!jsonData && !error && !fileName && (
            <div className="text-center text-gray-500 mt-12">
                <p>Upload a file to get started.</p>
            </div>
            )}

            {jsonData && <PromptViewer data={jsonData} onVisibleShotChange={setActiveShotId} scrollContainerRef={mainContentRef} />}
        </main>
      </div>
    </div>
  );
};

export default App;