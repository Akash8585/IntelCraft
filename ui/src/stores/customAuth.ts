import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  signInWithGoogle: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  handleCallback: (accessToken: string, sessionToken: string) => void;
  signOut: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, sessionToken: string) => void;
  clearAuth: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

import { API_BASE_URL } from '../utils/constants';

export const useCustomAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      sessionToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          // Get the auth URL from the backend
          const response = await fetch(`${API_BASE_URL}/api/auth/google/authorize`);
          
          if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Google OAuth URL received:', data.auth_url);
          
          // Redirect to Google OAuth
          window.location.href = data.auth_url;
        } catch (error) {
          console.error('Google sign-in error:', error);
          set({ isLoading: false, error: 'Google sign-in failed' });
        }
      },

      loginWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
          }

          const data = await response.json();
          set({
            user: data.user,
            accessToken: data.access_token,
            sessionToken: data.session_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      registerWithEmail: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Registration failed');
          }

          const data = await response.json();
          set({
            user: data.user,
            accessToken: data.access_token,
            sessionToken: data.session_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      handleCallback: (accessToken: string, sessionToken: string) => {
        set({
          accessToken,
          sessionToken,
          isLoading: true,
          error: null,
        });
        
        // Fetch real user info from backend
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Failed to fetch user info');
          }
        })
        .then(user => {
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false 
          });
        })
        .catch(error => {
          console.error('Failed to fetch user info:', error);
          set({ 
            isLoading: false,
            error: 'Failed to authenticate user. Please try again.'
          });
          // Clear invalid tokens
          get().clearAuth();
        });
      },

      signOut: async () => {
        const { sessionToken } = get();
        if (sessionToken) {
          try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ session_token: sessionToken }),
            });
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        get().clearAuth();
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (accessToken: string, sessionToken: string) => {
        set({ accessToken, sessionToken, isAuthenticated: true });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          sessionToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initializeAuth: async () => {
        const { accessToken, user, isAuthenticated } = get();
        
        // If we have tokens but no user, try to fetch user info
        if (accessToken && !user) {
          set({ isLoading: true });
          
          try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const userData = await response.json();
              set({ 
                user: userData,
                isAuthenticated: true,
                isLoading: false 
              });
            } else {
              get().clearAuth();
            }
          } catch (error) {
            console.error('Auth initialization error:', error);
            get().clearAuth();
          }
        } else if (accessToken && user && !isAuthenticated) {
          // We have both tokens and user but isAuthenticated is false, fix this
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        sessionToken: state.sessionToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// API client with authentication
export const apiClient = {
  get: async (url: string) => {
    const { accessToken } = useCustomAuthStore.getState();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response;
  },

  post: async (url: string, data: any) => {
    const { accessToken } = useCustomAuthStore.getState();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  },
}; 