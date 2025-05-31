'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';

export default function SetupUsername() {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if user is not authenticated or already has username
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    // Check if user already has a username set
    if (user) {
      const checkExistingUsername = async () => {
        try {
          const response = await fetch('/api/auth/check-username', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: 'dummy_check_for_existing' }),
          });

          // Get user profile to check if username already exists
          const { createClient } = await import('@/lib/supabase');
          const supabase = createClient();

          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

          if (profile?.username) {
            // User already has username, redirect to dashboard
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking existing username:', error);
        }
      };

      checkExistingUsername();
    }
  }, [user, loading, router]);

  // Validate username format
  const validateUsername = (value: string) => {
    if (!value) {
      setValidationError(null);
      return false;
    }

    if (value.length < 3) {
      setValidationError('Username must be at least 3 characters long');
      return false;
    }

    if (value.length > 20) {
      setValidationError('Username must be no more than 20 characters long');
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(value)) {
      setValidationError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    setValidationError(null);
    return true;
  };

  // Check username availability with debouncing
  useEffect(() => {
    if (!username || !validateUsername(username)) {
      setIsAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to check username availability');
          setIsAvailable(null);
        } else {
          setIsAvailable(data.available);
        }
      } catch (err) {
        setError('Failed to check username availability');
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !validateUsername(username) || !isAvailable) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/set-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to set username');
      } else {
        // Success! Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Failed to set username');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose your username
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Pick a unique username to complete your account setup
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1 relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your username"
                disabled={isSubmitting}
              />

              {/* Status indicator */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isChecking && (
                  <FiLoader className="h-5 w-5 text-gray-400 animate-spin" />
                )}
                {!isChecking && isAvailable === true && (
                  <FiCheck className="h-5 w-5 text-green-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <FiX className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Validation and availability messages */}
            {validationError && (
              <p className="mt-1 text-sm text-red-600">{validationError}</p>
            )}
            {!validationError && isAvailable === true && (
              <p className="mt-1 text-sm text-green-600">Username is available!</p>
            )}
            {!validationError && isAvailable === false && (
              <p className="mt-1 text-sm text-red-600">Username is already taken</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !username || !isAvailable || !!validationError}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Setting up...' : 'Continue to Dashboard'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Username must be 3-20 characters long and contain only letters, numbers, and underscores
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
