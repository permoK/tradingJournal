'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { FiUser, FiLock, FiSave, FiCamera, FiCheck, FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

export default function Settings() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Check username availability
  const checkUsernameAvailability = async (newUsername: string) => {
    if (!newUsername || newUsername === profile?.username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', newUsername)
        .single();

      setUsernameAvailable(!data);
    } catch (error) {
      setUsernameAvailable(true); // Assume available if error (likely no match)
    } finally {
      setCheckingUsername(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, profile?.username]);

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    if (!user) return null;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file:', { fileName, filePath, fileSize: file.size, fileType: file.type });

      // First, check if the bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets);

      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw new Error('Storage not available');
      }

      const avatarsBucket = buckets?.find(bucket => bucket.id === 'avatars');
      if (!avatarsBucket) {
        throw new Error('Storage bucket not set up yet. Please create the "avatars" bucket in your Supabase Dashboard under Storage section.');
      }

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing files
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      let errorMessage = 'Failed to upload avatar';

      if (error.message?.includes('bucket')) {
        errorMessage = 'Storage bucket not found. Please contact support.';
      } else if (error.message?.includes('policy')) {
        errorMessage = 'Permission denied. Please check storage permissions.';
      } else if (error.message?.includes('size')) {
        errorMessage = 'File too large. Maximum size is 5MB.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({ type: 'error', text: errorMessage });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any previous messages
    setMessage(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    const url = await uploadAvatar(file);
    if (url) {
      setAvatarUrl(url);
      setMessage({ type: 'success', text: 'Avatar uploaded successfully' });
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate username
    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Username is required' });
      return;
    }

    if (usernameAvailable === false) {
      setMessage({ type: 'error', text: 'Username is already taken' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          full_name: fullName.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setMessage({ type: 'error', text: 'Username is already taken' });
        } else {
          console.error('Error updating profile:', error);
          setMessage({ type: 'error', text: 'Failed to update profile' });
        }
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }

    setLoading(false);
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate password fields
    if (!currentPassword.trim()) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    if (!newPassword.trim()) {
      setMessage({ type: 'error', text: 'New password is required' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword === currentPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // First verify the current password using our API route
      const verifyResponse = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword }),
      });

      if (!verifyResponse.ok) {
        const { error } = await verifyResponse.json();
        setMessage({ type: 'error', text: error || 'Current password is incorrect' });
        setLoading(false);
        return;
      }

      // If verification successful, update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error updating password:', error);
        setMessage({ type: 'error', text: error.message || 'Failed to update password' });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    }

    setLoading(false);
  };

  const deleteAccount = async () => {
    if (!user || !deletePassword.trim()) {
      setMessage({ type: 'error', text: 'Password is required to delete account' });
      return;
    }

    setDeletingAccount(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!response.ok && response.status >= 500) {
        throw new Error('Server error occurred');
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('Delete account error:', data);

        // Handle partial success case
        if (data.partialSuccess) {
          setMessage({
            type: 'error',
            text: data.error || 'Account data deleted but auth user deletion failed. Please contact support.'
          });
          setDeletingAccount(false);
          setDeletePassword('');
          setShowDeleteDialog(false);
          return;
        }

        setMessage({ type: 'error', text: data.error || 'Failed to delete account' });
        setDeletingAccount(false);
        return;
      }

      // Account deleted successfully - redirect to home page
      setMessage({ type: 'success', text: 'Account deleted successfully. Redirecting...' });

      // Clear the form
      setDeletePassword('');
      setShowDeleteDialog(false);

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
      setDeletingAccount(false);
    }
  };

  const isLoading = authLoading || profileLoading || loading;

  if (authLoading || profileLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-700 font-medium">
          Manage your account and preferences
        </p>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-900">
            <FiUser className="mr-2 text-indigo-600" />
            Profile Settings
          </h2>

          <form onSubmit={updateProfile}>
            {/* Avatar Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <FiCamera className="mr-2" />
                    {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                  </button>
                  <p className="mt-1 text-xs text-slate-600">
                    JPG, PNG up to 5MB (Storage setup required)
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100 text-slate-600"
              />
              <p className="mt-1 text-xs text-slate-600">Email cannot be changed</p>
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 text-slate-800 ${
                    usernameAvailable === false
                      ? 'border-red-300 focus:ring-red-500'
                      : usernameAvailable === true
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {checkingUsername ? (
                    <div className="w-4 h-4 border-2 border-slate-400 rounded-full border-t-transparent animate-spin"></div>
                  ) : usernameAvailable === false ? (
                    <FiX className="w-4 h-4 text-red-500" />
                  ) : usernameAvailable === true ? (
                    <FiCheck className="w-4 h-4 text-green-500" />
                  ) : null}
                </div>
              </div>
              {usernameAvailable === false && (
                <p className="mt-1 text-xs text-red-600">Username is already taken</p>
              )}
              {usernameAvailable === true && (
                <p className="mt-1 text-xs text-green-600">Username is available</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading || usernameAvailable === false || checkingUsername}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 border border-indigo-700"
            >
              <FiSave className="mr-2" />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-900">
            <FiLock className="mr-2 text-indigo-600" />
            Change Password
          </h2>

          <form onSubmit={updatePassword}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                required
                minLength={6}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 border border-indigo-700"
            >
              <FiSave className="mr-2" />
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-red-50 border border-red-200 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-red-800">
          <FiAlertTriangle className="mr-2 text-red-600" />
          Danger Zone
        </h2>
        <p className="text-red-700 mb-4">
          Once you delete your account, there is no going back. This action cannot be undone.
          All your data including journal entries, trades, and progress will be permanently deleted.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading || deletingAccount}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 border border-red-700"
        >
          <FiTrash2 className="mr-2" />
          Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <FiAlertTriangle className="mr-2 text-red-600" />
              Confirm Account Deletion
            </h3>

            <div className="mb-4">
              <p className="text-gray-700 mb-4">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <p className="text-gray-700 mb-4 font-medium">
                Please enter your password to confirm:
              </p>

              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800"
                disabled={deletingAccount}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword('');
                  setMessage(null);
                }}
                disabled={deletingAccount}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deletingAccount || !deletePassword.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deletingAccount ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
