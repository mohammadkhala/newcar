type AuthApiPayload = {
  errors?: Array<{ message?: string }>;
  message?: string;
};

export function authApiErrorMessage(
  res: Response,
  data: AuthApiPayload,
  t: (key: "error" | "throttle") => string,
): string {
  if (res.status === 429) {
    return t("throttle");
  }

  const apiMessage = data.errors?.[0]?.message ?? data.message ?? "";
  if (/too many (attempts|requests)/i.test(apiMessage)) {
    return t("throttle");
  }

  return apiMessage || t("error");
}
