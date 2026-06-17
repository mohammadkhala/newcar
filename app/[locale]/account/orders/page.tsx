"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { bffFetch } from "@/lib/bff-client";

type Order = {
  id: number;
  order_amount: number;
  order_status: string;
  payment_method: string;
  created_at: string;
};

const STATUS_KEYS = ["pending","confirmed","processing","out_for_delivery","delivered","canceled","returned"] as const;
const PAYMENT_KEYS = ["cash_on_delivery","digital_payment","offline_payment"] as const;
type StatusKey = typeof STATUS_KEYS[number];
type PaymentKey = typeof PAYMENT_KEYS[number];

export default function AccountOrdersPage() {
  const t = useTranslations("AccountOrders");
  const tNav = useTranslations("Nav");
  const tAccount = useTranslations("Account");
  const locale = useLocale();

  function tStatus(s: string) {
    return STATUS_KEYS.includes(s as StatusKey) ? t(`statuses.${s as StatusKey}`) : s.replace(/_/g, " ");
  }
  function tPayment(p: string) {
    return PAYMENT_KEYS.includes(p as PaymentKey) ? t(`payments.${p as PaymentKey}`) : p.replace(/_/g, " ");
  }
  
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // Check if user info is available (auth)
    const infoRes = await bffFetch("customer/info", { method: "GET", locale });
    if (!infoRes.ok || infoRes.status === 401) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    setUnauthorized(false);

    // Fetch orders list
    const res = await bffFetch("customer/order/list", { method: "GET", locale });
    if (res.ok) {
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } else {
      setOrders([]);
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
        <p className="text-secondary">{tAccount("unauthorized")}</p>
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
        <h1 className="text-2xl font-bold text-secondary">{t("title")}</h1>
        <Link
          href="/account"
          className="text-sm font-semibold text-primary hover:underline"
        >
          &larr; {tAccount("title")}
        </Link>
      </div>

      <div className="store-card overflow-hidden">
        {orders === null || orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-secondary/70">
            {t("empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-secondary">
              <thead className="bg-surface-muted text-xs uppercase text-secondary/70">
                <tr>
                  <th scope="col" className="px-6 py-4">{t("orderId")}</th>
                  <th scope="col" className="px-6 py-4">{t("date")}</th>
                  <th scope="col" className="px-6 py-4">{t("amount")}</th>
                  <th scope="col" className="px-6 py-4">{t("paymentMethod")}</th>
                  <th scope="col" className="px-6 py-4">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {orders.map((order) => {
                  const date = new Date(order.created_at).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <tr key={order.id} className="hover:bg-surface-muted/30">
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-secondary">
                        #{order.id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{date}</td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-primary">
                        {order.order_amount.toFixed(2)} ILS
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {tPayment(order.payment_method)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold text-secondary">
                          {tStatus(order.order_status)}
                        </span>
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