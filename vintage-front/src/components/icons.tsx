type P = { size?: number; className?: string };

const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  "aria-hidden": true,
});

export const SearchIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
);

export const HeartIcon = ({ size, className, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </svg>
);

export const UserIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
);

export const BagIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
);

export const TruckIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </svg>
);

export const CardIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="6" width="18" height="13" rx="1" />
    <path d="M3 10h18" />
  </svg>
);

export const LockIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="5" y="11" width="14" height="10" rx="1" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const CloseIcon = ({ size = 12, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden className={className}>
    <path d="M2 2l8 8M10 2l-8 8" />
  </svg>
);

export const CheckIcon = ({ size, className }: P) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);

export const QrIcon = ({ size, className }: P) => (
  <svg {...base(size)} strokeWidth={1.4} className={className}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14v2" />
  </svg>
);

export const PlusIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
