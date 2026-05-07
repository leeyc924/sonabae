import { isValidIsoDate, todayIso } from './dateUtils';

export type WeeklyMatch = {
  id: string;
  date: string;
  format: 'doubles' | 'singles';
  partnerNickname: string | null;
  myScore: number;
  opponentScore: number;
};

export type PartnerCount = {
  nickname: string;
  count: number;
};

export type WeeklyStats = {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  topPartners: PartnerCount[];
};

const WEEKLY_WINDOW_DAYS = 7;
const TOP_PARTNER_LIMIT = 3;

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

export function buildWeeklyStats(
  matches: readonly WeeklyMatch[],
  todayIsoDate: string = todayIso(),
): WeeklyStats {
  let total = 0;
  let wins = 0;
  const partnerCounts = new Map<string, number>();

  for (const match of matches) {
    if (!isValidIsoDate(match.date)) continue;
    const diff = daysBetween(match.date, todayIsoDate);
    if (diff < 0 || diff >= WEEKLY_WINDOW_DAYS) continue;

    total += 1;
    if (match.myScore > match.opponentScore) wins += 1;

    if (match.format === 'doubles' && match.partnerNickname) {
      const key = match.partnerNickname;
      partnerCounts.set(key, (partnerCounts.get(key) ?? 0) + 1);
    }
  }

  const losses = total - wins;
  const winRate = total === 0 ? 0 : Math.round((wins / total) * 100);

  const topPartners: PartnerCount[] = Array.from(partnerCounts.entries())
    .map(([nickname, count]) => ({ nickname, count }))
    .sort((a, b) => (b.count - a.count) || a.nickname.localeCompare(b.nickname))
    .slice(0, TOP_PARTNER_LIMIT);

  return { totalMatches: total, wins, losses, winRate, topPartners };
}
