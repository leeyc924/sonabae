import { useMemo, useState, type PropsWithChildren, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';

import { colors, radius, shadow, spacing, typography } from '../theme';
import { addMonthsToISODate, getCalendarDates, isSameMonth, monthLabel, todayISODate } from '../utils/date';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  accessibilityLabel?: string;
};

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
};

type SelectChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  tone?: 'primary' | 'accent' | 'neutral' | 'danger';
};

type SelectBoxOption = {
  label: string;
  value: string;
};

type SelectBoxProps = {
  label: string;
  value: string;
  options: SelectBoxOption[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export function Screen({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.screen, style]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, icon, variant = 'primary', accessibilityLabel }: ButtonProps) {
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        variant === 'ghost' && styles.ghostButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' && styles.secondaryButtonText,
          variant === 'ghost' && styles.ghostButtonText,
          disabled && styles.disabledButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  label,
  onPress,
  children,
  tone = 'neutral',
}: PropsWithChildren<{ label: string; onPress: () => void; tone?: 'neutral' | 'danger' | 'primary' }>) {
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        tone === 'danger' && styles.iconButtonDanger,
        tone === 'primary' && styles.iconButtonPrimary,
        pressed && styles.pressedButton,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function TextField({ label, value, onChangeText, placeholder, keyboardType, multiline }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

export function SelectBox({ label, value, options, onChange, placeholder = '선택' }: SelectBoxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${label} 선택`}
        onPress={() => setOpen((previous) => !previous)}
        style={({ pressed }) => [styles.selectBox, pressed && styles.pressedButton]}
      >
        <Text style={[styles.selectBoxText, !selected && styles.selectPlaceholder]}>{selected?.label ?? placeholder}</Text>
        <ChevronDown color={colors.textSecondary} size={18} />
      </Pressable>
      {open ? (
        <View style={styles.selectMenu}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessible
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={option.label}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.selectOption, isSelected && styles.selectOptionSelected, pressed && styles.pressedButton]}
              >
                <Text style={[styles.selectOptionText, isSelected && styles.selectOptionTextSelected]}>{option.label}</Text>
                {isSelected ? <Check color={colors.primaryDark} size={17} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(value || todayISODate());
  const dates = useMemo(() => getCalendarDates(visibleMonth), [visibleMonth]);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${label} 달력 열기`}
        onPress={() => {
          setVisibleMonth(value || todayISODate());
          setOpen((previous) => !previous);
        }}
        style={({ pressed }) => [styles.selectBox, pressed && styles.pressedButton]}
      >
        <Text style={styles.selectBoxText}>{value || todayISODate()}</Text>
        <ChevronDown color={colors.textSecondary} size={18} />
      </Pressable>
      {open ? (
        <View style={styles.calendar}>
          <View style={styles.calendarHeader}>
            <IconButton label="이전 달" onPress={() => setVisibleMonth((previous) => addMonthsToISODate(previous, -1))}>
              <ChevronLeft color={colors.textSecondary} size={18} />
            </IconButton>
            <Text style={styles.calendarTitle}>{monthLabel(visibleMonth)}</Text>
            <IconButton label="다음 달" onPress={() => setVisibleMonth((previous) => addMonthsToISODate(previous, 1))}>
              <ChevronRight color={colors.textSecondary} size={18} />
            </IconButton>
          </View>
          <View style={styles.weekRow}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <Text key={day} style={styles.weekText}>{day}</Text>
            ))}
          </View>
          <View style={styles.dateGrid}>
            {dates.map((date) => {
              const selected = date === value;
              const inMonth = isSameMonth(date, visibleMonth);
              return (
                <Pressable
                  key={date}
                  accessible
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={date}
                  onPress={() => {
                    onChange(date);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.dateCell,
                    selected && styles.dateCellSelected,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={[styles.dateText, !inMonth && styles.dateTextMuted, selected && styles.dateTextSelected]}>
                    {Number(date.slice(8, 10))}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function SelectChip({ label, selected, onPress, tone = 'neutral' }: SelectChipProps) {
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selectedChip,
        selected && tone === 'accent' && styles.selectedAccentChip,
        selected && tone === 'danger' && styles.selectedDangerChip,
        pressed && styles.pressedButton,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          selected && styles.selectedChipText,
          selected && tone === 'accent' && styles.selectedAccentChipText,
          selected && tone === 'danger' && styles.selectedDangerChipText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipGroup({ children }: PropsWithChildren) {
  return <View style={styles.chipGroup}>{children}</View>;
}

export function StatCard({
  label,
  value,
  helper,
  tone = 'primary',
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: 'primary' | 'accent' | 'neutral' | 'win' | 'loss';
}) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          tone === 'accent' && styles.accentText,
          tone === 'win' && styles.winText,
          tone === 'loss' && styles.lossText,
          tone === 'neutral' && styles.neutralText,
        ]}
      >
        {value}
      </Text>
      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </Card>
  );
}

export function GradeBadge({ label, value, tone = 'primary' }: { label: string; value?: string; tone?: 'primary' | 'accent' }) {
  return (
    <View style={[styles.gradeBadge, tone === 'accent' && styles.gradeBadgeAccent]}>
      <Text style={[styles.gradeLabel, tone === 'accent' && styles.gradeLabelAccent]}>{label}</Text>
      <Text style={[styles.gradeValue, tone === 'accent' && styles.gradeValueAccent]}>{value || '-'}</Text>
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function MetaText({ children }: PropsWithChildren) {
  return <Text style={styles.metaText}>{children}</Text>;
}

export function Title({ children }: PropsWithChildren) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: PropsWithChildren) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 120,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadow.card,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  secondaryButton: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  dangerButton: {
    backgroundColor: colors.loss,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    minHeight: 44,
  },
  disabledButton: {
    backgroundColor: colors.divider,
  },
  pressedButton: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
  buttonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: colors.primaryDark,
  },
  ghostButtonText: {
    color: colors.primaryDark,
  },
  disabledButtonText: {
    color: colors.textMuted,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconButtonDanger: {
    backgroundColor: '#FFF1F4',
    borderColor: '#F8CAD4',
  },
  iconButtonPrimary: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  multilineInput: {
    minHeight: 92,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  selectBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  selectBoxText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  selectPlaceholder: {
    color: colors.textMuted,
  },
  selectMenu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectOption: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  selectOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  selectOptionText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  selectOptionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  calendar: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  calendarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 40,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  dateCellSelected: {
    backgroundColor: colors.primary,
  },
  dateText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  dateTextMuted: {
    color: colors.textMuted,
  },
  dateTextSelected: {
    color: colors.surface,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedAccentChip: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  selectedDangerChip: {
    backgroundColor: colors.loss,
    borderColor: colors.loss,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedChipText: {
    color: colors.surface,
  },
  selectedAccentChipText: {
    color: colors.textPrimary,
  },
  selectedDangerChipText: {
    color: colors.surface,
  },
  statCard: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 150,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    ...typography.statNumber,
    color: colors.primaryDark,
  },
  accentText: {
    color: '#8A5A00',
  },
  winText: {
    color: colors.win,
  },
  lossText: {
    color: colors.loss,
  },
  neutralText: {
    color: colors.textPrimary,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  gradeBadge: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  gradeBadgeAccent: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  gradeLabel: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  gradeLabelAccent: {
    color: '#7A5100',
  },
  gradeValue: {
    color: colors.primaryDark,
    fontSize: 26,
    fontWeight: '800',
  },
  gradeValueAccent: {
    color: '#7A5100',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: spacing.xs,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export const uiStyles = styles;
