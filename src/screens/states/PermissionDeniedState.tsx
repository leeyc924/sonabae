import { StateView } from '../../components/StateView';

type Props = {
  onOpenSettings?: () => void;
  onSkip?: () => void;
};

export function PermissionDeniedState({ onOpenSettings, onSkip }: Props) {
  return (
    <StateView
      glyph="🔔"
      tone="warning"
      title="알림 권한이 꺼져 있어요"
      body="경기 후 5분 안에 일기를 남기는 게 가장 효과적이에요. 알림을 켜면 운동 끝난 시간에 맞춰 살짝만 알려드릴게요."
      primaryAction={{ label: '설정에서 알림 켜기', onPress: onOpenSettings }}
      secondaryAction={{ label: '나중에 할게요', onPress: onSkip, variant: 'ghost' }}
      testID="state-permission-denied"
    />
  );
}
