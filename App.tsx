import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { MatchEntryScreen } from './src/screens/MatchEntryScreen';
import { StateGallery } from './src/screens/states/StateGallery';
import { track } from './src/services/analytics';
import { getOrCreateUserId } from './src/services/userId';
import { colors, spacing, typography } from './src/theme/tokens';

type Route = 'home' | 'matchEntry' | 'gallery';

export default function App() {
  const [route, setRoute] = useState<Route>('home');
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
      {route === 'home' && (
        <HomeScreen
          refreshKey={refreshKey}
          onStartMatchEntry={() => setRoute('matchEntry')}
          onOpenGallery={() => setRoute('gallery')}
        />
      )}
      {route === 'matchEntry' && (
        <MatchEntryScreen
          onCancel={() => setRoute('home')}
          onSaved={() => {
            setRefreshKey((k) => k + 1);
            setRoute('home');
          }}
        />
      )}
      {route === 'gallery' && (
        <View style={styles.galleryWrap}>
          <Pressable style={styles.backBtn} onPress={() => setRoute('home')} hitSlop={12}>
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
