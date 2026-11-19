"use client";
import Link from "next/link";
import { useState } from "react";
import { loginAction, registerAction } from "@/lib/actions";
import { useFormAction } from "@/lib/use-form-action";
import { useLang } from "./lang-provider";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const { t } = useLang();
  const { state, pending, onSubmit } = useFormAction(mode === "login" ? loginAction : registerAction);
  // Алдаа гарахад React формыг цэвэрлэдэг тул утга хадгална
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const other = mode === "login" ? "/register" : "/login";
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4.5">
      <input type="hidden" name="next" value={next} />
      {mode === "register" && (
        <label className="label">
          {t.fullName}
          <input className="field" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      )}
      <label className="label">
        {t.phone}
        <input className="field" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="9911 2233" required value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label className="label">
        {t.password}
        <input
          className="field"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
        />
        {mode === "register" && <span className="text-xs font-normal text-muted">{t.passwordHint}</span>}
      </label>
      {state.error && (
        <p role="alert" className="bg-brick-soft px-4 py-3 text-sm font-semibold text-brick-ink">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? t.sending : mode === "login" ? t.login : t.register}
      </button>
      <p className="text-sm text-muted">
        {mode === "login" ? t.noAccount : t.haveAccount}{" "}
        <Link href={`${other}?next=${encodeURIComponent(next)}`} className="font-semibold text-olive underline">
          {mode === "login" ? t.register : t.login}
        </Link>
      </p>
    </form>
  );
}
