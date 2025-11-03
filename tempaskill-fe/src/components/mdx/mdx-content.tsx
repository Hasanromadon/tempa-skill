"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { useEffect, useState } from "react";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import type { HTMLAttributes } from "react";

// Custom components for MDX
const components = {
  // Headings with better styling
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold mb-4 text-gray-900" {...props} />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900" {...props} />
  ),
  
  // Code blocks with better styling
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto my-4" {...props} />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code className="text-sm font-mono" {...props} />
  ),
  
  // Links with brand color
  a: (props: HTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-orange-600 hover:text-orange-700 underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  
  // Lists with better spacing
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside space-y-2 my-4" {...props} />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside space-y-2 my-4" {...props} />
  ),
  li: (props: HTMLAttributes<HTMLLIElement>) => (
    <li className="text-gray-700" {...props} />
  ),
  
  // Paragraphs
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-700 leading-relaxed my-4" {...props} />
  ),
  
  // Blockquotes
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-orange-500 pl-4 italic my-4 text-gray-600"
      {...props}
    />
  ),
  
  // Tables
  table: (props: HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-200" {...props} />
    </div>
  ),
  th: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-2 bg-gray-100 text-left font-semibold" {...props} />
  ),
  td: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-2 border-t" {...props} />
  ),
};

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function compileMDX() {
      try {
        const serialized = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
              rehypeHighlight,
            ],
          },
        });
        setMdxSource(serialized);
        setError(null);
      } catch (err) {
        console.error("Error compiling MDX:", err);
        setError("Failed to render content");
      }
    }

    if (content) {
      compileMDX();
    }
  }, [content]);

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        <p className="font-semibold">Error rendering content</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!mdxSource) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none">
      <MDXRemote {...mdxSource} components={components} />
    </div>
  );
}
