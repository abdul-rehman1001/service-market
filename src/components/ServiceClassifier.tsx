'use client';

import { useState } from 'react';

export default function ServiceClassifier() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleClassify = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Service Classifier</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., pipe is leaking"
          className="flex-1 border rounded px-4 py-2"
        />
        <button
          onClick={handleClassify}
          disabled={loading || !query}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Classifying...' : 'Classify'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Result:</h2>
          <div className="space-y-1">
            <p><strong>Category:</strong> {result.categoryName || result.category}</p>
            <p><strong>Category ID:</strong> {result.categoryId || 'N/A'}</p>
            <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
          </div>
          
          <h3 className="font-semibold mt-4 mb-2">Top Matches:</h3>
          {result.allMatches?.map((match: any, i: number) => (
            <div key={i} className="text-sm border-b py-1">
              {match.categoryName || match.category}: {(match.similarity * 100).toFixed(1)}%
              {match.categoryId && <span className="text-gray-500 ml-2">(DB: {match.categoryId})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}