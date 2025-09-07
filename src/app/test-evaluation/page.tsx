'use client';

import { useState } from 'react';

export default function TestEvaluationPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runEvaluation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/evaluation', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to run evaluation');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Evaluation</h1>
        <p className="text-gray-600">Trigger a manual evaluation to test the system</p>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <button
            onClick={runEvaluation}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running Evaluation...' : 'Run Evaluation'}
          </button>

          <a
            href="/report-drafts"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            View Report Drafts
          </a>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Evaluation Completed!</h3>
              <p className="text-green-700">Evaluation ID: {result.evaluationId}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2">Metrics</h4>
                <pre className="text-sm text-blue-800">
                  {JSON.stringify(result.metrics, null, 2)}
                </pre>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold mb-2">Suggestions</h4>
                <pre className="text-sm text-purple-800">
                  {JSON.stringify(result.suggestions, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
