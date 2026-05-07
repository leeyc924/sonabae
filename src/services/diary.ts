import { isValidIsoDate, todayIso } from './dateUtils';

export type DiaryMatch = {
  id: string;
  date: string;
  myScore: number;
  opponentScore: number;
  memo: string;
};

export type DiaryCard = {
  date: string;
  matchCount: number;
  wins: number;
  losses: number;
  memos: string[];
  matchIds: string[];
};

const DIARY_WINDOW_DAYS = 30;

function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.UTC(
    Number(fromIso.slice(0, 4)),
    Number(fromIso.slice(5, 7)) - 1,
    Number(fromIso.slice(8, 10)),
  );
  const b = Date.UTC(
    Number(toIso.slice(0, 4)),
    Number(toIso.slice(5, 7)) - 1,
    Number(toIso.slice(8, 10)),
  );
  return Math.round((b - a) / 86_400_000);
}

export function buildDiaryCards(
  matches: readonly DiaryMatch[],
  todayIsoDate: string = todayIso(),
): DiaryCard[] {
  const byDate = new Map<string, DiaryCard>();
  for (const m of matches) {
    if (!isValidIsoDate(m.date)) continue;
    const diff = daysBetween(m.date, todayIsoDate);
    if (diff < 0 || diff >= DIARY_WINDOW_DAYS) continue;

    const card =
      byDate.get(m.date) ??
      { date: m.date, matchCount: 0, wins: 0, losses: 0, memos: [], matchIds: [] };
    const isWin = m.myScore > m.opponentScore;
    const next: DiaryCard = {
      ...card,
      matchCount: card.matchCount + 1,
      wins: card.wins + (isWin ? 1 : 0),
      losses: card.losses + (isWin ? 0 : 1),
      memos: m.memo ? [...card.memos, m.memo] : card.memos,
      matchIds: [...card.matchIds, m.id],
    };
    byDate.set(m.date, next);
  }
  return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}
