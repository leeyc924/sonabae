import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { MatchEntryScreen } from './src/screens/MatchEntryScreen';
import { DiaryDetailScreen } from './src/screens/DiaryDetailScreen';
import { WeeklyStatsScreen } from './src/screens/WeeklyStatsScreen';
import { StateGallery } from './src/screens/states/StateGallery';
import { track } from './src/services/analytics';
import { getOrCreateUserId } from './src/services/userId';
import { colors, spacing, typography } from './src/theme/tokens';

type Route =
  | { name: 'home' }
  | { name: 'matchEntry' }
  | { name: 'diaryDetail'; date: string }
  | { name: 'weeklyStats' }
  | { name: 'gallery' };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getOrCreateUserId()
      .then(() => track('app_open'))
      .catch(() => {
        void track('app_open');
      });
  }, []);

  return (
    <>
      {route.name === 'home' && (
        <HomeScreen
          refreshKey={refreshKey}
          onStartMatchEntry={() => setRoute({ name: 'matchEntry' })}
          onOpenDiary={(date) => setRoute({ name: 'diaryDetail', date })}
          onOpenWeeklyStats={() => setRoute({ name: 'weeklyStats' })}
          onOpenGallery={() => setRoute({ name: 'gallery' })}
        />
      )}
      {route.name === 'matchEntry' && (
        <MatchEntryScreen
          onCancel={() => setRoute({ name: 'home' })}
          onSaved={() => {
            setRefreshKey((k) => k + 1);
            setRoute({ name: 'home' });
          }}
        />
      )}
      {route.name === 'diaryDetail' && (
        <DiaryDetailScreen
          date={route.date}
          onBack={() => setRoute({ name: 'home' })}
        />
      )}
      {route.name === 'weeklyStats' && (
        <WeeklyStatsScreen onBack={() => setRoute({ name: 'home' })} />
      )}
      {route.name === 'gallery' && (
        <View style={styles.galleryWrap}>
          <Pressable style={styles.backBtn} onPress={() => setRoute({ name: 'home' })} hitSlop={12}>
            <Text style={styles.backBtnText}>← 홈으로</Text>
          </Pressable>
          <StateGallery />
        </View>
      )}
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  galleryWrap: { flex: 1, backgroundColor: colors.background },
  backBtn: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  backBtnText: { ...typography.bodyStrong, color: colors.primary },
});
