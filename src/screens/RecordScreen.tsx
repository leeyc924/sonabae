import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CalendarDays, Edit3, Plus, Save, Trash2, Users } from 'lucide-react-native';

import { useToast } from '../components/Toast';
import {
  Card,
  ChipGroup,
  DateField,
  EmptyState,
  IconButton,
  MetaText,
  PrimaryButton,
  Screen,
  SectionHeader,
  SelectBox,
  SelectChip,
  TextField,
} from '../components/ui';
import {
  calcWinLoss,
  describeMatch,
  getMeetingName,
  getPlaceName,
  getSessionMatches,
  getTournamentName,
  inferResult,
  opponentResult,
  resultLabel,
  scoreLabel,
} from '../data/stats';
import { colors, spacing, typography } from '../theme';
import type { Match, MatchContext, MatchDraft, MatchResult, MatchType, Session } from '../types';
import { useAppStore } from '../state/AppStore';
import { formatKoreanDate, sortByDateDesc, todayISODate } from '../utils/date';

const resultOptions: MatchResult[] = ['WIN', 'LOSS', 'UNKNOWN'];

type RecordMode = 'list' | 'detail' | 'form';

export function RecordScreen() {
  const { data, deleteSession } = useAppStore();
  const { showToast } = useToast();
  const [mode, setMode] = useState<RecordMode>('list');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | undefined>();

  const selectedSession = data.sessions.find((session) => session.id === selectedSessionId);

  const openDetail = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMode('detail');
  };

  const openCreate = () => {
    setEditingSessionId(undefined);
    setMode('form');
  };

  const openEdit = (sessionId: string) => {
    setEditingSessionId(sessionId);
    setSelectedSessionId(sessionId);
    setMode('form');
  };

  const confirmDelete = (sessionId: string) => {
    Alert.alert('기록을 삭제할까요?', '운동일지와 포함된 경기 기록이 함께 삭제됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          try {
            deleteSession(sessionId);
            showToast('기록을 삭제했어요.');
            setSelectedSessionId('');
            setMode('list');
          } catch {
            showToast('기록 삭제에 실패했어요. 다시 시도해 주세요.', 'error');
          }
        },
      },
    ]);
  };

  if (mode === 'form') {
    return (
      <RecordForm
        key={editingSessionId ?? 'new'}
        editingSessionId={editingSessionId}
        onCancel={() => {
          setMode(editingSessionId ? 'detail' : 'list');
          setEditingSessionId(undefined);
        }}
        onSaved={(sessionId) => {
          setSelectedSessionId(sessionId);
          setEditingSessionId(undefined);
          setMode('detail');
        }}
      />
    );
  }

  if (mode === 'detail' && selectedSession) {
    return (
      <RecordDetail
        session={selectedSession}
        onBack={() => setMode('list')}
        onEdit={() => openEdit(selectedSession.id)}
        onDelete={() => confirmDelete(selectedSession.id)}
      />
    );
  }

  return <RecordList onCreate={openCreate} onOpenDetail={openDetail} />;
}

