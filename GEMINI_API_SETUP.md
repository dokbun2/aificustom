# Google Gemini API 연동 가이드

## 🚀 새로운 기능
메인 페이지에 Google Gemini API 연동 기능이 추가되었습니다. 이제 최신 Gemini 모델들을 직접 연결하여 사용할 수 있습니다.

## 📋 지원 모델
- **Gemini 2.0 Flash (최신/빠름)** - 빠른 응답 속도와 효율성
- **Gemini 1.5 Flash** - 균형잡힌 성능
- **Gemini 1.5 Flash 8B** - 경량화 모델
- **Gemini 1.5 Pro** - 고급 기능과 정확성
- **Gemini 2.0 Flash Thinking (실험)** - 추론 강화 실험 모델

## 🔧 사용 방법

### 1단계: API 키 생성
1. [Google AI Studio](https://aistudio.google.com/app/apikey)에 접속
2. "Create API Key" 클릭
3. 생성된 API 키 복사

### 2단계: API 연동
1. 메인 페이지 상단의 **"API 연동"** 버튼 클릭
2. API 키 입력란에 복사한 키 붙여넣기
3. 사용할 모델 선택
4. **"연결 테스트"** 버튼 클릭하여 연결 확인
5. 연결 성공 시 **"저장 및 연결"** 클릭

### 3단계: 연결 상태 확인
- 연결 성공 시 버튼이 초록색으로 변경
- 버튼에 "API 연결됨" 표시
- 선택한 모델명이 표시됨

## ⚡ 주요 기능

### API 키 관리
- 브라우저 로컬 스토리지에 안전하게 저장
- 언제든지 초기화 가능
- 세션 간 자동 복원

### 연결 테스트
- 실시간 API 연결 상태 확인
- 상세한 오류 메시지 제공
- 모델별 호환성 검증

### 모델 전환
- 언제든지 다른 모델로 전환 가능
- 모델별 특성 확인 가능

## 🔍 문제 해결

### "API_KEY_INVALID" 오류
- API 키가 올바르게 입력되었는지 확인
- Google AI Studio에서 키 활성화 상태 확인

### "PERMISSION_DENIED" 오류
- API 키의 권한 설정 확인
- Google Cloud Console에서 API 활성화 확인

### "RESOURCE_EXHAUSTED" 오류
- API 할당량 초과
- Google AI Studio에서 할당량 확인

### 모델 사용 불가 오류
- 다른 모델 선택 시도
- 지역별 모델 가용성 확인

## 📱 개발 서버 실행
```bash
npm install
npm run dev
```

현재 개발 서버는 http://localhost:5175 에서 실행 중입니다.

## 🎯 다음 단계
API 연동이 완료되면 다음 기능들을 활용할 수 있습니다:
- AI 스토리 생성
- 이미지 프롬프트 생성
- 영상 프롬프트 최적화
- 오디오 스크립트 생성

## 📝 참고사항
- API 키는 절대 공유하지 마세요
- 무료 할당량 한도를 확인하세요
- 프로덕션 환경에서는 서버 측 API 호출 권장