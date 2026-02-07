import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from './SignatureCanvas';

function SignPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [token]);

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/document/${token}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      const data = await res.json();
      setDocument(data);
    } catch (err) {
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!signature) {
      alert('Please provide a signature');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData: signature })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }

      alert('Document signed successfully!');
      navigate('/');
    } catch (err) {
      alert('Failed to sign document');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Document</h1>
          <p className="text-gray-600 mb-6">
            Document: <span className="font-medium">{document.originalName}</span>
          </p>

          <div className="mb-6">
            <SignatureCanvas onSignatureChange={setSignature} />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={!signature || submitting}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Signing...' : 'Sign Document'}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By signing, you agree that this signature is legally binding.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignPage;
