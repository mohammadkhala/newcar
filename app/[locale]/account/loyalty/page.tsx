"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { bffFetch } from "@/lib/bff-client";

type LoyaltyTransaction = {
  id: number;
  transaction_id: string;
  credit: number;
  debit: number;
  balance: number;
  transaction_type: string;
  reference: string;
  created_at: string;
};

export default function LoyaltyPointsPage() {
  const t = useTranslations("Account");
  const tNav = useTranslations("Nav");
  const locale = useLocale();

  const [points, setPoints] = useState<number | null>(null);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    
    // Fetch user info to get total balance
    const infoRes = await bffFetch("customer/info", { method: "GET", locale });
    if (!infoRes.ok || infoRes.status === 401) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    const infoData = await infoRes.json();
    setPoints(infoData?.loyalty_point ? Number(infoData.loyalty_point) : 0);
    setUnauthorized(false);

    // Fetch loyalty transactions history
    // From analyzing API routes: GET /api/v1/customer/loyalty/history
    try {
      const historyRes = await bffFetch("customer/loyalty/history", { method: "GET", locale });
      if (historyRes.ok) {
        const data = await historyRes.json();
        // Assume API returns { total_size, limit, offset, data: [...] } or just an array
        setHistory(Array.isArray(data) ? data : (data.data || []));
      }
    } catch {
      setHistory([]);
    }

    setLoading(false);
  }, [locale]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void load();
    });
    return () => cancelAnimationFrame(id);
  }, [load]);

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
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-secondary">{t("points")}</h1>
        <Link
          href="/account"
          className="text-sm font-semibold text-primary hover:underline"
        >
          &larr; {t("title")}
        </Link>
      </div>

      <div className="store-card relative overflow-hidden bg-gradient-to-br from-primary to-primary-strong text-white p-8 sm:p-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-black">{points ?? 0}</h2>
            <p className="mt-1 text-sm font-medium text-white/80 uppercase tracking-widest">{t("points")}</p>
          </div>
        </div>
      </div>

      <div className="store-card overflow-hidden">
        <div className="border-b border-border-soft bg-surface-muted px-6 py-4">
          <h3 className="font-bold text-secondary">سجل النقاط</h3>
        </div>
        
        {history.length === 0 ? (
          <div className="p-8 text-center text-sm text-secondary/70">
            لا توجد حركات سابقة للنقاط.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-secondary">
              <thead className="bg-surface-muted/50 text-xs uppercase text-secondary/70">
                <tr>
                  <th scope="col" className="px-6 py-3">رقم الحركة</th>
                  <th scope="col" className="px-6 py-3">التاريخ</th>
                  <th scope="col" className="px-6 py-3">نوع الحركة</th>
                  <th scope="col" className="px-6 py-3">نقاط المكتسبة</th>
                  <th scope="col" className="px-6 py-3">نقاط المستهلكة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {history.map((item) => {
                  const date = new Date(item.created_at).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <tr key={item.id} className="hover:bg-surface-muted/30">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-secondary/60">
                        {item.transaction_id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{date}</td>
                      <td className="whitespace-nowrap px-6 py-4 capitalize font-medium">
                        {item.transaction_type.replace(/_/g, " ")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-green-600">
                        {item.credit > 0 ? `+${item.credit}` : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-red-600">
                        {item.debit > 0 ? `-${item.debit}` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}