"use client";

import React, { memo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import Image from "next/image";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  toolName: string;
  toolUrl: string;
}

export const ImageViewerModal = memo(function ImageViewerModal({ isOpen, onClose, imageUrl, toolName, toolUrl }: ImageViewerModalProps) {
  // Memoized callback for opening tool
  const handleOpenTool = useCallback(() => {
    window.open(toolUrl, "_blank");
  }, [toolUrl]);

  // Don't render anything if no imageUrl
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[80vh] h-[70vh] p-0 overflow-hidden border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Xem hình ảnh của {toolName}</DialogTitle>
        </DialogHeader>

        {/* Header - Fixed height */}
        <div className="flex items-center justify-between p-4 border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10 min-h-[60px]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate flex-1">{toolName}</h2>
            <Button variant="outline" size="sm" onClick={handleOpenTool} className="flex items-center gap-1 shrink-0">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Truy cập tool</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 ml-2 shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Container - Optimized dimensions */}
        {isOpen && (
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-1 min-h-0">
            <div className="relative w-full h-full max-w-5xl mx-auto p-6">
              <div className="relative w-full h-full min-h-[60vh] max-h-[75vh]">
                <Image
                  src={imageUrl}
                  alt={toolName}
                  fill
                  className="object-contain drop-shadow-lg"
                  priority={isOpen}
                  sizes="(max-width: 1536px) 95vw, 1536px"
                  quality={90}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer - Fixed height */}
        <div className="p-3 bg-gray-50/80 backdrop-blur-sm border-t text-center min-h-[48px] flex items-center justify-center">
          <p className="text-sm text-gray-600">
            Nhấn <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">ESC</kbd> hoặc click bên ngoài để đóng
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
});
