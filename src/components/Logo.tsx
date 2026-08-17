export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="warrantyWalletLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path
        d="M50 4 L90 18 V46 C90 72 74 90 50 98 C26 90 10 72 10 46 V18 Z"
        fill="url(#warrantyWalletLogoGradient)"
      />
      <rect
        x="27"
        y="37"
        width="46"
        height="31"
        rx="6"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeDasharray="4 3.5"
        opacity="0.8"
      />
      <circle cx="67" cy="52.5" r="4" fill="white" opacity="0.9" />
      <path
        d="M33 54 L45 66 L69 40"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
