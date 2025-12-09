'use client';

import { useState } from 'react';

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    total_imported?: number;
    updated_words?: number;
  } | null>(null);

  const handleSync = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('/api/sync-sheets');
      const data = await response.json();

      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Sync Vocabulary from Google Sheets
        </h1>
        <p className="text-gray-600 mb-8">
          Click the button below to manually sync vocabulary from the Google Sheet.
          This process runs automatically every day at 2 AM UTC.
        </p>

        <button
          onClick={handleSync}
          disabled={loading}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-blue-600 hover:scale-105'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Syncing...
            </span>
          ) : (
            'Sync Now'
          )}
        </button>

        {result && (
          <div
            className={`mt-8 p-6 rounded-lg ${
              result.success
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}
          >
            <h2
              className={`text-xl font-bold mb-2 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {result.success ? 'Success!' : 'Error'}
            </h2>
            <p className="text-gray-700 mb-4">{result.message}</p>
            {result.success && result.total_imported !== undefined && (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Total words:</span>{' '}
                  {result.total_imported}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Updated:</span>{' '}
                  {result.updated_words}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Google Sheet Information
          </h2>
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-semibold">Sheet ID:</span>{' '}
              1-61Bfh0at--M8xcrphgNrgnyKTcqbctdjhY1Ib5-kOg
            </p>
            <p>
              <span className="font-semibold">Sheet Name:</span> All
            </p>
            <p>
              <span className="font-semibold">Auto-sync:</span> Daily at 2 AM UTC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
