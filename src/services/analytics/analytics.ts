import { peekUserId } from '../userId';
import type {
  AnalyticsEventName,
  AnalyticsEventPayload,
} from './events';
import { assertNoPii, PiiViolationError } from './piiGuard';
import { consoleProvider, type AnalyticsProvider } from './provider';

let activeProvider: AnalyticsProvider = consoleProvider;

export function setAnalyticsProvider(provider: AnalyticsProvider): void {
  activeProvider = provider;
}

export function getAnalyticsProvider(): AnalyticsProvider {
  return activeProvider;
}

/**
 * 타입 안전 이벤트 트래킹. 페이로드는 컴파일 타임에 boolean/number 만 허용되며
 * 런타임 가드(assertNoPii)가 우회 호출을 차단한다.
 *
 * 호출자에게 throw 하지 않는다 — 분석 실패가 사용자 경로를 깨면 안 된다.
 * PII 위반은 dev 빌드에서만 throw 하여 개발 단계에서 즉시 발견되도록 한다.
 */
export async function track<E extends AnalyticsEventName>(
  ...args: AnalyticsEventPayload<E> extends undefined
    ? [event: E]
    : [event: E, payload: AnalyticsEventPayload<E>]
): Promise<void> {
  const [event, payload] = args as [E, AnalyticsEventPayload<E> | undefined];
  try {
    assertNoPii(
      event,
      payload as Record<string, unknown> | undefined,
    );
    const userId = await peekUserId();
    activeProvider.track({
      event,
      payload: payload as Record<string, boolean | number> | undefined,
      userId,
      timestamp: Date.now(),
    });
  } catch (err) {
    if (err instanceof PiiViolationError) {
      if (__DEV__) throw err;
      // prod 에서는 이벤트를 drop — PII 누출 방지가 최우선.
      return;
    }
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] track failed', event, err);
    }
  }
}
