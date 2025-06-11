'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useJournalEntries, useActivityLogs } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import ImageUpload from '@/components/ImageUpload';
import AttachmentSelector from '@/components/journal/AttachmentSelector';
import { FiSave, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

export default function NewJournalEntry() {
  const router = useRouter();
  const { user } = useAuth();
  const { createEntry } = useJournalEntries(user?.id);
  const { logActivity } = useActivityLogs(user?.id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedTradeIds, setSelectedTradeIds] = useState<string[]>([]);
  const [selectedStrategyIds, setSelectedStrategyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a journal entry');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);

    // Process tags
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      // Create the journal entry using the hook
      const { error } = await createEntry({
        title,
        content,
        is_private: isPrivate,
        tags: tagArray.length > 0 ? tagArray : null,
        image_url: imageUrl,
        trade_ids: selectedTradeIds.length > 0 ? selectedTradeIds : null,
        strategy_ids: selectedStrategyIds.length > 0 ? selectedStrategyIds : null
      });

      if (error) {
        throw new Error(error);
      }

      // Log activity for streak tracking
      await logActivity('journal', `Created journal entry: ${title}`);

      // Redirect to journal page
      router.push('/journal');
    } catch (err: any) {
      console.error('Error creating journal entry:', err);
      setError(err.message || 'Failed to create journal entry');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Journal Entry</h1>
        <button
          onClick={() => router.push('/journal')}
          className="flex items-center px-3 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700"
        >
          <FiX className="mr-2" />
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
            Content
          </label>
          <div className="flex justify-between items-center mb-1">
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded ${showPreview ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setShowPreview(false)}
            >
              Edit
            </button>
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded ${showPreview ? 'bg-slate-100 text-slate-700' : 'bg-indigo-100 text-indigo-700'}`}
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
          </div>
          {!showPreview ? (
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono"
              required
            />
          ) : (
            <div className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 min-h-[180px] prose max-w-none text-slate-800">
              <ReactMarkdown>{content || 'Nothing to preview.'}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. forex, analysis, psychology"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        {user && (
          <div className="mb-4">
            <ImageUpload
              onImageUpload={setImageUrl}
              currentImage={imageUrl}
              userId={user.id}
              bucket="journal-images"
              label="Journal Image (Optional)"
              description="PNG, JPG up to 5MB"
              maxSizeMB={5}
              disabled={loading}
            />
          </div>
        )}

        <div className="mb-6">
          <AttachmentSelector
            selectedTradeIds={selectedTradeIds}
            selectedStrategyIds={selectedStrategyIds}
            onTradeIdsChange={setSelectedTradeIds}
            onStrategyIdsChange={setSelectedStrategyIds}
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700 font-medium">Make this entry private</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 border border-indigo-700"
          >
            <FiSave className="mr-2" />
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
