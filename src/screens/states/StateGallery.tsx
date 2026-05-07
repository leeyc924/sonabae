import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { OfflineState } from './OfflineState';
import { PermissionDeniedState } from './PermissionDeniedState';

type StateKey = 'empty' | 'error' | 'permission' | 'offline' | 'loading';

const TABS: { key: StateKey; label: string }[] = [
  { key: 'empty', label: '빈' },
  { key: 'error', label: '에러' },
  { key: 'permission', label: '권한' },
  { key: 'offline', label: '오프라인' },
  { key: 'loading', label: '로딩' },
];

export function StateGallery() {
  const [active, setActive] = useState<StateKey>('empty');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((tab) => {
            const selected = tab.key === active;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActive(tab.key)}
                style={[styles.tab, selected && styles.tabSelected]}
              >
                <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.stage}>
        {active === 'empty' && <EmptyState />}
        {active === 'error' && <ErrorState message="ERR_NET_TIMEOUT" />}
        {active === 'permission' && <PermissionDeniedState />}
        {active === 'offline' && <OfflineState pendingCount={2} />}
        {active === 'loading' && <LoadingState />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  tabsWrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabs: { padding: spacing.sm, gap: spacing.sm },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabLabel: { ...typography.label, color: colors.textSecondary },
  tabLabelSelected: { color: '#FFFFFF' },
  stage: { flex: 1 },
});
