import { useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DiaryCard, listDiaryCards } from '../services/matchStorage';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  refreshKey: number;
  onStartMatchEntry: () => void;
  onOpenDiary: (date: string) => void;
  onOpenGallery: () => void;
};

export function HomeScreen({ refreshKey, onStartMatchEntry, onOpenDiary, onOpenGallery }: Props) {
  const [cards, setCards] = useState<DiaryCard[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listDiaryCards()
      .then((list) => {
        if (!cancelled) setCards(list);
      })
      .catch(() => {
        if (!cancelled) setCards([]);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const isEmpty = cards !== null && cards.length === 0;
  const totalMatches = (cards ?? []).reduce((sum, c) => sum + c.matchCount, 0);

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>오늘의 일기</Text>
      <Text style={styles.subtitle}>
        {isEmpty ? '아직 기록된 경기가 없어요' : `최근 30일 · ${totalMatches}경기`}
      </Text>
      {!isEmpty && cards && cards.length > 0 && (
        <Button label="새 경기 기록" onPress={onStartMatchEntry} style={styles.newCta} />
      )}
    </View>
  );

  const footer = (
    <Pressable onPress={onOpenGallery} style={styles.galleryLink} hitSlop={8}>
      <Text style={styles.galleryLinkText}>상태 갤러리 (디자인 QA)</Text>
    </Pressable>
  );

  if (isEmpty) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {header}
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>첫 경기를 기록해 보세요</Text>
            <Text style={styles.emptyBody}>
              운동이 끝난 직후 5분이면 충분해요. 파트너와 상대, 스코어, 한 줄 메모만 남기면 일기가 자동으로 만들어져요.
            </Text>
            <Button label="경기 기록하기" onPress={onStartMatchEntry} style={styles.cta} />
          </Card>
          {footer}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList<DiaryCard>
        data={cards ?? []}
        keyExtractor={(item) => item.date}
        renderItem={renderCard(onOpenDiary)}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={Separator}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={{ height: spacing.md }} />;
}

function renderCard(onOpenDiary: (date: string) => void) {
  return ({ item }: ListRenderItemInfo<DiaryCard>) => (
    <Pressable
      onPress={() => onOpenDiary(item.date)}
      accessibilityRole="button"
      accessibilityLabel={`${item.date} 일기 상세 열기`}
    >
      <Card style={styles.diaryCard}>
        <Text style={styles.diaryDate}>{item.date}</Text>
        <Text style={styles.diarySummary}>
          {item.matchCount}경기 {item.wins}승 {item.losses}패
        </Text>
        {item.memos.length > 0 && (
          <Text style={styles.diaryMemo} numberOfLines={2}>
            {item.memos.join(' · ')}
          </Text>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, flex: 1 },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  header: { gap: spacing.xs, marginBottom: spacing.md },
  title: { ...typography.display, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  newCta: { marginTop: spacing.md },
  emptyCard: { gap: spacing.md, marginTop: spacing.md },
  emptyTitle: { ...typography.heading, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary },
  cta: { marginTop: spacing.sm },
  diaryCard: { gap: spacing.xs },
  diaryDate: { ...typography.label, color: colors.textSecondary },
  diarySummary: { ...typography.title, color: colors.textPrimary },
  diaryMemo: { ...typography.caption, color: colors.textMuted },
  galleryLink: { alignSelf: 'center', marginTop: spacing.xl, paddingVertical: spacing.sm },
  galleryLinkText: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'underline' },
});
