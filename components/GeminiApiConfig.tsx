import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiApiConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onApiConnected: (apiKey: string, model: string) => void;
}

const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (최신/빠름)', description: '빠른 응답 속도와 효율성' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: '균형잡힌 성능' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', description: '경량화 모델' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '고급 기능과 정확성' },
  { id: 'gemini-2.0-flash-thinking-exp', name: 'Gemini 2.0 Flash Thinking (실험)', description: '추론 강화 실험 모델' }
];

const GeminiApiConfig: React.FC<GeminiApiConfigProps> = ({ isOpen, onClose, onApiConnected }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash-exp');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedApiKey, setSavedApiKey] = useState('');

  useEffect(() => {
    // 저장된 API 키와 모델 불러오기
    const storedApiKey = localStorage.getItem('gemini_api_key');
    const storedModel = localStorage.getItem('gemini_model') || 'gemini-2.0-flash-exp';

    if (storedApiKey) {
      setSavedApiKey(storedApiKey);
      setApiKey(storedApiKey);
    }
    setSelectedModel(storedModel);
  }, [isOpen]);

  const testApiConnection = async () => {
    if (!apiKey) {
      setTestResult({ success: false, message: 'API 키를 입력해주세요.' });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });

      // 간단한 테스트 프롬프트로 연결 확인
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Say "Hello" in Korean' }] }]
      });

      const response = await result.response;
      const text = response.text();

      if (text) {
        setTestResult({
          success: true,
          message: `✅ 연결 성공! (${selectedModel})\n응답: ${text.slice(0, 50)}...`
        });

        // 성공 시 localStorage에 저장
        localStorage.setItem('gemini_api_key', apiKey);
        localStorage.setItem('gemini_model', selectedModel);
        setSavedApiKey(apiKey);
      }
    } catch (error: any) {
      console.error('API 연결 테스트 실패:', error);
      let errorMessage = '연결 실패: ';

      if (error.message?.includes('API_KEY_INVALID')) {
        errorMessage += '유효하지 않은 API 키입니다.';
      } else if (error.message?.includes('PERMISSION_DENIED')) {
        errorMessage += '권한이 거부되었습니다. API 키를 확인해주세요.';
      } else if (error.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage += '할당량이 초과되었습니다.';
      } else if (error.message?.includes('model')) {
        errorMessage += `${selectedModel} 모델을 사용할 수 없습니다. 다른 모델을 선택해주세요.`;
      } else {
        errorMessage += error.message || '알 수 없는 오류가 발생했습니다.';
      }

      setTestResult({ success: false, message: errorMessage });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveAndConnect = () => {
    if (testResult?.success && apiKey) {
      onApiConnected(apiKey, selectedModel);
      onClose();
    } else {
      setTestResult({ success: false, message: '먼저 연결 테스트를 성공적으로 완료해주세요.' });
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('gemini_model');
    setApiKey('');
    setSavedApiKey('');
    setTestResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              Google Gemini API 연동
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* API 키 입력 섹션 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API 키 {savedApiKey && <span className="text-green-400 text-xs">(저장됨)</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {savedApiKey && (
                <button
                  onClick={handleClearApiKey}
                  className="px-4 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Google AI Studio
              </a>
              에서 API 키를 생성할 수 있습니다.
            </p>
          </div>

          {/* 모델 선택 섹션 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              모델 선택
            </label>
            <div className="space-y-2">
              {GEMINI_MODELS.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'bg-teal-900/30 border-teal-500'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{model.name}</div>
                    <div className="text-sm text-gray-400">{model.description}</div>
                    <div className="text-xs text-gray-500 mt-1">모델 ID: {model.id}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 연결 테스트 섹션 */}
          <div>
            <button
              onClick={testApiConnection}
              disabled={!apiKey || isTestingConnection}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-medium hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isTestingConnection ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>연결 테스트 중...</span>
                </>
              ) : (
                <span>연결 테스트</span>
              )}
            </button>

            {/* 테스트 결과 표시 */}
            {testResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                testResult.success
                  ? 'bg-green-900/30 border border-green-500 text-green-300'
                  : 'bg-red-900/30 border border-red-500 text-red-300'
              }`}>
                <pre className="text-sm whitespace-pre-wrap">{testResult.message}</pre>
              </div>
            )}
          </div>

          {/* 저장 및 연결 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSaveAndConnect}
              disabled={!testResult?.success}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-medium hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              저장 및 연결
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiApiConfig;