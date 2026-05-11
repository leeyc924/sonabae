import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppData } from '../types';

const STORAGE_KEY = 'sonabae:v1:data';

export async function loadPersistedData(): Promise<AppData | undefined> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  return normalizePersistedData(JSON.parse(raw) as Partial<AppData>);
}

export async function persistData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function clearPersistedData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

function normalizePersistedData(data: Partial<AppData>): AppData {
  const userId = data.userId ?? data.profile?.id ?? 'anon_local';
  const sessions = (data.sessions ?? []).map((session) => ({
    ...session,
    context: session.context ?? (session.tournamentId ? 'TOURNAMENT' : 'MEETING'),
  }));

  return {
    userId,
    profile: data.profile,
    people: data.people ?? [],
    meetings: data.meetings ?? [],
    tournaments: data.tournaments ?? [],
    places: data.places ?? [],
    sessions,
    matches: (data.matches ?? []).map((match) => ({
      ...match,
      myTeam: match.myTeam ?? 'A',
      context: match.context === 'TOURNAMENT' ? 'TOURNAMENT' : 'MEETING',
    })),
    gradeHistory: data.gradeHistory ?? [],
  };
}
