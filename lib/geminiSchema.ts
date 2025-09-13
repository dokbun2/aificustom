import { SchemaType } from "@google/generative-ai";

const CsvDataSchema = {
    type: SchemaType.OBJECT,
    properties: {
        STYLE: { type: SchemaType.STRING, description: "The overall visual style (e.g., 'cyberpunk noir'). Must be in ENGLISH." },
        MEDIUM: { type: SchemaType.STRING, description: "The medium (e.g., 'photorealistic'). Must be in ENGLISH." },
        "ERA/CULTURAL_REF": { type: SchemaType.STRING, description: "The era or cultural reference (e.g., '2077 dystopian future'). Must be in ENGLISH." },
        CAMERA: { type: SchemaType.STRING, description: "Camera shot type and angle (e.g., 'medium shot'). Must be in ENGLISH." },
        SCENE: { type: SchemaType.STRING, description: "A brief description of the action in the scene. Must be in ENGLISH." },
        CHARACTER_1: { type: SchemaType.STRING, description: "Description of the first character and their actions. Must be in ENGLISH." },
        CHARACTER_1_DETAIL: { type: SchemaType.STRING, description: "Details about the first character's appearance, expression, and clothing. Must be in ENGLISH." },
        CHARACTER_2: { type: SchemaType.STRING, description: "Optional second character. Must be in ENGLISH." },
        CHARACTER_2_DETAIL: { type: SchemaType.STRING, description: "Optional details for the second character. Must be in ENGLISH." },
        CHARACTER_3: { type: SchemaType.STRING, description: "Optional third character. Must be in ENGLISH." },
        CHARACTER_3_DETAIL: { type: SchemaType.STRING, description: "Optional details for the third character. Must be in ENGLISH." },
        CHARACTER_4: { type: SchemaType.STRING, description: "Optional fourth character. Must be in ENGLISH." },
        CHARACTER_4_DETAIL: { type: SchemaType.STRING, description: "Optional details for the fourth character. Must be in ENGLISH." },
        CHARACTER_5: { type: SchemaType.STRING, description: "Optional fifth character. Must be in ENGLISH." },
        CHARACTER_5_DETAIL: { type: SchemaType.STRING, description: "Optional details for the fifth character. Must be in ENGLISH." },
        CAMERA_EFFECTS: { type: SchemaType.STRING, description: "Any camera effects (e.g., 'motion blur'). Must be in ENGLISH." },
        LOCATION: { type: SchemaType.STRING, description: "The main location of the scene. Must be in ENGLISH." },
        LOCATION_DETAIL: { type: SchemaType.STRING, description: "Specific details about the location. Must be in ENGLISH." },
        TIME_LIGHTING: { type: SchemaType.STRING, description: "Time of day and natural light (e.g., 'night', 'daylight'). Must be in ENGLISH." },
        ARTIFICIAL_LIGHT: { type: SchemaType.STRING, description: "Source of artificial light (e.g., 'softbox lighting'). Must be in ENGLISH." },
        LIGHTING_TECHNIQUE: { type: SchemaType.STRING, description: "Lighting technique used (e.g., 'low key lighting'). Must be in ENGLISH." },
        ATMOSPHERE: { type: SchemaType.STRING, description: "The mood or atmosphere of the shot. Must be in ENGLISH." },
        WEATHER: { type: SchemaType.STRING, description: "Weather conditions, if applicable. Must be in ENGLISH." },
        FOREGROUND: { type: SchemaType.STRING, description: "Elements in the foreground. Must be in ENGLISH." },
        BACKGROUND: { type: SchemaType.STRING, description: "Elements in the background. Must be in ENGLISH." },
        COLOR_TONE: { type: SchemaType.STRING, description: "The color palette (e.g., 'warm and bright'). Must be in ENGLISH." },
        CAMERA_TECH: { type: SchemaType.STRING, description: "Specific camera technology (e.g., '100mm macro lens'). Must be in ENGLISH." },
        QUALITY: { type: SchemaType.STRING, description: "Desired quality level (e.g., 'commercial quality'). Must be in ENGLISH." },
        PARAMETERS: { type: SchemaType.STRING, description: "Tool-specific parameters, must include aspect ratio like '--ar 16:9'." },
    },
    required: ["STYLE", "MEDIUM", "CAMERA", "SCENE", "LOCATION", "TIME_LIGHTING", "ATMOSPHERE", "FOREGROUND", "BACKGROUND", "COLOR_TONE", "QUALITY", "PARAMETERS"]
};

