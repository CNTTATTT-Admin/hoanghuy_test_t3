// frontend/src/services/apiClient.ts
// Lớp API client dùng chung — wrapper trên browser fetch native
// Tự động gắn Bearer token nếu có, tự động refresh khi 401

import { getAccessToken, refreshAccessToken, clearAuth } from './authService'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000' // URL cơ sở cho API, lấy từ biến môi trường hoặc mặc định localhost

/**
 * Gọi API chung, tự động set header JSON, gắn Bearer token và xử lý lỗi
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> { // Hàm gọi API chung, trả về dữ liệu đã parse với kiểu T do caller chỉ định
  const url = `${BASE_URL}${path}`

  // Tự động gắn Bearer token nếu có trong localStorage
  const token = getAccessToken()
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  let res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...options?.headers },
    ...options,
  })

  // Nếu 401 — thử refresh token 1 lần rồi gọi lại
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}`, ...options?.headers },
        ...options,
      })
    } else {
      clearAuth()
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!res.ok) { // Nếu không ok, xử lý lỗi HTTP
    let message = res.statusText
    try {
      const err = await res.json()
      // Pydantic 422 trả detail là mảng, 4xx/5xx thường là string
      if (Array.isArray(err.detail)) {
        message = err.detail.map((e: { msg?: string; loc?: string[] }) =>
          `${(e.loc ?? []).join('.')}: ${e.msg ?? 'invalid'}`
        ).join('; ')
      } else {
        message = err.detail ?? err.message ?? message
      }
    } catch {
      /* bỏ qua parse error */
    }
    throw new Error(`[${res.status}] ${message}`)
  }
  return res.json() as Promise<T> // Trả về dữ liệu đã parse từ JSON, với kiểu T do caller chỉ định
}

/** GET request */
export const apiGet = <T>(path: string) => apiFetch<T>(path) // Hàm gọi API với method GET, chỉ cần cung cấp path, trả về dữ liệu đã parse với kiểu T do caller chỉ định,
// path là đường dẫn sau BASE_URL, ví dụ '/api/v1/stats', sẽ trả về dữ liệu đã parse với kiểu T do caller chỉ định

/** POST request với body JSON */
export const apiPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) })

/** PUT request với body JSON */
export const apiPut = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) })
