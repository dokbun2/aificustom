import { Type } from "@google/genai";

const CsvDataSchema = {
    type: Type.OBJECT,
    properties: {
        STYLE: { type: Type.STRING, description: "The overall visual style (e.g., 'cyberpunk noir'). Must be in ENGLISH." },
        MEDIUM: { type: Type.STRING, description: "The medium (e.g., 'photorealistic'). Must be in ENGLISH." },
        "ERA/CULTURAL_REF": { type: Type.STRING, description: "The era or cultural reference (e.g., '2077 dystopian future'). Must be in ENGLISH." },
        CAMERA: { type: Type.STRING, description: "Camera shot type and angle (e.g., 'medium shot'). Must be in ENGLISH." },
        SCENE: { type: Type.STRING, description: "A brief description of the action in the scene. Must be in ENGLISH." },
        CHARACTER_1: { type: Type.STRING, description: "Description of the first character and their actions. Must be in ENGLISH." },
        CHARACTER_1_DETAIL: { type: Type.STRING, description: "Details about the first character's appearance, expression, and clothing. Must be in ENGLISH." },
        CHARACTER_2: { type: Type.STRING, description: "Optional second character. Must be in ENGLISH." },
        CHARACTER_2_DETAIL: { type: Type.STRING, description: "Optional details for the second character. Must be in ENGLISH." },
        CHARACTER_3: { type: Type.STRING, description: "Optional third character. Must be in ENGLISH." },
        CHARACTER_3_DETAIL: { type: Type.STRING, description: "Optional details for the third character. Must be in ENGLISH." },
        CHARACTER_4: { type: Type.STRING, description: "Optional fourth character. Must be in ENGLISH." },
        CHARACTER_4_DETAIL: { type: Type.STRING, description: "Optional details for the fourth character. Must be in ENGLISH." },
        CHARACTER_5: { type: Type.STRING, description: "Optional fifth character. Must be in ENGLISH." },
        CHARACTER_5_DETAIL: { type: Type.STRING, description: "Optional details for the fifth character. Must be in ENGLISH." },
        CAMERA_EFFECTS: { type: Type.STRING, description: "Any camera effects (e.g., 'motion blur'). Must be in ENGLISH." },
        LOCATION: { type: Type.STRING, description: "The main location of the scene. Must be in ENGLISH." },
        LOCATION_DETAIL: { type: Type.STRING, description: "Specific details about the location. Must be in ENGLISH." },
        TIME_LIGHTING: { type: Type.STRING, description: "Time of day and natural light (e.g., 'night', 'daylight'). Must be in ENGLISH." },
        ARTIFICIAL_LIGHT: { type: Type.STRING, description: "Source of artificial light (e.g., 'softbox lighting'). Must be in ENGLISH." },
        LIGHTING_TECHNIQUE: { type: Type.STRING, description: "Lighting technique used (e.g., 'low key lighting'). Must be in ENGLISH." },
        ATMOSPHERE: { type: Type.STRING, description: "The mood or atmosphere of the shot. Must be in ENGLISH." },
        WEATHER: { type: Type.STRING, description: "Weather conditions, if applicable. Must be in ENGLISH." },
        FOREGROUND: { type: Type.STRING, description: "Elements in the foreground. Must be in ENGLISH." },
        BACKGROUND: { type: Type.STRING, description: "Elements in the background. Must be in ENGLISH." },
        COLOR_TONE: { type: Type.STRING, description: "The color palette (e.g., 'warm and bright'). Must be in ENGLISH." },
        CAMERA_TECH: { type: Type.STRING, description: "Specific camera technology (e.g., '100mm macro lens'). Must be in ENGLISH." },
        QUALITY: { type: Type.STRING, description: "Desired quality level (e.g., 'commercial quality'). Must be in ENGLISH." },
        PARAMETERS: { type: Type.STRING, description: "Tool-specific parameters, must include aspect ratio like '--ar 16:9'." },
    },
    required: ["STYLE", "MEDIUM", "CAMERA", "SCENE", "LOCATION", "TIME_LIGHTING", "ATMOSPHERE", "FOREGROUND", "BACKGROUND", "COLOR_TONE", "QUALITY", "PARAMETERS"]
};

