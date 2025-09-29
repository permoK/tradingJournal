'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/lib/hooks';
import { useNotifications } from '@/contexts/NotificationContext';
import { FiUser, FiCamera, FiSave, FiLoader } from 'react-icons/fi';
import Avatar from '@/components/Avatar';

export default function ProfileSettings() {
  const { user } = useAuth();
  const { profile, updateProfile, refreshProfile } = useProfile(user?.id);
  const { addNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      console.log('Profile loaded:', profile);
      setFormData({
        username: profile.username || '',
        fullName: profile.fullName || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAvatarError(null);

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setAvatarError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
        return;
      }

      // Validate file size (5MB max)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setAvatarError('File size too large. Please upload an image smaller than 5MB.');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Upload avatar if changed
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('file', avatarFile);

        const uploadResponse = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: avatarFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload avatar');
        }

        const uploadResult = await uploadResponse.json();
        // The avatar upload API already updates the profile, so we need to refresh the profile data
        await refreshProfile();

        // Reset the avatar state and show success
        setAvatarFile(null);
        setAvatarPreview(null);

        addNotification({
          type: 'success',
          title: 'Avatar Updated',
          message: 'Your profile picture has been successfully updated.',
        });
      }

      // Update other profile fields (excluding avatar since it's handled separately)
      const profileUpdates = { ...formData };
      delete profileUpdates.avatarUrl; // Don't override the avatar URL from the upload

      // Only include fields that have values to avoid database constraint errors
      const filteredUpdates = Object.fromEntries(
        Object.entries(profileUpdates).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      );

      const result = await updateProfile(filteredUpdates);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!avatarFile) {
        // Only show this notification if we didn't already show the avatar update notification
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been successfully updated.',
        });
      }

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update profile.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center mb-6">
        <FiUser className="h-5 w-5 text-slate-400 mr-2" />
        <h3 className="text-lg font-medium text-slate-900">Profile Settings</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar
                key={profile.avatarUrl} // Force re-render when avatar URL changes
                username={profile.username}
                avatarUrl={avatarPreview || profile.avatarUrl}
                size="lg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                <FiCamera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-slate-900">Profile Photo</h4>
              <p className="text-sm text-slate-500 mb-2">
                Click the camera icon to upload a new photo. JPEG, PNG, WebP up to 5MB.
              </p>
              {(avatarPreview || avatarFile) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-sm text-red-600 hover:text-red-700"
                  disabled={isLoading}
                >
                  Remove selected photo
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          {/* Avatar Error */}
          {avatarError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{avatarError}</p>
            </div>
          )}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your username"
          />
          <p className="text-xs text-slate-500 mt-1">
            Your username is how others will find and identify you.
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell others about yourself and your trading experience..."
          />
          <p className="text-xs text-slate-500 mt-1">
            {formData.bio.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="-ml-1 mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
