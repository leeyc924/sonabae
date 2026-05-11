import type { AppData, Match, Meeting, PeriodFilter, Person, Place, Tournament, WinLossStats } from '../types';
import { daysAgoDate, yearStartDate } from '../utils/date';

export type PersonStat = {
  person: Person;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  lastPlayedAt?: string;
  partner: WinLossStats;
  opponent: WinLossStats;
  topMeetingName?: string;
};

export type MeetingStat = {
  meeting: Meeting;
  totalSessions: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  lastPlayedAt?: string;
  topPersonName?: string;
};

export type TournamentStat = {
  tournament: Tournament;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  partnerName?: string;
};

export function calcWinLoss(matches: Match[]): WinLossStats {
  const wins = matches.filter((match) => match.result === 'WIN').length;
  const losses = matches.filter((match) => match.result === 'LOSS').length;
  const unknown = matches.filter((match) => match.result === 'UNKNOWN').length;
  const decided = wins + losses;

  return {
    total: matches.length,
    decided,
    wins,
    losses,
    unknown,
    winRate: decided > 0 ? Math.round((wins / decided) * 1000) / 10 : 0,
  };
}

export function formatWinRate(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function periodLabel(period: PeriodFilter): string {
  switch (period) {
    case '7D':
      return '최근 7일';
    case '30D':
      return '최근 30일';
    case '90D':
      return '최근 90일';
    case 'YEAR':
      return '올해';
    case 'ALL':
    default:
      return '전체';
  }
}

export function filterMatchesByPeriod(matches: Match[], period: PeriodFilter): Match[] {
  if (period === 'ALL') {
    return matches;
  }

  const startDate =
    period === '7D' ? daysAgoDate(7) : period === '30D' ? daysAgoDate(30) : period === '90D' ? daysAgoDate(90) : yearStartDate();

  return matches.filter((match) => match.playedAt >= startDate);
}

export function inferResult(
  scoreA?: number,
  scoreB?: number,
  fallback: Match['result'] = 'UNKNOWN',
  myTeam: Match['myTeam'] = 'A',
): Match['result'] {
  if (typeof scoreA !== 'number' || typeof scoreB !== 'number' || scoreA === scoreB) {
    return fallback;
  }

  const teamAWon = scoreA > scoreB;
  return (myTeam === 'A' && teamAWon) || (myTeam === 'B' && !teamAWon) ? 'WIN' : 'LOSS';
}

export function getPersonName(data: AppData, personId?: string): string {
  if (!personId) {
    return '';
  }

  return data.people.find((person) => person.id === personId)?.name ?? '삭제된 사람';
}

export function getMeetingName(data: AppData, meetingId?: string): string {
  if (!meetingId) {
    return '모임 미선택';
  }

  return data.meetings.find((meeting) => meeting.id === meetingId)?.name ?? '삭제된 모임';
}

export function getTournamentName(data: AppData, tournamentId?: string): string {
  if (!tournamentId) {
    return '';
  }

  return data.tournaments.find((tournament) => tournament.id === tournamentId)?.name ?? '삭제된 대회';
}

export function getPlaceName(data: AppData, placeId?: string, fallback?: string): string {
  if (!placeId) {
    return fallback || '장소 미정';
  }

  return data.places.find((place) => place.id === placeId)?.name ?? fallback ?? '삭제된 장소';
}

export function placeLabel(place?: Place): string {
  if (!place) {
    return '장소 미정';
  }

  return place.address ? `${place.name} · ${place.address}` : place.name;
}

export function describeMatch(data: AppData, match: Match): string {
  const partnerIds = getPartnerIds(match);
  const opponentIds = getOpponentIds(match);
  const left = match.matchType === 'DOUBLES' ? `나 + ${partnerIds.map((id) => getPersonName(data, id)).join(', ') || '파트너 미정'}` : '나';
  const right = opponentIds.map((id) => getPersonName(data, id)).join(', ') || '상대 미정';
  return `${left} vs ${right}`;
}

export function scoreLabel(match: Pick<Match, 'scoreA' | 'scoreB'>): string {
  if (typeof match.scoreA !== 'number' || typeof match.scoreB !== 'number') {
    return '점수 없음';
  }

  return `${match.scoreA} : ${match.scoreB}`;
}

export function resultLabel(result: Match['result']): string {
  if (result === 'WIN') {
    return '승리';
  }
  if (result === 'LOSS') {
    return '패배';
  }
  return '결과 미정';
}

export function opponentResult(result: Match['result']): Match['result'] {
  if (result === 'WIN') {
    return 'LOSS';
  }
  if (result === 'LOSS') {
    return 'WIN';
  }
  return 'UNKNOWN';
}

export function getPartnerIds(match: Pick<Match, 'myTeam' | 'teamA' | 'teamB'>): string[] {
  return match.myTeam === 'B' ? match.teamB : match.teamA;
}

export function getOpponentIds(match: Pick<Match, 'myTeam' | 'teamA' | 'teamB'>): string[] {
  return match.myTeam === 'B' ? match.teamA : match.teamB;
}

export function getSessionMatches(data: AppData, sessionId: string): Match[] {
  return data.matches.filter((match) => match.sessionId === sessionId);
}

export function buildPersonStats(data: AppData, matches: Match[]): PersonStat[] {
  return data.people
    .map((person) => {
      const partnerMatches = matches.filter((match) => getPartnerIds(match).includes(person.id));
      const opponentMatches = matches.filter((match) => getOpponentIds(match).includes(person.id));
      const relatedMatches = [...partnerMatches, ...opponentMatches].filter(
        (match, index, source) => source.findIndex((candidate) => candidate.id === match.id) === index,
      );
      const summary = calcWinLoss(relatedMatches);
      const meetingCounts = new Map<string, number>();

      relatedMatches.forEach((match) => {
        if (match.meetingId) {
          meetingCounts.set(match.meetingId, (meetingCounts.get(match.meetingId) ?? 0) + 1);
        }
      });

      const topMeetingId = [...meetingCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

      return {
        person,
        totalMatches: relatedMatches.length,
        wins: summary.wins,
        losses: summary.losses,
        winRate: summary.winRate,
        lastPlayedAt: relatedMatches.sort((a, b) => b.playedAt.localeCompare(a.playedAt))[0]?.playedAt,
        partner: calcWinLoss(partnerMatches),
        opponent: calcWinLoss(opponentMatches),
        topMeetingName: topMeetingId ? getMeetingName(data, topMeetingId) : undefined,
      };
    })
    .sort((a, b) => b.totalMatches - a.totalMatches || a.person.name.localeCompare(b.person.name));
}

export function buildMeetingStats(data: AppData, matches: Match[]): MeetingStat[] {
  return data.meetings
    .map((meeting) => {
      const meetingMatches = matches.filter((match) => match.meetingId === meeting.id);
      const summary = calcWinLoss(meetingMatches);
      const sessionIds = new Set(meetingMatches.map((match) => match.sessionId));
      const personCounts = new Map<string, number>();

      meetingMatches.forEach((match) => {
        [...match.teamA, ...match.teamB].forEach((personId) => {
          personCounts.set(personId, (personCounts.get(personId) ?? 0) + 1);
        });
      });

      const topPersonId = [...personCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

      return {
        meeting,
        totalSessions: sessionIds.size,
        totalMatches: meetingMatches.length,
        wins: summary.wins,
        losses: summary.losses,
        winRate: summary.winRate,
        lastPlayedAt: meetingMatches.sort((a, b) => b.playedAt.localeCompare(a.playedAt))[0]?.playedAt,
        topPersonName: topPersonId ? getPersonName(data, topPersonId) : undefined,
      };
    })
    .sort((a, b) => b.totalMatches - a.totalMatches || a.meeting.name.localeCompare(b.meeting.name));
}

export function buildTournamentStats(data: AppData, matches: Match[]): TournamentStat[] {
  return data.tournaments
    .map((tournament) => {
      const tournamentMatches = matches.filter((match) => match.tournamentId === tournament.id);
      const summary = calcWinLoss(tournamentMatches);

      return {
        tournament,
        totalMatches: tournamentMatches.length,
        wins: summary.wins,
        losses: summary.losses,
        winRate: summary.winRate,
        partnerName: tournament.partnerPersonId ? getPersonName(data, tournament.partnerPersonId) : undefined,
      };
    })
    .sort((a, b) => b.tournament.date.localeCompare(a.tournament.date));
}
