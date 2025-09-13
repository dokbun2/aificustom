import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { X, Loader2, CheckCircle, AlertCircle, Key, Sparkles, Zap, Rocket, Brain, FlaskConical, Gauge } from 'lucide-react';

interface GeminiApiConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onApiConnected: (apiKey: string, model: string) => void;
}

const GEMINI_MODELS = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    icon: Brain,
    badge: '최신',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: '최고 성능, 복잡한 추론과 코딩, 100만 토큰 컨텍스트'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    icon: Zap,
    badge: '추천',
    badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    description: '최고의 가성비, 빠른 응답, 대규모 처리에 최적화'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    icon: Rocket,
    badge: '경량',
    badgeColor: 'bg-gradient-to-r from-green-500 to-teal-500',
    description: '초경량 모델, 가장 빠른 속도와 낮은 비용'
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    icon: FlaskConical,
    badge: '실험',
    badgeColor: 'bg-gray-600',
    description: '이전 버전, 안정적인 성능'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    icon: Gauge,
    badge: 'v1.5',
    badgeColor: 'bg-gray-600',
    description: '이전 세대 고급 모델'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    icon: Gauge,
    badge: 'v1.5',
    badgeColor: 'bg-gray-600',
    description: '이전 세대 균형 모델'
  }
];

const GeminiApiConfig: React.FC<GeminiApiConfigProps> = ({ isOpen, onClose, onApiConnected }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedApiKey, setSavedApiKey] = useState('');

  useEffect(() => {
    // 저장된 API 키와 모델 불러오기
    const storedApiKey = localStorage.getItem('gemini_api_key');
    const storedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

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
          message: `연결 성공! (${selectedModel})\n응답: ${text.slice(0, 50)}...`
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
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-teal-400" />
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                Google Gemini API 연동
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* API 키 입력 섹션 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
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
              {GEMINI_MODELS.map((model) => {
                const Icon = model.icon;
                return (
                  <label
                    key={model.id}
                    className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedModel === model.id
                        ? 'bg-teal-900/30 border-teal-500 shadow-lg shadow-teal-500/20'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
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
                    <Icon className={`w-5 h-5 mr-3 mt-0.5 ${
                      selectedModel === model.id ? 'text-teal-400' : 'text-gray-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{model.name}</span>
                        {model.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${model.badgeColor}`}>
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{model.description}</div>
                      <div className="text-xs text-gray-500 mt-2">모델 ID: {model.id}</div>
                    </div>
                  </label>
                );
              })}
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
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>연결 테스트 중...</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-5 h-5" />
                  <span>연결 테스트</span>
                </>
              )}
            </button>

            {/* 테스트 결과 표시 */}
            {testResult && (
              <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                testResult.success
                  ? 'bg-green-900/30 border border-green-500 text-green-300'
                  : 'bg-red-900/30 border border-red-500 text-red-300'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                )}
                <pre className="text-sm whitespace-pre-wrap flex-1">{testResult.message}</pre>
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