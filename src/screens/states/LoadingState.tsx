import { StateView } from '../../components/StateView';

type Props = {
  title?: string;
  body?: string;
};

export function LoadingState({
  title = '일기를 불러오고 있어요',
  body = '잠시만 기다려 주세요. 곧 오늘의 기록이 도착해요.',
}: Props) {
  return <StateView loading title={title} body={body} testID="state-loading" />;
}
