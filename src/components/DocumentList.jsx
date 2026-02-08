import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import DocumentDetailsModal from './DocumentDetailsModal';

function DocumentList({ documents, onRefresh }) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const downloadSigned = async (documentId, filename) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/download/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        alert('Failed to download document');
        return;
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed-${filename}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Download failed');
    }
  };

  const deleteDocument = async (documentId, filename) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/document/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete document');
        return;
      }

      alert('Document deleted successfully');
      onRefresh();
    } catch (error) {
      alert('Failed to delete document');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Documents</h2>
        <button
          onClick={onRefresh}
          className="text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => setSelectedDocumentId(doc.id)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
                  >
                    {doc.originalName}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    doc.status === 'signed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {doc.signedAt ? new Date(doc.signedAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    {doc.status === 'signed' && (
                      <button
                        onClick={() => downloadSigned(doc.id, doc.originalName)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Download
                      </button>
                    )}
                    <button
                      onClick={() => deleteDocument(doc.id, doc.originalName)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {documents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No documents yet. Upload a PDF to get started.
          </div>
        )}
      </div>

      {selectedDocumentId && (
        <DocumentDetailsModal
          documentId={selectedDocumentId}
          onClose={() => setSelectedDocumentId(null)}
        />
      )}
    </div>
  );
}

export default DocumentList;
