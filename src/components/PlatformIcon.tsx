import React from "react";
import freefireLogo from "@/assets/freefire-logo.png";
import kwaiLogo from "@/assets/kwai-icon.svg";
interface PlatformIconProps {
  platformId: string;
  size?: number;
  className?: string;
}

const C = "#2699F7";

const icons: Record<string, (s: number) => React.ReactNode> = {
  free_fire: (s) => (
    <img src={freefireLogo} width={s * 1.4} height={s * 1.4} alt="Free Fire" style={{ objectFit: "contain" }} />
  ),

  instagram: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0%" stopColor="#F58529"/>
          <stop offset="50%" stopColor="#DD2A7B"/>
          <stop offset="100%" stopColor="#8134AF"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="5" stroke="url(#ig-grad)" strokeWidth="1.8" fill="none"/>
      <circle cx="18" cy="6" r="1.5" fill="#DD2A7B"/>
    </svg>
  ),

  tiktok: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="#000000"/>
    </svg>
  ),

  facebook: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" fill="#1877F2"/>
    </svg>
  ),

  youtube: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="4" width="22" height="16" rx="4" fill="#FF0000"/>
      <path d="M10 8.5v7l6-3.5-6-3.5z" fill="#fff"/>
    </svg>
  ),

  valorant: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M23.792 2.152a.252.252 0 0 0-.098.083c-3.384 4.23-6.769 8.46-10.15 12.69-.107.093-.025.288.119.265 2.439.003 4.877 0 7.316.001a.66.66 0 0 0 .552-.25c.774-.967 1.55-1.934 2.324-2.903a.72.72 0 0 0 .144-.49c-.002-3.077 0-6.153-.003-9.23.016-.11-.1-.206-.204-.167zM.077 2.166c-.077.038-.074.132-.076.205.002 3.074.001 6.15.001 9.225a.679.679 0 0 0 .158.463l7.64 9.55c.12.152.308.25.505.247 2.455 0 4.91.003 7.365 0 .142.02.222-.174.116-.265C10.661 15.176 5.526 8.766.4 2.35c-.08-.094-.174-.272-.322-.184z" fill="#FF4655"/>
    </svg>
  ),

  fortnite: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="m15.767 14.171.097-5.05H12.4V5.197h3.99L16.872 0H7.128v24l5.271-.985V14.17z" fill={C}/>
    </svg>
  ),

  roblox: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z" fill="#6B7280"/>
    </svg>
  ),

  clash_royale: (s) => (
    <svg width={s} height={s} viewBox="0 0 192 192" fill="none">
      <path d="m96 31.62 13.43 11.2a16 16 0 0 0 10.22 3.7h30.81l-3.06 92L96 162.74l-51.39-24.19-3.07-92h30.82a16 16 0 0 0 10.2-3.7L96 31.62M96 16 74.88 33.61a4 4 0 0 1-2.53.91H29.13l3.73 111.76L96 176l63.15-29.72 3.72-111.76h-43.22a4 4 0 0 1-2.53-.91L96 16Z" fill="#F59E0B"/>
      <path d="M88.29 69a3.85 3.85 0 0 0-3.75 2.92l-3.12 12.51h-5.78l-3-8.94A3.85 3.85 0 0 0 69 72.86h-7.71a3.85 3.85 0 0 0-3.86 3.85v.35l3.86 42.43a3.86 3.86 0 0 0 3.85 3.51h61.72a3.86 3.86 0 0 0 3.84-3.51l3.86-42.43a3.87 3.87 0 0 0-3.5-4.19H123a3.85 3.85 0 0 0-3.66 2.63l-3 8.94h-5.78l-3.12-12.51a3.85 3.85 0 0 0-3.73-2.93Z" fill="none" stroke="#F59E0B" strokeWidth="8" strokeMiterlimit="10"/>
    </svg>
  ),

  kwai: (s) => (
    <img src={kwaiLogo} width={s * 1.2} height={s * 1.2} alt="Kwai" style={{ objectFit: "contain" }} />
  ),

  twitter: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000"/>
    </svg>
  ),

  other: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={C} strokeWidth="2" fill="none"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" stroke={C} strokeWidth="1.5" fill="none"/>
    </svg>
  ),
};

export default function PlatformIcon({ platformId, size = 32, className }: PlatformIconProps) {
  const renderIcon = icons[platformId] || icons.other;
  return <span className={className} style={{ display: "inline-flex", lineHeight: 0 }}>{renderIcon(size)}</span>;
}
