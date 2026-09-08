import type { CSSProperties, ReactNode } from "react";
const paths: Record<string, ReactNode> = {
  settings: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="3" fill="currentColor" stroke="none" />
      <circle cx="16" cy="17" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  moon: <path d="M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11Z" />,
  rain: (
    <>
      <path d="M6 15a5 5 0 1 1 2-10 6 6 0 0 1 11 5 3 3 0 0 1 0 6M7 19l-1 2m6-2-1 2m6-2-1 2" />
    </>
  ),
  wave: (
    <>
      <path d="M2 8c4-7 6 7 10 0s6 7 10 0M2 16c4-7 6 7 10 0s6 7 10 0" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="12" width="4" height="8" rx="2" />
      <rect x="17" y="12" width="4" height="8" rx="2" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1.5" />
      <path d="m3 17 6-6 4 4 3-3 5 5" />
    </>
  ),
  play: <path d="m8 4 12 8-12 8V4Z" />,
  palette: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c8 3-6 5-2 9s9-2 11 0" />
    </>
  ),
  upload: <path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" />,

  music: (
    <>
      <path d="M9 18V5l12-2v13M9 8l12-2" />
      <ellipse cx="6" cy="18" rx="3" ry="2" />
      <ellipse cx="18" cy="16" rx="3" ry="2" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 15h10" />
    </>
  ),
  chart: <path d="M4 3v17h17M8 14l4-5 4 3 5-7" />,
  trophy: (
    <path d="M8 3h8v6a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4M12 13v5m-4 3v-3h8v3M6 21h12" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  arrowUp: <path d="M7 17 17 7M7 7h10v10" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  zap: <path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z" />,
  fire: (
    <path d="M12 3c1 5-4 5-3 9 2 0 3-2 3-4 4 3 6 5 6 8a6 6 0 0 1-12 0c0-4 4-6 6-13Z" />
  ),
  reset: <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  volume: (
    <path d="m11 4-5 4H3v8h3l5 4V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
  ),
  mute: <path d="m11 4-5 4H3v8h3l5 4V4Zm5 5 5 6m0-6-5 6" />,
  expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.8 2.1c-.9.5-1.3 1-1.3 2.4M12 17h.01" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  logout: <path d="M9 4H4v16h5m5-13 5 5-5 5m-6-5h12" />,
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  book: (
    <path d="M12 6c-3-3-7-3-10-2v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2Zm0 0v15" />
  ),
  sparkles: (
    <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4" />
  ),
};
export function Icon({
  name,
  size = 20,
  className,
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {paths[name] ?? paths.sparkles}
    </svg>
  );
}
