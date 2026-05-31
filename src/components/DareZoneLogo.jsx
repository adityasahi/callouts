// Inline SVG logo: location pin with a checkered flag inside the circle
export default function DareZoneLogo({ className = '' }) {
  return (
    <svg
      className={className}
      width="28"
      height="34"
      viewBox="0 0 28 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DareZone logo"
    >
      {/* Pin body */}
      <path
        d="M14 1.5C7.649 1.5 2.5 6.649 2.5 13C2.5 20.5 14 32.5 14 32.5C14 32.5 25.5 20.5 25.5 13C25.5 6.649 20.351 1.5 14 1.5Z"
        fill="hsl(16,85%,58%)"
      />
      {/* Pin inner circle */}
      <circle cx="14" cy="13" r="7" fill="white" />
      {/* Checkered flag squares — 2×2 grid */}
      <rect x="10.5" y="9.5" width="3" height="3" rx="0.3" fill="hsl(16,85%,58%)" />
      <rect x="13.5" y="9.5" width="3" height="3" rx="0.3" fill="white" fillOpacity="0" />
      <rect x="10.5" y="12.5" width="3" height="3" rx="0.3" fill="white" fillOpacity="0" />
      <rect x="13.5" y="12.5" width="3" height="3" rx="0.3" fill="hsl(16,85%,58%)" />
      {/* Dark squares for contrast */}
      <rect x="10.5" y="9.5" width="3" height="3" rx="0.3" fill="rgba(0,0,0,0.75)" />
      <rect x="13.5" y="12.5" width="3" height="3" rx="0.3" fill="rgba(0,0,0,0.75)" />
      {/* Flag pole */}
      <line x1="14" y1="8.5" x2="14" y2="16" stroke="hsl(16,85%,58%)" strokeWidth="1" strokeLinecap="round"/>
      {/* Flag fabric */}
      <path d="M14 8.5 L18 10.5 L14 12.5 Z" fill="hsl(16,85%,58%)" />
    </svg>
  );
}