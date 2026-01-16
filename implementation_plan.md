# Safegame React 전역 상태 관리 및 UI 전환 계획

이 문서는 기존 바닐라 자바스크립트 및 Phaser 중심의 아키텍처에서 React와 Zustand를 활용한 효율적인 하이브리드 아키텍처로 전환하기 위한 현황 보고 및 향후 계획을 담고 있습니다.

## 1. 현재 진행 상황 (Current Status)

### ✅ 인프라 구축 완료
- **React 세팅**: Vite 설정에 `@vitejs/plugin-react`를 추가하여 `.jsx` 환경 구축.
- **Entry Point 전환**: `index.html`이 `index.jsx`를 호출하고, 여기서 React 전역 UI와 Phaser 게임 엔진을 병렬로 실행하도록 설정.
- **Zustand 전역 저장소**: `src/store/useGameStore.js`를 생성하여 `hearts`, `inventory`, `dialogue`, `quiz` 등 핵심 게임 데이터의 중앙 집중화 완료.

### ✅ 상태 동기화 (Bridge) 구현 완료
- **Phaser ➡️ Zustand**: `UI_Scene.js`에서 발생하는 게임 이벤트(하트 감소, 아이템 획득, 대화 시작 등)를 `useGameStore.getState()`를 통해 React 저장소로 실시간 전달하도록 수정.
- **React UI 실험적 도입**: `App.jsx`를 통해 화면 상단에 React 기반의 하트 HUD와 대화창 오버레이를 렌더링 중.

---

## 2. 분석 결과 (File Analysis)

- **UI_Scene.js**: 현재 가장 복잡한 파일로, 조이스틱/버튼 등 'Phaser 기반 UI'와 리모컨 역할을 하는 'React 연동 로직'이 공존하고 있습니다.
- **App.jsx**: 임시로 모든 UI가 뭉쳐 있는 상태로, 컴포넌트 단위의 쪼개기가 필요합니다.
- **GameScene.js**: 핵심 게임 로직은 유지하되, UI와 관련된 직접적인 DOM 조작은 점진적으로 제거될 예정입니다.

---

## 3. 향후 구현 계획 (Implementation Roadmap)

### ✅ 1단계: 컴포넌트 모듈화 (완료)
- `App.jsx`의 핵심 기능별 분리 완료.
- `Hearts`, `InventoryHUD`, `Dialogue` 컴포넌트 생성 및 적용.
- Zustand를 통한 개별 컴포넌트 최적화 완료.

### ✅ 2단계: 핵심 UI 기능 이전 (Interactive UI - 완료)
가장 복잡한 상호작용 레이어를 다음과 같이 성공적으로 React로 이전하였습니다.

- **아이템 셀렉터 (Inventory Modal) 완료**: `InventoryModal.jsx` 구축 및 Phaser 연동.
- **퀴즈 엔진 (Quiz Modal) 완료**: `QuizModal.jsx` 구축 및 정답 체크/피드백 시스템 통합.
- **키보드/포인터 입력 통합 완료**: `isUIOpen` 전역 헬퍼를 통해 모달 활성 시 게임 내 캐릭터 이동 및 입력 차단 구현.

### 🚀 3단계: Phaser UI 레이어 정리 (Cleanup)
- React UI가 안정화되면 `UI_Scene.js`에서 직접 캔버스에 그리거나 DOM을 조작하던 구형 코드들을 제거합니다.
- **결과**: `UI_Scene.js`는 오직 조이스틱(캔버스가 유리한 부분)과 'Zustand로 데이터 보내기' 역할만 수행하는 경량 브릿지가 됩니다.

### 🚀 4단계: 고급 기능 도입 (Optimization)
- **애니메이션**: `framer-motion` 등을 도입하여 모달이 뜰 때나 하트가 깎일 때 더 부드러운 UI 연출 추가.
- **상태 최적화**: 게임 중 발생할 수 있는 대량의 위치 정보를 제외한 '상태성 데이터'들만 선별적으로 Zustand에서 관리하도록 고도화.

---

## 4. 최종 목표
Phaser는 **"고성능 게임 렌더링(60 FPS)"**에만 집중하고, React는 **"화면 구성과 사용자 입력(UI/UX)"**을 담당하여 개발 효율성과 유지보수성을 극대화한 현대적인 웹 게임 아키텍처를 완성합니다.
