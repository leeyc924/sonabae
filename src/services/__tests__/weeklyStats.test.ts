/**
 * NAS-17 — buildWeeklyStats 단위 테스트.
 * 실행: `npm run test:weekly` (tsx + node:test)
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { WeeklyMatch, buildWeeklyStats } from '../weeklyStats';

const m = (over: Partial<WeeklyMatch>): WeeklyMatch => ({
  id: over.id ?? 'r-' + Math.random(),
  date: over.date ?? '2026-05-07',
  format: over.format ?? 'doubles',
  partnerNickname: over.partnerNickname ?? null,
  myScore: over.myScore ?? 21,
  opponentScore: over.opponentScore ?? 15,
});

describe('buildWeeklyStats', () => {
  it('빈 입력은 0건/0% 통계와 빈 파트너 리스트', () => {
    const s = buildWeeklyStats([], '2026-05-07');
    assert.equal(s.totalMatches, 0);
    assert.equal(s.wins, 0);
    assert.equal(s.losses, 0);
    assert.equal(s.winRate, 0);
    assert.deepEqual(s.topPartners, []);
  });

  it('최근 7일만 포함 (오늘 포함, 8일 전 제외)', () => {
    const s = buildWeeklyStats(
      [
        m({ id: '1', date: '2026-05-07' }), // 오늘
        m({ id: '2', date: '2026-05-01' }), // 6일 전
        m({ id: '3', date: '2026-04-30' }), // 7일 전 → 제외
        m({ id: '4', date: '2026-05-08' }), // 미래 → 제외
      ],
      '2026-05-07',
    );
    assert.equal(s.totalMatches, 2);
  });

  it('승률은 wins/total, 반올림 정수%', () => {
    const s = buildWeeklyStats(
      [
        m({ id: '1', myScore: 21, opponentScore: 19 }),
        m({ id: '2', myScore: 21, opponentScore: 19 }),
        m({ id: '3', myScore: 15, opponentScore: 21 }),
      ],
      '2026-05-07',
    );
    assert.equal(s.wins, 2);
    assert.equal(s.losses, 1);
    assert.equal(s.winRate, 67);
  });

  it('파트너 빈도수 Top 3 (싱글 경기는 제외)', () => {
    const s = buildWeeklyStats(
      [
        m({ id: '1', partnerNickname: '민수' }),
        m({ id: '2', partnerNickname: '민수' }),
        m({ id: '3', partnerNickname: '지영' }),
        m({ id: '4', partnerNickname: '철수' }),
        m({ id: '5', partnerNickname: '영희' }),
        m({ id: '6', format: 'singles', partnerNickname: null }),
      ],
      '2026-05-07',
    );
    assert.equal(s.topPartners.length, 3);
    assert.deepEqual(s.topPartners[0], { nickname: '민수', count: 2 });
    const names = s.topPartners.map((p) => p.nickname);
    assert.ok(names.includes('지영'));
    assert.ok(!names.includes('영희') || s.topPartners.length === 3);
  });

  it('동점은 패로 집계', () => {
    const s = buildWeeklyStats(
      [m({ myScore: 20, opponentScore: 20 })],
      '2026-05-07',
    );
    assert.equal(s.wins, 0);
    assert.equal(s.losses, 1);
    assert.equal(s.winRate, 0);
  });

  it('잘못된 날짜는 무시', () => {
    const s = buildWeeklyStats(
      [
        m({ id: 'bad', date: '2026-13-40' }),
        m({ id: 'good', date: '2026-05-07' }),
      ],
      '2026-05-07',
    );
    assert.equal(s.totalMatches, 1);
  });
});
