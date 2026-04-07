"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { bffFetch } from "@/lib/bff-client";

type TrackResult = {
  id: number;
  order_status: string;
  order_amount: number;
  created_at: string;
};

export default function TrackOrderPage() {
  const t = useTranslations("Account");
  const locale = useLocale();

  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !phone) return;
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await bffFetch("customer/order/track", {
        method: "POST",
        body: JSON.stringify({ order_id: orderId, phone }),
        headers: { "Content-Type": "application/json" },
        locale,
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setError("تعذر العثور على طلب بهذا الرقم أو الجوال.");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم.");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-secondary">{t("trackOrder")}</h1>
        <Link
          href="/account"
          className="text-sm font-semibold text-primary hover:underline"
        >
          &larr; {t("title")}
        </Link>
      </div>

      <div className="store-card overflow-hidden bg-surface">
        <div className="bg-[#44525d] px-6 py-5 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            تتبع طلبك
          </h2>
          <p className="mt-1 text-sm text-white/80">أدخل رقم الطلب ورقم الجوال لمتابعة التوصيل</p>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="رقم الطلب"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="store-input w-full text-end px-4 h-12 border-surface-muted bg-white shadow-sm"
              />
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute start-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-e border-border-soft pe-3">
                <span className="text-sm font-semibold" dir="ltr">+970</span>
                <span>🇵🇸</span>
              </div>
              <input
                type="tel"
                placeholder="أدخل رقم الجوال"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="store-input w-full ps-[80px] pe-4 h-12 text-end border-surface-muted bg-white shadow-sm"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="store-btn-primary min-h-[3rem] w-full md:w-auto px-8 bg-[#f59a85] bg-none hover:brightness-95 border-0 rounded-lg text-white font-bold"
              style={{ background: "#efa18c" }}
            >
              {loading ? "جاري البحث..." : "البحث عن الطلب"}
            </button>
          </form>

          {!result && !error && (
            <div className="mt-16 flex flex-col items-center justify-center opacity-50 space-y-4 pb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="text-secondary/40" viewBox="0 0 16 16">
                <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z"/>
              </svg>
              <p className="text-sm font-medium text-secondary/70">أدخل رقم الطلب ورقم الجوال لمتابعة التوصيل</p>
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-lg bg-red-50 p-4 text-center text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 rounded-lg border border-border-soft p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-soft pb-4">
                <div>
                  <p className="text-xs text-secondary/70">رقم الطلب</p>
                  <p className="text-lg font-black text-secondary">#{result.id}</p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-secondary/70">حالة الطلب</p>
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-bold capitalize text-primary">
                    {String(result.order_status).replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-secondary/70">تاريخ الطلب</p>
                  <p className="font-semibold text-secondary">
                    {new Date(result.created_at).toLocaleDateString(locale)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary/70">الإجمالي</p>
                  <p className="font-semibold text-primary">{result.order_amount} ILS</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}