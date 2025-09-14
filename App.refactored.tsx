import React, { useState, useCallback, useRef } from 'react';
import type { NormalizedData, ImageRootJsonData, VideoRootJsonData, AudioPromptData, AnyRootJsonData } from './types';

// Import custom hooks
import { useFileManager } from './src/hooks/useFileManager';
import { useGeminiApi } from './src/hooks/useGeminiApi';

// Import services
import { FileService } from './src/services/fileService';

// Import components
import { AppHeader } from './src/components/layout/AppHeader';
import PromptViewer from './components/PromptViewer';
import Sidebar from './components/Sidebar';
import StudioSelection from './components/StudioSelection';
import PromptEditor from './components/PromptEditor';
import StoryGenerator from './components/StoryGenerator';
import AudioStudio from './components/AudioStudio';
import GeminiApiConfig from './components/GeminiApiConfig';

// Import utils
import { STUDIO_MODES, UI_MESSAGES } from './src/utils/constants';
import { detectJsonType } from './src/utils/jsonUtils';

const UploadPlaceholder: React.FC<{ studioMode: 'image' | 'video', onClick: () => void }> = ({ studioMode, onClick }) => {
  const studioName = studioMode === 'image' ? '이미지 스튜디오' : '영상 스튜디오';
  const uploadMessage = studioMode === 'image'
    ? UI_MESSAGES.UPLOAD_PROMPT.IMAGE
    : UI_MESSAGES.UPLOAD_PROMPT.VIDEO;

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
  // Studio state management
  const [studioMode, setStudioMode] = useState<'image' | 'video' | 'story' | 'audio' | null>(null);
  const [normalizedData, setNormalizedData] = useState<NormalizedData | null>(null);
  const [rawImageJson, setRawImageJson] = useState<ImageRootJsonData | null>(null);
  const [rawVideoJson, setRawVideoJson] = useState<VideoRootJsonData | null>(null);
  const [rawJsonForAudio, setRawJsonForAudio] = useState<AnyRootJsonData | null>(null);
  const [generatedAudioJson, setGeneratedAudioJson] = useState<AudioPromptData | null>(null);

  // UI state
  const [activeShotId, setActiveShotId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  // Use custom hooks
  const fileManager = useFileManager();
  const geminiApi = useGeminiApi();

  // Handle file upload and processing
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await fileManager.handleFileChange(event);
      const parsedData = await FileService.processJsonFile(file);
      const result = fileManager.processAndSetData(parsedData, file.name);

      // Apply the processed data to state
      setStudioMode(result.studioMode);
      setNormalizedData(result.normalizedData);
      setRawImageJson(result.rawImageJson);
      setRawVideoJson(result.rawVideoJson);
      setRawJsonForAudio(result.rawJsonForAudio);
      setGeneratedAudioJson(result.generatedAudioJson);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }, [fileManager]);

  // Handle clearing the project
  const handleClearProject = useCallback(() => {
    fileManager.handleClearProject();
    setStudioMode(null);
    setNormalizedData(null);
    setRawImageJson(null);
    setRawVideoJson(null);
    setRawJsonForAudio(null);
    setGeneratedAudioJson(null);
    setActiveShotId(null);
    setEditingPrompt(null);
  }, [fileManager]);

  // Handle going home
  const handleGoHome = useCallback(() => {
    handleClearProject();
  }, [handleClearProject]);

  // Handle studio selection
  const handleStudioSelect = useCallback((mode: 'image' | 'video' | 'story' | 'audio') => {
    setStudioMode(mode);
  }, []);

  // Handle video prompt generation
  const handleGenerateVideoPrompts = useCallback(async () => {
    if (!rawImageJson || !geminiApi.apiKey || !geminiApi.selectedModel) {
      fileManager.setError(UI_MESSAGES.ERROR.API_NOT_CONFIGURED);
      return;
    }

    fileManager.setIsLoading(true);
    fileManager.setError(null);

    try {
      const videoData = await geminiApi.generateVideoPrompts(rawImageJson);

      // Process the video data
      const result = fileManager.processAndSetData(videoData, 'generated_video_prompts.json');
      setStudioMode(result.studioMode);
      setNormalizedData(result.normalizedData);
      setRawVideoJson(result.rawVideoJson);
      setRawJsonForAudio(result.rawJsonForAudio);
    } catch (error) {
      fileManager.setError(UI_MESSAGES.ERROR.GENERATION_FAILED);
      console.error('Error generating video prompts:', error);
    } finally {
      fileManager.setIsLoading(false);
    }
  }, [rawImageJson, geminiApi, fileManager]);

  // Handle audio prompt generation (placeholder)
  const handleGenerateAudioPrompts = useCallback(async () => {
    // TODO: Implement audio generation
    console.log('Audio generation not yet implemented');
  }, []);

  // Handle JSON download
  const handleDownloadJson = useCallback(() => {
    if (generatedAudioJson) {
      FileService.downloadJson(generatedAudioJson, 'audio_prompts.json');
    }
  }, [generatedAudioJson]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileManager.fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* App Header */}
      <AppHeader
        studioMode={studioMode}
        fileName={fileManager.fileName}
        error={fileManager.error}
        apiKey={geminiApi.apiKey}
        selectedModel={geminiApi.selectedModel}
        normalizedData={normalizedData}
        generatedAudioJson={generatedAudioJson}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onGoHome={handleGoHome}
        onUploadClick={() => fileManager.fileInputRef.current?.click()}
        onClearProject={handleClearProject}
        onApiConfigClick={() => geminiApi.setIsApiConfigOpen(true)}
        onGenerateVideoPrompts={handleGenerateVideoPrompts}
        onGenerateAudioPrompts={handleGenerateAudioPrompts}
        onDownloadJson={handleDownloadJson}
      />

      {/* Main Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        {studioMode && normalizedData && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            prompts={normalizedData.prompts}
            activePromptId={activeShotId}
            onPromptSelect={(shotId) => {
              setActiveShotId(shotId);
              if (mainContentRef.current) {
                const element = mainContentRef.current.querySelector(`[data-shot-id="${shotId}"]`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
            }}
          />
        )}

        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {!studioMode ? (
            <StudioSelection onSelectStudio={handleStudioSelect} />
          ) : (
            <>
              {/* Error Display */}
              {fileManager.error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
                  {fileManager.error}
                </div>
              )}

              {/* Loading State */}
              {fileManager.isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-400">Loading...</div>
                </div>
              )}

              {/* Studio Content */}
              {!fileManager.isLoading && (
                <>
                  {studioMode === 'story' && (
                    <StoryGenerator
                      rawImageJson={rawImageJson}
                      rawVideoJson={rawVideoJson}
                      apiKey={geminiApi.apiKey}
                      selectedModel={geminiApi.selectedModel}
                    />
                  )}

                  {studioMode === 'audio' && generatedAudioJson && (
                    <AudioStudio audioData={generatedAudioJson} />
                  )}

                  {(studioMode === 'image' || studioMode === 'video') && !normalizedData && (
                    <UploadPlaceholder
                      studioMode={studioMode}
                      onClick={() => fileManager.fileInputRef.current?.click()}
                    />
                  )}

                  {(studioMode === 'image' || studioMode === 'video') && normalizedData && (
                    <PromptViewer
                      normalizedData={normalizedData}
                      activeShotId={activeShotId}
                      onEditPrompt={setEditingPrompt}
                      studioMode={studioMode}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      {geminiApi.isApiConfigOpen && (
        <GeminiApiConfig
          isOpen={geminiApi.isApiConfigOpen}
          onClose={() => geminiApi.setIsApiConfigOpen(false)}
          onApiConnected={geminiApi.handleApiConnected}
          initialApiKey={geminiApi.apiKey}
          initialModel={geminiApi.selectedModel}
        />
      )}

      {editingPrompt && (
        <PromptEditor
          prompt={editingPrompt}
          onClose={() => setEditingPrompt(null)}
          onSave={(updatedPrompt) => {
            // TODO: Implement prompt update logic
            setEditingPrompt(null);
          }}
        />
      )}
    </div>
  );
};

export default App;