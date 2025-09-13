// =================================================================
// Unified/Normalized types for component consumption
// =================================================================

/**
 * A normalized representation of a single prompt set, abstracting
 * away the differences between video and image JSON structures.
 */
export interface NormalizedPrompt {
  shot_id: string;
  image_id: string;
  prompts: Prompts | ImagePrompts;
  // Optional descriptive fields
  shot_description?: string;
  image_title?: string;
  image_description?: string;
  csv_data?: CsvData;
}

/**
 * A normalized representation of scene information.
 */
export interface UnifiedSceneInfo {
  scene_id: string;
  scene_title: string;
  processed_shots: number;
  processed_images: number;
  selected_ai_tools: string[];
}

/**
 * A group of prompts belonging to the same shot.
 */
export interface ShotGroup {
  shot_id: string;
  shot_description?: string;
  prompts: NormalizedPrompt[];
}

/**
 * The normalized data structure passed to viewer components.
 */
export interface NormalizedData {
    scene_info: UnifiedSceneInfo;
    prompts: NormalizedPrompt[];
    version: string;
    timestamp: string;
}

// =================================================================
// Discriminated union for raw JSON data
// =================================================================

export type AnyRootJsonData = VideoRootJsonData | ImageRootJsonData | AudioPromptData;

// =================================================================
// Types for Video Prompt JSON (Stage 7 Hybrid Schema v7.1)
// =================================================================

export interface VideoRootJsonData {
  stage: 7;
  version: string;
  timestamp: string;
  scene_info: {
    scene_id: string;
    scene_title: string;
    source_stage5_file: string;
    processed_shots: number;
    processed_images: number;
    selected_ai_tools: string[];
  };
  generation_settings: {
    selected_ai_tools: string[];
    translation_language: string;
    modification_mode: boolean;
  };
  video_prompts: VideoPrompt[];
}

export interface VideoPrompt {
  image_id: string;
  shot_id: string;
  image_reference: {
    title: string;
    description: string;
  };
  source_data?: object; // Made optional
  extracted_data?: object; // Made optional
  prompts: Prompts;
}

export interface Prompts {
  veo2?: Veo2Prompt;
  kling?: KlingPrompt;
  luma?: LumaPrompt;
  runway?: LumaPrompt; // Assuming runway has a similar structure to luma
  [key: string]: Veo2Prompt | KlingPrompt | LumaPrompt | undefined;
}

export interface Veo2Settings {
  duration: string;
  camera_movement: string;
}

export interface CoreModuleCharacterDetail {
    id: string;
    signature_details: string;
    voice_consistency?: string;
}
export interface CoreModuleCharacter {
  [key: string]: CoreModuleCharacterDetail;
}

export interface CoreModule {
  character: CoreModuleCharacter;
  location_baseline: {
    setting: string;
    details?: string;
  };
  project_style?: string;
}

export interface VideoModuleSequenceEffect {
    type: string;
    description: string;
}

export interface VideoModuleSequence {
    timestamp?: string;
    camera?: string;
    motion: string;
    transition_in?: string;
    effects?: VideoModuleSequenceEffect[];
    dialogue_block?: { dialogue: string };
}

export interface VideoModule {
  metadata: {
    duration_seconds: number;
  };
  global: {
    description: string;
    style: string;
  };
  sequence: VideoModuleSequence[];
  effects?: VideoModuleSequenceEffect[];
  negative_prompts?: string[];
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
  settings: {
      duration: string;
      aspect_ratio: string;
  }
  kling_structured_prompt: string;
}

export interface LumaPrompt {
  prompt_en: string;
  prompt_translated: string;
  settings: {
      duration: string;
  }
}

// =================================================================
// Types for Image Prompt JSON
// =================================================================

export interface ImageRootJsonData {
    stage: number;
    version: string;
    timestamp: string;
    scene_info: {
        scene_id: string;
        sequence_id: string;
        shot_count: number;
        total_images: number;
    };
    generation_settings: {
        selected_ai_tools: string[];
        csv_modified: boolean;
        consistency_prompt_generated: boolean;
    };
    shots: Shot[];
}

export interface Shot {
    shot_id: string;
    shot_description: string;
    image_count: number;
    images: Image[];
    estimated_duration_seconds: number;
}

export interface Image {
    image_id: string;
    image_title: string;
    image_description: string;
    csv_data: CsvData;
    prompts: ImagePrompts;
}

export interface ImagePrompts {
    universal: string;
    universal_translated: string;
    nanobana: string;
    nanobana_translated: string;
    [key: string]: string;
}

export interface CsvData {
    [key: string]: string;
}

// =================================================================
// Types for Audio Prompt JSON
// =================================================================

export interface MusicPrompts {
  description: string; // English description for music style
  lyrics: string;      // Lyrics in the selected language
}

export interface AudioPromptData {
  music_prompts: MusicPrompts;
  narration_script: string;
}
