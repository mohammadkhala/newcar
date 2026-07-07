"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { bffFetch } from "@/lib/bff-client";
import { BackButton } from "@/components/store/BackButton";

type UserInfo = {
  f_name: string;
  l_name: string;
  email: string;
  phone: string;
  image?: string | null;
  image_full_url?: string | null;
};

export default function AccountProfilePage() {
  const t = useTranslations("Account");
  const tNav = useTranslations("Nav");
  const locale = useLocale();

  const [, setInfo] = useState<UserInfo | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await bffFetch("customer/info", { method: "GET", locale });
    if (res.status === 401) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    setUnauthorized(false);
    const data = (await res.json()) as UserInfo;
    setInfo(data);
    setFName(data.f_name || "");
    setLName(data.l_name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setLoading(false);
  }, [locale]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void load();
    });
    return () => cancelAnimationFrame(id);
  }, [load]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("f_name", fName);
      formData.append("l_name", lName);
      formData.append("email", email);
      formData.append("phone", phone);
      // NOTE: password and image updates are typically supported by the API 
      // but usually require specialized handling or file inputs. We stick to basic text fields here.

      // We use PUT /api/v1/customer/update-profile via BFF (if bff handles PUT with FormData)
      // or we send a standard JSON if BFF expects JSON. 
      // Assuming bffFetch can proxy FormData if we don't set Content-Type.
      const res = await bffFetch("customer/update-profile", {
        method: "PUT",
        body: JSON.stringify({
          f_name: fName,
          l_name: lName,
          email: email,
          phone: phone,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        locale,
      });

      if (res.ok) {
        setMessage({ type: "success", text: "تم تحديث الملف الشخصي بنجاح." });
        await load(); // Reload fresh data
      } else {
        const errorData = await res.json().catch(() => null);
        const errMsg = errorData?.errors?.[0]?.message || "حدث خطأ أثناء التحديث.";
        setMessage({ type: "error", text: errMsg });
      }
    } catch {
      setMessage({ type: "error", text: "تعذر الاتصال بالخادم." });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-secondary">{t("unauthorized")}</p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-primary hover:underline"
        >
          {tNav("login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <BackButton />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-secondary">{t("profile")}</h1>
        <Link
          href="/account"
          className="text-sm font-semibold text-primary hover:underline"
        >
          &larr; {t("title")}
        </Link>
      </div>

      <div className="store-card p-6 md:p-8">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {message && (
            <div
              className={`rounded-lg p-4 text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="f_name" className="text-sm font-semibold text-secondary">
                الاسم الأول
              </label>
              <input
                type="text"
                id="f_name"
                name="f_name"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                required
                className="store-input w-full"
                autoComplete="given-name"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="l_name" className="text-sm font-semibold text-secondary">
                اسم العائلة
              </label>
              <input
                type="text"
                id="l_name"
                name="l_name"
                value={lName}
                onChange={(e) => setLName(e.target.value)}
                required
                className="store-input w-full"
                autoComplete="family-name"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-secondary">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="store-input w-full"
                dir="ltr"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-semibold text-secondary">
                رقم الجوال
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="store-input w-full bg-surface-muted cursor-not-allowed"
                dir="ltr"
                readOnly
                title="لا يمكن تغيير رقم الجوال المعتمد للحساب"
                autoComplete="tel"
              />
              <p className="text-xs text-secondary/60">
                لا يمكن تعديل رقم الجوال.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-soft">
            <button
              type="submit"
              disabled={saving}
              className="store-btn-primary px-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}