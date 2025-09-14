import { useState, useCallback, useRef } from 'react';
import type { AnyRootJsonData, NormalizedData, NormalizedPrompt, VideoRootJsonData, ImageRootJsonData, AudioPromptData } from '../../types';

interface FileManagerReturn {
  fileName: string | null;
  isLoading: boolean;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  processAndSetData: (parsedData: AnyRootJsonData, newFileName: string) => ProcessedDataResult;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleClearProject: () => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

interface ProcessedDataResult {
  studioMode: 'image' | 'video' | 'audio' | null;
  normalizedData: NormalizedData | null;
  rawImageJson: ImageRootJsonData | null;
  rawVideoJson: VideoRootJsonData | null;
  rawJsonForAudio: AnyRootJsonData | null;
  generatedAudioJson: AudioPromptData | null;
}

export const useFileManager = (): FileManagerReturn => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndSetData = useCallback((parsedData: AnyRootJsonData, newFileName: string): ProcessedDataResult => {
    let result: ProcessedDataResult = {
      studioMode: null,
      normalizedData: null,
      rawImageJson: null,
      rawVideoJson: null,
      rawJsonForAudio: null,
      generatedAudioJson: null,
    };

    const isVideoFile = 'video_prompts' in parsedData && Array.isArray(parsedData.video_prompts);
    const isImageFile = 'shots' in parsedData && Array.isArray(parsedData.shots);
    const isAudioFile = 'music_prompts' in parsedData && 'narration_script' in parsedData;

    if (isAudioFile) {
      const audioData = parsedData as AudioPromptData;
      result.generatedAudioJson = audioData;
      result.studioMode = 'audio';
    } else if (isVideoFile) {
      const videoData = parsedData as VideoRootJsonData;
      result.rawVideoJson = videoData;
      result.rawJsonForAudio = videoData;

      const normalizedPrompts: NormalizedPrompt[] = videoData.video_prompts.map(vp => ({
        shot_id: vp.shot_id,
        image_id: vp.image_id,
        prompts: vp.prompts,
        image_title: vp.image_reference?.title,
        image_description: vp.image_reference?.description,
      }));

      result.normalizedData = {
        scene_info: videoData.scene_info,
        prompts: normalizedPrompts,
        version: videoData.version,
        timestamp: videoData.timestamp,
      };
      result.studioMode = 'video';
    } else if (isImageFile) {
      const imageData = parsedData as ImageRootJsonData;
      result.rawImageJson = imageData;
      result.rawJsonForAudio = imageData;

      const normalizedPrompts: NormalizedPrompt[] = imageData.shots.flatMap(shot =>
        shot.images.map(image => ({
          shot_id: shot.shot_id,
          image_id: image.image_id,
          prompts: image.prompts,
          image_title: image.title,
          image_description: image.description,
        }))
      );

      result.normalizedData = {
        scene_info: imageData.scene_info,
        prompts: normalizedPrompts,
        version: imageData.version,
        timestamp: imageData.timestamp,
      };
      result.studioMode = 'image';
    }

    setFileName(newFileName);
    setError(null);
    return result;
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') {
            throw new Error('File is not a valid text file.');
          }
          const parsedData: AnyRootJsonData = JSON.parse(text);
          processAndSetData(parsedData, file.name);
          setIsLoading(false);
          resolve();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(`Failed to parse JSON: ${errorMessage}`);
          setIsLoading(false);
          reject(err);
        }
      };
      reader.onerror = () => {
        const errorMessage = 'Failed to read the file.';
        setError(errorMessage);
        setIsLoading(false);
        reject(new Error(errorMessage));
      };
      reader.readAsText(file);
    });
  }, [processAndSetData]);

  const handleClearProject = useCallback(() => {
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return {
    fileName,
    isLoading,
    error,
    fileInputRef,
    processAndSetData,
    handleFileChange,
    handleClearProject,
    setError,
    setIsLoading,
  };
};