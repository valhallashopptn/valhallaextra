export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Valhalla Logo</title>
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#f97316"}} />
          <stop offset="100%" style={{stopColor:"#ec4899"}} />
        </linearGradient>
      </defs>
      <g stroke="url(#logoGradient)" strokeWidth="1.5">
        <rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="none" />
        <path d="M10.25 5.5 L7.5 12 L12.5 12 L9.5 18.5 L15.5 10 L11.5 10 L10.25 5.5" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}
