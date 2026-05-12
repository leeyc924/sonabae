import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearPersistedData, loadPersistedData, persistData } from '../data/storage';
import { inferResult } from '../data/stats';
import type { AppData, GradeHistory, Match, MatchDraft, Meeting, Person, Place, Tournament, UserProfile } from '../types';
import { createId, nowISO, todayISODate } from '../utils/date';

type ProfileInput = {
  nickname: string;
  currentLevel: string;
  targetLevel?: string;
};

type PersonInput = Pick<Person, 'name' | 'gender' | 'level' | 'meetingIds' | 'memo'>;

type MeetingInput = Pick<Meeting, 'name' | 'placeIds' | 'location' | 'defaultDayOfWeek' | 'memo'>;

type TournamentInput = Pick<Tournament, 'name' | 'date' | 'level' | 'eventType' | 'partnerPersonId' | 'placeId' | 'resultLabel' | 'memo'>;

type PlaceInput = Pick<Place, 'name' | 'address' | 'memo'>;

type SessionInput = {
  date: string;
  context: 'MEETING' | 'TOURNAMENT';
  meetingId?: string;
  tournamentId?: string;
  placeId?: string;
  location?: string;
  memo?: string;
};

type AppStoreValue = {
  data: AppData;
  hydrated: boolean;
  saveProfile: (input: ProfileInput, reason?: string) => void;
  addPerson: (input: PersonInput) => string;
  updatePerson: (id: string, input: PersonInput) => void;
  deletePerson: (id: string) => void;
  addMeeting: (input: MeetingInput) => string;
  updateMeeting: (id: string, input: MeetingInput) => void;
  deleteMeeting: (id: string) => void;
  addTournament: (input: TournamentInput) => string;
  updateTournament: (id: string, input: TournamentInput) => void;
  deleteTournament: (id: string) => void;
  addPlace: (input: PlaceInput) => string;
  updatePlace: (id: string, input: PlaceInput) => void;
  deletePlace: (id: string) => void;
  saveSessionWithMatches: (input: SessionInput, drafts: MatchDraft[]) => string;
  updateSessionWithMatches: (id: string, input: SessionInput, drafts: MatchDraft[]) => void;
  deleteSession: (id: string) => void;
  resetData: () => Promise<void>;
};

const AppStoreContext = createContext<AppStoreValue | undefined>(undefined);

