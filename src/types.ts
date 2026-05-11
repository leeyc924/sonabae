export type ID = string;

export type Timestamp = string;

export type MatchResult = 'WIN' | 'LOSS' | 'UNKNOWN';

export type MatchType = 'SINGLES' | 'DOUBLES';

export type MatchContext = 'MEETING' | 'TOURNAMENT';

export type EventType = 'MS' | 'WS' | 'MD' | 'WD' | 'XD' | 'OTHER';

export type UserProfile = {
  id: ID;
  nickname: string;
  currentLevel: string;
  targetLevel?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Person = {
  id: ID;
  userId: ID;
  name: string;
  level?: string;
  meetingIds?: ID[];
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Meeting = {
  id: ID;
  userId: ID;
  name: string;
  placeId?: ID;
  location?: string;
  defaultDayOfWeek?: string;
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Tournament = {
  id: ID;
  userId: ID;
  name: string;
  date: string;
  level?: string;
  eventType?: EventType;
  partnerPersonId?: ID;
  placeId?: ID;
  resultLabel?: string;
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Place = {
  id: ID;
  userId: ID;
  name: string;
  address?: string;
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Session = {
  id: ID;
  userId: ID;
  date: string;
  context?: MatchContext;
  meetingId?: ID;
  tournamentId?: ID;
  placeId?: ID;
  location?: string;
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Match = {
  id: ID;
  userId: ID;
  sessionId: ID;
  meetingId?: ID;
  tournamentId?: ID;
  matchType: MatchType;
  context: MatchContext;
  myTeam: 'A' | 'B';
  teamA: ID[];
  teamB: ID[];
  scoreA?: number;
  scoreB?: number;
  result: MatchResult;
  memo?: string;
  playedAt: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type GradeHistory = {
  id: ID;
  userId: ID;
  fromLevel?: string;
  toLevel: string;
  changedAt: string;
  reason?: string;
  relatedTournamentId?: ID;
  memo?: string;
  createdAt: Timestamp;
};

export type MatchDraft = {
  matchType: MatchType;
  context: MatchContext;
  myTeam: 'A' | 'B';
  teamA: ID[];
  teamB: ID[];
  scoreA?: number;
  scoreB?: number;
  result: MatchResult;
  memo?: string;
};

export type AppData = {
  userId: ID;
  profile?: UserProfile;
  people: Person[];
  meetings: Meeting[];
  tournaments: Tournament[];
  places: Place[];
  sessions: Session[];
  matches: Match[];
  gradeHistory: GradeHistory[];
};

export type PeriodFilter = 'ALL' | '7D' | '30D' | '90D' | 'YEAR';

export type WinLossStats = {
  total: number;
  decided: number;
  wins: number;
  losses: number;
  unknown: number;
  winRate: number;
};
