"use client";

import { MDXEditorWrapper } from "@/components/admin/mdx-editor";
import { useState } from "react";

const initialContent = `# MDX Editor Test

Start typing here...`;

export default function MDXEditorTestPage() {
  const [markdown, setMarkdown] = useState(initialContent);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">MDX Editor Test</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <MDXEditorWrapper markdown={markdown} onChange={setMarkdown} />
      </div>
    </div>
  );
}
