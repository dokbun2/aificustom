import { SchemaType } from "@google/generative-ai";

const SettingsSchema = {
    type: SchemaType.OBJECT,
    properties: {
        duration: { type: SchemaType.STRING },
        camera_movement: { type: SchemaType.STRING },
        aspect_ratio: { type: SchemaType.STRING },
    },
    required: ["duration"]
};

const Veo3PromptObjectSchema = {
    type: SchemaType.OBJECT,
    description: "VEO3-specific structured prompt object.",
    properties: {
        core_module: {
            type: SchemaType.OBJECT,
            properties: {
                character: {
                    type: SchemaType.OBJECT,
                    properties: {
                        char_01: {
                            type: SchemaType.OBJECT,
                            properties: {
                                id: { type: SchemaType.STRING },
                                signature_details: { type: SchemaType.STRING },
                                voice_consistency: { type: SchemaType.STRING },
                            },
                        },
                    },
                },
                location_baseline: {
                    type: SchemaType.OBJECT,
                    properties: {
                        setting: { type: SchemaType.STRING },
                    },
                },
            },
        },
        video_module: {
            type: SchemaType.OBJECT,
            properties: {
                metadata: {
                    type: SchemaType.OBJECT,
                    properties: {
                        prompt_name: { type: SchemaType.STRING },
                        duration_seconds: { type: SchemaType.NUMBER },
                    },
                },
                global: {
                    type: SchemaType.OBJECT,
                    properties: {
                        description: { type: SchemaType.STRING },
                        style: { type: SchemaType.STRING },
                    },
                },
                dialogue_block: {
                    type: SchemaType.OBJECT,
                    properties: {
                        dialogue: { type: SchemaType.STRING },
                    },
                },
                sequence: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            timestamp: { type: SchemaType.STRING },
                            camera: { type: SchemaType.STRING },
                            motion: { type: SchemaType.STRING },
                            audio: { type: SchemaType.STRING },
                            effects: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING }
                            },
                        },
                    },
                },
                negative_prompts: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
            },
        },
    },
};

const LumaPromptSchema = {
    type: SchemaType.OBJECT,
    properties: {
        prompt_en: { type: SchemaType.STRING },
        prompt_translated: { type: SchemaType.STRING },
        settings: SettingsSchema,
    },
    required: ["prompt_en", "settings"]
};

const KlingPromptSchema = {
    type: SchemaType.OBJECT,
    properties: {
        prompt_en: { type: SchemaType.STRING },
        prompt_translated: { type: SchemaType.STRING },
        settings: SettingsSchema,
        kling_structured_prompt: { type: SchemaType.STRING },
    },
    required: ["prompt_en", "settings", "kling_structured_prompt"]
};

const Veo2PromptSchema = {
    type: SchemaType.OBJECT,
    properties: {
        prompt_en: { type: SchemaType.STRING },
        prompt_translated: { type: SchemaType.STRING },
        settings: SettingsSchema,
        prompt_object_v6: Veo3PromptObjectSchema,
    },
    required: ["prompt_en", "settings", "prompt_object_v6"]
};

const VideoPromptSchema = {
    type: SchemaType.OBJECT,
    properties: {
        image_id: { type: SchemaType.STRING },
        shot_id: { type: SchemaType.STRING },
        image_reference: {
            type: SchemaType.OBJECT,
            properties: {
                title: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
            },
            required: ["title", "description"],
        },
        // source_data and extracted_data are removed as they are empty objects and cause schema validation errors.
        prompts: {
            type: SchemaType.OBJECT,
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
    type: SchemaType.OBJECT,
    properties: {
        stage: { type: SchemaType.INTEGER, description: "Must be 7." },
        version: { type: SchemaType.STRING, description: "Must be '7.1 (Hybrid)'." },
        timestamp: { type: SchemaType.STRING, description: "Current timestamp in ISO 8601 format." },
        scene_info: {
            type: SchemaType.OBJECT,
            properties: {
                scene_id: { type: SchemaType.STRING },
                scene_title: { type: SchemaType.STRING },
                source_stage5_file: { type: SchemaType.STRING },
                processed_shots: { type: SchemaType.INTEGER },
                processed_images: { type: SchemaType.INTEGER },
                selected_ai_tools: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ["scene_id", "scene_title", "source_stage5_file", "processed_shots", "processed_images", "selected_ai_tools"],
        },
        generation_settings: {
            type: SchemaType.OBJECT,
            properties: {
                selected_ai_tools: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                translation_language: { type: SchemaType.STRING },
                modification_mode: { type: SchemaType.BOOLEAN },
            },
            required: ["selected_ai_tools", "translation_language", "modification_mode"],
        },
        video_prompts: {
            type: SchemaType.ARRAY,
            items: VideoPromptSchema,
        },
    },
    required: ["stage", "version", "timestamp", "scene_info", "generation_settings", "video_prompts"],
};