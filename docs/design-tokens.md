# 소나배 디자인 토큰 (v0.1)

소스: `src/theme/tokens.ts` — 모든 화면/컴포넌트는 이 토큰을 통해서만 색·간격·타이포를 사용한다. 하드코딩된 값(예: `#FFA500`, `padding: 17`) 금지.

## 컬러 (Light Theme)

| 토큰 | Hex | 용도 |
|---|---|---|
| `colors.primary` | `#F97316` | 주요 액션 (버튼, CTA, 강조) |
| `colors.primaryPressed` | `#EA580C` | primary 버튼 pressed 상태 |
| `colors.primarySubtle` | `#FFEDD5` | secondary 버튼 배경, 강조 칩 |
| `colors.textPrimary` | `#0F172A` | 본문 제목/주요 텍스트 |
| `colors.textSecondary` | `#475569` | 보조 설명 텍스트 |
| `colors.textMuted` | `#94A3B8` | placeholder, 비활성, 보조 메타 |
| `colors.background` | `#FFFFFF` | 화면 배경 |
| `colors.surface` | `#F8FAFC` | 비강조 surface (리스트 영역 등) |
| `colors.surfaceElevated` | `#FFFFFF` | 카드 (그림자 동반) |
| `colors.border` | `#E2E8F0` | 카드/구분선 |
| `colors.success` | `#16A34A` | 승리, 성공 토스트 |
| `colors.danger` | `#DC2626` | 패배, 파괴적 액션, 에러 |
| `colors.warning` | `#F59E0B` | 경고 |

다크모드: MVP 비범위. 토큰 구조는 다크모드 확장을 가정해 구성됨 (`colors.*`만 교체하면 됨).

## 간격 (8pt 변형)

| 토큰 | px |
|---|---|
| `spacing.xs` | 4 |
| `spacing.sm` | 8 |
| `spacing.md` | 12 |
| `spacing.lg` | 16 |
| `spacing.xl` | 24 |
| `spacing.xxl` | 32 |
| `spacing.xxxl` | 48 |

## 모서리

| 토큰 | px | 용도 |
|---|---|---|
| `radius.sm` | 6 | 칩, 작은 input |
| `radius.md` | 10 | 버튼 |
| `radius.lg` | 14 | 카드 |
| `radius.pill` | 999 | 둥근 칩/뱃지 |

## 타이포

폰트: 시스템 기본 (Pretendard 도입은 후속 이슈에서 — 지금 단계에선 시스템 폰트 사용해 빌드 충돌 가능성 제거).

| 토큰 | size / line-height / weight | 용도 |
|---|---|---|
| `typography.display` | 28 / 36 / 700 | 화면 타이틀 |
| `typography.title` | 22 / 30 / 700 | 카드 타이틀 |
| `typography.heading` | 18 / 26 / 600 | 섹션 헤딩 |
| `typography.body` | 16 / 24 / 400 | 본문 |
| `typography.bodyStrong` | 16 / 24 / 600 | 본문 강조, 버튼 라벨 |
| `typography.caption` | 13 / 18 / 400 | 보조 메타 |
| `typography.label` | 12 / 16 / 600 | 폼 라벨, 칩 |

## 그림자

| 토큰 | 사양 |
|---|---|
| `shadows.card` | iOS: opacity .06, radius 12, offset (0,4). Android: elevation 2. |

## 베이스 컴포넌트

- `Button` (`src/components/Button.tsx`) — variant: `primary` / `secondary` / `ghost`. 최소 hit area 48dp.
- `Card` (`src/components/Card.tsx`) — surface + border + 그림자.

## 익명 user_id

`src/services/userId.ts`:
- 첫 진입 시 `expo-crypto`의 `randomUUID()`로 UUID v4 생성
- `expo-secure-store`로 키 `sonabae.user_id.v1` 영구 저장
- 디바이스 재기동/앱 재실행 후에도 동일 user_id 반환
- 앱 삭제 시 새 user_id 발급 (스펙대로 의도된 동작 — Plan §5.3)
- 외부 분석 이벤트로 보낼 때는 별도 익명화 라운드를 거친 후에만 노출 (Plan §5.2)
