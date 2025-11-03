import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

const sizeDimensions = {
  sm: { width: 48, height: 48, strokeWidth: 4, radius: 20 },
  md: { width: 64, height: 64, strokeWidth: 5, radius: 27 },
  lg: { width: 96, height: 96, strokeWidth: 6, radius: 42 },
};

export function ProgressRing({
  progress,
  size = "md",
  className,
}: ProgressRingProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const { width, height, strokeWidth, radius } = sizeDimensions[size];

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-orange-600 transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(normalizedProgress)}%
        </span>
      </div>
    </div>
  );
}
