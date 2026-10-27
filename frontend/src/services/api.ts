import type { ApiError } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_URL?.trim() || '/api'

// The hosted API sleeps when idle and takes a few seconds to wake up, so
// reads retry network failures before giving up (about 30s in total).
const NETWORK_RETRY_DELAYS_MS = [2000, 4000, 8000, 16000]
const serverUnavailableError: ApiError = {
  statusCode: 0,
  message:
    'Não foi possível conectar ao servidor. Ele pode levar alguns segundos para iniciar; tente novamente.',
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchWithRetry(url: string, init: RequestInit, retry: boolean) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, init)
    } catch {
      if (!retry || attempt >= NETWORK_RETRY_DELAYS_MS.length) {
        throw serverUnavailableError
      }

      await wait(NETWORK_RETRY_DELAYS_MS[attempt])
    }
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('prooflab_token')
  const isRead = !options.method || options.method === 'GET'

  const res = await fetchWithRetry(
    `${BASE_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    },
    isRead,
  )

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('prooflab_token')
      window.dispatchEvent(new Event('prooflab:auth-expired'))
    }

    const error = (await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }))) as ApiError

    throw error
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
}
