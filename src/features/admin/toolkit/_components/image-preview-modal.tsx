"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import Image from "next/image";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt: string;
  toolName?: string;
  toolUrl?: string;
}

export function ImagePreviewModal({ isOpen, onClose, imageUrl, imageAlt, toolName, toolUrl }: ImagePreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {toolName ? (
                <>
                  <span>Hình ảnh: {toolName}</span>
                  {toolUrl && (
                    <Button variant="outline" size="sm" onClick={() => window.open(toolUrl, "_blank")} className="ml-2">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Xem tool
                    </Button>
                  )}
                </>
              ) : (
                "Xem trước hình ảnh"
              )}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="relative w-full h-[60vh] bg-gray-50 rounded-lg overflow-hidden border">
            <Image src={imageUrl} alt={imageAlt} fill className="object-contain" priority sizes="(max-width: 1200px) 100vw, 1200px" />
          </div>

          {/* Image info */}
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>Nhấn vào bên ngoài hoặc ESC để đóng</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
