"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreateToolForm } from "../../../../features/admin/toolkit/_components/create-tool-form";
import { ToolsList } from "../../../../features/admin/toolkit/_components/tools-list";
import { createToolAction, deleteToolAction } from "../actions";
import { getAllTools, getToolsStats } from "../_db/queries";
import type { Tool, NewTool } from "@/lib/db/schema/tools";
import { Plus, TrendingUp, Star, Database, Activity, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TookitAdminClientPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    featured: 0,
    categories: 0,
  });

  // Animated counter hook
  const useAnimatedCounter = (end: number, duration = 1000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTime: number;
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));

        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };

      if (end > 0) {
        requestAnimationFrame(animateCount);
      }
    }, [end, duration]);

    return count;
  };

  // Memoized stats cards configuration
  const statsConfig = useMemo(
    () => [
      {
        key: "total",
        label: "Tổng Tools",
        icon: Database,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        description: "Tổng số tools trong hệ thống",
      },
      {
        key: "active",
        label: "Active",
        icon: Activity,
        color: "text-green-500",
        bgColor: "bg-green-50",
        description: "Tools đang hoạt động",
      },
      {
        key: "featured",
        label: "Featured",
        icon: Star,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        description: "Tools nổi bật",
      },
      {
        key: "pending",
        label: "Pending",
        icon: TrendingUp,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        description: "Tools chờ duyệt",
      },
      {
        key: "inactive",
        label: "Inactive",
        icon: "custom-inactive",
        color: "text-red-500",
        bgColor: "bg-red-50",
        description: "Tools không hoạt động",
      },
      {
        key: "categories",
        label: "Categories",
        icon: "custom-categories",
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        description: "Số danh mục khác nhau",
      },
    ],
    []
  );

  // Load tools and stats with optimized error handling
  const loadToolsData = useCallback(async (showRefreshLoader = false) => {
    try {
      setError(null);
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [toolsData, statsData] = await Promise.all([getAllTools(), getToolsStats()]);
      setTools(toolsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading tools:", error);
      const errorMessage = "Không thể tải danh sách tools. Vui lòng thử lại.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load tools and stats
  useEffect(() => {
    loadToolsData();
  }, [loadToolsData]);

  const handleCreateTool = useCallback(
    async (data: Omit<NewTool, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
      try {
        const result = await createToolAction(data);

        if (result.success) {
          toast.success("✅ Tạo tool thành công!");
          setShowCreateForm(false);
          // Optimistic update - add to local state first, then refresh
          await loadToolsData(true);
        } else {
          toast.error(result.error || "❌ Có lỗi xảy ra khi tạo tool");
        }
      } catch (error) {
        console.error("Error creating tool:", error);
        toast.error("❌ Có lỗi xảy ra khi tạo tool");
      }
    },
    [loadToolsData]
  );

  const handleDeleteTool = useCallback(
    async (toolId: string) => {
      try {
        const result = await deleteToolAction(toolId);

        if (result.success) {
          toast.success("🗑️ Xóa tool thành công!");
          // Optimistic update - remove from local state first
          setTools((prev) => prev.filter((tool) => tool.id !== toolId));
          await loadToolsData(true);
        } else {
          toast.error(result.error || "❌ Có lỗi xảy ra khi xóa tool");
        }
      } catch (error) {
        console.error("Error deleting tool:", error);
        toast.error("❌ Có lỗi xảy ra khi xóa tool");
      }
    },
    [loadToolsData]
  );

  const handleEditTool = useCallback((tool: Tool) => {
    setEditingTool(tool);
    toast.info("🚧 Chức năng edit đang được phát triển");
  }, []);

  const handleRefresh = useCallback(() => {
    loadToolsData(true);
  }, [loadToolsData]);

  // Error state component
  const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-red-700 text-lg font-medium mb-2">Có lỗi xảy ra</div>
            <p className="text-red-600 text-center max-w-md mb-4">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Tải lại trang
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tools List Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => loadToolsData()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">🛠️ Toolkit Management</h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                Quản lý và tổ chức các công cụ hữu ích cho cộng đồng
                {stats.total > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.total} tools • {stats.categories} categories
                  </Badge>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Đang tải..." : "Làm mới"}
              </Button>
              <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Tạo Tool Mới
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {statsConfig.map((config) => {
            const value = stats[config.key as keyof typeof stats];
            const AnimatedStatCard = () => {
              const animatedValue = useAnimatedCounter(value, 800);

              return (
                <Card
                  key={config.key}
                  className={`${config.bgColor} border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {config.icon === "custom-inactive" ? (
                          <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">!</span>
                          </div>
                        ) : config.icon === "custom-categories" ? (
                          <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">#</span>
                          </div>
                        ) : (
                          <config.icon className={`h-8 w-8 ${config.color}`} />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-600">{config.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{refreshing ? animatedValue : value}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{config.description}</p>
                  </CardContent>
                </Card>
              );
            };

            return <AnimatedStatCard key={config.key} />;
          })}
        </div>

        {/* Tools List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Suspense
            fallback={
              <div className="p-6">
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            }
          >
            <ToolsList tools={tools} onEdit={handleEditTool} onDelete={handleDeleteTool} />
          </Suspense>
        </div>

        {/* Create Form Modal */}
        <CreateToolForm open={showCreateForm} onSubmit={handleCreateTool} onCancel={() => setShowCreateForm(false)} />
      </div>
    </div>
  );
}
