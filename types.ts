
export interface SceneInfo {
  scene_id: string;
  scene_title: string;
  source_stage5_file: string;
  processed_shots: number;
  processed_images: number;
  selected_ai_tools: string[];
}

export interface GenerationSettings {
  selected_ai_tools: string[];
  translation_language: string;
  modification_mode: boolean;
}

export interface Veo2Settings {
  duration: string;
  aspect_ratio: string;
}

export interface CoreModuleCharacter {
  [key: string]: {
    id: string;
  };
}

export interface CoreModule {
  character: CoreModuleCharacter;
  location_baseline: {
    setting: string;
    details?: string;
  };
  project_style: string;
}

export interface VideoModuleSequenceEffect {
    type: string;
    description: string;
}

export interface VideoModuleSequence {
    timestamp: string;
    camera?: string;
    motion: string;
    transition_in?: string;
    effects?: VideoModuleSequenceEffect[];
}

export interface VideoModule {
  metadata: {
    duration_seconds: number;
  };
  global: {
    description: string;
  };
  sequence: VideoModuleSequence[];
  effects?: VideoModuleSequenceEffect[];
}

export interface PromptObjectV6 {
  core_module: CoreModule;
  video_module: VideoModule;
}

export interface Veo2Prompt {
  prompt_en: string;
  prompt_translated: string;
  settings: Veo2Settings;
  prompt_object_v6: PromptObjectV6;
}

export interface KlingPrompt {
  prompt_en: string;
  prompt_translated: string;
  kling_structured_prompt: string;
}

export interface LumaPrompt {
  prompt_en: string;
  prompt_translated: string;
}

export interface Prompts {
  veo2: Veo2Prompt;
  kling: KlingPrompt;
  luma: LumaPrompt;
  [key: string]: Veo2Prompt | KlingPrompt | LumaPrompt;
}

export interface VideoPrompt {
  image_id: string;
  shot_id: string;
  prompts: Prompts;
}

export interface ShotGroup {
  shot_id: string;
  prompts: VideoPrompt[];
}

export interface RootJsonData {
  stage: number;
  version: string;
  timestamp: string;
  scene_info: SceneInfo;
  generation_settings: GenerationSettings;
  video_prompts: VideoPrompt[];
}