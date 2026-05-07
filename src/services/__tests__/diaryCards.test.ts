/**
 * NAS-16 — buildDiaryCards 단위 테스트.
 * 실행: `npm run test:diary` (tsx + node:test)
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { DiaryMatch, buildDiaryCards } from '../diary';

const baseRecord = (over: Partial<DiaryMatch>): DiaryMatch => ({
  id: over.id ?? 'r-' + Math.random(),
  date: over.date ?? '2026-05-07',
  myScore: over.myScore ?? 21,
  opponentScore: over.opponentScore ?? 15,
  memo: over.memo ?? '',
});

describe('buildDiaryCards', () => {
  it('빈 입력은 빈 배열을 반환', () => {
    assert.deepEqual(buildDiaryCards([], '2026-05-07'), []);
  });

  it('같은 날짜 경기를 한 카드로 묶고 승/패/메모 집계', () => {
    const matches = [
      baseRecord({ id: '1', myScore: 21, opponentScore: 15, memo: '컨디션 좋음' }),
      baseRecord({ id: '2', myScore: 18, opponentScore: 21, memo: '서브 약함' }),
      baseRecord({ id: '3', myScore: 21, opponentScore: 19 }),
    ];
    const cards = buildDiaryCards(matches, '2026-05-07');
    assert.equal(cards.length, 1);
    const c = cards[0];
    assert.equal(c.date, '2026-05-07');
    assert.equal(c.matchCount, 3);
    assert.equal(c.wins, 2);
    assert.equal(c.losses, 1);
    assert.deepEqual(c.memos, ['컨디션 좋음', '서브 약함']);
    assert.deepEqual(c.matchIds, ['1', '2', '3']);
  });

  it('서로 다른 날짜는 시간 역순으로 정렬', () => {
    const cards = buildDiaryCards(
      [
        baseRecord({ id: 'a', date: '2026-04-30' }),
        baseRecord({ id: 'b', date: '2026-05-07' }),
        baseRecord({ id: 'c', date: '2026-05-01' }),
      ],
      '2026-05-07',
    );
    assert.deepEqual(cards.map((c) => c.date), ['2026-05-07', '2026-05-01', '2026-04-30']);
  });

  it('30일 이전 기록은 제외', () => {
    const cards = buildDiaryCards(
      [
        baseRecord({ id: 'recent', date: '2026-04-08' }),  // 29일 전 → 포함
        baseRecord({ id: 'old', date: '2026-04-07' }),     // 30일 전 → 제외
        baseRecord({ id: 'older', date: '2026-04-01' }),   // 36일 전 → 제외
      ],
      '2026-05-07',
    );
    assert.deepEqual(cards.map((c) => c.date), ['2026-04-08']);
  });

  it('미래 날짜는 제외 (음수 diff)', () => {
    const cards = buildDiaryCards(
      [
        baseRecord({ id: 'today', date: '2026-05-07' }),
        baseRecord({ id: 'future', date: '2026-05-08' }),
      ],
      '2026-05-07',
    );
    assert.deepEqual(cards.map((c) => c.date), ['2026-05-07']);
  });

  it('잘못된 날짜는 무시', () => {
    const cards = buildDiaryCards(
      [
        baseRecord({ id: 'bad', date: '2026-13-40' }),
        baseRecord({ id: 'good', date: '2026-05-07' }),
      ],
      '2026-05-07',
    );
    assert.equal(cards.length, 1);
    assert.equal(cards[0].matchIds[0], 'good');
  });

  it('동점은 패로 집계 (배드민턴 무승부 없음)', () => {
    const cards = buildDiaryCards(
      [baseRecord({ myScore: 20, opponentScore: 20 })],
      '2026-05-07',
    );
    assert.equal(cards[0].wins, 0);
    assert.equal(cards[0].losses, 1);
  });
});
