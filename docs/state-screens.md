# 상태 화면 5종 디자인 명세 (M6 / NAS-19)

모든 화면은 `SafeAreaView` 위 `padding: spacing.lg`, 본문은 세로 중앙, 액션은 하단
고정. 글리프는 88×88 원형 배경 + 이모지(임시, 후속 아이콘 셋 교체 예정).

| 상태       | tone     | 글리프 | 제목                 | 본문 요지                                           | Primary CTA            | Secondary CTA              |
| ---------- | -------- | ------ | -------------------- | --------------------------------------------------- | ---------------------- | -------------------------- |
| 빈         | neutral  | (샘플 카드) | 오늘의 일기          | 첫 진입 가이드 + 샘플 카드(스코어/메모) 노출        | 경기 기록하기          | 샘플처럼 내 기록 만들기    |
| 에러       | danger   | ⚠️     | 저장에 실패했어요    | 임시 보관 안내 + 오류 코드(있으면)                  | 다시 시도              | 임시 저장만 두기 (ghost)   |
| 권한 거부  | warning  | 🔔     | 알림 권한이 꺼져 있어요 | 5분 후 알림의 가치 설명, 강요하지 않음              | 설정에서 알림 켜기     | 나중에 할게요 (ghost)      |
| 오프라인   | info     | 📡     | 오프라인 상태예요    | 로컬 보관 N건/자동 동기화 안내                      | 다시 연결 시도         | 오프라인으로 계속하기 (ghost) |
| 로딩       | neutral  | spinner | 일기를 불러오고 있어요 | 짧은 안내 1줄                                       | —                      | —                          |

## 컴포넌트

- `components/StateView.tsx` — 5종 모두의 베이스. tone/glyph/title/body/primary/secondary/loading slot.
- `screens/states/EmptyState.tsx` — 샘플 카드 + 두 개의 카드(샘플, CTA) 구조.
- `screens/states/ErrorState.tsx` — 오류 코드 디테일 박스 옵션.
- `screens/states/PermissionDeniedState.tsx`
- `screens/states/OfflineState.tsx` — `pendingCount` prop으로 동기화 대기 건수 노출.
- `screens/states/LoadingState.tsx`
- `screens/states/StateGallery.tsx` — 개발/디자인 검토용 탭 전환 갤러리.

## 완료 조건 매핑

- ✅ 5종 모두 디자인 명세 + 구현
- ✅ 첫 진입 빈 상태에 샘플 카드 + CTA(`경기 기록하기`)

## 후속 작업 (Out of scope)

- 실제 라우팅 연결(빈/로딩 → 일기 작성, 권한 → Linking.openSettings, 오프라인 → NetInfo 훅)은 라우팅/네트워크 작업(다른 마일스톤)에서 연결.
- 이모지 글리프는 실제 아이콘 셋(예: lucide-react-native) 도입 시 교체.
