"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteListingAction } from "@/lib/actions";
import { useLang } from "../lang-provider";

/** Хоёр алхамтай устгах (browser-ийн confirm цонх ашиглахгүй) */
export function DeleteListing({ id, live }: { id: string; live: boolean }) {
  const { t } = useLang();
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  if (!asking)
    return (
      <button type="button" onClick={() => setAsking(true)} className="min-h-10 cursor-pointer px-2 text-[13px] font-semibold text-brick underline">
        {t.deleteListing}
      </button>
    );
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            if (!live) return setAsking(false);
            const res = await deleteListingAction(id);
            if (res.error) setError(res.error);
            else router.refresh();
          })
        }
        className="btn-primary min-h-10 bg-brick px-3 text-[13px]"
      >
        {t.confirmDelete}
      </button>
      <button type="button" onClick={() => setAsking(false)} className="min-h-10 cursor-pointer px-2 text-[13px] font-semibold underline">
        {t.cancel}
      </button>
      {error && (
        <span role="alert" className="w-full text-right text-xs text-brick">
          {error}
        </span>
      )}
    </span>
  );
}
