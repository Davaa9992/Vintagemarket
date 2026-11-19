"use client";
import { useState, useTransition } from "react";
import { createListingAction, updateListingAction } from "@/lib/actions";
import { COMMISSION, formatMNT } from "@/lib/format";
import { CATEGORY_NAMES, DECADE_NAMES, GRADE_NAMES } from "@/lib/i18n";
import { CATEGORY_SLUGS, DECADES, type Grade, type Product } from "@/lib/types";
import { CloseIcon, PlusIcon } from "../icons";
import { useLang } from "../lang-provider";

const MAX_PHOTOS = 8;

/** Хэмжээний 3 үндсэн талбар. Бусад хэмжээ (жишээ нь "Ханцуйн урт") засахад хэвээр үлдэнэ */
export const DIM_LABELS = { length: "Урт", width: "Өргөн", height: "Өндөр" } as const;

/** Шинэ бараа нэмэх, эсвэл initial өгвөл засах форм */
export function ListingForm({ live = false, initial }: { live?: boolean; initial?: Product }) {
  const { lang, t } = useLang();
  const [grade, setGrade] = useState<Grade>(initial?.grade ?? "B");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  // file-гүй нь аль хэдийн хадгалагдсан зураг
  const [photos, setPhotos] = useState<{ file?: File; url: string }[]>(() => (initial?.images ?? []).map((url) => ({ url })));
  const dim = (label: string) => initial?.measurements.find((m) => m.label === label)?.cm;
  const extra = (initial?.measurements ?? []).filter((m) => !(Object.values(DIM_LABELS) as string[]).includes(m.label));
  const [published, setPublished] = useState<"" | "publish" | "draft">("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const n = Number(price.replace(/\D/g, "")) || 0;

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((p) => [...p, ...added].slice(0, MAX_PHOTOS));
  };

  return (
    <form
      className="flex max-w-[860px] flex-col gap-7"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const intent = submitter?.value === "draft" ? "draft" : "publish";
        setError(undefined);
        if (!live) {
          setPublished(intent);
          return;
        }
        const data = new FormData(form);
        data.set("intent", intent);
        photos.forEach((p) => (p.file ? data.append("photos", p.file) : data.append("keep", p.url)));
        data.set("extra_measurements", JSON.stringify(extra));
        start(async () => {
          const res = initial ? await updateListingAction(initial.id, data) : await createListingAction({}, data);
          if (res.error) {
            setError(res.error);
            return;
          }
          if (!initial) {
            form.reset();
            setPrice("");
            setPhotos([]);
          }
          setPublished(intent);
        });
      }}
    >
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-[13px] font-semibold">{t.photosHint}</legend>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
          {photos.length < MAX_PHOTOS && (
            <label className="relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-faint bg-field p-2 text-center text-[13px] font-semibold hover:bg-paper">
              <PlusIcon size={26} />
              {t.addPhoto}
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
            </label>
          )}
          {photos.map(({ url: src }, i) => (
            <span key={src} className="relative aspect-[4/5] overflow-hidden bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
              {i === 0 && <span className="absolute top-1.5 left-1.5 bg-ink px-1.5 py-0.5 text-[10px] font-bold text-cream">{t.cover}</span>}
              <button
                type="button"
                aria-label={`${t.removePhoto} ${i + 1}`}
                onClick={() => setPhotos((p) => p.filter((_, k) => k !== i))}
                className="absolute top-1 right-1 flex size-8 cursor-pointer items-center justify-center bg-cream text-ink"
              >
                <CloseIcon size={16} />
              </button>
            </span>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4.5">
        <label className="label col-span-full">
          {t.listingName}
          <input className="field" name="name" required defaultValue={initial?.name} />
        </label>
        <label className="label">
          {t.category}
          <select className="field" name="category" defaultValue={initial?.category}>
            {CATEGORY_SLUGS.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_NAMES[lang][c]}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          {t.era}
          <select className="field" name="era" defaultValue={initial?.decade}>
            {DECADES.map((d) => (
              <option key={d} value={d}>
                {DECADE_NAMES[lang][d]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="mb-2.5 text-[13px] font-semibold">{t.condition}</legend>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5">
          {(["A", "B", "C", "D"] as const).map((g) => (
            <label
              key={g}
              className={`flex cursor-pointer items-start gap-3 border p-3.5 ${g === grade ? "border-olive bg-[#eef0e2]" : "border-edge bg-field"}`}
            >
              <input type="radio" name="grade" value={g} checked={g === grade} onChange={() => setGrade(g)} className="mt-0.5 size-[18px] accent-olive" />
              <span className="flex flex-col gap-1">
                <strong className="text-[15px]">
                  {g} · {GRADE_NAMES[lang][g].short}
                </strong>
                <span className="text-xs leading-normal text-muted">{GRADE_NAMES[lang][g].desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2.5 text-[13px] font-semibold">{t.dims}</legend>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {(
            [
              ["length", t.length],
              ["width", t.width],
              ["height", t.height],
            ] as const
          ).map(([n, l]) => (
            <label key={n} className="label font-medium">
              {l}
              <input className="field" name={n} inputMode="decimal" defaultValue={dim(DIM_LABELS[n])} />
            </label>
          ))}
          <label className="label font-medium">
            {t.weight}
            <input className="field" inputMode="decimal" placeholder={t.optional} />
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-4.5">
        <label className="label flex-[1_1_240px]">
          {t.price}
          <input className="field" name="price" inputMode="numeric" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="30000" />
        </label>
        <div className="flex min-h-12 flex-[1_1_240px] flex-col gap-0.5 bg-paper px-4 py-3" aria-live="polite">
          <span className="text-xs text-muted">
            {t.commission10}: {formatMNT(n * COMMISSION)}
          </span>
          <strong className="text-base">
            {t.youGet}: {formatMNT(n * (1 - COMMISSION))}
          </strong>
        </div>
      </div>

      <label className="label">
        {t.description}
        <textarea className="field min-h-28 py-3" rows={4} name="description" defaultValue={initial?.description} />
      </label>

      {published && !error && (
        <p role="status" className="bg-olive-soft px-4 py-3 text-sm font-semibold text-olive-ink">
          {!live ? t.publishedDemo : initial || published === "draft" ? t.listingSaved : t.published}
        </p>
      )}
      {error && (
        <p role="alert" className="bg-brick-soft px-4 py-3 text-sm font-semibold text-brick-ink">
          {t.listingFailed}: {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <button type="submit" name="intent" value="publish" className="btn-primary" disabled={pending}>
          {pending ? (photos.some((p) => p.file) ? t.uploading : t.sending) : t.publish}
        </button>
        <button type="submit" name="intent" value="draft" className="btn-outline" disabled={pending}>
          {t.saveDraft}
        </button>
      </div>
    </form>
  );
}
