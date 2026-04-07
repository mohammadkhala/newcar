"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { bffFetch } from "@/lib/bff-client";

type Address = {
  id: number;
  address_type: string;
  contact_person_name: string;
  contact_person_number: string;
  address: string;
  city: string;
};

export default function AccountAddressesPage() {
  const t = useTranslations("Account");
  const tNav = useTranslations("Nav");
  const locale = useLocale();

  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    
    const infoRes = await bffFetch("customer/info", { method: "GET", locale });
    if (!infoRes.ok || infoRes.status === 401) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    setUnauthorized(false);

    try {
      const addressRes = await bffFetch("customer/address/list", { method: "GET", locale });
      if (addressRes.ok) {
        const data = await addressRes.json();
        setAddresses(Array.isArray(data) ? data : []);
      }
    } catch {
      setAddresses([]);
    }

    setLoading(false);
  }, [locale]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void load();
    });
    return () => cancelAnimationFrame(id);
  }, [load]);

  async function deleteAddress(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا العنوان؟")) return;
    
    setLoading(true);
    try {
      const res = await bffFetch(`customer/address/delete?address_id=${id}`, {
        method: "DELETE",
        locale,
      });
      if (res.ok) {
        // reload list
        await load();
      } else {
        alert("فشل في الحذف.");
        setLoading(false);
      }
    } catch {
      alert("حدث خطأ.");
      setLoading(false);
    }
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
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-secondary">{t("addresses")}</h1>
        <Link
          href="/account"
          className="text-sm font-semibold text-primary hover:underline"
        >
          &larr; {t("title")}
        </Link>
      </div>

      {/* Addresses List */}
      {addresses === null || addresses.length === 0 ? (
        <div className="store-card p-8 text-center text-sm text-secondary/70">
          لا توجد عناوين سابقة. يمكنك إضافة عناوين جديدة عند الشراء.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="store-card flex flex-col p-5 hover:border-primary/40 transition-colors">
              <div className="mb-3 flex items-start justify-between border-b border-border-soft pb-3">
                <span className="inline-flex rounded bg-surface-muted px-2 py-1 text-xs font-bold text-secondary">
                  {address.address_type}
                </span>
                <button 
                  onClick={() => void deleteAddress(address.id)}
                  className="text-xs font-bold text-red-500 hover:text-red-700"
                >
                  حذف
                </button>
              </div>
              
              <h3 className="mb-1 font-bold text-secondary">
                {address.contact_person_name}
              </h3>
              <p className="mb-3 text-sm text-secondary/80" dir="ltr" style={{ textAlign: locale === 'ar' || locale === 'he' ? 'right' : 'left' }}>
                {address.contact_person_number}
              </p>
              
              <div className="mt-auto rounded-lg bg-surface-muted/50 p-3 text-sm leading-relaxed text-secondary/90">
                <span className="block font-semibold mb-1">{address.city}</span>
                {address.address}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}