const PromptsSchema = {
    type: Type.OBJECT,
    properties: {
        universal: { type: Type.STRING, description: "A Midjourney-style prompt formed by joining all non-empty csv_data values with '; '. The values should be in ENGLISH. The 'PARAMETERS: ...' part must always be at the end of the string." },
        universal_translated: { type: Type.STRING, description: "Leave this as an empty string." },
        nanobana: { type: Type.STRING, description: "A detailed, descriptive, paragraph-style prompt in ENGLISH that describes the scene based on all csv_data." },
        nanobana_translated: { type: Type.STRING, description: "Leave this as an empty string." },
    },
    required: ['universal', 'universal_translated', 'nanobana', 'nanobana_translated'],
};

const ImageSchema = {
    type: Type.OBJECT,
    properties: {
        image_id: { type: Type.STRING, description: "A unique ID for the image in the format SXX.XX-A-XX (e.g., S01.01-A-01)." },
        image_title: { type: Type.STRING, description: "A descriptive title for the image in KOREAN." },
        image_description: { type: Type.STRING, description: "A short, one-sentence description of the image in KOREAN." },
        csv_data: CsvDataSchema,
        prompts: PromptsSchema,
    },
    required: ['image_id', 'image_title', 'image_description', 'csv_data', 'prompts'],
};

const ShotSchema = {
    type: Type.OBJECT,
    properties: {
        shot_id: { type: Type.STRING, description: "A unique ID for the shot in the format SXX.XX (e.g., S01.01)." },
        shot_description: { type: Type.STRING, description: "A brief description of the shot's purpose in KOREAN." },
        image_count: { type: Type.INTEGER, description: "The total number of images within this shot." },
        estimated_duration_seconds: { type: Type.INTEGER, description: "The estimated duration of the shot in seconds, based on the action in the scene." },
        images: {
            type: Type.ARRAY,
            items: ImageSchema,
        },
    },
    required: ['shot_id', 'shot_description', 'image_count', 'images', 'estimated_duration_seconds'],
};

export const StoryGenerationResponseSchema = {
    type: Type.OBJECT,
    properties: {
        stage: { type: Type.INTEGER, description: "Stage number, must be 6." },
        version: { type: Type.STRING, description: "Version, must be '3.0'." },
        timestamp: { type: Type.STRING, description: "The current timestamp in ISO 8601 format." },
        scene_info: {
            type: Type.OBJECT,
            properties: {
                scene_id: { type: Type.STRING, description: "A unique ID for the scene in the format SXX (e.g., S01)." },
                sequence_id: { type: Type.STRING, description: "A unique ID for the sequence (e.g., SEQ001)." },
                shot_count: { type: Type.INTEGER, description: "The total number of shots generated." },
                total_images: { type: Type.INTEGER, description: "The total number of images generated across all shots." },
            },
            required: ['scene_id', 'sequence_id', 'shot_count', 'total_images'],
        },
        generation_settings: {
            type: Type.OBJECT,
            properties: {
                selected_ai_tools: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of AI tools, must be ['universal', 'nanobana']." },
                csv_modified: { type: Type.BOOLEAN, description: "Set to false." },
                consistency_prompt_generated: { type: Type.BOOLEAN, description: "Set to false." },
            },
            required: ['selected_ai_tools', 'csv_modified', 'consistency_prompt_generated'],
        },
        shots: {
            type: Type.ARRAY,
            items: ShotSchema
        },
    },
    required: ['stage', 'version', 'timestamp', 'scene_info', 'generation_settings', 'shots'],
};

export const SingleShotGenerationSchema = ShotSchema;