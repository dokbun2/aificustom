import { useState, useCallback, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VideoGenerationResponseSchema } from '../../lib/geminiVideoSchema';
import type { ImageRootJsonData, VideoRootJsonData } from '../../types';

interface GeminiApiReturn {
  apiKey: string | null;
  selectedModel: string | null;
  isApiConfigOpen: boolean;
  setIsApiConfigOpen: (open: boolean) => void;
  handleApiConnected: (key: string, model: string) => void;
  generateVideoPrompts: (imageJson: ImageRootJsonData) => Promise<VideoRootJsonData>;
  clearApiConfig: () => void;
}

const STORAGE_KEYS = {
  API_KEY: 'gemini_api_key',
  MODEL: 'gemini_model'
} as const;

export const useGeminiApi = (): GeminiApiReturn => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);

  // Load API configuration from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const storedModel = localStorage.getItem(STORAGE_KEYS.MODEL);

    if (storedApiKey && storedModel) {
      setApiKey(storedApiKey);
      setSelectedModel(storedModel);
    }
  }, []);

  const handleApiConnected = useCallback((key: string, model: string) => {
    setApiKey(key);
    setSelectedModel(model);
    setIsApiConfigOpen(false);

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    localStorage.setItem(STORAGE_KEYS.MODEL, model);
  }, []);

  const clearApiConfig = useCallback(() => {
    setApiKey(null);
    setSelectedModel(null);
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.MODEL);
  }, []);

  const generateVideoPrompts = useCallback(async (imageJson: ImageRootJsonData): Promise<VideoRootJsonData> => {
    if (!apiKey || !selectedModel) {
      throw new Error('API key and model must be configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: VideoGenerationResponseSchema,
      }
    });

    // Prepare the prompt
    const systemPrompt = `Transform the provided image prompts JSON into video prompts JSON.

    REQUIREMENTS:
    1. Generate 3 prompts per shot
    2. Keep shot_id and image_id from the original
    3. Create video-specific prompts that describe camera movement, action, and mood
    4. Maintain scene_info from the original`;

    const userPrompt = `Please transform these image prompts into video prompts:\n\n${JSON.stringify(imageJson, null, 2)}`;

    try {
      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      const text = response.text();

      const videoData = JSON.parse(text) as VideoRootJsonData;

      // Validate the response
      if (!videoData.video_prompts || !Array.isArray(videoData.video_prompts)) {
        throw new Error('Invalid video data structure received from API');
      }

      return videoData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate video prompts: ${error.message}`);
      }
      throw new Error('Failed to generate video prompts: Unknown error');
    }
  }, [apiKey, selectedModel]);

  return {
    apiKey,
    selectedModel,
    isApiConfigOpen,
    setIsApiConfigOpen,
    handleApiConnected,
    generateVideoPrompts,
    clearApiConfig,
  };
};