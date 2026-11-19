export function Avatar({ initials, size = 48 }: { initials: string; size?: number }) {
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full bg-olive font-serif font-semibold text-cream"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initials}
    </span>
  );
}
