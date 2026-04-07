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
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );

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
    if (!appliedCoupon) {
      return 0;
    }
    const minPurchase = Number(appliedCoupon.min_purchase ?? 0);
    if (subtotal < minPurchase) {
      return 0;
    }
    if (appliedCoupon.discount_type === "amount") {
      return Math.min(Number(appliedCoupon.discount), subtotal);
    }
    const percentDiscount = (subtotal * Number(appliedCoupon.discount)) / 100;
    const maxDiscount = Number(appliedCoupon.max_discount ?? percentDiscount);
    return Math.min(percentDiscount, maxDiscount);
  })();

  const cartCapAfterCoupon = Math.max(0, subtotal - couponDiscount);

  const maxLoyaltyPointsForOrder = (() => {
    if (!loyaltyEnabled || loyaltyPoints <= 0 || loyaltyValuePerPoint <= 0) {
      return 0;
    }
    if (cartCapAfterCoupon <= 0) {
      return 0;
    }
    return Math.min(
      loyaltyPoints,
      Math.floor(cartCapAfterCoupon / loyaltyValuePerPoint),
    );
  })();

  const normalizedLoyaltyToUse =
    isAuthenticated && useLoyaltyRedemption ? maxLoyaltyPointsForOrder : 0;

  const loyaltyDiscount = (() => {
    if (!isAuthenticated || !loyaltyEnabled || normalizedLoyaltyToUse <= 0) {
      return 0;
    }
    const calculated = normalizedLoyaltyToUse * loyaltyValuePerPoint;
    return Math.min(calculated, cartCapAfterCoupon);
  })();

  const totalPayable = Math.max(
    0,
    subtotal - couponDiscount - loyaltyDiscount + shippingCharge,
  );

  const localizedAreaName = (row: AreaRow) =>
    locale === "ar"
      ? row.name_ar ?? row.name_en ?? `#${row.id}`
      : row.name_en ?? row.name_ar ?? `#${row.id}`;

  const localizedCityName = (row: CityRow) =>
    locale === "ar"
      ? row.name_ar ?? row.name_en ?? `#${row.id}`
      : row.name_en ?? row.name_ar ?? `#${row.id}`;

  const cityOptions = selectedAreaId
    ? cities.filter((c) => Number(c.area_id) === Number(selectedAreaId))
    : cities;

  const loadAddresses = useCallback(async (authMode: boolean) => {
    const res = await bffFetch("customer/address/list", {
      method: "GET",
      locale,
      guestId: authMode ? undefined : guestId,
    });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as AddressRow[];
    if (Array.isArray(data)) {
      setAddresses(data);
      if (data.length > 0) {
        setSelectedId((prev) =>
          prev !== "" && data.some((a) => a.id === prev)
            ? prev
            : (data[0]?.id ?? ""),
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
    if (!res.ok) {
      return;
    }
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
    if (!res.ok) {
      setCouponCatalog([]);
      return;
    }
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) {
      setCouponCatalog([]);
      return;
    }
    setCouponCatalog(
      data
        .map((row) => row as CouponCatalogItem)
        .filter((row) => row?.id != null && typeof row.code === "string"),
    );
  }, [locale]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const id = requestAnimationFrame(() => {
      void loadCouponCatalog();
    });
    return () => cancelAnimationFrame(id);
  }, [isAuthenticated, loadCouponCatalog]);

  useEffect(() => {
    if (!useLoyaltyRedemption || maxLoyaltyPointsForOrder > 0) {
      return;
    }
    const id = requestAnimationFrame(() => {
      setUseLoyaltyRedemption(false);
    });
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
      const resetId = requestAnimationFrame(() => {
        setShippingCharge(0);
      });
      return () => cancelAnimationFrame(resetId);
    }
    const id = requestAnimationFrame(() => {
      void (async () => {
        const res = await bffFetch(
          `config/delivery-charge?area_id=${encodeURIComponent(String(selectedAreaId))}`,
          { method: "GET", locale },
        );
        if (!res.ok) {
          setShippingCharge(0);
          return;
        }
        const payload = (await res.json()) as { delivery_charge?: number };
        setShippingCharge(Number(payload.delivery_charge ?? 0));
      })();
    });
    return () => cancelAnimationFrame(id);
  }, [selectedAreaId, locale]);

  const applyCouponByCode = useCallback(
    async (rawCode: string) => {
      const code = rawCode.trim();
      setErrorText("");
      if (!code) {
        setAppliedCoupon(null);
        return true;
      }
      if (!allowLoyaltyWithCoupon) {
        setUseLoyaltyRedemption(false);
      }
      const res = await bffFetch(
        `coupon/apply?code=${encodeURIComponent(code)}`,
        {
          method: "GET",
          locale,
          guestId: isAuthenticated ? undefined : guestId,
        },
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
        const apiMessage = payload.errors?.[0]?.message ?? payload.message;
        setErrorText(apiMessage ?? t("failed"));
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
    },
    [
      allowLoyaltyWithCoupon,
      guestId,
      isAuthenticated,
      locale,
      t,
    ],
  );

  const couponSelectValue =
    appliedCoupon &&
    couponCatalog.some((c) => c.code === appliedCoupon.code)
      ? appliedCoupon.code
      : "";

  function normalizePhoneForApi(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      return null;
    }
    if (trimmed.startsWith("+")) {
      return `+${digits}`;
    }
    return digits;
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setErrorText("");
    const cityValue = city.trim();
    if (!cityValue) {
      setErrorText(t("cityRequired"));
      return;
    }
    const phoneNormalized = normalizePhoneForApi(phone);
    if (!phoneNormalized) {
      setErrorText(t("phoneInvalid"));
      return;
    }
    if (!line.trim()) {
      setErrorText(t("addressLineRequired"));
      return;
    }
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
      setName("");
      setPhone("");
      setCity("");
      setLine("");
      setShowAddressForm(false);
      await loadAddresses(isAuthenticated);
      setStatus("idle");
    } else {
      const payload = (await res.json()) as {
        errors?: Array<{ message?: string }>;
        message?: string;
      };
      const apiMessage = payload.errors?.[0]?.message ?? payload.message;
      if (apiMessage) {
        setErrorText(apiMessage);
      }
      setStatus("err");
    }
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorText("");
    setStatus("idle");
    if (lines.length === 0 || selectedId === "") {
      setStatus("err");
      return;
    }
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
      cart: lines.map((l) => ({
        product_id: l.productId,
        quantity: l.quantity,
        variation: [],
      })),
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
      loyalty_points_used:
        isAuthenticated && normalizedLoyaltyToUse > 0
          ? normalizedLoyaltyToUse
          : undefined,
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
      const payload = (await res.json()) as {
        errors?: Array<{ message?: string }>;
        message?: string;
      };
      const apiMessage = payload.errors?.[0]?.message ?? payload.message;
      if (apiMessage) {
        setErrorText(apiMessage);
      }
      setStatus("err");
    }
  }

  if (lines.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-secondary/80">{tCart("empty")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="text-2xl font-bold text-secondary">{t("title")}</h1>
      <p className="text-xs text-secondary/60">{t("callbackNote")}</p>

      <div className="space-y-3 rounded-xl border border-surface-muted p-4">
        <h2 className="font-semibold text-secondary">{t("selectAddress")}</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-secondary/70">{t("needAddressFirst")}</p>
        ) : (
          <select
            form={PLACE_ORDER_FORM_ID}
            required
            value={selectedId === "" ? "" : String(selectedId)}
            onChange={(e) =>
              setSelectedId(e.target.value ? Number(e.target.value) : "")
            }
            className="w-full rounded-lg border border-surface-muted px-3 py-2"
          >
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.contact_person_name} — {a.city}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          className="w-full rounded-lg border border-primary/40 bg-white py-2.5 text-sm font-medium text-primary"
          onClick={() => setShowAddressForm(true)}
        >
          {t("addNewAddress")}
        </button>
      </div>

      {showAddressForm ? (
        <form onSubmit={saveAddress} className="space-y-3 rounded-xl border border-surface-muted p-4">
          <h2 className="font-semibold text-secondary">{t("addAddressSectionTitle")}</h2>
          {areas.length > 0 && (
            <label className="block text-sm">
              {t("deliveryArea")}
              <select
                value={selectedAreaId === "" ? "" : String(selectedAreaId)}
                onChange={(e) => {
                  const raw = e.target.value;
                  setSelectedAreaId(raw ? Number(raw) : "");
                  setCity("");
                }}
                className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2"
                autoComplete="address-level1"
              >
                <option value="">{t("chooseArea")}</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {localizedAreaName(area)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {cityOptions.length > 0 ? (
            <label className="block text-sm">
              {t("city")}
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2"
                autoComplete="address-level2"
              >
                <option value="">{t("chooseCity")}</option>
                {cityOptions.map((cityRow) => {
                  const cityName = localizedCityName(cityRow);
                  return (
                    <option key={cityRow.id} value={cityName}>
                      {cityName}
                    </option>
                  );
                })}
              </select>
            </label>
          ) : (
            <label className="block text-sm">
              {t("city")}
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2"
                autoComplete="address-level2"
              />
            </label>
          )}
          <label className="block text-sm">
            {t("addressName")}
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2"
              autoComplete="name"
            />
          </label>
          <label className="block text-sm">
            {t("addressPhone")}
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder={t("phonePlaceholder")}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2 text-left"
            />
          </label>
          <label className="block text-sm">
            {t("addressLine")}
            <textarea
              required
              rows={3}
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="mt-1 min-h-[4.5rem] w-full resize-y rounded-lg border border-surface-muted px-3 py-2"
              autoComplete="street-address"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-lg bg-secondary px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {t("addAddress")}
            </button>
            {addresses.length > 0 ? (
              <button
                type="button"
                className="rounded-lg border border-surface-muted px-4 py-2 text-sm text-secondary"
                onClick={() => {
                  setErrorText("");
                  setShowAddressForm(false);
                }}
              >
                {t("cancelAddressForm")}
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <section className="space-y-3 rounded-xl border border-surface-muted p-4">
        <h2 className="font-semibold text-secondary">{t("couponTitle")}</h2>
        <p className="text-xs text-secondary/70">
          {isAuthenticated ? t("couponHintAuth") : tCart("couponHint")}
        </p>
        {isAuthenticated ? (
          <>
            <label className="block text-sm text-secondary">
              <span className="font-medium">{t("couponChoose")}</span>
              <select
                disabled={couponCatalogLoading}
                value={couponSelectValue}
                onChange={(e) => {
                  void applyCouponByCode(e.target.value);
                }}
                className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2 disabled:opacity-60"
              >
                <option value="">{t("couponChooseNone")}</option>
                {couponCatalog.map((c) => {
                  const label =
                    c.title?.trim() && c.title.trim() !== c.code
                      ? `${c.title.trim()} — ${c.code}`
                      : c.code;
                  return (
                    <option key={c.id} value={c.code}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </label>
            {couponCatalogLoading ? (
              <p className="text-xs text-secondary/60">{t("couponListLoading")}</p>
            ) : null}
          </>
        ) : null}
        {appliedCoupon ? (
          <p className="text-xs text-green-700">
            {t("couponApplied")}: {appliedCoupon.code}
          </p>
        ) : null}
      </section>

      {isAuthenticated && loyaltyEnabled ? (
        <section className="space-y-3 rounded-xl border border-surface-muted p-4">
          <h2 className="font-semibold text-secondary">{t("loyaltyTitle")}</h2>
          <p className="text-xs text-secondary/70">
            {t("loyaltyBalance")}: {loyaltyPoints}
          </p>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border border-surface-muted px-3 py-2 ${
              maxLoyaltyPointsForOrder <= 0 ||
              (!allowLoyaltyWithCoupon && appliedCoupon)
                ? "cursor-not-allowed opacity-60"
                : ""
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={useLoyaltyRedemption && maxLoyaltyPointsForOrder > 0}
              disabled={
                maxLoyaltyPointsForOrder <= 0 ||
                (!allowLoyaltyWithCoupon && !!appliedCoupon)
              }
              onChange={(e) => {
                const on = e.target.checked;
                if (on && !allowLoyaltyWithCoupon && appliedCoupon) {
                  setAppliedCoupon(null);
                }
                setUseLoyaltyRedemption(on && maxLoyaltyPointsForOrder > 0);
              }}
            />
            <span className="text-sm text-secondary">
              <span className="font-medium">{t("loyaltyUseToggle")}</span>
              {maxLoyaltyPointsForOrder > 0 ? (
                <span className="mt-0.5 block text-xs text-secondary/70">
                  {t("loyaltyRedeemHint", {
                    points: String(maxLoyaltyPointsForOrder),
                  })}
                </span>
              ) : loyaltyPoints > 0 ? (
                <span className="mt-0.5 block text-xs text-secondary/70">
                  {t("loyaltyCannotRedeem")}
                </span>
              ) : null}
            </span>
          </label>
        </section>
      ) : null}

      <section className="space-y-2 rounded-xl border border-surface-muted p-4 text-sm">
        <div className="flex items-center justify-between">
          <span>{t("summarySubtotal")}</span>
          <span>{formatMoney(subtotal, locale, currencyCode)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("summaryShipping")}</span>
          <span>{formatMoney(shippingCharge, locale, currencyCode)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("summaryCoupon")}</span>
          <span>- {formatMoney(couponDiscount, locale, currencyCode)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("summaryLoyalty")}</span>
          <span>- {formatMoney(loyaltyDiscount, locale, currencyCode)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-surface-muted pt-2 text-base font-bold">
          <span>{tCart("total")}</span>
          <span className="text-primary">{formatMoney(totalPayable, locale, currencyCode)}</span>
        </div>
      </section>

      <form
        id={PLACE_ORDER_FORM_ID}
        onSubmit={placeOrder}
        className="space-y-3 rounded-xl border border-surface-muted p-4"
      >
        <button
          type="submit"
          disabled={status === "loading" || addresses.length === 0}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("placeOrder")} ({t("paymentCod")})
        </button>
      </form>

      {errorText ? <p className="text-sm text-red-600">{errorText}</p> : null}
      {status === "err" && !errorText ? (
        <p className="text-sm text-red-600">{t("failed")}</p>
      ) : null}
      {status === "ok" && (
        <p className="text-sm text-green-700">{t("success")}</p>
      )}
    </div>
  );
}
