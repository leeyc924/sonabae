# NAS-26 — Background autosave 시뮬레이터 자동화 Runbook

## 목적
`MatchEntryScreen` `AppState` `background`/`inactive` 핸들러가 draft를
AsyncStorage에 신뢰성 있게 저장하는지 iOS Simulator + Android Emulator에서 자동 검증.

## 사전 준비
1. Maestro CLI 설치: `curl -fsSL "https://get.maestro.mobile.dev" | bash`
   PATH: `export PATH="$PATH:$HOME/.maestro/bin"`
2. 시뮬레이터에 sonabae 설치본 필요. 옵션:
   - **iOS**: `npx expo run:ios --device "iPhone 15"` (최초 빌드 5–15분, CocoaPods 필요)
   - **Android**: `npx expo run:android` (Android Studio + emulator 부팅 필요)
   - 또는 EAS internal build를 다운로드해서 `xcrun simctl install booted <app>.app` /
     `adb install <app>.apk`
3. bundle id: `ai.worxphere.sonabae` (app.json 기준)

## 실행
```bash
export PATH="$PATH:$HOME/.maestro/bin"
cd e2e/maestro
maestro test flows/case1-background-restore.yaml --format junit --output ../reports/case1.xml
maestro test flows/case2-lock-restore.yaml       --format junit --output ../reports/case2.xml
maestro test flows/case3-force-kill.yaml         --format junit --output ../reports/case3.xml
```

iOS / Android 양쪽에서 한 번씩 실행. 각각 결과 첨부.

## 합격 기준 (운영자 코멘트 b12895ab)
- iOS·Android Simulator 모두 case 1·2 PASS
- case 3은 결과만 기록(소실 정상 가능)

## 자동화 한계
- iOS Simulator는 진짜 device-lock을 직접 트리거하지 못함. case 2는 home press +
  relaunch로 `inactive` 상태를 근사한다. 실 디바이스 lock과 100% 동일하지 않으므로,
  운영자가 final-handoff에서 한 번은 실기 lock 검증이 필요할 수 있음 (정책 위반 아님:
  자동화 시도 후 잔여 항목으로 분류).
- 햅틱·실제 force-kill OOM 거동은 자동화 범위 밖.

## 다음 액션 (현재 차단)
- 시뮬레이터 빌드(`expo run:ios`/`run:android`)는 본 heartbeat에서 완수 못 함:
  Xcode/CocoaPods 설치 상태 + 빌드 시간 의존. App Developer가 dev-client
  simulator artifact를 제공하면 즉시 위 `maestro test` 실행 가능.
