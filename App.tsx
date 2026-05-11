import { ComponentType, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { BarChart3, ClipboardList, FolderKanban, Home, UserRound } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import { AppStoreProvider, useAppStore } from './src/state/AppStore';
import { ToastProvider } from './src/components/Toast';
import { colors, radius, shadow, spacing } from './src/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { ManageScreen } from './src/screens/ManageScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RecordScreen } from './src/screens/RecordScreen';
import { StatsScreen } from './src/screens/StatsScreen';

type TabKey = 'home' | 'record' | 'stats' | 'manage' | 'profile';

type TabItem = {
  key: TabKey;
  label: string;
  Icon: ComponentType<{ color: string; size: number; strokeWidth?: number }>;
};

const tabs: TabItem[] = [
  { key: 'home', label: '홈', Icon: Home },
  { key: 'record', label: '기록', Icon: ClipboardList },
  { key: 'stats', label: '통계', Icon: BarChart3 },
  { key: 'manage', label: '관리', Icon: FolderKanban },
  { key: 'profile', label: '내 정보', Icon: UserRound },
];

export default function App() {
  return (
    <AppStoreProvider>
      <ToastProvider>
        <StatusBar style="dark" />
        <AppContent />
      </ToastProvider>
    </AppStoreProvider>
  );
}

function AppContent() {
  const { data, hydrated } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>소나배 준비 중</Text>
      </SafeAreaView>
    );
  }

  if (!data.profile) {
    return (
      <SafeAreaView style={styles.app}>
        <OnboardingScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <View style={styles.content}>
        {activeTab === 'home' ? <HomeScreen onRecordPress={() => setActiveTab('record')} /> : null}
        {activeTab === 'record' ? <RecordScreen /> : null}
        {activeTab === 'stats' ? <StatsScreen /> : null}
        {activeTab === 'manage' ? <ManageScreen /> : null}
        {activeTab === 'profile' ? <ProfileScreen /> : null}
      </View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.Icon;
          const selected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${tab.label} 탭`}
              onPress={() => setActiveTab(tab.key)}
              style={({ pressed }) => [styles.tabItem, selected && styles.tabItemSelected, pressed && styles.pressed]}
            >
              <Icon color={selected ? colors.primaryDark : colors.textMuted} size={21} strokeWidth={2.4} />
              <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '800',
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    bottom: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
    left: spacing.md,
    padding: spacing.xs,
    position: 'absolute',
    right: spacing.md,
    ...shadow.floating,
  },
  tabItem: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.xxs,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  tabItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  tabLabelSelected: {
    color: colors.primaryDark,
  },
  pressed: {
    opacity: 0.72,
  },
});
