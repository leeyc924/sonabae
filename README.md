# 소나배

소나배는 `docs/SONABAE_PRD.md`와 `DESIGN.md`를 기준으로 만든 Expo React Native MVP입니다.

## 실행

```bash
npm install
npm run web
```

모바일 기기에서는 Expo Go로 `npm start`의 QR 코드를 열면 됩니다.

## 구현 범위

- 초기 프로필 설정: 닉네임, 현재 급수, 목표 급수
- 홈 대시보드: 현재/목표 급수, 전체 승률, 최근 운동일지, 빠른 기록
- 운동일지 작성: 날짜, 모임/대회/연습 구분, 장소, 메모, 경기 여러 개 추가
- 경기 기록: 단식/복식, 파트너/상대 선택, 점수 기반 승패 자동 계산, 수동 승패
- 사람 관리: 추가, 수정, 삭제, 사람별 승률
- 모임 관리: 추가, 수정, 삭제, 모임별 활동일/경기 수/승률
- 대회 관리: 추가, 수정, 삭제, 대회별 승률과 결과 메모
- 통계: 전체/사람별/모임별/대회별, 전체/7일/30일/90일/올해 필터
- 내 정보: 급수 수정, 급수 변경 이력, 데이터 초기화
- 데이터 저장: 앱 로컬 영속 저장소 기반 저장

## 데이터 저장 메모

현재 저장소에는 Firebase 프로젝트 설정값이 없으므로 실행 가능한 MVP를 위해 `@react-native-async-storage/async-storage`를 사용합니다. Firebase Anonymous Auth와 Firestore 연동은 같은 `AppData` 모델을 기준으로 저장소 레이어만 교체하면 됩니다.

## 검증

```bash
npm run typecheck
npx expo export --platform web
```
