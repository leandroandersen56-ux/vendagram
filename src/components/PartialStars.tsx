import React from "react";

interface PartialStarsProps {
  rating: number;
  size?: string; // tailwind h/w class e.g. "h-3.5 w-3.5"
  className?: string;
}

const PartialStars: React.FC<PartialStarsProps> = ({ rating, size = "h-3.5 w-3.5", className = "" }) => {
  const starColor = "#f59e0b"; // amber-400
  const emptyColor = "#d1d5db"; // gray-300

  return (
    <div className={`flex gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(1, Math.max(0, rating - (s - 1))); // 0 to 1
        const clipId = `star-clip-${s}-${Math.random().toString(36).slice(2, 8)}`;

        return (
          <svg
            key={s}
            viewBox="0 0 24 24"
            className={size}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Empty star background */}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={emptyColor}
            />
            {/* Filled portion */}
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width={fill * 24} height="24" />
              </clipPath>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={starColor}
              clipPath={`url(#${clipId})`}
            />
          </svg>
        );
      })}
    </div>
  );
};

export default PartialStars;
