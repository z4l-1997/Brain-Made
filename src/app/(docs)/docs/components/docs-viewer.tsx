"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, Menu, X, Folder, FolderOpen, Clock } from "lucide-react";

interface DocFile {
  name: string;
  path: string;
  relativePath: string;
  content: string;
  frontmatter: Record<string, unknown>;
  category?: string;
  lastModified: string;
}

interface DocsResponse {
  docs: DocFile[];
  groupedDocs: Record<string, DocFile[]>;
  categories: string[];
  totalFiles: number;
}

export default function DocsViewer() {
  const [docsData, setDocsData] = useState<DocsResponse | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/docs");
      if (!response.ok) {
        throw new Error("Failed to load docs");
      }

      const data: DocsResponse = await response.json();
      setDocsData(data);

      // Expand all categories by default
      setExpandedCategories(new Set(data.categories));

      // Select first doc by default
      if (data.docs.length > 0) {
        setSelectedDoc(data.docs[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documentation");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documentation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Error loading docs</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDocs} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!docsData) {
    return null;
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {selectedDoc ? (
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Document header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-2 text-sm text-blue-600 mb-2">
                <Folder className="h-4 w-4" />
                <span>{selectedDoc.category}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-500">{selectedDoc.path}</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {typeof selectedDoc.frontmatter?.title === "string" ? selectedDoc.frontmatter.title : selectedDoc.name}
              </h1>

              {typeof selectedDoc.frontmatter?.description === "string" && (
                <p className="text-gray-600 text-lg mb-3">{selectedDoc.frontmatter.description}</p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {formatDate(selectedDoc.lastModified)}</span>
                </div>
                {typeof selectedDoc.frontmatter?.date === "string" && (
                  <div className="flex items-center space-x-1">
                    <span>•</span>
                    <span>Created: {formatDate(selectedDoc.frontmatter.date)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document content */}
            <div className="px-8 py-8">
              <div className="prose prose-lg prose-blue max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">{children}</h1>
                    ),
                    h2: ({ children }) => <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">{children}</h3>,
                    code: ({ className, children, ...props }: React.ComponentProps<"code">) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto" {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6">{children}</pre>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-400 pl-4 py-2 my-6 bg-blue-50 italic">{children}</blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="min-w-full border border-gray-300 rounded-lg">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">{children}</th>
                    ),
                    td: ({ children }) => <td className="border border-gray-300 px-4 py-2">{children}</td>,
                  }}
                >
                  {selectedDoc.content}
                </ReactMarkdown>
              </div>
            </div>
          </article>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No documentation selected</h2>
            <p className="text-gray-600">Select a document from the sidebar to get started.</p>
          </div>
        )}
      </div>
    </main>
  );
}
