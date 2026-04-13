// frontend/src/contexts/AuthContext.tsx
// React Context quản lý trạng thái xác thực toàn app

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  type AuthUser,
  type UserRole,
  login as apiLogin,
  logout as apiLogout,
  getStoredUser,
  getAccessToken,
  fetchMe,
  clearAuth,
} from '../services/authService'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  /** Đăng nhập — lưu token + user vào state */
  login: (email: string, password: string) => Promise<void>
  /** Đăng xuất — xoá token + chuyển về /login */
  logout: () => Promise<void>
  /** Kiểm tra quyền — user có nằm trong danh sách role cho phép */
  hasRole: (...roles: UserRole[]) => boolean
  /** Reload thông tin user từ server */
  reloadUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [loading, setLoading] = useState(true)

  // Khởi tạo — kiểm tra token còn hợp lệ không
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .then(u => setUser(u))
      .catch(() => {
        clearAuth()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const resp = await apiLogin(email, password)
    setUser(resp.user)
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user],
  )

  const reloadUser = useCallback(async () => {
    try {
      const u = await fetchMe()
      setUser(u)
    } catch {
      clearAuth()
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, reloadUser }}>
      {children}
    </AuthContext.Provider>
  )
}