function RecordList({ onCreate, onOpenDetail }: { onCreate: () => void; onOpenDetail: (sessionId: string) => void }) {
  const { data } = useAppStore();
  const sessions = sortByDateDesc(data.sessions);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>기록</Text>
        <Text style={styles.title}>운동일지 목록</Text>
      </View>

      <PrimaryButton label="새 기록" onPress={onCreate} icon={<Plus color={colors.surface} size={20} />} />

      <SectionHeader title="저장된 기록" />
      {sessions.length > 0 ? (
        sessions.map((session) => {
          const matches = getSessionMatches(data, session.id);
          const summary = calcWinLoss(matches);
          const context = getSessionContext(session);
          const target = context === 'TOURNAMENT' ? getTournamentName(data, session.tournamentId) : getMeetingName(data, session.meetingId);
          const place = getPlaceName(data, session.placeId, session.location);

          return (
            <Pressable
              key={session.id}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${formatKoreanDate(session.date)} 기록 상세보기`}
              onPress={() => onOpenDetail(session.id)}
            >
              <Card>
                <View style={styles.itemRow}>
                  <View style={styles.itemMain}>
                    <Text style={styles.itemTitle}>
                      {formatKoreanDate(session.date)} · {context === 'TOURNAMENT' ? '대회' : '모임'}
                    </Text>
                    <MetaText>{target} · {place}</MetaText>
                    <MetaText>{matches.length}경기 · {summary.wins}승 {summary.losses}패 · 승률 {summary.winRate.toFixed(1)}%</MetaText>
                  </View>
                  <CalendarDays color={colors.textMuted} size={20} />
                </View>
              </Card>
            </Pressable>
          );
        })
      ) : (
        <EmptyState title="아직 기록이 없어요." body="첫 배드민턴 기록을 남겨보세요." />
      )}
    </Screen>
  );
}

function RecordDetail({ session, onBack, onEdit, onDelete }: { session: Session; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  const { data } = useAppStore();
  const matches = getSessionMatches(data, session.id);
  const summary = calcWinLoss(matches);
  const context = getSessionContext(session);
  const target = context === 'TOURNAMENT' ? getTournamentName(data, session.tournamentId) : getMeetingName(data, session.meetingId);
  const place = getPlaceName(data, session.placeId, session.location);

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton label="목록으로" onPress={onBack}>
          <ArrowLeft color={colors.textSecondary} size={19} />
        </IconButton>
        <View style={styles.topBarActions}>
          <IconButton label="기록 수정" onPress={onEdit} tone="primary">
            <Edit3 color={colors.primaryDark} size={18} />
          </IconButton>
          <IconButton label="기록 삭제" onPress={onDelete} tone="danger">
            <Trash2 color={colors.loss} size={18} />
          </IconButton>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>{context === 'TOURNAMENT' ? '대회 기록' : '모임 기록'}</Text>
        <Text style={styles.title}>{formatKoreanDate(session.date)}</Text>
      </View>

      <Card style={styles.formCard}>
        <Text style={styles.detailTitle}>{target}</Text>
        <MetaText>장소: {place}</MetaText>
        <MetaText>결과: {summary.wins}승 {summary.losses}패 · 승률 {summary.winRate.toFixed(1)}%</MetaText>
        {session.memo ? <MetaText>메모: {session.memo}</MetaText> : null}
      </Card>

      <SectionHeader title="경기 상세" />
      {matches.length > 0 ? (
        matches.map((match, index) => (
          <MatchDetailCard key={match.id} match={match} index={index} />
        ))
      ) : (
        <EmptyState title="저장된 경기가 없어요." />
      )}
    </Screen>
  );
}

function MatchDetailCard({ match, index }: { match: Match; index: number }) {
  const { data } = useAppStore();

  return (
    <Card style={styles.formCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.itemTitle}>
          {index + 1}경기 · {match.matchType === 'DOUBLES' ? '복식' : '단식'}
        </Text>
        <Text style={[styles.resultPill, match.result === 'WIN' && styles.winPill, match.result === 'LOSS' && styles.lossPill]}>
          {resultLabel(match.result)}
        </Text>
      </View>
      <MetaText>{describeMatch(data, match)}</MetaText>
      <MetaText>A팀 {match.scoreA ?? '-'} : B팀 {match.scoreB ?? '-'} · 내 팀 {match.myTeam}</MetaText>
      <MetaText>상대 팀 결과: {resultLabel(opponentResult(match.result))}</MetaText>
      {match.memo ? <MetaText>메모: {match.memo}</MetaText> : null}
    </Card>
  );
}

function RecordForm({
  editingSessionId,
  onCancel,
  onSaved,
}: {
  editingSessionId?: string;
  onCancel: () => void;
  onSaved: (sessionId: string) => void;
}) {
  const { data, addPerson, saveSessionWithMatches, updateSessionWithMatches } = useAppStore();
  const { showToast } = useToast();
  const editingSession = editingSessionId ? data.sessions.find((session) => session.id === editingSessionId) : undefined;
  const existingMatches = editingSessionId ? getSessionMatches(data, editingSessionId) : [];
  const latestMeetingId = data.sessions.find((session) => session.meetingId)?.meetingId ?? data.meetings[0]?.id;
  const [context, setContext] = useState<MatchContext>(getSessionContext(editingSession));
  const [date, setDate] = useState(editingSession?.date ?? todayISODate());
  const [meetingId, setMeetingId] = useState(editingSession?.meetingId ?? latestMeetingId ?? '');
  const [tournamentId, setTournamentId] = useState(editingSession?.tournamentId ?? data.tournaments[0]?.id ?? '');
  const [placeId, setPlaceId] = useState(editingSession?.placeId ?? '');
  const [location, setLocation] = useState(editingSession?.location ?? '');
  const [sessionMemo, setSessionMemo] = useState(editingSession?.memo ?? '');
  const [drafts, setDrafts] = useState<MatchDraft[]>(existingMatches.map(matchToDraft));

  const [matchType, setMatchType] = useState<MatchType>('DOUBLES');
  const [myTeam, setMyTeam] = useState<'A' | 'B'>('A');
  const [partnerId, setPartnerId] = useState('');
  const [opponentIds, setOpponentIds] = useState<string[]>([]);
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [manualResult, setManualResult] = useState<MatchResult>('UNKNOWN');
  const [matchMemo, setMatchMemo] = useState('');
  const [newPersonName, setNewPersonName] = useState('');

  const numericScoreA = parseScore(scoreA);
  const numericScoreB = parseScore(scoreB);
  const computedResult = inferResult(numericScoreA, numericScoreB, manualResult, myTeam);
  const selectedMeeting = data.meetings.find((meeting) => meeting.id === meetingId);
  const selectedTournament = data.tournaments.find((tournament) => tournament.id === tournamentId);
  const placeOptions = useMemo(() => {
    const recommendedPlaceIds =
      context === 'MEETING'
        ? selectedMeeting?.placeIds ?? (selectedMeeting?.placeId ? [selectedMeeting.placeId] : [])
        : selectedTournament?.placeId
          ? [selectedTournament.placeId]
          : [];
    const recommended = recommendedPlaceIds
      .map((id) => data.places.find((place) => place.id === id))
      .filter((place): place is NonNullable<typeof place> => Boolean(place));
    const rest = data.places.filter((place) => !recommendedPlaceIds.includes(place.id));

    return [
      { label: '선택 안 함', value: '' },
      ...recommended.map((place) => ({ label: `추천 · ${place.address ? `${place.name} · ${place.address}` : place.name}`, value: place.id })),
      ...rest.map((place) => ({ label: place.address ? `${place.name} · ${place.address}` : place.name, value: place.id })),
    ];
  }, [context, data.places, selectedMeeting?.placeId, selectedMeeting?.placeIds, selectedTournament?.placeId]);
  const recentPeople = useMemo(() => {
    const order = new Map<string, number>();
    data.matches.forEach((match, index) => {
      [...match.teamA, ...match.teamB].forEach((personId) => {
        if (!order.has(personId)) {
          order.set(personId, index);
        }
      });
    });

    return [...data.people].sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999) || a.name.localeCompare(b.name));
  }, [data.matches, data.people]);

  const addQuickPerson = () => {
    const name = newPersonName.trim();
    if (!name) {
      showToast('이름을 입력해 주세요.', 'error');
      return;
    }

    const existing = data.people.find((person) => person.name === name);
    const id = existing?.id ?? addPerson({ name });
    if (matchType === 'DOUBLES' && !partnerId) {
      setPartnerId(id);
    } else if (!opponentIds.includes(id)) {
      setOpponentIds((previous) => [...previous, id].slice(0, matchType === 'DOUBLES' ? 2 : 1));
    }
    setNewPersonName('');
    showToast(existing ? '이미 등록된 사람을 선택했어요.' : '사람을 추가했어요.');
  };

  const toggleOpponent = (id: string) => {
    setOpponentIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((personId) => personId !== id);
      }

      const limit = matchType === 'DOUBLES' ? 2 : 1;
      return [...previous, id].slice(-limit);
    });
  };

  const resetMatchForm = () => {
    setPartnerId('');
    setOpponentIds([]);
    setScoreA('');
    setScoreB('');
    setManualResult('UNKNOWN');
    setMatchMemo('');
  };

  const addDraftMatch = () => {
    const requiredOpponents = matchType === 'DOUBLES' ? 2 : 1;
    if (matchType === 'DOUBLES' && !partnerId) {
      showToast('파트너를 선택해 주세요.', 'error');
      return;
    }
    if (opponentIds.length < requiredOpponents) {
      showToast('상대를 선택해 주세요.', 'error');
      return;
    }

    const partnerIds = matchType === 'DOUBLES' ? [partnerId] : [];
    const teamA = myTeam === 'A' ? partnerIds : opponentIds;
    const teamB = myTeam === 'A' ? opponentIds : partnerIds;

    setDrafts((previous) => [
      ...previous,
      {
        matchType,
        context,
        myTeam,
        teamA,
        teamB,
        scoreA: numericScoreA,
        scoreB: numericScoreB,
        result: computedResult,
        memo: matchMemo,
      },
    ]);
    resetMatchForm();
    showToast('경기를 추가했어요.');
  };

  const saveRecord = () => {
    if (drafts.length === 0) {
      showToast('경기를 1개 이상 추가해 주세요.', 'error');
      return;
    }

    const resolvedMeetingId = context === 'MEETING' ? meetingId || undefined : undefined;
    const resolvedTournamentId = context === 'TOURNAMENT' ? tournamentId || undefined : undefined;

    try {
      const input = {
        date,
        context,
        meetingId: resolvedMeetingId,
        tournamentId: resolvedTournamentId,
        placeId: placeId || undefined,
        location,
        memo: sessionMemo,
      };
      const normalizedDrafts = drafts.map((draft) => ({ ...draft, context }));

      if (editingSessionId) {
        updateSessionWithMatches(editingSessionId, input, normalizedDrafts);
        showToast('변경사항을 저장했어요.');
        onSaved(editingSessionId);
      } else {
        const sessionId = saveSessionWithMatches(input, normalizedDrafts);
        showToast('기록을 저장했어요.');
        onSaved(sessionId);
      }
    } catch {
      showToast('기록 저장에 실패했어요. 다시 시도해 주세요.', 'error');
    }
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton label="뒤로" onPress={onCancel}>
          <ArrowLeft color={colors.textSecondary} size={19} />
        </IconButton>
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>{editingSessionId ? '기록 수정' : '기록 등록'}</Text>
        <Text style={styles.title}>{editingSessionId ? '운동일지 수정' : '새 운동일지'}</Text>
      </View>

      <Card style={styles.formCard}>
        <DateField label="운동 날짜" value={date} onChange={setDate} />

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>경기 구분</Text>
          <ChipGroup>
            <SelectChip label="모임" selected={context === 'MEETING'} onPress={() => setContext('MEETING')} />
            <SelectChip label="대회" selected={context === 'TOURNAMENT'} onPress={() => setContext('TOURNAMENT')} tone="accent" />
          </ChipGroup>
        </View>

        {context === 'MEETING' ? (
          <SelectBox
            label="모임"
            value={meetingId}
            onChange={setMeetingId}
            placeholder="모임 선택"
            options={data.meetings.map((meeting) => ({ label: meeting.name, value: meeting.id }))}
          />
        ) : null}

        {context === 'TOURNAMENT' ? (
          <SelectBox
            label="대회"
            value={tournamentId}
            onChange={setTournamentId}
            placeholder="대회 선택"
            options={data.tournaments.map((tournament) => ({ label: `${tournament.name} · ${tournament.date}`, value: tournament.id }))}
          />
        ) : null}

        <SelectBox
          label="그날 장소"
          value={placeId}
          onChange={setPlaceId}
          placeholder="장소 선택"
          options={placeOptions}
        />
        {context === 'MEETING' ? <MetaText>모임 장소는 기록할 때마다 다르게 선택할 수 있어요.</MetaText> : null}
        {data.places.length === 0 ? <MetaText>관리 탭에서 장소를 등록하면 기록에서 선택할 수 있어요.</MetaText> : null}
        <TextField label="장소 메모" value={location} onChangeText={setLocation} placeholder="임시 장소명 또는 코트 정보" />
        <TextField label="세션 메모" value={sessionMemo} onChangeText={setSessionMemo} placeholder="운동 시간, 컨디션 등" multiline />
      </Card>

      <SectionHeader title="경기 추가" />
      <Card style={styles.formCard}>
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>경기 방식</Text>
          <ChipGroup>
            <SelectChip
              label="복식"
              selected={matchType === 'DOUBLES'}
              onPress={() => {
                setMatchType('DOUBLES');
                setOpponentIds((previous) => previous.slice(0, 2));
              }}
            />
            <SelectChip
              label="단식"
              selected={matchType === 'SINGLES'}
              onPress={() => {
                setMatchType('SINGLES');
                setPartnerId('');
                setOpponentIds((previous) => previous.slice(0, 1));
              }}
            />
          </ChipGroup>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>내 팀</Text>
          <ChipGroup>
            <SelectChip label="A팀" selected={myTeam === 'A'} onPress={() => setMyTeam('A')} />
            <SelectChip label="B팀" selected={myTeam === 'B'} onPress={() => setMyTeam('B')} tone="accent" />
          </ChipGroup>
        </View>

        {matchType === 'DOUBLES' ? (
          <PersonPicker
            title="나의 파트너"
            people={recentPeople}
            selectedIds={partnerId ? [partnerId] : []}
            onToggle={(id) => setPartnerId(partnerId === id ? '' : id)}
            emptyText="파트너를 추가해보세요."
          />
        ) : null}

        <PersonPicker
          title={matchType === 'DOUBLES' ? '상대 팀' : '단식 상대'}
          people={recentPeople}
          selectedIds={opponentIds}
          onToggle={toggleOpponent}
          emptyText="상대를 추가해보세요."
          tone="danger"
        />

        <View style={styles.inlineFields}>
          <TextField label="A팀 점수" value={scoreA} onChangeText={setScoreA} keyboardType="number-pad" placeholder="21" />
          <TextField label="B팀 점수" value={scoreB} onChangeText={setScoreB} keyboardType="number-pad" placeholder="17" />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>내 결과</Text>
          <ChipGroup>
            {resultOptions.map((option) => (
              <SelectChip
                key={option}
                label={resultLabel(option)}
                selected={computedResult === option}
                onPress={() => setManualResult(option)}
                tone={option === 'WIN' ? 'primary' : option === 'LOSS' ? 'danger' : 'neutral'}
              />
            ))}
          </ChipGroup>
          <MetaText>점수를 입력하면 내 팀 기준으로 승패가 자동 계산됩니다.</MetaText>
        </View>

        <TextField label="경기 메모" value={matchMemo} onChangeText={setMatchMemo} placeholder="전술, 컨디션, 기억할 장면" />

        <View style={styles.quickAdd}>
          <View style={styles.quickAddField}>
            <TextField label="새 사람 빠른 추가" value={newPersonName} onChangeText={setNewPersonName} placeholder="이름 또는 별명" />
          </View>
          <PrimaryButton label="추가" onPress={addQuickPerson} variant="secondary" icon={<Users color={colors.primaryDark} size={18} />} />
        </View>

        <PrimaryButton label="경기 추가" onPress={addDraftMatch} icon={<Plus color={colors.surface} size={20} />} />
      </Card>

      <SectionHeader title={`추가한 경기 ${drafts.length}개`} />
      {drafts.length > 0 ? (
        drafts.map((draft, index) => (
          <Card key={`${draft.matchType}-${index}`}>
            <View style={styles.draftRow}>
              <View style={styles.draftMain}>
                <Text style={styles.draftTitle}>
                  {draft.matchType === 'DOUBLES' ? '복식' : '단식'} · 내 팀 {draft.myTeam} · {resultLabel(draft.result)}
                </Text>
                <MetaText>{describeMatch(data, draftToMatchPreview(data.userId, draft, date))}</MetaText>
                <MetaText>{scoreLabel(draft)}</MetaText>
              </View>
              <IconButton label="경기 삭제" tone="danger" onPress={() => setDrafts((previous) => previous.filter((_, draftIndex) => draftIndex !== index))}>
                <Trash2 color={colors.loss} size={18} />
              </IconButton>
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="아직 추가한 경기가 없어요." body="경기 1개를 추가한 뒤 운동일지를 저장하세요." />
      )}

      <View style={styles.bottomActions}>
        <PrimaryButton label="취소" onPress={onCancel} variant="secondary" />
        <PrimaryButton label="저장하기" onPress={saveRecord} icon={<Save color={colors.surface} size={20} />} />
      </View>
    </Screen>
  );
}

function PersonPicker({
  title,
  people,
  selectedIds,
  onToggle,
  emptyText,
  tone = 'primary',
}: {
  title: string;
  people: { id: string; name: string; level?: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  emptyText: string;
  tone?: 'primary' | 'danger';
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{title}</Text>
      {people.length > 0 ? (
        <ChipGroup>
          {people.map((person) => (
            <SelectChip
              key={person.id}
              label={`${person.name}${person.level ? ` · ${person.level}` : ''}`}
              selected={selectedIds.includes(person.id)}
              onPress={() => onToggle(person.id)}
              tone={tone}
            />
          ))}
        </ChipGroup>
      ) : (
        <MetaText>{emptyText}</MetaText>
      )}
    </View>
  );
}

function getSessionContext(session?: Session): MatchContext {
  return session?.context ?? (session?.tournamentId ? 'TOURNAMENT' : 'MEETING');
}

function matchToDraft(match: Match): MatchDraft {
  return {
    matchType: match.matchType,
    context: match.context,
    myTeam: match.myTeam,
    teamA: match.teamA,
    teamB: match.teamB,
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    result: match.result,
    memo: match.memo,
  };
}

function draftToMatchPreview(userId: string, draft: MatchDraft, date: string): Match {
  return {
    ...draft,
    id: 'draft',
    userId,
    sessionId: 'draft',
    playedAt: date,
    createdAt: date,
    updatedAt: date,
  };
}

function parseScore(value: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value.trim() !== '' ? parsed : undefined;
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  formCard: {
    gap: spacing.md,
  },
  detailTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  fieldBlock: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemMain: {
    flex: 1,
    gap: spacing.xxs,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  matchHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  resultPill: {
    backgroundColor: colors.divider,
    borderRadius: 999,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  winPill: {
    backgroundColor: colors.primaryLight,
    color: colors.primaryDark,
  },
  lossPill: {
    backgroundColor: '#FFF1F4',
    color: colors.loss,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAdd: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAddField: {
    flex: 1,
  },
  draftRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  draftMain: {
    flex: 1,
    gap: spacing.xxs,
  },
  draftTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
});
