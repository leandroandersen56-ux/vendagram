import { useState } from "react";
import verifiedBadgeImg from "@/assets/verified-badge.png";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export const VerifiedBadge = ({ size = 18, className = '' }: VerifiedBadgeProps) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <img
        src={verifiedBadgeImg}
        alt="Conta verificada"
        width={size}
        height={size}
        className="object-contain"
        draggable={false}
      />
      {showTip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-foreground text-background text-[10px] font-medium rounded whitespace-nowrap z-50 pointer-events-none shadow-lg">
          Conta verificada pela Froiv
        </span>
      )}
    </span>
  );
};

export default VerifiedBadge;
