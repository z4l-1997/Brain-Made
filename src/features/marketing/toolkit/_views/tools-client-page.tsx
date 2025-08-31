"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Eye } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Tool, ToolCategory } from "@/lib/db/schema/tools";

// Lazy load modal component
const ImageViewerModal = dynamic(() => import("../_components/image-viewer-modal").then((mod) => ({ default: mod.ImageViewerModal })), {
  ssr: false,
});

interface ToolsData {
  tools: Tool[];
  total: number;
}

interface ToolsClientPageProps {
  initialData: ToolsData;
}

// Category display names mapping - Memoized
const CATEGORY_DISPLAY_NAMES = {
  "developer-tools": "Developer Tools",
  "design-tools": "Design Tools",
  "image-media-tools": "Image & Media",
  "seo-analytics-tools": "SEO & Analytics",
  "productivity-utilities": "Productivity",
  "learning-reference": "Learning & Reference",
} as const;

const getCategoryDisplayName = (category: ToolCategory): string => {
  return CATEGORY_DISPLAY_NAMES[category] || category;
};

// Category colors for badges - Memoized
const CATEGORY_COLORS = {
  "developer-tools": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "design-tools": "bg-purple-100 text-purple-800 hover:bg-purple-200",
  "image-media-tools": "bg-green-100 text-green-800 hover:bg-green-200",
  "seo-analytics-tools": "bg-orange-100 text-orange-800 hover:bg-orange-200",
  "productivity-utilities": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  "learning-reference": "bg-pink-100 text-pink-800 hover:bg-pink-200",
} as const;

const getCategoryColor = (category: ToolCategory): string => {
  return CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

// Image skeleton component - Memoized
const ImageSkeleton = memo(() => (
  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center shadow-sm">
    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-lg"></div>
  </div>
));

ImageSkeleton.displayName = "ImageSkeleton";

// Tool image component with fallback
const ToolImage = memo(
  ({ src, alt, title, onImageClick }: { src?: string | null; alt: string; title: string; onImageClick?: () => void }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleLoad = useCallback(() => setImageLoading(false), []);
    const handleError = useCallback(() => {
      setImageError(true);
      setImageLoading(false);
    }, []);

    if (!src || imageError) {
      return <ImageSkeleton />;
    }

    return (
      <div className="relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 group">
        {imageLoading && (
          <div className="absolute inset-0 z-10">
            <ImageSkeleton />
          </div>
        )}
        <div
          className="relative w-full h-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
          onClick={onImageClick}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${imageLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={handleLoad}
            onError={handleError}
            sizes="(max-width: 1024px) 80px, 96px"
            loading="lazy"
            quality={85}
          />
          {/* Hover overlay với icon xem */}
          <div className="absolute inset-0 bg-transparent hover:bg-gradient-to-t hover:from-blue-600/60 hover:to-blue-400/30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Eye className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ToolImage.displayName = "ToolImage";

// Memoized ToolItem component for list view
const ToolItem = memo(({ tool, index }: { tool: Tool; index: number }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  // Memoized callbacks to prevent re-renders
  const handleImageClick = useCallback(() => {
    if (tool.image) setShowImageModal(true);
  }, [tool.image]);

  const handleCloseModal = useCallback(() => {
    setShowImageModal(false);
  }, []);

  const handleToolAccess = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      window.open(tool.url, "_blank");
    },
    [tool.url]
  );

  // Memoized category badge class
  const categoryBadgeClass = useMemo(() => `text-xs ${getCategoryColor(tool.category as ToolCategory)}`, [tool.category]);

  // Memoized description
  const description = useMemo(() => tool.descriptionVi || tool.description, [tool.descriptionVi, tool.description]);

  // Memoized hostname
  const hostname = useMemo(() => {
    try {
      return new URL(tool.url).hostname;
    } catch {
      return tool.url;
    }
  }, [tool.url]);

  return (
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
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Tool Image */}
          <div className="flex-shrink-0 self-start">
            <ToolImage src={tool.image} alt={tool.title} title={tool.title} onImageClick={handleImageClick} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header with badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary" className={categoryBadgeClass}>
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
            <h3 className="text-xl font-semibold mb-3 text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
              {tool.title}
            </h3>

            {/* Full description */}
            <div className="text-gray-700 text-sm leading-relaxed mb-4">
              <p className="whitespace-pre-line line-clamp-3 lg:line-clamp-none">{description}</p>
            </div>

            {/* Domain info */}
            <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <span>🌐</span>
              <span className="truncate">{hostname}</span>
            </div>
          </div>

          {/* Right side - Action button */}
          <div className="flex-shrink-0 self-start lg:self-center">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleToolAccess}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md w-full lg:w-auto justify-center"
            >
              <span>Truy cập tool</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </a>
          </div>
        </div>

        {/* Image Viewer Modal - Only render when needed */}
        {tool.image && showImageModal && (
          <ImageViewerModal
            isOpen={showImageModal}
            onClose={handleCloseModal}
            imageUrl={tool.image}
            toolName={tool.title}
            toolUrl={tool.url}
          />
        )}
      </div>
    </motion.div>
  );
});

ToolItem.displayName = "ToolItem";

// Loading skeleton component for list view - Memoized
const LoadingSkeleton = memo(() => (
  <div className="space-y-6">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="border-b border-gray-200 pb-6">
        <div className="animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Image skeleton */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-xl shadow-sm"></div>
            </div>

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
              </div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex-shrink-0">
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

export default function ToolsClientPage({ initialData }: ToolsClientPageProps) {
  const [tools, setTools] = useState<Tool[]>(initialData.tools);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialData.total);

  // Memoized function để fetch tools với AbortController
  const fetchTools = useCallback(async (pageNum = 1, limit = 20) => {
    setLoading(true);
    const controller = new AbortController();

    try {
      const response = await fetch(`/api/marketing/tools?page=${pageNum}&limit=${limit}`, { signal: controller.signal });
      const data = await response.json();

      if (data.success) {
        setTools(data.data);
        setTotal(data.pagination.total);
        setPage(pageNum);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("Error fetching tools:", error);
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
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

  // Stats by category - Optimized calculation
  const statsByCategory = useMemo(() => {
    return tools.reduce((acc, tool) => {
      const category = tool.category as ToolCategory;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<ToolCategory, number>);
  }, [tools]);

  // Memoized stats values
  const featuredCount = useMemo(() => tools.filter((tool) => tool.featured).length, [tools]);

  const categoriesCount = useMemo(() => Object.keys(statsByCategory).length, [statsByCategory]);

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
            <div className="text-2xl font-bold text-green-600">{featuredCount}</div>
            <div className="text-sm text-gray-500">Featured</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{categoriesCount}</div>
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
