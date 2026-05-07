import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = {
  onRecordMatch?: () => void;
  onShowSample?: () => void;
};

export function EmptyState({ onRecordMatch, onShowSample }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>오늘의 일기</Text>
        <Text style={styles.subtitle}>아직 기록된 경기가 없어요</Text>

        <Card style={styles.sampleCard}>
          <View style={styles.sampleBadge}>
            <Text style={styles.sampleBadgeText}>샘플</Text>
          </View>
          <Text style={styles.sampleDate}>2026년 5월 6일 · 화요일</Text>
          <Text style={styles.sampleTitle}>저녁 복식 2세트</Text>
          <View style={styles.sampleScoreRow}>
            <Text style={styles.sampleScore}>21</Text>
            <Text style={styles.sampleVs}>:</Text>
            <Text style={styles.sampleScore}>17</Text>
          </View>
          <Text style={styles.sampleMemo}>
            “스매시 각도가 좋았다. 다음엔 백핸드 리시브 자세를 더 낮춰보자.”
          </Text>
          <Button
            label="샘플처럼 내 기록 만들기"
            variant="secondary"
            onPress={onShowSample}
            style={styles.sampleCta}
          />
        </Card>

        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>첫 경기를 기록해 보세요</Text>
          <Text style={styles.emptyBody}>
            운동이 끝난 직후 5분이면 충분해요. 파트너와 상대, 스코어, 한 줄 메모만 남기면 일기가
            자동으로 만들어져요.
          </Text>
          <Button label="경기 기록하기" onPress={onRecordMatch} style={styles.cta} />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  title: { ...typography.display, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  sampleCard: { gap: spacing.sm, marginTop: spacing.md },
  sampleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  sampleBadgeText: { ...typography.label, color: colors.primary },
  sampleDate: { ...typography.caption, color: colors.textMuted },
  sampleTitle: { ...typography.heading, color: colors.textPrimary },
  sampleScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  sampleScore: { ...typography.display, color: colors.textPrimary },
  sampleVs: { ...typography.title, color: colors.textMuted },
  sampleMemo: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic' },
  sampleCta: { marginTop: spacing.xs },
  emptyCard: { gap: spacing.md },
  emptyTitle: { ...typography.heading, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary },
  cta: { marginTop: spacing.sm },
});
