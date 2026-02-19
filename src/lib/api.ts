const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: response.statusText,
      status: response.status,
    }
    try {
      const data = await response.json()
      error.message = data.message ?? data.error ?? response.statusText
      error.code = data.code
    } catch {
      // Use default error message
    }
    throw error
  }

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }
  return response.text() as Promise<T>
}

const AUTH_TOKEN_KEY = 'auth_token'

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export const api = {
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'GET',
      headers: { ...getAuthHeaders(), ...options?.headers },
    })
    return handleResponse<T>(response)
  },

  async post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'POST',
      headers: { ...getAuthHeaders(), ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  async put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'PUT',
      headers: { ...getAuthHeaders(), ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  async patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'PATCH',
      headers: { ...getAuthHeaders(), ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'DELETE',
      headers: { ...getAuthHeaders(), ...options?.headers },
    })
    return handleResponse<T>(response)
  },
}
