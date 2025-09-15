import React, { useState, useCallback } from 'react';
import type { NormalizedPrompt, PromptObjectV6 } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

const setNestedValue = (obj: any, path: (string | number)[], value: any): any => {
    const newObj = JSON.parse(JSON.stringify(obj));
    let current = newObj;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    return newObj;
};

const InputField: React.FC<{ label: string; value: string; path: (string|number)[]; onChange: (path: (string|number)[], value: string) => void }> = ({ label, value, path, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            className="w-full bg-gray-950 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
        />
    </div>
);

const TextAreaField: React.FC<{ label: string; value: string; path: (string|number)[]; onChange: (path: (string|number)[], value: string) => void }> = ({ label, value, path, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            className="w-full bg-gray-950 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            rows={3}
        />
    </div>
);

const PromptEditorForm: React.FC<{ prompt: PromptObjectV6, onFieldChange: (path: (string|number)[], value: any) => void }> = ({ prompt, onFieldChange }) => {
    // 데이터 안전성 체크
    if (!prompt || !prompt.core_module) {
        return (
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-gray-400">프롬프트 데이터를 불러올 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-md font-bold text-teal-400 mb-3">코어 모듈</h4>
                <div className="space-y-3">
                    {prompt.core_module?.character && (
                        <div className="p-3 bg-gray-900/50 rounded-md">
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">캐릭터</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(prompt.core_module.character).map(([key, value]) => (
                                    <InputField
                                        key={key}
                                        label={key}
                                        value={(value as any)?.id || ''}
                                        path={['core_module', 'character', key, 'id']}
                                        onChange={onFieldChange}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {prompt.core_module?.location_baseline && (
                        <div className="p-3 bg-gray-900/50 rounded-md">
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">장소</h5>
                            <div className="space-y-3">
                                <InputField
                                    label="설정"
                                    value={prompt.core_module.location_baseline?.setting || ''}
                                    path={['core_module', 'location_baseline', 'setting']}
                                    onChange={onFieldChange}
                                />
                                <InputField
                                    label="세부사항"
                                    value={prompt.core_module.location_baseline?.details || ''}
                                    path={['core_module', 'location_baseline', 'details']}
                                    onChange={onFieldChange}
                                />
                            </div>
                        </div>
                    )}
                    <InputField
                        label="프로젝트 스타일"
                        value={prompt.core_module?.project_style || ''}
                        path={['core_module', 'project_style']}
                        onChange={onFieldChange}
                    />
            </div>
        </div>
        {prompt.video_module && (
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-md font-bold text-teal-400 mb-3">비디오 모듈</h4>
                <div className="space-y-3">
                    {prompt.video_module?.metadata && (
                        <InputField
                            label="길이 (초)"
                            value={String(prompt.video_module.metadata?.duration_seconds || 0)}
                            path={['video_module', 'metadata', 'duration_seconds']}
                            onChange={(path, value) => onFieldChange(path, Number(value))}
                        />
                    )}
                    {prompt.video_module?.global && (
                        <TextAreaField
                            label="전체 설명"
                            value={prompt.video_module.global?.description || ''}
                            path={['video_module', 'global', 'description']}
                            onChange={onFieldChange}
                        />
                    )}
                    {prompt.video_module?.sequence && Array.isArray(prompt.video_module.sequence) && (
                        <div>
                            <h5 className="text-sm font-semibold text-gray-300 my-2">시퀀스</h5>
                            {prompt.video_module.sequence.map((seq, index) => (
                                <div key={index} className="p-3 bg-gray-900/50 rounded-md mb-3">
                                    <h6 className="text-xs font-bold text-gray-400 mb-2 uppercase">항목 {index + 1}</h6>
                                    <div className="space-y-3">
                                        <InputField
                                            label="타임스탬프"
                                            value={seq?.timestamp || ''}
                                            path={['video_module', 'sequence', index, 'timestamp']}
                                            onChange={onFieldChange}
                                        />
                                        <InputField
                                            label="카메라"
                                            value={seq?.camera || ''}
                                            path={['video_module', 'sequence', index, 'camera']}
                                            onChange={onFieldChange}
                                        />
                                        <TextAreaField
                                            label="모션"
                                            value={seq?.motion || ''}
                                            path={['video_module', 'sequence', index, 'motion']}
                                            onChange={onFieldChange}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
    );
};


const PromptEditor: React.FC<{
    promptData: NormalizedPrompt;
    onSave: (updatedPromptObject: PromptObjectV6) => void;
    onClose: () => void;
}> = ({ promptData, onSave, onClose }) => {

    const getOriginalPrompt = () => {
        // 비디오 모드 (veo2가 있는 경우)
        if ('veo2' in promptData.prompts && (promptData.prompts as any).veo2?.prompt_object_v6) {
            return (promptData.prompts as any).veo2.prompt_object_v6 as PromptObjectV6;
        }
        // 이미지 모드 (prompt_object_v6가 직접 있는 경우)
        if ('prompt_object_v6' in promptData.prompts && (promptData.prompts as any).prompt_object_v6) {
            return (promptData.prompts as any).prompt_object_v6 as PromptObjectV6;
        }

        // 기본 구조 반환
        const defaultPrompt: PromptObjectV6 = {
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

        return defaultPrompt;
    }
    
    const originalPrompt = getOriginalPrompt();
    
    const [editedPrompt, setEditedPrompt] = useState<PromptObjectV6>(
        JSON.parse(JSON.stringify(originalPrompt))
    );

    const handleFieldChange = useCallback((path: (string|number)[], value: any) => {
        setEditedPrompt(currentPrompt => setNestedValue(currentPrompt, path, value));
    }, []);

    const handleSave = () => {
        onSave(editedPrompt);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">유니버셜 프롬프트 수정</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close editor">
                        <XCircleIcon />
                    </button>
                </header>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 p-6 overflow-hidden">
                    {/* Before Column */}
                    <div className="flex flex-col overflow-hidden">
                        <h3 className="text-lg font-bold text-gray-400 mb-3 flex-shrink-0">변경 전</h3>
                        <div className="bg-gray-950 p-4 rounded-lg flex-1 overflow-auto">
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                                <code>{JSON.stringify(originalPrompt, null, 2)}</code>
                            </pre>
                        </div>
                    </div>
                    {/* After Column (Editable) */}
                    <div className="flex flex-col overflow-hidden">
                        <h3 className="text-lg font-bold text-white mb-3 flex-shrink-0">변경 후 (수정 가능)</h3>
                        <div className="flex-1 overflow-auto pr-2">
                           <PromptEditorForm prompt={editedPrompt} onFieldChange={handleFieldChange} />
                        </div>
                    </div>
                </div>
                
                <footer className="flex justify-end items-center gap-4 p-4 border-t border-gray-700 flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="py-2 px-4 rounded-lg text-sm font-bold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                        취소
                    </button>
                    <button 
                        onClick={handleSave}
                        className="py-2 px-5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        변경 내용 저장
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default PromptEditor;