import React, { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, FileText, Link as LinkIcon, Calendar, CheckCircle, Clock } from 'lucide-react';

function DocumentDetailsModal({ documentId, onClose }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentDetails();
  }, [documentId]);

  const fetchDocumentDetails = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/document/details/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        alert('Failed to load document details');
        onClose();
        return;
      }

      const data = await res.json();
      setDocument(data);
    } catch (error) {
      alert('Failed to load document details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(document.signingLink);
    alert('Signing link copied to clipboard!');
  };

  const openSigningLink = () => {
    window.open(document.signingLink, '_blank');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Document Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Document Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Document Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filename:</span>
                    <span className="font-medium text-gray-900">{document.originalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      document.status === 'signed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {document.status === 'signed' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Signed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(document.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {document.signedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Signed:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(document.signedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(document.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signing Link */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <LinkIcon className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Signing Link</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={document.signingLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-blue-300 rounded text-sm bg-white"
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={openSigningLink}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Position */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Signature Position</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Page:</span>
                <span className="ml-2 font-medium text-gray-900">{document.signaturePosition.page + 1}</span>
              </div>
              <div>
                <span className="text-gray-600">X Position:</span>
                <span className="ml-2 font-medium text-gray-900">{Math.round(document.signaturePosition.x)}px</span>
              </div>
              <div>
                <span className="text-gray-600">Y Position:</span>
                <span className="ml-2 font-medium text-gray-900">{Math.round(document.signaturePosition.y)}px</span>
              </div>
              <div>
                <span className="text-gray-600">Size:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {Math.round(document.signaturePosition.width)} × {Math.round(document.signaturePosition.height)}px
                </span>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          {document.status === 'signed' && document.signedPdfUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Signed Document</h3>
              <div className="flex gap-3">
                <a
                  href={document.signedPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Signed PDF
                </a>
                <a
                  href={document.signedPdfUrl}
                  download={`signed-${document.originalName}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FileText className="w-5 h-5" />
                  Download Signed PDF
                </a>
              </div>
            </div>
          )}

          {document.status === 'pending' && document.originalPdfUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Original Document</h3>
              <div className="flex gap-3">
                <a
                  href={document.originalPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Original PDF
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentDetailsModal;
