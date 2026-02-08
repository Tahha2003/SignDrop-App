import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import PDFUploader from './PDFUploader';
import DocumentList from './DocumentList';

function LawyerDashboard({ onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [showUploader, setShowUploader] = useState(false);

  const fetchDocuments = async () => {
    const token = localStorage.getItem('authToken');
    const res = await fetch('/api/documents', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    setDocuments(data);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SignDrop</h1>
            <p className="text-gray-600">Digital Signature Collection</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {showUploader ? 'Hide Uploader' : 'Upload New PDF'}
          </button>
        </div>

        {showUploader && (
          <div className="mb-8">
            <PDFUploader onUploadComplete={fetchDocuments} />
          </div>
        )}

        <DocumentList documents={documents} onRefresh={fetchDocuments} />
      </main>
    </div>
  );
}

export default LawyerDashboard;
