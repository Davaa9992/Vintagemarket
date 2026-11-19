import { cx } from "@/lib/format";

export function Wordmark({ size = "md", tone = "light", align = "center" }: { size?: "sm" | "md" | "lg"; tone?: "light" | "dark"; align?: "center" | "start" }) {
  const big = { sm: "text-[28px]", md: "text-[38px]", lg: "text-[104px]" }[size];
  const small = { sm: "text-[9px]", md: "text-[10px]", lg: "text-lg" }[size];
  return (
    <span className={cx("flex flex-col leading-none", align === "center" ? "items-center" : "items-start")}>
      <span className={cx("font-serif font-medium tracking-tight", big, tone === "dark" ? "text-cream" : "text-ink")}>Vintage</span>
      <span
        className={cx(
          "mt-1 pl-[0.42em] font-bold tracking-[0.42em]",
          small,
          tone === "dark" ? "text-gold" : "text-olive",
          align === "start" && "pl-0",
        )}
      >
        MONGOLIA
      </span>
    </span>
  );
}
