"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tool } from "@/lib/db/schema/tools";

interface ToolsData {
  tools: Tool[];
  total: number;
}

interface ToolsClientPageProps {
  initialData: ToolsData;
}

// Memoized ToolItem component để tránh re-render không cần thiết
const ToolItem = React.memo(({ tool, index }: { tool: Tool; index: number }) => (
  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block">
    <motion.div
      className="border-b border-gray-200 pb-3 cursor-pointer"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.2,
        delay: Math.min(index * 0.02, 0.3), // Giới hạn delay tối đa
        ease: "easeOut",
      }}
      whileHover={{ x: 2 }} // Giảm animation hover
      layout={false} // Tắt layout animation để tăng performance
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-1 hover:text-blue-600 transition-colors duration-200">{tool.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{tool.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{tool.category}</span>
            <span>⭐ {tool.rating}</span>
            <div className="flex gap-1">
              {tool.tags.slice(0, 3).map((tag, tagIndex) => (
                <span key={tagIndex} className="bg-gray-100 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors duration-150">
                  {tag}
                </span>
              ))}
              {tool.tags.length > 3 && <span className="text-xs text-gray-400">+{tool.tags.length - 3}</span>}
            </div>
          </div>
        </div>
        <div className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium hover:translate-x-0.5 transition-all duration-200">
          Visit →
        </div>
      </div>
    </motion.div>
  </a>
));

ToolItem.displayName = "ToolItem";

export default function ToolsClientPage({ initialData }: ToolsClientPageProps) {
  const [tools, setTools] = useState<Tool[]>(initialData.tools);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialData.total);

  // Memoized function để tránh tạo lại function mỗi lần render
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

  // Memoized values để tránh tính toán lại mỗi lần render
  const totalPages = useMemo(() => Math.ceil(total / 20), [total]);
  const isPrevDisabled = useMemo(() => page === 1 || loading, [page, loading]);
  const isNextDisabled = useMemo(() => page >= totalPages || loading, [page, totalPages, loading]);

  // Memoized navigation handlers
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

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Tools Directory
      </motion.h1>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Loading...
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tools.map((tool, index) => (
              <ToolItem key={tool.id} tool={tool} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="mt-8 flex justify-between items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="text-sm text-gray-500">Total: {total} tools</div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={isPrevDisabled}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors duration-150"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={isNextDisabled}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors duration-150"
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>
  );
}
