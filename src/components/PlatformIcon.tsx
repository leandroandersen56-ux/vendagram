import React from "react";

interface PlatformIconProps {
  platformId: string;
  size?: number;
  className?: string;
}

const icons: Record<string, (s: number) => React.ReactNode> = {
  // Free Fire — official FF flame emblem (from wordmark)
  free_fire: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M17.5 2.5c-1.2 1.5-2.8 3.2-3.8 4.3-.6.7-1.5 1.8-2.1 2.7-.3.5-.7 1.1-.9 1.7-.2.6-.3 1.2-.3 1.8 0 .8.2 1.5.5 2.1.3.6.8 1.1 1.4 1.5.6.4 1.2.6 1.9.6h.1c-.5.9-1.2 1.7-2.1 2.3-.9.6-1.9 1-3 1.2l-.2.6c1.5 0 3-.4 4.2-1.2 1.2-.8 2.2-1.9 2.8-3.2.4-.8.6-1.7.6-2.6 0-.7-.1-1.4-.4-2.1-.2-.7-.6-1.3-1-1.9-.8-1.2-1.9-2.4-3-3.5L17.5 2.5z" fill="#FFB900"/>
      <path d="M10.5 5c-1.5 1.8-3.5 4.2-4.5 6-.5.9-.8 1.8-1 2.7-.1.9 0 1.8.4 2.7.3.9.9 1.7 1.6 2.3.7.7 1.6 1.2 2.5 1.5.9.3 1.9.4 2.9.3 1-.1 1.9-.4 2.7-.9.8-.5 1.5-1.2 2-2 .5-.8.8-1.7.9-2.6.1-.9 0-1.9-.4-2.7-.4-.9-.9-1.7-1.6-2.3C14.8 8.7 12.5 6.5 10.5 5z" fill="#FF6B00" opacity="0.85"/>
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

  // Valorant — official V mark (Simple Icons)
  valorant: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M23.792 2.152a.252.252 0 0 0-.098.083c-3.384 4.23-6.769 8.46-10.15 12.69-.107.093-.025.288.119.265 2.439.003 4.877 0 7.316.001a.66.66 0 0 0 .552-.25c.774-.967 1.55-1.934 2.324-2.903a.72.72 0 0 0 .144-.49c-.002-3.077 0-6.153-.003-9.23.016-.11-.1-.206-.204-.167zM.077 2.166c-.077.038-.074.132-.076.205.002 3.074.001 6.15.001 9.225a.679.679 0 0 0 .158.463l7.64 9.55c.12.152.308.25.505.247 2.455 0 4.91.003 7.365 0 .142.02.222-.174.116-.265C10.661 15.176 5.526 8.766.4 2.35c-.08-.094-.174-.272-.322-.184z" fill="#FF4655"/>
    </svg>
  ),

  // Fortnite — official F logo (Simple Icons)
  fortnite: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="m15.767 14.171.097-5.05H12.4V5.197h3.99L16.872 0H7.128v24l5.271-.985V14.17z" fill="#00D4FF"/>
    </svg>
  ),

  // Roblox — official logo (Simple Icons)
  roblox: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z" fill="#E2231A"/>
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
