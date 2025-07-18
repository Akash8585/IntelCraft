import { useCustomAuthStore } from '../stores/customAuth';
import { API_BASE_URL } from './constants';

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const { accessToken } = useCustomAuthStore.getState();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid, clear auth
    useCustomAuthStore.getState().clearAuth();
    throw new Error('Authentication required');
  }

  return response;
};

export const researchCompany = async (researchData: {
  company: string;
  company_url?: string;
  industry?: string;
  hq_location?: string;
  help_description?: string;
}) => {
  // For the simplified backend, we don't need authentication
  const response = await fetch(`${API_BASE_URL}/research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(researchData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Research request failed');
  }

  return response.json();
};

export const getResearchStatus = async (jobId: string) => {
  const response = await fetch(`${API_BASE_URL}/research/${jobId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get research status');
  }

  return response.json();
}; 