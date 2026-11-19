"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormState } from "@/lib/actions";

/** Төлөв солих select. action нь server action (id, утга) */
export function StatusSelect({
  id,
  value,
  options,
  label,
  action,
}: {
  id: string;
  value: string;
  options: { value: string; label: string }[];
  label: string;
  action: (id: string, value: string) => Promise<FormState>;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <select
        aria-label={label}
        className="field min-h-10 w-auto py-1.5 text-[13px]"
        value={current}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          const prev = current;
          setCurrent(next);
          setError(undefined);
          start(async () => {
            const res = await action(id, next);
            if (res.error) {
              setCurrent(prev);
              setError(res.error);
            } else router.refresh();
          });
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" className="max-w-[220px] text-right text-xs text-brick">
          {error}
        </span>
      )}
    </span>
  );
}
