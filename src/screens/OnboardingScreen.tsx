import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GradeBadge, PrimaryButton, Screen, SelectBox, TextField, Title } from '../components/ui';
import { colors, levelOptions, spacing, typography } from '../theme';
import { useAppStore } from '../state/AppStore';

const levelSelectOptions = levelOptions.map((level) => ({ label: level, value: level }));

export function OnboardingScreen() {
  const { saveProfile } = useAppStore();
  const [nickname, setNickname] = useState('');
  const [currentLevel, setCurrentLevel] = useState('D조');
  const [targetLevel, setTargetLevel] = useState('C조');
  const [customLevel, setCustomLevel] = useState('');

  const resolvedLevel = currentLevel === '기타' ? customLevel : currentLevel;
  const canSubmit = nickname.trim().length > 0 && resolvedLevel.trim().length > 0;

  return (
    <Screen style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.brand}>소나배</Text>
        <Title>소중한 나의 배드민턴 일지</Title>
        <Text style={styles.lead}>운동 후 30초 안에 기록하고 승률과 급수를 확인하세요.</Text>
      </View>

      <View style={styles.badgeRow}>
        <GradeBadge label="현재" value={resolvedLevel || '-'} />
        <GradeBadge label="목표" value={targetLevel || '-'} tone="accent" />
      </View>

      <TextField label="닉네임" value={nickname} onChangeText={setNickname} placeholder="예: 민턴러" />

      <SelectBox label="현재 급수" value={currentLevel} onChange={setCurrentLevel} placeholder="현재 급수 선택" options={levelSelectOptions} />

      {currentLevel === '기타' ? (
        <TextField label="기타 급수" value={customLevel} onChangeText={setCustomLevel} placeholder="예: 지역 B-1" />
      ) : null}

      <SelectBox label="목표 급수" value={targetLevel} onChange={setTargetLevel} placeholder="목표 급수 선택" options={levelSelectOptions} />

      <PrimaryButton
        label="기록 시작하기"
        disabled={!canSubmit}
        onPress={() => saveProfile({ nickname, currentLevel: resolvedLevel, targetLevel })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    minHeight: '100%',
  },
  hero: {
    gap: spacing.sm,
  },
  brand: {
    ...typography.display,
    color: colors.primaryDark,
  },
  lead: {
    ...typography.body,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
