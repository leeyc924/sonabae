import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MatchRecord, listMatches } from '../services/matchStorage';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  refreshKey: number;
  onStartMatchEntry: () => void;
  onOpenGallery: () => void;
};

export function HomeScreen({ refreshKey, onStartMatchEntry, onOpenGallery }: Props) {
  const [matches, setMatches] = useState<MatchRecord[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMatches()
      .then((list) => {
        if (!cancelled) setMatches(list);
      })
      .catch(() => {
        if (!cancelled) setMatches([]);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const isEmpty = matches !== null && matches.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>오늘의 일기</Text>
        <Text style={styles.subtitle}>
          {isEmpty ? '아직 기록된 경기가 없어요' : `누적 ${matches?.length ?? 0}경기`}
        </Text>

        {isEmpty && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>첫 경기를 기록해 보세요</Text>
            <Text style={styles.emptyBody}>
              운동이 끝난 직후 5분이면 충분해요. 파트너와 상대, 스코어, 한 줄 메모만 남기면 일기가 자동으로 만들어져요.
            </Text>
            <Button label="경기 기록하기" onPress={onStartMatchEntry} style={styles.cta} />
          </Card>
        )}

        {matches && matches.length > 0 && (
          <View style={styles.list}>
            <Button label="새 경기 기록" onPress={onStartMatchEntry} />
            {matches.map((m) => (
              <Card key={m.id} style={styles.recordCard}>
                <Text style={styles.recordDate}>{m.date} · {m.format === 'doubles' ? '복식' : '단식'}</Text>
                <Text style={styles.recordScore}>{m.myScore} : {m.opponentScore}</Text>
                <Text style={styles.recordPeople} numberOfLines={1}>
                  {m.format === 'doubles'
                    ? `나/${m.partnerNickname} vs ${m.opponent1Nickname}/${m.opponent2Nickname}`
                    : `나 vs ${m.opponent1Nickname}`}
                </Text>
                {m.memo ? <Text style={styles.recordMemo} numberOfLines={2}>{m.memo}</Text> : null}
              </Card>
            ))}
          </View>
        )}

        <Pressable onPress={onOpenGallery} style={styles.galleryLink} hitSlop={8}>
          <Text style={styles.galleryLinkText}>상태 갤러리 (디자인 QA)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  title: { ...typography.display, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  emptyCard: { gap: spacing.md, marginTop: spacing.md },
  emptyTitle: { ...typography.heading, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary },
  cta: { marginTop: spacing.sm },
  list: { gap: spacing.md, marginTop: spacing.sm },
  recordCard: { gap: spacing.xs },
  recordDate: { ...typography.label, color: colors.textSecondary },
  recordScore: { ...typography.title, color: colors.textPrimary },
  recordPeople: { ...typography.body, color: colors.textSecondary },
  recordMemo: { ...typography.caption, color: colors.textMuted },
  galleryLink: { alignSelf: 'center', marginTop: spacing.xl, paddingVertical: spacing.sm },
  galleryLinkText: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'underline' },
});
