/**
 * API utilities for frontend-backend communication
 */

// Docusaurus doesn't support process.env, use hardcoded URL or window variable
const API_URL = (typeof window !== 'undefined' && (window as any).API_URL) || 'http://localhost:8000';

/**
 * Get authentication token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Get user data from localStorage
 */
export const getUser = (): { id: string; name: string; email: string } | null => {
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

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Non-streaming fetch for AI responses (returns complete response)
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
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  const data = await response.json();
  // Extract content from different response formats
  return data.response || data.personalized_content || data.translated_content || '';
}

/**
 * Stream response handler for SSE (Server-Sent Events) - DEPRECATED
 * Kept for backward compatibility only
 */
export async function apiStream(
  endpoint: string,
  body: object,
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Stream request failed');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    onDone();
    return;
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        break;
      }
      const chunk = decoder.decode(value);
      onChunk(chunk);
    }
  } catch (error) {
    console.error('Stream error:', error);
    throw error;
  }
}
