'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJournalEntries, useActivityLogs } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiSave, FiX } from 'react-icons/fi';

export default function EditJournalEntry({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { entries, updateEntry } = useJournalEntries(user?.id);
  const { logActivity } = useActivityLogs(user?.id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Only check for entry if entries have been loaded
    if (entries.length === 0) return;

    // Find the entry with the matching ID
    const entry = entries.find(e => e.id === params.id);

    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setIsPrivate(entry.is_private);
      setTags(entry.tags ? entry.tags.join(', ') : '');
      setNotFound(false);
    } else if (entries.length > 0) {
      // Only set not found if entries have loaded but entry not found
      setNotFound(true);
    }
  }, [entries, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to edit a journal entry');
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
      // Update the journal entry using the hook
      const { error } = await updateEntry(params.id, {
        title,
        content,
        is_private: isPrivate,
        tags: tagArray.length > 0 ? tagArray : null
      });

      if (error) {
        throw new Error(error);
      }

      // Log activity for streak tracking
      await logActivity('journal', `Updated journal entry: ${title}`);

      // Redirect to journal page
      router.push('/journal');
    } catch (err: any) {
      console.error('Error updating journal entry:', err);
      setError(err.message || 'Failed to update journal entry');
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <AppLayout>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Entry Not Found</h1>
          <p className="text-gray-600 mb-4">The journal entry you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => router.push('/journal')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Journal
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Journal Entry</h1>
        <button
          onClick={() => router.push('/journal')}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <FiX className="mr-2" />
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. forex, analysis, psychology"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Make this entry private</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
