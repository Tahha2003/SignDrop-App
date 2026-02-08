import React, { useState } from 'react';
import { Lock } from 'lucide-react';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid password');
        return;
      }

      localStorage.setItem('authToken', data.token);
      onLogin();
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Lawyer Dashboard
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Enter your password to access the dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Login
          </button>
        </form>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600">
            <strong>Default password:</strong> lawyer123
            <br />
            <span className="text-gray-500">Change this in production!</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
