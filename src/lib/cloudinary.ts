import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImage(file: File | string, folder: string = "toolkit"): Promise<CloudinaryUploadResult> {
  try {
    let uploadData: string | Buffer;

    if (typeof file === "string") {
      uploadData = file;
    } else {
      const bytes = await file.arrayBuffer();
      uploadData = Buffer.from(bytes);
    }

    const result = await cloudinary.uploader.upload(
      typeof uploadData === "string"
        ? uploadData
        : `data:${file instanceof File ? file.type : "image/jpeg"};base64,${uploadData.toString("base64")}`,
      {
        folder: `brain-made/${folder}`,
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      }
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw new Error("Failed to delete image");
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  const { width = 400, height = 300, crop = "fill", quality = "auto", format = "auto" } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format,
  });
}

export default cloudinary;