function createEmptyData(): AppData {
  return {
    userId: createId('anon'),
    people: [],
    meetings: [],
    tournaments: [],
    places: [],
    sessions: [],
    matches: [],
    gradeHistory: [],
  };
}

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<AppData>(() => createEmptyData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadPersistedData()
      .then((persisted) => {
        if (mounted && persisted) {
          setData(persisted);
        }
      })
      .finally(() => {
        if (mounted) {
          setHydrated(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      persistData(data).catch(() => undefined);
    }
  }, [data, hydrated]);

  const saveProfile = useCallback((input: ProfileInput, reason?: string) => {
    setData((previous) => {
      const timestamp = nowISO();
      const currentProfile = previous.profile;
      const profile: UserProfile = currentProfile
        ? {
            ...currentProfile,
            nickname: input.nickname.trim(),
            currentLevel: input.currentLevel.trim(),
            targetLevel: input.targetLevel?.trim(),
            updatedAt: timestamp,
          }
        : {
            id: previous.userId,
            nickname: input.nickname.trim(),
            currentLevel: input.currentLevel.trim(),
            targetLevel: input.targetLevel?.trim(),
            createdAt: timestamp,
            updatedAt: timestamp,
          };

      const changedLevel = currentProfile?.currentLevel && currentProfile.currentLevel !== profile.currentLevel;
      const newHistory: GradeHistory[] = changedLevel
        ? [
            {
              id: createId('grade'),
              userId: previous.userId,
              fromLevel: currentProfile.currentLevel,
              toLevel: profile.currentLevel,
              changedAt: todayISODate(),
              reason: reason?.trim() || '급수 수정',
              createdAt: timestamp,
            },
            ...previous.gradeHistory,
          ]
        : previous.gradeHistory;

      return {
        ...previous,
        profile,
        gradeHistory: newHistory,
      };
    });
  }, []);

  const addPerson = useCallback((input: PersonInput) => {
    const id = createId('person');
    setData((previous) => {
      const timestamp = nowISO();
      const person: Person = {
        id,
        userId: previous.userId,
        name: input.name.trim(),
        gender: input.gender,
        level: input.level?.trim(),
        meetingIds: input.meetingIds,
        memo: input.memo?.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      return { ...previous, people: [person, ...previous.people] };
    });
    return id;
  }, []);

  const updatePerson = useCallback((id: string, input: PersonInput) => {
    setData((previous) => ({
      ...previous,
      people: previous.people.map((person) =>
        person.id === id
          ? {
              ...person,
              name: input.name.trim(),
              gender: input.gender,
              level: input.level?.trim(),
              meetingIds: input.meetingIds,
              memo: input.memo?.trim(),
              updatedAt: nowISO(),
            }
          : person,
      ),
    }));
  }, []);

  const deletePerson = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      people: previous.people.filter((person) => person.id !== id),
      tournaments: previous.tournaments.map((tournament) =>
        tournament.partnerPersonId === id ? { ...tournament, partnerPersonId: undefined, updatedAt: nowISO() } : tournament,
      ),
    }));
  }, []);

  const addMeeting = useCallback((input: MeetingInput) => {
    const id = createId('meeting');
    setData((previous) => {
      const timestamp = nowISO();
      const meeting: Meeting = {
        id,
        userId: previous.userId,
        name: input.name.trim(),
        placeIds: input.placeIds,
        location: input.location?.trim(),
        defaultDayOfWeek: input.defaultDayOfWeek?.trim(),
        memo: input.memo?.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      return { ...previous, meetings: [meeting, ...previous.meetings] };
    });
    return id;
  }, []);

  const updateMeeting = useCallback((id: string, input: MeetingInput) => {
    setData((previous) => ({
      ...previous,
      meetings: previous.meetings.map((meeting) =>
        meeting.id === id
          ? {
              ...meeting,
              name: input.name.trim(),
              placeIds: input.placeIds,
              placeId: undefined,
              location: input.location?.trim(),
              defaultDayOfWeek: input.defaultDayOfWeek?.trim(),
              memo: input.memo?.trim(),
              updatedAt: nowISO(),
            }
          : meeting,
      ),
    }));
  }, []);

  const deleteMeeting = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      meetings: previous.meetings.filter((meeting) => meeting.id !== id),
      people: previous.people.map((person) => ({
        ...person,
        meetingIds: person.meetingIds?.filter((meetingId) => meetingId !== id),
      })),
    }));
  }, []);

  const addTournament = useCallback((input: TournamentInput) => {
    const id = createId('tournament');
    setData((previous) => {
      const timestamp = nowISO();
      const tournament: Tournament = {
        id,
        userId: previous.userId,
        name: input.name.trim(),
        date: input.date,
        level: input.level?.trim(),
        eventType: input.eventType,
        partnerPersonId: input.partnerPersonId,
        placeId: input.placeId,
        resultLabel: input.resultLabel?.trim(),
        memo: input.memo?.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      return { ...previous, tournaments: [tournament, ...previous.tournaments] };
    });
    return id;
  }, []);

  const updateTournament = useCallback((id: string, input: TournamentInput) => {
    setData((previous) => ({
      ...previous,
      tournaments: previous.tournaments.map((tournament) =>
        tournament.id === id
          ? {
              ...tournament,
              name: input.name.trim(),
              date: input.date,
              level: input.level?.trim(),
              eventType: input.eventType,
              partnerPersonId: input.partnerPersonId,
              placeId: input.placeId,
              resultLabel: input.resultLabel?.trim(),
              memo: input.memo?.trim(),
              updatedAt: nowISO(),
            }
          : tournament,
      ),
    }));
  }, []);

  const deleteTournament = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      tournaments: previous.tournaments.filter((tournament) => tournament.id !== id),
    }));
  }, []);

  const addPlace = useCallback((input: PlaceInput) => {
    const id = createId('place');
    setData((previous) => {
      const timestamp = nowISO();
      const place: Place = {
        id,
        userId: previous.userId,
        name: input.name.trim(),
        address: input.address?.trim(),
        memo: input.memo?.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      return { ...previous, places: [place, ...previous.places] };
    });
    return id;
  }, []);

  const updatePlace = useCallback((id: string, input: PlaceInput) => {
    setData((previous) => ({
      ...previous,
      places: previous.places.map((place) =>
        place.id === id
          ? {
              ...place,
              name: input.name.trim(),
              address: input.address?.trim(),
              memo: input.memo?.trim(),
              updatedAt: nowISO(),
            }
          : place,
      ),
    }));
  }, []);

  const deletePlace = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      places: previous.places.filter((place) => place.id !== id),
      meetings: previous.meetings.map((meeting) =>
        meeting.placeId === id || meeting.placeIds?.includes(id)
          ? {
              ...meeting,
              placeId: meeting.placeId === id ? undefined : meeting.placeId,
              placeIds: meeting.placeIds?.filter((placeId) => placeId !== id),
              updatedAt: nowISO(),
            }
          : meeting,
      ),
      tournaments: previous.tournaments.map((tournament) =>
        tournament.placeId === id ? { ...tournament, placeId: undefined, updatedAt: nowISO() } : tournament,
      ),
    }));
  }, []);

  const saveSessionWithMatches = useCallback((input: SessionInput, drafts: MatchDraft[]) => {
    const sessionId = createId('session');

    setData((previous) => {
      const timestamp = nowISO();
      const session = {
        id: sessionId,
        userId: previous.userId,
        date: input.date,
        context: input.context,
        meetingId: input.meetingId,
        tournamentId: input.tournamentId,
        placeId: input.placeId,
        location: input.location?.trim(),
        memo: input.memo?.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const matches: Match[] = drafts.map((draft) => ({
        id: createId('match'),
        userId: previous.userId,
        sessionId,
        meetingId: input.meetingId,
        tournamentId: input.tournamentId,
        matchType: draft.matchType,
        context: draft.context,
        myTeam: draft.myTeam,
        teamA: draft.teamA,
        teamB: draft.teamB,
        scoreA: draft.scoreA,
        scoreB: draft.scoreB,
        result: inferResult(draft.scoreA, draft.scoreB, draft.result, draft.myTeam),
        memo: draft.memo?.trim(),
        playedAt: input.date,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      return {
        ...previous,
        sessions: [session, ...previous.sessions],
        matches: [...matches, ...previous.matches],
      };
    });

    return sessionId;
  }, []);

  const updateSessionWithMatches = useCallback((id: string, input: SessionInput, drafts: MatchDraft[]) => {
    setData((previous) => {
      const timestamp = nowISO();
      const currentSession = previous.sessions.find((session) => session.id === id);
      const matches: Match[] = drafts.map((draft) => ({
        id: createId('match'),
        userId: previous.userId,
        sessionId: id,
        meetingId: input.meetingId,
        tournamentId: input.tournamentId,
        matchType: draft.matchType,
        context: draft.context,
        myTeam: draft.myTeam,
        teamA: draft.teamA,
        teamB: draft.teamB,
        scoreA: draft.scoreA,
        scoreB: draft.scoreB,
        result: inferResult(draft.scoreA, draft.scoreB, draft.result, draft.myTeam),
        memo: draft.memo?.trim(),
        playedAt: input.date,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      return {
        ...previous,
        sessions: previous.sessions.map((session) =>
          session.id === id
            ? {
                ...session,
                date: input.date,
                context: input.context,
                meetingId: input.meetingId,
                tournamentId: input.tournamentId,
                placeId: input.placeId,
                location: input.location?.trim(),
                memo: input.memo?.trim(),
                createdAt: currentSession?.createdAt ?? session.createdAt,
                updatedAt: timestamp,
              }
            : session,
        ),
        matches: [...matches, ...previous.matches.filter((match) => match.sessionId !== id)],
      };
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      sessions: previous.sessions.filter((session) => session.id !== id),
      matches: previous.matches.filter((match) => match.sessionId !== id),
    }));
  }, []);

  const resetData = useCallback(async () => {
    await clearPersistedData();
    setData(createEmptyData());
  }, []);

  const value = useMemo(
    () => ({
      data,
      hydrated,
      saveProfile,
      addPerson,
      updatePerson,
      deletePerson,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      addTournament,
      updateTournament,
      deleteTournament,
      addPlace,
      updatePlace,
      deletePlace,
      saveSessionWithMatches,
      updateSessionWithMatches,
      deleteSession,
      resetData,
    }),
    [
      addPlace,
      addMeeting,
      addPerson,
      addTournament,
      data,
      deletePlace,
      deleteMeeting,
      deletePerson,
      deleteSession,
      deleteTournament,
      hydrated,
      resetData,
      saveProfile,
      saveSessionWithMatches,
      updatePlace,
      updateMeeting,
      updatePerson,
      updateSessionWithMatches,
      updateTournament,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used inside AppStoreProvider');
  }

  return context;
}
