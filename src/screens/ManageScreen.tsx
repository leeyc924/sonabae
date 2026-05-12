import { useMemo, useState, type ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Building2, MapPin, Pencil, Plus, Save, Trash2, Trophy, UserRoundPlus, UsersRound } from 'lucide-react-native';

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
import { buildMeetingStats, buildPersonStats, buildTournamentStats, formatWinRate, getPlaceName } from '../data/stats';
import { colors, levelOptions, spacing, typography } from '../theme';
import type { EventType, Gender, Meeting, Person, Place, Tournament } from '../types';
import { useAppStore } from '../state/AppStore';
import { todayISODate } from '../utils/date';

type ManageArea = 'home' | 'people' | 'meetings' | 'tournaments' | 'places';
type LocalMode = 'list' | 'form';

const levelSelectOptions = levelOptions.map((level) => ({ label: level, value: level }));

const genderSelectOptions: { label: string; value: Gender | '' }[] = [
  { label: '선택 안 함', value: '' },
  { label: '남성', value: 'MALE' },
  { label: '여성', value: 'FEMALE' },
  { label: '기타', value: 'OTHER' },
];

const genderLabels: Record<Gender, string> = {
  MALE: '남성',
  FEMALE: '여성',
  OTHER: '기타',
};

const eventLabels: Record<EventType, string> = {
  MS: '남자 단식',
  WS: '여자 단식',
  MD: '남자 복식',
  WD: '여자 복식',
  XD: '혼합 복식',
  OTHER: '기타',
};

export function ManageScreen() {
  const [area, setArea] = useState<ManageArea>('home');

  if (area === 'people') {
    return <PeopleManager onBack={() => setArea('home')} />;
  }
  if (area === 'meetings') {
    return <MeetingManager onBack={() => setArea('home')} />;
  }
  if (area === 'tournaments') {
    return <TournamentManager onBack={() => setArea('home')} />;
  }
  if (area === 'places') {
    return <PlaceManager onBack={() => setArea('home')} />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>관리</Text>
        <Text style={styles.title}>등록 정보 관리</Text>
      </View>

      <ManageEntry
        title="사람 관리"
        body="파트너와 상대, 급수를 관리합니다."
        icon={<UsersRound color={colors.primaryDark} size={22} />}
        onPress={() => setArea('people')}
      />
      <ManageEntry
        title="모임 관리"
        body="자주 가는 모임과 자주 쓰는 장소들을 관리합니다."
        icon={<Building2 color={colors.primaryDark} size={22} />}
        onPress={() => setArea('meetings')}
      />
      <ManageEntry
        title="대회 관리"
        body="참가한 대회와 날짜, 급수, 장소를 관리합니다."
        icon={<Trophy color="#7A5100" size={22} />}
        onPress={() => setArea('tournaments')}
      />
      <ManageEntry
        title="장소 관리"
        body="체육관과 코트를 등록하고 기록에서 선택합니다."
        icon={<MapPin color={colors.primaryDark} size={22} />}
        onPress={() => setArea('places')}
      />
    </Screen>
  );
}

