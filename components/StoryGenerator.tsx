import React, { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ImageRootJsonData, Shot } from '../types';
import { StoryGenerationResponseSchema, SingleShotGenerationSchema } from '../lib/geminiSchema';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';


interface StoryGeneratorProps {
    onStoryGenerated: (imageJson: ImageRootJsonData, fileName: string) => void;
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onStoryGenerated }) => {
    const [storyIdea, setStoryIdea] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingShot, setIsAddingShot] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedJson, setGeneratedJson] = useState<ImageRootJsonData | null>(null);

    const recalculateTotals = (currentJson: ImageRootJsonData | null): ImageRootJsonData | null => {
        if (!currentJson) return null;
        
        const newJson = { ...currentJson };
        const totalImages = newJson.shots.reduce((sum, shot) => sum + shot.image_count, 0);
        
        newJson.scene_info = {
            ...newJson.scene_info,
            shot_count: newJson.shots.length,
            total_images: totalImages,
        };
        return newJson;
    };

    const handleGenerate = useCallback(async () => {
        if (!storyIdea.trim()) {
            setError('Please enter a story idea.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedJson(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API key is not configured.");
            }
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const imageInstruction = `You are an expert storyboard creator for films and commercials. Based on the user's idea, create a series of shots. The output must be a valid JSON object that strictly follows the provided schema.

User's idea: "${storyIdea}"

Flesh out the story, describe scenes, characters, camera angles, and lighting to create a compelling visual narrative. Generate a minimum of 3 shots. Each shot can have between 1 to 3 images. Be creative and detailed.
For each shot, provide an 'estimated_duration_seconds' based on the action.
All user-facing descriptive fields such as \`shot_description\`, \`image_title\`, and \`image_description\` must be in KOREAN.
**CRITICALLY, all string values inside the \`csv_data\` object must be in ENGLISH.** This is because they are used to build the English-based 'universal' prompt for image generation models.

**CRITICAL FORMATTING RULE:** For each image's \`prompts.universal\` field, you MUST generate a Midjourney-style string.
1.  This string is created by joining all the non-empty values from that image's \`csv_data\` object.
2.  Each key-value pair should be formatted as "KEY: value" and joined together with "; ".
3.  **The "PARAMETERS: ..." part MUST always be placed at the very end of the entire string.**
For example: "STYLE: cyberpunk noir; MEDIUM: photorealistic; ... QUALITY: cinematic; PARAMETERS: --ar 16:9"
`;
            
            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: imageInstruction,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: StoryGenerationResponseSchema,
                },
            });
            
            const imageJsonStr = imageResponse.text.trim();
            const imageParsedJson = JSON.parse(imageJsonStr) as ImageRootJsonData;
            setGeneratedJson(imageParsedJson);

        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate storyboard: ${message}`);
            setGeneratedJson(null);
        } finally {
            setIsLoading(false);
        }
    }, [storyIdea]);

    const handleAddShot = useCallback(async () => {
        if (!generatedJson) return;

        setIsAddingShot(true);
        setError(null);

        try {
             if (!process.env.API_KEY) {
                throw new Error("API key is not configured.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const existingShots = JSON.stringify(generatedJson.shots.map(s => ({ shot_id: s.shot_id, shot_description: s.shot_description })));
            const lastShotId = generatedJson.shots[generatedJson.shots.length - 1]?.shot_id || 'S01.00';
            const [scenePrefix, shotNumStr] = lastShotId.split('.');
            const nextShotNum = parseInt(shotNumStr, 10) + 1;
            const nextShotId = `${scenePrefix}.${String(nextShotNum).padStart(2, '0')}`;


            const instruction = `You are an expert storyboard creator. Based on the original idea and the existing shots, generate ONE new shot that logically follows the story.

Original Idea: "${storyIdea}"
Existing Shots: ${existingShots}

