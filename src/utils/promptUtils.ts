import type { PromptObjectV6, NormalizedPrompt } from '../../types';

/**
 * Extracts PromptObjectV6 from NormalizedPrompt
 */
export const extractPromptObjectV6 = (promptData: NormalizedPrompt): PromptObjectV6 | null => {
  // Try video mode (veo2)
  if ('veo2' in promptData.prompts && (promptData.prompts as any).veo2?.prompt_object_v6) {
    return (promptData.prompts as any).veo2.prompt_object_v6 as PromptObjectV6;
  }

  // Try image mode (direct prompt_object_v6)
  if ('prompt_object_v6' in promptData.prompts && (promptData.prompts as any).prompt_object_v6) {
    return (promptData.prompts as any).prompt_object_v6 as PromptObjectV6;
  }

  return null;
};

/**
 * Creates a default PromptObjectV6 structure
 */
export const createDefaultPromptObjectV6 = (): PromptObjectV6 => {
  return {
    core_module: {
      character: {},
      location_baseline: {
        setting: '',
        details: ''
      },
      project_style: ''
    },
    video_module: {
      metadata: {
        duration_seconds: 0
      },
      global: {
        description: ''
      },
      sequence: []
    }
  };
};

/**
 * Validates if a PromptObjectV6 has the minimum required structure
 */
export const isValidPromptObjectV6 = (prompt: any): prompt is PromptObjectV6 => {
  return prompt &&
         typeof prompt === 'object' &&
         'core_module' in prompt &&
         'video_module' in prompt;
};

/**
 * Updates a PromptObjectV6 in NormalizedPrompt
 */
export const updatePromptObjectV6InNormalizedPrompt = (
  promptData: NormalizedPrompt,
  updatedPromptObject: PromptObjectV6
): NormalizedPrompt => {
  const newPromptData = JSON.parse(JSON.stringify(promptData));

  // Update in veo2 if it exists
  if ('veo2' in newPromptData.prompts) {
    (newPromptData.prompts as any).veo2.prompt_object_v6 = updatedPromptObject;
  }
  // Update in direct prompt_object_v6 if it exists
  else if ('prompt_object_v6' in newPromptData.prompts) {
    (newPromptData.prompts as any).prompt_object_v6 = updatedPromptObject;
  }

  return newPromptData;
};