// src/App.js
import React, { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';
import ScanResults from './components/ScanResults';
import PrivacyScan from './components/PrivacyScan';

function App() {
  const [scanResults, setScanResults] = useState(null);
  const [privacyResults, setPrivacyResults] = useState(null);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch privacy scan results on mount (assume user is authenticated)
    fetchPrivacyResults();
  }, []);

  const fetchPrivacyResults = async () => {
    try {
      const response = await fetch('/api/privacy'); // Backend endpoint for privacy monitoring
      if (!response.ok) throw new Error('Failed to fetch privacy results');
      const data = await response.json();
      setPrivacyResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    setScanResults(null);
    setSelectedMatches([]);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/scan', { // Backend endpoint for IP theft detection
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Scan failed');
      const data = await response.json();
      setScanResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTakedown = async () => {
    if (selectedMatches.length === 0) {
      alert('Please select at least one match to takedown.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      for (const match of selectedMatches) {
        const takedownRequest = {
          platform: match.platform,
          listing_url: match.page_url || match.image_url, // Assume page_url from detection JSON
          evidence: `Image match confidence: ${match.confidence}`,
          copyright_proof: 'User-uploaded original product image', // Placeholder; in prod, collect from user
          user_contact: { name: 'User Name', email: 'user@example.com', address: 'User Address' }, // From auth
          statement_good_faith: 'I believe in good faith that the use of the material is not authorized.',
          statement_accuracy: 'Under penalty of perjury, the information is accurate.',
          signature: 'User Name' // Electronic signature
        };

        const response = await fetch('/api/takedown', { // Backend endpoint for takedown
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(takedownRequest),
        });
        if (!response.ok) throw new Error(`Takedown failed for ${match.platform}`);
      }
      alert('Takedown requests submitted successfully!');
      setSelectedMatches([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (match) => {
    setSelectedMatches((prev) =>
      prev.includes(match)
        ? prev.filter((m) => m !== match)
        : [...prev, match]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <header className="text-3xl font-bold mb-6">PrivacyPal Dashboard</header>
      <p className="text-center mb-8 max-w-md">
        Protect your creations easily: Upload images to scan for theft, view privacy alerts, and request takedowns with one click.
      </p>

      <UploadForm onUpload={handleUpload} loading={loading} />

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {scanResults && (
        <ScanResults
          results={scanResults}
          selectedMatches={selectedMatches}
          toggleSelection={toggleSelection}
          onTakedown={handleTakedown}
          loading={loading}
        />
      )}

      <PrivacyScan results={privacyResults} />
    </div>
  );
}

export default App;