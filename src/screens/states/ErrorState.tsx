import { StyleSheet, Text, View } from 'react-native';
import { StateView } from '../../components/StateView';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Props = {
  message?: string;
  onRetry?: () => void;
  onSaveDraft?: () => void;
};

export function ErrorState({ message, onRetry, onSaveDraft }: Props) {
  return (
    <StateView
      glyph="⚠️"
      tone="danger"
      title="저장에 실패했어요"
      body="네트워크가 잠시 끊겼거나 서버에 문제가 있어요. 작성하신 내용은 안전하게 임시 보관 중이에요."
      primaryAction={{ label: '다시 시도', onPress: onRetry }}
      secondaryAction={{ label: '임시 저장만 두기', onPress: onSaveDraft, variant: 'ghost' }}
      testID="state-error"
    >
      {message ? (
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>오류 코드</Text>
          <Text style={styles.detailValue}>{message}</Text>
        </View>
      ) : null}
    </StateView>
  );
}

const styles = StyleSheet.create({
  detail: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  detailLabel: { ...typography.label, color: colors.textMuted },
  detailValue: { ...typography.caption, color: colors.textSecondary },
});
