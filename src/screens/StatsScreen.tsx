import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  buildMeetingStats,
  buildPersonStats,
  buildTournamentStats,
  calcWinLoss,
  filterMatchesByPeriod,
  formatWinRate,
  periodLabel,
  resultLabel,
} from '../data/stats';
import { Card, ChipGroup, EmptyState, MetaText, Screen, SectionHeader, SelectChip, StatCard } from '../components/ui';
import { colors, spacing, typography } from '../theme';
import type { PeriodFilter } from '../types';
import { useAppStore } from '../state/AppStore';

type StatsTab = 'summary' | 'people' | 'meetings' | 'tournaments';

const periods: PeriodFilter[] = ['ALL', '7D', '30D', '90D', 'YEAR'];

export function StatsScreen() {
  const { data } = useAppStore();
  const [period, setPeriod] = useState<PeriodFilter>('ALL');
  const [tab, setTab] = useState<StatsTab>('summary');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState('');

  const filteredMatches = useMemo(() => filterMatchesByPeriod(data.matches, period), [data.matches, period]);
  const summary = useMemo(() => calcWinLoss(filteredMatches), [filteredMatches]);
  const personStats = useMemo(() => buildPersonStats(data, filteredMatches), [data, filteredMatches]);
  const meetingStats = useMemo(() => buildMeetingStats(data, filteredMatches), [data, filteredMatches]);
  const tournamentStats = useMemo(() => buildTournamentStats(data, filteredMatches), [data, filteredMatches]);
  const selectedPerson = personStats.find((item) => item.person.id === selectedPersonId);
  const selectedMeeting = meetingStats.find((item) => item.meeting.id === selectedMeetingId);
  const selectedTournament = tournamentStats.find((item) => item.tournament.id === selectedTournamentId);
  const recentResults = [...filteredMatches].sort((a, b) => b.playedAt.localeCompare(a.playedAt)).slice(0, 7);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>통계</Text>
        <Text style={styles.title}>승률과 활동 흐름</Text>
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>기간</Text>
        <ChipGroup>
          {periods.map((item) => (
            <SelectChip key={item} label={periodLabel(item)} selected={period === item} onPress={() => setPeriod(item)} />
          ))}
        </ChipGroup>
      </View>

      <ChipGroup>
        <SelectChip label="전체" selected={tab === 'summary'} onPress={() => setTab('summary')} />
        <SelectChip label="사람별" selected={tab === 'people'} onPress={() => setTab('people')} />
        <SelectChip label="모임별" selected={tab === 'meetings'} onPress={() => setTab('meetings')} />
        <SelectChip label="대회별" selected={tab === 'tournaments'} onPress={() => setTab('tournaments')} tone="accent" />
      </ChipGroup>

      {tab === 'summary' ? (
        <>
          <View style={styles.statGrid}>
            <StatCard label="승률" value={formatWinRate(summary.winRate)} helper={`${summary.wins}승 ${summary.losses}패`} />
            <StatCard label="확정 경기" value={`${summary.decided}`} helper={`${summary.unknown}경기 결과 미정`} tone="neutral" />
          </View>
          <Card style={styles.formCard}>
            <SectionHeader title="최근 7경기" />
            {recentResults.length > 0 ? (
              <View style={styles.resultBars}>
                {recentResults.map((match) => (
                  <View
                    key={match.id}
                    style={[
                      styles.resultBar,
                      match.result === 'WIN' && styles.winBar,
                      match.result === 'LOSS' && styles.lossBar,
                      match.result === 'UNKNOWN' && styles.unknownBar,
                    ]}
                  >
                    <Text style={styles.resultBarText}>{resultLabel(match.result)}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState title="아직 승률을 계산할 경기 기록이 부족해요." body="3경기 이상 기록하면 더 의미 있는 통계를 볼 수 있어요." />
            )}
          </Card>
        </>
      ) : null}

      {tab === 'people' ? (
        <>
          <SectionHeader title="사람별 승률" />
          {personStats.length > 0 ? (
            personStats.map((item) => (
              <Pressable
                key={item.person.id}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${item.person.name} 상세 통계`}
                onPress={() => setSelectedPersonId(selectedPersonId === item.person.id ? '' : item.person.id)}
              >
                <Card style={selectedPersonId === item.person.id ? styles.selectedCard : undefined}>
                  <Text style={styles.itemTitle}>{item.person.name}{item.person.level ? ` · ${item.person.level}` : ''}</Text>
                  <MetaText>{item.totalMatches}경기 · {item.wins}승 {item.losses}패 · 승률 {formatWinRate(item.winRate)}</MetaText>
                  <MetaText>파트너 {formatWinRate(item.partner.winRate)} · 상대 {formatWinRate(item.opponent.winRate)}</MetaText>
                </Card>
              </Pressable>
            ))
          ) : (
            <EmptyState title="사람을 추가하면 승률을 볼 수 있어요." />
          )}
          {selectedPerson ? (
            <Card style={styles.detailCard}>
              <Text style={styles.detailTitle}>{selectedPerson.person.name} 상세</Text>
              <View style={styles.statGrid}>
                <StatCard label="파트너 승률" value={formatWinRate(selectedPerson.partner.winRate)} helper={`${selectedPerson.partner.wins}승 ${selectedPerson.partner.losses}패`} />
                <StatCard label="상대 승률" value={formatWinRate(selectedPerson.opponent.winRate)} helper={`${selectedPerson.opponent.wins}승 ${selectedPerson.opponent.losses}패`} tone="accent" />
              </View>
              <MetaText>최근 경기일: {selectedPerson.lastPlayedAt || '-'}</MetaText>
              <MetaText>가장 많이 경기한 모임: {selectedPerson.topMeetingName || '-'}</MetaText>
            </Card>
          ) : null}
        </>
      ) : null}

      {tab === 'meetings' ? (
        <>
          <SectionHeader title="모임별 승률" />
          {meetingStats.length > 0 ? (
            meetingStats.map((item) => (
              <Pressable
                key={item.meeting.id}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${item.meeting.name} 상세 통계`}
                onPress={() => setSelectedMeetingId(selectedMeetingId === item.meeting.id ? '' : item.meeting.id)}
              >
                <Card style={selectedMeetingId === item.meeting.id ? styles.selectedCard : undefined}>
                  <Text style={styles.itemTitle}>{item.meeting.name}</Text>
                  <MetaText>{item.totalSessions}일 · {item.totalMatches}경기 · 승률 {formatWinRate(item.winRate)}</MetaText>
                  <MetaText>{item.wins}승 {item.losses}패 · 최근 {item.lastPlayedAt || '-'}</MetaText>
                </Card>
              </Pressable>
            ))
          ) : (
            <EmptyState title="모임을 등록하면 활동량을 비교할 수 있어요." />
          )}
          {selectedMeeting ? (
            <Card style={styles.detailCard}>
              <Text style={styles.detailTitle}>{selectedMeeting.meeting.name} 상세</Text>
              <View style={styles.statGrid}>
                <StatCard label="운동일 수" value={`${selectedMeeting.totalSessions}`} helper="모임 기록 기준" />
                <StatCard label="모임 승률" value={formatWinRate(selectedMeeting.winRate)} helper={`${selectedMeeting.wins}승 ${selectedMeeting.losses}패`} tone="accent" />
              </View>
              <MetaText>가장 많이 함께한 사람: {selectedMeeting.topPersonName || '-'}</MetaText>
              <MetaText>최근 활동일: {selectedMeeting.lastPlayedAt || '-'}</MetaText>
            </Card>
          ) : null}
        </>
      ) : null}

      {tab === 'tournaments' ? (
        <>
          <SectionHeader title="대회별 승률" />
          {tournamentStats.length > 0 ? (
            tournamentStats.map((item) => (
              <Pressable
                key={item.tournament.id}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${item.tournament.name} 상세 통계`}
                onPress={() => setSelectedTournamentId(selectedTournamentId === item.tournament.id ? '' : item.tournament.id)}
              >
                <Card style={selectedTournamentId === item.tournament.id ? styles.selectedCard : undefined}>
                  <Text style={styles.itemTitle}>{item.tournament.name}</Text>
                  <MetaText>{item.tournament.date} · {item.tournament.level || '급수 미정'} · {item.totalMatches}경기</MetaText>
                  <MetaText>{item.wins}승 {item.losses}패 · 승률 {formatWinRate(item.winRate)}</MetaText>
                </Card>
              </Pressable>
            ))
          ) : (
            <EmptyState title="참가한 대회를 기록해보세요." />
          )}
          {selectedTournament ? (
            <Card style={styles.detailCard}>
              <Text style={styles.detailTitle}>{selectedTournament.tournament.name} 상세</Text>
              <View style={styles.statGrid}>
                <StatCard label="대회 승률" value={formatWinRate(selectedTournament.winRate)} helper={`${selectedTournament.wins}승 ${selectedTournament.losses}패`} />
                <StatCard label="경기 수" value={`${selectedTournament.totalMatches}`} helper={selectedTournament.tournament.resultLabel || '최종 결과 미입력'} tone="accent" />
              </View>
              <MetaText>파트너: {selectedTournament.partnerName || '-'}</MetaText>
              <MetaText>메모: {selectedTournament.tournament.memo || '-'}</MetaText>
            </Card>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
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
  fieldBlock: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formCard: {
    gap: spacing.md,
  },
  resultBars: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  resultBar: {
    alignItems: 'center',
    borderRadius: spacing.xs,
    flex: 1,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  winBar: {
    backgroundColor: colors.primaryLight,
  },
  lossBar: {
    backgroundColor: '#FFF1F4',
  },
  unknownBar: {
    backgroundColor: colors.divider,
  },
  resultBarText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  selectedCard: {
    borderColor: colors.primary,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  detailCard: {
    gap: spacing.md,
  },
  detailTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
});
