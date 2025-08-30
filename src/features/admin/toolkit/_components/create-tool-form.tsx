"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolStatus, ToolCategory, type NewTool } from "@/lib/db/schema/tools";

interface CreateToolFormProps {
  open: boolean;
  onSubmit: (data: Omit<NewTool, "id" | "createdAt" | "updatedAt" | "createdBy">) => Promise<void>;
  onCancel: () => void;
}

export function CreateToolForm({ open, onSubmit, onCancel }: CreateToolFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    descriptionVi: "",
    url: "",
    category: "" as ToolCategory | "",
    featured: false,
    image: "",
    status: ToolStatus.ACTIVE,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate category is selected
    if (!formData.category) {
      console.error("Category is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        category: formData.category as ToolCategory,
      });
      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        descriptionVi: "",
        url: "",
        category: "",
        featured: false,
        image: "",
        status: ToolStatus.ACTIVE,
      });
    } catch (error) {
      console.error("Failed to create tool:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get category display names
  const getCategoryDisplayName = (category: ToolCategory): string => {
    switch (category) {
      case ToolCategory.DEVELOPER_TOOLS:
        return "🔧 Developer Tools - Công cụ lập trình";
      case ToolCategory.DESIGN_TOOLS:
        return "🎨 Design Tools - Công cụ thiết kế";
      case ToolCategory.IMAGE_MEDIA_TOOLS:
        return "📸 Image & Media Tools - Công cụ hình ảnh & media";
      case ToolCategory.SEO_ANALYTICS_TOOLS:
        return "📊 SEO & Analytics Tools - Công cụ SEO & phân tích";
      case ToolCategory.PRODUCTIVITY_UTILITIES:
        return "⚡ Productivity & Utilities - Tiện ích & năng suất";
      case ToolCategory.LEARNING_REFERENCE:
        return "📚 Learning & Reference - Học tập & tham khảo";
      default:
        return category;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tạo Tool Mới</DialogTitle>
          <DialogDescription>
            Thêm một tool mới vào bộ sưu tập. Điền đầy đủ thông tin để giúp người dùng khác dễ dàng tìm thấy và sử dụng.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
                <p className="text-sm text-muted-foreground">Thông tin chính về tool</p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Tên Tool *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Visual Studio Code"
                  required
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="url">URL Tool *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://code.visualstudio.com"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as ToolCategory })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ToolCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryDisplayName(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-medium">Mô tả</h3>
                <p className="text-sm text-muted-foreground">Mô tả chi tiết về chức năng và tính năng</p>
              </div>

              {/* Description English */}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả (English) *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the tool's features and functionality in English..."
                  required
                  rows={3}
                />
              </div>

              {/* Description Vietnamese */}
              <div className="space-y-2">
                <Label htmlFor="descriptionVi">Mô tả (Tiếng Việt)</Label>
                <Textarea
                  id="descriptionVi"
                  value={formData.descriptionVi}
                  onChange={(e) => setFormData({ ...formData, descriptionVi: e.target.value })}
                  placeholder="Mô tả các tính năng và chức năng của tool bằng tiếng Việt..."
                  rows={3}
                />
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-medium">Hình ảnh</h3>
                <p className="text-sm text-muted-foreground">Thông tin bổ sung về tool</p>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image">URL Hình ảnh</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">Logo hoặc screenshot của tool</p>
              </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-medium">Cài đặt</h3>
                <p className="text-sm text-muted-foreground">Trạng thái và hiển thị của tool</p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as ToolStatus })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ToolStatus.ACTIVE}>✅ Active - Hiển thị công khai</SelectItem>
                    <SelectItem value={ToolStatus.PENDING}>⏳ Pending - Chờ duyệt</SelectItem>
                    <SelectItem value={ToolStatus.INACTIVE}>❌ Inactive - Ẩn khỏi danh sách</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Featured */}
              <div className="space-y-3">
                <Label>Hiển thị ưu tiên</Label>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                      Tool nổi bật ⭐
                    </Label>
                    <p className="text-xs text-muted-foreground">Hiển thị trong danh sách nổi bật</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="border-t pt-6">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 sm:flex-none sm:min-w-[120px]"
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none sm:min-w-[120px]">
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo Tool"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
