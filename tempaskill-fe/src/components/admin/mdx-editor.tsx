"use client";

import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import React from "react";

interface MDXEditorWrapperProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

/**
 * MDX Editor Component
 *
 * Komponen editor MDX dengan fitur lengkap untuk menulis konten lesson.
 * Mendukung: headings, bold, italic, lists, links, images, code blocks, tables.
 *
 * @param markdown - Konten MDX saat ini
 * @param onChange - Callback saat konten berubah
 * @param placeholder - Placeholder text
 */
export function MDXEditorWrapper({
  markdown,
  onChange,
  placeholder = "Tulis konten lesson di sini...",
}: MDXEditorWrapperProps) {
  const ref = React.useRef<MDXEditorMethods>(null);

  return (
    <div className="mdx-editor-wrapper border rounded-lg overflow-hidden">
      <MDXEditor
        ref={ref}
        markdown={markdown}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="prose prose-slate max-w-none min-h-[400px] p-4"
        plugins={[
          // Core plugins
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageUploadHandler: async (file) => {
              try {
                // Upload image to Firebase Storage via backend API
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "lessons");

                const response = await apiClient.post<{
                  message: string;
                  data: {
                    url: string;
                    filename: string;
                    size: number;
                    mime_type: string;
                  };
                }>(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                });

                // Return Firebase Storage public URL
                return response.data.data.url;
              } catch (error) {
                console.error("Image upload error:", error);
                // Fallback to base64 if upload fails
                const reader = new FileReader();
                return new Promise((resolve) => {
                  reader.onload = () => {
                    resolve(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                });
              }
            },
          }),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              javascript: "JavaScript",
              typescript: "TypeScript",
              jsx: "JSX",
              tsx: "TSX",
              python: "Python",
              go: "Go",
              java: "Java",
              css: "CSS",
              html: "HTML",
              sql: "SQL",
              bash: "Bash",
              json: "JSON",
              yaml: "YAML",
              markdown: "Markdown",
            },
          }),
          diffSourcePlugin({
            viewMode: "rich-text",
            diffMarkdown: markdown,
          }),
          markdownShortcutPlugin(),
          // Toolbar
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertThematicBreak />
                <ListsToggle />
                <InsertCodeBlock />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
  );
}
