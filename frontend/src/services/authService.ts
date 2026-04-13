// frontend/src/services/authService.ts
// Service xác thực — gọi API auth endpoints, quản lý token trong localStorage

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const AUTH_PREFIX = '/api/v1/auth'

// ────────────────────────── Types ──────────────────────────
export type UserRole = 'USER' | 'ANALYST' | 'ADMIN' | 'ML_ENGINEER' | 'COMPLIANCE'

export interface AuthUser {
  user_uid: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  is_email_verified: boolean
  created_at: string
  last_login_at: string | null
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: AuthUser
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

// ────────────────────────── Token storage ──────────────────────────
const ACCESS_KEY = 'fd_access_token'
const REFRESH_KEY = 'fd_refresh_token'
const USER_KEY = 'fd_user'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

// ────────────────────────── Helpers ──────────────────────────
async function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${AUTH_PREFIX}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    let message = res.statusText
    try {
      const err = await res.json()
      if (Array.isArray(err.detail)) {
        message = err.detail.map((e: { msg?: string; loc?: string[] }) =>
          `${(e.loc ?? []).join('.')}: ${e.msg ?? 'invalid'}`
        ).join('; ')
      } else {
        message = err.detail ?? err.message ?? message
      }
    } catch { /* bỏ qua parse error */ }
    throw new Error(`[${res.status}] ${message}`)
  }
  return res.json() as Promise<T>
}

// ────────────────────────── API calls ──────────────────────────
export async function register(data: RegisterRequest): Promise<{ message: string; user_uid: string }> {
  return authFetch('/register', { method: 'POST', body: JSON.stringify(data) })
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const resp = await authFetch<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveTokens(resp.access_token, resp.refresh_token)
  saveUser(resp.user)
  return resp
}

export async function logout(): Promise<void> {
  const token = getAccessToken()
  if (token) {
    try {
      await fetch(`${BASE_URL}${AUTH_PREFIX}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch { /* bỏ qua nếu server không phản hồi */ }
  }
  clearAuth()
}

export async function verifyEmail(email: string, token: string): Promise<{ message: string }> {
  return authFetch('/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, token }),
  })
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  return authFetch('/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function refreshAccessToken(): Promise<string | null> {
  const rt = getRefreshToken()
  if (!rt) return null
  try {
    const resp = await authFetch<{ access_token: string; token_type: string }>('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: rt }),
    })
    localStorage.setItem(ACCESS_KEY, resp.access_token)
    return resp.access_token
  } catch {
    clearAuth()
    return null
  }
}

export async function fetchMe(): Promise<AuthUser> {
  const token = getAccessToken()
  if (!token) throw new Error('No access token')
  return authFetch<AuthUser>('/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
