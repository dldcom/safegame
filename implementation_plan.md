# 학생 대시보드 게이미피케이션 업그레이드 계획

학생들의 학습 동기 부여를 위해 경험치(EXP), 레벨, 퀴즈 시스템, 수집 도감 및 리더보드를 도입합니다.

## 1. 데이터 모델 및 백엔드 확장 (Data & Backend)

### 1-1. `User` 스키마 업데이트
- `exp`: 현재 레벨 내 경험치 (Number)
- `totalExp`: 누적 총 경험치 (리더보드용)
- `level`: 현재 등급 단계 (Number)
- `collection`: 획득한 아이템 ID 배열 (Array of Strings)
- `clearedStages`: 클리어한 스테이지 배열 (Array of Numbers)

### 1-2. 백엔드 API 구현 (`/api/student`)
- `POST /update-exp`: 스테이지 클리어 또는 퀴즈 정답 시 경험치 반영 및 레벨업 계산
- `GET /leaderboard`: 상위 10명의 학생 리스트 반환 (이름, 레벨, 총 경험치)
- `POST /add-collection`: 게임 중 획득한 아이템을 도감에 추가

## 2. 등급 및 포인트 시스템 (Ranking System)

### 등급 체계 (Rank Titles)
- **Lv.1 ~ 5**: 안전 지망생 (Aspirant)
- **Lv.6 ~ 10**: 안전 지킴이 (Guardian)
- **Lv.11 ~ 15**: 안전 요원 (Agent)
- **Lv.16 ~ 20**: 안전 전문가 (Expert)
- **Lv.21 ~**: 안전 마스터 (Master)

### 경험치 획득 밸런스
- **스테이지 클리어**: 100 EXP
- **퀴즈 정답 (개당)**: 20 EXP
- **골든벨 보너스 (5연속 정답)**: 50 EXP

## 3. 프론트엔드 UI/UX 강화 (Frontend)

### 3-1. 대시보드 상단 (Header Update)
- 시각적인 **경험치 바(ProgressBar)** 구현
- 현재 등급 칭호 및 레벨 표시
- 학생 아바타 섹션 강화

### 3-2. '안전 퀴즈' 시스템
- **스테이지별 퀴즈**: 클리어한 스테이지의 내용 복습
- **도전! 골든벨**: 전체 범위를 아우르는 랜덤 퀴즈 모드
- 퀴즈 완료 시 화려한 경험치 획득 애니메이션 추가

### 3-3. '나만의 안전 도감' (Encyclopedia)
- 획득한 아이템(소화기, 붕대 등)을 보여주는 갤러리 뷰
- 각 아이템 클릭 시 팝업으로 실제 안전 수칙 설명 제공

### 3-4. 리더보드 (Rankings)
- 대시보드 측면 또는 별도 탭에 학급 전체 순위 표시
- 내 순위 강조 표시

## 4. 구현 단계 (Execution Steps)

1. **[Backend]** `User.js` 모델 수정 및 서버 재시작
2. **[Backend]** 경험치 업데이트 및 리더보드 조회 API 경로 추가
3. **[Frontend]** `StudentDashboard.jsx` 레이아웃 개편 및 경험치 바 컴포넌트 추가
4. **[Frontend]** 퀴즈 모달 시스템 및 골든벨 로직 구현
5. **[Frontend]** 도감(Collection) 모달 및 데이터 바인딩
6. **[Frontend]** 전체 통합 테스트 및 애니메이션 폴리싱
