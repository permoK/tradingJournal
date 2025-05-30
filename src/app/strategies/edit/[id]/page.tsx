'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useStrategies, useActivityLogs } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import ImageUpload from '@/components/ImageUpload';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { Database } from '@/types/database.types';

type Strategy = Database['public']['Tables']['strategies']['Row'];

export default function EditStrategy() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { updateStrategy } = useStrategies(user?.id);
  const { logActivity } = useActivityLogs(user?.id);

  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    const fetchStrategy = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/strategies/${params.id}`);
        if (!response.ok) {
          throw new Error('Strategy not found');
        }
        const data = await response.json();
        setStrategy(data);

        // Populate form fields
        setName(data.name || '');
        setDescription(data.description || '');
        setDetails(data.details || '');
        setCategory(data.category || '');
        setImageUrl(data.image_url || '');
        setIsActive(data.is_active);
        setIsPrivate(data.is_private ?? true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !strategy) {
      setError('You must be logged in to edit a strategy');
      return;
    }

    if (!name.trim()) {
      setError('Strategy name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await updateStrategy(strategy.id, {
        name: name.trim(),
        description: description.trim() || null,
        details: details.trim() || null,
        category: category.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        is_private: isPrivate,
      });

      if (updateError) {
        throw new Error(updateError);
      }

      // Log activity for streak tracking
      await logActivity('strategies', `Updated strategy: ${name}`);

      // Redirect to strategy detail page
      router.push(`/strategies/${strategy.id}`);
    } catch (err: any) {
      console.error('Error updating strategy:', err);
      setError(err.message || 'Failed to update strategy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-slate-700 font-medium">Loading strategy...</div>
        </div>
      </AppLayout>
    );
  }

  if (error && !strategy) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Strategy Not Found</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Link
            href="/strategies"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Strategies
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href={`/strategies/${strategy?.id}`}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Edit Strategy</h1>
        </div>
        <p className="text-slate-700 font-medium text-sm sm:text-base ml-11">
          Update your trading strategy details and settings
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
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/strategies/${strategy?.id}`}
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
