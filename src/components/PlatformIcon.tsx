import React from "react";

interface PlatformIconProps {
  platformId: string;
  size?: number;
  className?: string;
}

const icons: Record<string, (size: number) => React.ReactNode> = {
  free_fire: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#FF6B35" fillOpacity="0.15" />
      <path d="M24 8L14 18v12l10 10 10-10V18L24 8z" fill="#FF6B35" fillOpacity="0.2" stroke="#FF6B35" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M24 14l-6 6v8l6 6 6-6v-8l-6-6z" fill="#FF6B35" fillOpacity="0.4"/>
      <path d="M20 22h8M20 26h5" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="18" r="2" fill="#FF6B35"/>
    </svg>
  ),
  instagram: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="48" x2="48" y2="0">
          <stop offset="0%" stopColor="#FEDA75"/>
          <stop offset="25%" stopColor="#FA7E1E"/>
          <stop offset="50%" stopColor="#D62976"/>
          <stop offset="75%" stopColor="#962FBF"/>
          <stop offset="100%" stopColor="#4F5BD5"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" stroke="url(#ig-grad)" strokeWidth="3" fill="none"/>
      <circle cx="24" cy="24" r="9" stroke="url(#ig-grad)" strokeWidth="2.5" fill="none"/>
      <circle cx="35" cy="13" r="2.5" fill="url(#ig-grad)"/>
    </svg>
  ),
  tiktok: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 6h-5v26a5 5 0 11-5-5" stroke="#25F4EE" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M28 6h-3v26a5 5 0 11-5-5" stroke="#FE2C55" strokeWidth="2.5" strokeLinecap="round" fill="none" transform="translate(2, 0)"/>
      <path d="M29 6c2 0 4.5 1 6 3s2 4 2 6" stroke="#25F4EE" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M31 6c2 0 4.5 1 6 3s2 4 2 6" stroke="#FE2C55" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  ),
  facebook: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="#1877F2"/>
      <path d="M31 25h-4.5v14h-5.5V25H17v-5h4V16.5C21 12.5 23 10 27.5 10H31v5h-2.5c-1.5 0-2 .7-2 2V20H31l-1 5z" fill="white"/>
    </svg>
  ),
  youtube: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43.2 14.8a5 5 0 00-3.5-3.5C36.6 10.3 24 10.3 24 10.3s-12.6 0-15.7 1a5 5 0 00-3.5 3.5A52.2 52.2 0 003.5 24c0 3.2.4 6.3 1.3 9.2a5 5 0 003.5 3.5c3.1 1 15.7 1 15.7 1s12.6 0 15.7-1a5 5 0 003.5-3.5c.9-2.9 1.3-6 1.3-9.2 0-3.2-.4-6.3-1.3-9.2z" fill="#FF0000"/>
      <path d="M20 30.5V17.5l10 6.5-10 6.5z" fill="white"/>
    </svg>
  ),
  valorant: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12l18 24h6L12 12H6z" fill="#FF4655"/>
      <path d="M30 12v24h6V18l6-6h-6l-6 0z" fill="#FF4655"/>
    </svg>
  ),
  fortnite: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="40" height="40" rx="4" fill="#9D4DBB" fillOpacity="0.15"/>
      <path d="M16 10h16v5H22v5h8v5h-8v13h-6V10z" fill="#9D4DBB"/>
    </svg>
  ),
  roblox: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 6l-4 36 32 4 4-36L10 6z" fill="#E2231A" fillOpacity="0.15" stroke="#E2231A" strokeWidth="2"/>
      <rect x="19" y="19" width="10" height="10" rx="1" fill="#E2231A"/>
    </svg>
  ),
  clash_royale: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 6l-14 8v16l14 12 14-12V14L24 6z" fill="#F5C518" fillOpacity="0.15" stroke="#F5C518" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M24 14l-6 4v8l6 6 6-6v-8l-6-4z" fill="#F5C518" fillOpacity="0.4"/>
      <path d="M21 22l3-3 3 3-3 3-3-3z" fill="#F5C518"/>
    </svg>
  ),
  other: (s) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="#7C3AED" strokeWidth="2.5" fill="#7C3AED" fillOpacity="0.1"/>
      <circle cx="24" cy="24" r="8" stroke="#7C3AED" strokeWidth="2" fill="none"/>
      <line x1="24" y1="6" x2="24" y2="14" stroke="#7C3AED" strokeWidth="2"/>
      <line x1="24" y1="34" x2="24" y2="42" stroke="#7C3AED" strokeWidth="2"/>
      <line x1="6" y1="24" x2="14" y2="24" stroke="#7C3AED" strokeWidth="2"/>
      <line x1="34" y1="24" x2="42" y2="24" stroke="#7C3AED" strokeWidth="2"/>
    </svg>
  ),
};

export default function PlatformIcon({ platformId, size = 32, className }: PlatformIconProps) {
  const renderIcon = icons[platformId] || icons.other;
  return <span className={className} style={{ display: "inline-flex", lineHeight: 0 }}>{renderIcon(size)}</span>;
}
