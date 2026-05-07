import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getOrCreateUserId } from '../services/userId';
import { colors, spacing, typography } from '../theme/tokens';

export function EmptyDiaryScreen() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateUserId().then(setUserId).catch(() => setUserId(null));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>오늘의 일기</Text>
        <Text style={styles.subtitle}>아직 기록된 경기가 없어요</Text>

        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>첫 경기를 기록해 보세요</Text>
          <Text style={styles.emptyBody}>
            운동이 끝난 직후 5분이면 충분해요. 파트너와 상대, 스코어, 한 줄 메모만 남기면 일기가 자동으로 만들어져요.
          </Text>
          <Button label="경기 기록하기" onPress={() => {}} style={styles.cta} />
        </Card>

        <View style={styles.footer}>
          {userId ? (
            <Text style={styles.userId}>device id: {userId.slice(0, 8)}…</Text>
          ) : (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  title: { ...typography.display, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  emptyCard: { gap: spacing.md, marginTop: spacing.md },
  emptyTitle: { ...typography.heading, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary },
  cta: { marginTop: spacing.sm },
  footer: { marginTop: 'auto', alignItems: 'center', paddingVertical: spacing.lg },
  userId: { ...typography.caption, color: colors.textMuted },
});
