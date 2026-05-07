/**
 * 분석 이벤트 스키마. PII 가드의 1차 방어선 — 컴파일 타임 차단.
 *
 * 규칙:
 *  - 페이로드 값은 boolean/number/허용된 enum 문자열만.
 *  - 별명/메모 등 자유 텍스트는 절대 타입에 포함하지 않는다.
 *  - 새 이벤트 추가 시 PrimitivePayload 제약을 반드시 통과해야 한다.
 */

type Primitive = boolean | number;

type PayloadValue = Primitive;

type PrimitivePayload = Readonly<Record<string, PayloadValue>> | undefined;

export type AnalyticsEventMap = {
  app_open: undefined;
  match_record_started: undefined;
  match_record_saved: {
    duration_ms: number;
    doubles: boolean;
    has_memo: boolean;
  };
  diary_viewed: undefined;
  stats_viewed: undefined;
};

// 컴파일 타임 보증: 모든 이벤트 페이로드는 PrimitivePayload 만 허용.
type AssertNoPii = {
  [K in keyof AnalyticsEventMap]: AnalyticsEventMap[K] extends PrimitivePayload
    ? true
    : never;
};
// 실패 시 컴파일 에러 — 새 이벤트가 string 필드를 추가하면 여기서 막힌다.
const _piiCheck: AssertNoPii = {
  app_open: true,
  match_record_started: true,
  match_record_saved: true,
  diary_viewed: true,
  stats_viewed: true,
};
void _piiCheck;

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsEventPayload<E extends AnalyticsEventName> =
  AnalyticsEventMap[E];
