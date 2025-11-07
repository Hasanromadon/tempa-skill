"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

interface TabItem {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  children: ReactNode;
  defaultActive?: number;
  className?: string;
}

// Internal component for individual tab content
function Tab({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Main Tabs component
export function Tabs({ children, defaultActive = 0, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActive);

  // Extract tab items from children
  const tabItems: TabItem[] = [];
  const childrenArray = Array.isArray(children) ? children : [children];

  childrenArray.forEach((child) => {
    if (child && typeof child === "object" && "props" in child) {
      const { label, children: tabContent } = child.props;
      if (label && tabContent) {
        tabItems.push({ label, content: tabContent });
      }
    }
  });

  if (tabItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("my-6", className)}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-1">
          {tabItems.map((tab, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveTab(index)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                activeTab === index
                  ? "bg-orange-600 text-white border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
        {tabItems[activeTab]?.content}
      </div>
    </div>
  );
}

// Export Tab component for use in MDX
export { Tab };
