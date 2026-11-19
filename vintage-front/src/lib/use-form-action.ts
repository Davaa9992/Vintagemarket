"use client";
import { useState, useTransition } from "react";
import type { FormState } from "./actions";

/**
 * Server action-г формоос дуудна. <form action> алдаа гарсан ч формыг цэвэрлэдэг тул
 * onSubmit ашиглаж, бичсэн утгыг хадгална.
 */
export function useFormAction(fn: (prev: FormState, data: FormData) => Promise<FormState>) {
  const [state, setState] = useState<FormState>({});
  const [pending, start] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(async () => setState(await fn({}, data)));
  };
  return { state, pending, onSubmit };
}
