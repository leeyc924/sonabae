import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { WeeklyStats, getWeeklyStats } from '../services/matchStorage';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  onBack: () => void;
};

export function WeeklyStatsScreen({ onBack }: Props) {
  const [stats, setStats] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWeeklyStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        if (!cancelled) setStats({ totalMatches: 0, wins: 0, losses: 0, winRate: 0, topPartners: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isEmpty = stats !== null && stats.totalMatches === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="홈으로 돌아가기">
          <Text style={styles.backText}>← 홈</Text>
        </Pressable>
        <Text style={styles.title}>주간 통계</Text>
        <Text style={styles.subtitle}>최근 7일</Text>

        {isEmpty && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>아직 이번 주 기록이 없어요</Text>
            <Text style={styles.emptyBody}>경기를 한 번이라도 기록하면 여기에 통계가 나타나요.</Text>
          </Card>
        )}

        {stats && !isEmpty && (
          <>
            <View style={styles.row}>
              <Card style={styles.metricCard}>
                <Text style={styles.metricLabel}>총 경기</Text>
                <Text style={styles.metricValue}>{stats.totalMatches}</Text>
              </Card>
              <Card style={styles.metricCard}>
                <Text style={styles.metricLabel}>승률</Text>
                <Text style={styles.metricValue}>{stats.winRate}%</Text>
                <Text style={styles.metricSub}>
                  {stats.wins}승 {stats.losses}패
                </Text>
              </Card>
            </View>

            <Card style={styles.partnersCard}>
              <Text style={styles.sectionTitle}>가장 자주 함께한 파트너</Text>
              {stats.topPartners.length === 0 ? (
                <Text style={styles.emptyBody}>이번 주 복식 경기 기록이 없어요.</Text>
              ) : (
                stats.topPartners.map((p, idx) => (
                  <View key={p.nickname} style={styles.partnerRow}>
                    <Text style={styles.partnerRank}>{idx + 1}</Text>
                    <Text style={styles.partnerName}>{p.nickname}</Text>
                    <Text style={styles.partnerCount}>{p.count}경기</Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  back: { paddingVertical: spacing.xs },
  backText: { ...typography.bodyStrong, color: colors.primary },
  title: { ...typography.display, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  emptyCard: { gap: spacing.sm },
  emptyTitle: { ...typography.heading, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary },
  row: { flexDirection: 'row', gap: spacing.md },
  metricCard: { flex: 1, gap: spacing.xs },
  metricLabel: { ...typography.label, color: colors.textSecondary },
  metricValue: { ...typography.display, color: colors.textPrimary },
  metricSub: { ...typography.caption, color: colors.textMuted },
  partnersCard: { gap: spacing.sm },
  sectionTitle: { ...typography.title, color: colors.textPrimary, marginBottom: spacing.xs },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  partnerRank: { ...typography.bodyStrong, color: colors.primary, width: 20 },
  partnerName: { ...typography.body, color: colors.textPrimary, flex: 1 },
  partnerCount: { ...typography.caption, color: colors.textMuted },
});
