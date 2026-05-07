/**
 * 분석 SDK provider 추상화. 실제 SaaS(Amplitude/Mixpanel) 통합은 자격증명 확보 후
 * 별도 child issue 에서 어댑터를 끼운다. 현재는 콘솔 로깅 noop 어댑터.
 */

export type AnalyticsTrackInput = {
  event: string;
  payload: Record<string, boolean | number> | undefined;
  userId: string | null;
  timestamp: number;
};

export interface AnalyticsProvider {
  readonly name: string;
  track(input: AnalyticsTrackInput): void;
}

export const consoleProvider: AnalyticsProvider = {
  name: 'console',
  track(input) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[analytics]', input.event, input.payload ?? {}, {
        userId: input.userId,
        ts: input.timestamp,
      });
    }
  },
};
