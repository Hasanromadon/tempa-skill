"use client";

import {
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  XCircle,
} from "lucide-react";
import { HTMLAttributes, ReactNode } from "react";

export interface CalloutProps {
  type?: "info" | "warning" | "success" | "error" | "tip";
  title?: string;
  children: ReactNode;
}

const calloutStyles = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    titleColor: "text-yellow-800",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    titleColor: "text-green-800",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    titleColor: "text-red-800",
  },
  tip: {
    icon: Lightbulb,
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconColor: "text-orange-600",
    titleColor: "text-orange-800",
  },
};

/**
 * Callout Component for MDX
 *
 * Usage in MDX:
 * <Callout type="info" title="Important Note">
 *   This is important information
 * </Callout>
 *
 * Or with default type:
 * <Callout>
 *   Default info callout
 * </Callout>
 */
export function Callout({
  type = "info",
  title,
  children,
  ...props
}: CalloutProps & HTMLAttributes<HTMLDivElement>) {
  const style = calloutStyles[type];
  const Icon = style.icon;

  return (
    <div
      className={`rounded-lg border p-4 my-4 ${style.bgColor} ${style.borderColor}`}
      {...props}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${style.iconColor}`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-2 ${style.titleColor}`}>
              {title}
            </h4>
          )}
          <div className="text-gray-700 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

// MDX-compatible component (lowercase for MDX usage)
export const callout = Callout;
