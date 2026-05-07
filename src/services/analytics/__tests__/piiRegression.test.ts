/**
 * NAS-22 — PII 가드 회귀 테스트.
 * Plan §7 C-Q3 / §5 — 분석 이벤트 페이로드에 별명/메모 평문이 들어가지 않음을 자동 검증.
 *
 * 실행: `npm run test:analytics` (tsx + node:test)
 * 케이스 매트릭스: NAS-22 plan 문서 참조.
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { assertNoPii, PiiViolationError } from '../piiGuard';

const piiInputs: Array<[string, Record<string, unknown>]> = [
  ['C1 별명+메모 평문', { nickname: '홍길동', memo: '무릎통증' }],
  ['C2 복식 상대명', { partner: '김OO/이OO' }],
  ['C3 자유 메모 1KB', { memo: '한글이모지🏸https://x.test/' + 'ㄱ'.repeat(1024) }],
  ['C4 동호회명', { club: '강남배드민턴클럽' }],
  ['C5 검색어', { q: '김OO' }],
  ['C8a 라틴 평문', { name: 'José' }],
  ['C8b 일본어 평문', { name: 'やまだ' }],
  ['C8c 중문 평문', { name: '小李' }],
  ['빈 문자열', { memo: '' }],
];

describe('PII 가드 — 평문 거부 (C1~C5,C8)', () => {
  for (const [label, payload] of piiInputs) {
    it(`거부: ${label}`, () => {
      assert.throws(
        () => assertNoPii('match_record_saved', payload),
        PiiViolationError,
      );
    });
  }
});

describe('PII 가드 — 우회 케이스 거부', () => {
  it('객체 값 거부', () => {
    assert.throws(
      () => assertNoPii('e', { nested: { memo: 'x' } as unknown as boolean }),
      PiiViolationError,
    );
  });
  it('배열 값 거부', () => {
    assert.throws(
      () => assertNoPii('e', { arr: ['김'] as unknown as boolean }),
      PiiViolationError,
    );
  });
  it('Symbol 값 거부', () => {
    assert.throws(
      () => assertNoPii('e', { s: Symbol('x') as unknown as boolean }),
      PiiViolationError,
    );
  });
  it('NaN 거부', () => {
    assert.throws(
      () => assertNoPii('e', { n: Number.NaN }),
      PiiViolationError,
    );
  });
  it('Infinity 거부', () => {
    assert.throws(
      () => assertNoPii('e', { n: Number.POSITIVE_INFINITY }),
      PiiViolationError,
    );
  });
});

describe('PII 가드 — 허용 페이로드 통과 (C7 빈 입력)', () => {
  it('undefined payload 통과', () => {
    assert.doesNotThrow(() => assertNoPii('app_open', undefined));
  });
  it('빈 객체 통과', () => {
    assert.doesNotThrow(() => assertNoPii('app_open', {}));
  });
  it('boolean/number/null/undefined 통과 (match_record_saved 형태)', () => {
    assert.doesNotThrow(() =>
      assertNoPii('match_record_saved', {
        duration_ms: 12345,
        doubles: true,
        has_memo: false,
        optional: null,
        skipped: undefined,
      }),
    );
  });
});

describe('호출 지점 회귀 — MatchEntryScreen match_record_saved 시뮬레이션', () => {
  it('PII가 담긴 draft에서 파생된 페이로드는 boolean/number만 가진다', () => {
    const draft = {
      partnerNickname: '홍길동',
      opponent1Nickname: '김OO',
      opponent2Nickname: '이OO',
      memo: '무릎통증, 다음엔 스매시 자제',
      format: 'doubles' as const,
    };
    const startedAt = Date.now() - 90_000;

    // src/screens/MatchEntryScreen.tsx:98-102 와 동일 형태
    const payload = {
      duration_ms: Date.now() - startedAt,
      doubles: draft.format === 'doubles',
      has_memo: draft.memo.trim().length > 0,
    };

    // 어떤 값도 string/object 가 아님
    for (const [k, v] of Object.entries(payload)) {
      assert.ok(
        typeof v === 'boolean' || typeof v === 'number',
        `${k} must be boolean|number, got ${typeof v}`,
      );
    }
    // 평문 별명/메모가 페이로드 키 또는 값에 등장하지 않음
    const serialized = JSON.stringify(payload);
    for (const leak of [
      draft.partnerNickname,
      draft.opponent1Nickname,
      draft.opponent2Nickname,
      draft.memo,
    ]) {
      assert.ok(
        !serialized.includes(leak),
        `payload leaked plaintext: ${leak}`,
      );
    }
    assert.doesNotThrow(() => assertNoPii('match_record_saved', payload));
  });
});
