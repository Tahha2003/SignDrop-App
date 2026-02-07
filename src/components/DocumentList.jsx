import React from 'react';

function DocumentList({ documents, onRefresh }) {
  const downloadSigned = async (documentId, filename) => {
    window.open(`/api/download/${documentId}`, '_blank');
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
                <td className="px-6 py-4 text-sm text-gray-900">{doc.originalName}</td>
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
                  {doc.status === 'signed' && (
                    <button
                      onClick={() => downloadSigned(doc.id, doc.originalName)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Download
                    </button>
                  )}
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
    </div>
  );
}

export default DocumentList;
