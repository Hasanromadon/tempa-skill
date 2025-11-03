import React from "react";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold text-gray-900 mb-6 mt-8 pb-2 border-b">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold text-gray-900 mb-4 mt-6">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-5">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold text-gray-900 mb-2 mt-4">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-lg font-semibold text-gray-900 mb-2 mt-3">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-base font-semibold text-gray-900 mb-2 mt-3">
        {children}
      </h6>
    ),

    // Paragraphs and text
    p: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-gray-700">{children}</em>,

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-orange-600 hover:text-orange-700 underline font-medium"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),

    // Code blocks
    pre: ({ children }) => (
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4 border border-gray-700">
        {children}
      </pre>
    ),
    code: ({ children, className }) => {
      // Inline code
      if (!className) {
        return (
          <code className="bg-gray-100 text-orange-600 px-1.5 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        );
      }
      // Code block
      return (
        <code className={`${className} font-mono text-sm block`}>
          {children}
        </code>
      );
    },

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-orange-500 pl-4 py-2 mb-4 bg-orange-50 rounded-r">
        <div className="text-gray-700 italic">{children}</div>
      </blockquote>
    ),

    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-200 border">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
    tbody: ({ children }) => (
      <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
    ),
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-gray-700">{children}</td>
    ),

    // Horizontal rule
    hr: () => <hr className="my-8 border-t border-gray-300" />,

    // Images (using standard img for MDX content - Next Image optimization not suitable for dynamic MDX)
    img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img
        alt={props.alt || ""}
        {...props}
        className="rounded-lg shadow-md my-6 max-w-full h-auto"
      />
    ),

    // Custom components
    Note: ({
      children,
      type = "info",
    }: {
      children: React.ReactNode;
      type?: "info" | "warning" | "success" | "error";
    }) => {
      const styles = {
        info: "bg-blue-50 border-blue-500 text-blue-900",
        warning: "bg-yellow-50 border-yellow-500 text-yellow-900",
        success: "bg-green-50 border-green-500 text-green-900",
        error: "bg-red-50 border-red-500 text-red-900",
      };

      const icons = {
        info: "ℹ️",
        warning: "⚠️",
        success: "✅",
        error: "❌",
      };

      return (
        <div
          className={`border-l-4 p-4 mb-4 rounded-r ${styles[type]}`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{icons[type]}</span>
            <div className="flex-1">{children}</div>
          </div>
        </div>
      );
    },

    Callout: ({
      children,
      title,
    }: {
      children: React.ReactNode;
      title?: string;
    }) => (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
        {title && (
          <h4 className="font-semibold text-orange-900 mb-2">{title}</h4>
        )}
        <div className="text-gray-700">{children}</div>
      </div>
    ),

    CodeBlock: ({
      children,
      language,
      title,
    }: {
      children: React.ReactNode;
      language?: string;
      title?: string;
    }) => (
      <div className="mb-4">
        {title && (
          <div className="bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg text-sm font-medium flex items-center justify-between">
            <span>{title}</span>
            {language && (
              <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                {language}
              </span>
            )}
          </div>
        )}
        <pre
          className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto border border-gray-700 ${
            title ? "rounded-b-lg" : "rounded-lg"
          }`}
        >
          <code className="font-mono text-sm">{children}</code>
        </pre>
      </div>
    ),

    ...components,
  };
}
