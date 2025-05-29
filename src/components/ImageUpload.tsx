'use client';

import { useState, useRef } from 'react';
import { FiCamera, FiX, FiUpload } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
  onImageUpload: (url: string | null) => void;
  currentImage?: string | null;
  userId: string;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({
  onImageUpload,
  currentImage,
  userId,
  disabled = false,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload the file directly - no need to check bucket existence
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('trade-screenshots')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing files
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image';

      // Handle specific Supabase storage errors
      if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
        errorMessage = 'Storage bucket "trade-screenshots" not found. Please create it in your Supabase Dashboard under Storage section.';
      } else if (error.message?.includes('policy') || error.message?.includes('permission') || error.message?.includes('RLS')) {
        errorMessage = 'Permission denied. Please check storage permissions and RLS policies.';
      } else if (error.message?.includes('size') || error.message?.includes('too large')) {
        errorMessage = 'File too large. Maximum size is 10MB.';
      } else if (error.message?.includes('Invalid file type') || error.message?.includes('mime')) {
        errorMessage = 'Invalid file type. Please upload a valid image file.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    const url = await uploadImage(file);
    onImageUpload(url);
  };

  const handleRemoveImage = () => {
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">
        Trade Screenshot (Optional)
      </label>

      {currentImage ? (
        <div className="relative">
          <div className="w-full max-w-md border border-slate-300 rounded-lg overflow-hidden">
            <img
              src={currentImage}
              alt="Trade screenshot"
              className="w-full h-48 object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled || uploading}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin mb-2"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FiCamera className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Upload Screenshot</span>
                <span className="text-xs">PNG, JPG up to 10MB</span>
              </div>
            )}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
