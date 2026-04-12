const DEFAULT_API_BASE_URL = '/api'

export function createApiUrl(path: string) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

type ApiClientUnauthorizedCode = 'session-unauthorized' | 'auth-submit-unauthorized'
type ApiClientErrorCode = ApiClientUnauthorizedCode | 'http-error'

interface ApiFetchJsonOptions {
  responseType?: 'json' | 'none'
  unauthorizedCode?: ApiClientUnauthorizedCode
}

export class ApiClientError extends Error {
  readonly status: number
  readonly code: ApiClientErrorCode

  constructor(options: { status: number; code: ApiClientErrorCode; message: string }) {
    super(options.message)
    this.name = 'ApiClientError'
    this.status = options.status
    this.code = options.code
  }
}

export function isUnauthorizedApiClientError(error: unknown): error is ApiClientError {
  return (
    error instanceof ApiClientError
    && (error.code === 'session-unauthorized' || error.code === 'auth-submit-unauthorized')
  )
}

export function isSessionUnauthorizedApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError && error.code === 'session-unauthorized'
}

export async function apiFetchJson<T>(
  path: string,
  init: RequestInit = {},
  options: ApiFetchJsonOptions = {},
): Promise<T> {
  const response = await fetch(createApiUrl(path), {
    ...init,
    credentials: 'include',
  })

  if (response.status === 401) {
    throw new ApiClientError({
      status: response.status,
      code: options.unauthorizedCode ?? 'session-unauthorized',
      message: 'Unauthorized',
    })
  }

  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      code: 'http-error',
      message: `Request failed: ${response.status}`,
    })
  }

  if (options.responseType === 'none' || response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
