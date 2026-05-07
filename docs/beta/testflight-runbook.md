# TestFlight 베타 빌드 런북 (NAS-31)

본 문서는 외부 테스터(베타 10인) 그룹에 iOS 빌드를 업로드하기 위한 절차 + 분석 이벤트 수신 스모크 절차를 명시한다. 실행은 자격증명 확보 이후 1회 heartbeat 안에 끝낸다.

## 0. 필요한 자격증명·자원 (선결 조건)

CEO/PO 가 다음을 회사 1Password 에 적재한 뒤 AppDeveloper 에 위임:

- Apple Developer Program 팀 ID (`appleTeamId`)
- App Store Connect 앱 레코드 + 앱 ID (`ascAppId`), bundle id `ai.worxphere.sonabae`
- App Store Connect API Key (`.p8` + key id + issuer id) — EAS submit 용
- Expo 조직 계정 + EAS 프로젝트 (slug `sonabae`)
- O5 SaaS write key (베타 채널) → `EXPO_PUBLIC_O5_WRITE_KEY`
- TestFlight 외부 테스터 그룹명: `Beta-NAS23` (PO 가 이메일 일괄 초대; 절차는 `./testflight-invite-ops.md`)

위 항목 중 하나라도 빠지면 빌드 명령 실행 불가 → 이슈 blocked.

## 1. 빌드

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure   # 최초 1회
npx eas-cli@latest build --profile beta --platform ios --non-interactive
```

`eas.json` 의 `build.beta.ios` 가 `autoIncrement: buildNumber` 이므로 buildNumber 는 자동 +1.

## 2. TestFlight 제출

```bash
npx eas-cli@latest submit --profile beta --platform ios --latest
```

성공 시 App Store Connect → TestFlight → 외부 그룹 `Beta-NAS23` 에 빌드 추가 (수동 1회).
변경 노트 양식:

```
build {version}+{buildNumber}
- 베타 D-3 첫 외부 빌드
- 일기 작성 / 경기 기록 / 상태 화면 검증 대상
- 익명 user_id 로 분석 이벤트 송출 (별명 평문 0건)
```

## 3. 분석 이벤트 수신 스모크 (1대 디바이스)

전제: NAS-22 PII 가드 회귀 통과.

테스트 시퀀스 (TestFlight 빌드 1대로):

| # | 동작 | 기대 이벤트 | 페이로드 |
|---|------|-------------|----------|
| 1 | 앱 콜드 스타트 | `app_open` | (없음) |
| 2 | 일기 화면 진입 | `diary_viewed` | (없음) |
| 3 | 경기 기록 시작 | `match_record_started` | (없음) |
| 4 | 경기 저장 | `match_record_saved` | `duration_ms` (number), `doubles` (bool), `has_memo` (bool) |
| 5 | 통계 진입 | `stats_viewed` | (없음) |

### 검증 절차

1. O5 대시보드 Live Events 뷰를 device user_id 필터로 연다.
2. 각 단계 직후 5초 내 도달 여부 확인.
3. 페이로드 키 집합이 `events.ts` 와 정확히 일치 — 별명·메모·상대 별명 키가 없는지 검사.
4. user_id 가 `expo-secure-store` 에서 발급된 익명 UUID 형식인지 (이메일/전화번호 형태 0건) 검사.
5. 캡처 스크린샷 첨부 시 `pii-guard-checklist.md` 에 따라 user_id 부분도 마스킹.

### 합격 기준

- 5개 이벤트 모두 수신.
- 페이로드 키가 스키마 외 0건.
- raw 페이로드에 한글/이메일/숫자 이외 별명 후보 문자열 0건.

## 4. NAS-23 회신 양식

```
build: {version}+{buildNumber}
testflight group: Beta-NAS23
analytics smoke: PASS (5/5 events received)
pii guard: PASS (payload keys match schema, 0 free-text)
release notes: ./docs/beta/testflight-runbook.md §2
```

## 5. 알려진 한계

- 현재 `provider.ts` 는 `consoleProvider` noop. O5 어댑터 구현은 자격증명 확보 후 별도 child issue.
- 본 절차는 iOS 단일. Android 베타는 별도 트랙으로 분리.
