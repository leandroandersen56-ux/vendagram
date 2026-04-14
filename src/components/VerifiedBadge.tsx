import { useState } from "react";

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
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Conta verificada"
      >
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path
          d="M9.5 12.5L11 14L15 10"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showTip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-foreground text-background text-[10px] font-medium rounded whitespace-nowrap z-50 pointer-events-none shadow-lg">
          Conta verificada pela Froiv
        </span>
      )}
    </span>
  );
};

export default VerifiedBadge;
