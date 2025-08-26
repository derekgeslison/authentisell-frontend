// src/components/PrivacyScan.js
import React from 'react';

const PrivacyScan = ({ results }) => {
  if (!results) return <p>Loading privacy scan...</p>;

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Data Privacy Alerts</h2>
      {results.alerts && results.alerts.length > 0 ? (
        <ul className="space-y-2">
          {results.alerts.map((alert, index) => (
            <li key={index} className="text-red-500">
              {alert} (e.g., Email found in breach)
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-green-500">No privacy issues detected!</p>
      )}
      <button
        onClick={() => window.location.reload()} // Refresh to re-scan
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Re-Scan Privacy
      </button>
    </div>
  );
};

export default PrivacyScan;