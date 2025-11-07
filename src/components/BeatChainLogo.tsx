export function BeatChainLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />

      {/* Musical note style waveform - represents audio/music */}
      <path
        d="M 12 28 L 16 20 L 20 26 L 24 18 L 28 24 L 32 16 L 36 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Blockchain nodes - subtle connection points */}
      <circle cx="12" cy="28" r="2.5" fill="currentColor" />
      <circle cx="24" cy="18" r="2.5" fill="currentColor" />
      <circle cx="36" cy="28" r="2.5" fill="currentColor" />

      {/* Connecting lines for blockchain feel */}
      <line
        x1="12"
        y1="28"
        x2="24"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
        strokeDasharray="2,2"
      />
      <line
        x1="24"
        y1="18"
        x2="36"
        y2="28"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
        strokeDasharray="2,2"
      />
    </svg>
  );
}
