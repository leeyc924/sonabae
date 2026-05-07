/**
 * 컴파일 타임 PII 가드 검증. `tsc --noEmit` 통과 = 가드 동작.
 * 이 파일은 런타임 실행되지 않는다 — 타입 시스템에 대한 어서션이다.
 */
import { track } from '../analytics';
import { assertNoPii, PiiViolationError } from '../piiGuard';

async function _compileChecks() {
  // OK: payload 없는 이벤트
  await track('app_open');
  await track('diary_viewed');
  await track('stats_viewed');
  await track('match_record_started');

  // OK: 허용된 primitive 페이로드
  await track('match_record_saved', {
    duration_ms: 1234,
    doubles: true,
    has_memo: false,
  });

  // ERROR: 별명/메모 평문 추가 시도 — 컴파일 거부되어야 함
  await track('match_record_saved', {
    duration_ms: 100,
    doubles: false,
    has_memo: false,
    // @ts-expect-error memo 같은 string 필드는 PII 위험 — 컴파일 차단
    memo: 'secret memo text',
  });

  await track('match_record_saved', {
    duration_ms: 100,
    doubles: false,
    has_memo: false,
    // @ts-expect-error 닉네임 등 string 필드 차단
    nickname: 'leo',
  });

  // @ts-expect-error 알 수 없는 이벤트명 차단
  await track('arbitrary_event');

  // @ts-expect-error payload 누락
  await track('match_record_saved');

  // 런타임 가드 동작 확인용 타입 체크
  try {
    assertNoPii('test', { ok: true, n: 1 });
  } catch (e) {
    if (e instanceof PiiViolationError) {
      const _f: string = e.field;
      void _f;
    }
  }
}
void _compileChecks;
