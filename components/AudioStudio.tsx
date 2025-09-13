import React, { useState, useCallback, useMemo, ChangeEvent, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AudioPromptData, ImageRootJsonData } from '../types';
import { AudioGenerationResponseSchema } from '../lib/geminiAudioSchema';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import PromptDetail from './PromptDetail';
import { UploadIcon } from './icons/UploadIcon';
import { FileJsonIcon } from './icons/FileJsonIcon';
import { XCircleIcon } from './icons/XCircleIcon';


interface AudioStudioProps {
  onAudioGenerated: (data: AudioPromptData) => void;
  initialData?: AudioPromptData | null;
}

const AudioStudio: React.FC<AudioStudioProps> = ({ onAudioGenerated, initialData = null }) => {
  const [stage6File, setStage6File] = useState<File | null>(null);
  const [stage6Json, setStage6Json] = useState<ImageRootJsonData | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<AudioPromptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  useEffect(() => {
    if (initialData) {
        setGeneratedAudio(initialData);
        setStage6File(null);
        setStage6Json(null);
    }
  }, [initialData]);

  const handleStage6Upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            if (!text) throw new Error("File is empty or could not be read.");
            const parsed = JSON.parse(text);

            if ('shots' in parsed && Array.isArray(parsed.shots)) {
                setStage6File(file);
                setStage6Json(parsed as ImageRootJsonData);
                setGeneratedAudio(null); // Switch to generation mode
            } else {
                throw new Error("잘못된 Stage 6 파일입니다. 'shots' 배열이 포함된 유효한 JSON 파일을 업로드하세요.");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
            setError(`파일 처리 실패: ${message}`);
            setStage6File(null);
            setStage6Json(null);
        }
    };
    reader.onerror = () => setError(`파일을 읽지 못했습니다.`);
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleRestoreUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            if (!text) throw new Error("File is empty or could not be read.");
            const parsed = JSON.parse(text);

            if ('music_prompts' in parsed && 'narration_script' in parsed) {
                const audioData = parsed as AudioPromptData;
                setGeneratedAudio(audioData);
                onAudioGenerated(audioData); // Notify parent
                setStage6File(null);
                setStage6Json(null);
            } else {
                throw new Error("잘못된 오디오 프롬프트 파일입니다. 'music_prompts'와 'narration_script'가 포함된 파일을 업로드하세요.");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
            setError(`파일 처리 실패: ${message}`);
        }
    };
    reader.onerror = () => setError(`파일을 읽지 못했습니다.`);
    reader.readAsText(file);
    event.target.value = '';
  };


  const sceneTitle = useMemo(() => {
    if (generatedAudio) return "오디오 프롬프트";
    if (!stage6Json) return "제목 없음";
    return stage6Json.shots?.[0]?.shot_description || stage6Json.scene_info?.scene_id || '제목 없음';
  }, [stage6Json, generatedAudio]);

  const handleGenerate = useCallback(async () => {
    if (!stage6Json) {
      setError('Please upload the Stage 6 JSON file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedAudio(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const instruction = `You are an expert composer and screenwriter. Based on the provided Stage 6 (Visual Storyboard) JSON file, generate audio prompts. The desired language for lyrics and narration is ${language === 'ko' ? 'Korean' : 'English'}.

**Stage 6 (Visual Descriptions & Style):**
${JSON.stringify(stage6Json, null, 2)}

Your task is to infer the story and dialogue from the visual descriptions and generate a valid JSON object with two main parts:
1.  \`music_prompts\`:
    *   \`description\`: A detailed music style description in ENGLISH, suitable for a music AI like Suno. Synthesize the mood and genre from the visual information in the Stage 6 file.
    *   \`lyrics\`: Create original song lyrics in the specified language (${language}) that capture the story's theme. Since there is no script, you must imagine the emotional core of the story. Include markers like [Verse 1], [Chorus].
2.  \`narration_script\`: Create a complete narration script in the specified language (${language}) that can be read over the scenes. Describe the actions and unspoken thoughts of the characters based on the visual cues in the Stage 6 file.

The final output MUST be a single, valid JSON object strictly following the provided schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: instruction,
        config: {
          responseMimeType: 'application/json',
          responseSchema: AudioGenerationResponseSchema,
        }
      });

      const jsonStr = response.text.trim();
      const parsedJson = JSON.parse(jsonStr) as AudioPromptData;
      setGeneratedAudio(parsedJson);
      onAudioGenerated(parsedJson);

    // FIX: The `catch` block was missing curly braces `{}`, which is a syntax error. 
    // This caused cascading errors, making the compiler unable to find `err` and other variables in the component's scope.
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate audio prompts: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [stage6Json, language, onAudioGenerated]);
  
  const isGenerationReady = stage6Json && stage6Json;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
        {!generatedAudio ? (
            !isGenerationReady ? (
                <section>
                    <div className="text-center mb-8">
                        <MusicNoteIcon className="h-12 w-12 text-indigo-400 mb-4 mx-auto" />
                        <h2 className="text-xl font-bold text-gray-300 mb-2">오디오 스튜디오</h2>
                        <p className="text-gray-400">새로운 오디오 프롬프트를 생성하거나 기존 파일을 복원하세요.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[200px]">
                            <h3 className="text-lg font-bold text-white mb-2">Stage 6 제이슨 업로드</h3>
                            <p className="text-sm text-gray-400 mb-4 flex-grow">Stage 6 파일을 업로드하여 AI로 음악과 내레이션 프롬프트를 만듭니다.</p>
                            <label htmlFor="stage6-upload" className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                                <UploadIcon />
                                <span>업로드하여 생성</span>
                            </label>
                            <input id="stage6-upload" type="file" className="hidden" accept=".json" onChange={handleStage6Upload} />
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[200px]">
                            <h3 className="text-lg font-bold text-white mb-2">백업 복원</h3>
                            <p className="text-sm text-gray-400 mb-4 flex-grow">이전에 생성된 오디오 프롬프트 JSON 파일을 불러와서 확인합니다.</p>
                            <label htmlFor="restore-upload" className="w-full cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                                <UploadIcon />
                                <span>파일 복원</span>
                            </label>
                            <input id="restore-upload" type="file" className="hidden" accept=".json" onChange={handleRestoreUpload} />
                        </div>
                    </div>
                </section>
            ) : (
                <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
                    <div className="text-center mb-6">
                        <MusicNoteIcon className="h-12 w-12 text-indigo-400 mb-4 mx-auto" />
                        <h2 className="text-xl font-bold text-gray-300 mb-2">오디오 스튜디오</h2>
                        <p className="text-gray-400">오디오 프롬프트를 생성할 준비가 되었습니다.</p>
                    </div>

                    {stage6File && (
                        <div className="mb-6 flex items-center justify-between gap-2 bg-gray-700/50 p-3 rounded-lg text-sm max-w-sm mx-auto">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileJsonIcon />
                                <span className="font-medium text-gray-200 truncate">{stage6File.name}</span>
                            </div>
                            <button onClick={() => { setStage6File(null); setStage6Json(null); }} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                                <XCircleIcon />
                            </button>
                        </div>
                    )}
                    
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                        <p className="text-center font-semibold text-gray-200 mb-4">'{sceneTitle}'에 대한 오디오 프롬프트 생성 준비 완료</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-300">언어 선택:</span>
                                <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-lg">
                                    <button
                                        onClick={() => setLanguage('ko')}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${ language === 'ko' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}
                                    >
                                        한국어
                                    </button>
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${ language === 'en' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}
                                    >
                                        English
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !isGenerationReady}
                                className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>생성 중...</span>
                                    </>
                                ) : (
                                    '오디오 프롬프트 생성'
                                )}
                            </button>
                        </div>
                    </div>
                </section>
            )
        ) : (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-teal-400 text-center">생성된 오디오 프롬프트: {sceneTitle}</h2>
                <PromptDetail 
                title="음악 스타일 (Suno AI)" 
                content={generatedAudio.music_prompts.description} 
                />
                <PromptDetail 
                title="가사" 
                content={generatedAudio.music_prompts.lyrics} 
                />
                <PromptDetail 
                title="내레이션 스크립트" 
                content={generatedAudio.narration_script} 
                />
          </div>
        )}

        {error && (
            <div className="mt-6 w-full bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span>{error}</span>
            </div>
        )}
    </div>
  );
};

export default AudioStudio;
