'use client';

import { useState } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';

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
  const handleRemoveImage = () => {
    onImageUpload(null);
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
            disabled={disabled}
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center">
          <FiCamera className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-500 mb-2">Image upload coming soon</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      )}

      {uploading && (
        <div className="text-sm text-blue-600">
          Uploading...
        </div>
      )}
    </div>
  );
}

