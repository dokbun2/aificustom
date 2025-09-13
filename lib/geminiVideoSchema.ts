import { Type } from "@google/genai";

const SettingsSchema = {
    type: Type.OBJECT,
    properties: {
        duration: { type: Type.STRING },
        camera_movement: { type: Type.STRING },
        aspect_ratio: { type: Type.STRING },
    },
    required: ["duration"]
};

const Veo3PromptObjectSchema = {
    type: Type.OBJECT,
    description: "VEO3-specific structured prompt object.",
    properties: {
        core_module: {
            type: Type.OBJECT,
            properties: {
                character: {
                    type: Type.OBJECT,
                    properties: {
                        char_01: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                signature_details: { type: Type.STRING },
                                voice_consistency: { type: Type.STRING },
                            },
                        },
                    },
                },
                location_baseline: {
                    type: Type.OBJECT,
                    properties: {
                        setting: { type: Type.STRING },
                    },
                },
            },
        },
        video_module: {
            type: Type.OBJECT,
            properties: {
                metadata: {
                    type: Type.OBJECT,
                    properties: {
                        prompt_name: { type: Type.STRING },
                        duration_seconds: { type: Type.NUMBER },
                    },
                },
                global: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        style: { type: Type.STRING },
                    },
                },
                dialogue_block: {
                    type: Type.OBJECT,
                    properties: {
                        dialogue: { type: Type.STRING },
                    },
                },
                sequence: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            timestamp: { type: Type.STRING },
                            camera: { type: Type.STRING },
                            motion: { type: Type.STRING },
                            audio: { type: Type.STRING },
                            effects: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                        },
                    },
                },
                negative_prompts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
            },
        },
    },
};

const LumaPromptSchema = {
    type: Type.OBJECT,
    properties: {
        prompt_en: { type: Type.STRING },
        prompt_translated: { type: Type.STRING },
        settings: SettingsSchema,
    },
    required: ["prompt_en", "settings"]
};

const KlingPromptSchema = {
    type: Type.OBJECT,
    properties: {
        prompt_en: { type: Type.STRING },
        prompt_translated: { type: Type.STRING },
        settings: SettingsSchema,
        kling_structured_prompt: { type: Type.STRING },
    },
    required: ["prompt_en", "settings", "kling_structured_prompt"]
};

const Veo2PromptSchema = {
    type: Type.OBJECT,
    properties: {
        prompt_en: { type: Type.STRING },
        prompt_translated: { type: Type.STRING },
        settings: SettingsSchema,
        prompt_object_v6: Veo3PromptObjectSchema,
    },
    required: ["prompt_en", "settings", "prompt_object_v6"]
};

const VideoPromptSchema = {
    type: Type.OBJECT,
    properties: {
        image_id: { type: Type.STRING },
        shot_id: { type: Type.STRING },
        image_reference: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
            },
            required: ["title", "description"],
        },
        // source_data and extracted_data are removed as they are empty objects and cause schema validation errors.
        prompts: {
            type: Type.OBJECT,
            properties: {
                veo2: Veo2PromptSchema,
                kling: KlingPromptSchema,
                luma: LumaPromptSchema,
            },
            required: ["veo2", "kling", "luma"]
        },
    },
    required: ["image_id", "shot_id", "image_reference", "prompts"]
};

export const VideoGenerationResponseSchema = {
    type: Type.OBJECT,
    properties: {
        stage: { type: Type.INTEGER, description: "Must be 7." },
        version: { type: Type.STRING, description: "Must be '7.1 (Hybrid)'." },
        timestamp: { type: Type.STRING, description: "Current timestamp in ISO 8601 format." },
        scene_info: {
            type: Type.OBJECT,
            properties: {
                scene_id: { type: Type.STRING },
                scene_title: { type: Type.STRING },
                source_stage5_file: { type: Type.STRING },
                processed_shots: { type: Type.INTEGER },
                processed_images: { type: Type.INTEGER },
                selected_ai_tools: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["scene_id", "scene_title", "source_stage5_file", "processed_shots", "processed_images", "selected_ai_tools"],
        },
        generation_settings: {
            type: Type.OBJECT,
            properties: {
                selected_ai_tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                translation_language: { type: Type.STRING },
                modification_mode: { type: Type.BOOLEAN },
            },
            required: ["selected_ai_tools", "translation_language", "modification_mode"],
        },
        video_prompts: {
            type: Type.ARRAY,
            items: VideoPromptSchema,
        },
    },
    required: ["stage", "version", "timestamp", "scene_info", "generation_settings", "video_prompts"],
};