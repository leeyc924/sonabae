import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { SegmentedControl } from '../components/SegmentedControl';
import { track } from '../services/analytics';
import {
  MatchDraft,
  MatchFormat,
  clearDraft,
  emptyDraft,
  loadDraft,
  saveDraft,
  saveMatch,
} from '../services/matchStorage';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  onCancel: () => void;
  onSaved: () => void;
};

export function MatchEntryScreen({ onCancel, onSaved }: Props) {
  const [draft, setDraft] = useState<MatchDraft>(() => emptyDraft());
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    void track('match_record_started');
    startedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadDraft()
      .then((existing) => {
        if (!cancelled && existing) setDraft(existing);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        saveDraft(draftRef.current).catch(() => undefined);
      }
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, []);

  const update = <K extends keyof MatchDraft>(key: K, value: MatchDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormatChange = (format: MatchFormat) => {
    setDraft((prev) => ({ ...prev, format }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = await saveMatch({
      date: draft.date,
      format: draft.format,
      partnerNickname: draft.partnerNickname,
      opponent1Nickname: draft.opponent1Nickname,
      opponent2Nickname: draft.opponent2Nickname,
      myScore: draft.myScore,
      opponentScore: draft.opponentScore,
      memo: draft.memo,
    });
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert('저장할 수 없어요', result.error);
      return;
    }
    await clearDraft();
    void track('match_record_saved', {
      duration_ms: Date.now() - startedAtRef.current,
      doubles: draft.format === 'doubles',
      has_memo: draft.memo.trim().length > 0,
    });
    onSaved();
  };

  if (!hydrated) {
    return <View style={styles.safe} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={onCancel} hitSlop={12}>
          <Text style={styles.headerAction}>취소</Text>
        </Pressable>
        <Text style={styles.headerTitle}>경기 기록</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SegmentedControl<MatchFormat>
          value={draft.format}
          options={[
            { value: 'doubles', label: '복식' },
            { value: 'singles', label: '단식' },
          ]}
          onChange={handleFormatChange}
        />

        <InputField
          label="날짜"
          value={draft.date}
          onChangeText={(v) => update('date', v)}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {draft.format === 'doubles' && (
          <InputField
            label="파트너 별명"
            value={draft.partnerNickname}
            onChangeText={(v) => update('partnerNickname', v)}
            placeholder="비워두면 익명1"
            returnKeyType="next"
          />
        )}

        <InputField
          label={draft.format === 'doubles' ? '상대 1 별명' : '상대 별명'}
          value={draft.opponent1Nickname}
          onChangeText={(v) => update('opponent1Nickname', v)}
          placeholder="비워두면 익명1"
          returnKeyType="next"
        />

        {draft.format === 'doubles' && (
          <InputField
            label="상대 2 별명"
            value={draft.opponent2Nickname}
            onChangeText={(v) => update('opponent2Nickname', v)}
            placeholder="비워두면 익명2"
            returnKeyType="next"
          />
        )}

        <View style={styles.scoreRow}>
          <InputField
            containerStyle={styles.scoreField}
            label="우리 점수"
            value={draft.myScore}
            onChangeText={(v) => update('myScore', v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="21"
            maxLength={2}
          />
          <Text style={styles.scoreSeparator}>:</Text>
          <InputField
            containerStyle={styles.scoreField}
            label="상대 점수"
            value={draft.opponentScore}
            onChangeText={(v) => update('opponentScore', v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="15"
            maxLength={2}
          />
        </View>

        <InputField
          label="한 줄 메모"
          value={draft.memo}
          onChangeText={(v) => update('memo', v)}
          placeholder="오늘 컨디션, 기억하고 싶은 한 장면"
          maxLength={140}
          multiline
          style={styles.memoInput}
        />

        <Button
          label={submitting ? '저장 중…' : '기록 저장'}
          onPress={handleSubmit}
          disabled={submitting || !draft.myScore || !draft.opponentScore}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  scoreField: { flex: 1 },
  scoreSeparator: {
    ...typography.title,
    color: colors.textSecondary,
    paddingBottom: spacing.sm,
  },
  memoInput: {
    minHeight: 72,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
    borderRadius: radius.md,
  },
});
