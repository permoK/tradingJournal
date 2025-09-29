'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useJournalEntries } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiPlus, FiEye, FiEyeOff, FiEdit2, FiTrash2, FiTrendingUp, FiTarget } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';
import { Editor } from '@tinymce/tinymce-react';

function JournalContent() {
  const { user, loading: authLoading } = useAuth();
  const { entries, loading: entriesLoading, deleteEntry: deleteEntryHook } = useJournalEntries(user?.id);
  const searchParams = useSearchParams();

  const [showPrivate, setShowPrivate] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editorContents, setEditorContents] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Handle search parameter from dashboard
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  const isLoading = authLoading || entriesLoading;

  // Filter entries based on privacy setting and search term
  const filteredEntries = entries.filter(entry => {
    const matchesPrivacy = showPrivate || !entry.is_private;
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.tags && entry.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesPrivacy && matchesSearch;
  });

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    const { error } = await deleteEntryHook(entryId);

    if (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  if (isLoading) {
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trading Journal</h1>
          <p className="text-slate-700 font-medium">
            Record your thoughts, insights, and lessons learned
          </p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 border border-indigo-700"
        >
          <FiPlus className="mr-2" />
          New Entry
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setShowPrivate(!showPrivate)}
              className="flex items-center px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700 font-medium"
            >
              {showPrivate ? (
                <>
                  <FiEyeOff className="mr-2 text-slate-600" />
                  Hide Private
                </>
              ) : (
                <>
                  <FiEye className="mr-2 text-slate-600" />
                  Show Private
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-slate-700 font-medium">No journal entries found</p>
            <Link
              href="/journal/new"
              className="inline-block mt-2 text-indigo-700 font-medium hover:underline"
            >
              Create your first entry
            </Link>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const handleEditorChange = (content: string) => {
              setEditorContents(prev => ({ ...prev, [entry.id]: content }));
            };

            return (
              <div key={entry.id} className="relative group">
                <Link
                  href={`/journal/${entry.id}`}
                  className="absolute inset-0 z-0"
                  aria-label={`View details for ${entry.title}`}
                  tabIndex={-1}
                />
                <div className="bg-white p-6 rounded-lg shadow-sm group-hover:shadow-md transition-shadow border border-slate-200 hover:border-indigo-300 cursor-pointer relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{entry.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {(() => {
                          try {
                            const date = new Date(entry.created_at);
                            return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMMM d, yyyy');
                          } catch {
                            return 'Invalid date';
                          }
                        })()}
                        {entry.is_private && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-800">
                            <FiEyeOff className="mr-1" />
                            Private
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 z-20" onClick={e => e.stopPropagation()}>
                      <Link
                        href={`/journal/edit/${entry.id}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Edit entry"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      <button
                        onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete entry"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {entry.image_url && (
                    <div className="mt-3 mb-3">
                      <img
                        src={entry.image_url}
                        alt="Journal entry image"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}

                  {isEditing ? (
                    <Editor
                      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                      init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                          'advlist autolink lists link image charmap print preview anchor',
                          'searchreplace visualblocks code fullscreen',
                          'insertdatetime media table paste code help wordcount'
                        ],
                        toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
                      }}
                      value={editorContents[entry.id] || entry.content}
                      onEditorChange={(content) => handleEditorChange(content)}
                    />
                  ) : (
                    <div className="prose prose-slate max-w-none text-slate-800">
                      <div 
                        className="text-base leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: entry.content 
                            ? entry.content.replace(/\n/g, '<br>')
                            : 'No content available.' 
                        }} 
                      />
                    </div>
                  )}

                  {/* Attachment indicators */}
                  {((entry.trade_ids && entry.trade_ids.length > 0) || (entry.strategy_ids && entry.strategy_ids.length > 0)) && (
                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                      {entry.trade_ids && entry.trade_ids.length > 0 && (
                        <div className="flex items-center">
                          <FiTrendingUp className="mr-1" size={14} />
                          <span>{entry.trade_ids.length} trade{entry.trade_ids.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {entry.strategy_ids && entry.strategy_ids.length > 0 && (
                        <div className="flex items-center">
                          <FiTarget className="mr-1" size={14} />
                          <span>{entry.strategy_ids.length} strateg{entry.strategy_ids.length !== 1 ? 'ies' : 'y'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {entry.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-block px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/journal/${entry.id}`}
                      className="inline-block text-indigo-700 font-medium hover:underline z-20 relative"
                      onClick={e => e.stopPropagation()}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}

export default function Journal() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    }>
      <JournalContent />
    </Suspense>
  );
}
