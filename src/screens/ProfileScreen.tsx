import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Save, Trash2 } from 'lucide-react-native';

import { useToast } from '../components/Toast';
import {
  Card,
  EmptyState,
  GradeBadge,
  MetaText,
  PrimaryButton,
  Screen,
  SectionHeader,
  SelectBox,
  StatCard,
  TextField,
} from '../components/ui';
import { calcWinLoss, formatWinRate } from '../data/stats';
import { colors, levelOptions, spacing, typography } from '../theme';
import { useAppStore } from '../state/AppStore';

export function ProfileScreen() {
  const { data, saveProfile, resetData } = useAppStore();
  const { showToast } = useToast();
  const profile = data.profile;
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [currentLevel, setCurrentLevel] = useState(profile?.currentLevel ?? '');
  const [targetLevel, setTargetLevel] = useState(profile?.targetLevel ?? '');
  const [reason, setReason] = useState('');
  const summary = calcWinLoss(data.matches);

  const save = () => {
    if (!nickname.trim() || !currentLevel.trim()) {
      showToast('닉네임과 현재 급수를 입력해 주세요.', 'error');
      return;
    }

    try {
      saveProfile({ nickname, currentLevel, targetLevel }, reason);
      setReason('');
      showToast('변경사항을 저장했어요.');
    } catch {
      showToast('저장에 실패했어요. 다시 시도해 주세요.', 'error');
    }
  };

  const confirmReset = () => {
    Alert.alert('데이터를 초기화할까요?', '저장된 프로필과 기록이 모두 삭제됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: () =>
          resetData()
            .then(() => showToast('데이터를 초기화했어요.'))
            .catch(() => showToast('초기화에 실패했어요. 다시 시도해 주세요.', 'error')),
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>내 정보</Text>
        <Text style={styles.title}>급수와 기록 상태</Text>
      </View>

      <View style={styles.badges}>
        <GradeBadge label="현재 급수" value={currentLevel} />
        <GradeBadge label="목표 급수" value={targetLevel} tone="accent" />
      </View>

      <View style={styles.statGrid}>
        <StatCard label="전체 승률" value={formatWinRate(summary.winRate)} helper={`${summary.wins}승 ${summary.losses}패`} />
        <StatCard label="누적 경기" value={`${summary.total}`} helper={`${data.sessions.length}개 운동일지`} tone="neutral" />
      </View>

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>프로필</Text>
        <TextField label="닉네임" value={nickname} onChangeText={setNickname} placeholder="닉네임" />
        <SelectBox label="현재 급수" value={currentLevel} onChange={setCurrentLevel} placeholder="현재 급수 선택" options={buildLevelOptions(currentLevel)} />
        <SelectBox label="목표 급수" value={targetLevel} onChange={setTargetLevel} placeholder="목표 급수 선택" options={buildLevelOptions(targetLevel)} />
        <TextField label="변경 사유" value={reason} onChangeText={setReason} placeholder="예: 대회 입상 후 승급" />
        <PrimaryButton label="저장하기" onPress={save} icon={<Save color={colors.surface} size={18} />} />
      </Card>

      <SectionHeader title="급수 변경 이력" />
      {data.gradeHistory.length > 0 ? (
        data.gradeHistory.map((history) => (
          <Card key={history.id}>
            <Text style={styles.itemTitle}>
              {history.fromLevel || '-'} → {history.toLevel}
            </Text>
            <MetaText>{history.changedAt} · {history.reason || '변경 사유 없음'}</MetaText>
          </Card>
        ))
      ) : (
        <EmptyState title="아직 급수 변경 이력이 없어요." body="현재 급수를 바꾸면 이력이 남습니다." />
      )}

      <SectionHeader title="데이터 관리" />
      <Card style={styles.formCard}>
        <MetaText>사람 {data.people.length}명 · 모임 {data.meetings.length}개 · 대회 {data.tournaments.length}개 · 경기 {data.matches.length}개</MetaText>
        <PrimaryButton label="데이터 초기화" onPress={confirmReset} variant="danger" icon={<Trash2 color={colors.surface} size={18} />} />
      </Card>
    </Screen>
  );
}

function buildLevelOptions(currentValue: string) {
  const options = levelOptions.map((level) => ({ label: level, value: level }));
  if (currentValue && !levelOptions.includes(currentValue)) {
    return [{ label: currentValue, value: currentValue }, ...options];
  }
  return options;
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formCard: {
    gap: spacing.md,
  },
  formTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
});
