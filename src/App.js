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
    fetchPrivacyResults();
  }, [token]); // Run when token changes

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  const fetchPrivacyResults = async () => {
    if (!token) return;
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
      console.error('Privacy fetch error:', err.message);
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
      localStorage.setItem('token', data.access_token); // Persist token
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err.message);
    }
  };

  const handleUpload = async (formData, token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Scan failed: ${errorData.detail || response.statusText}`);
      }
      const data = await response.json();
      setScanResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTakedown = async () => {
    if (selectedMatches.length === 0) {
      setError('Please select at least one match to takedown.');
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
      setError(null);
      alert('Takedown requests submitted successfully!');
      setSelectedMatches([]);
    } catch (err) {
      setError(err.message);
      console.error('Takedown error:', err.message);
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
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}
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
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      ) : (
        <>
          <header className="text-3xl font-bold mb-6">AuthentiSell Dashboard</header>
          <p className="text-center mb-8 max-w-md">
            AuthentiSell: Easily protect your intellectual property by scanning for theft, monitoring privacy alerts, and requesting takedowns.
          </p>
          {loading && (
            <div className="text-center mb-4">
              <p>Loading...</p>
              <div className="spinner" style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          )}
          {error && (
            <p className="text-red-500 text-center mb-4 bg-red-100 p-2 rounded">{error}</p>
          )}
          <UploadForm onUpload={handleUpload} loading={loading} />
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