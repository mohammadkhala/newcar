export type AuthApiErrorKey =
  | "tooManyAttempts"
  | "needVerify"
  | "networkError"
  | "invalidCredentials"
  | "phoneTaken"
  | "emailTaken"
  | "weakPassword"
  | "serverError"
  | "error";

type AuthApiErrorResult =
  | { type: "key"; key: AuthApiErrorKey }
  | { type: "raw"; message: string };

const PATTERN_MAP: Array<[RegExp, AuthApiErrorKey]> = [
  [/too many attempt/i,                        "tooManyAttempts"],
  [/credentials do not match|invalid.*login|غير صحيحة/i, "invalidCredentials"],
  [/phone.*taken|taken.*phone|الهاتف.*مسجّل/i, "phoneTaken"],
  [/email.*taken|taken.*email|البريد.*مسجّل/i,  "emailTaken"],
  [/password.*least|at least.*character|كلمة المرور.*قصيرة/i, "weakPassword"],
  [/server error|internal server|500/i,        "serverError"],
];

/**
 * Parses a Laravel auth API response into a typed error result.
 * Returns a translation key when a known pattern matches,
 * or the raw API message (already localized by Laravel) otherwise.
 */
export function parseAuthApiError(
  status: number,
  data: {
    temporary_token?: string;
    errors?: Array<{ message?: string }>;
    message?: string;
  },
): AuthApiErrorResult {
  if (status === 429) return { type: "key", key: "tooManyAttempts" };
  if (status >= 500)  return { type: "key", key: "serverError" };
  if (data.temporary_token) return { type: "key", key: "needVerify" };

  const raw = data.errors?.[0]?.message ?? data.message ?? "";

  for (const [pattern, key] of PATTERN_MAP) {
    if (pattern.test(raw)) return { type: "key", key };
  }

  if (raw) return { type: "raw", message: raw };
  return { type: "key", key: "error" };
}

/** Helper: call inside a catch block when fetch itself throws (network error). */
export function networkErrorResult(): AuthApiErrorResult {
  return { type: "key", key: "networkError" };
}
