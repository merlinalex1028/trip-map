import type {
  AuthBootstrapResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@trip-map/contracts'

import { apiFetchJson } from './client'

export async function fetchAuthBootstrap(): Promise<AuthBootstrapResponse> {
  return apiFetchJson<AuthBootstrapResponse>('/auth/bootstrap', {
    method: 'GET',
  })
}

export async function registerWithPassword(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  return apiFetchJson<RegisterResponse>('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
}

export async function loginWithPassword(request: LoginRequest): Promise<LoginResponse> {
  return apiFetchJson<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
}

export async function logoutCurrentSession(): Promise<void> {
  return apiFetchJson<void>(
    '/auth/logout',
    {
      method: 'POST',
    },
    {
      responseType: 'none',
    },
  )
}
