"use client";
import Link from "next/link";
import { useState } from "react";
import { demoOrder, hasBackend } from "@/lib/api";
import { placeOrderAction } from "@/lib/actions";
import { clearCart, removeFromCart, useCart, type CartItem } from "@/lib/cart";
import { DELIVERY_FEE, formatMNT } from "@/lib/format";
import type { DeliveryMethod, PaymentMethod, Seller } from "@/lib/types";
import { Avatar } from "./avatar";
import { CheckIcon, QrIcon } from "./icons";
import { useLang } from "./lang-provider";
import { ProductArt } from "./product-art";

type Step = 0 | 1 | 2 | 3;

interface Group {
  seller: Seller | undefined;
  slug: string;
  items: CartItem[];
}

const PHONE_RE = /^[0-9]{8}$/;
const BANKS = ["Хаан банк", "Голомт", "ХасБанк", "ТДБ", "Төрийн банк"];

export function Checkout({ sellers }: { sellers: Seller[] }) {
  const { t } = useLang();
  const cart = useCart();
  const [step, setStep] = useState<Step>(0);
  const [delivery, setDelivery] = useState<DeliveryMethod>("ship");
  const [payment, setPayment] = useState<PaymentMethod>("qpay");
  const [form, setForm] = useState({ name: "", phone: "", city: "Улаанбаатар", district: "", address: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<{ code: string; demo: boolean; groups: Group[]; phone: string } | null>(null);
  const [failReason, setFailReason] = useState<string>();

  const groups: Group[] = [];
  for (const item of cart) {
    let g = groups.find((x) => x.slug === item.seller);
    if (!g) {
      g = { slug: item.seller, seller: sellers.find((s) => s.slug === item.seller), items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }
  const subtotal = cart.reduce((a, i) => a + i.price, 0);
  const ship = delivery === "ship" ? DELIVERY_FEE * groups.length : 0;
  const total = subtotal + ship;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t.requiredName;
    if (!PHONE_RE.test(form.phone.replace(/\D/g, "").replace(/^976/, ""))) e.phone = t.requiredPhone;
    if (delivery === "ship" && !form.address.trim()) e.address = t.requiredAddress;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setSending(true);
    setFailed(false);
    try {
      const input = {
        customer: {
          name: form.name.trim(),
          phone: form.phone.replace(/\D/g, "").replace(/^976/, ""),
          address: delivery === "ship" ? [form.city, form.district, form.address].filter(Boolean).join(", ") : t.pickup,
          note: form.note.trim() || undefined,
        },
        items: cart.map((i) => ({ product_id: i.id, quantity: 1 })),
        payment_method: payment,
        delivery,
      };
      let res = demoOrder();
      if (hasBackend) {
        const r = await placeOrderAction(input);
        if (!r.code) throw new Error(r.error);
        res = { code: r.code, demo: false };
      }
      setDone({ ...res, groups, phone: input.customer.phone });
      clearCart();
      setStep(3);
    } catch (e) {
      setFailReason(e instanceof Error && e.message ? e.message : undefined);
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const next = () => {
    if (step === 0 && cart.length) setStep(1);
    else if (step === 1 && validate()) setStep(2);
    else if (step === 2) void submit();
  };

  const stepLabels = [t.stepCart, t.stepDelivery, t.stepPayment, t.stepDone];
  const nextLabel = [t.goDelivery, t.goPayment, payment === "qpay" ? t.paid : t.confirmOrder][step as 0 | 1 | 2];

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-8 pb-24 sm:px-6">
      <ol aria-label="Steps" className="mb-10 grid grid-cols-4 gap-2">
        {stepLabels.map((l, i) => (
          <li key={l} className="flex flex-col gap-2.5">
            <span className={`h-[3px] ${i <= step ? "bg-olive" : "bg-line"}`} />
            <button
              type="button"
              disabled={i >= step || step === 3}
              onClick={() => setStep(i as Step)}
              aria-current={i === step ? "step" : undefined}
              className={`min-h-6 text-left text-[13px] font-semibold enabled:cursor-pointer enabled:hover:text-olive ${i <= step ? "text-ink" : "text-faint"}`}
            >
              {i + 1}. {l}
            </button>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-start gap-12">
        <section className="min-w-0 flex-[999_1_560px]">
          {step === 0 && (
            <>
              <h1 className="mb-2 font-serif text-5xl font-medium">{t.yourCart}</h1>
              <p className="mb-7 text-sm text-muted">{t.cartNote}</p>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center gap-3.5 bg-paper px-6 py-12 text-center">
                  <span className="font-serif text-[28px]">{t.cartEmpty}</span>
                  <Link href="/products" className="btn-outline">
                    {t.shopNow}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-7">
                  {groups.map((g) => (
                    <div key={g.slug} className="border border-line">
                      <div className="flex items-center justify-between gap-3 bg-paper px-4.5 py-3.5">
                        <Link href={`/shops/${g.slug}`} className="flex items-center gap-2.5 text-sm font-bold">
                          <Avatar initials={g.seller?.initials ?? "?"} size={32} />
                          {g.seller?.name ?? g.slug}
                        </Link>
                        <span className="text-[13px] text-muted">{g.seller?.city}</span>
                      </div>
                      {g.items.map((it) => (
                        <div key={it.id} className="flex items-center gap-4.5 border-t border-line-soft p-4.5">
                          <ProductArt src={it.image} tone={it.tone} ratio="aspect-[4/5]" className="w-[88px] flex-none" sizes="88px" />
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <Link href={`/products/${it.slug}`} className="font-serif text-[22px] leading-tight">
                              {it.name}
                            </Link>
                            <span className="text-[13px] text-muted">
                              {it.era} · {it.grade}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(it.id)}
                              className="cursor-pointer self-start py-2 text-[13px] font-semibold text-brick underline"
                            >
                              {t.remove}
                            </button>
                          </div>
                          <strong className="text-base whitespace-nowrap">{formatMNT(it.price)}</strong>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="mb-7 font-serif text-5xl font-medium">{t.deliveryInfo}</h1>
              <form className="grid grid-cols-1 gap-4.5 sm:grid-cols-2" onSubmit={(e) => (e.preventDefault(), next())} noValidate>
                <Field label={t.name} error={errors.name}>
                  <input className="field" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} />
                </Field>
                <Field label={t.phone} error={errors.phone}>
                  <input
                    className="field"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="9911 2233"
                    value={form.phone}
                    onChange={set("phone")}
                    aria-invalid={!!errors.phone}
                  />
                </Field>
                <fieldset className="col-span-full mt-2 flex flex-col gap-2.5">
                  <legend className="mb-2.5 text-[13px] font-semibold">{t.receiveMethod}</legend>
                  <Option checked={delivery === "ship"} onChange={() => setDelivery("ship")} name="dl" title={t.shipToAddress}>
                    {t.shipToAddressNote} · {formatMNT(DELIVERY_FEE)} / {t.perShop}
                  </Option>
                  <Option checked={delivery === "pickup"} onChange={() => setDelivery("pickup")} name="dl" title={t.pickup}>
                    {t.pickupNote}
                  </Option>
                </fieldset>
                {delivery === "ship" && (
                  <>
                    <Field label={t.city}>
                      <select className="field" value={form.city} onChange={set("city")}>
                        {["Улаанбаатар", "Дархан-Уул", "Орхон", "Өмнөговь", "Өвөрхангай", "Хэнтий", "Сэлэнгэ"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t.districtLabel}>
                      <input className="field" value={form.district} onChange={set("district")} />
                    </Field>
                    <Field label={t.address} error={errors.address} wide>
                      <input
                        className="field"
                        autoComplete="street-address"
                        placeholder={t.addressPlaceholder}
                        value={form.address}
                        onChange={set("address")}
                        aria-invalid={!!errors.address}
                      />
                    </Field>
                  </>
                )}
                <Field label={t.deliveryNoteLabel} wide>
                  <textarea className="field min-h-22 py-3" rows={3} placeholder={t.deliveryNotePlaceholder} value={form.note} onChange={set("note")} />
                </Field>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="mb-7 font-serif text-5xl font-medium">{t.stepPayment}</h1>
              <fieldset className="flex flex-col gap-2.5">
                <legend className="sr-only">{t.stepPayment}</legend>
                <Option checked={payment === "qpay"} onChange={() => setPayment("qpay")} name="pm" title="QPay">
                  {t.qpayNote}
                </Option>
                <Option checked={payment === "cash"} onChange={() => setPayment("cash")} name="pm" title={t.cash}>
                  {t.cashNote}
                </Option>
              </fieldset>
              {payment === "qpay" && (
                <div className="mt-6 flex flex-wrap items-center gap-7 bg-paper p-7">
                  <div
                    role="img"
                    aria-label={t.qrHere}
                    className="flex size-[200px] flex-col items-center justify-center gap-1.5 border border-dashed border-faint bg-field p-4 text-center text-[13px] text-muted"
                  >
                    <QrIcon size={40} className="text-ink" />
                    {t.qrHere}
                  </div>
                  <div className="flex flex-[1_1_240px] flex-col gap-3">
                    <strong className="text-lg">
                      {formatMNT(total)} {t.toPay}
                    </strong>
                    <span className="text-sm leading-relaxed text-ink-2">{t.pickBank}</span>
                    <div className="flex flex-wrap gap-2">
                      {BANKS.map((b) => (
                        <span key={b} className="bg-cream px-3 py-2 text-[13px] font-semibold">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {failed && (
                <p role="alert" className="mt-5 bg-brick-soft px-4 py-3 text-sm font-semibold text-brick-ink">
                  {failReason ? `${t.orderFailed} (${failReason})` : t.orderFailed}
                </p>
              )}
            </>
          )}

          {step === 3 && done && (
            <div className="flex flex-col items-start gap-4.5">
              <span className="flex size-16 items-center justify-center rounded-full bg-olive text-[#f7f3ea]">
                <CheckIcon size={30} />
              </span>
              <h1 className="font-serif text-5xl leading-[1.05] font-medium">{t.orderConfirmed}</h1>
              <p className="text-base leading-relaxed text-ink-2">
                {t.orderNumber} <strong>{done.code}</strong>. {t.orderSms}
              </p>
              {done.demo && <p className="bg-sand px-4 py-3 text-sm text-sand-ink">{t.demoNote}</p>}
              <div className="flex w-full flex-col border border-line">
                {done.groups.map((g) => (
                  <div key={g.slug} className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-4.5 py-4 last:border-b-0">
                    <span className="font-bold">{g.seller?.name ?? g.slug}</span>
                    <span className="text-sm text-muted">
                      {g.items.length} {t.itemsCount}
                    </span>
                    <span className="rounded-full bg-olive-soft px-2.5 py-1 text-xs font-bold text-olive-ink">{t.received}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {!done.demo && (
                  <Link href={`/track?code=${encodeURIComponent(done.code)}&phone=${encodeURIComponent(done.phone)}`} className="btn-outline">
                    {t.trackOrder}
                  </Link>
                )}
                <Link href="/" className="btn-primary">
                  {t.backHome}
                </Link>
              </div>
            </div>
          )}
        </section>

        {step < 3 && (
          <aside aria-label={t.summary} className="flex w-full max-w-[420px] flex-[1_1_320px] flex-col gap-3.5 bg-paper p-7">
            <h2 className="mb-1.5 font-serif text-[28px] font-medium">{t.summary}</h2>
            <Row k={`${t.items} (${cart.length})`} v={formatMNT(subtotal)} />
            <Row
              k={`${t.delivery} (${delivery === "ship" ? `${groups.length} ${t.perShop}` : t.pickup})`}
              v={ship ? formatMNT(ship) : t.free}
            />
            <div className="flex justify-between gap-3 border-t border-[#c9bda8] pt-3.5 text-lg font-bold">
              <span>{t.total}</span>
              <span>{formatMNT(total)}</span>
            </div>
            <button type="button" className="btn-primary mt-2 min-h-[52px] w-full" onClick={next} disabled={!cart.length || sending}>
              {sending ? t.sending : nextLabel}
            </button>
            {step > 0 && (
              <button type="button" className="btn-outline w-full" onClick={() => setStep((step - 1) as Step)}>
                {t.back}
              </button>
            )}
            <p className="mt-1 text-xs leading-relaxed text-muted">{t.escrowNote}</p>
          </aside>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`label ${wide ? "col-span-full" : ""}`}>
      {label}
      {children}
      {error && (
        <span role="alert" className="text-xs font-semibold text-brick">
          {error}
        </span>
      )}
    </label>
  );
}

function Option({
  checked,
  onChange,
  name,
  title,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  name: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3.5 rounded-[2px] border bg-field p-4.5 ${checked ? "border-olive ring-1 ring-olive" : "border-edge"}`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-0.5 size-[18px] accent-olive" />
      <span className="flex flex-col gap-1">
        <strong className="text-[15px]">{title}</strong>
        <span className="text-[13px] text-muted">{children}</span>
      </span>
    </label>
  );
}
