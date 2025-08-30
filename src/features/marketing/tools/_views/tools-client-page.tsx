"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star } from "lucide-react";
import type { Tool, ToolCategory } from "@/lib/db/schema/tools";

interface ToolsData {
  tools: Tool[];
  total: number;
}

interface ToolsClientPageProps {
  initialData: ToolsData;
}

// Category display names mapping
const getCategoryDisplayName = (category: ToolCategory): string => {
  const categoryNames = {
    "developer-tools": "Developer Tools",
    "design-tools": "Design Tools",
    "image-media-tools": "Image & Media",
    "seo-analytics-tools": "SEO & Analytics",
    "productivity-utilities": "Productivity",
    "learning-reference": "Learning & Reference",
  };
  return categoryNames[category] || category;
};

// Category colors for badges
const getCategoryColor = (category: ToolCategory): string => {
  const categoryColors = {
    "developer-tools": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "design-tools": "bg-purple-100 text-purple-800 hover:bg-purple-200",
    "image-media-tools": "bg-green-100 text-green-800 hover:bg-green-200",
    "seo-analytics-tools": "bg-orange-100 text-orange-800 hover:bg-orange-200",
    "productivity-utilities": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    "learning-reference": "bg-pink-100 text-pink-800 hover:bg-pink-200",
  };
  return categoryColors[category] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

// Memoized ToolItem component for list view
const ToolItem = React.memo(({ tool, index }: { tool: Tool; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: 0.3,
      delay: Math.min(index * 0.03, 0.4),
      ease: "easeOut",
    }}
    whileHover={{ x: 4 }}
    className="w-full"
  >
    <div className="border-b border-gray-200 hover:border-gray-300 pb-6 mb-6 hover:bg-gray-50/50 transition-all duration-200 rounded-lg p-4 -m-4">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Left side - Main content */}
        <div className="flex-1">
          {/* Header with badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="secondary" className={`text-xs ${getCategoryColor(tool.category as ToolCategory)}`}>
              {getCategoryDisplayName(tool.category as ToolCategory)}
            </Badge>
            {tool.featured && (
              <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-3 text-gray-900 hover:text-blue-600 transition-colors duration-200">{tool.title}</h3>

          {/* Full description */}
          <div className="text-gray-700 text-sm leading-relaxed mb-4">
            <p className="whitespace-pre-line">{tool.descriptionVi || tool.description}</p>
          </div>

          {/* Domain info */}
          <div className="text-xs text-gray-500 mb-3">🌐 {new URL(tool.url).hostname}</div>
        </div>

        {/* Right side - Action button */}
        <div className="lg:ml-6 flex-shrink-0">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md"
          >
            <span>Truy cập tool</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </div>
  </motion.div>
));

ToolItem.displayName = "ToolItem";

// Loading skeleton component for list view
const LoadingSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="border-b border-gray-200 pb-6">
        <div className="animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                <div className="h-5 bg-gray-200 rounded-full w-24"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded mb-3 w-2/3"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                <div className="h-4 bg-gray-200 rounded w-3/6"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="lg:ml-6 flex-shrink-0">
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function ToolsClientPage({ initialData }: ToolsClientPageProps) {
  const [tools, setTools] = useState<Tool[]>(initialData.tools);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialData.total);

  // Memoized function để fetch tools
  const fetchTools = useCallback(async (pageNum = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketing/tools?page=${pageNum}&limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setTools(data.data);
        setTotal(data.pagination.total);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized values
  const totalPages = useMemo(() => Math.ceil(total / 20), [total]);
  const isPrevDisabled = useMemo(() => page === 1 || loading, [page, loading]);
  const isNextDisabled = useMemo(() => page >= totalPages || loading, [page, totalPages, loading]);

  // Navigation handlers
  const handlePrevPage = useCallback(() => {
    if (!isPrevDisabled) {
      fetchTools(page - 1);
    }
  }, [fetchTools, page, isPrevDisabled]);

  const handleNextPage = useCallback(() => {
    if (!isNextDisabled) {
      fetchTools(page + 1);
    }
  }, [fetchTools, page, isNextDisabled]);

  // Stats by category
  const statsByCategory = useMemo(() => {
    const stats = tools.reduce((acc, tool) => {
      const category = tool.category as ToolCategory;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<ToolCategory, number>);
    return stats;
  }, [tools]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Brain Made Tools</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Khám phá bộ sưu tập công cụ tốt nhất cho developers, designers và các chuyên gia khác
        </p>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{total}</div>
            <div className="text-sm text-gray-500">Total Tools</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{tools.filter((tool) => tool.featured).length}</div>
            <div className="text-sm text-gray-500">Featured</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Object.keys(statsByCategory).length}</div>
            <div className="text-sm text-gray-500">Categories</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tools List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <LoadingSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {tools.map((tool, index) => (
              <ToolItem key={tool.id} tool={tool} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="flex justify-center items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <button
            onClick={handlePrevPage}
            disabled={isPrevDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Trang trước
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Trang {page} / {totalPages}
            </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={isNextDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Trang sau
          </button>
        </motion.div>
      )}
    </div>
  );
}
