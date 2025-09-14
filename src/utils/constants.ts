/**
 * Application constants
 */

export const APP_CONFIG = {
  APP_NAME: 'AIFICUT',
  VERSION: '1.0.0',
} as const;

export const STUDIO_MODES = {
  IMAGE: 'image',
  VIDEO: 'video',
  STORY: 'story',
  AUDIO: 'audio',
} as const;

export const STUDIO_LABELS = {
  [STUDIO_MODES.IMAGE]: '이미지 스튜디오',
  [STUDIO_MODES.VIDEO]: '영상 스튜디오',
  [STUDIO_MODES.STORY]: '스토리 스튜디오',
  [STUDIO_MODES.AUDIO]: '오디오 스튜디오',
} as const;

export const FILE_TYPES = {
  JSON: 'application/json',
} as const;

export const STORAGE_KEYS = {
  API_KEY: 'gemini_api_key',
  MODEL: 'gemini_model',
  LAST_STUDIO_MODE: 'last_studio_mode',
  RECENT_FILES: 'recent_files',
} as const;

export const UI_MESSAGES = {
  UPLOAD_PROMPT: {
    IMAGE: '이미지 프롬프트 JSON 파일을 업로드해주세요.',
    VIDEO: '영상 프롬프트 JSON 파일을 업로드해주세요.',
    AUDIO: '오디오 프롬프트 JSON 파일을 업로드해주세요.',
  },
  ERROR: {
    INVALID_FILE: '유효한 JSON 파일이 아닙니다.',
    PARSE_ERROR: 'JSON 파싱 중 오류가 발생했습니다.',
    API_NOT_CONFIGURED: 'API 키와 모델을 먼저 설정해주세요.',
    GENERATION_FAILED: '프롬프트 생성에 실패했습니다.',
  },
  SUCCESS: {
    FILE_LOADED: '파일이 성공적으로 로드되었습니다.',
    API_CONNECTED: 'API가 성공적으로 연결되었습니다.',
    PROMPTS_GENERATED: '프롬프트가 성공적으로 생성되었습니다.',
  },
} as const;

export const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash-8b',
] as const;

export type StudioMode = typeof STUDIO_MODES[keyof typeof STUDIO_MODES];
export type GeminiModel = typeof GEMINI_MODELS[number];