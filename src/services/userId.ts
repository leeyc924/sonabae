import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const USER_ID_KEY = 'sonabae.user_id.v1';

export async function getOrCreateUserId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(USER_ID_KEY);
  if (existing && isUuidV4(existing)) return existing;

  const fresh = Crypto.randomUUID();
  await SecureStore.setItemAsync(USER_ID_KEY, fresh);
  return fresh;
}

export async function peekUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidV4(value: string): boolean {
  return UUID_V4_RE.test(value);
}
