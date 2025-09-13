import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { AnyRootJsonData, NormalizedData, NormalizedPrompt, VideoRootJsonData, ImageRootJsonData, Prompts, PromptObjectV6, AudioPromptData } from './types';
import PromptViewer from './components/PromptViewer';
import Sidebar from './components/Sidebar';
import { UploadIcon } from './components/icons/UploadIcon';
import { FileJsonIcon } from './components/icons/FileJsonIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { MenuIcon } from './components/icons/MenuIcon';
import { HomeIcon } from './components/icons/HomeIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { FilmIcon } from './components/icons/FilmIcon';
import { VideoGenerationResponseSchema } from './lib/geminiVideoSchema';
import StudioSelection from './components/StudioSelection';
import PromptEditor from './components/PromptEditor';
import StoryGenerator from './components/StoryGenerator';
import AudioStudio from './components/AudioStudio';

const UploadPlaceholder: React.FC<{ studioMode: 'image' | 'video', onClick: () => void }> = ({ studioMode, onClick }) => {
  const studioName = studioMode === 'image' ? '이미지 스튜디오' : '영상 스튜디오';
  const uploadMessage = studioMode === 'image' 
    ? '이미지 프롬프트 JSON 파일을 업로드해주세요.' 
    : '영상 프롬프트 JSON 파일을 업로드해주세요.';

  return (
    <div onClick={onClick} className="h-full block cursor-pointer group">
      <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center animate-fade-in">
        <div className="block max-w-md p-8 border-2 border-dashed border-gray-700 rounded-xl transition-all duration-300 group-hover:border-teal-500 group-hover:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-300 mb-2">{studioName}</h2>
          <p>{uploadMessage}</p>
          <p className="mt-2 text-sm">
              {`이곳을 클릭하거나 헤더의 `}
              <span className="font-semibold text-blue-400">JSON업로드</span>
              {` 버튼을 사용하세요.`}
          </p>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [studioMode, setStudioMode] = useState<'image' | 'video' | 'story' | 'audio' | null>(null);
  const [normalizedData, setNormalizedData] = useState<NormalizedData | null>(null);
  const [rawImageJson, setRawImageJson] = useState<ImageRootJsonData | null>(null);
  const [rawVideoJson, setRawVideoJson] = useState<VideoRootJsonData | null>(null);
  const [rawJsonForAudio, setRawJsonForAudio] = useState<AnyRootJsonData | null>(null);
  const [generatedAudioJson, setGeneratedAudioJson] = useState<AudioPromptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeShotId, setActiveShotId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<NormalizedPrompt | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndSetData = useCallback((parsedData: AnyRootJsonData, newFileName: string) => {
    let dataToSet: NormalizedData | null = null;
    
    // Reset all data states first to ensure a clean slate for the new file
    setNormalizedData(null);
    setRawImageJson(null);
    setRawVideoJson(null);
    setRawJsonForAudio(null);
    setGeneratedAudioJson(null);

    const isVideoFile = 'video_prompts' in parsedData && Array.isArray(parsedData.video_prompts);
    const isImageFile = 'shots' in parsedData && Array.isArray(parsedData.shots);
    const isAudioFile = 'music_prompts' in parsedData && 'narration_script' in parsedData;

    if (isAudioFile) {
        const audioData = parsedData as AudioPromptData;
        setGeneratedAudioJson(audioData);
        setStudioMode('audio');
    } else if (isVideoFile) {
        const videoData = parsedData as VideoRootJsonData;
        setRawVideoJson(videoData);
        setRawJsonForAudio(videoData); // Set as source for new audio generation
        const normalizedPrompts: NormalizedPrompt[] = videoData.video_prompts.map(vp => ({
            shot_id: vp.shot_id,
            image_id: vp.image_id,
            prompts: vp.prompts,
            image_title: vp.image_reference?.title,
            image_description: vp.image_reference?.description,
        }));
        dataToSet = {
            scene_info: videoData.scene_info,
            prompts: normalizedPrompts,
            version: videoData.version,
            timestamp: videoData.timestamp,
        };
        setNormalizedData(dataToSet);
        setStudioMode('video');
    } else if (isImageFile) {
        const imageData = parsedData as ImageRootJsonData;
        setRawImageJson(imageData);
        setRawJsonForAudio(imageData); // Set as source for new audio generation
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
        setNormalizedData(dataToSet);
        setStudioMode('image');
    } else {
        setStudioMode(null);
        throw new Error(`Invalid JSON structure. The uploaded file is not a valid prompt file.`);
    }
    
    setFileName(newFileName);
    setError(null);

    if (dataToSet && dataToSet.prompts.length > 0) {
        setActiveShotId(dataToSet.prompts[0].shot_id);
    }
  }, []);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!studioMode || studioMode === 'story') {
        // Allow uploads from home screen if no studio is selected
        if(studioMode !== null && studioMode !== 'story') {
            setError("File uploads are disabled in this view.");
            event.target.value = '';
            return;
        }
    }
    
    setIsLoading(true);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File is not a valid text file.');
        const parsedData: AnyRootJsonData = JSON.parse(text);
        processAndSetData(parsedData, file.name);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to parse JSON file: ${message}`);
        setFileName(null);
        handleClearProject(); // Clear everything on parse error
        setStudioMode(null);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
        setFileName(null);
        setIsLoading(false);
    }
    reader.readAsText(file);
    
    event.target.value = '';
  }, [studioMode, processAndSetData]);

  const handleStoryGenerated = useCallback((imageJson: ImageRootJsonData, newFileName: string) => {
    try {
        setStudioMode('image'); // Go to image studio after generation
        processAndSetData(imageJson, newFileName);
    } catch (err) {
        const message = err instanceof Error ? `Failed to process generated JSON: ${err.message}` : 'An unknown error occurred while processing generated data.';
        setError(message);
        setFileName(null);
        setStudioMode('story');
    }
  }, [processAndSetData]);

  const handleDownloadJson = (type: 'image' | 'video' | 'audio') => {
    let data: AnyRootJsonData | null = null;
    let newFileName = fileName || 'data.json';
    let baseName = newFileName.replace(/\.json$/, '');


    if (type === 'image') {
        data = rawImageJson;
        newFileName = `${baseName}.json`;
    } else if (type === 'video') {
        data = rawVideoJson;
        newFileName = `${baseName}_video.json`;
    } else if (type === 'audio') {
        data = generatedAudioJson;
        newFileName = `${baseName}_audio.json`;
    }

    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateVideoPrompts = useCallback(async () => {
    if (!rawImageJson) {
      setError("No image JSON data is loaded to generate video prompts from.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
        if (!process.env.API_KEY) throw new Error("API key is not configured.");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const instruction = `You are an expert video prompt engineer. Your task is to convert the provided Stage 6 (Image Prompt) JSON into a Stage 7 (Video Prompt) JSON.
Follow the "AI Video Framework Stage 7 Guide v7.1" precisely.

1.  **Analyze**: Analyze the Stage 6 JSON, paying attention to characters, locations, actions, camera movements, and visual styles defined in the 'csv_data' for each image.
2.  **Core Module**: Create a \`core_module\` to ensure consistency. Extract character details and location baselines from the Stage 6 data.
3.  **Video Module**: For each image in the Stage 6 JSON, create a corresponding \`video_module\`. The \`global.description\` should be a cinematic summary of the action. The \`sequence\` should detail the motion based on the image description.
4.  **Hybrid Bridge**: Generate prompts for all specified AI tools (\`veo2\`, \`kling\`, \`luma\`). First, create the master \`prompt_object_v6\` for \`veo2\`. Then, derive the \`kling_structured_prompt\` and the simple \`prompt_en\` for \`luma\` from that master object to ensure directorial consistency.
5.  **Output**: The final output MUST be a single, valid JSON object that strictly adheres to the provided Stage 7 schema. Ensure all required fields, including \`image_reference\`, are populated correctly.

Here is the Stage 6 JSON data:
${JSON.stringify(rawImageJson, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: instruction,
            config: {
                responseMimeType: 'application/json',
                responseSchema: VideoGenerationResponseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const videoJsonData = JSON.parse(jsonStr) as VideoRootJsonData;

        // Transition to video studio with new data
        const newFileName = fileName?.replace('.json', '_video.json') || 'video_prompts.json';
        processAndSetData(videoJsonData, newFileName);


    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate video prompts: ${message}`);
    } finally {
        setIsLoading(false);
    }
  }, [rawImageJson, fileName, processAndSetData]);
  
  const handleAudioGenerated = (data: AudioPromptData) => {
    setGeneratedAudioJson(data);
  };

  const handleClearProject = () => {
    setNormalizedData(null);
    setRawImageJson(null);
    setRawVideoJson(null);
    setRawJsonForAudio(null);
    setGeneratedAudioJson(null);
    setError(null);
    setFileName(null);
    setActiveShotId(null);
    setIsSidebarOpen(false);
    setEditingPrompt(null);
    setStudioMode(null);
  };

  const handleGoHome = () => {
    setStudioMode(null);
    // Do NOT clear data, to allow switching between studios
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleShotClick = (shotId: string) => {
    setActiveShotId(shotId);
    const element = document.getElementById(shotId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsSidebarOpen(false);
  };
  
  const handleEditPrompt = (promptToEdit: NormalizedPrompt) => {
    setEditingPrompt(promptToEdit);
  };

  const handleCloseEditor = () => {
    setEditingPrompt(null);
  };

  const handleSavePrompt = (updatedPromptObject: PromptObjectV6) => {
    if (!editingPrompt || !normalizedData) return;

    const updatedPrompts = normalizedData.prompts.map(p => {
      if (p.image_id === editingPrompt.image_id) {
        const newP = JSON.parse(JSON.stringify(p));
        if (newP.prompts.veo2) {
          (newP.prompts as Prompts).veo2!.prompt_object_v6 = updatedPromptObject;
        }
        return newP;
      }
      return p;
    });

    setNormalizedData({
      ...normalizedData,
      prompts: updatedPrompts,
    });
    setEditingPrompt(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editingPrompt) {
          handleCloseEditor();
        } else {
          setIsSidebarOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingPrompt]);
  
  const showUploadButton = !isLoading && studioMode && studioMode !== 'story' && studioMode !== 'audio';

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="z-30 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
              {studioMode && (
                  <button onClick={handleGoHome} className="text-gray-300 hover:text-white transition-colors" aria-label="Home">
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
                    <button onClick={handleClearProject} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                      <XCircleIcon />
                    </button>
                  </div>
                )}

               {studioMode === 'image' && rawImageJson && (
                 <div className="flex items-center gap-2">
                    <button onClick={() => handleDownloadJson('image')} className="relative cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm">
                        <DownloadIcon />
                        <span>JSON 다운로드</span>
                    </button>
                    <button onClick={handleGenerateVideoPrompts} disabled={isLoading} className="relative cursor-pointer bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800/50 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm">
                         {isLoading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <FilmIcon />
                        )}
                        <span>{isLoading ? '생성 중...' : '영상 프롬프트 생성'}</span>
                    </button>
                 </div>
               )}
               
                {studioMode === 'video' && rawVideoJson && (
                    <button onClick={() => handleDownloadJson('video')} className="relative cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm">
                        <DownloadIcon />
                        <span>JSON 다운로드</span>
                    </button>
                )}
                
                {studioMode === 'audio' && generatedAudioJson && (
                    <button onClick={() => handleDownloadJson('audio')} className="relative cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm">
                        <DownloadIcon />
                        <span>JSON 다운로드</span>
                    </button>
                )}
              
               {showUploadButton && (
                 <label htmlFor="file-upload" className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm">
                    <UploadIcon />
                    <span>JSON업로드</span>
                 </label>
               )}

               <input ref={fileInputRef} id="file-upload" type="file" className="hidden" accept=".json" onChange={handleFileChange} />
          </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {normalizedData && (studioMode === 'image' || studioMode === 'video') && (
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
                    <button onClick={handleClearProject} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
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

            {studioMode === 'story' && !error && (
              <StoryGenerator onStoryGenerated={handleStoryGenerated} />
            )}

            {studioMode === 'audio' && !error && (
              <AudioStudio 
                onAudioGenerated={handleAudioGenerated}
                initialData={generatedAudioJson}
              />
            )}
            
            {(studioMode === 'image' || studioMode === 'video') && !normalizedData && !error && (
                <UploadPlaceholder studioMode={studioMode} onClick={handleUploadClick} />
            )}

            {normalizedData && (studioMode === 'image' || studioMode === 'video') && <PromptViewer data={normalizedData} onVisibleShotChange={setActiveShotId} scrollContainerRef={mainContentRef} onEditPrompt={handleEditPrompt} />}
        </main>
      </div>

      {editingPrompt && studioMode === 'video' && 'veo2' in editingPrompt.prompts && (
        <PromptEditor 
          promptData={editingPrompt} 
          onSave={handleSavePrompt}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
};

export default App;