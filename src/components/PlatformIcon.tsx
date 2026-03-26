import React from "react";
import freefireLogo from "@/assets/freefire-logo.png";
interface PlatformIconProps {
  platformId: string;
  size?: number;
  className?: string;
}

const C = "#FFFF00";

const icons: Record<string, (s: number) => React.ReactNode> = {
  free_fire: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M17.5 2.5c-1.2 1.5-2.8 3.2-3.8 4.3-.6.7-1.5 1.8-2.1 2.7-.3.5-.7 1.1-.9 1.7-.2.6-.3 1.2-.3 1.8 0 .8.2 1.5.5 2.1.3.6.8 1.1 1.4 1.5.6.4 1.2.6 1.9.6h.1c-.5.9-1.2 1.7-2.1 2.3-.9.6-1.9 1-3 1.2l-.2.6c1.5 0 3-.4 4.2-1.2 1.2-.8 2.2-1.9 2.8-3.2.4-.8.6-1.7.6-2.6 0-.7-.1-1.4-.4-2.1-.2-.7-.6-1.3-1-1.9-.8-1.2-1.9-2.4-3-3.5L17.5 2.5z" fill={C}/>
      <path d="M10.5 5c-1.5 1.8-3.5 4.2-4.5 6-.5.9-.8 1.8-1 2.7-.1.9 0 1.8.4 2.7.3.9.9 1.7 1.6 2.3.7.7 1.6 1.2 2.5 1.5.9.3 1.9.4 2.9.3 1-.1 1.9-.4 2.7-.9.8-.5 1.5-1.2 2-2 .5-.8.8-1.7.9-2.6.1-.9 0-1.9-.4-2.7-.4-.9-.9-1.7-1.6-2.3C14.8 8.7 12.5 6.5 10.5 5z" fill={C} opacity="0.6"/>
    </svg>
  ),

  instagram: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke={C} strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="5" stroke={C} strokeWidth="1.8" fill="none"/>
      <circle cx="18" cy="6" r="1.5" fill={C}/>
    </svg>
  ),

  tiktok: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill={C}/>
    </svg>
  ),

  facebook: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill={C}/>
      <path d="M16.5 13.5l.5-3.5h-3V8c0-1 .5-1.8 1.8-1.8H17V3.2S15.8 3 14.7 3C12.3 3 10.8 4.5 10.8 7.2V10H8v3.5h2.8V22h3.4V13.5h2.3z" fill="#0A0A0A"/>
    </svg>
  ),

  youtube: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1c.3-1.9.5-3.8.5-5.8a31.3 31.3 0 00-.5-5.8z" fill={C}/>
      <path d="M9.75 15.5V8.5l6.25 3.5-6.25 3.5z" fill="#0A0A0A"/>
    </svg>
  ),

  valorant: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M23.792 2.152a.252.252 0 0 0-.098.083c-3.384 4.23-6.769 8.46-10.15 12.69-.107.093-.025.288.119.265 2.439.003 4.877 0 7.316.001a.66.66 0 0 0 .552-.25c.774-.967 1.55-1.934 2.324-2.903a.72.72 0 0 0 .144-.49c-.002-3.077 0-6.153-.003-9.23.016-.11-.1-.206-.204-.167zM.077 2.166c-.077.038-.074.132-.076.205.002 3.074.001 6.15.001 9.225a.679.679 0 0 0 .158.463l7.64 9.55c.12.152.308.25.505.247 2.455 0 4.91.003 7.365 0 .142.02.222-.174.116-.265C10.661 15.176 5.526 8.766.4 2.35c-.08-.094-.174-.272-.322-.184z" fill={C}/>
    </svg>
  ),

  fortnite: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="m15.767 14.171.097-5.05H12.4V5.197h3.99L16.872 0H7.128v24l5.271-.985V14.17z" fill={C}/>
    </svg>
  ),

  roblox: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z" fill={C}/>
    </svg>
  ),

  clash_royale: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" fill="none" stroke={C} strokeWidth="2"/>
      <path d="M8 10l4-3 4 3-4 3-4-3z" fill={C}/>
      <path d="M12 14v4" stroke={C} strokeWidth="2" strokeLinecap="round"/>
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
