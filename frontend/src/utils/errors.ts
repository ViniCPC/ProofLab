import type { ApiError } from '@/types/api'

export function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>

  if (typeof apiError.message === 'string') {
    return apiError.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
