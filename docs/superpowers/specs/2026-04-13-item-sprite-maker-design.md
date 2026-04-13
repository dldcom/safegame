# Item Sprite Maker 설계

## 개요
1024x1024 AI 생성 이미지를 배경 제거 후 32x32 스프라이트로 변환하여 DB에 저장하는 페이지

## 페이지 구조
- 올인원 캔버스 + 일괄 처리 방식 (`/item-maker`)
- 왼쪽: 이미지 업로드 목록 (여러 개 동시 업로드)
- 오른쪽: 선택한 이미지의 편집 캔버스

## 작업 흐름
1. 이미지 업로드 (1024x1024 여러 장)
2. 목록에서 하나 선택
3. 컬러 피커로 배경색 클릭 → 배경 제거 (threshold 슬라이더)
4. 캔버스에서 위치/크기 조정 → 32x32 미리보기 확인
5. 아이템 정보 입력 (itemId, name, category, stageNum)
6. 저장 → 서버에 PNG 파일 + DB에 Item 레코드
7. 다음 이미지 선택 → 반복

## 배경 제거
- 캔버스에서 배경색 클릭 (직접 클릭)
- RGB 거리 기반 유사 색상 투명 처리
- threshold 슬라이더 (0~100)
- 실시간 미리보기

## 저장 방식
- 클라이언트: Canvas → 32x32 PNG blob → FormData
- 서버: Multer → `server/public/uploads/items/` 저장
- DB: Prisma Item 모델

## Prisma 모델
```prisma
model Item {
  id        Int      @id @default(autoincrement())
  itemId    String   @unique
  name      String
  category  String
  imagePath String
  stageNum  Int
  createdAt DateTime @default(now())
  @@map("items")
}
```

## 서버 라우트
- POST /api/item/upload — 이미지 + 메타데이터 저장
- GET /api/item/list — 아이템 목록 조회 (stageNum 필터)

## 라우팅
- App.jsx에 `/item-maker → ItemMaker` 추가