Create a new shot with the ID "${nextShotId}". The output must be a single valid JSON Shot object that strictly follows the provided schema.
All user-facing descriptive fields (\`shot_description\`, \`image_title\`, \`image_description\`) must be in KOREAN.
**CRITICALLY, all string values inside the \`csv_data\` object must be in ENGLISH.**
Include an 'estimated_duration_seconds'.

**CRITICAL FORMATTING RULE:** For the \`prompts.universal\` field, generate a Midjourney-style string by joining all non-empty \`csv_data\` values. Each pair should be "KEY: value", joined by "; ". The "PARAMETERS: ..." part MUST be at the very end.
`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: instruction,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: SingleShotGenerationSchema
                }
            });

            const jsonStr = response.text.trim();
            const newShot = JSON.parse(jsonStr) as Shot;
            
            setGeneratedJson(currentJson => {
                if (!currentJson) return null;
                const updatedJson = {
                    ...currentJson,
                    shots: [...currentJson.shots, newShot]
                };
                return recalculateTotals(updatedJson);
            });

        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to add new shot: ${message}`);
        } finally {
            setIsAddingShot(false);
        }

    }, [generatedJson, storyIdea]);

    const handleRemoveShot = (shotIdToRemove: string) => {
        setGeneratedJson(currentJson => {
            if (!currentJson) return null;
            const updatedJson = {
                ...currentJson,
                shots: currentJson.shots.filter(shot => shot.shot_id !== shotIdToRemove)
            };
            return recalculateTotals(updatedJson);
        });
    };
    
    const totalDuration = useMemo(() => {
        if (!generatedJson) return 0;
        return generatedJson.shots.reduce((sum, shot) => sum + shot.estimated_duration_seconds, 0);
    }, [generatedJson]);

    const handleLoadInStudio = () => {
        if (generatedJson) {
            onStoryGenerated(generatedJson, 'AI-Generated-Story.json');
        }
    };

    if (isLoading) {
        return (
             <div className="w-full text-center animate-fade-in flex flex-col items-center justify-center h-full">
                <svg className="animate-spin h-12 w-12 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl font-semibold text-gray-300">스토리보드 생성 중...</p>
             </div>
        )
    }


    return (
        <div className="w-full h-full flex flex-col items-center p-4 max-w-4xl mx-auto">
            {!generatedJson && (
                <div className="w-full text-center animate-fade-in">
                    <SparklesIcon />
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-2">AI 스토리 생성</h2>
                    <p className="text-gray-400 text-lg mb-8">아이디어를 입력하면 AI가 이미지 스토리보드를 생성합니다.</p>
                </div>
            )}
            
            <div className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
                <textarea
                    value={storyIdea}
                    onChange={(e) => setStoryIdea(e.target.value)}
                    placeholder="예: 미래 도시의 옥상에서 비를 맞고 있는 사이버펑크 탐정..."
                    className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 transition-colors"
                    disabled={!!generatedJson}
                />
                {!generatedJson && (
                    <button
                        onClick={handleGenerate}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                        스토리보드 생성
                    </button>
                )}
            </div>

            {error && (
                <div className="mt-6 w-full bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                </div>
            )}

            {generatedJson && (
                <div className="mt-6 w-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg animate-fade-in flex-1 flex flex-col overflow-hidden">
                    <div className="flex-shrink-0">
                        <h3 className="text-xl font-bold text-teal-400 mb-4">생성된 스토리보드</h3>
                        <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg mb-4 text-sm">
                            <div>
                                <span className="font-semibold text-gray-400">Scene ID:</span> {generatedJson.scene_info.scene_id} | 
                                <span className="font-semibold text-gray-400 ml-2">Total Shots:</span> {generatedJson.scene_info.shot_count} | 
                                <span className="font-semibold text-gray-400 ml-2">Total Images:</span> {generatedJson.scene_info.total_images}
                            </div>
                            <div className="font-bold text-teal-300">
                                총 예상 시간: {totalDuration}초
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                      {generatedJson.shots.map((shot: Shot) => (
                        <div key={shot.shot_id} className="bg-gray-900/70 p-4 rounded-lg flex justify-between items-start gap-4">
                          <div className="flex-1">
                              <p className="font-bold text-gray-200">{shot.shot_id}: <span className="font-normal">{shot.shot_description}</span></p>
                              <p className="text-xs text-gray-400 mt-1">이미지 {shot.image_count}개 | {shot.estimated_duration_seconds}초</p>
                          </div>
                          <button onClick={() => handleRemoveShot(shot.shot_id)} className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full">
                            <TrashIcon className="w-5 h-5"/>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700 flex-shrink-0 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleAddShot}
                            disabled={isAddingShot}
                            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700/50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            {isAddingShot ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <PlusCircleIcon className="w-6 h-6" />
                            )}
                            <span>{isAddingShot ? '샷 추가 중...' : '샷 추가'}</span>
                        </button>
                        <button
                            onClick={handleLoadInStudio}
                            className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                        >
                            스튜디오로 이동
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryGenerator;