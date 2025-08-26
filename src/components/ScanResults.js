// src/components/ScanResults.js
import React from 'react';

const ScanResults = ({ results, selectedMatches, toggleSelection, onTakedown, loading }) => {
  if (!results.matches || results.matches.length === 0) {
    return <p className="mt-4 text-green-500">No potential thefts found!</p>;
  }

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl mb-8">
      <h2 className="text-2xl font-bold mb-4">Scan Results</h2>
      <ul className="space-y-4">
        {results.matches.map((match, index) => (
          <li key={index} className="flex items-center border-b pb-2">
            <input
              type="checkbox"
              checked={selectedMatches.includes(match)}
              onChange={() => toggleSelection(match)}
              className="mr-2"
            />
            <img src={match.image_url} alt="Match" className="w-16 h-16 object-cover mr-4" />
            <div>
              <p><strong>Platform:</strong> {match.platform}</p>
              <p><strong>Confidence:</strong> {(match.confidence * 100).toFixed(0)}%</p>
              <a href={match.page_url || match.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Listing</a>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={onTakedown}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
        disabled={loading || selectedMatches.length === 0}
      >
        {loading ? 'Submitting...' : 'Initiate Takedown'}
      </button>
    </div>
  );
};

export default ScanResults;