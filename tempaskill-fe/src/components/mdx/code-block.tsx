"use client";

import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { ReactNode, useState } from "react";

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
  title?: string;
  className?: string;
}

export function CodeBlock({
  children,
  language,
  title,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Ensure children is a string
  const codeContent =
    typeof children === "string" ? children : String(children || "");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={cn("relative my-4 group", className)}>
      {title && (
        <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-medium rounded-t-lg border-b border-gray-700">
          {title}
        </div>
      )}
      <div className="relative">
        <pre
          className={cn(
            "bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm",
            !title && "rounded-t-lg"
          )}
        >
          <code
            className={cn("text-gray-100", language && `language-${language}`)}
          >
            {codeContent}
          </code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
