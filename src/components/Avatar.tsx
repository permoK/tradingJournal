'use client';

import { useState } from 'react';
import { FiUser } from 'react-icons/fi';

interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-xl', 
  lg: 'h-16 w-16 text-2xl',
  xl: 'h-24 w-24 text-4xl'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8', 
  xl: 'w-12 h-12'
};

export default function Avatar({ 
  username, 
  avatarUrl, 
  size = 'md', 
  className = '',
  showFallback = true 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Show profile picture if available and not errored
  if (avatarUrl && !imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-slate-200 flex items-center justify-center relative ${className}`}>
        {imageLoading && (
          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
            <FiUser className={`${iconSizes[size]} text-slate-400`} />
          </div>
        )}
        <img
          src={avatarUrl}
          alt={`${username}'s profile picture`}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  // Fallback to letter-based avatar or user icon
  if (showFallback) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold ${className}`}>
        {username ? username.charAt(0).toUpperCase() : <FiUser className={iconSizes[size]} />}
      </div>
    );
  }

  // No fallback - return null
  return null;
}
