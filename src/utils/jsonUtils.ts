import type { AnyRootJsonData, ImageRootJsonData, VideoRootJsonData, AudioPromptData } from '../../types';

/**
 * Detects the type of JSON data
 */
export const detectJsonType = (data: AnyRootJsonData): 'image' | 'video' | 'audio' | 'unknown' => {
  if ('music_prompts' in data && 'narration_script' in data) {
    return 'audio';
  }
  if ('video_prompts' in data && Array.isArray(data.video_prompts)) {
    return 'video';
  }
  if ('shots' in data && Array.isArray(data.shots)) {
    return 'image';
  }
  return 'unknown';
};

/**
 * Type guards for JSON data
 */
export const isImageJson = (data: AnyRootJsonData): data is ImageRootJsonData => {
  return 'shots' in data && Array.isArray(data.shots);
};

export const isVideoJson = (data: AnyRootJsonData): data is VideoRootJsonData => {
  return 'video_prompts' in data && Array.isArray(data.video_prompts);
};

export const isAudioJson = (data: AnyRootJsonData): data is AudioPromptData => {
  return 'music_prompts' in data && 'narration_script' in data;
};

/**
 * Validates JSON structure
 */
export const validateJsonStructure = (data: AnyRootJsonData): { valid: boolean; message?: string } => {
  try {
    const type = detectJsonType(data);

    if (type === 'unknown') {
      return { valid: false, message: 'Unknown JSON format' };
    }

    if (type === 'image') {
      const imageData = data as ImageRootJsonData;
      if (!imageData.scene_info) {
        return { valid: false, message: 'Missing scene_info in image JSON' };
      }
      if (!imageData.shots || imageData.shots.length === 0) {
        return { valid: false, message: 'No shots found in image JSON' };
      }
    }

    if (type === 'video') {
      const videoData = data as VideoRootJsonData;
      if (!videoData.scene_info) {
        return { valid: false, message: 'Missing scene_info in video JSON' };
      }
      if (!videoData.video_prompts || videoData.video_prompts.length === 0) {
        return { valid: false, message: 'No video_prompts found in video JSON' };
      }
    }

    if (type === 'audio') {
      const audioData = data as AudioPromptData;
      if (!audioData.music_prompts || audioData.music_prompts.length === 0) {
        return { valid: false, message: 'No music_prompts found in audio JSON' };
      }
      if (!audioData.narration_script) {
        return { valid: false, message: 'Missing narration_script in audio JSON' };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, message: 'Error validating JSON structure' };
  }
};

/**
 * Creates a deep copy of JSON data
 */
export const deepCloneJson = <T extends AnyRootJsonData>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};