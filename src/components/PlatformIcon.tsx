import React from "react";

interface PlatformIconProps {
  platformId: string;
  size?: number;
  className?: string;
}

const icons: Record<string, (s: number) => React.ReactNode> = {
  // Free Fire — flame/fire icon
  free_fire: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 8 3 12.5 3 16a9 9 0 0018 0c0-3.5-3.5-8-9-14zm0 18a5 5 0 01-5-5c0-2 1.5-4.5 5-8.5 3.5 4 5 6.5 5 8.5a5 5 0 01-5 5z" fill="#FF6B35"/>
      <path d="M12 20a3 3 0 01-3-3c0-1.2 1-3 3-5.5 2 2.5 3 4.3 3 5.5a3 3 0 01-3 3z" fill="#FFAB00"/>
    </svg>
  ),

  // Instagram — official camera icon
  instagram: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#FEDA75"/>
          <stop offset="20%" stopColor="#FA7E1E"/>
          <stop offset="45%" stopColor="#D62976"/>
          <stop offset="70%" stopColor="#962FBF"/>
          <stop offset="100%" stopColor="#4F5BD5"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig)" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="5" stroke="url(#ig)" strokeWidth="1.8" fill="none"/>
      <circle cx="18" cy="6" r="1.5" fill="url(#ig)"/>
    </svg>
  ),

  // TikTok — official note/music icon shape
  tiktok: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M16.6 5.82A4.28 4.28 0 0115.54 3h-3.09v12.4a2.59 2.59 0 01-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.07 2.52 5.56 5.7 5.56 3.15 0 5.68-2.55 5.68-5.7V9.01a7.35 7.35 0 004.3 1.38V7.3s-2.17.04-3.87-1.48z" fill="#25F4EE"/>
      <path d="M17.1 5.82A4.28 4.28 0 0116.04 3h-3.09v12.4a2.59 2.59 0 01-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.07 2.52 5.56 5.7 5.56 3.15 0 5.68-2.55 5.68-5.7V9.01a7.35 7.35 0 004.3 1.38V7.3s-2.17.04-3.87-1.48z" fill="#FE2C55" opacity="0.7" transform="translate(0.5 0)"/>
    </svg>
  ),

  // Facebook — official F logo
  facebook: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#1877F2"/>
      <path d="M16.5 13.5l.5-3.5h-3V8c0-1 .5-1.8 1.8-1.8H17V3.2S15.8 3 14.7 3C12.3 3 10.8 4.5 10.8 7.2V10H8v3.5h2.8V22h3.4V13.5h2.3z" fill="white"/>
    </svg>
  ),

  // YouTube — official play button
  youtube: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1c.3-1.9.5-3.8.5-5.8a31.3 31.3 0 00-.5-5.8z" fill="#FF0000"/>
      <path d="M9.75 15.5V8.5l6.25 3.5-6.25 3.5z" fill="white"/>
    </svg>
  ),

  // Valorant — official V mark
  valorant: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M2 5l9 14h4L6 5H2z" fill="#FF4655"/>
      <path d="M15 5v14h3.5V8.5L22 5h-3.5L15 5z" fill="#FF4655"/>
    </svg>
  ),

  // Fortnite — F letter mark
  fortnite: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M7 2h10l-1.5 4H11v4h4.5l-1 3.5H11V22H7V2z" fill="#00D4FF"/>
    </svg>
  ),

  // Roblox — tilted square with square hole
  roblox: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5.5 1L1 18.5 18.5 23 23 5.5 5.5 1z" fill="none" stroke="#E2231A" strokeWidth="2"/>
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" fill="#E2231A"/>
    </svg>
  ),

  // Clash Royale — crown/shield
  clash_royale: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" fill="none" stroke="#F5C518" strokeWidth="2"/>
      <path d="M8 10l4-3 4 3-4 3-4-3z" fill="#F5C518"/>
      <path d="M12 14v4" stroke="#F5C518" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Other — globe icon
  other: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#7C3AED" strokeWidth="2" fill="none"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" stroke="#7C3AED" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
};

export default function PlatformIcon({ platformId, size = 32, className }: PlatformIconProps) {
  const renderIcon = icons[platformId] || icons.other;
  return <span className={className} style={{ display: "inline-flex", lineHeight: 0 }}>{renderIcon(size)}</span>;
}
