"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { ImagePreviewModal } from "./image-preview-modal";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  disabled?: boolean;
  className?: string;
  toolName?: string;
  toolUrl?: string;
}

export function ImageUpload({ value, onChange, folder = "tools", disabled = false, className, toolName, toolUrl }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File phải nhỏ hơn 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      onChange(result.data.secure_url);
      toast.success("Upload hình ảnh thành công");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload thất bại. Vui lòng thử lại.");
      setPreview(value || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="image-upload">Hình ảnh công cụ</Label>

      {preview ? (
        <div className="relative group">
          <div
            className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => setShowPreviewModal(true)}
          >
            <Image src={preview} alt="Preview" fill className="object-cover" />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            {/* Hover overlay với icon xem */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Eye className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          {!disabled && !isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Đang upload...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 mb-2" />
                <p className="text-sm text-center">
                  Kéo thả hình ảnh vào đây hoặc <span className="text-blue-500 hover:text-blue-600">chọn file</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 5MB</p>
              </>
            )}
          </div>
        </div>
      )}

      <Input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Chọn hình ảnh
        </Button>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        imageUrl={preview || ""}
        imageAlt={toolName || "Tool preview"}
        toolName={toolName}
        toolUrl={toolUrl}
      />
    </div>
  );
}
