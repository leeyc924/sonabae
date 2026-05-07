import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const DRAFT_KEY = 'sonabae.match_draft.v1';
const MATCHES_KEY = 'sonabae.matches.v1';

export type MatchFormat = 'doubles' | 'singles';

export type MatchDraft = {
  date: string;
  format: MatchFormat;
  partnerNickname: string;
  opponent1Nickname: string;
  opponent2Nickname: string;
  myScore: string;
  opponentScore: string;
  memo: string;
  updatedAt: string;
};

export type MatchRecord = {
  id: string;
  date: string;
  format: MatchFormat;
  partnerNickname: string | null;
  opponent1Nickname: string;
  opponent2Nickname: string | null;
  myScore: number;
  opponentScore: number;
  memo: string;
  createdAt: string;
};

export function emptyDraft(): MatchDraft {
  return {
    date: todayIso(),
    format: 'doubles',
    partnerNickname: '',
    opponent1Nickname: '',
    opponent2Nickname: '',
    myScore: '',
    opponentScore: '',
    memo: '',
    updatedAt: new Date().toISOString(),
  };
}

export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function saveDraft(draft: MatchDraft): Promise<void> {
  const next = { ...draft, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(next));
}

export async function loadDraft(): Promise<MatchDraft | null> {
  const raw = await AsyncStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MatchDraft;
  } catch {
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  await AsyncStorage.removeItem(DRAFT_KEY);
}

export type SaveMatchInput = Omit<MatchDraft, 'updatedAt'>;

export type SaveMatchResult =
  | { ok: true; record: MatchRecord }
  | { ok: false; error: string };

export async function saveMatch(input: SaveMatchInput): Promise<SaveMatchResult> {
  const myScore = Number.parseInt(input.myScore, 10);
  const opponentScore = Number.parseInt(input.opponentScore, 10);
  if (!Number.isFinite(myScore) || !Number.isFinite(opponentScore)) {
    return { ok: false, error: '스코어를 숫자로 입력해주세요.' };
  }
  if (myScore < 0 || opponentScore < 0 || myScore > 99 || opponentScore > 99) {
    return { ok: false, error: '스코어는 0~99 사이여야 해요.' };
  }
  if (!input.date) {
    return { ok: false, error: '날짜를 입력해주세요.' };
  }

  const partnerNickname =
    input.format === 'doubles'
      ? input.partnerNickname.trim() || '익명1'
      : null;
  const opponent1Nickname = input.opponent1Nickname.trim() || '익명1';
  const opponent2Nickname =
    input.format === 'doubles'
      ? input.opponent2Nickname.trim() || '익명2'
      : null;

  const record: MatchRecord = {
    id: Crypto.randomUUID(),
    date: input.date,
    format: input.format,
    partnerNickname,
    opponent1Nickname,
    opponent2Nickname,
    myScore,
    opponentScore,
    memo: input.memo.trim(),
    createdAt: new Date().toISOString(),
  };

  const list = await listMatches();
  const next = [record, ...list];
  await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(next));
  return { ok: true, record };
}

export async function listMatches(): Promise<MatchRecord[]> {
  const raw = await AsyncStorage.getItem(MATCHES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MatchRecord[]) : [];
  } catch {
    return [];
  }
}
