import { ReactNode } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Button } from './Button';
import { colors, spacing, typography } from '../theme/tokens';

type Tone = 'neutral' | 'danger' | 'warning' | 'info';

type Action = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
};

type Props = {
  glyph?: string;
  tone?: Tone;
  title: string;
  body?: string;
  primaryAction?: Action;
  secondaryAction?: Action;
  loading?: boolean;
  children?: ReactNode;
  testID?: string;
  style?: ViewStyle;
};

export function StateView({
  glyph,
  tone = 'neutral',
  title,
  body,
  primaryAction,
  secondaryAction,
  loading,
  children,
  testID,
  style,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      <View style={[styles.container, style]}>
        <View style={styles.center}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.glyphSpinner} />
          ) : glyph ? (
            <View style={[styles.glyphCircle, toneCircleStyles[tone]]}>
              <Text style={styles.glyph}>{glyph}</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          {body ? <Text style={styles.body}>{body}</Text> : null}
          {children}
        </View>
        {(primaryAction || secondaryAction) && (
          <View style={styles.actions}>
            {primaryAction && (
              <Button
                label={primaryAction.label}
                onPress={primaryAction.onPress}
                variant={primaryAction.variant ?? 'primary'}
              />
            )}
            {secondaryAction && (
              <Button
                label={secondaryAction.label}
                onPress={secondaryAction.onPress}
                variant={secondaryAction.variant ?? 'ghost'}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  glyphCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  glyphSpinner: { marginBottom: spacing.sm },
  glyph: { fontSize: 40 },
  title: { ...typography.title, color: colors.textPrimary, textAlign: 'center' },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  actions: { gap: spacing.sm },
});

const toneCircleStyles: Record<Tone, ViewStyle> = {
  neutral: { backgroundColor: colors.primarySubtle },
  danger: { backgroundColor: '#FEE2E2' },
  warning: { backgroundColor: '#FEF3C7' },
  info: { backgroundColor: '#E0F2FE' },
};
