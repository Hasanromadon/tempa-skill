"use client";

import { MDXContent } from "@/components/mdx";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  CreateLink,
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
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Edit, Eye, SplitSquareHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";

interface MDXEditorWrapperProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

interface MDXEditorWrapperProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  autoSave?: boolean;
  onAutoSave?: (markdown: string) => void;
  autoSaveDelay?: number;
}

/**
 * MDX Editor Component with Live Preview
 *
 * Komponen editor MDX dengan fitur lengkap untuk menulis konten lesson.
 * Mendukung: split view (editor + preview), syntax highlighting, toolbar,
 * auto-save, dan template snippets.
 *
 * @param markdown - Konten MDX saat ini
 * @param onChange - Callback saat konten berubah
 * @param placeholder - Placeholder text
 * @param autoSave - Enable auto-save functionality
 * @param onAutoSave - Callback untuk auto-save
 * @param autoSaveDelay - Delay untuk auto-save (ms)
 */
export function MDXEditorWrapper({
  markdown,
  onChange,
  placeholder = "Tulis konten lesson di sini...",
  autoSave = false,
  onAutoSave,
  autoSaveDelay = 2000,
}: MDXEditorWrapperProps) {
  const [viewMode, setViewMode] = useState<"editor" | "preview" | "split">(
    "editor"
  );
  const [showSource, setShowSource] = useState(false);
  const ref = React.useRef<MDXEditorMethods>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onAutoSave) return;

    const timeoutId = setTimeout(() => {
      onAutoSave(markdown);
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [markdown, autoSave, onAutoSave, autoSaveDelay]);

  // Debug logging
  useEffect(() => {
    console.log("MDXEditor markdown:", markdown);
    console.log("MDXEditor viewMode:", viewMode);
  }, [markdown, viewMode]);

  const insertTemplate = (template: string) => {
    // Prefer editor ref if available, otherwise fall back to external markdown state
    const currentMarkdown = ref.current
      ? ref.current.getMarkdown()
      : markdown || "";
    const newMarkdown = currentMarkdown + "\n\n" + template;
    // Update editor directly if ref supports it, and also notify parent via onChange
    if (ref.current) {
      const r = ref.current as unknown as { setMarkdown?: (m: string) => void };
      if (typeof r.setMarkdown === "function") {
        try {
          r.setMarkdown!(newMarkdown);
        } catch (err) {
          console.warn("ref.setMarkdown failed, falling back to onChange", err);
        }
      }
    }
    onChange(newMarkdown);
  };

  const templates = {
    heading: "# Judul Section\n\nDeskripsi section...",
    code: "```javascript\nconst example = 'Hello World';\nconsole.log(example);\n```",
    list: "- Item 1\n- Item 2\n- Item 3",
    link: "[Teks Link](https://example.com)",
    image: "![Alt text](https://example.com/image.jpg)",
    table:
      "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |",
    tabs: `<Tabs>
  <Tab label="Tab 1">
    Konten untuk tab pertama
  </Tab>
  <Tab label="Tab 2">
    Konten untuk tab kedua
  </Tab>
</Tabs>`,
    quiz: `<MDXQuiz
  question="Apa itu JavaScript?"
  option1="Bahasa pemrograman untuk styling web"
  option2="Bahasa pemrograman untuk membuat halaman web interaktif"
  option3="Bahasa pemrograman untuk database"
  option4="Bahasa markup untuk struktur web"
  correctAnswer={2}
  explanation="JavaScript adalah bahasa pemrograman yang digunakan untuk membuat halaman web menjadi interaktif dan dinamis."
/>`,
    codeBlock: `<CodeBlock language="javascript" title="Contoh Fungsi JavaScript">
function greetUser(name) {
  return \`Hello, \${name}!\`;
}

console.log(greetUser("World"));
</CodeBlock>`,
  };

  // Modal state for editing templates before insertion
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateModalType, setTemplateModalType] = useState<string | null>(
    null
  );
  const [templateModalValue, setTemplateModalValue] = useState<string>("");

  const openTemplateEditor = (type: keyof typeof templates) => {
    setTemplateModalType(type);
    setTemplateModalValue(templates[type]);
    setTemplateModalOpen(true);
  };

  const saveTemplateFromModal = () => {
    if (templateModalValue) insertTemplate(templateModalValue);
    setTemplateModalOpen(false);
    setTemplateModalType(null);
    setTemplateModalValue("");
  };

  return (
    <div className="mdx-editor-wrapper border rounded-lg overflow-hidden">
      {/* View Mode Toggle */}
      <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "editor" ? "default" : "ghost"}
            size="sm"
            type="button"
            onClick={() => setViewMode("editor")}
            className="h-8"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editor
          </Button>
          <Button
            variant={viewMode === "split" ? "default" : "ghost"}
            size="sm"
            type="button"
            onClick={() => setViewMode("split")}
            className="h-8"
          >
            <SplitSquareHorizontal className="h-4 w-4 mr-1" />
            Split
          </Button>
          <Button
            variant={viewMode === "preview" ? "default" : "ghost"}
            size="sm"
            type="button"
            onClick={() => setViewMode("preview")}
            className="h-8"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            variant={showSource ? "default" : "ghost"}
            size="sm"
            type="button"
            onClick={() => setShowSource((s) => !s)}
            className="h-8 ml-2"
          >
            Source
          </Button>
        </div>
        {/* Template Snippets */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600 mr-2">Templates:</span>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => insertTemplate(templates.heading)}
            className="h-8 text-xs"
          >
            Heading
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => openTemplateEditor("code")}
            className="h-8 text-xs"
          >
            Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => insertTemplate(templates.list)}
            className="h-8 text-xs"
          >
            List
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => openTemplateEditor("tabs")}
            className="h-8 text-xs"
          >
            Tabs
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => openTemplateEditor("quiz")}
            className="h-8 text-xs"
          >
            Quiz
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => openTemplateEditor("codeBlock")}
            className="h-8 text-xs"
          >
            CodeBlock
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`min-h-[500px] ${viewMode === "split" ? "flex" : ""}`}>
        {/* Editor Pane */}
        {(viewMode === "editor" || viewMode === "split") && (
          <div
            className={`${viewMode === "split" ? "w-1/2 border-r" : "w-full"}`}
          >
            {showSource ? (
              <div className="p-4">
                <label className="text-sm font-medium">Raw MDX Source</label>
                <textarea
                  aria-label="mdx-source"
                  value={markdown}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full h-[400px] mt-2 p-2 border rounded"
                />
              </div>
            ) : (
              <MDXEditor
                ref={ref}
                markdown={markdown || ""}
                onChange={onChange}
                placeholder={placeholder}
                contentEditableClassName="min-h-[400px] p-4 focus:outline-none"
                plugins={[
                  // Core plugins
                  headingsPlugin(),
                  listsPlugin(),
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
                  markdownShortcutPlugin(),
                  // Toolbar
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
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
                      </>
                    ),
                  }),
                ]}
              />
            )}
          </div>
        )}

        {/* Preview Pane */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`${viewMode === "split" ? "w-1/2" : "w-full"} bg-white`}
          >
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700">
                Live Preview
              </h3>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {markdown ? (
                <MDXContent content={markdown} />
              ) : (
                <div className="text-gray-500 italic">
                  No content to preview
                </div>
              )}
            </div>

            {/* Template editor modal */}
            {templateModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Edit Template</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTemplateModalOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm font-medium">
                      Template Source
                    </label>
                    <textarea
                      value={templateModalValue}
                      onChange={(e) => setTemplateModalValue(e.target.value)}
                      className="w-full h-56 mt-2 p-2 border rounded"
                    />
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setTemplateModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveTemplateFromModal}>Insert</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
