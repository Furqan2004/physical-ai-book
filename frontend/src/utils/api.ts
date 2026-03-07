/**
 * API utilities for frontend-backend communication
 */

// Use environment variable for backend URL in production, fallback to local for development
const API_URL = process.env.DOCUSAURUS_BACKEND_URL || 'http://localhost:8000';

/**
 * Get authentication token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Get user data from localStorage
 */
export const getUser = (): { id: string; name: string; email: string } | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('auth_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

/**
 * Generic fetch wrapper with auth support
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  auth: boolean = false
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  // Prepend /api if not present, but only if it's not an auth or user endpoint
  // which are already prefixed in the backend routers
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Non-streaming fetch for AI responses
 */
export async function apiFetchComplete(
  endpoint: string,
  body: object,
  auth: boolean = false
): Promise<string> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }, auth);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  const data = await response.json();
  return data.response || data.personalized_content || data.translated_content || '';
}
