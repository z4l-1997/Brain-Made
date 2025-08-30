"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Tool } from "@/lib/db/schema/tools";
import { ToolStatus, ToolCategory } from "@/lib/db/schema/tools";
import { Edit, Trash2, ExternalLink, Star, Search } from "lucide-react";

interface ToolsListProps {
  tools: Tool[];
  onEdit: (tool: Tool) => void;
  onDelete: (toolId: string) => Promise<void>;
}

export function ToolsList({ tools, onEdit, onDelete }: ToolsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Helper function to get category display names
  const getCategoryDisplayName = (category: ToolCategory): string => {
    switch (category) {
      case ToolCategory.DEVELOPER_TOOLS:
        return "🔧 Developer Tools";
      case ToolCategory.DESIGN_TOOLS:
        return "🎨 Design Tools";
      case ToolCategory.IMAGE_MEDIA_TOOLS:
        return "📸 Image & Media Tools";
      case ToolCategory.SEO_ANALYTICS_TOOLS:
        return "📊 SEO & Analytics Tools";
      case ToolCategory.PRODUCTIVITY_UTILITIES:
        return "⚡ Productivity & Utilities";
      case ToolCategory.LEARNING_REFERENCE:
        return "📚 Learning & Reference";
      default:
        return category;
    }
  };

  // Get unique categories from tools
  const categories = Array.from(new Set(tools.map((tool) => tool.category)));

  // Filter tools
  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    const matchesStatus = !selectedStatus || tool.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusVariants = {
      [ToolStatus.ACTIVE]: "default",
      [ToolStatus.INACTIVE]: "destructive",
      [ToolStatus.PENDING]: "secondary",
    } as const;

    return <Badge variant={statusVariants[status as ToolStatus] || "outline"}>{status}</Badge>;
  };

  const handleDelete = async (toolId: string, toolTitle: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tool "${toolTitle}"?`)) {
      await onDelete(toolId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm tools theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {getCategoryDisplayName(category as ToolCategory)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus || "all"} onValueChange={(value) => setSelectedStatus(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value={ToolStatus.ACTIVE}>✅ Active</SelectItem>
                <SelectItem value={ToolStatus.INACTIVE}>❌ Inactive</SelectItem>
                <SelectItem value={ToolStatus.PENDING}>⏳ Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-medium">{filteredTools.length}</span> trong tổng số{" "}
              <span className="font-medium">{tools.length}</span> tools
            </div>
            {(searchTerm || selectedCategory || selectedStatus) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedStatus("");
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      {filteredTools.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-all duration-200 group">
              {/* Tool Image */}
              {tool.image && (
                <div className="h-48 bg-gray-100 rounded-t-lg overflow-hidden relative">
                  <Image
                    src={tool.image}
                    alt={tool.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <CardContent className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{tool.title}</h3>
                    {tool.featured && (
                      <Badge variant="default" className="text-xs bg-yellow-500 hover:bg-yellow-600">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(tool)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tool.id, tool.title)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status and Category */}
                <div className="flex justify-between items-center mb-3">
                  {getStatusBadge(tool.status)}
                  <Badge variant="outline" className="text-xs">
                    {getCategoryDisplayName(tool.category as ToolCategory)}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tool.descriptionVi || tool.description}</p>

                {/* URL and Actions */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(tool.url, "_blank")}
                    className="h-8 w-full hover:bg-blue-50 hover:border-blue-300"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visit Tool
                  </Button>
                </div>

                {/* Created info */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Tạo ngày: {new Date(tool.createdAt).toLocaleDateString("vi-VN")}
                    {tool.updatedAt !== tool.createdAt && (
                      <span className="ml-2">• Cập nhật: {new Date(tool.updatedAt).toLocaleDateString("vi-VN")}</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            {tools.length === 0 ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-gray-600 text-lg font-medium mb-2">Chưa có tools nào</div>
                <p className="text-gray-500 text-center max-w-md">Hãy tạo tool đầu tiên để bắt đầu xây dựng bộ sưu tập của bạn</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-gray-600 text-lg font-medium mb-2">Không tìm thấy tools nào</div>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy tools phù hợp
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedStatus("");
                  }}
                >
                  Xóa tất cả bộ lọc
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