const PromptsSchema = {
    type: SchemaType.OBJECT,
    properties: {
        universal: { type: SchemaType.STRING, description: "A Midjourney-style prompt formed by joining all non-empty csv_data values with '; '. The values should be in ENGLISH. The 'PARAMETERS: ...' part must always be at the end of the string." },
        universal_translated: { type: SchemaType.STRING, description: "Leave this as an empty string." },
        nanobana: { type: SchemaType.STRING, description: "A detailed, descriptive, paragraph-style prompt in ENGLISH that describes the scene based on all csv_data." },
        nanobana_translated: { type: SchemaType.STRING, description: "Leave this as an empty string." },
    },
    required: ['universal', 'universal_translated', 'nanobana', 'nanobana_translated'],
};

const ImageSchema = {
    type: SchemaType.OBJECT,
    properties: {
        image_id: { type: SchemaType.STRING, description: "A unique ID for the image in the format SXX.XX-A-XX (e.g., S01.01-A-01)." },
        image_title: { type: SchemaType.STRING, description: "A descriptive title for the image in KOREAN." },
        image_description: { type: SchemaType.STRING, description: "A short, one-sentence description of the image in KOREAN." },
        csv_data: CsvDataSchema,
        prompts: PromptsSchema,
    },
    required: ['image_id', 'image_title', 'image_description', 'csv_data', 'prompts'],
};

const ShotSchema = {
    type: SchemaType.OBJECT,
    properties: {
        shot_id: { type: SchemaType.STRING, description: "A unique ID for the shot in the format SXX.XX (e.g., S01.01)." },
        shot_description: { type: SchemaType.STRING, description: "A brief description of the shot's purpose in KOREAN." },
        image_count: { type: SchemaType.INTEGER, description: "The total number of images within this shot." },
        estimated_duration_seconds: { type: SchemaType.INTEGER, description: "The estimated duration of the shot in seconds, based on the action in the scene." },
        images: {
            type: SchemaType.ARRAY,
            items: ImageSchema,
        },
    },
    required: ['shot_id', 'shot_description', 'image_count', 'images', 'estimated_duration_seconds'],
};

export const StoryGenerationResponseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        stage: { type: SchemaType.INTEGER, description: "Stage number, must be 6." },
        version: { type: SchemaType.STRING, description: "Version, must be '3.0'." },
        timestamp: { type: SchemaType.STRING, description: "The current timestamp in ISO 8601 format." },
        scene_info: {
            type: SchemaType.OBJECT,
            properties: {
                scene_id: { type: SchemaType.STRING, description: "A unique ID for the scene in the format SXX (e.g., S01)." },
                sequence_id: { type: SchemaType.STRING, description: "A unique ID for the sequence (e.g., SEQ001)." },
                shot_count: { type: SchemaType.INTEGER, description: "The total number of shots generated." },
                total_images: { type: SchemaType.INTEGER, description: "The total number of images generated across all shots." },
            },
            required: ['scene_id', 'sequence_id', 'shot_count', 'total_images'],
        },
        generation_settings: {
            type: SchemaType.OBJECT,
            properties: {
                selected_ai_tools: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of AI tools, must be ['universal', 'nanobana']." },
                csv_modified: { type: SchemaType.BOOLEAN, description: "Set to false." },
                consistency_prompt_generated: { type: SchemaType.BOOLEAN, description: "Set to false." },
            },
            required: ['selected_ai_tools', 'csv_modified', 'consistency_prompt_generated'],
        },
        shots: {
            type: SchemaType.ARRAY,
            items: ShotSchema
        },
    },
    required: ['stage', 'version', 'timestamp', 'scene_info', 'generation_settings', 'shots'],
};

export const SingleShotGenerationSchema = ShotSchema;