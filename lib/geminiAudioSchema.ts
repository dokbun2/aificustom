import { Type } from "@google/genai";

const MusicPromptsSchema = {
    type: Type.OBJECT,
    properties: {
        description: { 
            type: Type.STRING, 
            description: "A detailed music style description in ENGLISH suitable for a music AI like Suno (e.g., 'An epic, cinematic, cyberpunk track with driving synths...')."
        },
        lyrics: {
            type: Type.STRING,
            description: "Song lyrics in the requested language (either Korean or English) that capture the theme and mood of the story. Include verse and chorus markers like [Verse 1], [Chorus]."
        },
    },
    required: ['description', 'lyrics'],
};

export const AudioGenerationResponseSchema = {
    type: Type.OBJECT,
    properties: {
        music_prompts: MusicPromptsSchema,
        narration_script: {
            type: Type.STRING,
            description: "A complete narration script in the requested language (either Korean or English) that can be read over the scenes described in the provided storyboard context."
        }
    },
    required: ['music_prompts', 'narration_script'],
};
