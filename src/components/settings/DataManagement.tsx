'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { FiDownload, FiUpload, FiFileText, FiLoader, FiCheck, FiX } from 'react-icons/fi';

export default function DataManagement() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any>(null);

  const handleExport = async () => {
    if (!user?.id) return;

    setIsExporting(true);
    try {
      const response = await fetch('/api/settings/export-data', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tradeflow-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addNotification({
        type: 'success',
        title: 'Data Exported',
        message: 'Your trading data has been successfully exported.',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export data.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      addNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please select a JSON file.',
      });
      return;
    }

    setImportFile(file);

    // Preview the file content
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setImportPreview(data);
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Invalid File',
          message: 'The selected file is not a valid JSON file.',
        });
        setImportFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importFile || !user?.id) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/settings/import-data', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import data');
      }

      addNotification({
        type: 'success',
        title: 'Data Imported',
        message: `Successfully imported ${result.imported} items.`,
      });

      // Reset state
      setImportFile(null);
      setImportPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: error.message || 'Failed to import data.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const clearImport = () => {
    setImportFile(null);
    setImportPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiDownload className="h-5 w-5 text-slate-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-slate-900">Export Your Data</h3>
              <p className="text-sm text-slate-500">Download a complete backup of your trading data</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Exporting...
              </>
            ) : (
              <>
                <FiDownload className="-ml-1 mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </button>
        </div>
        <div className="text-sm text-slate-600">
          <p>Your export will include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Profile information</li>
            <li>Trading strategies</li>
            <li>Trade history</li>
            <li>Journal entries</li>
            <li>Settings and preferences</li>
          </ul>
        </div>
      </div>

      {/* Import Data */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center mb-4">
          <FiUpload className="h-5 w-5 text-slate-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-slate-900">Import Data</h3>
            <p className="text-sm text-slate-500">Import trading data from a JSON file</p>
          </div>
        </div>

        {!importFile ? (
          <div>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <FiFileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-sm text-slate-600 mb-4">
                Select a JSON file to import your trading data
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiUpload className="-ml-1 mr-2 h-4 w-4" />
                Select File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <p className="font-medium">Supported formats:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>TradeFlow export files (.json)</li>
                <li>MetaTrader 4/5 history files (converted to JSON)</li>
                <li>TradingView export files</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FiFileText className="h-5 w-5 text-slate-600 mr-2" />
                  <span className="text-sm font-medium text-slate-900">{importFile.name}</span>
                </div>
                <button
                  onClick={clearImport}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              {importPreview && (
                <div className="text-sm text-slate-600">
                  <p>Preview:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {importPreview.strategies && (
                      <li>{importPreview.strategies.length} strategies</li>
                    )}
                    {importPreview.trades && (
                      <li>{importPreview.trades.length} trades</li>
                    )}
                    {importPreview.journalEntries && (
                      <li>{importPreview.journalEntries.length} journal entries</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FiCheck className="-ml-1 mr-2 h-4 w-4" />
                    Import Data
                  </>
                )}
              </button>
              <button
                onClick={clearImport}
                className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