function ManageEntry({ title, body, icon, onPress }: { title: string; body: string; icon: ReactNode; onPress: () => void }) {
  return (
    <Pressable accessible accessibilityRole="button" accessibilityLabel={title} onPress={onPress}>
      <Card>
        <View style={styles.entryRow}>
          <View style={styles.entryIcon}>{icon}</View>
          <View style={styles.itemMain}>
            <Text style={styles.itemTitle}>{title}</Text>
            <MetaText>{body}</MetaText>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function PeopleManager({ onBack }: { onBack: () => void }) {
  const { data, addPerson, updatePerson, deletePerson } = useAppStore();
  const { showToast } = useToast();
  const stats = useMemo(() => buildPersonStats(data, data.matches), [data]);
  const [mode, setMode] = useState<LocalMode>('list');
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [level, setLevel] = useState('');
  const [meetingIds, setMeetingIds] = useState<string[]>([]);
  const [memo, setMemo] = useState('');

  const openCreate = () => {
    setEditingId('');
    setName('');
    setGender('');
    setLevel('');
    setMeetingIds([]);
    setMemo('');
    setMode('form');
  };

  const openEdit = (person: Person) => {
    setEditingId(person.id);
    setName(person.name);
    setGender(person.gender ?? '');
    setLevel(person.level ?? '');
    setMeetingIds(person.meetingIds ?? []);
    setMemo(person.memo ?? '');
    setMode('form');
  };

  const toggleMeeting = (meetingId: string) => {
    setMeetingIds((previous) =>
      previous.includes(meetingId) ? previous.filter((id) => id !== meetingId) : [...previous, meetingId],
    );
  };

  const save = () => {
    if (!name.trim()) {
      showToast('이름을 입력해 주세요.', 'error');
      return;
    }

    try {
      const input = { name, gender: gender || undefined, level, meetingIds: meetingIds.length > 0 ? meetingIds : undefined, memo };
      if (editingId) {
        updatePerson(editingId, input);
        showToast('변경사항을 저장했어요.');
      } else {
        addPerson(input);
        showToast('사람을 추가했어요.');
      }
      setMode('list');
    } catch {
      showToast('저장에 실패했어요. 다시 시도해 주세요.', 'error');
    }
  };

  if (mode === 'form') {
    return (
      <Screen>
        <BackHeader title={editingId ? '사람 수정' : '사람 등록'} onBack={() => setMode('list')} />
        <Card style={styles.formCard}>
          <TextField label="이름 또는 별명" value={name} onChangeText={setName} placeholder="예: 김민수" />
          <SelectBox
            label="성별"
            value={gender}
            onChange={(value) => setGender(value as Gender)}
            placeholder="성별 선택"
            options={genderSelectOptions}
          />
          <SelectBox label="급수" value={level} onChange={setLevel} placeholder="급수 선택" options={levelSelectOptions} />
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>소속 모임</Text>
            {data.meetings.length > 0 ? (
              <ChipGroup>
                {data.meetings.map((meeting) => (
                  <SelectChip
                    key={meeting.id}
                    label={meeting.name}
                    selected={meetingIds.includes(meeting.id)}
                    onPress={() => toggleMeeting(meeting.id)}
                  />
                ))}
              </ChipGroup>
            ) : (
              <MetaText>모임을 먼저 등록하면 여러 모임을 연결할 수 있어요.</MetaText>
            )}
          </View>
          <TextField label="메모" value={memo} onChangeText={setMemo} placeholder="플레이 스타일, 주 포지션 등" multiline />
          <PrimaryButton label={editingId ? '수정하기' : '추가하기'} onPress={save} icon={<Save color={colors.surface} size={18} />} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title="사람 관리" onBack={onBack} />
      <PrimaryButton label="사람 추가" onPress={openCreate} icon={<UserRoundPlus color={colors.surface} size={18} />} />
      <SectionHeader title="사람 목록" />
      {stats.length > 0 ? (
        stats.map((item) => (
          <Card key={item.person.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemTitle}>{item.person.name}{item.person.level ? ` · ${item.person.level}` : ''}</Text>
                {item.person.gender ? <MetaText>성별: {genderLabels[item.person.gender]}</MetaText> : null}
                {item.person.meetingIds?.length ? <MetaText>소속 모임: {formatMeetingNames(data.meetings, item.person.meetingIds)}</MetaText> : null}
                <MetaText>{item.totalMatches}경기 · {item.wins}승 {item.losses}패 · 승률 {formatWinRate(item.winRate)}</MetaText>
                {item.topMeetingName ? <MetaText>자주 만난 모임: {item.topMeetingName}</MetaText> : null}
              </View>
              <RowActions onEdit={() => openEdit(item.person)} onDelete={() => confirmDelete('사람을 삭제할까요?', () => deletePerson(item.person.id), showToast)} />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="함께 경기한 사람을 추가해보세요." />
      )}
    </Screen>
  );
}

function MeetingManager({ onBack }: { onBack: () => void }) {
  const { data, addMeeting, updateMeeting, deleteMeeting } = useAppStore();
  const { showToast } = useToast();
  const stats = useMemo(() => buildMeetingStats(data, data.matches), [data]);
  const [mode, setMode] = useState<LocalMode>('list');
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [placeIds, setPlaceIds] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [defaultDayOfWeek, setDefaultDayOfWeek] = useState('');
  const [memo, setMemo] = useState('');

  const openCreate = () => {
    setEditingId('');
    setName('');
    setPlaceIds([]);
    setLocation('');
    setDefaultDayOfWeek('');
    setMemo('');
    setMode('form');
  };

  const openEdit = (meeting: Meeting) => {
    setEditingId(meeting.id);
    setName(meeting.name);
    setPlaceIds(meeting.placeIds ?? (meeting.placeId ? [meeting.placeId] : []));
    setLocation(meeting.location ?? '');
    setDefaultDayOfWeek(meeting.defaultDayOfWeek ?? '');
    setMemo(meeting.memo ?? '');
    setMode('form');
  };

  const togglePlace = (placeId: string) => {
    setPlaceIds((previous) => (previous.includes(placeId) ? previous.filter((id) => id !== placeId) : [...previous, placeId]));
  };

  const save = () => {
    if (!name.trim()) {
      showToast('모임명을 입력해 주세요.', 'error');
      return;
    }

    try {
      const input = { name, placeIds: placeIds.length > 0 ? placeIds : undefined, location, defaultDayOfWeek, memo };
      if (editingId) {
        updateMeeting(editingId, input);
        showToast('변경사항을 저장했어요.');
      } else {
        addMeeting(input);
        showToast('모임을 추가했어요.');
      }
      setMode('list');
    } catch {
      showToast('저장에 실패했어요. 다시 시도해 주세요.', 'error');
    }
  };

  if (mode === 'form') {
    return (
      <Screen>
        <BackHeader title={editingId ? '모임 수정' : '모임 등록'} onBack={() => setMode('list')} />
        <Card style={styles.formCard}>
          <TextField label="모임명" value={name} onChangeText={setName} placeholder="예: 한강클럽" />
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>자주 쓰는 장소</Text>
            {data.places.length > 0 ? (
              <ChipGroup>
                {data.places.map((place) => (
                  <SelectChip
                    key={place.id}
                    label={place.address ? `${place.name} · ${place.address}` : place.name}
                    selected={placeIds.includes(place.id)}
                    onPress={() => togglePlace(place.id)}
                  />
                ))}
              </ChipGroup>
            ) : (
              <MetaText>장소를 먼저 등록하면 모임에 여러 장소를 연결할 수 있어요.</MetaText>
            )}
          </View>
          <TextField label="장소 메모" value={location} onChangeText={setLocation} placeholder="예: 요일마다 체육관이 바뀜" />
          <TextField label="주 활동 요일" value={defaultDayOfWeek} onChangeText={setDefaultDayOfWeek} placeholder="예: 수요일" />
          <TextField label="메모" value={memo} onChangeText={setMemo} placeholder="코트 수, 주차, 회비 등" multiline />
          <PrimaryButton label={editingId ? '수정하기' : '추가하기'} onPress={save} icon={<Save color={colors.surface} size={18} />} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title="모임 관리" onBack={onBack} />
      <PrimaryButton label="모임 추가" onPress={openCreate} icon={<Plus color={colors.surface} size={18} />} />
      <SectionHeader title="모임 목록" />
      {stats.length > 0 ? (
        stats.map((item) => (
          <Card key={item.meeting.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemTitle}>{item.meeting.name}</Text>
                <MetaText>자주 쓰는 장소: {formatPlaceNames(data.places, item.meeting.placeIds ?? (item.meeting.placeId ? [item.meeting.placeId] : []), item.meeting.location)}</MetaText>
                <MetaText>{item.totalSessions}일 · {item.totalMatches}경기</MetaText>
                <MetaText>{item.wins}승 {item.losses}패 · 승률 {formatWinRate(item.winRate)}</MetaText>
              </View>
              <RowActions onEdit={() => openEdit(item.meeting)} onDelete={() => confirmDelete('모임을 삭제할까요?', () => deleteMeeting(item.meeting.id), showToast)} />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="자주 가는 모임을 등록해보세요." />
      )}
    </Screen>
  );
}

function TournamentManager({ onBack }: { onBack: () => void }) {
  const { data, addTournament, updateTournament, deleteTournament } = useAppStore();
  const { showToast } = useToast();
  const stats = useMemo(() => buildTournamentStats(data, data.matches), [data]);
  const [mode, setMode] = useState<LocalMode>('list');
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISODate());
  const [level, setLevel] = useState('');
  const [eventType, setEventType] = useState<EventType>('MD');
  const [partnerPersonId, setPartnerPersonId] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [resultLabel, setResultLabel] = useState('');
  const [memo, setMemo] = useState('');

  const openCreate = () => {
    setEditingId('');
    setName('');
    setDate(todayISODate());
    setLevel('');
    setEventType('MD');
    setPartnerPersonId('');
    setPlaceId('');
    setResultLabel('');
    setMemo('');
    setMode('form');
  };

  const openEdit = (tournament: Tournament) => {
    setEditingId(tournament.id);
    setName(tournament.name);
    setDate(tournament.date);
    setLevel(tournament.level ?? '');
    setEventType(tournament.eventType ?? 'MD');
    setPartnerPersonId(tournament.partnerPersonId ?? '');
    setPlaceId(tournament.placeId ?? '');
    setResultLabel(tournament.resultLabel ?? '');
    setMemo(tournament.memo ?? '');
    setMode('form');
  };

  const save = () => {
    if (!name.trim()) {
      showToast('대회명을 입력해 주세요.', 'error');
      return;
    }

    try {
      const input = { name, date, level, eventType, partnerPersonId: partnerPersonId || undefined, placeId: placeId || undefined, resultLabel, memo };
      if (editingId) {
        updateTournament(editingId, input);
        showToast('변경사항을 저장했어요.');
      } else {
        addTournament(input);
        showToast('대회를 추가했어요.');
      }
      setMode('list');
    } catch {
      showToast('저장에 실패했어요. 다시 시도해 주세요.', 'error');
    }
  };

  if (mode === 'form') {
    return (
      <Screen>
        <BackHeader title={editingId ? '대회 수정' : '대회 등록'} onBack={() => setMode('list')} />
        <Card style={styles.formCard}>
          <TextField label="대회명" value={name} onChangeText={setName} placeholder="예: 서울시 배드민턴대회" />
          <DateField label="대회 날짜" value={date} onChange={setDate} />
          <SelectBox label="참가 급수" value={level} onChange={setLevel} placeholder="급수 선택" options={levelSelectOptions} />
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>종목</Text>
            <ChipGroup>
              {(Object.keys(eventLabels) as EventType[]).map((event) => (
                <SelectChip key={event} label={eventLabels[event]} selected={eventType === event} onPress={() => setEventType(event)} tone="accent" />
              ))}
            </ChipGroup>
          </View>
          <SelectBox
            label="파트너"
            value={partnerPersonId}
            onChange={setPartnerPersonId}
            placeholder="파트너 선택"
            options={[{ label: '없음', value: '' }, ...data.people.map((person) => ({ label: person.name, value: person.id }))]}
          />
          <SelectBox
            label="장소"
            value={placeId}
            onChange={setPlaceId}
            placeholder="장소 선택"
            options={[{ label: '선택 안 함', value: '' }, ...data.places.map((place) => ({ label: place.address ? `${place.name} · ${place.address}` : place.name, value: place.id }))]}
          />
          <TextField label="최종 결과" value={resultLabel} onChangeText={setResultLabel} placeholder="예: 8강, 준우승" />
          <TextField label="메모" value={memo} onChangeText={setMemo} placeholder="대회 분위기, 배운 점 등" multiline />
          <PrimaryButton label={editingId ? '수정하기' : '추가하기'} onPress={save} icon={<Save color={colors.surface} size={18} />} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title="대회 관리" onBack={onBack} />
      <PrimaryButton label="대회 추가" onPress={openCreate} icon={<Trophy color={colors.surface} size={18} />} />
      <SectionHeader title="대회 목록" />
      {stats.length > 0 ? (
        stats.map((item) => (
          <Card key={item.tournament.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemTitle}>{item.tournament.name}</Text>
                <MetaText>{item.tournament.date} · {item.tournament.level || '급수 미정'} · {eventLabels[item.tournament.eventType ?? 'OTHER']}</MetaText>
                <MetaText>{getPlaceName(data, item.tournament.placeId)} · {item.wins}승 {item.losses}패 · 승률 {formatWinRate(item.winRate)}</MetaText>
              </View>
              <RowActions onEdit={() => openEdit(item.tournament)} onDelete={() => confirmDelete('대회를 삭제할까요?', () => deleteTournament(item.tournament.id), showToast)} />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="참가한 대회를 기록해보세요." />
      )}
    </Screen>
  );
}

function PlaceManager({ onBack }: { onBack: () => void }) {
  const { data, addPlace, updatePlace, deletePlace } = useAppStore();
  const { showToast } = useToast();
  const [mode, setMode] = useState<LocalMode>('list');
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');

  const openCreate = () => {
    setEditingId('');
    setName('');
    setAddress('');
    setMemo('');
    setMode('form');
  };

  const openEdit = (place: Place) => {
    setEditingId(place.id);
    setName(place.name);
    setAddress(place.address ?? '');
    setMemo(place.memo ?? '');
    setMode('form');
  };

  const save = () => {
    if (!name.trim()) {
      showToast('장소명을 입력해 주세요.', 'error');
      return;
    }

    try {
      const input = { name, address, memo };
      if (editingId) {
        updatePlace(editingId, input);
        showToast('변경사항을 저장했어요.');
      } else {
        addPlace(input);
        showToast('장소를 추가했어요.');
      }
      setMode('list');
    } catch {
      showToast('저장에 실패했어요. 다시 시도해 주세요.', 'error');
    }
  };

  if (mode === 'form') {
    return (
      <Screen>
        <BackHeader title={editingId ? '장소 수정' : '장소 등록'} onBack={() => setMode('list')} />
        <Card style={styles.formCard}>
          <TextField label="장소명" value={name} onChangeText={setName} placeholder="예: 한강체육관" />
          <TextField label="주소 또는 지역" value={address} onChangeText={setAddress} placeholder="예: 서울 영등포구" />
          <TextField label="메모" value={memo} onChangeText={setMemo} placeholder="주차, 코트 수, 샤워실 등" multiline />
          <PrimaryButton label={editingId ? '수정하기' : '추가하기'} onPress={save} icon={<Save color={colors.surface} size={18} />} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title="장소 관리" onBack={onBack} />
      <PrimaryButton label="장소 추가" onPress={openCreate} icon={<MapPin color={colors.surface} size={18} />} />
      <SectionHeader title="장소 목록" />
      {data.places.length > 0 ? (
        data.places.map((place) => (
          <Card key={place.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemTitle}>{place.name}</Text>
                <MetaText>{place.address || '주소 미입력'}</MetaText>
                {place.memo ? <MetaText>{place.memo}</MetaText> : null}
              </View>
              <RowActions onEdit={() => openEdit(place)} onDelete={() => confirmDelete('장소를 삭제할까요?', () => deletePlace(place.id), showToast)} />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="장소를 등록해보세요." body="기록 작성 시 등록된 장소를 선택할 수 있어요." />
      )}
    </Screen>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <>
      <View style={styles.topBar}>
        <IconButton label="뒤로" onPress={onBack}>
          <ArrowLeft color={colors.textSecondary} size={19} />
        </IconButton>
      </View>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>관리</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <View style={styles.iconRow}>
      <IconButton label="수정" onPress={onEdit} tone="primary">
        <Pencil color={colors.primaryDark} size={18} />
      </IconButton>
      <IconButton label="삭제" onPress={onDelete} tone="danger">
        <Trash2 color={colors.loss} size={18} />
      </IconButton>
    </View>
  );
}

function formatMeetingNames(meetings: Meeting[], meetingIds: string[]): string {
  return meetingIds
    .map((meetingId) => meetings.find((meeting) => meeting.id === meetingId)?.name ?? '삭제된 모임')
    .join(', ');
}

function formatPlaceNames(places: Place[], placeIds: string[], fallback?: string): string {
  if (placeIds.length === 0) {
    return fallback || '기록할 때마다 선택';
  }

  return placeIds.map((placeId) => places.find((place) => place.id === placeId)?.name ?? '삭제된 장소').join(', ');
}

function confirmDelete(title: string, onConfirm: () => void, showToast: (message: string, tone?: 'success' | 'error') => void) {
  Alert.alert(title, '삭제 후에는 목록에서 보이지 않습니다.', [
    { text: '취소', style: 'cancel' },
    {
      text: '삭제',
      style: 'destructive',
      onPress: () => {
        try {
          onConfirm();
          showToast('삭제했어요.');
        } catch {
          showToast('삭제에 실패했어요. 다시 시도해 주세요.', 'error');
        }
      },
    },
  ]);
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
  entryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  entryIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  formCard: {
    gap: spacing.md,
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
  iconRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
