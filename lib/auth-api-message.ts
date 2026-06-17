type AuthApiErrorResult =
  | { type: "tooManyAttempts" }
  | { type: "needVerify" }
  | { type: "raw"; message: string }
  | { type: "unknown" };

/**
 * Parses a Laravel auth API response into a typed error result.
 * Components map the result to their own translation keys.
 */
export function parseAuthApiError(
  status: number,
  data: {
    temporary_token?: string;
    errors?: Array<{ message?: string }>;
    message?: string;
  },
): AuthApiErrorResult {
  if (status === 429) return { type: "tooManyAttempts" };
  if (data.temporary_token) return { type: "needVerify" };
  const raw = data.errors?.[0]?.message ?? data.message;
  if (raw && /too many attempt/i.test(raw)) return { type: "tooManyAttempts" };
  if (raw) return { type: "raw", message: raw };
  return { type: "unknown" };
}
