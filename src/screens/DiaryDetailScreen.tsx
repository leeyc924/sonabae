import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { MatchRecord, getMatchesForDate } from '../services/matchStorage';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  date: string;
  onBack: () => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; matches: MatchRecord[] }
  | { status: 'error' };

export function DiaryDetailScreen({ date, onBack }: Props) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    getMatchesForDate(date)
      .then((matches) => {
        if (!cancelled) setState({ status: 'ready', matches });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const matches = state.status === 'ready' ? state.matches : [];
  const wins = matches.filter((m) => m.myScore > m.opponentScore).length;
  const losses = matches.length - wins;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.headerAction}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{date}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {state.status === 'loading' && (
          <Text style={styles.loading}>불러오는 중…</Text>
        )}
        {state.status === 'error' && (
          <Text style={styles.error}>일기를 불러오지 못했어요.</Text>
        )}
        {state.status === 'ready' && matches.length === 0 && (
          <Text style={styles.loading}>이 날의 기록이 없어요.</Text>
        )}
        {state.status === 'ready' && matches.length > 0 && (
          <>
            <Text style={styles.summary}>
              {matches.length}경기 {wins}승 {losses}패
            </Text>
            <View style={styles.list}>
              {matches.map((m) => (
                <Card key={m.id} style={styles.matchCard}>
                  <Text style={styles.matchMeta}>
                    {m.format === 'doubles' ? '복식' : '단식'}
                  </Text>
                  <Text style={styles.matchScore}>
                    {m.myScore} : {m.opponentScore}
                    <Text style={styles.matchOutcome}>
                      {'  '}
                      {m.myScore > m.opponentScore ? '승' : '패'}
                    </Text>
                  </Text>
                  <Text style={styles.matchPeople} numberOfLines={2}>
                    {m.format === 'doubles'
                      ? `나/${m.partnerNickname ?? '익명1'} vs ${m.opponent1Nickname}/${m.opponent2Nickname ?? '익명2'}`
                      : `나 vs ${m.opponent1Nickname}`}
                  </Text>
                  {m.memo ? <Text style={styles.matchMemo}>{m.memo}</Text> : null}
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerAction: { ...typography.bodyStrong, color: colors.primary },
  headerTitle: { ...typography.heading, color: colors.textPrimary },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  summary: { ...typography.title, color: colors.textPrimary },
  list: { gap: spacing.md },
  matchCard: { gap: spacing.xs },
  matchMeta: { ...typography.label, color: colors.textSecondary },
  matchScore: { ...typography.title, color: colors.textPrimary },
  matchOutcome: { ...typography.bodyStrong, color: colors.primary },
  matchPeople: { ...typography.body, color: colors.textSecondary },
  matchMemo: { ...typography.caption, color: colors.textMuted },
  loading: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.body, color: colors.danger },
});
