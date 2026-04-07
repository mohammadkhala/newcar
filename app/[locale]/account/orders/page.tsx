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

export default function AccountOrdersPage() {
  const t = useTranslations("AccountOrders");
  const tNav = useTranslations("Nav");
  const tAccount = useTranslations("Account");
  const locale = useLocale();
  
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
                      <td className="whitespace-nowrap px-6 py-4 capitalize">
                        {order.payment_method.replace(/_/g, " ")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold capitalize text-secondary">
                          {order.order_status.replace(/_/g, " ")}
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