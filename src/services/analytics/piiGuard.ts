/**
 * 런타임 PII 가드. 컴파일 가드를 우회한 호출 (dynamic any, JS interop)을 차단.
 * - string 값은 모두 거부 (별명/메모 누출 방지).
 * - 허용 타입: boolean, number(finite), null/undefined.
 */

export class PiiViolationError extends Error {
  constructor(public readonly field: string, public readonly reason: string) {
    super(`PII guard rejected field "${field}": ${reason}`);
    this.name = 'PiiViolationError';
  }
}

export function assertNoPii(
  eventName: string,
  payload: Record<string, unknown> | undefined,
): void {
  if (!payload) return;
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'boolean') continue;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new PiiViolationError(
          `${eventName}.${key}`,
          'non-finite number',
        );
      }
      continue;
    }
    throw new PiiViolationError(
      `${eventName}.${key}`,
      `disallowed type "${typeof value}" — only boolean/number permitted`,
    );
  }
}
