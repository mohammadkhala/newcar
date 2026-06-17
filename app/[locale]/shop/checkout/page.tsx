"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useState } from "react";
import { bffFetch } from "@/lib/bff-client";
import { useCart } from "@/lib/cart-context";
import { getStoredGuestId } from "@/lib/guest-storage";
import { formatMoney } from "@/lib/format-price";

type AddressRow = {
  id: number;
  contact_person_name?: string;
  address?: string;
  city?: string;
};

type AreaRow = {
  id: number;
  name_en?: string;
  name_ar?: string;
  delivery_charge?: number;
};

type CityRow = {
  id: number;
  area_id?: number;
  name_en?: string;
  name_ar?: string;
};

type CouponRow = {
  code: string;
  discount_type: "amount" | "percent";
  discount: number;
  max_discount?: number;
  min_purchase?: number;
};

type LoyaltyPayload = {
  loyalty_points_enabled?: boolean;
  points?: number;
  redemption_value_per_point?: number;
};

type CouponCatalogItem = {
  id: number;
  title?: string;
  code: string;
};

const PLACE_ORDER_FORM_ID = "checkout-place-order";

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
      {n}
    </span>
  );
}

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const locale = useLocale();
  const router = useRouter();
  const { lines, clear } = useCart();
  const guestId = getStoredGuestId();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("ILS");
  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | "">("");
  const [shippingCharge, setShippingCharge] = useState(0);

  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [line, setLine] = useState("");
  const [errorText, setErrorText] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState<CouponRow | null>(null);
  const [couponCatalog, setCouponCatalog] = useState<CouponCatalogItem[]>([]);
  const [couponCatalogLoading, setCouponCatalogLoading] = useState(false);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyValuePerPoint, setLoyaltyValuePerPoint] = useState(0.5);
  const [allowLoyaltyWithCoupon, setAllowLoyaltyWithCoupon] = useState(true);
  const [useLoyaltyRedemption, setUseLoyaltyRedemption] = useState(false);

  const subtotal = lines.reduce((sum, lineItem) => {
    return sum + Number(lineItem.price) * Number(lineItem.quantity);
  }, 0);

  const couponDiscount = (() => {
    if (!appliedCoupon) return 0;
    const minPurchase = Number(appliedCoupon.min_purchase ?? 0);
    if (subtotal < minPurchase) return 0;
    if (appliedCoupon.discount_type === "amount") {
      return Math.min(Number(appliedCoupon.discount), subtotal);
    }
    const percentDiscount = (subtotal * Number(appliedCoupon.discount)) / 100;
    const maxDiscount = Number(appliedCoupon.max_discount ?? percentDiscount);
    return Math.min(percentDiscount, maxDiscount);
  })();

  const cartCapAfterCoupon = Math.max(0, subtotal - couponDiscount);

  const maxLoyaltyPointsForOrder = (() => {
    if (!loyaltyEnabled || loyaltyPoints <= 0 || loyaltyValuePerPoint <= 0) return 0;
    if (cartCapAfterCoupon <= 0) return 0;
    return Math.min(loyaltyPoints, Math.floor(cartCapAfterCoupon / loyaltyValuePerPoint));
  })();

  const normalizedLoyaltyToUse =
    isAuthenticated && useLoyaltyRedemption ? maxLoyaltyPointsForOrder : 0;

  const loyaltyDiscount = (() => {
    if (!isAuthenticated || !loyaltyEnabled || normalizedLoyaltyToUse <= 0) return 0;
    const calculated = normalizedLoyaltyToUse * loyaltyValuePerPoint;
    return Math.min(calculated, cartCapAfterCoupon);
  })();

  const totalPayable = Math.max(0, subtotal - couponDiscount - loyaltyDiscount + shippingCharge);

  const localizedAreaName = (row: AreaRow) =>
    locale === "ar" ? row.name_ar ?? row.name_en ?? `#${row.id}` : row.name_en ?? row.name_ar ?? `#${row.id}`;

  const localizedCityName = (row: CityRow) =>
    locale === "ar" ? row.name_ar ?? row.name_en ?? `#${row.id}` : row.name_en ?? row.name_ar ?? `#${row.id}`;

  const cityOptions = selectedAreaId
    ? cities.filter((c) => Number(c.area_id) === Number(selectedAreaId))
    : cities;

  const loadAddresses = useCallback(async (authMode: boolean) => {
    const res = await bffFetch("customer/address/list", {
      method: "GET",
      locale,
      guestId: authMode ? undefined : guestId,
    });
    if (!res.ok) return;
    const data = (await res.json()) as AddressRow[];
    if (Array.isArray(data)) {
      setAddresses(data);
      if (data.length > 0) {
        setSelectedId((prev) =>
          prev !== "" && data.some((a) => a.id === prev) ? prev : (data[0]?.id ?? ""),
        );
        setShowAddressForm(false);
      } else {
        setSelectedId("");
        setShowAddressForm(true);
      }
    }
  }, [locale, guestId]);

  const loadConfig = useCallback(async () => {
    const res = await bffFetch("config", { method: "GET", locale });
    if (!res.ok) return;
    const data = (await res.json()) as {
      currency_code?: string;
      areas?: AreaRow[];
      cities?: CityRow[];
      loyalty_points_enabled?: number | boolean;
      loyalty_and_coupon_together?: number | boolean;
      loyalty_point_redemption_value?: number;
    };
    setCurrencyCode(data.currency_code ?? "ILS");
    setAreas(Array.isArray(data.areas) ? data.areas : []);
    setCities(Array.isArray(data.cities) ? data.cities : []);
    setLoyaltyEnabled(Boolean(data.loyalty_points_enabled));
    setAllowLoyaltyWithCoupon(Boolean(data.loyalty_and_coupon_together ?? 1));
    setLoyaltyValuePerPoint(Number(data.loyalty_point_redemption_value ?? 0.5));
  }, [locale]);

  const loadAuthAndLoyalty = useCallback(async () => {
    const profileRes = await bffFetch("customer/info", { method: "GET", locale });
    if (!profileRes.ok) {
      setIsAuthenticated(false);
      setLoyaltyPoints(0);
      setCouponCatalog([]);
      return false;
    }
    setIsAuthenticated(true);
    const loyaltyRes = await bffFetch("customer/loyalty", { method: "GET", locale });
    if (loyaltyRes.ok) {
      const loyalty = (await loyaltyRes.json()) as LoyaltyPayload;
      setLoyaltyEnabled(Boolean(loyalty.loyalty_points_enabled));
      setLoyaltyPoints(Number(loyalty.points ?? 0));
      setLoyaltyValuePerPoint(Number(loyalty.redemption_value_per_point ?? 0.5));
    }
    return true;
  }, [locale]);

  const loadCouponCatalog = useCallback(async () => {
    setCouponCatalogLoading(true);
    const res = await bffFetch("coupon/list", { method: "GET", locale });
    setCouponCatalogLoading(false);
    if (!res.ok) { setCouponCatalog([]); return; }
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) { setCouponCatalog([]); return; }
    setCouponCatalog(
      data
        .map((row) => row as CouponCatalogItem)
        .filter((row) => row?.id != null && typeof row.code === "string"),
    );
  }, [locale]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const id = requestAnimationFrame(() => { void loadCouponCatalog(); });
    return () => cancelAnimationFrame(id);
  }, [isAuthenticated, loadCouponCatalog]);

  useEffect(() => {
    if (!useLoyaltyRedemption || maxLoyaltyPointsForOrder > 0) return;
    const id = requestAnimationFrame(() => { setUseLoyaltyRedemption(false); });
    return () => cancelAnimationFrame(id);
  }, [useLoyaltyRedemption, maxLoyaltyPointsForOrder]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void (async () => {
        await loadConfig();
        const authMode = await loadAuthAndLoyalty();
        await loadAddresses(authMode);
      })();
    });
    return () => cancelAnimationFrame(id);
  }, [loadAddresses, loadAuthAndLoyalty, loadConfig]);

  useEffect(() => {
    if (!selectedAreaId) {
      const resetId = requestAnimationFrame(() => { setShippingCharge(0); });
      return () => cancelAnimationFrame(resetId);
    }
    const id = requestAnimationFrame(() => {
      void (async () => {
        const res = await bffFetch(
          `config/delivery-charge?area_id=${encodeURIComponent(String(selectedAreaId))}`,
          { method: "GET", locale },
        );
        if (!res.ok) { setShippingCharge(0); return; }
        const payload = (await res.json()) as { delivery_charge?: number };
        setShippingCharge(Number(payload.delivery_charge ?? 0));
      })();
    });
    return () => cancelAnimationFrame(id);
  }, [selectedAreaId, locale]);

  const applyCouponByCode = useCallback(async (rawCode: string) => {
    const code = rawCode.trim();
    setErrorText("");
    if (!code) { setAppliedCoupon(null); return true; }
    if (!allowLoyaltyWithCoupon) { setUseLoyaltyRedemption(false); }
    const res = await bffFetch(
      `coupon/apply?code=${encodeURIComponent(code)}`,
      { method: "GET", locale, guestId: isAuthenticated ? undefined : guestId },
    );
    const payload = (await res.json()) as {
      code?: string;
      discount_type?: "amount" | "percent";
      discount?: number;
      max_discount?: number;
      min_purchase?: number;
      errors?: Array<{ message?: string }>;
      message?: string;
    };
    if (!res.ok) {
      setErrorText(payload.errors?.[0]?.message ?? payload.message ?? t("failed"));
      setAppliedCoupon(null);
      return false;
    }
    setAppliedCoupon({
      code: String(payload.code ?? code),
      discount_type: payload.discount_type ?? "amount",
      discount: Number(payload.discount ?? 0),
      max_discount: Number(payload.max_discount ?? 0),
      min_purchase: Number(payload.min_purchase ?? 0),
    });
    return true;
  }, [allowLoyaltyWithCoupon, guestId, isAuthenticated, locale, t]);

  const couponSelectValue =
    appliedCoupon && couponCatalog.some((c) => c.code === appliedCoupon.code)
      ? appliedCoupon.code
      : "";

  function normalizePhoneForApi(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return null;
    if (trimmed.startsWith("+")) return `+${digits}`;
    return digits;
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setErrorText("");
    const cityValue = city.trim();
    if (!cityValue) { setErrorText(t("cityRequired")); return; }
    const phoneNormalized = normalizePhoneForApi(phone);
    if (!phoneNormalized) { setErrorText(t("phoneInvalid")); return; }
    if (!line.trim()) { setErrorText(t("addressLineRequired")); return; }
    setStatus("loading");
    const res = await bffFetch("customer/address/add", {
      method: "POST",
      locale,
      guestId: isAuthenticated ? undefined : guestId,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_person_name: name.trim(),
        contact_person_number: phoneNormalized,
        city: cityValue,
        address: line.trim(),
        area_id: selectedAreaId || undefined,
      }),
    });
    if (res.ok) {
      setName(""); setPhone(""); setCity(""); setLine("");
      setShowAddressForm(false);
      await loadAddresses(isAuthenticated);
      setStatus("idle");
    } else {
      const payload = (await res.json()) as { errors?: Array<{ message?: string }>; message?: string };
      setErrorText(payload.errors?.[0]?.message ?? payload.message ?? "");
      setStatus("err");
    }
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorText("");
    setStatus("idle");
    if (lines.length === 0 || selectedId === "") { setStatus("err"); return; }
    if (!allowLoyaltyWithCoupon && appliedCoupon && normalizedLoyaltyToUse > 0) {
      setErrorText(t("loyaltyCouponExclusive"));
      setStatus("err");
      return;
    }
    setStatus("loading");
    const callback =
      typeof window !== "undefined"
        ? `${window.location.origin}/${locale}/shop/cart`
        : `/${locale}/shop/cart`;

    const body = {
      cart: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity, variation: [] })),
      payment_method: "cash_on_delivery",
      payment_platform: "web",
      callback,
      is_guest: isAuthenticated ? 0 : 1,
      order_type: "delivery",
      delivery_address_id: selectedId,
      bring_change_amount: 0,
      distance: 0,
      coupon_discount_title: 0,
      selected_delivery_area: selectedAreaId || undefined,
      coupon_code: appliedCoupon?.code || undefined,
      loyalty_points_used: isAuthenticated && normalizedLoyaltyToUse > 0 ? normalizedLoyaltyToUse : undefined,
    };

    const res = await bffFetch("customer/order/place", {
      method: "POST",
      locale,
      guestId: isAuthenticated ? undefined : guestId,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      clear();
      setStatus("ok");
      router.push("/shop/cart");
    } else {
      const payload = (await res.json()) as { errors?: Array<{ message?: string }>; message?: string };
      setErrorText(payload.errors?.[0]?.message ?? payload.message ?? "");
      setStatus("err");
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <p className="text-4xl">🛒</p>
        <h1 className="text-xl font-bold text-secondary">{tCart("empty")}</h1>
      </div>
    );
  }

  const canPlaceOrder = addresses.length > 0 && selectedId !== "" && !showAddressForm;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary">{t("title")}</h1>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">

        {/* ══════════════ LEFT — sections ══════════════ */}
        <div className="flex flex-col gap-4 lg:flex-1">

          {/* ─── 1. Delivery address ─── */}
          <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <StepBadge n={1} />
              <h2 className="font-semibold text-secondary">{t("selectAddress")}</h2>
            </div>

            {/* Saved address cards */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="flex flex-col gap-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                      selectedId === a.id
                        ? "border-primary bg-primary/5"
                        : "border-border-soft hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="checkout-address"
                      className="mt-0.5 accent-primary"
                      value={a.id}
                      checked={selectedId === a.id}
                      onChange={() => setSelectedId(a.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary">
                        {a.contact_person_name}
                      </p>
                      <p className="mt-0.5 text-xs text-secondary/60">
                        {a.city}{a.address ? ` — ${a.address}` : ""}
                      </p>
                    </div>
                    {selectedId === a.id && (
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            )}

            {/* No address hint */}
            {addresses.length === 0 && !showAddressForm && (
              <p className="mb-3 text-sm text-secondary/70">{t("needAddressFirst")}</p>
            )}

            {/* Add new address toggle */}
            {!showAddressForm && (
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {t("addNewAddress")}
              </button>
            )}

            {/* Address form */}
            {showAddressForm && (
              <form onSubmit={saveAddress} className="mt-2 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-secondary">{t("addAddressSectionTitle")}</h3>

                {areas.length > 0 && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary/80">{t("deliveryArea")}</label>
                    <select
                      value={selectedAreaId === "" ? "" : String(selectedAreaId)}
                      onChange={(e) => { setSelectedAreaId(e.target.value ? Number(e.target.value) : ""); setCity(""); }}
                      className="store-input w-full"
                      autoComplete="address-level1"
                    >
                      <option value="">{t("chooseArea")}</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>{localizedAreaName(area)}</option>
                      ))}
                    </select>
                  </div>
                )}

                {cityOptions.length > 0 ? (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary/80">{t("city")}</label>
                    <select
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="store-input w-full"
                      autoComplete="address-level2"
                    >
                      <option value="">{t("chooseCity")}</option>
                      {cityOptions.map((cityRow) => {
                        const cityName = localizedCityName(cityRow);
                        return <option key={cityRow.id} value={cityName}>{cityName}</option>;
                      })}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary/80">{t("city")}</label>
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="store-input w-full"
                      autoComplete="address-level2"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-secondary/80">{t("addressName")}</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="store-input w-full"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-secondary/80">{t("addressPhone")}</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    placeholder={t("phonePlaceholder")}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="store-input w-full text-left"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-secondary/80">{t("addressLine")}</label>
                  <textarea
                    required
                    rows={2}
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    className="store-input min-h-[4.5rem] w-full resize-y"
                    autoComplete="street-address"
                  />
                </div>

                {errorText && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {errorText}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="store-btn-primary flex-1 py-2.5 text-sm disabled:opacity-60"
                  >
                    {t("addAddress")}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setErrorText(""); setShowAddressForm(false); }}
                      className="rounded-xl border border-border-soft px-4 text-sm text-secondary transition-colors hover:bg-surface-muted"
                    >
                      {t("cancelAddressForm")}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* ─── 2. Coupon ─── */}
          <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <StepBadge n={2} />
              <h2 className="font-semibold text-secondary">{t("couponTitle")}</h2>
            </div>
            <p className="mb-3 text-xs text-secondary/60">
              {isAuthenticated ? t("couponHintAuth") : tCart("couponHint")}
            </p>

            {isAuthenticated && (
              <select
                disabled={couponCatalogLoading}
                value={couponSelectValue}
                onChange={(e) => { void applyCouponByCode(e.target.value); }}
                className="store-input w-full disabled:opacity-60"
              >
                <option value="">{t("couponChooseNone")}</option>
                {couponCatalog.map((c) => {
                  const label = c.title?.trim() && c.title.trim() !== c.code
                    ? `${c.title.trim()} — ${c.code}`
                    : c.code;
                  return <option key={c.id} value={c.code}>{label}</option>;
                })}
              </select>
            )}

            {couponCatalogLoading && (
              <p className="mt-2 text-xs text-secondary/50">{t("couponListLoading")}</p>
            )}

            {appliedCoupon && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-700">
                  {t("couponApplied")}: {appliedCoupon.code}
                </span>
              </div>
            )}
          </div>

          {/* ─── 3. Loyalty ─── */}
          {isAuthenticated && loyaltyEnabled && (
            <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StepBadge n={3} />
                  <h2 className="font-semibold text-secondary">{t("loyaltyTitle")}</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-bold text-primary">
                  {loyaltyPoints}
                </span>
              </div>
              <p className="mb-3 text-xs text-secondary/60 pe-10">{t("loyaltyBalance")}</p>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                  useLoyaltyRedemption && maxLoyaltyPointsForOrder > 0
                    ? "border-primary bg-primary/5"
                    : "border-border-soft"
                } ${
                  maxLoyaltyPointsForOrder <= 0 || (!allowLoyaltyWithCoupon && appliedCoupon)
                    ? "cursor-not-allowed opacity-50"
                    : "hover:border-primary/30"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-primary"
                  checked={useLoyaltyRedemption && maxLoyaltyPointsForOrder > 0}
                  disabled={maxLoyaltyPointsForOrder <= 0 || (!allowLoyaltyWithCoupon && !!appliedCoupon)}
                  onChange={(e) => {
                    const on = e.target.checked;
                    if (on && !allowLoyaltyWithCoupon && appliedCoupon) setAppliedCoupon(null);
                    setUseLoyaltyRedemption(on && maxLoyaltyPointsForOrder > 0);
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-secondary">{t("loyaltyUseToggle")}</p>
                  {maxLoyaltyPointsForOrder > 0 ? (
                    <p className="mt-0.5 text-xs text-secondary/60">
                      {t("loyaltyRedeemHint", { points: String(maxLoyaltyPointsForOrder) })}
                    </p>
                  ) : loyaltyPoints > 0 ? (
                    <p className="mt-0.5 text-xs text-secondary/60">{t("loyaltyCannotRedeem")}</p>
                  ) : null}
                </div>
              </label>
            </div>
          )}
        </div>

        {/* ══════════════ RIGHT — sticky summary ══════════════ */}
        <div className="flex flex-col gap-4 lg:w-80 lg:sticky lg:top-6">

          {/* Cart items */}
          <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-secondary">
              {tCart("title")} ({lines.length})
            </h3>
            <ul className="divide-y divide-border-soft/60">
              {lines.map((l) => (
                <li key={l.productId} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-secondary">{l.name}</p>
                    <p className="text-xs text-secondary/50">× {l.quantity}</p>
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium text-secondary">
                    {formatMoney(Number(l.price) * Number(l.quantity), locale, currencyCode)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price breakdown + CTA */}
          <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-secondary/80">
                <span>{t("summarySubtotal")}</span>
                <span>{formatMoney(subtotal, locale, currencyCode)}</span>
              </div>
              <div className="flex items-center justify-between text-secondary/80">
                <span>{t("summaryShipping")}</span>
                <span>{formatMoney(shippingCharge, locale, currencyCode)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-green-700">
                  <span>{t("summaryCoupon")}</span>
                  <span>- {formatMoney(couponDiscount, locale, currencyCode)}</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex items-center justify-between text-green-700">
                  <span>{t("summaryLoyalty")}</span>
                  <span>- {formatMoney(loyaltyDiscount, locale, currencyCode)}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-3">
              <span className="font-bold text-secondary">{tCart("total")}</span>
              <span className="text-xl font-bold text-primary">
                {formatMoney(totalPayable, locale, currencyCode)}
              </span>
            </div>

            {/* Payment method */}
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
              <svg className="h-4 w-4 shrink-0 text-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
              <span className="text-xs text-secondary/70">{t("paymentCod")}</span>
            </div>

            {/* Error message */}
            {(errorText || (status === "err" && !errorText)) && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-600">{errorText || t("failed")}</p>
              </div>
            )}

            {/* Success */}
            {status === "ok" && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <p className="text-sm text-green-700">{t("success")}</p>
              </div>
            )}

            {/* Place order */}
            <form id={PLACE_ORDER_FORM_ID} onSubmit={placeOrder} className="mt-4">
              <button
                type="submit"
                disabled={status === "loading" || !canPlaceOrder}
                className="store-btn-primary w-full py-3.5 text-base font-bold disabled:opacity-50"
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    ...
                  </span>
                ) : (
                  t("placeOrder")
                )}
              </button>
            </form>

            {!canPlaceOrder && !showAddressForm && addresses.length === 0 && (
              <p className="mt-2 text-center text-xs text-secondary/60">{t("needAddressFirst")}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
