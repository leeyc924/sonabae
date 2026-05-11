import { Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { calcWinLoss, formatWinRate, getMeetingName, getPlaceName, getSessionMatches, getTournamentName } from '../data/stats';
import { Card, EmptyState, GradeBadge, MetaText, PrimaryButton, Screen, SectionHeader, StatCard, Title } from '../components/ui';
import { colors, spacing, typography } from '../theme';
import { useAppStore } from '../state/AppStore';
import { formatKoreanDate, sortByDateDesc } from '../utils/date';

export function HomeScreen({ onRecordPress }: { onRecordPress: () => void }) {
  const { data } = useAppStore();
  const profile = data.profile;
  const overall = calcWinLoss(data.matches);
  const recentSessions = sortByDateDesc(data.sessions).slice(0, 3);
  const recentMeetingId = data.sessions.find((session) => session.meetingId)?.meetingId;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.greeting}>{profile?.nickname ?? '소나배'}님</Text>
        <Title>오늘도 한 게임 기록해볼까요?</Title>
      </View>

      <View style={styles.badges}>
        <GradeBadge label="현재 급수" value={profile?.currentLevel} />
        <GradeBadge label="목표 급수" value={profile?.targetLevel} tone="accent" />
      </View>

      <View style={styles.statGrid}>
        <StatCard label="전체 승률" value={formatWinRate(overall.winRate)} helper={`${overall.wins}승 ${overall.losses}패`} />
        <StatCard label="기록 경기" value={`${overall.total}`} helper={`${overall.unknown}경기 결과 미정`} tone="neutral" />
      </View>

      <Card style={styles.quickCard}>
        <View style={styles.quickText}>
          <Text style={styles.quickTitle}>빠른 기록</Text>
          <MetaText>{recentMeetingId ? `${getMeetingName(data, recentMeetingId)} 이어서 기록` : '새 운동일지를 남겨보세요.'}</MetaText>
        </View>
        <PrimaryButton
          label="기록하기"
          onPress={onRecordPress}
          icon={<Plus color={colors.surface} size={20} />}
          accessibilityLabel="운동일지 기록하기"
        />
      </Card>

      <SectionHeader title="최근 운동일지" />
      {recentSessions.length > 0 ? (
        recentSessions.map((session) => {
          const matches = getSessionMatches(data, session.id);
          const summary = calcWinLoss(matches);
          const isTournament = session.context === 'TOURNAMENT' || Boolean(session.tournamentId);
          const target = isTournament ? getTournamentName(data, session.tournamentId) : getMeetingName(data, session.meetingId);
          return (
            <Card key={session.id}>
              <View style={styles.sessionRow}>
                <View style={styles.sessionMain}>
                  <Text style={styles.sessionTitle}>{formatKoreanDate(session.date)} · {target}</Text>
                  <MetaText>{getPlaceName(data, session.placeId, session.location) || session.memo || '운동 기록'}</MetaText>
                </View>
                <View style={styles.sessionStat}>
                  <Text style={styles.sessionStatNumber}>{summary.wins}승 {summary.losses}패</Text>
                  <MetaText>{formatWinRate(summary.winRate)}</MetaText>
                </View>
              </View>
            </Card>
          );
        })
      ) : (
        <EmptyState title="아직 기록이 없어요." body="첫 배드민턴 일지를 남기면 홈에서 승률을 볼 수 있어요." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  greeting: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCard: {
    gap: spacing.md,
  },
  quickText: {
    gap: spacing.xxs,
  },
  quickTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  sessionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  sessionMain: {
    flex: 1,
    gap: spacing.xxs,
  },
  sessionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sessionStat: {
    alignItems: 'flex-end',
  },
  sessionStatNumber: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
});
