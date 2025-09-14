/**
 * Common type definitions used across the application
 */

export interface SceneInfo {
  title: string;
  description: string;
  tags?: string[];
  duration?: number;
  [key: string]: any;
}

export interface BaseJsonData {
  version: string;
  timestamp: string;
  scene_info: SceneInfo;
}

export interface Prompt {
  prompt_type: 'image' | 'video' | 'audio';
  content: string;
  style?: string;
  mood?: string;
  camera_movement?: string;
  duration?: number;
  transition?: string;
  audio_cue?: string;
  [key: string]: any;
}

export interface NormalizedPrompt {
  shot_id: string;
  image_id: string;
  prompts: Prompt[];
  image_title?: string;
  image_description?: string;
}

export interface NormalizedData extends BaseJsonData {
  prompts: NormalizedPrompt[];
}

export type StudioMode = 'image' | 'video' | 'story' | 'audio';

export interface ApiConfig {
  key: string;
  model: string;
}

export interface FileState {
  fileName: string | null;
  isLoading: boolean;
  error: string | null;
}