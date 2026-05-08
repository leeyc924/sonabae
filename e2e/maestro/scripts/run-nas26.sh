#!/usr/bin/env bash
# NAS-26 / NAS-41 자동화 실행 스크립트
# 전제: Xcode.app 활성화(`sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`)
#       및 라이선스 수락(`sudo xcodebuild -license accept`)이 완료되어 있어야 함.
#
# 사용법:
#   ./e2e/maestro/scripts/run-nas26.sh ios     # iOS Simulator 빌드 + maestro
#   ./e2e/maestro/scripts/run-nas26.sh android # Android Emulator 빌드 + maestro
#   ./e2e/maestro/scripts/run-nas26.sh both    # 둘 다 (순차)
#
# 결과 로그: e2e/maestro/results/<platform>-<timestamp>/

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO_ROOT"

PLATFORM="${1:-both}"
TS="$(date +%Y%m%d-%H%M%S)"
RESULTS_ROOT="$REPO_ROOT/e2e/maestro/results"
mkdir -p "$RESULTS_ROOT"

export PATH="$HOME/.maestro/bin:$HOME/Library/Android/sdk/platform-tools:$HOME/Library/Android/sdk/emulator:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"

run_ios() {
  local OUT="$RESULTS_ROOT/ios-$TS"
  mkdir -p "$OUT"
  echo "[ios] booting simulator" | tee -a "$OUT/run.log"
  local DEVICE_ID
  DEVICE_ID="$(xcrun simctl list devices available -j | python3 -c "import json,sys;d=json.load(sys.stdin);[print(dev['udid']) or sys.exit(0) for k,v in d['devices'].items() if 'iOS' in k for dev in v if 'iPhone' in dev['name']]" | head -1)"
  if [ -z "$DEVICE_ID" ]; then
    echo "[ios] no iPhone simulator available" | tee -a "$OUT/run.log"
    return 1
  fi
  xcrun simctl boot "$DEVICE_ID" 2>&1 | tee -a "$OUT/run.log" || true
  open -a Simulator
  echo "[ios] pod install" | tee -a "$OUT/run.log"
  ( cd ios && pod install ) 2>&1 | tee -a "$OUT/pod-install.log"
  echo "[ios] xcodebuild" | tee -a "$OUT/run.log"
  xcodebuild -workspace ios/sonabae.xcworkspace -scheme sonabae -configuration Debug \
    -sdk iphonesimulator -derivedDataPath ios/build \
    -destination "id=$DEVICE_ID" build 2>&1 | tee "$OUT/xcodebuild.log"
  local APP_PATH
  APP_PATH="$(find ios/build/Build/Products -name 'sonabae.app' -type d | head -1)"
  echo "[ios] installing $APP_PATH" | tee -a "$OUT/run.log"
  xcrun simctl install "$DEVICE_ID" "$APP_PATH" 2>&1 | tee -a "$OUT/run.log"
  echo "[ios] running maestro" | tee -a "$OUT/run.log"
  ( cd e2e/maestro && maestro test flows/ ) 2>&1 | tee "$OUT/maestro.log" || true
  echo "[ios] done -> $OUT"
}

run_android() {
  local OUT="$RESULTS_ROOT/android-$TS"
  mkdir -p "$OUT"
  echo "[android] booting emulator Medium_Phone_API_36.0" | tee -a "$OUT/run.log"
  ( emulator -avd Medium_Phone_API_36.0 -no-snapshot-save >"$OUT/emulator.log" 2>&1 & )
  echo "[android] waiting for device" | tee -a "$OUT/run.log"
  adb wait-for-device
  # wait until boot completed
  local TRIES=0
  while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
    sleep 3
    TRIES=$((TRIES+1))
    if [ $TRIES -gt 60 ]; then
      echo "[android] boot timeout" | tee -a "$OUT/run.log"
      return 1
    fi
  done
  echo "[android] gradle assembleDebug" | tee -a "$OUT/run.log"
  ( cd android && ./gradlew assembleDebug ) 2>&1 | tee "$OUT/gradle.log"
  local APK="android/app/build/outputs/apk/debug/app-debug.apk"
  echo "[android] installing $APK" | tee -a "$OUT/run.log"
  adb install -r "$APK" 2>&1 | tee -a "$OUT/run.log"
  echo "[android] running maestro" | tee -a "$OUT/run.log"
  ( cd e2e/maestro && maestro test flows/ ) 2>&1 | tee "$OUT/maestro.log" || true
  echo "[android] done -> $OUT"
}

case "$PLATFORM" in
  ios) run_ios ;;
  android) run_android ;;
  both) run_ios; run_android ;;
  *) echo "usage: $0 {ios|android|both}"; exit 2 ;;
esac
