// src/components/UploadForm.js
import React, { useState } from 'react';

const UploadForm = ({ onUpload, loading }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) onUpload(file);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md mb-8">
      <label className="block text-lg font-medium mb-2">Upload Your Product Image</label>
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={(e) => setFile(e.target.files[0])}
        className="block w-full mb-4 p-2 border rounded"
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={loading || !file}
      >
        {loading ? 'Scanning...' : 'Scan for Theft'}
      </button>
    </form>
  );
};

export default UploadForm;