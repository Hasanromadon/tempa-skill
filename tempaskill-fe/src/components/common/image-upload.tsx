"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  folder?: "images" | "thumbnails" | "avatars" | "lessons";
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({
  folder = "images",
  onUploadComplete,
  currentImageUrl,
  maxSizeMB = 5,
  className = "",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update preview when currentImageUrl changes (from parent)
  useEffect(() => {
    if (currentImageUrl && currentImageUrl !== preview) {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl, preview]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Reset error
      setError(null);

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`Ukuran file maksimal ${maxSizeMB}MB`);
        return;
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Format file harus JPG, PNG, GIF, atau WebP");
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      try {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await apiClient.post<{
          message: string;
          data: {
            url: string;
            filename: string;
            size: number;
            mime_type: string;
          };
        }>(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Update preview with final URL from server
        const finalUrl = response.data.data.url;
        setPreview(finalUrl);

        // Call success callback with uploaded URL
        onUploadComplete(finalUrl);
      } catch (err) {
        console.error("Upload error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Gagal mengupload gambar. Silakan coba lagi.";
        setError(errorMessage);
        setPreview(currentImageUrl || null); // Revert preview
      } finally {
        setUploading(false);
      }
    },
    [folder, maxSizeMB, onUploadComplete, currentImageUrl]
  );

  // @ts-expect-error - react-dropzone type compatibility issue
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: uploading,
    multiple: false,
  });

  const removeImage = () => {
    setPreview(null);
    setError(null);
    onUploadComplete("");
  };

  return (
    <div className={className}>
      {/* Preview or Upload Area */}
      {preview ? (
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
          />

          {/* Overlay with Remove Button */}
          <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              disabled={uploading}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Hapus Gambar
            </Button>
          </div>

          {/* Uploading Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Mengupload...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${
              isDragActive
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
            }
            ${uploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {/* @ts-expect-error - react-dropzone types issue */}
          <input {...getInputProps()} />{" "}
          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
                <p className="text-sm text-gray-600">Mengupload gambar...</p>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <>
                    <Upload className="h-12 w-12 text-orange-600" />
                    <p className="text-sm font-medium text-orange-600">
                      Lepaskan file di sini...
                    </p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Drag & drop gambar di sini, atau klik untuk memilih
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, GIF, WebP (Maks. {maxSizeMB}MB)
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Helper Text */}
      {!preview && !error && (
        <p className="text-xs text-gray-500 mt-2">
          Gambar akan otomatis diupload ke Firebase Storage
        </p>
      )}
    </div>
  );
}
