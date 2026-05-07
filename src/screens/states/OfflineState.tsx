import { StateView } from '../../components/StateView';

type Props = {
  pendingCount?: number;
  onRetry?: () => void;
  onContinueOffline?: () => void;
};

export function OfflineState({ pendingCount = 0, onRetry, onContinueOffline }: Props) {
  const body =
    pendingCount > 0
      ? `인터넷 연결이 끊겼어요. 작성한 일기 ${pendingCount}건은 기기에 안전하게 보관되어 있어요. 연결되면 자동으로 동기화돼요.`
      : '인터넷 연결이 끊겼어요. 일기 작성은 계속할 수 있고, 연결되면 자동으로 동기화돼요.';

  return (
    <StateView
      glyph="📡"
      tone="info"
      title="오프라인 상태예요"
      body={body}
      primaryAction={{ label: '다시 연결 시도', onPress: onRetry }}
      secondaryAction={{ label: '오프라인으로 계속하기', onPress: onContinueOffline, variant: 'ghost' }}
      testID="state-offline"
    />
  );
}
