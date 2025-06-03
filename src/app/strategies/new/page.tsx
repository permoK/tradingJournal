'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useStrategies, useActivityLogs } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import ImageUpload from '@/components/ImageUpload';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import Link from 'next/link';

export default function NewStrategy() {
  const router = useRouter();
  const { user } = useAuth();
  const { createStrategy } = useStrategies(user?.id);
  const { logActivity } = useActivityLogs(user?.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isPrivate, setIsPrivate] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a strategy');
      return;
    }

    if (!name.trim()) {
      setError('Strategy name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: createError } = await createStrategy({
        name: name.trim(),
        description: description.trim() || null,
        details: details.trim() || null,
        category: category.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        is_private: isPrivate,
        success_rate: 0,
        total_trades: 0,
        profitable_trades: 0
      });

      if (createError) {
        throw new Error(createError);
      }

      // Log activity for streak tracking
      await logActivity('strategies', `Created new strategy: ${name}`);

      // Redirect to strategies page
      router.push('/strategies');
    } catch (err: any) {
      console.error('Error creating strategy:', err);
      setError(err.message || 'Failed to create strategy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/strategies"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Create New Strategy</h1>
        </div>
        <p className="text-slate-700 font-medium text-sm sm:text-base ml-11">
          Define your trading strategy with details, images, and categorization
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiX className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Strategy Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                  placeholder="e.g., Breakout Strategy, Moving Average Crossover"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                  placeholder="e.g., Scalping, Swing Trading, Day Trading"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Short Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                  placeholder="Brief overview of your strategy..."
                />
              </div>

              {/* Strategy Image Upload */}
              {user && (
                <div>
                  <ImageUpload
                    onImageUpload={setImageUrl}
                    currentImage={imageUrl}
                    userId={user.id}
                    bucket="strategy-images"
                    label="Strategy Image (Optional)"
                    description="PNG, JPG up to 5MB"
                    maxSizeMB={5}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Add a chart, diagram, or visual that represents your strategy
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-slate-700">
                    Active Strategy
                  </span>
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Active strategies can be selected when recording trades
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-slate-700">
                    Private Strategy
                  </span>
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Private strategies are only visible to you. Uncheck to share with the community.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-slate-700 mb-2">
                  Detailed Strategy Description
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                  placeholder="Detailed explanation of your strategy including:
- Entry conditions
- Exit conditions
- Risk management rules
- Market conditions
- Timeframes
- Indicators used
- Examples..."
                />
              </div>


            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating...' : 'Create Strategy'}
            </button>
            <Link
              href="/strategies"
              className="flex-1 sm:flex-none px-6 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
