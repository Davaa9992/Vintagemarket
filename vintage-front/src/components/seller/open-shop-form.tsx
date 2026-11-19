"use client";
import { openShopAction } from "@/lib/actions";
import { useFormAction } from "@/lib/use-form-action";
import { useLang } from "../lang-provider";

export function OpenShopForm() {
  const { t } = useLang();
  const { state, pending, onSubmit } = useFormAction(openShopAction);
  return (
    <form onSubmit={onSubmit} className="flex max-w-[640px] flex-col gap-4.5">
      <label className="label">
        {t.shopName}
        <input className="field" name="name" maxLength={60} required />
      </label>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4.5">
        <label className="label">
          {t.city}
          <input className="field" name="city" required placeholder="Улаанбаатар" />
        </label>
        <label className="label">
          {t.districtLabel}
          <input className="field" name="district" placeholder={t.optional} />
        </label>
      </div>
      <label className="label">
        {t.focus}
        <input className="field" name="focus" placeholder={t.focusPlaceholder} />
      </label>
      <label className="label">
        {t.bio}
        <textarea className="field min-h-28 py-3" name="bio" rows={4} maxLength={1000} />
      </label>
      {state.error && (
        <p role="alert" className="bg-brick-soft px-4 py-3 text-sm font-semibold text-brick-ink">
          {state.error}
        </p>
      )}
      <div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? t.sending : t.openShop}
        </button>
      </div>
    </form>
  );
}
