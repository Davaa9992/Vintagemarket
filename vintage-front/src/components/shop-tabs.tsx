"use client";
import { useState } from "react";
import { useLang } from "./lang-provider";

type Tab = "items" | "reviews" | "about";

export function ShopTabs({
  labels,
  items,
  reviews,
  about,
}: {
  labels: Record<Tab, string>;
  items: React.ReactNode;
  reviews: React.ReactNode;
  about: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("items");
  const panels: Record<Tab, React.ReactNode> = { items, reviews, about };
  return (
    <>
      <div role="tablist" className="no-scrollbar mt-12 flex gap-8 overflow-x-auto border-b border-line">
        {(Object.keys(labels) as Tab[]).map((k) => (
          <button
            key={k}
            role="tab"
            id={`tab-${k}`}
            aria-selected={tab === k}
            aria-controls={`panel-${k}`}
            onClick={() => setTab(k)}
            className={`-mb-px min-h-12 cursor-pointer border-b-2 py-3.5 text-[15px] font-semibold whitespace-nowrap ${
              tab === k ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {labels[k]}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-9">
        {panels[tab]}
      </div>
    </>
  );
}

export function FollowButton() {
  const { t } = useLang();
  const [on, setOn] = useState(false);
  return (
    <button type="button" aria-pressed={on} onClick={() => setOn(!on)} className={on ? "btn-outline" : "btn-primary"}>
      {on ? t.following : t.follow}
    </button>
  );
}
