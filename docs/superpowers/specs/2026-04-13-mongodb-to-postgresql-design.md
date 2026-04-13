# MongoDB to PostgreSQL + Prisma Migration Design

## Overview
SafeGame 서버의 데이터베이스를 MongoDB/Mongoose에서 PostgreSQL/Prisma로 전환한다.

## Approach
- **ORM**: Prisma (자동 타입 생성, 마이그레이션 관리)
- **테이블 설계**: 하이브리드 (정규화 + JSONB)
  - `inventory`, `progress` → 별도 테이블 (검색/수정 빈번)
  - `itemCollection`, `clearedStages` → PostgreSQL 배열 타입
  - `atlasData`, `content` → JSONB

## Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | autoincrement |
| username | VARCHAR UNIQUE | |
| password | VARCHAR | bcrypt hashed |
| role | ENUM(STUDENT,TEACHER) | default STUDENT |
| characterSkin | VARCHAR | default "character_default" |
| customCharacterId | INT? FK→characters | |
| gold | INT | default 0 |
| points | INT | default 10000 |
| exp | INT | default 0 |
| totalExp | INT | default 0 |
| level | INT | default 1 |
| equippedSkin | VARCHAR | default "skin_default" |
| equippedTitle | VARCHAR | default "초보 구조대" |
| itemCollection | TEXT[] | |
| clearedStages | INT[] | |
| quizProgress | INT | default 0 |
| createdAt | TIMESTAMP | default now() |

### user_inventory
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| userId | INT FK→users | |
| itemId | VARCHAR | |
| name | VARCHAR | |
| category | VARCHAR | |
| equipped | BOOLEAN | default false |

### user_progress
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| userId | INT FK→users | |
| stageNum | INT | |
| isCleared | BOOLEAN | default false |
| topScore | INT | default 0 |
| updatedAt | TIMESTAMP | default now() |
| | UNIQUE(userId, stageNum) | |

### characters
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| name | VARCHAR | |
| imagePath | VARCHAR | |
| atlasData | JSONB | animation frame data |
| creatorId | INT? | |
| createdAt | TIMESTAMP | default now() |

### maps
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| mapId | VARCHAR UNIQUE | |
| title | VARCHAR | |
| author | VARCHAR | |
| content | JSONB | Tiled JSON structure |
| createdAt | TIMESTAMP | default now() |

### npcs
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| name | VARCHAR | |
| imagePath | VARCHAR | |
| atlasData | JSONB | animation frame data |
| creatorId | INT? | |
| createdAt | TIMESTAMP | default now() |

## Files to Change

### New files
- `server/prisma/schema.prisma` — Prisma schema
- `server/lib/prisma.js` — Prisma client singleton
- `server/lib/password.js` — password hash/compare utility

### Modified files
- `server/package.json` — remove mongoose, add prisma + @prisma/client
- `server/server.js` — remove mongoose connection, add prisma
- `server/routes/auth.js` — mongoose → prisma queries
- `server/routes/student.js` — mongoose → prisma + fix collection bug
- `server/routes/shop.js` — mongoose → prisma
- `server/routes/character.js` — mongoose → prisma
- `server/routes/map.js` — mongoose → prisma
- `server/routes/npc.js` — mongoose → prisma
- `docker-compose.yml` — mongo service → postgres service
- `server/Dockerfile` — add prisma generate step

### Deleted files
- `server/models/User.js`
- `server/models/Character.js`
- `server/models/Map.js`
- `server/models/Npc.js`

## Bug Fixes
- `student.js:81` — `user.collection` → `user.itemCollection` (field name mismatch)
