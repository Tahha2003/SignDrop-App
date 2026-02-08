import React from 'react';
import { CheckCircle } from 'lucide-react';

function SignSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Document Signed Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          Your signature has been recorded and the document has been signed. 
          The lawyer will receive the signed document.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            You can now close this window. Thank you for using SignDrop.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignSuccess;
