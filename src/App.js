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
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Fetch privacy scan results on mount (assume user is authenticated)
    fetchPrivacyResults();
  }, []);

const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
const fetchPrivacyResults = async () => {
  if (!token) return;  // Skip if not logged in
  try {
    const response = await fetch(`${backendUrl}/api/privacy`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch privacy results');
    const data = await response.json();
    setPrivacyResults(data);
  } catch (err) {
    setError(err.message);
  }
};

const handleLogin = async (email, password) => {
  try {
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    setToken(data.access_token);
    fetchPrivacyResults();
  } catch (err) {
    setError(err.message);
  }
};

const handleUpload = async (file) => {
  if (!token) {
    setError('Please login first');
    return;
  }
  setLoading(true);
  setError(null);
  setScanResults(null);
  setSelectedMatches([]);

  const formData = new FormData();
  formData.append('file', file);  // Changed from 'image' to 'file'

  try {
    const response = await fetch(`${backendUrl}/api/scan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`  // Use real token
      },
      body: formData,
    });
    if (!response.ok) throw new Error(`Scan failed: ${response.statusText}`);
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
        listing_url: match.page_url || match.image_url,
        evidence: `Image match confidence: ${match.confidence}`,
        copyright_proof: 'User-uploaded original product image',
        user_contact: { name: 'User Name', email: 'user@example.com', address: 'User Address' },
        statement_good_faith: 'I believe in good faith that the use of the material is not authorized.',
        statement_accuracy: 'Under penalty of perjury, the information is accurate.',
        signature: 'User Name'
      };
      const response = await fetch(`${backendUrl}/api/takedown`, {
        method: 'POST',
        headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
},
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
  {!token ? (
    <div className="w-full max-w-md bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login to AuthentiSell</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin(email, password);
        }}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  ) : (
    <>
      <header className="text-3xl font-bold mb-6">AuthentiSell Dashboard</header>
      <p className="text-center mb-8 max-w-md">
        AuthentiSell: Easily protect your intellectual property by scanning for theft, monitoring privacy alerts, and requesting takedowns.
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
    </>
  )}
</div>
  );
}

export default App;