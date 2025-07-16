import React from 'react';
import { BetterAuthProvider as BaseBetterAuthProvider } from 'better-auth-react';

interface BetterAuthProviderProps {
  children: React.ReactNode;
}

export const BetterAuthProvider: React.FC<BetterAuthProviderProps> = ({ children }) => {
  const config = {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    providers: {
      google: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5174/auth/callback/google',
      },
    },
  };

  return (
    <BaseBetterAuthProvider config={config}>
      {children}
    </BaseBetterAuthProvider>
  );
}; 