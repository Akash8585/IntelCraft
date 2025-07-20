import React, { useEffect } from 'react';
import { useCustomAuthStore } from '../../stores/customAuth';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthCallback: React.FC = () => {
  const { handleCallback, isAuthenticated, isLoading, error } = useCustomAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const sessionToken = urlParams.get('session_token');

    if (accessToken && sessionToken) {
      // Store the tokens
      handleCallback(accessToken, sessionToken);
    } else {
      // No tokens, redirect to login
      navigate('/auth');
    }
  }, [handleCallback, navigate]);

  // Watch for authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Authentication is complete, redirect to dashboard
      navigate('/dashboard');
    } else if (error && !isLoading) {
      // Authentication failed, redirect to login
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we complete your authentication...</p>
      </div>
    </div>
  );
}; 