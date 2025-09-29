'use client';

import { useState, useRef } from 'react';
import { FiCamera, FiX, FiUpload } from 'react-icons/fi';

interface ImageUploadProps {
  onImageUpload: (url: string | null) => void;
  currentImage?: string | null;
  userId: string;
  disabled?: boolean;
  className?: string;
  bucket?: 'trade-screenshots' | 'strategy-images' | 'journal-images';
  label?: string;
  description?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onImageUpload,
  currentImage,
  userId,
  disabled = false,
  className = '',
  bucket = 'trade-screenshots',
  label = 'Trade Screenshot (Optional)',
  description = 'PNG, JPG up to 10MB',
  maxSizeMB = 10
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveImage = async () => {
    if (currentImage && currentImage.includes('backblazeb2.com')) {
      try {
        // Extract filename from URL for deletion
        const urlParts = currentImage.split('/');
        const fileName = urlParts[urlParts.length - 1];

        await fetch(`/api/upload?fileName=${fileName}&bucket=${bucket}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    onImageUpload(null);
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      }

      if (file.size > maxSizeBytes) {
        throw new Error(`File size too large. Please upload an image smaller than ${maxSizeMB}MB.`);
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      onImageUpload(result.url);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Uploaded image"
            className="w-full h-32 object-cover rounded-md border border-slate-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            disabled={disabled || uploading}
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center hover:border-slate-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFileDialog}
        >
          {uploading ? (
            <>
              <FiUpload className="mx-auto h-8 w-8 text-blue-500 mb-2 animate-pulse" />
              <p className="text-sm text-blue-600 mb-2">Uploading...</p>
            </>
          ) : (
            <>
              <FiCamera className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-400">{description}</p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}

